import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useProfileStore } from '../state/profileStore';

const { FiHome, FiPlay, FiStar, FiTarget, FiTrendingUp, FiAward } = FiIcons;

function Summary() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useProfileStore();
  const sessionStats = location.state || {
    totalQuestions: 0,
    correctAnswers: 0,
    totalXP: 0,
    totalCoins: 0,
    maxStreak: 0,
    duration: 0
  };

  const accuracy = sessionStats.totalQuestions > 0 
    ? Math.round((sessionStats.correctAnswers / sessionStats.totalQuestions) * 100)
    : 0;

  const getPerformanceMessage = () => {
    if (accuracy >= 90) return "Outstanding performance! 🌟";
    if (accuracy >= 75) return "Great job! Keep it up! 👏";
    if (accuracy >= 60) return "Good work! You're improving! 💪";
    return "Every attempt makes you stronger! 🚀";
  };

  const getPerformanceColor = () => {
    if (accuracy >= 90) return "text-success-600";
    if (accuracy >= 75) return "text-primary-600";
    if (accuracy >= 60) return "text-warning-600";
    return "text-error-600";
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Quest Complete!
        </h1>
        <p className={`text-lg font-semibold ${getPerformanceColor()}`}>
          {getPerformanceMessage()}
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-4 mb-8"
      >
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <SafeIcon icon={FiTarget} className="text-3xl text-primary-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-800">{accuracy}%</div>
          <div className="text-sm text-gray-600">Accuracy</div>
          <div className="text-xs text-gray-500 mt-1">
            {sessionStats.correctAnswers} of {sessionStats.totalQuestions} correct
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <div className="text-3xl mb-3">🔥</div>
          <div className="text-2xl font-bold text-gray-800">{sessionStats.maxStreak}</div>
          <div className="text-sm text-gray-600">Best Streak</div>
          <div className="text-xs text-gray-500 mt-1">
            Consecutive correct answers
          </div>
        </div>
      </motion.div>

      {/* Rewards Summary */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-lg p-6 mb-8"
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
          <SafeIcon icon={FiAward} className="text-warning-600" />
          <span>Rewards Earned</span>
        </h2>
        
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <SafeIcon icon={FiStar} className="text-2xl text-primary-600" />
            </div>
            <div className="text-2xl font-bold text-primary-700">+{sessionStats.totalXP}</div>
            <div className="text-sm text-gray-600">Experience Points</div>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <div className="text-2xl">🪙</div>
            </div>
            <div className="text-2xl font-bold text-warning-700">+{sessionStats.totalCoins}</div>
            <div className="text-sm text-gray-600">Coins</div>
          </div>
        </div>
      </motion.div>

      {/* Current Level */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-lg p-6 mb-8"
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
          <SafeIcon icon={FiTrendingUp} className="text-success-600" />
          <span>Your Progress</span>
        </h2>
        
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-gray-800">Level {profile.level}</div>
            <div className="text-sm text-gray-600">{profile.xp} total XP</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-warning-600">{profile.coins} coins</div>
            <div className="text-sm text-gray-600">Ready to spend!</div>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <button
          onClick={() => navigate('/play')}
          className="w-full bg-gradient-to-r from-success-500 to-success-600 hover:from-success-600 hover:to-success-700 text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-3"
        >
          <SafeIcon icon={FiPlay} className="text-xl" />
          <span>Start Another Quest</span>
        </button>

        <button
          onClick={() => navigate('/')}
          className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-4 px-8 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-3 border border-gray-200"
        >
          <SafeIcon icon={FiHome} className="text-xl" />
          <span>Back to Home</span>
        </button>
      </motion.div>
    </div>
  );
}

export default Summary;