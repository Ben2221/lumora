"use client";

import { useEffect, useState } from 'react';
import ContentCarousel from './ContentCarousel';
import { MediaItem } from '@/lib/mockData';

export default function RecommendationsRow() {
  const [items, setItems] = useState<MediaItem[]>([]);

  useEffect(() => {
    const defaultRecommendations: MediaItem[] = [
      {
        id: 157336,
        title: "Interstellar",
        overview: "Explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
        poster_path: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
        backdrop_path: "https://image.tmdb.org/t/p/original/pbrkL804c8yAv3zBZR4QPEafpAR.jpg",
        release_date: "2014-11-05",
        vote_average: 8.4,
        type: 'movie'
      },
      {
        id: 27205,
        title: "Inception",
        overview: "A thief who steals corporate secrets through dream-sharing technology.",
        poster_path: "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
        backdrop_path: "https://image.tmdb.org/t/p/original/s3TBrRGB1invgHHzsgaFS1B31ls.jpg",
        release_date: "2010-07-15",
        vote_average: 8.3,
        type: 'movie'
      },
      {
        id: 693134,
        title: "Dune: Part Two",
        overview: "Paul Atreides unites with Chani and the Fremen while on a warpath of revenge.",
        poster_path: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
        backdrop_path: "https://image.tmdb.org/t/p/original/8rpDcsfLJypbO6vtec042ptef8O.jpg",
        release_date: "2024-02-27",
        vote_average: 8.3,
        type: 'movie'
      },
      {
        id: 155,
        title: "The Dark Knight",
        overview: "Batman raises the stakes in his war on crime.",
        poster_path: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
        backdrop_path: "https://image.tmdb.org/t/p/original/nMKdUUepR0i5vn0yKzLdvcO33j.jpg",
        release_date: "2008-07-14",
        vote_average: 8.5,
        type: 'movie'
      }
    ];

    setItems(defaultRecommendations);
  }, []);

  if (items.length === 0) return null;

  return <ContentCarousel title="Movies We Think You'll Like" items={items} />;
}
