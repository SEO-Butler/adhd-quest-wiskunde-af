import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiCheck, FiX, FiArrowRight, FiHome, FiStar, FiCoins, FiInfo } = FiIcons;

function FeedbackPanel({ feedbackData, onNext, onEndSession }) {
  const { correct, points, coins, explanation, streak, confidence, method, suggestion, matchedAnswer } = feedbackData;

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`bg-white rounded-2xl shadow-lg p-8 border-l-4 ${
        correct ? 'border-success-500' : 'border-error-500'
      }`}
    >
      {/* Result Header */}
      <div className="flex items-center space-x-4 mb-6">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
          correct ? 'bg-success-100' : 'bg-error-100'
        }`}>
          <SafeIcon 
            icon={correct ? FiCheck : FiX} 
            className={`text-2xl ${correct ? 'text-success-600' : 'text-error-600'}`} 
          />
        </div>
        <div>
          <h3 className={`text-xl font-bold ${
            correct ? 'text-success-700' : 'text-error-700'
          }`}>
            {correct ? 'Excellent!' : 'Not quite right'}
          </h3>
          <p className="text-gray-600">
            {correct ? 'Keep up the great work!' : 'You\'ll get it next time!'}
          </p>
        </div>
      </div>

      {/* Rewards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-primary-50 rounded-xl">
          <SafeIcon icon={FiStar} className="text-2xl text-primary-600 mx-auto mb-2" />
          <div className="text-lg font-bold text-primary-700">+{points}</div>
          <div className="text-sm text-primary-600">XP</div>
        </div>
        <div className="text-center p-4 bg-warning-50 rounded-xl">
          <SafeIcon icon={FiCoins} className="text-2xl text-warning-600 mx-auto mb-2" />
          <div className="text-lg font-bold text-warning-700">+{coins}</div>
          <div className="text-sm text-warning-600">Coins</div>
        </div>
        <div className="text-center p-4 bg-success-50 rounded-xl">
          <div className="text-2xl font-bold text-success-600 mb-2">🔥</div>
          <div className="text-lg font-bold text-success-700">{streak}</div>
          <div className="text-sm text-success-600">Streak</div>
        </div>
      </div>

      {/* Enhanced feedback for close answers */}
      {!correct && suggestion && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
          <div className="flex items-start space-x-2">
            <SafeIcon icon={FiInfo} className="text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-800 mb-1">Close Answer!</h4>
              <p className="text-blue-700 text-sm">
                {confidence && confidence > 0.4 ? 
                  `You were close! The answer was "${suggestion}". ${method === 'edit_distance' ? 'Check your spelling.' : 'Try to be more specific.'}` :
                  `The correct answer was "${suggestion}".`
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Explanation */}
      {explanation && (
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <h4 className="font-semibold text-gray-800 mb-2">Explanation</h4>
          <p className="text-gray-700">{explanation}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={onNext}
          className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
        >
          <span>Next Question</span>
          <SafeIcon icon={FiArrowRight} />
        </button>
        
        <button
          onClick={onEndSession}
          className="px-6 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-colors flex items-center space-x-2"
        >
          <SafeIcon icon={FiHome} />
          <span>End Session</span>
        </button>
      </div>
    </motion.div>
  );
}

export default FeedbackPanel;