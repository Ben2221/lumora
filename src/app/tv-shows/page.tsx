import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/home/Hero';
import ContentCarousel from '@/components/home/ContentCarousel';
import { 
  getNetflixOriginals, 
  getTrendingTV,
  getPopularTV,
  getComedyTV
} from '@/lib/tmdb';

export const metadata = {
  title: 'TV Shows - Lumora',
  description: 'Browse the best TV shows and original series streaming on Lumora.',
};

export default async function TVShowsPage() {
  const originals = await getNetflixOriginals();
  const trending = await getTrendingTV();
  const popular = await getPopularTV();
  const comedy = await getComedyTV();
  
  const featuredShow = originals[0] || trending[0];

  return (
    <main className="min-h-screen bg-black overflow-hidden pb-20">
      <Navbar />
      {featuredShow && <Hero movie={featuredShow} />}
      
      <div className="relative z-30 -mt-24 sm:-mt-32 space-y-10">
        <ContentCarousel title="Only on Lumora" items={originals} />
        <ContentCarousel title="Trending TV Shows" items={trending} />
        <ContentCarousel title="Popular Shows" items={popular} />
        <ContentCarousel title="Comedy Series" items={comedy} />
      </div>
    </main>
  );
}
