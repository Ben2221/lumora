import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  FlatList, 
  Pressable, 
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Search as SearchIcon, X } from 'lucide-react-native';
import { 
  trendingMovies, 
  newReleases, 
  mockTVShows, 
  MediaItem 
} from '@/constants/mockData';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { searchMedia, getHomeLists } from '@/services/tmdb';

const { width } = Dimensions.get('window');
const availableWidth = width - 80 - 80; // subtracting sidebar (80) and horizontal padding (40 * 2)
const COLUMN_WIDTH = (availableWidth - 16 * 5) / 6; // 6 columns on TV

const allMedia = [...trendingMovies, ...newReleases, ...mockTVShows];

export default function TVExploreScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MediaItem[]>([]);
  const [popularMedia, setPopularMedia] = useState<MediaItem[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  const displayedResults = query.trim().length < 2 
    ? (popularMedia.length > 0 ? popularMedia : allMedia.slice(0, 10))
    : results;

  useEffect(() => {
    let active = true;
    const loadPopular = async () => {
      try {
        const data = await getHomeLists();
        if (active && data && data.trending.length > 0) {
          setPopularMedia(data.trending.slice(0, 15));
        }
      } catch (err) {
        console.warn('[TV Explore] Failed to fetch popular searches:', err);
      }
    };
    loadPopular();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      return;
    }

    let active = true;
    const delayDebounce = setTimeout(async () => {
      try {
        const data = await searchMedia(trimmed);
        if (active && data) {
          setResults(data);
        }
      } catch (err) {
        console.warn('[TV Search] Fallback to local search filter:', err);
        const filtered = allMedia.filter(item => 
          item.title.toLowerCase().includes(trimmed.toLowerCase()) || 
          item.overview.toLowerCase().includes(trimmed.toLowerCase())
        );
        const unique = filtered.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
        if (active) setResults(unique);
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(delayDebounce);
    };
  }, [query]);

  const handleMediaPress = (item: MediaItem) => {
    router.push({
      pathname: '/info/[type]/[id]',
      params: { type: item.type, id: item.id.toString() }
    });
  };

  const MovieCard = ({ item, onPress }: { item: MediaItem; onPress: () => void }) => {
    const scale = useRef(new Animated.Value(1)).current;
    const [cardFocused, setCardFocused] = useState(false);

    const handleFocus = () => {
      setCardFocused(true);
      Animated.timing(scale, {
        toValue: 1.12,
        duration: 250,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    };

    const handleBlur = () => {
      setCardFocused(false);
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
            zIndex: cardFocused ? 20 : 1,
          },
          Platform.OS === 'android' && {
            elevation: cardFocused ? 20 : 0,
          }
        ]}
      >
        <Pressable
          focusable={true}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onPress={onPress}
          style={({ focused }: any) => [
            styles.card,
            focused && styles.cardFocused
          ]}
        >
          {({ focused }: any) => (
            <View style={styles.cardInner}>
              <Image
                source={{ uri: item.poster_path }}
                style={styles.image}
                contentFit="cover"
              />
              {item.type === 'tv' && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>SERIES</Text>
                </View>
              )}
              {focused && (
                <View style={styles.cardFocusedBorder} />
              )}
            </View>
          )}
        </Pressable>
      </Animated.View>
    );
  };

  const renderItem = ({ item }: { item: MediaItem }) => (
    <MovieCard item={item} onPress={() => handleMediaPress(item)} />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Main Content */}
      <View style={styles.contentWrapper}>
        {/* Search Header Area */}
        <View style={styles.header}>
          <View
            style={[
              styles.searchBox,
              isFocused && styles.searchBoxFocused
            ]}
          >
            <SearchIcon color={isFocused ? '#e50914' : '#888'} size={24} />
            <TextInput
              style={styles.input}
              placeholder="Search movies, series, genres..."
              placeholderTextColor="#60646C"
              value={query}
              onChangeText={setQuery}
              autoCapitalize="none"
              returnKeyType="search"
              autoFocus={true}
              focusable={true}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
            {query.length > 0 && (
              <Pressable 
                focusable={true}
                onPress={() => setQuery('')}
                style={styles.clearButton}
              >
                <X color="#aaa" size={20} />
              </Pressable>
            )}
          </View>
        </View>

        {/* Results Header Label */}
        <Text style={styles.resultsLabel}>
          {query.trim().length >= 2 ? `Search Results (${displayedResults.length})` : 'Popular Searches'}
        </Text>

        {/* Search Grid */}
        <FlatList
          data={displayedResults}
          renderItem={renderItem}
          keyExtractor={(item: any) => item.id.toString() + '-' + item.type}
          numColumns={6}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={styles.gridRow}
          showsVerticalScrollIndicator={false}
          style={styles.gridList}
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
    marginLeft: 80, // Collapsed SideNavigation width
    paddingHorizontal: 24,
    paddingTop: 30,
    backgroundColor: '#000',
  },
  header: {
    paddingBottom: Spacing.two,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    height: 54,
    gap: Spacing.three,
  },
  searchBoxFocused: {
    borderColor: '#fff',
    backgroundColor: '#1f1f1f',
    transform: [{ scale: 1.01 }],
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    padding: 0,
    fontFamily: 'Inter-Medium',
  },
  clearButton: {
    padding: 4,
  },
  resultsLabel: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    paddingVertical: Spacing.four,
    fontFamily: 'Outfit-Bold',
  },
  gridContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 60,
  },
  gridRow: {
    justifyContent: 'flex-start',
    gap: 16,
    paddingVertical: 12, // Extra vertical space so scaled cards are not clipped
    marginBottom: 4, // Reduced to offset the vertical padding
  },
  card: {
    width: COLUMN_WIDTH,
    height: COLUMN_WIDTH * 1.5,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#141414',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  cardFocused: {
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
  gridList: {
    flex: 1,
  },
  cardInner: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#e50914',
  },
  badgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
  cardFocusedBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 3,
    borderColor: '#fff',
    borderRadius: 8,
  },
});
