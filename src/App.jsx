import React from 'react';
import {HashRouter as Router,Routes,Route} from 'react-router-dom';
import {motion} from 'framer-motion';
import Home from './components/Home';
import Play from './components/Play';
import Summary from './components/Summary';
import ParentPortal from './components/ParentPortal';
import {useProfileStore} from './state/profileStore';
import {initDB} from './database/db';

function App() {
  const {initializeProfile}=useProfileStore();
  
  // Initialize profile and database on app load
  React.useEffect(()=> {
    const initializeApp = async () => {
      try {
        // Initialize profile
        initializeProfile();
        
        // Initialize database
        await initDB();
        console.log('Database initialized successfully');
        
        // Add debug functions to global scope for easy console access
        window.debugQuestions = async () => {
          const { getDB } = await import('./database/db.js');
          const db = getDB();
          const generated = await db.getAllGeneratedQuestions();
          const subjects = await db.getSubjects();
          const content = await db.getAllContent();
          
          console.log('=== QUESTION DATABASE DEBUG ===');
          console.log('Generated questions:', generated.length);
          console.log('Subjects:', subjects.length);
          console.log('Content items:', content.length);
          console.log('Generated questions:', generated);
          return { generated, subjects, content };
        };
        
        // Initialize speech synthesis more aggressively
        if ('speechSynthesis' in window) {
          // Create and store a global speech synthesis instance
          window.questSpeechSynth = window.speechSynthesis;
          
          // Force initialization with a silent utterance
          const initUtterance = new SpeechSynthesisUtterance('');
          initUtterance.volume = 0.01;
          initUtterance.rate = 1.0;
          initUtterance.pitch = 1.0;
          
          // Try to speak the silent utterance
          try {
            window.questSpeechSynth.speak(initUtterance);
            
            // Cancel after a short delay to clean up
            setTimeout(() => {
              window.questSpeechSynth.cancel();
            }, 100);
          } catch (e) {
            console.warn("Speech synthesis initialization failed:", e);
          }
        }

        // Initialize audio context for TTS
        try {
          if (window.AudioContext || window.webkitAudioContext) {
            // Create a tiny silent audio buffer to prime the audio system
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const buffer = audioContext.createBuffer(1, 1, 22050);
            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContext.destination);
            source.start(0);
            console.log('Audio context primed for TTS');
          }
        } catch (e) {
          console.warn("Audio context initialization failed:", e);
        }
      } catch (error) {
        console.error('App initialization failed:', error);
      }
    };
    
    initializeApp();
  },[initializeProfile]);

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
        <motion.div
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          transition={{duration: 0.5}}
          className="container mx-auto px-4 py-8"
        >
          <Routes>
            <Route path="/" element={
              <div className="max-w-4xl mx-auto">
                <Home />
              </div>
            } />
            <Route path="/play" element={
              <div className="max-w-4xl mx-auto">
                <Play />
              </div>
            } />
            <Route path="/summary" element={
              <div className="max-w-4xl mx-auto">
                <Summary />
              </div>
            } />
            <Route path="/parent" element={<ParentPortal />} />
          </Routes>
        </motion.div>
      </div>
    </Router>
  );
}

export default App;