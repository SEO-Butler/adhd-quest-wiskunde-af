import { describe, it, expect } from 'vitest';
import { gradeAnswer } from '../logic/grading';

describe('gradeAnswer', () => {
  describe('MCQ questions', () => {
    const mcqQuestion = {
      type: 'mcq',
      options: ['A', 'B', 'C', 'D'],
      answerIndex: 2
    };

    it('should return true for correct answer', () => {
      expect(gradeAnswer(mcqQuestion, 2)).toBe(true);
    });

    it('should return false for incorrect answer', () => {
      expect(gradeAnswer(mcqQuestion, 1)).toBe(false);
    });

    it('should return false for null answer', () => {
      expect(gradeAnswer(mcqQuestion, null)).toBe(false);
    });
  });

  describe('Numeric questions', () => {
    const numericQuestion = {
      type: 'numeric',
      answerNumeric: 42,
      tolerance: 1
    };

    it('should return true for exact answer', () => {
      expect(gradeAnswer(numericQuestion, 42)).toBe(true);
    });

    it('should return true for answer within tolerance', () => {
      expect(gradeAnswer(numericQuestion, 41)).toBe(true);
      expect(gradeAnswer(numericQuestion, 43)).toBe(true);
    });

    it('should return false for answer outside tolerance', () => {
      expect(gradeAnswer(numericQuestion, 40)).toBe(false);
      expect(gradeAnswer(numericQuestion, 44)).toBe(false);
    });

    it('should handle string numbers', () => {
      expect(gradeAnswer(numericQuestion, '42')).toBe(true);
      expect(gradeAnswer(numericQuestion, '41.5')).toBe(true);
    });

    it('should return false for non-numeric strings', () => {
      expect(gradeAnswer(numericQuestion, 'abc')).toBe(false);
    });
  });

  describe('Short text questions', () => {
    const shortQuestion = {
      type: 'short',
      acceptableAnswers: ['paris', 'france capital']
    };

    it('should return true for exact match', () => {
      expect(gradeAnswer(shortQuestion, 'paris')).toBe(true);
      expect(gradeAnswer(shortQuestion, 'PARIS')).toBe(true);
    });

    it('should return true for fuzzy match', () => {
      expect(gradeAnswer(shortQuestion, 'pari')).toBe(true); // 1 char diff
      expect(gradeAnswer(shortQuestion, 'paaris')).toBe(true); // 1 char diff
    });

    it('should return false for too different text', () => {
      expect(gradeAnswer(shortQuestion, 'london')).toBe(false);
    });

    it('should handle extra whitespace and punctuation', () => {
      expect(gradeAnswer(shortQuestion, '  Paris!  ')).toBe(true);
    });
  });
});