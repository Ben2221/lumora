import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/home/Hero';
import ContentCarousel from '@/components/home/ContentCarousel';
import { 
  getNewReleases,
  getTrendingTV,
  getTrending,
  getTopRated
} from '@/lib/tmdb';

export const metadata = {
  title: 'New & Popular - Lumora',
  description: 'Discover the latest releases, trending shows, and top popular titles streaming right now.',
};

export default async function NewAndPopularPage() {
  const newReleases = await getNewReleases();
  const trendingTV = await getTrendingTV();
  const trendingAll = await getTrending();
  const topRated = await getTopRated();

  const featured = trendingAll[0] || newReleases[0];

  return (
    <main className="min-h-screen bg-black overflow-hidden pb-20">
      <Navbar />
      {featured && <Hero movie={featured} />}
      
      <div className="relative z-30 -mt-24 sm:-mt-32 space-y-10">
        <ContentCarousel title="New Releases" items={newReleases} />
        <ContentCarousel title="Trending Shows" items={trendingTV} />
        <ContentCarousel title="Trending Now" items={trendingAll} />
        <ContentCarousel title="Highly Rated" items={topRated} />
      </div>
    </main>
  );
}
