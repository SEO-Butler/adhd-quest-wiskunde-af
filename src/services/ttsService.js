import { LazybirdClient } from './lazybirdClient';
import ttsCache from './ttsCache';
const KEY = import.meta.env.VITE_LAZYBIRD_API_KEY;
let client = null;
try { client = new LazybirdClient({ apiKey: KEY }); } catch {
  // API key not available in development
}

// Audio context for better audio handling
let audioContextPrimed = false;

// Prime audio system to prevent initial cutoff
async function primeAudioSystem() {
  if (audioContextPrimed) return;
  
  try {
    // Create a very short silent audio to prime the system
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const buffer = audioContext.createBuffer(1, 1, 22050);
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start(0);
    
    audioContextPrimed = true;
    console.log('TTS: Audio system primed');
  } catch (error) {
    console.warn('TTS: Audio priming failed:', error);
  }
}

const cache = { voices: null, fetched: 0 };

async function getVoices() {
  if (!client) throw new Error('Lazybird client not available');
  const now = Date.now();
  if (cache.voices && now - cache.fetched < 24*60*60*1000) return cache.voices;
  const raw = await client.listVoices();
  const list = Array.isArray(raw) ? raw : (raw.voices || []);
  cache.voices = list;
  cache.fetched = now;
  return list;
}

function matchVoiceByLang(list, langPref='af-ZA') {
  const pref = (langPref||'').toLowerCase();
  const prefPrefix = pref.split('-')[0];
  
  // First try: exact language match
  let v = list.find(v => (v.language||'').toLowerCase() === pref);
  
  // Second try: check multilingual voices that support the language
  if (!v) {
    v = list.find(v => v.secondaryLocaleList && v.secondaryLocaleList.includes(langPref));
  }
  
  // Third try: language prefix match (af matches af-ZA)
  if (!v) {
    v = list.find(v => (v.language||'').toLowerCase().startsWith(prefPrefix));
  }
  
  // Fourth try: search by displayName for Afrikaans
  if (!v && prefPrefix === 'af') {
    v = list.find(v => /afrikaans/i.test(v.displayName||''));
  }
  
  // Last resort: English fallback
  if (!v) {
    v = list.find(v => (v.language||'').toLowerCase().startsWith('en'));
  }
  
  return v;
}

// Generate audio blob (with caching)
export async function generateAudioBlob(text, lang='af-ZA') {
  if (!text) throw new Error('No text provided');
  
  // Check cache first
  const cachedBlob = await ttsCache.getCached(text, lang);
  if (cachedBlob) {
    console.log('TTS: Using cached audio');
    return cachedBlob;
  }
  
  // Generate new audio
  console.log('TTS: Generating new audio');
  if (!client) throw new Error('Lazybird not configured');
  
  const list = await getVoices();
  let v = lang==='auto' ? (matchVoiceByLang(list, 'af-ZA') || matchVoiceByLang(list, 'en-GB'))
                        : matchVoiceByLang(list, lang);
  if (!v) throw new Error('No suitable voice found');
  const voiceId = v.id || v.voiceId || v.name;
  
  const blob = await client.synthesize({ text, voiceId });
  
  // Cache the audio blob
  await ttsCache.cacheAudio(text, blob, lang, voiceId);
  
  return blob;
}

// Play audio from blob with audio context preparation
export async function playAudioBlob(blob) {
  // Prime audio system first
  await primeAudioSystem();
  
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    
    // Preload and prepare audio
    audio.preload = 'auto';
    audio.volume = 1.0;
    
    let hasPlayed = false;
    
    audio.onended = () => {
      URL.revokeObjectURL(url);
      resolve();
    };
    
    audio.onerror = (error) => {
      URL.revokeObjectURL(url);
      reject(error);
    };
    
    const tryPlay = async () => {
      if (hasPlayed) return;
      hasPlayed = true;
      
      try {
        // Ensure audio system is fully ready with a small delay
        await new Promise(r => setTimeout(r, 100));
        await audio.play();
      } catch (error) {
        reject(error);
      }
    };
    
    audio.oncanplaythrough = tryPlay;
    
    // Fallback - if canplaythrough doesn't fire, try anyway after delay
    setTimeout(() => {
      if (!hasPlayed && audio.readyState >= 2) { // HAVE_CURRENT_DATA or better
        tryPlay();
      }
    }, 300);
    
    // Load the audio
    audio.load();
  });
}

// Legacy function for backward compatibility
export async function speakWithLang(text, lang='af-ZA', options = {}) {
  try {
    const blob = await generateAudioBlob(text, lang);
    await playAudioBlob(blob);
  } catch (error) {
    console.error('TTS generation failed:', error);
    throw error;
  }
}
