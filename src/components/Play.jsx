import React from 'react';
import {useNavigate} from 'react-router-dom';
import {motion,AnimatePresence} from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import {useProfileStore} from '../state/profileStore';
import {useGameSession} from '../hooks/useGameSession';
import TimerBar from './TimerBar';
import QuestionRenderer from './QuestionRenderer';
import FeedbackPanel from './FeedbackPanel';
import { speakWithLang, generateAudioBlob, playAudioBlob } from '../services/ttsService';

const {FiHome,FiVolume2,FiHelpCircle,FiX,FiRefreshCw}=FiIcons;

function Play() {
  const navigate=useNavigate();
  const {profile}=useProfileStore();
  const {
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
    endSession
  }=useGameSession();

  // Add state to track TTS button status and preloaded audio
  const [isSpeaking,setIsSpeaking]=React.useState(false);
  const [ttsAttempted,setTtsAttempted]=React.useState(false);
  const [preloadedAudio,setPreloadedAudio]=React.useState(null);
  const [isPreloading,setIsPreloading]=React.useState(false);
  const [audioReady,setAudioReady]=React.useState(false);

  React.useEffect(()=> {
    if (isSessionComplete) {
      navigate('/summary',{state: sessionStats});
    }
  },[isSessionComplete,navigate,sessionStats]);

  // Preload TTS audio when question changes
  React.useEffect(() => {
    const preloadAudio = async () => {
      if (!currentQuestion || !profile.preferences.ttsEnabled) return;
      
      setIsPreloading(true);
      setAudioReady(false);
      setPreloadedAudio(null);
      
      try {
        const lang = profile?.preferences?.ttsLang || 'af-ZA';
        
        // Preload main question audio
        const mainText = currentQuestion.ttsInstruction || currentQuestion.prompt;
        const mainAudio = await generateAudioBlob(mainText, lang);
        
        // Preload options audio if MCQ
        let optionsAudio = null;
        if (currentQuestion.type === 'mcq' && currentQuestion.options) {
          const optionsText = "Die opsies is: " + currentQuestion.options.join(". ");
          optionsAudio = await generateAudioBlob(optionsText, lang);
        }
        
        setPreloadedAudio({
          main: mainAudio,
          options: optionsAudio
        });
        setAudioReady(true);
        
        console.log('TTS: Audio preloaded successfully');
        
      } catch (error) {
        console.warn('TTS: Preloading failed', error);
        setAudioReady(false);
      } finally {
        setIsPreloading(false);
      }
    };
    
    if (currentQuestion) {
      preloadAudio();
    }
  }, [currentQuestion?.id, profile.preferences.ttsEnabled]);

  // Play preloaded audio
  const playPreloadedAudio = async () => {
    if (!preloadedAudio || isSpeaking) return;
    
    setIsSpeaking(true);
    try {
      // Play main audio
      await playAudioBlob(preloadedAudio.main);
      
      // Play options audio if available
      if (preloadedAudio.options) {
        await new Promise(r => setTimeout(r, 800)); // Pause between main and options
        await playAudioBlob(preloadedAudio.options);
      }
    } catch (error) {
      console.warn('TTS: Preloaded audio playback failed', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  // Fallback TTS function for when preloaded audio fails
  const fallbackTTS = async () => {
    const lang = profile?.preferences?.ttsLang || 'af-ZA';
    const textToSpeak = currentQuestion.ttsInstruction || currentQuestion.prompt;
    
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        console.log('Web Speech TTS Fallback:', {
          questionId: currentQuestion.id,
          hasTtsInstruction: !!currentQuestion.ttsInstruction,
          textToSpeak: textToSpeak.substring(0, 100) + (textToSpeak.length > 100 ? '...' : '')
        });
        
        const u = new SpeechSynthesisUtterance(textToSpeak);
        u.rate = 0.7; u.pitch = 1; u.lang = (lang === 'auto' ? 'af-ZA' : lang);
        u.onend = () => { if (currentQuestion.type !== 'mcq' || !currentQuestion.options) setIsSpeaking(false); };
        window.speechSynthesis.speak(u);
        
        if (currentQuestion.type === 'mcq' && currentQuestion.options) {
          setTimeout(() => {
            const t = "Die opsies is: " + currentQuestion.options.join(". ");
            const u2 = new SpeechSynthesisUtterance(t);
            u2.rate = 0.7; u2.lang = (lang === 'auto' ? 'af-ZA' : lang);
            u2.onend = () => setIsSpeaking(false);
            u2.onerror = () => setIsSpeaking(false);
            window.speechSynthesis.speak(u2);
          }, 1500);
        }
      } catch { setIsSpeaking(false); }
    } else { setIsSpeaking(false); }
  };

  // Main TTS handler
  const handleReadAloud = async () => {
    if (!profile.preferences.ttsEnabled || !currentQuestion || isSpeaking) return;
    
    // Try preloaded audio first
    if (audioReady && preloadedAudio) {
      console.log('TTS: Playing preloaded audio');
      await playPreloadedAudio();
    } else {
      console.log('TTS: Using fallback speech synthesis');
      setIsSpeaking(true);
      await fallbackTTS();
    }
  };

  // Replay function (doesn't require ttsAttempted check)
  const handleReplay = async () => {
    if (!profile.preferences.ttsEnabled || !currentQuestion || isSpeaking) return;
    
    if (audioReady && preloadedAudio) {
      console.log('TTS: Replaying preloaded audio');
      await playPreloadedAudio();
    } else {
      console.log('TTS: Replaying with fallback speech synthesis');
      setIsSpeaking(true);
      await fallbackTTS();
    }
  };

  // Auto-read the question when audio is ready
  React.useEffect(() => {
    // Reset the TTS attempted flag when question changes
    setTtsAttempted(false);
    setIsSpeaking(false);
    
    const timer = setTimeout(() => {
      if (
        currentQuestion && 
        profile.preferences.ttsEnabled && 
        profile.preferences.ttsAutoplay && 
        !showFeedback &&
        !ttsAttempted &&
        !isSpeaking &&
        (audioReady || !isPreloading) // Play when ready or preloading finished
      ) {
        setTtsAttempted(true);
        handleReadAloud();
      }
    }, 500);
    
    return () => {
      clearTimeout(timer);
    };
  }, [currentQuestion?.id, showFeedback, audioReady, isPreloading]);

  // Clean up speech synthesis when component unmounts
  React.useEffect(()=> {
    return ()=> {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  },[]);

  const handleEndSession=()=> {
    endSession();
    navigate('/summary',{state: sessionStats});
  };

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your quest...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={()=> navigate('/')}
          className="p-3 hover:bg-white/50 rounded-xl transition-colors"
        >
          <SafeIcon icon={FiHome} className="text-xl text-primary-700" />
        </button>
        <div className="text-center">
          <div className="text-sm text-primary-600 font-medium">
            {currentQuestion.subject} • {currentQuestion.topic}
          </div>
          <div className="text-xs text-gray-500">
            Question {sessionStats.totalQuestions + 1}
          </div>
        </div>
        <button
          onClick={handleEndSession}
          className="p-3 hover:bg-white/50 rounded-xl transition-colors"
        >
          <SafeIcon icon={FiX} className="text-xl text-gray-600" />
        </button>
      </div>

      {/* Timer */}
      <TimerBar
        timeLeft={timeLeft}
        totalTime={profile.preferences.questionSeconds}
        className="mb-6"
      />

      {/* Question Card */}
      <motion.div
        key={currentQuestion.id}
        initial={{x: 50,opacity: 0}}
        animate={{x: 0,opacity: 1}}
        exit={{x: -50,opacity: 0}}
        className="bg-white rounded-2xl shadow-lg p-8 mb-6"
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-4">
              <div
                className={`w-3 h-3 rounded-full ${
                  currentQuestion.difficulty===1
                    ? 'bg-success-500'
                    : currentQuestion.difficulty===2
                    ? 'bg-warning-500'
                    : 'bg-error-500'
                }`}
              />
              <span className="text-sm font-medium text-gray-600">
                {currentQuestion.difficulty===1
                  ? 'Easy'
                  : currentQuestion.difficulty===2
                  ? 'Medium'
                  : 'Hard'}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 leading-relaxed">
              {currentQuestion.prompt}
            </h2>
            {/* Audio loading indicator */}
            {isPreloading && (
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500 mr-2"></div>
                Preparing audio...
              </div>
            )}
            {audioReady && !isPreloading && (
              <div className="flex items-center mt-2 text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Audio ready
              </div>
            )}
          </div>
          <div className="flex space-x-2 ml-4">
            {profile.preferences.ttsEnabled && (
              <>
                {/* Main TTS Button */}
                <button
                  onClick={handleReadAloud}
                  className={`p-2 rounded-lg transition-colors ${
                    isSpeaking
                      ? 'bg-primary-100 text-primary-700'
                      : isPreloading
                      ? 'bg-gray-100 text-gray-400'
                      : 'hover:bg-gray-100 text-primary-600'
                  }`}
                  title={isPreloading ? 'Loading audio...' : 'Read aloud'}
                  disabled={isSpeaking || isPreloading}
                >
                  <SafeIcon
                    icon={FiVolume2}
                    className={isSpeaking ? 'animate-pulse' : isPreloading ? 'animate-spin' : ''}
                  />
                </button>
                
                {/* Replay Button - only show when audio has been played */}
                {ttsAttempted && (
                  <button
                    onClick={handleReplay}
                    className={`p-2 rounded-lg transition-colors ${
                      isSpeaking
                        ? 'bg-primary-100 text-primary-700'
                        : 'hover:bg-gray-100 text-primary-600'
                    }`}
                    title="Replay audio"
                    disabled={isSpeaking || isPreloading}
                  >
                    <SafeIcon
                      icon={FiRefreshCw}
                      className={isSpeaking ? 'animate-spin' : ''}
                    />
                  </button>
                )}
              </>
            )}
            {currentQuestion.hint && (
              <button
                onClick={toggleHint}
                className={`p-2 rounded-lg transition-colors ${
                  showHint
                    ? 'bg-warning-100 text-warning-700'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
                title="Show hint"
              >
                <SafeIcon icon={FiHelpCircle} />
              </button>
            )}
          </div>
        </div>

        {/* Hint */}
        <AnimatePresence>
          {showHint && currentQuestion.hint && (
            <motion.div
              initial={{height: 0,opacity: 0}}
              animate={{height: 'auto',opacity: 1}}
              exit={{height: 0,opacity: 0}}
              className="bg-warning-50 border border-warning-200 rounded-lg p-4 mb-6"
            >
              <div className="flex items-start space-x-2">
                <SafeIcon icon={FiHelpCircle} className="text-warning-600 mt-0.5" />
                <div>
                  <p className="text-warning-800 font-medium text-sm">Hint</p>
                  <p className="text-warning-700">{currentQuestion.hint}</p>
                  <p className="text-warning-600 text-xs mt-1">
                    Using hints reduces your reward by 30%
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Question Component */}
        <QuestionRenderer
          question={currentQuestion}
          onSubmit={submitAnswer}
          onSkip={skipQuestion}
          disabled={showFeedback}
        />
      </motion.div>

      {/* Feedback Panel */}
      <AnimatePresence>
        {showFeedback && feedbackData && (
          <FeedbackPanel
            feedbackData={feedbackData}
            onNext={nextQuestion}
            onEndSession={handleEndSession}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default Play;