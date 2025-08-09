import React from 'react';
import { motion } from 'framer-motion';

function XPBar({ xp, level }) {
  const currentLevelXP = (level - 1) * 100;
  const nextLevelXP = level * 100;
  const progress = ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span>Level {level}</span>
        <span>{xp - currentLevelXP} / {nextLevelXP - currentLevelXP} XP</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export default XPBar;