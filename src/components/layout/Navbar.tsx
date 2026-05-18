"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Bell, User, X, LogOut, Settings, HelpCircle, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  
  const pathname = usePathname();
  const router = useRouter();
  
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
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'TV Shows', path: '/tv-shows' },
    { name: 'Movies', path: '/movies' },
    { name: 'New & Popular', path: '/new' },
    { name: 'My List', path: '/my-list' },
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
          <div className="flex items-center gap-4 sm:gap-6 relative">
            
            {/* Search Input Bar */}
            <div className="relative flex items-center">
              <AnimatePresence>
                {isSearchOpen && (
                  <motion.form
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 240, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    onSubmit={handleSearchSubmit}
                    className="absolute right-0 flex items-center bg-black/60 backdrop-blur-md border border-white/20 rounded-full py-1.5 px-3 overflow-hidden shadow-inner"
                  >
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Titles, people, genres..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent border-none outline-none text-white text-xs w-full mr-2 placeholder-gray-400 font-medium"
                    />
                    <button type="submit" className="text-white hover:text-gray-300 transition-colors">
                      <Search className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsSearchOpen(false)}
                      className="text-gray-400 hover:text-white ml-1.5 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.form>
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
