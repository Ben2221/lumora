import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Animated,
  Platform,
  FlatList,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Play, Plus, Check, Info } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  trendingMovies,
  newReleases,
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

const { height } = Dimensions.get('window');

const MovieCard = ({ item, onFocus, onPress }: { item: MediaItem; onFocus: () => void; onPress: () => void }) => {
  const scale = useMemo(() => new Animated.Value(1), []);
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus();
    Animated.timing(scale, {
      toValue: 1.15,
      duration: 250,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(scale, {
      toValue: 1,
      duration: 200,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  return (
    <Animated.View 
      style={[
        { 
          transform: [{ scale }], 
          zIndex: isFocused ? 20 : 1,
        },
        Platform.OS === 'android' && {
          elevation: isFocused ? 20 : 0,
        }
      ]}
    >
      <Pressable
        focusable={true}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onPress={onPress}
        style={({ focused }: any) => [
          styles.cardContainer,
          focused && styles.cardContainerFocused
        ]}
      >
        <View style={styles.cardInner}>
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
        </View>
      </Pressable>
    </Animated.View>
  );
};

export default function TVHomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const { continueWatchingList } = useContinueWatching();

  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState<'all' | 'tv' | 'movie' | 'popular'>('all');

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

  const heroPool = (() => {
    let pool = lists.trending;
    if (activeFilter === 'tv') {
      pool = lists.trending.filter(item => item.type === 'tv');
      if (pool.length === 0) pool = lists.originals.filter(item => item.type === 'tv');
    } else if (activeFilter === 'movie') {
      pool = lists.trending.filter(item => item.type === 'movie');
      if (pool.length === 0) pool = lists.blockbusters.filter(item => item.type === 'movie');
    } else if (activeFilter === 'popular') {
      pool = lists.trending.filter(item => item.vote_average && item.vote_average >= 7.8);
    }
    return pool.slice(0, 5);
  })();

  const activeHeroItem = heroPool[currentHeroIndex % Math.max(1, heroPool.length)] || trendingMovies[0];

  const [visibleHeroItem, setVisibleHeroItem] = useState(activeHeroItem);
  const heroOpacity = useMemo(() => new Animated.Value(1), []);

  useEffect(() => {
    setVisibleHeroItem(activeHeroItem);
    heroOpacity.setValue(0);
    Animated.timing(heroOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [activeHeroItem.id]);

  useEffect(() => {
    if (heroPool.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentHeroIndex((prevIndex) => (prevIndex + 1) % heroPool.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroPool.length]);

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
        console.warn('[TV Home] Failed to fetch fresh TMDB media lists, using offline cache:', err);
      }
    };

    fetchLists();
    return () => {
      active = false;
    };
  }, []);

  const handleMediaPress = (item: MediaItem) => {
    router.push({
      pathname: '/info/[type]/[id]',
      params: { type: item.type, id: item.id.toString() }
    });
  };

  const handleFilterChange = (filter: 'all' | 'tv' | 'movie' | 'popular') => {
    setActiveFilter(filter);
    setCurrentHeroIndex(0);
  };

  const isBookmarked = isInWatchlist(visibleHeroItem.id);

  const handleToggleWatchlist = () => {
    if (isBookmarked) {
      removeFromWatchlist(visibleHeroItem.id);
    } else {
      addToWatchlist(visibleHeroItem);
    }
  };

  const getFilteredData = (data: MediaItem[]) => {
    if (!data) return [];
    if (activeFilter === 'tv') {
      return data.filter(item => item.type === 'tv');
    } else if (activeFilter === 'movie') {
      return data.filter(item => item.type === 'movie');
    } else if (activeFilter === 'popular') {
      return data.filter(item => item.vote_average && item.vote_average >= 7.8);
    }
    return data;
  };

  const rows = [
    ...(continueWatchingList.length > 0 ? [{ title: "Continue Watching", data: getFilteredData(continueWatchingList) }] : []),
    { title: "Only on Lumora", data: getFilteredData(lists.originals) },
    { title: "Trending Now", data: getFilteredData(lists.trending) },
    { title: "Sci-Fi & Fantasy Thrillers", data: getFilteredData(lists.scifi) },
    { title: "Blockbuster Movies", data: getFilteredData(lists.blockbusters) },
    { title: "Action Thrillers", data: getFilteredData(lists.action) },
    { title: "Popular Comedies", data: getFilteredData(lists.comedies) },
    { title: "Mystery & Intrigue", data: getFilteredData(lists.mystery) },
    { title: "Horror Hits", data: getFilteredData(lists.horror) },
    { title: "Award Winning", data: getFilteredData(lists.oscar) },
  ].filter(row => row.data && row.data.length > 0);

  const renderMediaRow = (title: string, data: MediaItem[]) => {
    return (
      <View style={styles.rowContainer}>
        <Text style={styles.rowTitle}>{title}</Text>
        <FlatList
          horizontal
          data={data}
          keyExtractor={(item) => item.id.toString() + '-' + item.type}
          renderItem={({ item }) => (
            <MovieCard
              item={item}
              onFocus={() => {}}
              onPress={() => handleMediaPress(item)}
            />
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rowScroll}
          focusable={false}
        />
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Main Content Area */}
      <View style={styles.contentWrapper}>
        <FlatList
          data={rows}
          renderItem={({ item }) => renderMediaRow(item.title, item.data)}
          keyExtractor={(item) => item.title}
          ListHeaderComponent={
            <View style={styles.headerWrapper}>
              {/* Netflix-Style Top Navigation Bar (Logo and Sub-Navigation Tabs) */}
              <View style={styles.topNavBar}>
                <Text style={styles.topBarLogoText}>LUMORA</Text>
                <View style={styles.topNavLinks}>
                  <Pressable
                    focusable={true}
                    style={({ focused }: any) => [
                      styles.topNavLink,
                      focused && styles.topNavLinkFocused,
                      activeFilter === 'all' && styles.topNavLinkActive
                    ]}
                    onPress={() => handleFilterChange('all')}
                  >
                    {({ focused }: any) => (
                      <Text style={[styles.topNavLinkText, focused && styles.topNavLinkTextFocused]}>
                        Home
                      </Text>
                    )}
                  </Pressable>
                  
                  <Pressable
                    focusable={true}
                    style={({ focused }: any) => [
                      styles.topNavLink,
                      focused && styles.topNavLinkFocused,
                      activeFilter === 'tv' && styles.topNavLinkActive
                    ]}
                    onPress={() => handleFilterChange('tv')}
                  >
                    {({ focused }: any) => (
                      <Text style={[styles.topNavLinkText, focused && styles.topNavLinkTextFocused]}>
                        TV Shows
                      </Text>
                    )}
                  </Pressable>

                  <Pressable
                    focusable={true}
                    style={({ focused }: any) => [
                      styles.topNavLink,
                      focused && styles.topNavLinkFocused,
                      activeFilter === 'movie' && styles.topNavLinkActive
                    ]}
                    onPress={() => handleFilterChange('movie')}
                  >
                    {({ focused }: any) => (
                      <Text style={[styles.topNavLinkText, focused && styles.topNavLinkTextFocused]}>
                        Movies
                      </Text>
                    )}
                  </Pressable>

                  <Pressable
                    focusable={true}
                    style={({ focused }: any) => [
                      styles.topNavLink,
                      focused && styles.topNavLinkFocused,
                      activeFilter === 'popular' && styles.topNavLinkActive
                    ]}
                    onPress={() => handleFilterChange('popular')}
                  >
                    {({ focused }: any) => (
                      <Text style={[styles.topNavLinkText, focused && styles.topNavLinkTextFocused]}>
                        New & Popular
                      </Text>
                    )}
                  </Pressable>
                </View>
              </View>

              {/* Dynamic Hero Section */}
              <View style={styles.heroSection}>
                <Animated.View style={[styles.heroBackdrop, { opacity: heroOpacity }]}>
                  <Image
                    source={{ uri: visibleHeroItem.backdrop_path }}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="cover"
                  />
                </Animated.View>
                {/* Linear gradients to blend backdrop image into dark background */}
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.95)']}
                  style={styles.heroGradientVertical}
                />
                <LinearGradient
                  colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.2)', 'transparent']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.heroGradientHorizontal}
                />

                <View style={styles.heroInfoContainer}>
                  <Animated.View style={{ opacity: heroOpacity }}>
                    <Text style={styles.heroTitle} numberOfLines={2}>
                      {visibleHeroItem.title}
                    </Text>

                    <View style={styles.heroMetaRow}>
                      <Text style={styles.heroMetaMatch}>
                        {visibleHeroItem.vote_average ? `${(visibleHeroItem.vote_average * 10).toFixed(0)}% Match` : '98% Match'}
                      </Text>
                      <Text style={styles.heroMetaText}>
                        {visibleHeroItem.release_date ? visibleHeroItem.release_date.slice(0, 4) : '2024'}
                      </Text>
                      <Text style={styles.heroMetaBadge}>
                        {visibleHeroItem.type === 'tv' ? 'TV-MA' : 'PG-13'}
                      </Text>
                      <Text style={styles.heroMetaText}>
                        {visibleHeroItem.type === 'tv' ? 'Series' : 'Movie'}
                      </Text>
                    </View>

                    <Text style={styles.heroDescription} numberOfLines={3}>
                      {visibleHeroItem.overview || 'Experience the highly anticipated release now streaming exclusively on Lumora. Dive into a gripping storyline filled with unforgettable characters and stunning visual designs.'}
                    </Text>
                  </Animated.View>

                  {/* Focusable Action Buttons */}
                  <View style={styles.heroActionsRow}>
                    <Pressable
                      focusable={true}
                      hasTVPreferredFocus={true}
                      onPress={() => {
                        const playUrl = visibleHeroItem.type === 'tv'
                          ? { pathname: '/watch/[type]/[id]', params: { type: visibleHeroItem.type, id: visibleHeroItem.id.toString(), season: '1', episode: '1' } }
                          : { pathname: '/watch/[type]/[id]', params: { type: visibleHeroItem.type, id: visibleHeroItem.id.toString() } };
                        router.push(playUrl as any);
                      }}
                      style={({ focused }: any) => [
                        styles.actionButton,
                        styles.playButton,
                        focused && styles.playButtonFocused
                      ]}
                    >
                      {({ focused }: any) => (
                        <>
                          <Play color={focused ? '#fff' : '#000'} size={24} fill={focused ? '#fff' : '#000'} />
                          <Text style={[styles.playButtonText, focused && { color: '#fff' }]}>Play</Text>
                        </>
                      )}
                    </Pressable>

                    <Pressable
                      focusable={true}
                      onPress={handleToggleWatchlist}
                      style={({ focused }: any) => [
                        styles.actionButton,
                        styles.listButton,
                        focused && styles.listButtonFocused
                      ]}
                    >
                      {({ focused }: any) => (
                        <>
                          {isBookmarked ? (
                            <Check color={focused ? '#000' : '#e50914'} size={24} strokeWidth={3} />
                          ) : (
                            <Plus color={focused ? '#000' : '#fff'} size={24} />
                          )}
                          <Text style={[
                            styles.listButtonText,
                            focused ? { color: '#000' } : { color: '#fff' },
                            isBookmarked && !focused && { color: '#e50914' }
                          ]}>
                            {isBookmarked ? 'In Watchlist' : 'My List'}
                          </Text>
                        </>
                      )}
                    </Pressable>

                    <Pressable
                      focusable={true}
                      onPress={() => handleMediaPress(visibleHeroItem)}
                      style={({ focused }: any) => [
                        styles.actionButton,
                        styles.listButton,
                        focused && styles.listButtonFocused
                      ]}
                    >
                      {({ focused }: any) => (
                        <>
                          <Info color={focused ? '#000' : '#fff'} size={24} />
                          <Text style={[
                            styles.listButtonText,
                            focused ? { color: '#000' } : { color: '#fff' }
                          ]}>
                            Details
                          </Text>
                        </>
                      )}
                    </Pressable>
                  </View>
                </View>
              </View>
            </View>
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          style={styles.mainScrollView}
          focusable={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  contentWrapper: {
    flex: 1,
    marginLeft: 80, // Matches collapsed SideNavigation width
    backgroundColor: '#000',
  },
  scrollContent: {
    paddingBottom: 60,
  },
  heroSection: {
    width: '100%',
    height: height * 0.68, // Expanded slightly to fit top bar logo
    position: 'relative',
    backgroundColor: '#000',
  },
  heroBackdrop: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  heroGradientVertical: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
    zIndex: 2,
  },
  heroGradientHorizontal: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '70%',
    zIndex: 1,
  },
  topNavBar: {
    position: 'absolute',
    left: 40,
    top: 40,
    right: 40,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 100,
    gap: 40,
  },
  topBarLogoText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#e50914',
    fontFamily: 'Outfit-Black',
    letterSpacing: -1.5,
  },
  topNavLinks: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  topNavLink: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  topNavLinkFocused: {
    backgroundColor: '#e50914',
    borderColor: '#e50914',
    transform: [{ scale: 1.05 }],
  },
  topNavLinkActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#e50914',
  },
  topNavLinkText: {
    color: '#e5e5e5',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Outfit-Bold',
  },
  topNavLinkTextFocused: {
    color: '#fff',
  },
  heroInfoContainer: {
    position: 'absolute',
    left: 40,
    bottom: 30,
    width: '50%', // Occupies left half of landscape layout
    zIndex: 5,
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
    fontFamily: 'Outfit-Black',
    lineHeight: 52,
    marginBottom: Spacing.two,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 8,
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginBottom: Spacing.three,
  },
  heroMetaMatch: {
    color: '#46d369',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  heroMetaText: {
    color: '#B0B4BA',
    fontSize: 15,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },
  heroMetaBadge: {
    color: '#fff',
    backgroundColor: '#333',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
  heroDescription: {
    color: '#ccc',
    fontSize: 16,
    lineHeight: 22,
    fontFamily: 'Inter-Regular',
    marginBottom: Spacing.four,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  heroActionsRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    justifyContent: 'center',
  },
  playButton: {
    backgroundColor: '#fff',
  },
  playButtonFocused: {
    backgroundColor: '#e50914',
    transform: [{ scale: 1.05 }],
  },
  playButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Outfit-Bold',
  },
  listButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  listButtonFocused: {
    backgroundColor: '#fff',
    borderColor: '#fff',
    transform: [{ scale: 1.05 }],
  },
  listButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Outfit-Bold',
  },
  buttonTextFocused: {
    color: '#fff',
  },
  rowsWrapper: {
    marginTop: -20, // Pulls rows up slightly to blend with hero section gradient
    paddingBottom: 40,
    zIndex: 10,
  },
  rowContainer: {
    marginTop: Spacing.three, // Reduced to compensate for the vertical padding of rowScroll
  },
  rowTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
    paddingHorizontal: 40,
    marginBottom: Spacing.two,
    fontFamily: 'Outfit-Bold',
  },
  rowScroll: {
    paddingLeft: 40,
    paddingRight: 40,
    paddingVertical: 18, // Extra vertical space so scaled cards are not clipped at top/bottom
    gap: 16,
  },
  cardContainer: {
    width: 140,
    height: 210,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#141414',
    position: 'relative',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  cardContainerFocused: {
    zIndex: 10,
    borderColor: '#e50914',
    borderWidth: 4,
    backgroundColor: '#141414', // Dark background so card is not solid red
    shadowColor: '#e50914',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12, // Android TV shadow depth
  },
  cardInner: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#e50914',
  },
  cardBadgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
  mainScrollView: {
    flex: 1,
  },
  headerWrapper: {
    position: 'relative',
  },
});
