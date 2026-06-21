import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ActivityIndicator,
  Pressable,
  Keyboard
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Play, Info, Plus, Check, Search, Bell, User, X, LogOut, Settings, HelpCircle, Users, Smartphone, Flame } from 'lucide-react-native';
import {
  trendingMovies,
  lumoraOriginals,
  topRatedMovies,
  comedyMovies,
  newReleases,
  MediaItem
} from '@/constants/mockData';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useContinueWatching } from '@/hooks/useContinueWatching';
import { getHomeLists, searchMedia } from '@/services/tmdb';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';


// ─── Memoized hero page — prevents FlatList from re-rendering all pages on every state change ───
interface HeroPageProps {
  item: MediaItem;
  width: number;
  height: number;
  isLandscape: boolean;
  inWatchlist: boolean;
  onPlay: (item: MediaItem) => void;
  onInfo: (item: MediaItem) => void;
  onAdd: (item: MediaItem) => void;
  onRemove: (id: number) => void;
}
const HeroPage = memo(function HeroPage({
  item, width, height, isLandscape, inWatchlist, onPlay, onInfo, onAdd, onRemove,
}: HeroPageProps) {
  return (
    <View style={{ width, height, justifyContent: 'center' }}>
      <Image source={{ uri: item.backdrop_path }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
      <LinearGradient
        colors={['rgba(7,7,7,0.95)', 'rgba(7,7,7,0.55)', 'transparent']}
        start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
        style={styles.heroOverlayLeft}
      />
      <LinearGradient
        colors={['transparent', 'rgba(7,7,7,0.55)', '#070707']}
        start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
        style={styles.heroOverlayBottom}
      />
      <View style={[styles.heroInfoContent, { paddingLeft: isLandscape ? 60 : 30 }]}>
        <Text style={styles.heroTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.heroMetaRow}>
          <Text style={styles.heroMetaMatch}>
            {item.vote_average ? `${(item.vote_average * 10).toFixed(0)}% Match` : '98% Match'}
          </Text>
          <Text style={styles.heroMetaText}>
            {item.release_date ? item.release_date.slice(0, 4) : '2024'}
          </Text>
          <View style={styles.hdBadge}><Text style={styles.hdBadgeText}>HD</Text></View>
          <View style={[styles.typeBadge, item.type === 'tv' && { borderColor: '#e50914' }]}>
            <Text style={[styles.typeBadgeText, item.type === 'tv' && { color: '#e50914' }]}>
              {item.type === 'tv' ? 'SERIES' : 'MOVIE'}
            </Text>
          </View>
        </View>
        <Text style={styles.heroOverview} numberOfLines={3}>{item.overview}</Text>
        <View style={styles.heroActionsRow}>
          <TouchableOpacity activeOpacity={0.9} onPress={() => onPlay(item)} style={styles.playBtn}>
            <Play color="#000" size={20} fill="#000" />
            <Text style={styles.playBtnText}>Play</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8} onPress={() => onInfo(item)} style={styles.infoBtn}>
            <Info color="#fff" size={20} />
            <Text style={styles.infoBtnText}>More Info</Text>
          </TouchableOpacity>
          {inWatchlist ? (
            <TouchableOpacity activeOpacity={0.8} onPress={() => onRemove(item.id)} style={[styles.infoBtn, { borderColor: '#e50914' }]}>
              <Check color="#e50914" size={20} strokeWidth={3} />
              <Text style={[styles.infoBtnText, { color: '#e50914' }]}>My List</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity activeOpacity={0.8} onPress={() => onAdd(item)} style={styles.infoBtn}>
              <Plus color="#fff" size={20} />
              <Text style={styles.infoBtnText}>My List</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
});

export default function HomeScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();
  
  // Watchlist & Continue Watching Hooks
  const { addToWatchlist, removeFromWatchlist, isInWatchlist, watchlist, refreshWatchlist } = useWatchlist();
  const { continueWatchingList, refreshContinueWatching } = useContinueWatching();

  // Navigation / Filter State
  const [activeTab, setActiveTab] = useState<'home' | 'tv' | 'movies' | 'new' | 'mylist'>('home');

  // Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<MediaItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Dropdowns State
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  // Layout Dimensions (responsive to portrait / landscape)
  const [dimensions, setDimensions] = useState({
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({ width: window.width, height: window.height });
    });
    return () => subscription?.remove();
  }, []);

  const isLandscape = dimensions.width > dimensions.height;
  const heroHeight = isLandscape ? dimensions.height * 0.84 : dimensions.height * 0.65;

  // Media Lists
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
    tvPopular: MediaItem[];
    tvTopRated: MediaItem[];
    tvDrama: MediaItem[];
    tvAction: MediaItem[];
    tvCrime: MediaItem[];
    tvScifi: MediaItem[];
    tvComedy: MediaItem[];
    tvReality: MediaItem[];
    tvAnime: MediaItem[];
    tvDocumentary: MediaItem[];
    nowPlaying: MediaItem[];
    upcoming: MediaItem[];
    trendingToday: MediaItem[];
    newTv: MediaItem[];
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
    tvPopular: trendingMovies,
    tvTopRated: topRatedMovies,
    tvDrama: trendingMovies,
    tvAction: trendingMovies,
    tvCrime: trendingMovies,
    tvScifi: newReleases,
    tvComedy: comedyMovies,
    tvReality: trendingMovies,
    tvAnime: newReleases,
    tvDocumentary: trendingMovies,
    nowPlaying: newReleases,
    upcoming: newReleases,
    trendingToday: trendingMovies,
    newTv: lumoraOriginals,
  });

  // Fetch TMDB media lists on mount
  useEffect(() => {
    let active = true;
    const fetchLists = async () => {
      try {
        const data = await getHomeLists();
        if (active && data) {
          const f = <T,>(arr: T[], fallback: T[]) => arr.length > 0 ? arr : fallback;
          setLists({
            trending:      f(data.trending,      trendingMovies),
            originals:     f(data.originals,     lumoraOriginals),
            blockbusters:  f(data.blockbusters,  topRatedMovies),
            comedies:      f(data.comedies,      comedyMovies),
            scifi:         f(data.scifi,         newReleases),
            action:        f(data.action,        trendingMovies),
            mystery:       f(data.mystery,       trendingMovies),
            horror:        f(data.horror,        newReleases),
            romance:       f(data.romance,       trendingMovies),
            crime:         f(data.crime,         trendingMovies),
            fantasy:       f(data.fantasy,       newReleases),
            kids:          f(data.kids,          newReleases),
            oscar:         f(data.oscar,         topRatedMovies),
            tvPopular:     f(data.tvPopular,     trendingMovies),
            tvTopRated:    f(data.tvTopRated,    topRatedMovies),
            tvDrama:       f(data.tvDrama,       trendingMovies),
            tvAction:      f(data.tvAction,      trendingMovies),
            tvCrime:       f(data.tvCrime,       trendingMovies),
            tvScifi:       f(data.tvScifi,       newReleases),
            tvComedy:      f(data.tvComedy,      comedyMovies),
            tvReality:     f(data.tvReality,     trendingMovies),
            tvAnime:       f(data.tvAnime,       newReleases),
            tvDocumentary: f(data.tvDocumentary, trendingMovies),
            nowPlaying:    f(data.nowPlaying,    newReleases),
            upcoming:      f(data.upcoming,      newReleases),
            trendingToday: f(data.trendingToday, trendingMovies),
            newTv:         f(data.newTv,         lumoraOriginals),
          });
        }
      } catch (err) {
        console.warn('[Tablet Home] Failed to fetch TMDB lists, using offline cache:', err);
      }
    };

    fetchLists();
    return () => {
      active = false;
    };
  }, []);

  // Sync Watchlist and Continue Watching lists on focus/tab change
  useEffect(() => {
    refreshWatchlist();
    refreshContinueWatching();
  }, [activeTab]);

  // Debounced search suggestions
  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) {
      setSuggestions([]);
      setShowSearchDropdown(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setShowSearchDropdown(true);

    const delayDebounceFn = setTimeout(async () => {
      try {
        const results = await searchMedia(query);
        setSuggestions(results.slice(0, 3));
      } catch (err) {
        console.error('Error fetching suggestions:', err);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Handle Search Submit — navigates to dedicated search screen
  const handleSearchSubmit = () => {
    const query = searchQuery.trim();
    if (!query) return;
    Keyboard.dismiss();
    router.push({ pathname: '/search', params: { q: query } } as any);
    setSearchQuery('');
    setIsSearchOpen(false);
    setShowSearchDropdown(false);
  };

  // Clear Search
  const clearSearch = () => {
    setSearchQuery('');
    setIsSearchOpen(false);
    setShowSearchDropdown(false);
  };

  // Hero Items selection based on tab
  const heroItems = (() => {
    if (activeTab === 'movies') {
      return lists.trending.filter(item => item.type === 'movie').slice(0, 5);
    }
    if (activeTab === 'tv') {
      return lists.originals.filter(item => item.type === 'tv').slice(0, 5);
    }
    return lists.trending.slice(0, 5);
  })();

  const [heroIdx, setHeroIdx] = useState(0);
  const heroScrollRef = useRef<FlatList>(null);

  // Circular hero: prepend clone of last, append clone of first.
  // Extended array = [last, ...items, first], real items start at index 1.
  const heroExtended = heroItems.length > 1
    ? [heroItems[heroItems.length - 1], ...heroItems, heroItems[0]]
    : heroItems;

  // Scroll to a real heroIdx position in the extended array (offset +1 for the prepended clone)
  const scrollToHero = (idx: number, animated: boolean) => {
    if (heroItems.length <= 1) return;
    heroScrollRef.current?.scrollToOffset({ offset: (idx + 1) * dimensions.width, animated });
  };

  // Reset on tab switch — scroll instantly to real position 0
  useEffect(() => {
    setHeroIdx(0);
    scrollToHero(0, false);
  }, [activeTab]);

  // Keep correct position when orientation changes
  useEffect(() => {
    scrollToHero(heroIdx, false);
  }, [dimensions.width]);

  // Auto-advance every 8 seconds
  useEffect(() => {
    if (heroItems.length <= 1) return;
    const interval = setInterval(() => {
      setHeroIdx(prev => {
        const next = (prev + 1) % heroItems.length;
        heroScrollRef.current?.scrollToOffset({ offset: (next + 1) * dimensions.width, animated: true });
        return next;
      });
    }, 8000);
    return () => clearInterval(interval);
  }, [heroItems.length, dimensions.width]);

  const handleMediaPress = useCallback((item: MediaItem) => {
    router.push({
      pathname: '/info/[type]/[id]',
      params: { type: item.type, id: item.id.toString() }
    });
  }, [router]);

  const handlePlayPress = useCallback((item: MediaItem) => {
    const path = item.type === 'tv'
      ? { pathname: '/watch/[type]/[id]', params: { type: item.type, id: item.id.toString(), season: '1', episode: '1' } }
      : { pathname: '/watch/[type]/[id]', params: { type: item.type, id: item.id.toString() } };
    router.push(path as any);
  }, [router]);

  const renderHeroItem = useCallback(({ item }: { item: MediaItem }) => (
    <HeroPage
      item={item}
      width={dimensions.width}
      height={heroHeight}
      isLandscape={isLandscape}
      inWatchlist={isInWatchlist(item.id)}
      onPlay={handlePlayPress}
      onInfo={handleMediaPress}
      onAdd={addToWatchlist}
      onRemove={removeFromWatchlist}
    />
  ), [dimensions.width, heroHeight, isLandscape, isInWatchlist, handlePlayPress, handleMediaPress, addToWatchlist, removeFromWatchlist]);

  // Render Horizontal Carousel Rows
  const renderMediaRow = (title: string, data: MediaItem[], isTop10: boolean = false) => {
    let filteredData = data;
    if (activeTab === 'movies') filteredData = data.filter(item => item.type === 'movie');
    if (activeTab === 'tv') filteredData = data.filter(item => item.type === 'tv');

    if (filteredData.length === 0) return null;

    // Tablet-optimised sizing — larger cards for bigger screens
    const cardWidth = isLandscape ? 190 : 160;
    const cardHeight = isLandscape ? 285 : 240;

    return (
      <View style={styles.rowContainer}>
        <Text style={styles.rowTitle}>{title}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rowScroll}
        >
          {filteredData.map((item, index) => {
            if (isTop10) {
              const rank = index + 1;
              return (
                <TouchableOpacity
                  key={`${item.id}-${index}`}
                  activeOpacity={0.8}
                  onPress={() => handleMediaPress(item)}
                  style={[styles.top10CardContainer, { width: cardWidth + 50, height: cardHeight }]}
                >
                  {/* Huge Rank Number */}
                  <Text style={styles.top10Number}>{rank}</Text>
                  <View style={[styles.cardContainer, { width: cardWidth, height: cardHeight }]}>
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
                </TouchableOpacity>
              );
            }

            return (
              <TouchableOpacity
                key={`${item.id}-${index}`}
                activeOpacity={0.8}
                onPress={() => handleMediaPress(item)}
                style={[styles.cardContainer, { width: cardWidth, height: cardHeight }]}
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
            );
          })}
        </ScrollView>
      </View>
    );
  };

  // Close dropdowns helper
  const closeAllDropdowns = () => {
    setIsNotificationsOpen(false);
    setIsAccountOpen(false);
    setShowSearchDropdown(false);
  };

  // Mock notifications list matching the website
  const mockNotifications = [
    { id: 1, title: 'Stranger Things 5', message: 'New Season is now streaming globally.', time: '2h ago', read: false },
    { id: 2, title: 'Dune: Part Two', message: 'The sci-fi epic is now available on watchlists.', time: '1d ago', read: true },
    { id: 3, title: 'Top 10 Today', message: 'Spider-Man is the #1 trending title.', time: '3d ago', read: true },
  ];

  return (
    <View style={{ flex: 1 }}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        
        {/* ================= TOP NAVIGATION BAR ================= */}
        <View style={[styles.navbar, { paddingTop: safeAreaInsets.top > 0 ? safeAreaInsets.top + 8 : 24 }]}>
          <View style={styles.navbarLeft}>
            {/* Logo */}
            <TouchableOpacity onPress={() => { setActiveTab('home'); clearSearch(); }} activeOpacity={0.8}>
              <Text style={styles.logoText}>LUMORA</Text>
            </TouchableOpacity>

            {/* Menu Links */}
            <View style={styles.navLinksRow}>
              {(['home', 'tv', 'movies', 'new', 'mylist'] as const).map((tab) => {
                const label = 
                  tab === 'home' ? 'Home' : 
                  tab === 'tv' ? 'TV Shows' : 
                  tab === 'movies' ? 'Movies' : 
                  tab === 'new' ? 'New & Popular' : 'My List';
                const isActive = activeTab === tab && searchQuery === '';
                return (
                  <TouchableOpacity
                    key={tab}
                    onPress={() => { setActiveTab(tab); clearSearch(); closeAllDropdowns(); }}
                    style={styles.navLinkButton}
                  >
                    <Text style={[styles.navLinkText, isActive && styles.navLinkTextActive]}>
                      {label}
                    </Text>
                    {isActive && <View style={styles.activeNavIndicator} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Right Side: Search input + notifications + profile */}
          <View style={styles.navbarRight}>
            
            {/* Expandable Search Input */}
            <View style={styles.searchContainer}>
              {isSearchOpen ? (
                <View style={styles.searchBar}>
                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Titles, genres, directors..."
                    placeholderTextColor="#777"
                    style={styles.searchInput}
                    returnKeyType="search"
                    onSubmitEditing={handleSearchSubmit}
                    autoFocus
                  />
                  <TouchableOpacity onPress={clearSearch} style={styles.searchClearBtn}>
                    <X color="#fff" size={18} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity onPress={() => setIsSearchOpen(true)} style={styles.iconBtn}>
                  <Search color="#fff" size={20} />
                </TouchableOpacity>
              )}
            </View>

            {/* Notifications Button */}
            <View>
              <TouchableOpacity 
                onPress={(e) => { 
                  e.stopPropagation();
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsAccountOpen(false);
                }} 
                style={styles.iconBtn}
              >
                <Bell color="#fff" size={20} />
                <View style={styles.notificationDot} />
              </TouchableOpacity>
            </View>

            {/* User Account Avatar */}
            <View>
              <TouchableOpacity 
                onPress={(e) => { 
                  e.stopPropagation();
                  setIsAccountOpen(!isAccountOpen);
                  setIsNotificationsOpen(false);
                }} 
                style={styles.profileAvatar}
              >
                <View style={styles.avatarGradient}>
                  <User color="#fff" size={16} />
                </View>
              </TouchableOpacity>
            </View>

          </View>
        </View>

        {/* ================= AUTOCOMPLETE SEARCH DROPDOWN ================= */}
        {showSearchDropdown && (suggestions.length > 0 || isSearching) && (
          <View style={[styles.searchDropdown, { top: safeAreaInsets.top + 70 }]}>
            {isSearching ? (
              <View style={styles.dropdownLoading}>
                <ActivityIndicator color="#e50914" size="small" />
                <Text style={styles.dropdownLoadingText}>Searching...</Text>
              </View>
            ) : (
              <View>
                <View style={styles.dropdownHeader}>
                  <Text style={styles.dropdownHeaderText}>Top Results</Text>
                </View>
                {suggestions.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => {
                      closeAllDropdowns();
                      handleMediaPress(item);
                    }}
                    style={styles.dropdownItem}
                  >
                    <Image source={{ uri: item.poster_path }} style={styles.dropdownPoster} />
                    <View style={styles.dropdownInfo}>
                      <Text style={styles.dropdownTitle} numberOfLines={1}>{item.title}</Text>
                      <View style={styles.dropdownMeta}>
                        <Text style={styles.dropdownYear}>{item.release_date ? item.release_date.slice(0,4) : 'N/A'}</Text>
                        <View style={styles.dropdownBadge}>
                          <Text style={styles.dropdownBadgeText}>{item.type.toUpperCase()}</Text>
                        </View>
                        {item.vote_average > 0 && (
                          <Text style={styles.dropdownRating}>★ {item.vote_average.toFixed(1)}</Text>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity onPress={handleSearchSubmit} style={styles.dropdownFooter}>
                  <Text style={styles.dropdownFooterText}>See all results for "{searchQuery}"</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* ================= NOTIFICATIONS PANEL DROPDOWN ================= */}
        {isNotificationsOpen && (
          <View style={[styles.dropdownPanel, { right: 48, top: safeAreaInsets.top + 70, width: 320 }]}>
            <View style={styles.dropdownPanelHeader}>
              <Text style={styles.dropdownPanelTitle}>Notifications</Text>
              <View style={styles.dropdownPanelBadge}><Text style={styles.dropdownPanelBadgeText}>New Alerts</Text></View>
            </View>
            <ScrollView style={styles.dropdownList} scrollEnabled={false}>
              {mockNotifications.map((n) => (
                <View key={n.id} style={styles.notificationItem}>
                  <View style={[styles.unreadDot, n.read && { backgroundColor: 'transparent' }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.notificationTitle}>{n.title}</Text>
                    <Text style={styles.notificationMsg}>{n.message}</Text>
                    <Text style={styles.notificationTime}>{n.time}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ================= USER PROFILE PANEL DROPDOWN ================= */}
        {isAccountOpen && (
          <View style={[styles.dropdownPanel, { right: 16, top: safeAreaInsets.top + 70, width: 220 }]}>
            <TouchableOpacity style={styles.profileHeader}>
              <View style={styles.avatarGradientSmall}>
                <Text style={styles.avatarLetter}>S</Text>
              </View>
              <Text style={styles.profileName}>Savvy User</Text>
            </TouchableOpacity>
            
            <View style={styles.panelDivider} />
            
            <TouchableOpacity style={styles.panelItem}>
              <Users color="#aaa" size={16} />
              <Text style={styles.panelItemText}>Manage Profiles</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.panelItem}>
              <Settings color="#aaa" size={16} />
              <Text style={styles.panelItemText}>Account Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.panelItem}>
              <HelpCircle color="#aaa" size={16} />
              <Text style={styles.panelItemText}>Help Center</Text>
            </TouchableOpacity>

            <View style={styles.panelDivider} />

            <TouchableOpacity style={[styles.panelItem, { paddingVertical: 12 }]}>
              <LogOut color="#e50914" size={16} />
              <Text style={[styles.panelItemText, { color: '#e50914', fontWeight: 'bold' }]}>Sign Out of Lumora</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Backdrop — only exists when a dropdown is open; catches outside taps to close.
            zIndex sits below dropdown panels (110) but above scroll content. */}
        {(isNotificationsOpen || isAccountOpen || showSearchDropdown) && (
          <Pressable
            style={[StyleSheet.absoluteFillObject, { zIndex: 100 }]}
            onPress={closeAllDropdowns}
          />
        )}

        {/* ================= MAIN SCROLL CONTENT ================= */}
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={closeAllDropdowns}
        >
          
          {activeTab === 'mylist' ? (
            // ================= MY LIST VIEW =================
            <View style={styles.searchResultsGrid}>
              <View style={styles.sectionHeaderBorder}>
                <Text style={styles.sectionTitleLarge}>My List</Text>
                <Text style={styles.sectionSubtitle}>Saved movies and TV shows you've added to watch later.</Text>
              </View>

              {watchlist.length === 0 ? (
                <View style={styles.centeredBlock}>
                  <Flame color="#666" size={64} style={{ marginBottom: Spacing.three }} />
                  <Text style={styles.emptyTitle}>Your list is empty</Text>
                  <Text style={styles.emptySubtitle}>
                    Explore the homepage or category pages and add your favorite titles to watch here!
                  </Text>
                  <TouchableOpacity 
                    onPress={() => setActiveTab('home')} 
                    style={styles.primaryBtn}
                  >
                    <Text style={styles.primaryBtnText}>Browse Home</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.gridContainer}>
                  {watchlist.map((item, idx) => (
                    <TouchableOpacity
                      key={`${item.id}-${idx}`}
                      onPress={() => handleMediaPress(item)}
                      style={[styles.gridCard, { width: (dimensions.width - 80) / (isLandscape ? 7 : 5) }]}
                    >
                      <Image source={{ uri: item.poster_path }} style={styles.gridCardImage} contentFit="cover" />
                      {item.type === 'tv' && (
                        <View style={styles.cardBadge}>
                          <Text style={styles.cardBadgeText}>SERIES</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ) : (
            // ================= STANDARD HOME/MOVIES/TV/NEW VIEWS =================
            <View>
              
              {/* WIDESCREEN HERO BANNER — horizontal paged swipe */}
              {heroItems.length > 0 && (
                <View style={[styles.heroSection, { height: heroHeight }]}>
                  <FlatList
                    ref={heroScrollRef}
                    data={heroExtended}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    scrollEventThrottle={16}
                    initialScrollIndex={heroItems.length > 1 ? 1 : 0}
                    getItemLayout={(_, index) => ({
                      length: dimensions.width,
                      offset: dimensions.width * index,
                      index,
                    })}
                    keyExtractor={(item, index) => `${item.id}-hero-${index}`}
                    renderItem={renderHeroItem}
                    onMomentumScrollEnd={(e) => {
                      if (heroItems.length <= 1) return;
                      const rawIdx = Math.round(e.nativeEvent.contentOffset.x / dimensions.width);
                      if (rawIdx === 0) {
                        heroScrollRef.current?.scrollToOffset({ offset: heroItems.length * dimensions.width, animated: false });
                        setHeroIdx(heroItems.length - 1);
                      } else if (rawIdx === heroItems.length + 1) {
                        heroScrollRef.current?.scrollToOffset({ offset: dimensions.width, animated: false });
                        setHeroIdx(0);
                      } else {
                        setHeroIdx(rawIdx - 1);
                      }
                    }}
                  />

                  {/* Dot Indicators — absolute over the paged FlatList */}
                  {heroItems.length > 1 && (
                    <View style={styles.dotsIndicatorRow}>
                      {heroItems.map((_, idx) => (
                        <TouchableOpacity
                          key={idx}
                          onPress={() => {
                            heroScrollRef.current?.scrollToOffset({ offset: (idx + 1) * dimensions.width, animated: true });
                            setHeroIdx(idx);
                          }}
                          style={[styles.indicatorDot, idx === heroIdx && styles.indicatorDotActive]}
                        />
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* HORIZONTAL CAROUSEL ROWS */}
              <View style={styles.rowsWrapper}>
                
                {/* Continue Watching (loaded client side) */}
                {continueWatchingList.length > 0 && renderMediaRow("Continue Watching", continueWatchingList)}

                {activeTab === 'home' && (
                  <>
                    {renderMediaRow("Trending Now", lists.trending)}
                    {lists.blockbusters.length > 0 && renderMediaRow("Top 10 Movies Today", lists.blockbusters.slice(0, 10), true)}
                    {renderMediaRow("Featured on Lumora", lists.originals)}
                    {renderMediaRow("New Releases", lists.scifi)}
                    {renderMediaRow("Sci-Fi & Fantasy", lists.scifi)}
                    {renderMediaRow("Action Thrillers", lists.action)}
                    {renderMediaRow("Mystery & Thriller", lists.mystery)}
                    {renderMediaRow("Oscar Nominees", lists.oscar)}
                    {renderMediaRow("Horror Hits", lists.horror)}
                    {renderMediaRow("Romance", lists.romance)}
                    {renderMediaRow("Crime & Drama", lists.crime)}
                    {renderMediaRow("Fantasy Kingdoms", lists.fantasy)}
                    {renderMediaRow("Kids & Family", lists.kids)}
                    {renderMediaRow("Comedy Hits", lists.comedies)}
                  </>
                )}

                {activeTab === 'movies' && (
                  <>
                    {renderMediaRow("Trending Movies", lists.trending)}
                    {lists.blockbusters.length > 0 && renderMediaRow("Top 10 Movies Today", lists.blockbusters.slice(0, 10), true)}
                    {renderMediaRow("New Releases", lists.scifi)}
                    {renderMediaRow("Action Thrillers", lists.action)}
                    {renderMediaRow("Sci-Fi & Fantasy", lists.scifi)}
                    {renderMediaRow("Highly Rated Blockbusters", lists.blockbusters)}
                    {renderMediaRow("Popular Comedies", lists.comedies)}
                    {renderMediaRow("Mystery & Thriller", lists.mystery)}
                    {renderMediaRow("Horror Hits", lists.horror)}
                    {renderMediaRow("Romance", lists.romance)}
                    {renderMediaRow("Crime & Drama", lists.crime)}
                    {renderMediaRow("Fantasy Kingdoms", lists.fantasy)}
                    {renderMediaRow("Oscar Nominees", lists.oscar)}
                    {renderMediaRow("Kids & Family", lists.kids)}
                  </>
                )}

                {activeTab === 'tv' && (
                  <>
                    {renderMediaRow("Popular Right Now", lists.tvPopular)}
                    {renderMediaRow("Featured on Lumora", lists.originals)}
                    {renderMediaRow("Top Rated Series", lists.tvTopRated)}
                    {renderMediaRow("Drama Series", lists.tvDrama)}
                    {renderMediaRow("Action & Adventure", lists.tvAction)}
                    {renderMediaRow("Crime & Thriller", lists.tvCrime)}
                    {renderMediaRow("Sci-Fi & Fantasy", lists.tvScifi)}
                    {renderMediaRow("Comedy Series", lists.tvComedy)}
                    {renderMediaRow("Anime", lists.tvAnime)}
                    {renderMediaRow("Reality TV", lists.tvReality)}
                    {renderMediaRow("Documentaries", lists.tvDocumentary)}
                    {renderMediaRow("Kids & Family", lists.kids)}
                  </>
                )}

                {activeTab === 'new' && (
                  <>
                    {renderMediaRow("Trending Today", lists.trendingToday)}
                    {renderMediaRow("Now Playing in Cinemas", lists.nowPlaying)}
                    {renderMediaRow("Coming Soon", lists.upcoming)}
                    {renderMediaRow("New Episodes on Air", lists.newTv)}
                    {renderMediaRow("New Releases", lists.scifi)}
                    {renderMediaRow("Trending This Week", lists.trending)}
                    {renderMediaRow("Critically Acclaimed", lists.oscar)}
                    {renderMediaRow("Popular Series", lists.tvPopular)}
                    {renderMediaRow("New Action Films", lists.action)}
                    {renderMediaRow("New Horror", lists.horror)}
                    {renderMediaRow("New Sci-Fi", lists.scifi)}
                    {renderMediaRow("New Comedy Films", lists.comedies)}
                    {renderMediaRow("New Crime & Thriller", lists.mystery)}
                    {renderMediaRow("New Drama Series", lists.tvDrama)}
                    {renderMediaRow("New Anime", lists.tvAnime)}
                    {renderMediaRow("New Romance", lists.romance)}
                  </>
                )}

                {/* Mobile App Promo Banner */}
                <View style={styles.promoBannerContainer}>
                  <View style={styles.promoBanner}>
                    <Smartphone color="#e50914" size={32} style={styles.promoIcon} />
                    <View style={styles.promoTextContainer}>
                      <Text style={styles.promoTitle}>Stream on the go. Download the Lumora App.</Text>
                      <Text style={styles.promoDesc}>
                        Take your favorite shows and movies with you. Get the offline APK to watch downloads anywhere, anytime.
                      </Text>
                    </View>
                    <TouchableOpacity style={styles.promoBtn} activeOpacity={0.8}>
                      <Text style={styles.promoBtnText}>Get App</Text>
                    </TouchableOpacity>
                  </View>
                </View>

              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Top Navbar Styles
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
    backgroundColor: 'rgba(7, 7, 7, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    zIndex: 100,
  },
  navbarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 30,
  },
  logoText: {
    fontSize: 34,
    fontWeight: '900',
    color: '#e50914',
    letterSpacing: -1.5,
    fontFamily: 'Outfit-Black',
  },
  navLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  navLinkButton: {
    position: 'relative',
    paddingVertical: 8,
  },
  navLinkText: {
    color: '#aaa',
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'Outfit-Medium',
  },
  navLinkTextActive: {
    color: '#fff',
  },
  activeNavIndicator: {
    position: 'absolute',
    bottom: -12,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#e50914',
    borderRadius: 2,
  },
  navbarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    paddingLeft: 18,
    paddingRight: 6,
    paddingVertical: 6,
    width: 280,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
    padding: 0,
  },
  searchClearBtn: {
    padding: 4,
  },
  iconBtn: {
    padding: 8,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e50914',
  },
  profileAvatar: {
    width: 32,
    height: 32,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  avatarGradient: {
    flex: 1,
    backgroundColor: '#4A5568',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarGradientSmall: {
    width: 28,
    height: 28,
    borderRadius: 4,
    backgroundColor: '#4A5568',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  // Main Content Scroll
  scrollContainer: {
    paddingBottom: 60,
  },
  // Widescreen Hero Section
  heroSection: {
    width: '100%',
    position: 'relative',
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  heroOverlayLeft: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '65%',
  },
  heroOverlayBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '65%',
  },
  heroInfoContent: {
    position: 'relative',
    zIndex: 10,
    maxWidth: 600,
    marginTop: 20,
  },
  heroTitle: {
    fontSize: 60,
    fontWeight: '900',
    color: '#fff',
    fontFamily: 'Outfit-Black',
    lineHeight: 68,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 8,
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  heroMetaMatch: {
    color: '#46d369',
    fontWeight: 'bold',
    fontSize: 17,
    fontFamily: 'Inter-Bold',
  },
  heroMetaText: {
    color: '#B0B4BA',
    fontSize: 17,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },
  hdBadge: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    paddingHorizontal: 4,
    paddingVertical: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  hdBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
  typeBadge: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  typeBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
  heroOverview: {
    color: '#E2E8F0',
    fontSize: 18,
    lineHeight: 28,
    fontFamily: 'Inter-Regular',
    marginTop: 18,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  heroActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 24,
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 36,
    borderRadius: 6,
  },
  playBtnText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 19,
    fontFamily: 'Outfit-Bold',
  },
  infoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 15,
    paddingHorizontal: 36,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  infoBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 19,
    fontFamily: 'Outfit-Bold',
  },
  dotsIndicatorRow: {
    position: 'absolute',
    bottom: 24,
    right: 40,
    flexDirection: 'row',
    gap: 6,
    zIndex: 10,
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  indicatorDotActive: {
    width: 24,
    backgroundColor: '#e50914',
  },
  // Horizontal list rows
  rowsWrapper: {
    marginTop: -20,
    zIndex: 20,
    backgroundColor: '#070707',
    paddingBottom: 40,
  },
  rowContainer: {
    marginTop: Spacing.four,
  },
  rowTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fff',
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.two,
    fontFamily: 'Outfit-Bold',
  },
  rowScroll: {
    paddingLeft: Spacing.four,
    paddingRight: Spacing.four,
    gap: 16,
  },
  cardContainer: {
    borderRadius: 6,
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
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: '#e50914',
  },
  cardBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
  // Top 10 Styling
  top10CardContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    position: 'relative',
  },
  top10Number: {
    fontSize: 160,
    fontWeight: '900',
    color: '#070707',
    fontFamily: 'Outfit-Black',
    lineHeight: 160,
    position: 'absolute',
    left: -20,
    bottom: -20,
    zIndex: 1,
    textShadowColor: '#aaa',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  // Search suggestion dropdown styles
  searchDropdown: {
    position: 'absolute',
    right: 48,
    width: 400,
    backgroundColor: 'rgba(7, 7, 7, 0.98)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 110,
    overflow: 'hidden',
  },
  dropdownLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 10,
  },
  dropdownLoadingText: {
    color: '#aaa',
    fontSize: 12,
  },
  dropdownHeader: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  dropdownHeaderText: {
    color: '#aaa',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dropdownItem: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    gap: 12,
  },
  dropdownPoster: {
    width: 48,
    height: 72,
    borderRadius: 4,
    backgroundColor: '#222',
  },
  dropdownInfo: {
    flex: 1,
  },
  dropdownTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dropdownMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  dropdownYear: {
    color: '#777',
    fontSize: 13,
  },
  dropdownRating: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: 'bold',
  },
  dropdownBadge: {
    backgroundColor: '#e50914',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
  },
  dropdownBadgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  dropdownFooter: {
    padding: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  dropdownFooterText: {
    color: '#e50914',
    fontSize: 15,
    fontWeight: 'bold',
  },
  // Dropdown Panels
  dropdownPanel: {
    position: 'absolute',
    backgroundColor: 'rgba(7, 7, 7, 0.98)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 110,
    overflow: 'hidden',
    padding: 12,
  },
  dropdownPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    paddingBottom: 8,
    marginBottom: 8,
  },
  dropdownPanelTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  dropdownPanelBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  dropdownPanelBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
  },
  dropdownList: {
    maxHeight: 250,
  },
  notificationItem: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#e50914',
    marginTop: 6,
  },
  notificationTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  notificationMsg: {
    color: '#aaa',
    fontSize: 11,
    marginTop: 2,
    lineHeight: 14,
  },
  notificationTime: {
    color: '#555',
    fontSize: 9,
    marginTop: 4,
  },
  // Profile dropdown
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  profileName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  panelDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginVertical: 8,
  },
  panelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  panelItemText: {
    color: '#ccc',
    fontSize: 12,
    fontWeight: '500',
  },
  // Grid Results Styles (Search & My List)
  searchResultsGrid: {
    paddingHorizontal: Spacing.four,
    paddingTop: 32,
  },
  sectionHeaderBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    paddingBottom: 16,
    marginBottom: 24,
  },
  sectionTitleLarge: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    fontFamily: 'Outfit-Bold',
  },
  sectionSubtitle: {
    color: '#777',
    fontSize: 16,
    marginTop: 4,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  gridCard: {
    aspectRatio: 2/3,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    position: 'relative',
    marginBottom: 16,
  },
  gridCardImage: {
    width: '100%',
    height: '100%',
  },
  centeredBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ccc',
    marginTop: 10,
  },
  emptySubtitle: {
    color: '#555',
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 400,
    marginTop: 8,
    lineHeight: 20,
  },
  primaryBtn: {
    marginTop: 20,
    backgroundColor: '#e50914',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 12,
  },
  grayText: {
    color: '#aaa',
    marginTop: 10,
  },
  // Promo Banner
  promoBannerContainer: {
    paddingHorizontal: Spacing.four,
    marginTop: 40,
  },
  promoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 8,
    padding: 24,
    gap: 16,
  },
  promoIcon: {
    marginRight: 8,
  },
  promoTextContainer: {
    flex: 1,
  },
  promoTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Outfit-Bold',
  },
  promoDesc: {
    color: '#aaa',
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
    fontFamily: 'Inter-Regular',
  },
  promoBtn: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  promoBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
