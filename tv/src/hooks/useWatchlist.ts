import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MediaItem } from '@/constants/mockData';

const WATCHLIST_KEY = '@lumora_watchlist';

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWatchlist = async () => {
    try {
      const stored = await AsyncStorage.getItem(WATCHLIST_KEY);
      if (stored) {
        setWatchlist(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load watchlist', e);
    } finally {
      setLoading(false);
    }
  };

  const addToWatchlist = async (item: MediaItem) => {
    try {
      const updated = [...watchlist.filter(w => w.id !== item.id), item];
      setWatchlist(updated);
      await AsyncStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to add to watchlist', e);
    }
  };

  const removeFromWatchlist = async (id: number) => {
    try {
      const updated = watchlist.filter(w => w.id !== id);
      setWatchlist(updated);
      await AsyncStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to remove from watchlist', e);
    }
  };

  const isInWatchlist = (id: number) => {
    return watchlist.some(w => w.id === id);
  };

  useEffect(() => {
    loadWatchlist();
  }, []);

  return {
    watchlist,
    loading,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    refreshWatchlist: loadWatchlist
  };
}
