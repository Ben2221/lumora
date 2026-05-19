import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions, 
  Platform 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Play, Info, Plus, Check } from 'lucide-react-native';
import { 
  trendingMovies, 
  newReleases, 
  mockTVShows, 
  MediaItem,
  lumoraOriginals,
  topRatedMovies,
  comedyMovies
} from '@/constants/mockData';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useContinueWatching } from '@/hooks/useContinueWatching';
import { API_BASE_URL } from '@/constants/api';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { TabBar } from '@/components/TabBar';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();

  const [activeFilter, setActiveFilter] = useState<'all' | 'movies' | 'tv'>('all');
  const { continueWatchingList } = useContinueWatching();

  const [lists, setLists] = useState<{
    trending: MediaItem[];
    originals: MediaItem[];
    blockbusters: MediaItem[];
    comedies: MediaItem[];
  }>({
    trending: trendingMovies,
    originals: lumoraOriginals,
    blockbusters: topRatedMovies,
    comedies: comedyMovies,
  });

  useEffect(() => {
    let active = true;
    const fetchLists = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/media/lists`);
        if (!res.ok) throw new Error('HTTP Error: ' + res.status);
        const json = await res.json();
        if (active && json) {
          setLists({
            trending: json.trending && json.trending.length > 0 ? json.trending : trendingMovies,
            originals: json.originals && json.originals.length > 0 ? json.originals : lumoraOriginals,
            blockbusters: json.blockbusters && json.blockbusters.length > 0 ? json.blockbusters : topRatedMovies,
            comedies: json.comedies && json.comedies.length > 0 ? json.comedies : comedyMovies,
          });
        }
      } catch (err) {
        console.warn('[Home] Failed to fetch fresh TMDB media lists, using offline cache:', err);
      }
    };

    fetchLists();
    return () => {
      active = false;
    };
  }, []);

  // Featured Hero Item (Interstellar or Squid Game depending on filter)
  const heroItem: MediaItem = activeFilter === 'tv'
    ? (lists.originals.length > 0 ? lists.originals[0] : mockTVShows[0])
    : (lists.trending.length > 0 ? lists.trending[0] : trendingMovies[0]);

  const handleMediaPress = (item: MediaItem) => {
    router.push({
      pathname: '/info/[type]/[id]',
      params: { type: item.type, id: item.id.toString() }
    });
  };

  const isHeroBookmarked = isInWatchlist(heroItem.id);

  const handleToggleHeroWatchlist = () => {
    if (isHeroBookmarked) {
      removeFromWatchlist(heroItem.id);
    } else {
      addToWatchlist(heroItem);
    }
  };

  const renderMediaRow = (title: string, data: MediaItem[]) => {
    // Filter rows based on top-level filter tabs
    const filteredData = data.filter(item => {
      if (activeFilter === 'movies') return item.type === 'movie';
      if (activeFilter === 'tv') return item.type === 'tv';
      return true;
    });

    if (filteredData.length === 0) return null;

    return (
      <View style={styles.rowContainer}>
        <Text style={styles.rowTitle}>{title}</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rowScroll}
        >
          {filteredData.map((item) => (
            <TouchableOpacity 
              key={item.id}
              activeOpacity={0.8}
              onPress={() => handleMediaPress(item)}
              style={styles.cardContainer}
            >
              <Image 
                source={{ uri: item.poster_path }} 
                style={styles.cardImage}
                contentFit="cover"
              />
              {item.type === 'tv' && (
                <View style={styles.cardBadge}>
                  <Text style={styles.cardBadgeText}>SERIES</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Header Filter Navigation */}
      <View style={[styles.header, { paddingTop: safeAreaInsets.top > 0 ? safeAreaInsets.top + 12 : 40 }]}>
        <Text style={styles.logoText}>LUMORA</Text>
        
        <View style={styles.filterRow}>
          <TouchableOpacity 
            onPress={() => setActiveFilter('all')}
            style={[styles.filterButton, activeFilter === 'all' && styles.filterButtonActive]}
          >
            <Text style={[styles.filterButtonText, activeFilter === 'all' && styles.filterButtonTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveFilter('movies')}
            style={[styles.filterButton, activeFilter === 'movies' && styles.filterButtonActive]}
          >
            <Text style={[styles.filterButtonText, activeFilter === 'movies' && styles.filterButtonTextActive]}>
              Movies
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveFilter('tv')}
            style={[styles.filterButton, activeFilter === 'tv' && styles.filterButtonActive]}
          >
            <Text style={[styles.filterButtonText, activeFilter === 'tv' && styles.filterButtonTextActive]}>
              TV Shows
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Hero Banner Component */}
        <View style={styles.heroContainer}>
          <Image 
            source={{ uri: heroItem.backdrop_path }} 
            style={styles.heroImage}
            contentFit="cover"
          />
          <View style={styles.heroOverlay} />
          
          <View style={styles.heroInfoWrapper}>
            <Text style={styles.heroTitle} numberOfLines={2}>
              {heroItem.title}
            </Text>
            
            <View style={styles.heroMeta}>
              <Text style={styles.heroMetaMatch}>98% Match</Text>
              <Text style={styles.heroMetaText}>{heroItem.release_date.slice(0, 4)}</Text>
              <Text style={styles.heroMetaText}>
                {heroItem.type === 'tv' ? 'TV-MA' : 'PG-13'}
              </Text>
            </View>

            {/* Play / List trigger actions */}
            <View style={styles.heroActionsRow}>
              <TouchableOpacity 
                activeOpacity={0.8}
                onPress={handleToggleHeroWatchlist}
                style={styles.heroActionBtn}
              >
                {isHeroBookmarked ? (
                  <Check color="#e50914" size={20} strokeWidth={3} />
                ) : (
                  <Plus color="#fff" size={20} />
                )}
                <Text style={[styles.heroActionText, isHeroBookmarked && { color: '#e50914' }]}>
                  My List
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                activeOpacity={0.9}
                onPress={() => {
                  const playUrl = heroItem.type === 'tv'
                    ? { pathname: '/watch/[type]/[id]', params: { type: heroItem.type, id: heroItem.id.toString(), season: '1', episode: '1' } }
                    : { pathname: '/watch/[type]/[id]', params: { type: heroItem.type, id: heroItem.id.toString() } };
                  router.push(playUrl as any);
                }}
                style={styles.heroPlayBtn}
              >
                <Play color="#000" size={20} fill="#000" />
                <Text style={styles.heroPlayBtnText}>Play</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                activeOpacity={0.8}
                onPress={() => handleMediaPress(heroItem)}
                style={styles.heroActionBtn}
              >
                <Info color="#fff" size={20} />
                <Text style={styles.heroActionText}>Info</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Carousel Rows */}
        {continueWatchingList.length > 0 && renderMediaRow("Continue Watching", continueWatchingList)}
        {activeFilter !== 'movies' && renderMediaRow("Only on Lumora", lists.originals)}
        {renderMediaRow("Trending Now", lists.trending)}
        {activeFilter !== 'tv' && renderMediaRow("Blockbuster Movies", lists.blockbusters)}
        {renderMediaRow("Popular Comedies", lists.comedies)}
      </ScrollView>
      <TabBar activeTab="home" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.two,
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderBottomWidth: 1,
    borderBottomColor: '#111',
    zIndex: 10,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#e50914',
    letterSpacing: 1.5,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
  filterButton: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#161616',
    borderWidth: 1,
    borderColor: '#252525',
  },
  filterButtonActive: {
    backgroundColor: '#e50914',
    borderColor: '#e50914',
  },
  filterButtonText: {
    color: '#aaa',
    fontSize: 12,
    fontWeight: 'bold',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroContainer: {
    width: '100%',
    height: width * 1.1, // Poster profile vertical banner height
    backgroundColor: '#000',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    // Netflix-style fade from bottom
    // RN background gradients require external dependencies; standard color tints look great
  },
  heroInfoWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.five,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginBottom: Spacing.one,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginBottom: Spacing.three,
  },
  heroMetaMatch: {
    color: '#46d369',
    fontWeight: 'bold',
    fontSize: 13,
  },
  heroMetaText: {
    color: '#B0B4BA',
    fontSize: 13,
    fontWeight: '500',
  },
  heroActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.five,
    width: '100%',
    marginTop: Spacing.two,
  },
  heroPlayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: Spacing.two + 2,
    paddingHorizontal: Spacing.five,
    borderRadius: 6,
    gap: 8,
    flexGrow: 0.5,
  },
  heroPlayBtnText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 16,
  },
  heroActionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minWidth: 60,
  },
  heroActionText: {
    color: '#B0B4BA',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2,
  },
  rowContainer: {
    marginTop: Spacing.four,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#fff',
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.two,
  },
  rowScroll: {
    paddingLeft: Spacing.four,
    paddingRight: Spacing.four,
    gap: Spacing.two,
  },
  cardContainer: {
    width: 100,
    height: 150,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: '#e50914',
  },
  cardBadgeText: {
    color: '#fff',
    fontSize: 6,
    fontWeight: 'bold',
  },
});
