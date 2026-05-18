"use client";

import { useEffect, useState } from 'react';
import ContentCarousel from './ContentCarousel';
import { MediaItem } from '@/lib/mockData';

export default function ContinueWatchingRow() {
  const [items, setItems] = useState<MediaItem[]>([]);

  useEffect(() => {
    try {
      const list = JSON.parse(localStorage.getItem('lumora_continue_watching') || '[]');
      if (Array.isArray(list) && list.length > 0) {
        setItems(list);
      }
    } catch (e) {
      console.error('Failed to read continue watching storage', e);
    }
  }, []);

  if (items.length === 0) return null;

  return <ContentCarousel title="Continue Watching" items={items} />;
}
