"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Bell, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ backgroundColor: 'rgba(0,0,0,0)' }}
      animate={{ backgroundColor: isScrolled ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0)' }}
      transition={{ duration: 0.3 }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'backdrop-blur-md shadow-lg shadow-black/50 border-b border-white/5' : ''
      }`}
    >
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo and Nav Links */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex-shrink-0">
              <span className="text-3xl font-bold tracking-tighter text-[#e50914]">
                LUMORA
              </span>
            </Link>
            <div className="hidden md:block">
              <div className="flex items-baseline space-x-6">
                <Link href="/" className="text-white hover:text-gray-300 px-3 py-2 text-sm font-medium transition-colors">
                  Home
                </Link>
                <Link href="/tv-shows" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors">
                  TV Shows
                </Link>
                <Link href="/movies" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors">
                  Movies
                </Link>
                <Link href="/new" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors">
                  New & Popular
                </Link>
                <Link href="/my-list" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors">
                  My List
                </Link>
              </div>
            </div>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button className="text-white hover:text-gray-300 transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="text-white hover:text-gray-300 transition-colors relative hidden sm:block">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-[#e50914] ring-2 ring-black"></span>
            </button>
            <button className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors">
              <div className="w-8 h-8 rounded bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center overflow-hidden border border-white/10">
                <User className="w-5 h-5 text-white/80" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
