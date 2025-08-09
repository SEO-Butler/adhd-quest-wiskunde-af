import { describe, it, expect } from 'vitest';
import { calculateScore } from '../logic/scoring';

describe('calculateScore', () => {
  it('should calculate base points correctly', () => {
    const score = calculateScore(1, 30, 30, 0, false);
    expect(score.basePoints).toBe(10);
    expect(score.points).toBe(20); // 10 base + 10 time bonus
  });

  it('should apply time bonus', () => {
    const fullTime = calculateScore(1, 30, 30, 0, false);
    const halfTime = calculateScore(1, 15, 30, 0, false);
    
    expect(fullTime.timeBonus).toBe(10);
    expect(halfTime.timeBonus).toBe(5);
  });

  it('should apply streak multiplier', () => {
    const noStreak = calculateScore(1, 30, 30, 0, false);
    const streak = calculateScore(1, 30, 30, 3, false);
    
    expect(noStreak.streakMultiplier).toBe(1);
    expect(streak.streakMultiplier).toBe(1.1);
  });

  it('should apply hint penalty', () => {
    const noHint = calculateScore(1, 30, 30, 0, false);
    const withHint = calculateScore(1, 30, 30, 0, true);
    
    expect(withHint.points).toBe(Math.round(noHint.points * 0.7));
  });

  it('should calculate coins correctly', () => {
    const score = calculateScore(1, 30, 30, 0, false);
    expect(score.coins).toBe(Math.floor(score.points / 5));
  });
});