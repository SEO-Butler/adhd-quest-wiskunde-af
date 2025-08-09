// TTS Audio Caching Service with IndexedDB persistence
const DB_NAME = 'TTSAudioCache';
const DB_VERSION = 1;
const STORE_NAME = 'audioCache';
const CACHE_EXPIRY_DAYS = 30; // Cache audio for 30 days

class TTSCache {
  constructor() {
    this.db = null;
    this.memoryCache = new Map(); // In-memory cache for quick access
    this.initPromise = this.init();
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
          store.createIndex('createdAt', 'createdAt', { unique: false });
          store.createIndex('lang', 'lang', { unique: false });
        }
      };
    });
  }

  // Generate cache key from text and language
  generateCacheKey(text, lang = 'af-ZA', voiceId = null) {
    const content = `${text}|${lang}|${voiceId || 'default'}`;
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `tts_${Math.abs(hash).toString(36)}`;
  }

  // Check if audio is cached
  async isCached(text, lang = 'af-ZA', voiceId = null) {
    const key = this.generateCacheKey(text, lang, voiceId);
    
    // Check memory cache first
    if (this.memoryCache.has(key)) {
      return true;
    }

    // Check IndexedDB
    await this.initPromise;
    return new Promise((resolve) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);
      
      request.onsuccess = () => {
        const result = request.result;
        if (result && this.isValidCache(result)) {
          // Load into memory cache
          this.memoryCache.set(key, result.audioBlob);
          resolve(true);
        } else {
          resolve(false);
        }
      };
      
      request.onerror = () => resolve(false);
    });
  }

  // Get cached audio
  async getCached(text, lang = 'af-ZA', voiceId = null) {
    const key = this.generateCacheKey(text, lang, voiceId);
    
    // Check memory cache first
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key);
    }

    // Check IndexedDB
    await this.initPromise;
    return new Promise((resolve) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);
      
      request.onsuccess = () => {
        const result = request.result;
        if (result && this.isValidCache(result)) {
          // Load into memory cache
          this.memoryCache.set(key, result.audioBlob);
          resolve(result.audioBlob);
        } else {
          resolve(null);
        }
      };
      
      request.onerror = () => resolve(null);
    });
  }

  // Cache audio blob
  async cacheAudio(text, audioBlob, lang = 'af-ZA', voiceId = null) {
    const key = this.generateCacheKey(text, lang, voiceId);
    
    // Store in memory cache
    this.memoryCache.set(key, audioBlob);

    // Store in IndexedDB
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const cacheEntry = {
        key,
        text: text.substring(0, 200), // Store first 200 chars for reference
        lang,
        voiceId,
        audioBlob,
        createdAt: Date.now(),
        expiresAt: Date.now() + (CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
      };
      
      const request = store.put(cacheEntry);
      
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  // Check if cache entry is still valid
  isValidCache(entry) {
    return entry && entry.expiresAt > Date.now();
  }

  // Clean up expired cache entries
  async cleanupExpiredCache() {
    await this.initPromise;
    return new Promise((resolve) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('createdAt');
      const request = index.openCursor();
      
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          if (!this.isValidCache(cursor.value)) {
            cursor.delete();
            // Also remove from memory cache
            this.memoryCache.delete(cursor.value.key);
          }
          cursor.continue();
        } else {
          resolve();
        }
      };
      
      request.onerror = () => resolve();
    });
  }

  // Get cache statistics
  async getCacheStats() {
    await this.initPromise;
    return new Promise((resolve) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      
      request.onsuccess = () => {
        const entries = request.result || [];
        const valid = entries.filter(entry => this.isValidCache(entry));
        const expired = entries.length - valid.length;
        
        const totalSize = entries.reduce((size, entry) => {
          return size + (entry.audioBlob?.size || 0);
        }, 0);
        
        resolve({
          totalEntries: entries.length,
          validEntries: valid.length,
          expiredEntries: expired,
          memoryEntries: this.memoryCache.size,
          totalSizeBytes: totalSize,
          totalSizeMB: Math.round(totalSize / 1024 / 1024 * 100) / 100
        });
      };
      
      request.onerror = () => resolve({
        totalEntries: 0,
        validEntries: 0,
        expiredEntries: 0,
        memoryEntries: this.memoryCache.size,
        totalSizeBytes: 0,
        totalSizeMB: 0
      });
    });
  }

  // Clear all cache
  async clearCache() {
    this.memoryCache.clear();
    
    await this.initPromise;
    return new Promise((resolve) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();
      
      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
    });
  }
}

// Create singleton instance
const ttsCache = new TTSCache();

// Initialize cleanup on startup
ttsCache.initPromise.then(() => {
  ttsCache.cleanupExpiredCache();
}).catch(console.error);

export default ttsCache;