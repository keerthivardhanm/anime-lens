import localforage from 'localforage';

// Configure localforage
localforage.config({
  name: 'AnimeLens',
  storeName: 'anime_lens_store',
  description: 'Local storage for Anime Lens Ultimate',
});

export interface HistoryItem {
  id: string;
  anilistId: number;
  title: string;
  coverUrl: string;
  timestamp: string;
  tags: string[];
  synopsis: string;
  genres: string[];
}

export interface UserProfile {
  xp: number;
  level: number;
  currentStreak: number;
  lastScanTimestamp: string;
}

// History management
export const saveToHistory = async (item: HistoryItem) => {
  try {
    const history = await localforage.getItem<HistoryItem[]>('history') || [];
    history.unshift(item);
    
    // Keep only last 200 items
    const trimmedHistory = history.slice(0, 200);
    await localforage.setItem('history', trimmedHistory);
  } catch (error) {
    console.error('Failed to save to history:', error);
  }
};

export const getHistory = async (): Promise<HistoryItem[]> => {
  try {
    return await localforage.getItem<HistoryItem[]>('history') || [];
  } catch (error) {
    console.error('Failed to get history:', error);
    return [];
  }
};

// Profile management
export const updateProfile = async (updates: Partial<UserProfile>) => {
  try {
    const profile = await localforage.getItem<UserProfile>('profile') || {
      xp: 0,
      level: 1,
      currentStreak: 0,
      lastScanTimestamp: '',
    };

    const updatedProfile = { ...profile, ...updates };
    
    // Calculate level from XP
    updatedProfile.level = Math.floor(updatedProfile.xp / 100) + 1;

    await localforage.setItem('profile', updatedProfile);
    return updatedProfile;
  } catch (error) {
    console.error('Failed to update profile:', error);
    return null;
  }
};

export const getProfile = async (): Promise<UserProfile> => {
  try {
    return await localforage.getItem<UserProfile>('profile') || {
      xp: 0,
      level: 1,
      currentStreak: 0,
      lastScanTimestamp: '',
    };
  } catch (error) {
    console.error('Failed to get profile:', error);
    return {
      xp: 0,
      level: 1,
      currentStreak: 0,
      lastScanTimestamp: '',
    };
  }
};

// Add XP and check for level up
export const addXP = async (amount: number): Promise<{ leveledUp: boolean; newLevel: number }> => {
  const profile = await getProfile();
  const oldLevel = profile.level;
  
  await updateProfile({ xp: profile.xp + amount });
  
  const newProfile = await getProfile();
  const leveledUp = newProfile.level > oldLevel;
  
  return { leveledUp, newLevel: newProfile.level };
};
