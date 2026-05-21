"use client";

import { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SmartAppBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('/downloads/lumora.apk');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Set absolute URL if possible
    setDownloadUrl(`${window.location.origin}/downloads/lumora.apk`);

    // Check localStorage for dismissal
    const isDismissed = localStorage.getItem('apk-banner-dismissed');
    
    // Check url params for dev preview (?preview_banner=true)
    const searchParams = new URLSearchParams(window.location.search);
    const isPreview = searchParams.get('preview_banner') === 'true';

    // Check if Android device
    const userAgent = navigator.userAgent.toLowerCase();
    const isAndroid = /android/i.test(userAgent);

    // Show banner if (Android OR preview mode) AND not dismissed
    if ((isAndroid || isPreview) && !isDismissed) {
      // Delay slightly for premium feel
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('apk-banner-dismissed', 'true');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 25 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 bg-zinc-950/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl flex flex-col gap-3"
        >
          {/* Header block */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-tr from-[#e50914] to-red-600 rounded-xl flex items-center justify-center shadow-md shadow-[#e50914]/20 shrink-0">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-bold text-white tracking-wide">Lumora for Android</h4>
                <p className="text-[11px] text-gray-400 font-medium leading-normal">
                  Get the official APK for seamless background playback & fast streaming.
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors shrink-0"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-1">
            <a
              href={downloadUrl}
              download="lumora.apk"
              onClick={() => {
                // Track download or auto-close if desired
                localStorage.setItem('apk-banner-dismissed', 'true');
                setIsVisible(false);
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-[#e50914] hover:bg-[#b80710] text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all active:scale-95 shadow-md shadow-[#e50914]/10 hover:shadow-[#e50914]/20"
            >
              <Download className="w-4 h-4" />
              Download APK
            </a>
            <a
              href="/download"
              className="inline-flex items-center justify-center text-[11px] font-semibold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2.5 rounded-xl transition-all active:scale-95"
            >
              Setup Guide
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
