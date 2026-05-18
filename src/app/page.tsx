import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/home/Hero';
import ContentCarousel from '@/components/home/ContentCarousel';
import { 
  getTrending, 
  getNewReleases,
  getTop10,
  getNetflixOriginals,
  getTopRated,
  getComedyMovies
} from '@/lib/tmdb';

export default async function Home() {
  const trending = await getTrending();
  const top10 = await getTop10();
  const originals = await getNetflixOriginals();
  const newReleasesList = await getNewReleases();
  const topRated = await getTopRated();
  const comedy = await getComedyMovies();
  
  const heroMovie = trending[0] || newReleasesList[0];

  return (
    <main className="min-h-screen bg-black overflow-hidden">
      <Navbar />
      {heroMovie && <Hero movie={heroMovie} />}
      
      <div className="relative z-30 -mt-24 sm:-mt-32 pb-20 space-y-10">
        <ContentCarousel title="Trending Now" items={trending} />
        {top10.length > 0 && <ContentCarousel title="Top 10 Movies Today" items={top10} isTop10={true} />}
        <ContentCarousel title="Only on Netflix" items={originals} />
        <ContentCarousel title="New Releases" items={newReleasesList} />
        <ContentCarousel title="Top Rated" items={topRated} />
        <ContentCarousel title="Comedy" items={comedy} />
      </div>
    </main>
  );
}
