import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MediaItem } from '@/constants/mockData';

const CONTINUE_WATCHING_KEY = '@lumora_continue_watching';

export function useContinueWatching() {
  const [continueWatchingList, setContinueWatchingList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadContinueWatching = async () => {
    try {
      const stored = await AsyncStorage.getItem(CONTINUE_WATCHING_KEY);
      if (stored) {
        setContinueWatchingList(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load continue watching list', e);
    } finally {
      setLoading(false);
    }
  };

  const saveToContinueWatching = async (item: MediaItem) => {
    try {
      const cleanItem: MediaItem = {
        id: item.id,
        title: item.title,
        type: item.type,
        poster_path: item.poster_path,
        backdrop_path: item.backdrop_path,
        release_date: item.release_date || '',
        vote_average: item.vote_average || 0,
        overview: item.overview || ''
      };
      
      const filtered = continueWatchingList.filter(w => w.id !== cleanItem.id);
      const updated = [cleanItem, ...filtered].slice(0, 10);
      setContinueWatchingList(updated);
      await AsyncStorage.setItem(CONTINUE_WATCHING_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save to continue watching list', e);
    }
  };

  const removeFromContinueWatching = async (id: number) => {
    try {
      const updated = continueWatchingList.filter(w => w.id !== id);
      setContinueWatchingList(updated);
      await AsyncStorage.setItem(CONTINUE_WATCHING_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to remove from continue watching list', e);
    }
  };

  useEffect(() => {
    loadContinueWatching();
  }, []);

  return {
    continueWatchingList,
    loading,
    saveToContinueWatching,
    removeFromContinueWatching,
    refreshContinueWatching: loadContinueWatching
  };
}
