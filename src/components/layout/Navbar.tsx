"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Bell, User, X, LogOut, Settings, HelpCircle, Users, Loader2, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MediaItem } from '@/lib/mockData';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<MediaItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  
  const pathname = usePathname();
  const router = useRouter();
  
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on outside clicks
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setIsAccountOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard accessibility for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowDropdown(false);
        setIsSearchOpen(false);
        setIsSearchFocused(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounced search suggestions fetching
  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) {
      const clearTimer = setTimeout(() => {
        setSuggestions([]);
        setShowDropdown(false);
        setIsSearching(false);
      }, 0);
      return () => clearTimeout(clearTimer);
    }

    const startTimer = setTimeout(() => {
      setIsSearching(true);
      setShowDropdown(true);
    }, 0);

    const searchTimer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setSuggestions(data.slice(0, 3));
          } else {
            setSuggestions([]);
          }
        })
        .catch((err) => {
          console.error('Error fetching search suggestions:', err);
          setSuggestions([]);
        })
        .finally(() => {
          setIsSearching(false);
        });
    }, 300); // 300ms debounce for typing

    return () => {
      clearTimeout(startTimer);
      clearTimeout(searchTimer);
    };
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setShowDropdown(false);
      setSearchQuery('');
    }
  };

  const handleSeeAll = (e: React.MouseEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setShowDropdown(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'TV Shows', path: '/tv-shows' },
    { name: 'Movies', path: '/movies' },
    { name: 'New & Popular', path: '/new' },
    { name: 'My List', path: '/my-list' },
    { name: 'Mobile App', path: '/download' },
  ];

  const mockNotifications = [
    { id: 1, title: 'Stranger Things 5', message: 'New Season is now streaming globally.', time: '2h ago', read: false },
    { id: 2, title: 'Dune: Part Two', message: 'The sci-fi epic is now available on watchlists.', time: '1d ago', read: true },
    { id: 3, title: 'Top 10 Today', message: 'Spider-Man is the #1 trending title.', time: '3d ago', read: true },
  ];

  return (
    <motion.nav
      initial={{ backgroundColor: 'rgba(0,0,0,0)' }}
      animate={{ backgroundColor: isScrolled ? 'rgba(0,0,0,0.95)' : 'rgba(0,0,0,0)' }}
      transition={{ duration: 0.3 }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'backdrop-blur-md shadow-lg shadow-black/80 border-b border-white/5' : 'bg-gradient-to-b from-black/75 to-transparent'
      }`}
    >
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Left Side: Logo and Navigation Links */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex-shrink-0 transition-transform active:scale-95">
              <span className="text-3xl font-extrabold tracking-tighter text-[#e50914] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                LUMORA
              </span>
            </Link>
            <div className="hidden md:block">
              <div className="flex items-center space-x-2">
                {navLinks.map((link) => {
                  const isActive = pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      href={link.path}
                      className={`relative px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-md hover:text-white ${
                        isActive ? 'text-white' : 'text-gray-300'
                      }`}
                    >
                      {link.name}
                      {isActive && (
                        <motion.div
                          layoutId="activeNavIndicator"
                          className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#e50914] rounded-full"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Side: Interactive Search, Notifications, & Account */}
          <div className="flex items-center gap-3 sm:gap-5 relative">
            
            {/* Get App Icon/Button */}
            <Link
              href="/download"
              className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-xs font-bold text-white bg-white/5 hover:bg-[#e50914] border border-white/10 hover:border-[#e50914] rounded-full transition-all duration-300 backdrop-blur-md active:scale-95 shadow-[0_2px_10px_rgba(0,0,0,0.3)] group shrink-0"
              title="Download Android APK"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#e50914] group-hover:text-white transition-colors shrink-0" />
              <span className="hidden sm:inline">Get App</span>
            </Link>
            
            {/* Search Input Bar */}
            <div ref={searchRef} className="relative flex items-center">
              <AnimatePresence>
                {isSearchOpen && (
                  <motion.form
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 320, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    onSubmit={handleSearchSubmit}
                    className={`absolute right-0 flex items-center bg-black/80 backdrop-blur-xl border rounded-full py-2 px-4 transition-all duration-300 shadow-2xl ${
                      isSearchFocused 
                        ? 'border-[#e50914] ring-2 ring-[#e50914]/20 shadow-[0_0_15px_rgba(229,9,20,0.4)]' 
                        : 'border-white/10 hover:border-white/25'
                    }`}
                  >
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Titles, people, genres..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => setIsSearchFocused(false)}
                      className="bg-transparent border-none outline-none text-white text-xs w-full mr-2 placeholder-gray-400 font-medium"
                    />
                    <button type="submit" className="text-white hover:text-[#e50914] transition-colors">
                      <Search className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSearchOpen(false);
                        setIsSearchFocused(false);
                      }}
                      className="text-gray-400 hover:text-white ml-1.5 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Autocomplete Suggestions Dropdown */}
              <AnimatePresence>
                {isSearchOpen && showDropdown && searchQuery.trim().length >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-full mt-3 w-[320px] bg-black/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl overflow-hidden z-[110]"
                  >
                    {isSearching ? (
                      <div className="flex items-center justify-center p-6 gap-2">
                        <Loader2 className="w-4 h-4 text-[#e50914] animate-spin" />
                        <span className="text-xs text-gray-400">Searching...</span>
                      </div>
                    ) : suggestions.length === 0 ? (
                      <div className="p-4 text-center">
                        <p className="text-xs text-gray-500">No matches found for &quot;{searchQuery}&quot;</p>
                      </div>
                    ) : (
                      <>
                        <div className="p-2 border-b border-white/5 bg-white/5 text-left">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Top Results</span>
                        </div>
                        <div className="divide-y divide-white/5">
                          {suggestions.map((item) => (
                            <Link
                              key={item.id}
                              href={`/info/${item.type}/${item.id}`}
                              onClick={() => {
                                setShowDropdown(false);
                                setIsSearchOpen(false);
                                setSearchQuery('');
                              }}
                              className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors group cursor-pointer text-left"
                            >
                              <div className="relative w-10 h-14 bg-white/10 rounded overflow-hidden shrink-0">
                                <img
                                  src={item.poster_path}
                                  alt={item.title}
                                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-white truncate group-hover:text-[#e50914] transition-colors">
                                  {item.title}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[10px] text-gray-400">
                                    {item.release_date ? item.release_date.slice(0, 4) : 'N/A'}
                                  </span>
                                  <span className="text-[10px] px-1 py-0.2 bg-[#e50914] text-white rounded font-bold uppercase">
                                    {item.type}
                                  </span>
                                  {item.vote_average > 0 && (
                                    <span className="text-[10px] text-emerald-400 font-semibold">
                                      ★ {item.vote_average.toFixed(1)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                        <div className="p-2 border-t border-white/5 text-center bg-black/40">
                          <button
                            onClick={handleSeeAll}
                            className="text-[10px] font-bold text-[#e50914] hover:underline"
                          >
                            See all results for &quot;{searchQuery}&quot;
                          </button>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              
              {!isSearchOpen && (
                <button
                  onClick={() => {
                    setIsSearchOpen(true);
                    setTimeout(() => searchInputRef.current?.focus(), 150);
                  }}
                  className="text-white hover:text-[#e50914] hover:scale-105 active:scale-95 transition-all p-2"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Notifications Panel */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsAccountOpen(false);
                }}
                className="text-white hover:text-[#e50914] hover:scale-105 active:scale-95 transition-all p-2 relative"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-[#e50914] ring-2 ring-black" />
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    className="absolute right-0 mt-4 w-80 bg-black/90 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl p-4 overflow-hidden z-[100]"
                  >
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/5">
                      <h4 className="text-white text-sm font-semibold">Notifications</h4>
                      <span className="text-[10px] text-gray-400 bg-white/10 px-2 py-0.5 rounded-full font-medium">New Alerts</span>
                    </div>
                    <div className="space-y-3">
                      {mockNotifications.map((n) => (
                        <div key={n.id} className="group flex gap-2 items-start cursor-pointer hover:bg-white/5 p-2 rounded-md transition-colors">
                          <span className={`h-2 w-2 rounded-full shrink-0 mt-1.5 ${!n.read ? 'bg-[#e50914]' : 'bg-transparent'}`} />
                          <div className="flex-1">
                            <p className="text-white text-xs font-semibold group-hover:text-[#e50914] transition-colors">{n.title}</p>
                            <p className="text-gray-400 text-[11px] leading-snug">{n.message}</p>
                            <p className="text-gray-500 text-[9px] mt-1">{n.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Account Panel */}
            <div className="relative" ref={accountRef}>
              <button
                onClick={() => {
                  setIsAccountOpen(!isAccountOpen);
                  setIsNotificationsOpen(false);
                }}
                className="flex items-center gap-2 hover:scale-105 active:scale-95 transition-all p-1"
              >
                <div className="w-8 h-8 rounded bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center overflow-hidden border border-white/15">
                  <User className="w-5 h-5 text-white/90" />
                </div>
              </button>

              <AnimatePresence>
                {isAccountOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    className="absolute right-0 mt-4 w-56 bg-black/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl overflow-hidden z-[100]"
                  >
                    <div className="p-3 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-3">
                      <div className="w-6 h-6 rounded bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-[10px] text-white font-bold">
                        U
                      </div>
                      <span className="text-white text-xs font-semibold">Savvy User</span>
                    </div>
                    <div className="p-2 space-y-1">
                      <button className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/5 rounded transition-all">
                        <Users className="w-4 h-4 text-gray-400" />
                        Manage Profiles
                      </button>
                      <button className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/5 rounded transition-all">
                        <Settings className="w-4 h-4 text-gray-400" />
                        Account Settings
                      </button>
                      <button className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/5 rounded transition-all">
                        <HelpCircle className="w-4 h-4 text-gray-400" />
                        Help Center
                      </button>
                    </div>
                    <div className="p-2 border-t border-white/5">
                      <button className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs text-[#e50914] hover:bg-[#e50914]/10 rounded transition-all font-semibold">
                        <LogOut className="w-4 h-4" />
                        Sign Out of Lumora
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
