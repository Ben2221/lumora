import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/home/Hero';
import ContentCarousel from '@/components/home/ContentCarousel';
import ContinueWatchingRow from '@/components/home/ContinueWatchingRow';
import RecommendationsRow from '@/components/home/RecommendationsRow';
import MobilePromo from '@/components/home/MobilePromo';
import { 
  getTrending, 
  getNewReleases,
  getTop10,
  getNetflixOriginals,
  getTopRated,
  getComedyMovies,
  getActionMovies,
  getSciFiMovies,
  getDramaMovies,
  getMysteryAndThriller,
  getHorror,
  getRomance,
  getCrime,
  getFantasy,
  getKids,
  getOscarNominees
} from '@/lib/tmdb';

export default async function Home() {
  // Parallel fetch for peak loading performance
  const [
    trending,
    top10,
    originals,
    newReleasesList,
    topRated,
    comedy,
    action,
    scifi,
    drama,
    mystery,
    horror,
    romance,
    crime,
    fantasy,
    kids,
    oscar
  ] = await Promise.all([
    getTrending(),
    getTop10(),
    getNetflixOriginals(),
    getNewReleases(),
    getTopRated(),
    getComedyMovies(),
    getActionMovies(),
    getSciFiMovies(),
    getDramaMovies(),
    getMysteryAndThriller(),
    getHorror(),
    getRomance(),
    getCrime(),
    getFantasy(),
    getKids(),
    getOscarNominees()
  ]);
  
  const heroMovies = trending.slice(0, 5);

  return (
    <main className="min-h-screen bg-black overflow-hidden">
      <Navbar />
      {heroMovies.length > 0 && <Hero movies={heroMovies} />}
      
      <div className="relative z-30 -mt-24 sm:-mt-32 pb-20 space-y-10">
        {/* Dynamic Client rows */}
        <ContinueWatchingRow />
        
        <ContentCarousel title="Trending Now" items={trending} />
        {top10.length > 0 && <ContentCarousel title="Top 10 Movies Today" items={top10} isTop10={true} />}
        
        {/* Dynamic client Recommendations */}
        <RecommendationsRow />

        <ContentCarousel title="Featured on Lumora" items={originals} />
        <ContentCarousel title="New Releases" items={newReleasesList} />
        <ContentCarousel title="Sci-Fi & Fantasy" items={scifi} />
        <ContentCarousel title="Action Thrillers" items={action} />
        <ContentCarousel title="Mystery & Thriller" items={mystery} />
        <ContentCarousel title="Oscar Nominees" items={oscar} />
        <ContentCarousel title="Horror Hits" items={horror} />
        <ContentCarousel title="Romance" items={romance} />
        <ContentCarousel title="Crime & Drama" items={crime} />
        <ContentCarousel title="Fantasy Kingdoms" items={fantasy} />
        <ContentCarousel title="Kids & Family" items={kids} />
        <ContentCarousel title="Dramas" items={drama} />
        <ContentCarousel title="Top Rated" items={topRated} />
        <ContentCarousel title="Comedy Hits" items={comedy} />
        
        {/* Promo banner for downloading the APK */}
        <MobilePromo />
      </div>
    </main>
  );
}
