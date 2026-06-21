import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Search, Flame } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { searchMedia } from '@/services/tmdb';
import { MediaItem } from '@/constants/mockData';
import { Spacing } from '@/constants/theme';

export default function SearchScreen() {
  const { q } = useLocalSearchParams<{ q: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [results, setResults] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dimensions, setDimensions] = useState({
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  });

  useEffect(() => {
    const sub = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({ width: window.width, height: window.height });
    });
    return () => sub?.remove();
  }, []);

  useEffect(() => {
    if (!q) { setIsLoading(false); return; }
    setIsLoading(true);
    searchMedia(q)
      .then(data => setResults(Array.isArray(data) ? data : []))
      .catch(() => setResults([]))
      .finally(() => setIsLoading(false));
  }, [q]);

  const isLandscape = dimensions.width > dimensions.height;
  const cols = isLandscape ? 6 : 4;
  const cardWidth = (dimensions.width - 80) / cols;

  const handlePress = (item: MediaItem) => {
    router.push({
      pathname: '/info/[type]/[id]',
      params: { type: item.type, id: item.id.toString() },
    } as any);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
          <ArrowLeft color="#fff" size={20} />
        </TouchableOpacity>
        <View style={styles.titleRow}>
          <Search color="#e50914" size={20} />
          <Text style={styles.title}>Search Results</Text>
        </View>
        {q ? (
          <Text style={styles.queryLabel}>
            Showing matches for:{' '}
            <Text style={styles.queryText}>"{q}"</Text>
          </Text>
        ) : null}
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#e50914" size="large" />
          <Text style={styles.hint}>Searching titles...</Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.centered}>
          <Flame color="#444" size={64} />
          <Text style={styles.emptyTitle}>No results found</Text>
          <Text style={styles.emptyHint}>
            We couldn&apos;t find any matches for &ldquo;{q}&rdquo;. Try different keywords.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.grid}>
          {results.map((item, idx) => (
            <TouchableOpacity
              key={`${item.id}-${idx}`}
              onPress={() => handlePress(item)}
              style={[styles.card, { width: cardWidth }]}
              activeOpacity={0.8}
            >
              <Image source={{ uri: item.poster_path }} style={styles.cardImg} contentFit="cover" />
              {item.type === 'tv' && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>SERIES</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070707',
  },
  header: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    gap: 6,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
    fontFamily: 'Outfit-Bold',
  },
  queryLabel: {
    color: '#9CA3AF',
    fontSize: 13,
    fontFamily: 'Inter-Regular',
  },
  queryText: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 32,
  },
  hint: {
    color: '#9CA3AF',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  emptyTitle: {
    color: '#D1D5DB',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Outfit-Bold',
    marginTop: 8,
  },
  emptyHint: {
    color: '#6B7280',
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 400,
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 14,
  },
  card: {
    aspectRatio: 2 / 3,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    position: 'relative',
  },
  cardImg: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: '#e50914',
  },
  badgeText: {
    color: '#fff',
    fontSize: 7,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
});
