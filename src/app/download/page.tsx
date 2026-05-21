"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Smartphone, Download, AlertTriangle, ArrowRight, CheckCircle2, ChevronDown, ChevronUp, RefreshCw, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DownloadPage() {
  const [downloadUrl, setDownloadUrl] = useState('');
  const [activeStep, setActiveStep] = useState<number | null>(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Build the absolute URL for direct APK downloading
      setDownloadUrl(`${window.location.origin}/downloads/lumora.apk`);
    }
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(downloadUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const steps = [
    {
      title: "1. Download the APK file",
      desc: "Tap the 'Download APK' button or scan the QR code with your mobile device. Your browser might display a warning saying the file could be harmful; select 'Download anyway' to proceed.",
      icon: <Download className="w-5 h-5 text-[#e50914]" />
    },
    {
      title: "2. Allow Installation from Unknown Sources",
      desc: "Because the app is not downloaded from the Google Play Store, Android requires permission. Go to Settings > Apps & Notifications > Special app access > Install unknown apps, select your browser (e.g. Chrome), and toggle 'Allow from this source' to ON.",
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" />
    },
    {
      title: "3. Open and Install",
      desc: "Open your notifications or find the downloaded 'lumora.apk' file in your device's Downloads folder. Tap the file and select 'Install'. Once complete, open Lumora and start streaming!",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />
    }
  ];

  const qrCodeUrl = downloadUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(downloadUrl)}&color=255-255-255&bgcolor=0a0a0a&qzone=2`
    : '';

  return (
    <main className="min-h-screen bg-[#070707] text-white overflow-x-hidden pb-20">
      <Navbar />

      {/* Hero Background Gradient */}
      <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-[#e50914]/15 to-transparent pointer-events-none z-0" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-40">

        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex p-3 rounded-full bg-white/5 border border-white/10 mb-4 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
          >
            <Smartphone className="w-8 h-8 text-[#e50914]" />
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight font-display mb-4"
          >
            Lumora on Your <span className="text-[#e50914]">Phone</span>
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-xl text-gray-400 font-medium"
          >
            Take your premium cinema experience on the go. Stream your favorite movies, TV shows, and anime anywhere, anytime.
          </motion.p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* Left Column: Download Card & QR Code Card */}
          <div className="space-y-6">
            {/* Download Card */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white/[0.02] border border-white/5 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col gap-6"
            >
              {/* Glowing background accent */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#e50914]/5 rounded-full blur-3xl pointer-events-none" />

              <div>
                <span className="px-2.5 py-1 text-[11px] font-bold uppercase bg-[#e50914]/10 text-[#e50914] border border-[#e50914]/20 rounded-full tracking-wider">
                  Android Client (APK)
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white mt-4 mb-1 font-display">
                  Version 1.0.0 (Release)
                </h3>
                <p className="text-xs text-gray-400 font-medium">
                  Compiled for ARM64-v8a devices running Android 7.0 and higher. Full media streaming support enabled.
                </p>
              </div>

              {/* Technical Specifications Grid */}
              <div className="grid grid-cols-2 gap-4 border-t border-b border-white/5 py-4 my-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">File Size</span>
                  <p className="text-sm font-semibold text-gray-200 mt-0.5">24.8 MB</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Architecture</span>
                  <p className="text-sm font-semibold text-gray-200 mt-0.5">arm64-v8a</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Minimum OS</span>
                  <p className="text-sm font-semibold text-gray-200 mt-0.5">Android 7.0+</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Last Updated</span>
                  <p className="text-sm font-semibold text-gray-200 mt-0.5">May 21, 2026</p>
                </div>
              </div>

              <div className="space-y-4">
                <a
                  href="/downloads/lumora.apk"
                  download="lumora.apk"
                  className="w-full inline-flex items-center justify-center gap-3 bg-[#e50914] hover:bg-[#b80710] text-white px-6 py-4 rounded-xl font-bold text-base transition-all active:scale-98 shadow-lg shadow-[#e50914]/15 hover:shadow-[#e50914]/25"
                >
                  <Download className="w-5 h-5" />
                  Download APK File
                </a>

                {/* Share Link Info */}
                <div className="bg-black/40 border border-white/5 rounded-lg p-2.5 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-gray-400 font-mono truncate select-all flex-1 text-left px-1">
                    {downloadUrl || 'Loading download url...'}
                  </span>
                  <button
                    onClick={copyToClipboard}
                    className="shrink-0 text-xs font-bold text-[#e50914] hover:text-white transition-colors px-2.5 py-1 hover:bg-white/5 rounded"
                  >
                    {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
              </div>
            </motion.div>

            {/* QR Code Card */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row bg-white/[0.01] border border-white/5 backdrop-blur-md rounded-2xl p-6 items-center gap-6 shadow-xl relative overflow-hidden"
            >
              {/* QR Code container */}
              <div className="shrink-0 relative w-36 h-36 bg-black border border-white/10 rounded-xl p-2.5 flex items-center justify-center shadow-inner group">
                {qrCodeUrl ? (
                  <img
                    src={qrCodeUrl}
                    alt="Scan QR Code to Download APK"
                    className="w-full h-full object-contain rounded"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-gray-500">
                    <RefreshCw className="w-6 h-6 animate-spin" />
                  </div>
                )}
              </div>

              {/* QR Info text */}
              <div className="flex-1 text-center sm:text-left space-y-2">
                <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-[#e50914] font-bold uppercase tracking-wider">
                  <QrCode className="w-4 h-4" />
                  Scan to Install
                </div>
                <h4 className="text-sm font-bold text-white">Installing on another device?</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Point another mobile device camera at the QR code to start the APK download instantly. Perfect for sharing with friends nearby.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Instructions Accordion */}
          <motion.div
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-bold font-display">Installation Guide</h2>
              <span className="text-[11px] font-semibold text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">Easy Steps</span>
            </div>

            <div className="space-y-3">
              {steps.map((step, index) => {
                const isOpen = activeStep === index;
                return (
                  <div
                    key={index}
                    className={`border rounded-xl transition-all duration-300 overflow-hidden ${isOpen
                      ? 'bg-white/[0.04] border-white/15 shadow-lg'
                      : 'bg-white/[0.01] border-white/5 hover:bg-white/[0.02]'
                      }`}
                  >
                    <button
                      onClick={() => setActiveStep(isOpen ? null : index)}
                      className="w-full flex items-center justify-between p-4 sm:p-5 text-left cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3.5">
                        <span className="p-2 bg-white/5 rounded-lg border border-white/10 shrink-0">
                          {step.icon}
                        </span>
                        <span className="text-sm sm:text-base font-bold text-white tracking-wide">
                          {step.title}
                        </span>
                      </div>
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-gray-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                      )}
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                        >
                          <div className="px-5 pb-5 pt-1 text-sm text-gray-300 leading-relaxed border-t border-white/5 bg-black/10">
                            {step.desc}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Note about APK files */}
            <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 sm:p-5 flex gap-3 mt-6">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">
                  Why isn&apos;t this on the Google Play Store?
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Lumora is an independent, custom client for movies and TV shows streaming. Android applications downloaded directly via APK files allow developers to offer direct installations bypassing Play Store restrictions. This download is safe, verified, and direct from our servers.
                </p>
              </div>
            </div>

          </motion.div>
        </div>

        {/* Extra: App Screenshots / Promo Mockup */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-20 border border-white/5 bg-gradient-to-r from-white/[0.01] to-white/[0.02] rounded-2xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden shadow-2xl relative"
        >
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-[#e50914]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex-1 max-w-lg text-center md:text-left z-10">
            <h2 className="text-2xl sm:text-4xl font-bold font-display text-white mb-4">
              Stream on mobile like never before
            </h2>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-6">
              The Lumora mobile client features native video player controls, background picture-in-picture (PiP) support, dark-theme UI optimization, movie bookmarking, and offline details page exploration.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="flex items-center gap-2 bg-white/5 border border-white/15 px-4 py-2 rounded-lg text-xs font-semibold text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Adaptive Streaming
              </div>
              <div className="flex items-center gap-2 bg-white/5 border border-white/15 px-4 py-2 rounded-lg text-xs font-semibold text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                PiP Support
              </div>
            </div>
          </div>

          {/* Interactive mockup */}
          <div className="relative w-full max-w-[280px] h-[400px] bg-[#121212] border-4 border-gray-800 rounded-[30px] p-2.5 shadow-2xl shadow-black/80 flex flex-col justify-between shrink-0 overflow-hidden group">
            {/* Phone speaker/camera notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-4 bg-gray-800 rounded-b-xl z-20 flex justify-center items-center">
              <div className="w-12 h-1 bg-gray-700 rounded-full" />
            </div>

            {/* Mock Screen Content */}
            <div className="w-full h-full bg-[#070707] rounded-[22px] overflow-hidden flex flex-col justify-between p-3 relative select-none">
              {/* Top Bar */}
              <div className="flex justify-between items-center text-[10px] text-gray-500 pt-2 font-mono">
                <span>9:41</span>
                <span className="text-[#e50914] font-black tracking-tighter">LUMORA</span>
                <div className="flex items-center gap-1">
                  <span>5G</span>
                  <div className="w-3.5 h-2 bg-emerald-500 rounded-xs" />
                </div>
              </div>

              {/* Mock Movie Card Cover */}
              <div className="flex-1 my-3 rounded-lg bg-cover bg-center border border-white/5 shadow-inner relative flex flex-col justify-end p-2.5 overflow-hidden"
                style={{ backgroundImage: `url('https://image.tmdb.org/t/p/w500/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg')` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
                <div className="z-10">
                  <span className="text-[7px] font-bold uppercase tracking-wider text-green-400 bg-black/50 px-1 py-0.2 rounded">
                    Trending
                  </span>
                  <h4 className="text-[11px] font-bold text-white leading-tight mt-1 truncate">
                    Interstellar
                  </h4>
                  <p className="text-[7px] text-gray-300 line-clamp-2 mt-0.5">
                    The adventures of a group of explorers who make use of a newly discovered wormhole...
                  </p>
                </div>
              </div>

              {/* Mock Player Control Button */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-[#e50914]/20 flex items-center justify-center text-[9px] text-[#e50914] font-bold">
                    ▶
                  </div>
                  <div className="text-left">
                    <p className="text-[8px] font-bold text-white">Stranger Things 5</p>
                    <p className="text-[6px] text-gray-400">S5:E1 • 15m remaining</p>
                  </div>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#e50914] animate-pulse" />
              </div>

              {/* Bottom Nav Bar */}
              <div className="flex justify-around items-center pt-2 border-t border-white/5 text-[9px] font-bold text-gray-500">
                <span className="text-[#e50914]">Home</span>
                <span>Search</span>
                <span>Downloads</span>
                <span>Profile</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
