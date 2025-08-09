export function selectNextQuestion(questions, stats, sessionStats, useDynamicDifficulty, askedQuestions) {
  const now = Date.now();
  
  // Filter out already asked questions in this session
  const availableQuestions = questions.filter(q => !askedQuestions.has(q.id));
  
  if (availableQuestions.length === 0) {
    // If all questions have been asked, allow repeats but prioritize least recent
    return selectLeastRecentQuestion(questions, stats);
  }

  // First, find due questions (based on spaced repetition)
  const dueQuestions = availableQuestions.filter(q => {
    const stat = stats[q.id];
    return !stat || stat.nextDue <= now;
  });

  let candidateQuestions = dueQuestions.length > 0 ? dueQuestions : availableQuestions;

  // Apply dynamic difficulty if enabled
  if (useDynamicDifficulty && sessionStats.totalQuestions > 0) {
    const accuracy = sessionStats.correctAnswers / sessionStats.totalQuestions;
    candidateQuestions = applyDynamicDifficulty(candidateQuestions, accuracy);
  }

  // Select question with least practice (or random if tie)
  return selectLeastPracticedQuestion(candidateQuestions, stats);
}

function selectLeastRecentQuestion(questions, stats) {
  // Find the question that was answered longest ago
  let oldestQuestion = null;
  let oldestTime = Infinity;

  for (const question of questions) {
    const stat = stats[question.id];
    const lastAnswered = stat ? stat.nextDue - (stat.intervalMin * 60 * 1000) : 0;
    
    if (lastAnswered < oldestTime) {
      oldestTime = lastAnswered;
      oldestQuestion = question;
    }
  }

  return oldestQuestion || questions[0];
}

function applyDynamicDifficulty(questions, accuracy) {
  if (accuracy > 0.8) {
    // High accuracy - prefer medium/hard questions
    const harderQuestions = questions.filter(q => (q.difficulty || 1) >= 2);
    return harderQuestions.length > 0 ? harderQuestions : questions;
  } else if (accuracy < 0.5) {
    // Low accuracy - prefer easy questions
    const easierQuestions = questions.filter(q => (q.difficulty || 1) === 1);
    return easierQuestions.length > 0 ? easierQuestions : questions;
  }
  
  // Medium accuracy - no filtering
  return questions;
}

function selectLeastPracticedQuestion(questions, stats) {
  // Find question with lowest total attempts
  let minAttempts = Infinity;
  const leastPracticedQuestions = [];

  for (const question of questions) {
    const stat = stats[question.id];
    const totalAttempts = stat ? (stat.correct + stat.wrong) : 0;
    
    if (totalAttempts < minAttempts) {
      minAttempts = totalAttempts;
      leastPracticedQuestions.length = 0;
      leastPracticedQuestions.push(question);
    } else if (totalAttempts === minAttempts) {
      leastPracticedQuestions.push(question);
    }
  }

  // Random selection from least practiced
  return leastPracticedQuestions[Math.floor(Math.random() * leastPracticedQuestions.length)];
}