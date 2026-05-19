import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  Dimensions, 
  Platform 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { TabBar } from '@/components/TabBar';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - Spacing.four * 2 - Spacing.two * 2) / 3;

export default function ExploreScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MediaItem[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  // Combine database lists to search
  const allMedia = [...trendingMovies, ...newReleases, ...mockTVShows];

  useEffect(() => {
    const trimmed = query.trim().toLowerCase();
    if (trimmed.length < 2) {
      // Show default recommendations when search is empty
      setResults(allMedia.slice(0, 9));
      return;
    }

    const filtered = allMedia.filter(item => 
      item.title.toLowerCase().includes(trimmed) || 
      item.overview.toLowerCase().includes(trimmed)
    );
    // Remove duplicates by ID
    const unique = filtered.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
    setResults(unique);
  }, [query]);

  const renderItem = ({ item }: { item: MediaItem }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.card}
      onPress={() => {
        router.push({
          pathname: '/info/[type]/[id]',
          params: { type: item.type, id: item.id.toString() }
        });
      }}
    >
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
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Search Header Area */}
      <View style={[styles.header, { paddingTop: Math.max(safeAreaInsets.top, Spacing.three) }]}>
        <View style={[
          styles.searchBox,
          isFocused && styles.searchBoxFocused
        ]}>
          <SearchIcon color={isFocused ? '#e50914' : '#60646C'} size={18} />
          <TextInput
            style={styles.input}
            placeholder="Search movies, series, genres..."
            placeholderTextColor="#60646C"
            value={query}
            onChangeText={setQuery}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <X color="#aaa" size={16} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Results Header Label */}
      <Text style={styles.resultsLabel}>
        {query.trim().length >= 2 ? `Search Results (${results.length})` : 'Popular Searches'}
      </Text>

      {/* Search Grid */}
      <FlatList
        data={results}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString() + '-' + item.type}
        numColumns={3}
        contentContainerStyle={[styles.gridContent, { paddingBottom: safeAreaInsets.bottom + Spacing.six }]}
        columnWrapperStyle={styles.gridRow}
      />
      <TabBar activeTab="explore" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: '#161616',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161616',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 24,
    paddingHorizontal: Spacing.three,
    height: 44,
    gap: Spacing.two,
  },
  searchBoxFocused: {
    borderColor: '#e50914',
    backgroundColor: '#000',
    // In React Native shadows work differently, clear borders match premium styling
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    padding: 0, // Reset standard input padding
  },
  resultsLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.two,
  },
  gridContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  gridRow: {
    justifyContent: 'flex-start',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  card: {
    width: COLUMN_WIDTH,
    height: COLUMN_WIDTH * 1.5,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#111',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: '#e50914',
  },
  badgeText: {
    color: '#fff',
    fontSize: 6,
    fontWeight: 'bold',
  },
});
