import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text, Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useWatchlist } from '@/hooks/useWatchlist';
import { MediaItem } from '@/constants/mockData';
import { Spacing, BottomTabInset } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { TabBar } from '@/components/TabBar';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - Spacing.four * 2 - Spacing.two * 2) / 3;

export default function MyListScreen() {
  const { watchlist, refreshWatchlist } = useWatchlist();
  const theme = useTheme();
  const router = useRouter();
  const safeAreaInsets = useSafeAreaInsets();

  React.useEffect(() => {
    refreshWatchlist();
  }, [watchlist]);

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
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{item.type.toUpperCase()}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: Math.max(safeAreaInsets.top, Spacing.three) }]}>
        <Text style={styles.headerTitle}>My List</Text>
      </View>

      {watchlist.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            Your watchlist is empty.
          </Text>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => router.push('/')}
          >
            <Text style={styles.exploreButtonText}>Find Something to Watch</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={watchlist}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          contentContainerStyle={[
            styles.listContainer,
            { paddingBottom: safeAreaInsets.bottom + BottomTabInset + Spacing.four }
          ]}
          columnWrapperStyle={styles.row}
        />
      )}
      <TabBar activeTab="mylist" />
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
    borderBottomColor: '#222',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#e50914',
    letterSpacing: 0.5,
    fontFamily: 'Outfit-Black',
  },
  listContainer: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  row: {
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
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e50914',
  },
  badgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: Spacing.four,
    fontFamily: 'Inter-Medium',
  },
  exploreButton: {
    backgroundColor: '#e50914',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: 24,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Outfit-Bold',
  },
});
