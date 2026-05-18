import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/home/Hero';
import ContentCarousel from '@/components/home/ContentCarousel';
import { 
  getTrending, 
  getNewReleases,
  getActionMovies,
  getSciFiMovies,
  getTopRated,
  getComedyMovies
} from '@/lib/tmdb';

export const metadata = {
  title: 'Movies - Lumora',
  description: 'Stream popular blockbusters, action thrillers, comedies, and award-winning movies.',
};

export default async function MoviesPage() {
  const trending = await getTrending();
  const newReleases = await getNewReleases();
  const action = await getActionMovies();
  const scifi = await getSciFiMovies();
  const topRated = await getTopRated();
  const comedy = await getComedyMovies();
  
  // Filter only movie types from trending for the hero
  const moviesOnly = trending.filter(m => m.type === 'movie');
  const featuredMovie = moviesOnly[0] || newReleases[0];

  return (
    <main className="min-h-screen bg-black overflow-hidden pb-20">
      <Navbar />
      {featuredMovie && <Hero movie={featuredMovie} />}
      
      <div className="relative z-30 -mt-24 sm:-mt-32 space-y-10">
        <ContentCarousel title="Trending Movies" items={trending} />
        <ContentCarousel title="New Releases" items={newReleases} />
        <ContentCarousel title="Action Thrillers" items={action} />
        <ContentCarousel title="Sci-Fi & Fantasy" items={scifi} />
        <ContentCarousel title="Top Rated" items={topRated} />
        <ContentCarousel title="Comedy Hits" items={comedy} />
      </div>
    </main>
  );
}
