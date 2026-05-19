"use client";

import { useEffect, useState } from 'react';
import ContentCarousel from './ContentCarousel';
import { MediaItem } from '@/lib/mockData';

export default function RecommendationsRow() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        let queryParams = '';
        
        // Read client storage safely inside mount effect
        const continueWatching = JSON.parse(localStorage.getItem('lumora_continue_watching') || '[]');
        const myList = JSON.parse(localStorage.getItem('lumora_mylist') || '[]');

        if (continueWatching.length > 0) {
          const item = continueWatching[0];
          queryParams = `?id=${item.id}&type=${item.type}`;
        } else if (myList.length > 0) {
          const item = myList[0];
          queryParams = `?id=${item.id}&type=${item.type}`;
        }

        const res = await fetch(`/api/recommendations${queryParams}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setItems(data);
          }
        }
      } catch (e) {
        console.error('Failed to load dynamic recommendations:', e);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecommendations();
  }, []);

  if (isLoading || items.length === 0) return null;

  return <ContentCarousel title="Movies We Think You'll Like" items={items} />;
}
