"use client";

import Image from 'next/image';

interface PromoBackgroundProps {
  backdropPath: string;
  title: string;
}

export default function PromoBackground({ backdropPath, title }: PromoBackgroundProps) {
  return (
    <div className="absolute inset-0 z-0 bg-[#0a0a0a]">
      {/* Static High-Res Backdrop Image */}
      <div className="absolute inset-0 z-10 w-full h-full pointer-events-none">
        <Image
          src={backdropPath}
          alt={title}
          fill
          priority
          className="object-cover opacity-35"
          sizes="100vw"
        />
      </div>

      {/* Cinematic Linear Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent z-20 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/30 to-transparent z-20 pointer-events-none" />
    </div>
  );
}
