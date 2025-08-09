import React from 'react';
import {motion} from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import {useProfileStore} from '../state/profileStore';

const {FiX,FiVolume2,FiClock,FiTrendingUp,FiPlay}=FiIcons;

function PreferencesPanel({onClose}) {
  const {profile,updatePreferences}=useProfileStore();
  const {preferences}=profile;

  const handleLangChange=(e)=>{
    updatePreferences({ ttsLang: e.target.value });
  };

  // Add state to check if TTS is available in browser
  const [ttsAvailable,setTtsAvailable]=React.useState(false);
  const [ttsInitialized, setTtsInitialized] = React.useState(false);

  // Check if TTS is available when component mounts
  React.useEffect(()=> {
    const checkTTS = () => {
      const available = 'speechSynthesis' in window;
      setTtsAvailable(available);
      
      // If we're enabling TTS, make sure it's initialized
      if (available && preferences.ttsEnabled && !ttsInitialized) {
        // Try to initialize speech synthesis
        try {
          const testUtterance = new SpeechSynthesisUtterance("TTS Check");
          testUtterance.volume = 0.01;
          window.speechSynthesis.speak(testUtterance);
          window.speechSynthesis.cancel(); // Cancel immediately
          setTtsInitialized(true);
        } catch (e) {
          console.warn("TTS initialization check failed:", e);
        }
      }
    };
    
    checkTTS();
    
    // Re-check TTS availability after a short delay
    // This helps on some browsers that need time to initialize
    const timer = setTimeout(checkTTS, 1000);
    
    return () => clearTimeout(timer);
  },[preferences.ttsEnabled, ttsInitialized]);

  const handleToggleTTS=()=> {
    // If enabling TTS, check browser support first
    if (!preferences.ttsEnabled && ttsAvailable) {
      // Test TTS functionality
      const utterance=new SpeechSynthesisUtterance("Text to speech is now enabled");
      utterance.volume=0.5;
      utterance.rate=0.9;
      
      try {
        window.speechSynthesis.speak(utterance);
        setTtsInitialized(true);
      } catch (e) {
        console.warn("Failed to initialize TTS:", e);
      }
    }
    
    updatePreferences({ttsEnabled: !preferences.ttsEnabled});
  };

  const handleToggleTTSAutoplay=()=> {
    updatePreferences({ttsAutoplay: !preferences.ttsAutoplay});
  };

  const handleToggleDynamicDifficulty=()=> {
    updatePreferences({dynamicDifficulty: !preferences.dynamicDifficulty});
  };

  const handleQuestionSecondsChange=(seconds)=> {
    updatePreferences({questionSeconds: seconds});
  };

  const handleSessionMinutesChange=(minutes)=> {
    updatePreferences({sessionMinutes: minutes});
  };

  return (
    <motion.div
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{scale: 0.9,opacity: 0}}
        animate={{scale: 1,opacity: 1}}
        className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <SafeIcon icon={FiX} className="text-xl" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Text-to-Speech */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <SafeIcon icon={FiVolume2} className="text-primary-600" />
              <div>
                <h3 className="font-semibold text-gray-800">Text-to-Speech</h3>
                <p className="text-sm text-gray-600">
                  {ttsAvailable ? "Read questions aloud" : "Not supported in your browser"}
                </p>
              </div>
            </div>
            <button
              onClick={handleToggleTTS}
              disabled={!ttsAvailable}
              className={`w-12 h-6 rounded-full transition-colors ${
                preferences.ttsEnabled && ttsAvailable
                  ? 'bg-primary-500'
                  : !ttsAvailable
                  ? 'bg-gray-200 cursor-not-allowed'
                  : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  preferences.ttsEnabled && ttsAvailable
                    ? 'transform translate-x-6'
                    : 'transform translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* TTS Autoplay */}
          {preferences.ttsEnabled && ttsAvailable && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiPlay} className="text-primary-600" />
                <div>
                  <h3 className="font-semibold text-gray-800">Autoplay Speech</h3>
                  <p className="text-sm text-gray-600">
                    Automatically read questions when they appear
                  </p>
                </div>
              </div>
              <button
                onClick={handleToggleTTSAutoplay}
                className={`w-12 h-6 rounded-full transition-colors ${
                  preferences.ttsAutoplay ? 'bg-primary-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    preferences.ttsAutoplay
                      ? 'transform translate-x-6'
                      : 'transform translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          )}

          {/* Dynamic Difficulty */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <SafeIcon icon={FiTrendingUp} className="text-primary-600" />
              <div>
                <h3 className="font-semibold text-gray-800">Smart Difficulty</h3>
                <p className="text-sm text-gray-600">Adapt to your progress</p>
              </div>
            </div>
            <button
              onClick={handleToggleDynamicDifficulty}
              className={`w-12 h-6 rounded-full transition-colors ${
                preferences.dynamicDifficulty ? 'bg-primary-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  preferences.dynamicDifficulty
                    ? 'transform translate-x-6'
                    : 'transform translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Question Time */}
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <SafeIcon icon={FiClock} className="text-primary-600" />
              <div>
                <h3 className="font-semibold text-gray-800">Question Time</h3>
                <p className="text-sm text-gray-600">
                  {preferences.questionSeconds} seconds per question
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              {[30, 45, 60].map((seconds) => (
                <button
                  key={seconds}
                  onClick={() => handleQuestionSecondsChange(seconds)}
                  className={`flex-1 py-2 px-3 rounded-lg font-semibold transition-colors ${
                    preferences.questionSeconds === seconds
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {seconds}s
                </button>
              ))}
            </div>
          </div>

          {/* Session Duration */}
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <SafeIcon icon={FiClock} className="text-primary-600" />
              <div>
                <h3 className="font-semibold text-gray-800">Session Length</h3>
                <p className="text-sm text-gray-600">
                  {preferences.sessionMinutes} minutes per session
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              {[6, 8, 10].map((minutes) => (
                <button
                  key={minutes}
                  onClick={() => handleSessionMinutesChange(minutes)}
                  className={`flex-1 py-2 px-3 rounded-lg font-semibold transition-colors ${
                    preferences.sessionMinutes === minutes
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {minutes}m
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6">
  <label className="block text-sm font-medium mb-2">TTS Taal</label>
  <select
    className="w-full border rounded-xl p-3 bg-white"
    value={preferences.ttsLang || 'af-ZA'}
    onChange={handleLangChange}
  >
    <option value="af-ZA">Afrikaans (af-ZA)</option>
    <option value="en-GB">English (en-GB)</option>
    <option value="en-US">English (en-US)</option>
    <option value="auto">Outomaties</option>
  </select>
</div>

<div className="mt-8">
          <button
            onClick={onClose}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default PreferencesPanel;