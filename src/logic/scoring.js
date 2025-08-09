export function calculateScore(difficulty, timeLeft, totalTime, currentStreak, usedHint) {
  // Base points based on difficulty
  const basePoints = {
    1: 10, // easy
    2: 15, // medium
    3: 20  // hard
  }[difficulty] || 10;

  // Time bonus (up to +10 points)
  const timeBonus = Math.round((timeLeft / totalTime) * 10);

  // Streak multiplier (10% bonus every 3 correct in a row)
  const streakMultiplier = 1 + (Math.floor(currentStreak / 3) * 0.1);

  // Calculate total points
  let totalPoints = (basePoints + timeBonus) * streakMultiplier;

  // Apply hint penalty (30% reduction)
  if (usedHint) {
    totalPoints *= 0.7;
  }

  // Round to whole number
  totalPoints = Math.round(totalPoints);

  // Calculate coins (1 coin per 5 points)
  const coins = Math.floor(totalPoints / 5);

  return {
    points: totalPoints,
    coins,
    basePoints,
    timeBonus,
    streakMultiplier,
    usedHint
  };
}