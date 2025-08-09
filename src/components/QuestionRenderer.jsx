import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiSkipForward, FiCheck } = FiIcons;

function QuestionRenderer({ question, onSubmit, onSkip, disabled }) {
  const [answer, setAnswer] = React.useState('');
  const [selectedOption, setSelectedOption] = React.useState(null);

  const handleSubmit = () => {
    if (disabled) return;
    
    let finalAnswer;
    if (question.type === 'mcq') {
      finalAnswer = selectedOption;
    } else {
      finalAnswer = answer.trim();
    }
    
    if (finalAnswer !== null && finalAnswer !== '') {
      onSubmit(finalAnswer);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !disabled) {
      handleSubmit();
    }
  };

  const canSubmit = () => {
    if (disabled) return false;
    if (question.type === 'mcq') {
      return selectedOption !== null;
    }
    return answer.trim() !== '';
  };

  return (
    <div className="space-y-6">
      {/* Answer Input */}
      {question.type === 'mcq' && (
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: disabled ? 1 : 1.02 }}
              whileTap={{ scale: disabled ? 1 : 0.98 }}
              onClick={() => !disabled && setSelectedOption(index)}
              className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                selectedOption === index
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedOption === index
                    ? 'border-primary-500 bg-primary-500'
                    : 'border-gray-300'
                }`}>
                  {selectedOption === index && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                <span className="font-medium">{option}</span>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {question.type === 'numeric' && (
        <div>
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={disabled}
            placeholder="Tik jou antwoord hier..."
            className="w-full p-4 text-lg border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            autoFocus
          />
          <p className="text-sm text-gray-500 mt-2">
            Enter a number (decimals allowed)
          </p>
        </div>
      )}

      {question.type === 'short' && (
        <div>
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={disabled}
            placeholder="Type your answer..."
            className="w-full p-4 text-lg border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            autoFocus
          />
          <p className="text-sm text-gray-500 mt-2">
            Type your answer in a few words
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit()}
          className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 ${
            canSubmit()
              ? 'bg-success-500 hover:bg-success-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <SafeIcon icon={FiCheck} />
          <span>Dien in</span>
        </button>
        
        <button
          onClick={onSkip}
          disabled={disabled}
          className="px-6 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <SafeIcon icon={FiSkipForward} />
          <span>Slaan oor</span>
        </button>
      </div>
    </div>
  );
}

export default QuestionRenderer;