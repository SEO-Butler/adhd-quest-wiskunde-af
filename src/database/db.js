// Local database utilities using IndexedDB for storing educational content
const DB_NAME = 'ADHD_Quest_DB';
const DB_VERSION = 1;

// Database stores (tables)
const STORES = {
  SUBJECTS: 'subjects',
  CONTENT: 'content', 
  GENERATED_QUESTIONS: 'generated_questions',
  USER_UPLOADS: 'user_uploads'
};

class Database {
  constructor() {
    this.db = null;
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
        
        // Subjects store - organizing content by subject/grade level
        if (!db.objectStoreNames.contains(STORES.SUBJECTS)) {
          const subjectStore = db.createObjectStore(STORES.SUBJECTS, { keyPath: 'id', autoIncrement: true });
          subjectStore.createIndex('name', 'name', { unique: false });
          subjectStore.createIndex('grade', 'grade', { unique: false });
        }
        
        // Content store - uploaded study materials
        if (!db.objectStoreNames.contains(STORES.CONTENT)) {
          const contentStore = db.createObjectStore(STORES.CONTENT, { keyPath: 'id', autoIncrement: true });
          contentStore.createIndex('subjectId', 'subjectId', { unique: false });
          contentStore.createIndex('title', 'title', { unique: false });
          contentStore.createIndex('uploadDate', 'uploadDate', { unique: false });
          contentStore.createIndex('contentType', 'contentType', { unique: false });
        }
        
        // Generated questions from content
        if (!db.objectStoreNames.contains(STORES.GENERATED_QUESTIONS)) {
          const questionStore = db.createObjectStore(STORES.GENERATED_QUESTIONS, { keyPath: 'id', autoIncrement: true });
          questionStore.createIndex('contentId', 'contentId', { unique: false });
          questionStore.createIndex('subjectId', 'subjectId', { unique: false });
          questionStore.createIndex('difficulty', 'difficulty', { unique: false });
          questionStore.createIndex('type', 'type', { unique: false });
        }
        
        // User uploads metadata
        if (!db.objectStoreNames.contains(STORES.USER_UPLOADS)) {
          const uploadStore = db.createObjectStore(STORES.USER_UPLOADS, { keyPath: 'id', autoIncrement: true });
          uploadStore.createIndex('fileName', 'fileName', { unique: false });
          uploadStore.createIndex('uploadDate', 'uploadDate', { unique: false });
          uploadStore.createIndex('status', 'status', { unique: false });
        }
      };
    });
  }

  // Generic database operations
  async add(storeName, data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async get(storeName, id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async update(storeName, data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName, id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getByIndex(storeName, indexName, value) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Subject-specific operations
  async addSubject(subject) {
    const subjectData = {
      name: subject.name,
      description: subject.description || '',
      grade: subject.grade || 'K-12',
      createdAt: Date.now(),
      ...subject
    };
    return this.add(STORES.SUBJECTS, subjectData);
  }

  async getSubjects() {
    return this.getAll(STORES.SUBJECTS);
  }

  async getSubjectsByGrade(grade) {
    return this.getByIndex(STORES.SUBJECTS, 'grade', grade);
  }

  // Content operations
  async addContent(content) {
    const contentData = {
      title: content.title,
      subjectId: content.subjectId,
      contentType: content.type, // 'text', 'pdf', 'image', 'video'
      content: content.content, // actual content or file reference
      metadata: content.metadata || {},
      uploadDate: Date.now(),
      status: 'processing', // 'processing', 'completed', 'failed'
      ...content
    };
    return this.add(STORES.CONTENT, contentData);
  }

  async getContentBySubject(subjectId) {
    return this.getByIndex(STORES.CONTENT, 'subjectId', subjectId);
  }

  async getAllContent() {
    return this.getAll(STORES.CONTENT);
  }

  async updateContentStatus(contentId, status) {
    const content = await this.get(STORES.CONTENT, contentId);
    if (content) {
      content.status = status;
      content.processedAt = Date.now();
      return this.update(STORES.CONTENT, content);
    }
  }

  // Generated questions operations
  async addGeneratedQuestion(question) {
    const questionData = {
      contentId: question.contentId,
      subjectId: question.subjectId,
      type: question.type, // 'mcq', 'short', 'numeric'
      prompt: question.prompt,
      difficulty: question.difficulty || 1,
      options: question.options || null,
      answerIndex: question.answerIndex || null,
      acceptableAnswers: question.acceptableAnswers || null,
      answerNumeric: question.answerNumeric || null,
      tolerance: question.tolerance || 0,
      hint: question.hint || '',
      explanation: question.explanation || '',
      source: question.source || '', // Which part of content this came from
      generatedAt: Date.now(),
      ...question
    };
    return this.add(STORES.GENERATED_QUESTIONS, questionData);
  }

  async getQuestionsByContent(contentId) {
    return this.getByIndex(STORES.GENERATED_QUESTIONS, 'contentId', contentId);
  }

  async getQuestionsBySubject(subjectId) {
    return this.getByIndex(STORES.GENERATED_QUESTIONS, 'subjectId', subjectId);
  }

  async getAllGeneratedQuestions() {
    return this.getAll(STORES.GENERATED_QUESTIONS);
  }

  async getQuestionsByDifficulty(difficulty) {
    return this.getByIndex(STORES.GENERATED_QUESTIONS, 'difficulty', difficulty);
  }

  async updateGeneratedQuestion(questionId, updatedData) {
    const question = await this.get(STORES.GENERATED_QUESTIONS, questionId);
    if (question) {
      const updatedQuestion = { ...question, ...updatedData };
      return this.update(STORES.GENERATED_QUESTIONS, updatedQuestion);
    }
    throw new Error('Question not found');
  }

  // User upload tracking
  async trackUpload(uploadData) {
    const upload = {
      fileName: uploadData.fileName,
      fileSize: uploadData.fileSize,
      fileType: uploadData.fileType,
      uploadDate: Date.now(),
      status: 'uploaded',
      processedQuestions: 0,
      ...uploadData
    };
    return this.add(STORES.USER_UPLOADS, upload);
  }

  async getUploadHistory() {
    return this.getAll(STORES.USER_UPLOADS);
  }

  async updateUploadStatus(uploadId, status, questionsGenerated = 0) {
    const upload = await this.get(STORES.USER_UPLOADS, uploadId);
    if (upload) {
      upload.status = status;
      upload.processedQuestions = questionsGenerated;
      upload.processedAt = Date.now();
      return this.update(STORES.USER_UPLOADS, upload);
    }
  }

  // Utility methods for cleanup and maintenance
  async clearDatabase() {
    const stores = Object.values(STORES);
    for (const storeName of stores) {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      await store.clear();
    }
  }

  async getStorageStats() {
    const stats = {};
    const stores = Object.values(STORES);
    
    for (const storeName of stores) {
      const count = await this.getAll(storeName);
      stats[storeName] = count.length;
    }
    
    return {
      totalStores: stores.length,
      recordCounts: stats,
      databaseSize: await this.estimateSize()
    };
  }

  async estimateSize() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage,
        quota: estimate.quota,
        usedMB: Math.round(estimate.usage / 1024 / 1024 * 100) / 100
      };
    }
    return null;
  }
}

// Create singleton instance
const db = new Database();

// Initialize database on module load
let dbInitPromise = null;

export const initDB = async () => {
  if (!dbInitPromise) {
    dbInitPromise = db.init();
  }
  return dbInitPromise;
};

export const getDB = () => db;

export { STORES };