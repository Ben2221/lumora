"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Smartphone, Download, ArrowRight, QrCode } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MobilePromo() {
  const [downloadUrl, setDownloadUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDownloadUrl(`${window.location.origin}/downloads/lumora.apk`);
    }
  }, []);

  const qrCodeUrl = downloadUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(downloadUrl)}&color=255-255-255&bgcolor=0a0a0a&qzone=1`
    : '';

  return (
    <section className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-30">
      <div className="relative bg-gradient-to-r from-zinc-900/60 to-black/80 border border-white/5 rounded-3xl p-8 sm:p-12 overflow-hidden shadow-2xl backdrop-blur-md">
        {/* Dynamic Glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#e50914]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Text and Actions */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase bg-[#e50914]/10 text-[#e50914] border border-[#e50914]/20 rounded-full tracking-wider">
              <Smartphone className="w-3.5 h-3.5" />
              Lumora Mobile
            </span>
            
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-display text-white leading-tight">
              Watch on your phone. <br />
              <span className="text-[#e50914]">Anytime, anywhere.</span>
            </h2>
            
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-xl">
              Get the official Lumora Android app. Stream movies and TV shows directly on your mobile device with native background playback, bookmarks, and fast loading.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <a
                href="/downloads/lumora.apk"
                download="lumora.apk"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#e50914] hover:bg-[#b80710] text-white px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base transition-all active:scale-95 shadow-lg shadow-[#e50914]/15 hover:shadow-[#e50914]/25"
              >
                <Download className="w-5 h-5" />
                Download APK
              </a>
              
              <Link
                href="/download"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-6 py-3.5 rounded-xl font-semibold text-sm sm:text-base border border-white/10 transition-all active:scale-95"
              >
                Setup Guide
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          
          {/* QR Code and Device Mockup */}
          <div className="lg:col-span-5 flex flex-col sm:flex-row items-center justify-center gap-8 lg:justify-end">
            {/* QR Card */}
            <div className="bg-black/60 border border-white/10 rounded-2xl p-5 flex flex-col items-center gap-3 shrink-0 shadow-xl backdrop-blur-xl">
              <div className="w-36 h-36 bg-black border border-white/5 rounded-lg p-2 flex items-center justify-center relative">
                {qrCodeUrl ? (
                  <img
                    src={qrCodeUrl}
                    alt="Scan to Download APK"
                    className="w-full h-full object-contain rounded"
                  />
                ) : (
                  <div className="w-5 h-5 border-2 border-[#e50914] border-t-transparent rounded-full animate-spin" />
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                <QrCode className="w-3.5 h-3.5 text-[#e50914]" />
                Scan to Download
              </div>
            </div>
            
            {/* Phone Mockup Screen */}
            <div className="relative w-44 h-80 bg-zinc-900 border-2 border-zinc-700 rounded-[24px] p-1.5 shadow-2xl flex flex-col justify-between shrink-0 overflow-hidden hidden sm:flex">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-3 bg-zinc-700 rounded-b-lg z-20 flex justify-center items-center">
                <div className="w-6 h-0.5 bg-zinc-600 rounded-full" />
              </div>
              
              <div className="w-full h-full bg-[#070707] rounded-[18px] overflow-hidden flex flex-col justify-between p-2 relative text-[8px]">
                {/* Logo and wifi */}
                <div className="flex justify-between items-center text-gray-500 pt-1">
                  <span>9:41</span>
                  <span className="text-[#e50914] font-black">LUMORA</span>
                  <span>5G</span>
                </div>
                
                {/* Image backdrop */}
                <div className="flex-1 my-2 rounded-md bg-cover bg-center relative overflow-hidden flex flex-col justify-end p-1.5 border border-white/5"
                  style={{ backgroundImage: `url('https://image.tmdb.org/t/p/w500/z8ArR4465gCj2RSJ19G7STUrCPE.jpg')` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  <div className="z-10 text-left">
                    <p className="font-extrabold text-white text-[9px] truncate">Interstellar</p>
                    <p className="text-[6px] text-green-400 font-bold">98% Match</p>
                  </div>
                </div>
                
                {/* Small player button */}
                <div className="bg-white/5 border border-white/10 rounded p-1 flex items-center justify-between text-[6px] text-gray-300">
                  <span className="truncate max-w-[80px]">Stranger Things 5</span>
                  <span className="text-[#e50914] font-bold">● LIVE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
