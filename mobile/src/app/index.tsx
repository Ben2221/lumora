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
import { getHomeLists } from '@/services/tmdb';
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
    scifi: MediaItem[];
    action: MediaItem[];
    mystery: MediaItem[];
    horror: MediaItem[];
    romance: MediaItem[];
    crime: MediaItem[];
    fantasy: MediaItem[];
    kids: MediaItem[];
    oscar: MediaItem[];
  }>({
    trending: trendingMovies,
    originals: lumoraOriginals,
    blockbusters: topRatedMovies,
    comedies: comedyMovies,
    scifi: newReleases,
    action: trendingMovies,
    mystery: trendingMovies,
    horror: newReleases,
    romance: trendingMovies,
    crime: trendingMovies,
    fantasy: newReleases,
    kids: newReleases,
    oscar: topRatedMovies,
  });

  useEffect(() => {
    let active = true;
    const fetchLists = async () => {
      try {
        const data = await getHomeLists();
        if (active && data) {
          setLists({
            trending: data.trending.length > 0 ? data.trending : trendingMovies,
            originals: data.originals.length > 0 ? data.originals : lumoraOriginals,
            blockbusters: data.blockbusters.length > 0 ? data.blockbusters : topRatedMovies,
            comedies: data.comedies.length > 0 ? data.comedies : comedyMovies,
            scifi: data.scifi.length > 0 ? data.scifi : newReleases,
            action: data.action.length > 0 ? data.action : trendingMovies,
            mystery: data.mystery.length > 0 ? data.mystery : trendingMovies,
            horror: data.horror.length > 0 ? data.horror : newReleases,
            romance: data.romance.length > 0 ? data.romance : trendingMovies,
            crime: data.crime.length > 0 ? data.crime : trendingMovies,
            fantasy: data.fantasy.length > 0 ? data.fantasy : newReleases,
            kids: data.kids.length > 0 ? data.kids : newReleases,
            oscar: data.oscar.length > 0 ? data.oscar : topRatedMovies,
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

  // Get top 5 featured items for the Hero carousel
  const heroItems = activeFilter === 'tv'
    ? lists.originals.slice(0, 5)
    : lists.trending.slice(0, 5);

  const handleMediaPress = (item: MediaItem) => {
    router.push({
      pathname: '/info/[type]/[id]',
      params: { type: item.type, id: item.id.toString() }
    });
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
        {/* Main Hero Swipeable Carousel */}
        <View style={styles.heroWrapper}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ width: width * heroItems.length }}
          >
            {heroItems.map((item) => {
              const isItemBookmarked = isInWatchlist(item.id);
              const handleToggleItemWatchlist = () => {
                if (isItemBookmarked) {
                  removeFromWatchlist(item.id);
                } else {
                  addToWatchlist(item);
                }
              };

              return (
                <View key={item.id} style={[styles.heroContainer, { width }]}>
                  <Image
                    source={{ uri: item.backdrop_path }}
                    style={styles.heroImage}
                    contentFit="cover"
                  />
                  <View style={styles.heroOverlay} />

                  <View style={styles.heroInfoWrapper}>
                    <Text style={styles.heroTitle} numberOfLines={2}>
                      {item.title}
                    </Text>

                    <View style={styles.heroMeta}>
                      <Text style={styles.heroMetaMatch}>98% Match</Text>
                      <Text style={styles.heroMetaText}>
                        {item.release_date ? item.release_date.slice(0, 4) : '2024'}
                      </Text>
                      <Text style={styles.heroMetaText}>
                        {item.type === 'tv' ? 'TV-MA' : 'PG-13'}
                      </Text>
                    </View>

                    {/* Play / List trigger actions */}
                    <View style={styles.heroActionsRow}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={handleToggleItemWatchlist}
                        style={styles.heroActionBtn}
                      >
                        {isItemBookmarked ? (
                          <Check color="#e50914" size={20} strokeWidth={3} />
                        ) : (
                          <Plus color="#fff" size={20} />
                        )}
                        <Text style={[styles.heroActionText, isItemBookmarked && { color: '#e50914' }]}>
                          My List
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => {
                          const playUrl = item.type === 'tv'
                            ? { pathname: '/watch/[type]/[id]', params: { type: item.type, id: item.id.toString(), season: '1', episode: '1' } }
                            : { pathname: '/watch/[type]/[id]', params: { type: item.type, id: item.id.toString() } };
                          router.push(playUrl as any);
                        }}
                        style={styles.heroPlayBtn}
                      >
                        <Play color="#000" size={20} fill="#000" />
                        <Text style={styles.heroPlayBtnText}>Play</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleMediaPress(item)}
                        style={styles.heroActionBtn}
                      >
                        <Info color="#fff" size={20} />
                        <Text style={styles.heroActionText}>Info</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* Carousel Rows */}
        {continueWatchingList.length > 0 && renderMediaRow("Continue Watching", continueWatchingList)}
        {activeFilter !== 'movies' && renderMediaRow("Only on Lumora", lists.originals)}
        {renderMediaRow("Trending Now", lists.trending)}
        {renderMediaRow("Sci-Fi & Fantasy", lists.scifi)}
        {renderMediaRow("Action Thrillers", lists.action)}
        {renderMediaRow("Mystery & Thriller", lists.mystery)}
        {renderMediaRow("Oscar Nominees", lists.oscar)}
        {renderMediaRow("Horror Hits", lists.horror)}
        {renderMediaRow("Romance", lists.romance)}
        {renderMediaRow("Crime & Drama", lists.crime)}
        {renderMediaRow("Fantasy Kingdoms", lists.fantasy)}
        {renderMediaRow("Kids & Family", lists.kids)}
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
    fontSize: 24,
    fontWeight: '900',
    color: '#e50914',
    letterSpacing: -1.2,
    fontFamily: 'Outfit-Black',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginTop: Spacing.three,
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
    fontFamily: 'Outfit-Bold',
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
    padding: 5
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
    fontFamily: 'Outfit-Black',
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
    fontFamily: 'Inter-Bold',
  },
  heroMetaText: {
    color: '#B0B4BA',
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
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
    fontFamily: 'Outfit-Bold',
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
    fontFamily: 'Outfit-SemiBold',
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
    fontFamily: 'Outfit-Bold',
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
    fontFamily: 'Inter-Bold',
  },
  heroWrapper: {
    width: '100%',
    height: width * 1.1,
  },
});
