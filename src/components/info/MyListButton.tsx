"use client";

import { useState, useEffect } from 'react';
import { Plus, Check, Loader2 } from 'lucide-react';
import { MediaItem } from '@/lib/mockData';

interface MyListButtonProps {
  item: MediaItem;
}

export default function MyListButton({ item }: MyListButtonProps) {
  const [isAdded, setIsAdded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    // Defer state setter calls to next tick to avoid synchronous setState inside useEffect lint error
    const timer = setTimeout(() => {
      if (!active) return;
      try {
        const list = JSON.parse(localStorage.getItem('lumora_mylist') || '[]');
        if (Array.isArray(list)) {
          const found = list.some((i: MediaItem) => i.id === item.id);
          setIsAdded(found);
        }
      } catch (e) {
        console.error('Failed to parse My List from localStorage', e);
      } finally {
        setIsLoading(false);
      }
    }, 0);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [item.id]);

  const handleToggle = () => {
    try {
      const list = JSON.parse(localStorage.getItem('lumora_mylist') || '[]');
      if (!Array.isArray(list)) return;

      let updatedList;
      if (isAdded) {
        updatedList = list.filter((i: MediaItem) => i.id !== item.id);
        setIsAdded(false);
      } else {
        updatedList = [...list, item];
        setIsAdded(true);
      }

      localStorage.setItem('lumora_mylist', JSON.stringify(updatedList));
      // Dispatch a custom event to notify any other active components (e.g. My List page)
      window.dispatchEvent(new Event('lumora_mylist_updated'));
    } catch (e) {
      console.error('Failed to update My List in localStorage', e);
    }
  };

  if (isLoading) {
    return (
      <button
        disabled
        className="flex items-center justify-center gap-2.5 px-6 py-3.5 bg-white/10 text-gray-400 border border-white/15 text-sm font-bold rounded-md cursor-not-allowed select-none"
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading...
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm font-bold rounded-md hover:scale-105 active:scale-95 transition-all shadow-md backdrop-blur-md border ${
        isAdded
          ? "bg-white/20 hover:bg-white/30 text-[#e50914] border-[#e50914]/40 hover:border-[#e50914]/60"
          : "bg-white/10 hover:bg-white/20 text-white border-white/15 hover:border-white/30"
      }`}
    >
      {isAdded ? (
        <>
          <Check className="w-4 h-4 text-[#e50914] stroke-[3px]" />
          Added to List
        </>
      ) : (
        <>
          <Plus className="w-4 h-4" />
          My List
        </>
      )}
    </button>
  );
}
