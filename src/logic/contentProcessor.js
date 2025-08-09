// Content processing and question generation from uploaded study materials
import { getDB } from '../database/db.js';
import * as pdfjsLib from 'pdfjs-dist';

/**
 * Main content processor that extracts educational content and generates questions
 * This is a simplified version that works locally - in a real app you might use AI services
 */
export class ContentProcessor {
  constructor() {
    this.questionGenerators = {
      text: this.generateQuestionsFromText.bind(this),
      pdf: this.generateQuestionsFromPDF.bind(this),
      image: this.generateQuestionsFromImage.bind(this),
    };
  }

  /**
   * Process uploaded content and generate questions
   * @param {Object} content - The uploaded content object
   * @returns {Promise<Array>} Generated questions
   */
  async processContent(content) {
    try {
      const db = getDB();
      
      // Update status to processing
      await db.updateContentStatus(content.id, 'processing');
      
      let questions = [];
      
      // Route to appropriate processor based on content type
      const generator = this.questionGenerators[content.contentType];
      if (generator) {
        questions = await generator(content);
      } else {
        throw new Error(`Unsupported content type: ${content.contentType}`);
      }
      
      // Save generated questions to database
      const savedQuestions = [];
      for (const question of questions) {
        question.contentId = content.id;
        question.subjectId = content.subjectId;
        const questionId = await db.addGeneratedQuestion(question);
        savedQuestions.push({ ...question, id: questionId });
      }
      
      // Update content status to completed
      await db.updateContentStatus(content.id, 'completed');
      
      return savedQuestions;
    } catch (error) {
      console.error('Content processing failed:', error);
      const db = getDB();
      await db.updateContentStatus(content.id, 'failed');
      throw error;
    }
  }

  /**
   * Generate questions from plain text content
   * @param {Object} content - Content object with text
   * @returns {Array} Generated questions
   */
  async generateQuestionsFromText(content) {
    const text = content.content;
    const questions = [];
    
    // Split text into sentences and paragraphs
    const sentences = this.extractSentences(text);
    const keyFacts = this.extractKeyFacts(sentences);
    const definitions = this.extractDefinitions(text);
    const numbers = this.extractNumbers(text);
    
    // Generate different types of questions
    questions.push(...this.createDefinitionQuestions(definitions, content));
    questions.push(...this.createFactualQuestions(keyFacts, content));
    questions.push(...this.createNumericQuestions(numbers, content));
    questions.push(...this.createMultipleChoiceQuestions(keyFacts, content));
    
    return questions.filter(q => q !== null);
  }

  /**
   * Extract sentences from text
   * @param {string} text - Input text
   * @returns {Array} Array of sentences
   */
  extractSentences(text) {
    // Simple sentence splitting - could be improved with NLP libraries
    return text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 10); // Filter out very short sentences
  }

  /**
   * Extract key facts (sentences with important information)
   * @param {Array} sentences - Array of sentences
   * @returns {Array} Key factual sentences
   */
  extractKeyFacts(sentences) {
    // Look for sentences with specific patterns that indicate facts
    const factPatterns = [
      /is|are|was|were|has|have|had/i, // Being/having verbs
      /\d+/, // Contains numbers
      /first|last|largest|smallest|most|least/i, // Superlatives
      /because|since|therefore|thus|so/i, // Causal relationships
      /invented|discovered|created|founded/i, // Historical facts
    ];
    
    return sentences.filter(sentence => 
      factPatterns.some(pattern => pattern.test(sentence)) &&
      sentence.length > 20 &&
      sentence.length < 200
    );
  }

  /**
   * Extract definitions from text
   * @param {string} text - Input text
   * @returns {Array} Array of definition pairs
   */
  extractDefinitions(text) {
    const definitions = [];
    const definitionPatterns = [
      /([A-Z][a-z]+) is (a|an) ([^.!?]+)/g, // "Word is a definition"
      /([A-Z][a-z]+) means ([^.!?]+)/g, // "Word means definition"
      /([A-Z][a-z]+): ([^.!?]+)/g, // "Word: definition"
    ];
    
    definitionPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        definitions.push({
          term: match[1].trim(),
          definition: match[2].trim()
        });
      }
    });
    
    return definitions;
  }

  /**
   * Extract numbers and numeric facts
   * @param {string} text - Input text
   * @returns {Array} Array of numeric facts
   */
  extractNumbers(text) {
    const numberFacts = [];
    const numberPattern = /(\d+(?:\.\d+)?)\s*([a-zA-Z%]+)?/g;
    const sentences = this.extractSentences(text);
    
    sentences.forEach(sentence => {
      let match;
      while ((match = numberPattern.exec(sentence)) !== null) {
        if (sentence.length < 150) { // Not too long
          numberFacts.push({
            number: parseFloat(match[1]),
            unit: match[2] || '',
            context: sentence
          });
        }
      }
    });
    
    return numberFacts;
  }

  /**
   * Create definition-based questions
   * @param {Array} definitions - Extracted definitions
   * @param {Object} content - Source content
   * @returns {Array} Definition questions
   */
  createDefinitionQuestions(definitions, content) {
    return definitions.map(def => {
      if (def.term.length > 20 || def.definition.length > 100) return null;
      
      return {
        type: 'short',
        prompt: `What is ${def.term.toLowerCase()}?`,
        acceptableAnswers: [
          def.definition.toLowerCase(),
          def.definition.replace(/^(a|an|the)\s+/i, '').toLowerCase()
        ],
        difficulty: this.calculateDifficulty(def.definition),
        hint: `Think about the definition of ${def.term}`,
        explanation: `${def.term} is ${def.definition}`,
        source: `Definition of ${def.term}`
      };
    });
  }

  /**
   * Create factual questions from key facts
   * @param {Array} keyFacts - Extracted key facts
   * @param {Object} content - Source content
   * @returns {Array} Factual questions
   */
  createFactualQuestions(keyFacts, content) {
    const questions = [];
    
    keyFacts.forEach(fact => {
      // Try to create fill-in-the-blank questions
      const question = this.createFillInBlankQuestion(fact);
      if (question) {
        questions.push(question);
      }
    });
    
    return questions;
  }

  /**
   * Create fill-in-the-blank questions from facts
   * @param {string} fact - Source fact sentence
   * @returns {Object|null} Question object or null
   */
  createFillInBlankQuestion(fact) {
    // Look for key terms to blank out
    const keyTerms = fact.match(/\b[A-Z][a-zA-Z]{3,}\b/g); // Capitalized words 4+ chars
    
    if (!keyTerms || keyTerms.length === 0) return null;
    
    const termToBlank = keyTerms[Math.floor(Math.random() * keyTerms.length)];
    const prompt = fact.replace(new RegExp(termToBlank, 'g'), '______');
    
    return {
      type: 'short',
      prompt: `Fill in the blank: ${prompt}`,
      acceptableAnswers: [termToBlank.toLowerCase()],
      difficulty: this.calculateDifficulty(termToBlank),
      hint: `Think about what fits in the context: ${fact.substring(0, 50)}...`,
      explanation: `The answer is ${termToBlank}. ${fact}`,
      source: `Fact: ${fact.substring(0, 30)}...`
    };
  }

  /**
   * Create numeric questions
   * @param {Array} numbers - Extracted numbers
   * @param {Object} content - Source content
   * @returns {Array} Numeric questions
   */
  createNumericQuestions(numbers, content) {
    return numbers.map(numFact => {
      if (numFact.context.length > 120) return null;
      
      const prompt = numFact.context.replace(
        numFact.number.toString(),
        '______'
      );
      
      return {
        type: 'numeric',
        prompt: `What number fits here? ${prompt}`,
        answerNumeric: numFact.number,
        tolerance: this.calculateTolerance(numFact.number),
        difficulty: this.calculateDifficulty(numFact.context),
        hint: `Look for clues in the context about what this number represents`,
        explanation: `The answer is ${numFact.number}${numFact.unit}. ${numFact.context}`,
        source: `Numeric fact: ${numFact.context.substring(0, 30)}...`
      };
    });
  }

  /**
   * Create multiple choice questions
   * @param {Array} keyFacts - Key facts to turn into MCQs
   * @param {Object} content - Source content
   * @returns {Array} Multiple choice questions
   */
  createMultipleChoiceQuestions(keyFacts, content) {
    const questions = [];
    
    keyFacts.forEach(fact => {
      const mcq = this.createMCQFromFact(fact);
      if (mcq) {
        questions.push(mcq);
      }
    });
    
    return questions;
  }

  /**
   * Create MCQ from a fact
   * @param {string} fact - Source fact
   * @returns {Object|null} MCQ question or null
   */
  createMCQFromFact(fact) {
    // Extract key terms for options
    const terms = fact.match(/\b[A-Za-z]{4,}\b/g);
    if (!terms || terms.length < 2) return null;
    
    const correctAnswer = terms[Math.floor(Math.random() * terms.length)];
    const prompt = fact.replace(correctAnswer, '______');
    
    // Generate plausible wrong answers
    const wrongAnswers = this.generateWrongAnswers(correctAnswer, terms);
    const options = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
    const correctIndex = options.indexOf(correctAnswer);
    
    return {
      type: 'mcq',
      prompt: `Complete the sentence: ${prompt}`,
      options,
      answerIndex: correctIndex,
      difficulty: this.calculateDifficulty(fact),
      hint: `Think about the context: ${fact.substring(0, 40)}...`,
      explanation: `The correct answer is ${correctAnswer}. ${fact}`,
      source: `MCQ from: ${fact.substring(0, 30)}...`
    };
  }

  /**
   * Generate plausible wrong answers
   * @param {string} correct - Correct answer
   * @param {Array} terms - Available terms
   * @returns {Array} Wrong answer options
   */
  generateWrongAnswers(correct, terms) {
    const wrongAnswers = terms
      .filter(term => term.toLowerCase() !== correct.toLowerCase())
      .slice(0, 3);
    
    // If we don't have enough terms, add some generic wrong answers
    const genericOptions = ['none', 'all', 'other', 'unknown'];
    while (wrongAnswers.length < 3) {
      const generic = genericOptions[Math.floor(Math.random() * genericOptions.length)];
      if (!wrongAnswers.includes(generic)) {
        wrongAnswers.push(generic);
      }
    }
    
    return wrongAnswers.slice(0, 3);
  }

  /**
   * Calculate question difficulty based on content complexity
   * @param {string} content - Content to analyze
   * @returns {number} Difficulty level (1-3)
   */
  calculateDifficulty(content) {
    const length = content.length;
    const complexWords = (content.match(/\b\w{8,}\b/g) || []).length;
    const complexity = complexWords / Math.max(1, length / 50);
    
    if (complexity < 0.1 && length < 50) return 1; // Easy
    if (complexity < 0.3 && length < 100) return 2; // Medium
    return 3; // Hard
  }

  /**
   * Calculate tolerance for numeric answers
   * @param {number} number - The correct number
   * @returns {number} Tolerance value
   */
  calculateTolerance(number) {
    if (number < 10) return 0; // Exact for small numbers
    if (number < 100) return 1;
    if (number < 1000) return Math.floor(number * 0.05); // 5% tolerance
    return Math.floor(number * 0.1); // 10% tolerance for large numbers
  }

  /**
   * Process PDF content using PDF.js
   * @param {Object} content - PDF content
   * @returns {Array} Generated questions
   */
  async generateQuestionsFromPDF(content) {
    try {
      console.log('Processing PDF content...');
      
      // Set worker for PDF.js - use unpkg CDN with exact version match
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@5.4.54/build/pdf.worker.min.mjs';
      }
      
      // Load PDF from ArrayBuffer data
      const pdfData = content.content;
      console.log('PDF data type:', typeof pdfData, 'Size:', pdfData?.byteLength || pdfData?.length);
      
      const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
      console.log('PDF loaded successfully, pages:', pdf.numPages);
      
      let fullText = '';
      
      // Extract text from all pages
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
      }
      
      console.log('Extracted PDF text length:', fullText.length);
      
      if (fullText.trim().length === 0) {
        console.warn('No text could be extracted from PDF');
        return [];
      }
      
      // Create a fake content object with extracted text to reuse text processing
      const textContent = {
        ...content,
        content: fullText,
        contentType: 'text'
      };
      
      // Process extracted text using existing text processing logic
      const questions = await this.generateQuestionsFromText(textContent);
      
      // Update source information to indicate PDF origin
      questions.forEach(question => {
        if (question && question.source) {
          question.source = `PDF: ${question.source}`;
        }
      });
      
      console.log('Generated', questions.length, 'questions from PDF');
      return questions;
      
    } catch (error) {
      console.error('PDF processing failed:', error);
      return [];
    }
  }

  /**
   * Process image content (placeholder - would need OCR)
   * @param {Object} content - Image content
   * @returns {Array} Generated questions
   */
  async generateQuestionsFromImage(content) {
    // This would require OCR (like Tesseract.js) to extract text from images
    console.warn('Image processing not yet implemented. Would need OCR integration.');
    return [];
  }
}

export const contentProcessor = new ContentProcessor();