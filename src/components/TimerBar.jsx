import React from 'react';
import { motion } from 'framer-motion';

function TimerBar({ timeLeft, totalTime, className = '' }) {
  const progress = (timeLeft / totalTime) * 100;
  const isLow = progress < 20;
  const isMedium = progress < 50;

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-600">Time Remaining</span>
        <span className={`text-sm font-bold ${
          isLow ? 'text-error-600' : isMedium ? 'text-warning-600' : 'text-success-600'
        }`}>
          {timeLeft}s
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <motion.div
          className={`h-full rounded-full transition-colors duration-300 ${
            isLow ? 'bg-error-500' : isMedium ? 'bg-warning-500' : 'bg-success-500'
          }`}
          initial={{ width: '100%' }}
          animate={{ width: `${Math.max(0, progress)}%` }}
          transition={{ duration: 0.1, ease: "linear" }}
        />
      </div>
    </div>
  );
}

export default TimerBar;