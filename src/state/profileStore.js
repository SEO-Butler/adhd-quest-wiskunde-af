import {create} from 'zustand';

const STORAGE_KEY='adhd_gamified_mvp_v1';

const defaultProfile={
  xp: 0,
  coins: 0,
  level: 1,
  stats: {},
  lastPlayedAt: Date.now(),
  preferences: {
    questionSeconds: 45,
    sessionMinutes: 8,
    ttsEnabled: true,
    ttsAutoplay: true,
    ttsLang: 'af-ZA',
    dynamicDifficulty: true,
  },
};

export const useProfileStore=create((set,get)=> ({
  profile: defaultProfile,

  initializeProfile: ()=> {
    try {
      const stored=localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const profile=JSON.parse(stored);
        
        // Ensure TTS settings are enabled by default for all users
        // even those with existing profiles
        const updatedPreferences = {
          ...defaultProfile.preferences,
          ...profile.preferences,
          ttsEnabled: profile.preferences?.ttsEnabled ?? true,
          ttsAutoplay: profile.preferences?.ttsAutoplay ?? true,
        };
        
        // Merge with defaults to handle new fields
        const mergedProfile={
          ...defaultProfile,
          ...profile,
          preferences: updatedPreferences,
        };
        
        set({profile: mergedProfile});
        
        // Immediately save the updated preferences to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedProfile));
      }
    } catch (error) {
      console.warn('Failed to load profile from localStorage:',error);
    }
  },

  saveProfile: (updates)=> {
    const currentProfile=get().profile;
    const newProfile={...currentProfile,...updates};

    // Update level based on XP
    const newLevel=Math.floor(newProfile.xp / 100) + 1;
    newProfile.level=newLevel;

    set({profile: newProfile});
    try {
      localStorage.setItem(STORAGE_KEY,JSON.stringify(newProfile));
    } catch (error) {
      console.warn('Failed to save profile to localStorage:',error);
    }
  },

  updatePreferences: (newPreferences)=> {
    const currentProfile=get().profile;
    const updatedProfile={
      ...currentProfile,
      preferences: {
        ...currentProfile.preferences,
        ...newPreferences,
      },
    };
    set({profile: updatedProfile});
    try {
      localStorage.setItem(STORAGE_KEY,JSON.stringify(updatedProfile));
    } catch (error) {
      console.warn('Failed to save preferences to localStorage:',error);
    }
  },

  updateCardStat: (questionId,correct,timeLeft,usedHint)=> {
    const currentProfile=get().profile;
    const currentStat=currentProfile.stats[questionId] || {
      ease: 2.5,
      intervalMin: 1,
      nextDue: Date.now(),
      correct: 0,
      wrong: 0,
    };

    let newStat;
    if (correct) {
      newStat={
        ...currentStat,
        ease: Math.min(3.0,currentStat.ease + 0.1),
        intervalMin: currentStat.intervalMin ? Math.ceil(currentStat.intervalMin * 2.5) : 1,
        correct: currentStat.correct + 1,
      };
    } else {
      newStat={
        ...currentStat,
        ease: Math.max(1.3,currentStat.ease - 0.2),
        intervalMin: 1,
        wrong: currentStat.wrong + 1,
      };
    }

    newStat.nextDue=Date.now() + (newStat.intervalMin * 60 * 1000);

    const updatedProfile={
      ...currentProfile,
      stats: {
        ...currentProfile.stats,
        [questionId]: newStat,
      },
    };

    set({profile: updatedProfile});
    try {
      localStorage.setItem(STORAGE_KEY,JSON.stringify(updatedProfile));
    } catch (error) {
      console.warn('Failed to save card stats to localStorage:',error);
    }
  },

  resetProfile: ()=> {
    set({profile: defaultProfile});
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear localStorage:',error);
    }
  },
}));