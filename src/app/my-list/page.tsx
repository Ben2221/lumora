"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import MediaCard from '@/components/cards/MediaCard';
import { Plus, Flame, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { MediaItem } from '@/lib/mockData';

export default function MyListPage() {
  const [bookmarks, setBookmarks] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadList = () => {
    try {
      const list = JSON.parse(localStorage.getItem('lumora_mylist') || '[]');
      if (Array.isArray(list)) {
        setBookmarks(list);
      }
    } catch (e) {
      console.error('Failed to parse My List from localStorage', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'My List - Lumora';
    loadList();

    // Listen for custom events to refresh list in real time
    window.addEventListener('lumora_mylist_updated', loadList);
    return () => {
      window.removeEventListener('lumora_mylist_updated', loadList);
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#070707] text-white pb-20">
      <Navbar />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-28">
        
        {/* Header Block */}
        <div className="flex flex-col gap-2 mb-10 border-b border-white/5 pb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Plus className="w-8 h-8 text-[#e50914]" /> My List
          </h1>
          <p className="text-gray-400 text-sm">
            Saved movies and TV shows you've added to watch later.
          </p>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <Loader2 className="w-10 h-10 text-[#e50914] animate-spin mb-4" />
            <p className="text-gray-400 text-sm">Retrieving your list...</p>
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <Flame className="w-16 h-16 text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-300">Your list is empty</h3>
            <p className="text-gray-500 text-sm mt-2 max-w-sm">
              Explore the homepage or category pages and add your favorite titles to watch here!
            </p>
            <Link 
              href="/" 
              className="mt-6 px-6 py-2.5 bg-[#e50914] text-white hover:bg-[#b80710] text-xs font-black tracking-wider uppercase rounded transition-all"
            >
              Browse Home
            </Link>
          </div>
        ) : (
          <div className="flex flex-wrap gap-4 sm:gap-6 justify-center sm:justify-start">
            {bookmarks.map((item, index) => (
              <MediaCard key={`${item.id}-${index}`} item={item} />
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
