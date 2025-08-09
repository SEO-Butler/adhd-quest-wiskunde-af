// Enhanced fuzzy matching system for handling misspellings and close answers
import { normalizeText, levenshtein } from './textUtils.js';

/**
 * Advanced fuzzy matching system that handles various types of user input errors
 */
export class FuzzyMatcher {
  constructor() {
    // Common word transformations and synonyms
    this.synonymGroups = new Map([
      ['big', ['large', 'huge', 'enormous', 'massive', 'giant']],
      ['small', ['tiny', 'little', 'miniature', 'minor']],
      ['happy', ['joyful', 'glad', 'cheerful', 'pleased', 'delighted']],
      ['sad', ['unhappy', 'sorrowful', 'depressed', 'gloomy']],
      ['fast', ['quick', 'rapid', 'speedy', 'swift']],
      ['slow', ['sluggish', 'gradual', 'leisurely']],
      ['good', ['excellent', 'great', 'fine', 'wonderful', 'nice']],
      ['bad', ['poor', 'terrible', 'awful', 'horrible']],
    ]);

    // Common misspelling patterns
    this.commonMisspellings = new Map([
      ['recieve', 'receive'],
      ['seperate', 'separate'],
      ['definately', 'definitely'],
      ['occured', 'occurred'],
      ['begining', 'beginning'],
      ['existance', 'existence'],
      ['independant', 'independent'],
      ['neccessary', 'necessary'],
    ]);

    // Phonetic patterns (similar sounding letters/combinations)
    this.phoneticPatterns = [
      [/ph/g, 'f'],
      [/ck/g, 'k'],
      [/qu/g, 'kw'],
      [/x/g, 'ks'],
      [/z/g, 's'],
      [/c/g, 'k'], // Sometimes c sounds like k
    ];
  }

  /**
   * Main fuzzy matching function with multiple strategies
   * @param {string} userAnswer - User's input
   * @param {Array} acceptableAnswers - Array of correct answers
   * @param {Object} options - Matching options
   * @returns {Object} Match result with confidence score
   */
  fuzzyMatch(userAnswer, acceptableAnswers, options = {}) {
    const config = {
      enableSynonyms: true,
      enablePhonetic: true,
      enableAbbreviations: true,
      maxEditDistance: 2,
      minConfidence: 0.6,
      ...options
    };

    if (!userAnswer || !acceptableAnswers || acceptableAnswers.length === 0) {
      return { isMatch: false, confidence: 0, method: 'none', suggestion: null };
    }

    const normalizedUser = normalizeText(userAnswer);
    const results = [];

    for (const acceptable of acceptableAnswers) {
      const normalizedAcceptable = normalizeText(acceptable);
      
      // Try different matching strategies
      const exactMatch = this.exactMatch(normalizedUser, normalizedAcceptable);
      if (exactMatch.confidence > 0) {
        results.push({ ...exactMatch, original: acceptable });
        continue;
      }

      const editMatch = this.editDistanceMatch(normalizedUser, normalizedAcceptable, config);
      if (editMatch.confidence >= config.minConfidence) {
        results.push({ ...editMatch, original: acceptable });
      }

      if (config.enableSynonyms) {
        const synonymMatch = this.synonymMatch(normalizedUser, normalizedAcceptable);
        if (synonymMatch.confidence >= config.minConfidence) {
          results.push({ ...synonymMatch, original: acceptable });
        }
      }

      if (config.enablePhonetic) {
        const phoneticMatch = this.phoneticMatch(normalizedUser, normalizedAcceptable);
        if (phoneticMatch.confidence >= config.minConfidence) {
          results.push({ ...phoneticMatch, original: acceptable });
        }
      }

      if (config.enableAbbreviations) {
        const abbreviationMatch = this.abbreviationMatch(normalizedUser, normalizedAcceptable);
        if (abbreviationMatch.confidence >= config.minConfidence) {
          results.push({ ...abbreviationMatch, original: acceptable });
        }
      }

      // Check for common misspellings
      const misspellingMatch = this.misspellingMatch(normalizedUser, normalizedAcceptable);
      if (misspellingMatch.confidence >= config.minConfidence) {
        results.push({ ...misspellingMatch, original: acceptable });
      }

      // Partial match (substring matching)
      const partialMatch = this.partialMatch(normalizedUser, normalizedAcceptable);
      if (partialMatch.confidence >= config.minConfidence) {
        results.push({ ...partialMatch, original: acceptable });
      }
    }

    // Return the best match
    if (results.length === 0) {
      return { 
        isMatch: false, 
        confidence: 0, 
        method: 'none', 
        suggestion: this.getBestSuggestion(normalizedUser, acceptableAnswers)
      };
    }

    const bestMatch = results.reduce((best, current) => 
      current.confidence > best.confidence ? current : best
    );

    return {
      isMatch: bestMatch.confidence >= config.minConfidence,
      confidence: bestMatch.confidence,
      method: bestMatch.method,
      matchedAnswer: bestMatch.original,
      suggestion: bestMatch.confidence < config.minConfidence 
        ? bestMatch.original 
        : null
    };
  }

  /**
   * Exact match (case insensitive, normalized)
   * @param {string} user - User input
   * @param {string} correct - Correct answer
   * @returns {Object} Match result
   */
  exactMatch(user, correct) {
    if (user === correct) {
      return { confidence: 1.0, method: 'exact' };
    }
    return { confidence: 0, method: 'exact' };
  }

  /**
   * Edit distance based matching (Levenshtein distance)
   * @param {string} user - User input
   * @param {string} correct - Correct answer
   * @param {Object} config - Configuration options
   * @returns {Object} Match result
   */
  editDistanceMatch(user, correct, config) {
    const distance = levenshtein(user, correct);
    const maxLength = Math.max(user.length, correct.length);
    
    if (distance <= config.maxEditDistance && maxLength > 0) {
      const confidence = 1 - (distance / maxLength);
      return { 
        confidence: Math.max(0, confidence), 
        method: 'edit_distance',
        distance 
      };
    }
    
    return { confidence: 0, method: 'edit_distance' };
  }

  /**
   * Synonym matching
   * @param {string} user - User input
   * @param {string} correct - Correct answer
   * @returns {Object} Match result
   */
  synonymMatch(user, correct) {
    // Check if user input is a synonym of the correct answer
    for (const [base, synonyms] of this.synonymGroups) {
      if (synonyms.includes(correct) && synonyms.includes(user)) {
        return { confidence: 0.8, method: 'synonym' };
      }
      if (base === correct && synonyms.includes(user)) {
        return { confidence: 0.8, method: 'synonym' };
      }
      if (base === user && synonyms.includes(correct)) {
        return { confidence: 0.8, method: 'synonym' };
      }
    }
    
    return { confidence: 0, method: 'synonym' };
  }

  /**
   * Phonetic matching (similar sounding words)
   * @param {string} user - User input
   * @param {string} correct - Correct answer
   * @returns {Object} Match result
   */
  phoneticMatch(user, correct) {
    const phoneticUser = this.toPhonetic(user);
    const phoneticCorrect = this.toPhonetic(correct);
    
    if (phoneticUser === phoneticCorrect) {
      return { confidence: 0.7, method: 'phonetic' };
    }
    
    const distance = levenshtein(phoneticUser, phoneticCorrect);
    const maxLength = Math.max(phoneticUser.length, phoneticCorrect.length);
    
    if (distance <= 1 && maxLength > 0) {
      const confidence = 0.6 * (1 - distance / maxLength);
      return { confidence: Math.max(0, confidence), method: 'phonetic' };
    }
    
    return { confidence: 0, method: 'phonetic' };
  }

  /**
   * Convert text to phonetic representation
   * @param {string} text - Input text
   * @returns {string} Phonetic representation
   */
  toPhonetic(text) {
    let phonetic = text.toLowerCase();
    
    this.phoneticPatterns.forEach(([pattern, replacement]) => {
      phonetic = phonetic.replace(pattern, replacement);
    });
    
    return phonetic;
  }

  /**
   * Abbreviation matching
   * @param {string} user - User input
   * @param {string} correct - Correct answer
   * @returns {Object} Match result
   */
  abbreviationMatch(user, correct) {
    // Check if user input is an abbreviation of the correct answer
    const abbreviation = correct
      .split(/\s+/)
      .map(word => word[0])
      .join('')
      .toLowerCase();
    
    if (user === abbreviation) {
      return { confidence: 0.75, method: 'abbreviation' };
    }
    
    // Check if correct answer is abbreviation of user input
    const userAbbrev = user
      .split(/\s+/)
      .map(word => word[0])
      .join('')
      .toLowerCase();
    
    if (correct === userAbbrev) {
      return { confidence: 0.75, method: 'abbreviation_reverse' };
    }
    
    return { confidence: 0, method: 'abbreviation' };
  }

  /**
   * Common misspelling correction
   * @param {string} user - User input
   * @param {string} correct - Correct answer
   * @returns {Object} Match result
   */
  misspellingMatch(user, correct) {
    // Check if user input is a common misspelling
    if (this.commonMisspellings.has(user) && this.commonMisspellings.get(user) === correct) {
      return { confidence: 0.9, method: 'common_misspelling' };
    }
    
    // Check reverse (correct is misspelling of user input)
    for (const [misspelling, correction] of this.commonMisspellings) {
      if (misspelling === correct && correction === user) {
        return { confidence: 0.9, method: 'reverse_misspelling' };
      }
    }
    
    return { confidence: 0, method: 'misspelling' };
  }

  /**
   * Partial matching (substring matching with context)
   * @param {string} user - User input
   * @param {string} correct - Correct answer
   * @returns {Object} Match result
   */
  partialMatch(user, correct) {
    const userWords = user.split(/\s+/);
    const correctWords = correct.split(/\s+/);
    
    // Check if all user words are contained in correct answer
    const allUserWordsFound = userWords.every(userWord => 
      correctWords.some(correctWord => 
        correctWord.includes(userWord) || userWord.includes(correctWord)
      )
    );
    
    if (allUserWordsFound && userWords.length > 0) {
      const confidence = Math.min(0.7, userWords.length / correctWords.length);
      return { confidence, method: 'partial_match' };
    }
    
    // Check for substring matches
    if (correct.includes(user) && user.length >= 3) {
      return { confidence: 0.6, method: 'substring' };
    }
    
    if (user.includes(correct) && correct.length >= 3) {
      return { confidence: 0.6, method: 'contains' };
    }
    
    return { confidence: 0, method: 'partial' };
  }

  /**
   * Get best suggestion for incorrect answer
   * @param {string} userAnswer - User's incorrect answer
   * @param {Array} acceptableAnswers - List of correct answers
   * @returns {string|null} Best suggestion
   */
  getBestSuggestion(userAnswer, acceptableAnswers) {
    let bestSuggestion = null;
    let bestScore = 0;
    
    for (const answer of acceptableAnswers) {
      const normalizedAnswer = normalizeText(answer);
      const distance = levenshtein(userAnswer, normalizedAnswer);
      const maxLength = Math.max(userAnswer.length, normalizedAnswer.length);
      const similarity = maxLength > 0 ? 1 - (distance / maxLength) : 0;
      
      if (similarity > bestScore) {
        bestScore = similarity;
        bestSuggestion = answer;
      }
    }
    
    return bestScore > 0.3 ? bestSuggestion : null;
  }

  /**
   * Analyze user answer patterns to improve future matching
   * @param {string} userAnswer - User's answer
   * @param {string} correctAnswer - Correct answer
   * @param {boolean} wasCorrect - Whether the answer was accepted
   * @returns {Object} Analysis result
   */
  analyzeAnswerPattern(userAnswer, correctAnswer, wasCorrect) {
    const analysis = {
      editDistance: levenshtein(normalizeText(userAnswer), normalizeText(correctAnswer)),
      lengthDifference: Math.abs(userAnswer.length - correctAnswer.length),
      commonPrefixLength: this.getCommonPrefixLength(userAnswer, correctAnswer),
      commonSuffixLength: this.getCommonSuffixLength(userAnswer, correctAnswer),
      hasNumbers: /\d/.test(userAnswer),
      hasSpecialChars: /[^a-zA-Z0-9\s]/.test(userAnswer),
      wordCount: userAnswer.split(/\s+/).length,
      wasAccepted: wasCorrect
    };
    
    return analysis;
  }

  /**
   * Get common prefix length between two strings
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} Common prefix length
   */
  getCommonPrefixLength(str1, str2) {
    let i = 0;
    while (i < str1.length && i < str2.length && str1[i] === str2[i]) {
      i++;
    }
    return i;
  }

  /**
   * Get common suffix length between two strings
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} Common suffix length
   */
  getCommonSuffixLength(str1, str2) {
    let i = 0;
    while (i < str1.length && i < str2.length && 
           str1[str1.length - 1 - i] === str2[str2.length - 1 - i]) {
      i++;
    }
    return i;
  }
}

// Export singleton instance
export const fuzzyMatcher = new FuzzyMatcher();

// Enhanced grading function that uses fuzzy matching
export function enhancedGradeAnswer(question, answer, options = {}) {
  if (answer === null || answer === undefined) {
    return { correct: false, confidence: 0, suggestion: null };
  }

  switch (question.type) {
    case 'mcq':
      return { 
        correct: answer === question.answerIndex, 
        confidence: answer === question.answerIndex ? 1 : 0,
        suggestion: null 
      };
    
    case 'numeric':
      const numericAnswer = parseFloat(answer);
      if (isNaN(numericAnswer)) {
        return { correct: false, confidence: 0, suggestion: `Expected a number, got "${answer}"` };
      }
      
      const tolerance = question.tolerance || 0;
      const isCorrect = Math.abs(numericAnswer - question.answerNumeric) <= tolerance;
      return { 
        correct: isCorrect, 
        confidence: isCorrect ? 1 : 0,
        suggestion: isCorrect ? null : `Close! The answer is ${question.answerNumeric}`
      };
    
    case 'short':
      const matchResult = fuzzyMatcher.fuzzyMatch(
        answer, 
        question.acceptableAnswers || [], 
        options
      );
      
      return {
        correct: matchResult.isMatch,
        confidence: matchResult.confidence,
        method: matchResult.method,
        suggestion: matchResult.suggestion,
        matchedAnswer: matchResult.matchedAnswer
      };
    
    default:
      return { correct: false, confidence: 0, suggestion: 'Unknown question type' };
  }
}