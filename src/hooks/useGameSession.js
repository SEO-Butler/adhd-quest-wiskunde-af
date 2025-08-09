import React from 'react';
import { useProfileStore } from '../state/profileStore';
import { seedQuestions } from '../../seedQuestions_wiskunde_gr4_af';
import { enhancedQuestions } from '../data/enhancedQuestions_gr4_af';
import { gradeAnswer } from '../logic/grading';
import { enhancedGradeAnswer } from '../utils/fuzzyMatching';
import { calculateScore } from '../logic/scoring';
import { selectNextQuestion } from '../logic/scheduling';
import { getDB, initDB } from '../database/db';

export function useGameSession() {
  const { profile, saveProfile, updateCardStat } = useProfileStore();
  
  const [currentQuestion, setCurrentQuestion] = React.useState(null);
  const [sessionStats, setSessionStats] = React.useState({
    totalQuestions: 0,
    correctAnswers: 0,
    totalXP: 0,
    totalCoins: 0,
    maxStreak: 0,
    currentStreak: 0,
    duration: 0,
    startTime: Date.now(),
  });
  const [timeLeft, setTimeLeft] = React.useState(profile.preferences.questionSeconds);
  const [showFeedback, setShowFeedback] = React.useState(false);
  const [feedbackData, setFeedbackData] = React.useState(null);
  const [showHint, setShowHint] = React.useState(false);
  const [isSessionComplete, setIsSessionComplete] = React.useState(false);
  const [sessionStartTime] = React.useState(Date.now());
  const [askedQuestions, setAskedQuestions] = React.useState(new Set());
  const [allQuestions, setAllQuestions] = React.useState([]);

  // Timer effect
  React.useEffect(() => {
    if (timeLeft > 0 && !showFeedback && currentQuestion) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showFeedback) {
      // Time's up - auto submit as incorrect
      handleTimeUp();
    }
  }, [timeLeft, showFeedback, currentQuestion]);

  // Session duration check
  React.useEffect(() => {
    const checkSessionDuration = () => {
      const elapsed = (Date.now() - sessionStartTime) / 1000 / 60; // minutes
      if (elapsed >= profile.preferences.sessionMinutes) {
        setIsSessionComplete(true);
      }
    };

    const interval = setInterval(checkSessionDuration, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [sessionStartTime, profile.preferences.sessionMinutes]);

  // Load all questions (seed + generated) and initialize first question
  React.useEffect(() => {
    const loadQuestions = async () => {
      try {
        // Wait for database to be initialized
        await initDB();
        const db = getDB();
        const generatedQuestions = await db.getAllGeneratedQuestions();
        
        // Combine enhanced questions, seed questions, and generated questions
        const combinedQuestions = [
          ...enhancedQuestions,
          ...seedQuestions,
          ...generatedQuestions.map(q => ({
            id: `gen_${q.id}`,
            subject: q.subjectId ? `Subject ${q.subjectId}` : 'Generated',
            topic: q.source || 'Custom Content',
            type: q.type,
            prompt: q.prompt,
            options: q.options,
            answerIndex: q.answerIndex,
            acceptableAnswers: q.acceptableAnswers,
            answerNumeric: q.answerNumeric,
            tolerance: q.tolerance,
            difficulty: q.difficulty,
            hint: q.hint,
            explanation: q.explanation,
            ttsInstruction: q.ttsInstruction // Include TTS instruction if available
          }))
        ];
        
        console.log(`Loaded questions: ${enhancedQuestions.length} enhanced, ${seedQuestions.length} seed, ${generatedQuestions.length} generated`);
        console.log('Total questions available:', combinedQuestions.length);
        
        setAllQuestions(combinedQuestions);
        
        if (!currentQuestion && combinedQuestions.length > 0) {
          loadNextQuestion(combinedQuestions);
        }
      } catch (error) {
        console.error('Failed to load questions:', error);
        // Fallback to enhanced + seed questions only
        const fallbackQuestions = [...enhancedQuestions, ...seedQuestions];
        setAllQuestions(fallbackQuestions);
        if (!currentQuestion) {
          loadNextQuestion(fallbackQuestions);
        }
      }
    };
    
    loadQuestions();
  }, [currentQuestion]);

  const loadNextQuestion = (questionsToUse = null) => {
    const questionsArray = questionsToUse || allQuestions;
    const nextQuestion = selectNextQuestion(
      questionsArray,
      profile.stats,
      sessionStats,
      profile.preferences.dynamicDifficulty,
      askedQuestions
    );
    
    if (nextQuestion) {
      setCurrentQuestion(nextQuestion);
      setAskedQuestions(prev => new Set([...prev, nextQuestion.id]));
      setTimeLeft(profile.preferences.questionSeconds);
      setShowFeedback(false);
      setFeedbackData(null);
      setShowHint(false);
    } else {
      // No more questions available
      setIsSessionComplete(true);
    }
  };

  const handleTimeUp = () => {
    submitAnswer(null, true);
  };

  const submitAnswer = (answer, isTimeUp = false) => {
    if (!currentQuestion || showFeedback) return;

    // Use enhanced grading with fuzzy matching for better answer recognition
    const gradingResult = enhancedGradeAnswer(currentQuestion, answer, {
      enableSynonyms: true,
      enablePhonetic: true,
      maxEditDistance: 2,
      minConfidence: 0.65
    });
    
    const correct = gradingResult.correct;
    const score = calculateScore(
      currentQuestion.difficulty || 1,
      timeLeft,
      profile.preferences.questionSeconds,
      sessionStats.currentStreak,
      showHint
    );

    // Update card statistics
    updateCardStat(currentQuestion.id, correct, timeLeft, showHint);

    // Update session stats
    const newStats = {
      ...sessionStats,
      totalQuestions: sessionStats.totalQuestions + 1,
      correctAnswers: sessionStats.correctAnswers + (correct ? 1 : 0),
      totalXP: sessionStats.totalXP + score.points,
      totalCoins: sessionStats.totalCoins + score.coins,
      currentStreak: correct ? sessionStats.currentStreak + 1 : 0,
      maxStreak: correct 
        ? Math.max(sessionStats.maxStreak, sessionStats.currentStreak + 1)
        : sessionStats.maxStreak,
    };

    setSessionStats(newStats);

    // Update profile
    saveProfile({
      xp: profile.xp + score.points,
      coins: profile.coins + score.coins,
      lastPlayedAt: Date.now(),
    });

    // Show feedback with enhanced information
    setFeedbackData({
      correct,
      points: score.points,
      coins: score.coins,
      explanation: currentQuestion.explanation,
      streak: newStats.currentStreak,
      isTimeUp,
      confidence: gradingResult.confidence,
      method: gradingResult.method,
      suggestion: gradingResult.suggestion,
      matchedAnswer: gradingResult.matchedAnswer,
    });
    setShowFeedback(true);

    // Log attempt (for future backend integration)
    const attemptData = {
      questionId: currentQuestion.id,
      rawAnswer: answer,
      correct,
      timeLeft,
      usedHint: showHint,
      timestamp: Date.now(),
      subject: currentQuestion.subject,
      topic: currentQuestion.topic,
    };
    
    // TODO: Send to backend when available
    console.log('Attempt logged:', attemptData);
  };

  const skipQuestion = () => {
    submitAnswer(null);
  };

  const toggleHint = () => {
    setShowHint(!showHint);
  };

  const nextQuestion = () => {
    loadNextQuestion();
  };

  const endSession = () => {
    setSessionStats(prev => ({
      ...prev,
      duration: Math.round((Date.now() - sessionStartTime) / 1000 / 60),
    }));
    setIsSessionComplete(true);
  };

  return {
    currentQuestion,
    sessionStats,
    timeLeft,
    showFeedback,
    feedbackData,
    showHint,
    isSessionComplete,
    submitAnswer,
    skipQuestion,
    toggleHint,
    nextQuestion,
    endSession,
  };
}