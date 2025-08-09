import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useProfileStore } from '../state/profileStore';
import XPBar from './XPBar';
import PreferencesPanel from './PreferencesPanel';

const { FiPlay, FiSettings, FiRefreshCw, FiAward, FiTarget, FiUsers } = FiIcons;

function Home() {
  const navigate = useNavigate();
  const { profile, resetProfile } = useProfileStore();
  const [showPreferences, setShowPreferences] = React.useState(false);
  const [showReset, setShowReset] = React.useState(false);

  const handleStartQuest = () => {
    navigate('/play');
  };

  const handleReset = () => {
    resetProfile();
    setShowReset(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-primary-800 mb-2">
          Quest Academy
        </h1>
        <p className="text-lg text-primary-600">
          Learn, Earn, and Level Up!
        </p>
      </motion.div>

      {/* Profile Stats */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg p-6 mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
              <SafeIcon icon={FiTarget} className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Level {profile.level}</h2>
              <p className="text-gray-600">Brave Learner</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-warning-600">{profile.coins}</div>
              <div className="text-sm text-gray-600">Coins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">{profile.xp}</div>
              <div className="text-sm text-gray-600">XP</div>
            </div>
          </div>
        </div>
        <XPBar xp={profile.xp} level={profile.level} />
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <button
          onClick={handleStartQuest}
          className="w-full bg-gradient-to-r from-success-500 to-success-600 hover:from-success-600 hover:to-success-700 text-white font-bold py-6 px-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-3"
        >
          <SafeIcon icon={FiPlay} className="text-2xl" />
          <span className="text-xl">Start Quest</span>
        </button>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <button
            onClick={() => setShowPreferences(true)}
            className="bg-white hover:bg-gray-50 text-gray-700 font-semibold py-4 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <SafeIcon icon={FiSettings} className="text-lg" />
            <span>Settings</span>
          </button>

          <button
            onClick={() => setShowReset(true)}
            className="bg-white hover:bg-gray-50 text-gray-700 font-semibold py-4 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <SafeIcon icon={FiRefreshCw} className="text-lg" />
            <span>Reset</span>
          </button>
        </div>

        {/* Parent Portal Link */}
        <button
          onClick={() => navigate('/parent')}
          className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <SafeIcon icon={FiUsers} className="text-lg" />
          <span>Parent Portal</span>
          <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Upload Content</span>
        </button>
      </motion.div>

      {/* Preferences Modal */}
      {showPreferences && (
        <PreferencesPanel onClose={() => setShowPreferences(false)} />
      )}

      {/* Reset Confirmation Modal */}
      {showReset && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-sm w-full"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4">Reset Progress?</h3>
            <p className="text-gray-600 mb-6">
              This will clear all your XP, coins, and progress. Are you sure?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowReset(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="flex-1 bg-error-500 hover:bg-error-600 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Reset
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default Home;