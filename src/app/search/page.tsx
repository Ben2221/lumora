"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import MediaCard from '@/components/cards/MediaCard';
import { Loader2, SearchX, Search } from 'lucide-react';
import { MediaItem } from '@/lib/mockData';

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    
    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setResults(Array.isArray(data) ? data : []);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error fetching search results:', err);
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [query]);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-28">
      {/* Search Header */}
      <div className="flex flex-col gap-2 mb-10 border-b border-white/5 pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Search className="w-7 h-7 text-[#e50914]" /> Search Results
        </h1>
        {query && (
          <p className="text-gray-400 text-sm">
            Showing matches for: <span className="text-white font-semibold">"{query}"</span>
          </p>
        )}
      </div>

      {/* Results Container */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="w-12 h-12 text-[#e50914] animate-spin mb-4" />
          <p className="text-gray-400 font-medium">Searching titles...</p>
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <SearchX className="w-16 h-16 text-gray-600 mb-4 animate-bounce" />
          <h3 className="text-xl font-bold text-gray-300">No results found</h3>
          <p className="text-gray-500 text-sm mt-2 max-w-sm">
            We couldn't find any matches for "{query}". Try checking the spelling or searching other keywords.
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-4 sm:gap-6 justify-center sm:justify-start">
          {results.map((item, index) => (
            <MediaCard key={`${item.id}-${index}`} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-[#070707] text-white pb-20">
      <Navbar />
      <Suspense fallback={
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-28 flex flex-col items-center justify-center py-32">
          <Loader2 className="w-12 h-12 text-[#e50914] animate-spin" />
        </div>
      }>
        <SearchResultsContent />
      </Suspense>
    </main>
  );
}
