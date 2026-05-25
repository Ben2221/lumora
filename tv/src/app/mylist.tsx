import React, { useRef, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, Pressable, Text, Dimensions, Animated, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter, useFocusEffect } from 'expo-router';
import { useWatchlist } from '@/hooks/useWatchlist';
import { MediaItem } from '@/constants/mockData';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { SideNavigation } from '@/components/SideNavigation';

const { width } = Dimensions.get('window');
const availableWidth = width - 80 - 80; // subtracting sidebar (80) and horizontal padding (40 * 2)
const COLUMN_WIDTH = (availableWidth - 16 * 4) / 5; // 5 columns on TV

export default function TVMyListScreen() {
  const { watchlist, refreshWatchlist } = useWatchlist();
  const theme = useTheme();
  const router = useRouter();
  const safeAreaInsets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      refreshWatchlist();
    }, [])
  );

  const handleMediaPress = (item: MediaItem) => {
    router.push({
      pathname: '/info/[type]/[id]',
      params: { type: item.type, id: item.id.toString() }
    });
  };

  const MovieCard = ({ item, onPress }: { item: MediaItem; onPress: () => void }) => {
    const scale = useRef(new Animated.Value(1)).current;
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = () => {
      setIsFocused(true);
      Animated.timing(scale, {
        toValue: 1.12,
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
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.type.toUpperCase()}</Text>
              </View>
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
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Watchlist</Text>
        </View>

        {watchlist.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Your watchlist is empty. Add movies and series from the Home screen.
            </Text>
            <Pressable
              focusable={true}
              style={({ focused }: any) => [
                styles.exploreButton,
                focused && styles.exploreButtonFocused
              ]}
              onPress={() => router.push('/')}
            >
              {({ focused }: any) => (
                <Text style={[
                  styles.exploreButtonText,
                  focused && { color: '#000' }
                ]}>
                  Find Something to Watch
                </Text>
              )}
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={watchlist}
            renderItem={renderItem}
            keyExtractor={(item: any) => item.id.toString() + '-' + item.type}
            numColumns={5}
            removeClippedSubviews={false}
            initialNumToRender={10}
            windowSize={11}
            contentContainerStyle={styles.listContainer}
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={false}
            style={styles.gridList}
            focusable={false}
          />
        )}
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
    paddingHorizontal: 40,
    paddingTop: 30,
    backgroundColor: '#000',
  },
  header: {
    paddingBottom: Spacing.two,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
    fontFamily: 'Outfit-Black',
  },
  listContainer: {
    paddingTop: Spacing.three,
    paddingBottom: 60,
  },
  row: {
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: Spacing.four,
    fontFamily: 'Inter-Medium',
    maxWidth: 500,
    lineHeight: 26,
  },
  exploreButton: {
    backgroundColor: '#e50914',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 8,
  },
  exploreButtonFocused: {
    backgroundColor: '#fff',
    transform: [{ scale: 1.05 }],
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Outfit-Bold',
  },
});
