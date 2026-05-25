import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  ActivityIndicator,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { TVPressable } from '@/components/TVPressable';
import { Image } from 'expo-image';
import { Play, Plus, Check, Star, Calendar, Clock, ArrowLeft } from 'lucide-react-native';
import {
  trendingMovies,
  newReleases,
  mockTVShows,
  MediaItem
} from '@/constants/mockData';
import { useWatchlist } from '@/hooks/useWatchlist';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getMediaDetails, getSeasonEpisodes } from '@/services/tmdb';

const { width, height } = Dimensions.get('window');

export default function TVInfoScreen() {
  const { type, id } = useLocalSearchParams<{ type: 'movie' | 'tv'; id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();

  const [media, setMedia] = useState<MediaItem | null>(null);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [episodesLoading, setEpisodesLoading] = useState(false);

  // Fetch real media details
  useEffect(() => {
    if (!id || !type) return;

    let active = true;
    const fetchDetails = async () => {
      try {
        const json = await getMediaDetails(id, type);
        if (active && json) {
          setMedia(json);
        }
      } catch (err) {
        console.warn('[TV Info] Failed to fetch media details, using fallback:', err);
        const mediaId = parseInt(id);
        let match: MediaItem | undefined;

        if (type === 'tv') {
          match = mockTVShows.find(s => s.id === mediaId);
        } else {
          match = [...trendingMovies, ...newReleases].find(m => m.id === mediaId);
        }

        if (active) {
          setMedia(match || {
            id: mediaId,
            title: type === 'tv' ? 'Featured Series' : 'Featured Film',
            overview: 'Browse premium content streaming on Lumora.',
            poster_path: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
            backdrop_path: 'https://image.tmdb.org/t/p/original/pbrkL804c8yAv3zBZR4QPEafpAR.jpg',
            release_date: '2024',
            vote_average: 8.0,
            type: type,
            genres: [{ id: 1, name: 'Drama' }],
            cast: [
              { id: 1, name: 'Lead Actor', character: 'Hero', profile_path: null },
              { id: 2, name: 'Supporting Star', character: 'Sidekick', profile_path: null }
            ],
            director: 'Lumora Director'
          });
        }
      }
    };

    fetchDetails();
    return () => {
      active = false;
    };
  }, [type, id]);

  // Fetch episodes for TV shows
  useEffect(() => {
    if (type !== 'tv' || !id) return;

    let active = true;
    const fetchEpisodes = async () => {
      setEpisodesLoading(true);
      try {
        const json = await getSeasonEpisodes(id, selectedSeason);
        if (active) {
          setEpisodes(json);
        }
      } catch (err) {
        console.warn('[TV Info] Failed to fetch episodes, generating mock:', err);
        const episodeCount = media?.seasons?.find(s => s.season_number === selectedSeason)?.episode_count || 8;
        const generated = Array.from({ length: episodeCount }, (_, i) => ({
          id: i + 1,
          name: `Episode ${i + 1}`,
          overview: `Episode ${i + 1} of Season ${selectedSeason}.`,
          episode_number: i + 1,
          season_number: selectedSeason
        }));
        if (active) setEpisodes(generated);
      } finally {
        if (active) setEpisodesLoading(false);
      }
    };

    fetchEpisodes();
    return () => {
      active = false;
    };
  }, [type, id, selectedSeason, media]);

  if (!media) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <Text style={styles.loadingBrandText}>LUMORA</Text>
        <ActivityIndicator size="large" color="#e50914" style={{ marginTop: Spacing.four }} />
        <Text style={styles.loadingText}>Loading details...</Text>
      </View>
    );
  }

  const isBookmarked = isInWatchlist(media.id);

  const handleToggleWatchlist = () => {
    if (isBookmarked) {
      removeFromWatchlist(media.id);
    } else {
      addToWatchlist(media);
    }
  };

  const playUrlParams = type === 'tv'
    ? { pathname: '/watch/[type]/[id]', params: { type, id, season: selectedSeason.toString(), episode: '1' } }
    : { pathname: '/watch/[type]/[id]', params: { type, id } };

  const SimilarMovieCard = ({ item, onPress }: { item: any; onPress: () => void }) => {
    const scale = useRef(new Animated.Value(1)).current;
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = () => {
      setIsFocused(true);
      Animated.timing(scale, {
        toValue: 1.12,
        duration: 250,
        useNativeDriver: true,
      }).start();
    };

    const handleBlur = () => {
      setIsFocused(false);
      Animated.timing(scale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
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
        <TVPressable
          onFocus={handleFocus}
          onBlur={handleBlur}
          onPress={onPress}
          style={({ focused }: any) => [
            styles.similarCard,
            focused && styles.similarCardFocused
          ]}
        >
          <View style={styles.similarCardInner}>
            <Image
              source={{ uri: item.poster_path }}
              style={styles.similarPoster}
              contentFit="cover"
            />
          </View>
        </TVPressable>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Background Backdrop */}
      <Image
        source={{ uri: media.backdrop_path }}
        style={styles.backdropImage}
        contentFit="cover"
        pointerEvents="none"
      />
      <LinearGradient
        colors={['rgba(0,0,0,0.92)', 'rgba(0,0,0,0.85)', 'rgba(0,0,0,0.95)']}
        style={styles.backdropOverlay}
        pointerEvents="none"
      />

      {/* Floating Back Button (Focusable) */}
      <TVPressable
        onPress={() => router.back()}
        style={({ focused }: any) => [
          styles.backButton,
          focused && styles.backButtonFocused
        ]}
      >
        {({ focused }: any) => (
          <ArrowLeft color={focused ? '#000' : '#fff'} size={24} />
        )}
      </TVPressable>

      <View style={styles.contentLayout}>
        {/* LEFT COLUMN: Media details & action buttons */}
        <View style={styles.leftColumn}>
          <Text style={styles.title} numberOfLines={2}>
            {media.title}
          </Text>

          <View style={styles.metadataRow}>
            <Text style={styles.matchText}>
              {media.vote_average ? `${(media.vote_average * 10).toFixed(0)}% Match` : '95% Match'}
            </Text>
            <View style={styles.metaBadge}>
              <Calendar color="#B0B4BA" size={14} />
              <Text style={styles.metaBadgeText}>{media.release_date ? media.release_date.slice(0, 4) : '2024'}</Text>
            </View>
            <View style={styles.metaBadge}>
              <Star color="#e50914" size={14} fill="#e50914" />
              <Text style={styles.metaBadgeText}>{media.vote_average ? media.vote_average.toFixed(1) : '8.0'}</Text>
            </View>
            <View style={styles.metaBadge}>
              <Clock color="#B0B4BA" size={14} />
              <Text style={styles.metaBadgeText}>
                {media.type === 'tv'
                  ? `${media.number_of_seasons || media.seasons?.length || 1} Seasons`
                  : `${media.runtime || 120} min`
                }
              </Text>
            </View>
          </View>

          <Text style={styles.overview} numberOfLines={8}>
            {media.overview || 'Streaming exclusively on Lumora. Experience the rich storyline, stunning visual displays, and masterclass performances.'}
          </Text>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <TVPressable
              hasTVPreferredFocus={true}
              style={({ focused }: any) => [
                styles.actionButton,
                styles.playButton,
                focused && styles.playButtonFocused
              ]}
              onPress={() => router.push(playUrlParams as any)}
            >
              {({ focused }: any) => (
                <>
                  <Play color={focused ? '#fff' : '#000'} size={24} fill={focused ? '#fff' : '#000'} />
                  <Text style={[styles.playButtonText, focused && { color: '#fff' }]}>Play</Text>
                </>
              )}
            </TVPressable>
 
            <TVPressable
              style={({ focused }: any) => [
                styles.actionButton,
                styles.listButton,
                focused && styles.listButtonFocused
              ]}
              onPress={handleToggleWatchlist}
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
            </TVPressable>
          </View>

          {media.director && (
            <View style={styles.creatorContainer}>
              <Text style={styles.creatorLabel}>Director:</Text>
              <Text style={styles.creatorValue}>{media.director}</Text>
            </View>
          )}
        </View>

        {/* RIGHT COLUMN: Episodes (TV) or Cast & Recommendations (Movie) */}
        <View style={styles.rightColumn}>
          {media.type === 'tv' ? (
            <View style={styles.tvSection}>
              <Text style={styles.sectionTitle}>Episodes</Text>

              {/* Season Selection Pills */}
              {media.seasons && media.seasons.length > 1 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.seasonsPillScroll}
                >
                  {media.seasons.map((season) => {
                    const isSelected = selectedSeason === season.season_number;
                    return (
                      <TVPressable
                        key={season.season_number}
                        style={({ focused }: any) => [
                          styles.seasonPill,
                          isSelected && styles.seasonPillSelected,
                          focused && styles.seasonPillFocused
                        ]}
                        onPress={() => setSelectedSeason(season.season_number)}
                      >
                        {({ focused }: any) => (
                          <Text style={[
                            styles.seasonPillText,
                            isSelected && styles.seasonPillTextSelected,
                            focused && styles.seasonPillTextFocused
                          ]}>
                            {season.name || `Season ${season.season_number}`}
                          </Text>
                        )}
                      </TVPressable>
                    );
                  })}
                </ScrollView>
              )}

              {/* Episodes List */}
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.episodesScrollContainer}
                style={{ flex: 1 }}
              >
                {episodesLoading ? (
                  <ActivityIndicator size="small" color="#e50914" style={{ marginTop: 20 }} />
                ) : (
                  episodes.map((ep, idx) => (
                    <TVPressable
                      key={ep.id || idx}
                      style={({ focused }: any) => [
                        styles.episodeRow,
                        focused && styles.episodeRowFocused
                      ]}
                      onPress={() => {
                        router.push({
                          pathname: '/watch/[type]/[id]',
                          params: {
                            type: 'tv',
                            id: media.id.toString(),
                            season: selectedSeason.toString(),
                            episode: ep.episode_number.toString()
                          }
                        } as any);
                      }}
                    >
                      {({ focused }: any) => (
                        <View style={styles.episodeRowInner}>
                          <Text style={[styles.episodeNum, focused && styles.episodeTextFocused]}>{ep.episode_number}</Text>
                          {ep.still_path ? (
                            <Image
                              source={{ uri: ep.still_path }}
                              style={styles.episodeImage}
                              contentFit="cover"
                            />
                          ) : (
                            <View style={styles.episodeImagePlaceholder}>
                              <Play color="#666" size={16} />
                            </View>
                          )}
                          <View style={styles.episodeMeta}>
                            <Text style={[styles.episodeTitleText, focused && styles.episodeTextFocused]} numberOfLines={1}>
                              {ep.name}
                            </Text>
                            <Text style={styles.episodeOverview} numberOfLines={2}>
                              {ep.overview || 'No episode description available.'}
                            </Text>
                          </View>
                        </View>
                      )}
                    </TVPressable>
                  ))
                )}
              </ScrollView>
            </View>
          ) : (
            // Movie section: Cast + Similar movies
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.movieDetailsScroll}
              style={{ flex: 1 }}
            >
              {media.cast && media.cast.length > 0 && (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Cast & Crew</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.castScroll}
                  >
                    {media.cast.slice(0, 10).map((actor, idx) => (
                      <View key={idx} style={styles.castCard}>
                        {actor.profile_path ? (
                          <Image source={{ uri: actor.profile_path }} style={styles.castAvatar} />
                        ) : (
                          <View style={styles.castAvatarPlaceholder}>
                            <Text style={styles.castAvatarText}>{actor.name.slice(0, 2).toUpperCase()}</Text>
                          </View>
                        )}
                        <Text style={styles.castName} numberOfLines={1}>{actor.name}</Text>
                        <Text style={styles.castCharacter} numberOfLines={1}>{actor.character}</Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}

              {media.similar && media.similar.length > 0 && (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>More Like This</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.similarScroll}
                    style={{ overflow: 'visible' }}
                  >
                    {media.similar.slice(0, 10).map((similarItem) => (
                      <SimilarMovieCard
                        key={similarItem.id}
                        item={similarItem}
                        onPress={() => {
                          router.replace({
                            pathname: '/info/[type]/[id]',
                            params: { type: similarItem.type || type, id: similarItem.id.toString() }
                          } as any);
                        }}
                      />
                    ))}
                  </ScrollView>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingBrandText: {
    fontSize: 40,
    fontWeight: '900',
    color: '#e50914',
    letterSpacing: -1.5,
    fontFamily: 'Outfit-Black',
  },
  loadingText: {
    color: '#aaa',
    fontSize: 16,
    marginTop: Spacing.three,
    fontFamily: 'Inter-Medium',
  },
  backdropImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  backdropOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  backButton: {
    position: 'absolute',
    left: 54, // Shifted to align with TV safe area
    top: 54, // Shifted to align with TV safe area
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButtonFocused: {
    backgroundColor: '#fff',
    borderColor: '#fff',
    transform: [{ scale: 1.05 }],
  },
  contentLayout: {
    flex: 1,
    flexDirection: 'row',
    paddingTop: 120, // Increased to accommodate shifted back button
    paddingHorizontal: 54, // Shifted to align with TV safe area
  },
  leftColumn: {
    width: '45%',
    paddingRight: 40,
    justifyContent: 'flex-start',
  },
  rightColumn: {
    width: '55%',
    paddingLeft: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#fff',
    fontFamily: 'Outfit-Black',
    lineHeight: 48,
    marginBottom: Spacing.two,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginBottom: Spacing.four,
  },
  matchText: {
    color: '#46d369',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  metaBadgeText: {
    color: '#B0B4BA',
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
  overview: {
    fontSize: 16,
    lineHeight: 24,
    color: '#ddd',
    fontFamily: 'Inter-Regular',
    marginBottom: Spacing.five,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginBottom: Spacing.five,
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
  creatorContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  creatorLabel: {
    color: '#888',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  creatorValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Outfit-Bold',
  },
  tvSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    marginBottom: Spacing.three,
    fontFamily: 'Outfit-Bold',
  },
  seasonsPillScroll: {
    gap: 12,
    paddingBottom: Spacing.three,
  },
  seasonPill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  seasonPillSelected: {
    backgroundColor: 'rgba(229, 9, 20, 0.15)',
    borderColor: '#e50914',
  },
  seasonPillFocused: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  seasonPillText: {
    color: '#aaa',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Outfit-Bold',
  },
  seasonPillTextSelected: {
    color: '#e50914',
  },
  seasonPillTextFocused: {
    color: '#000',
  },
  episodesScrollContainer: {
    paddingBottom: 60,
    gap: 12,
  },
  episodeRow: {
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
  },
  episodeRowFocused: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: '#fff',
    transform: [{ scale: 1.01 }],
  },
  episodeRowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  episodeNum: {
    fontSize: 18,
    fontWeight: '900',
    color: '#e50914',
    width: 24,
    textAlign: 'center',
    fontFamily: 'Outfit-Black',
  },
  episodeImage: {
    width: 100,
    height: 56,
    borderRadius: 4,
    backgroundColor: '#111',
  },
  episodeImagePlaceholder: {
    width: 100,
    height: 56,
    borderRadius: 4,
    backgroundColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
  },
  episodeMeta: {
    flex: 1,
  },
  episodeTitleText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: 'Outfit-Bold',
    marginBottom: 4,
  },
  episodeOverview: {
    color: '#aaa',
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'Inter-Regular',
  },
  episodeTextFocused: {
    color: '#fff',
  },
  movieDetailsScroll: {
    paddingBottom: 60,
  },
  sectionContainer: {
    marginBottom: Spacing.five,
  },
  castScroll: {
    gap: 16,
  },
  castCard: {
    alignItems: 'center',
    width: 90,
  },
  castAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 8,
  },
  castAvatarPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  castAvatarText: {
    color: '#aaa',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Outfit-Bold',
  },
  castName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Outfit-Bold',
    textAlign: 'center',
  },
  castCharacter: {
    color: '#888',
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  similarScroll: {
    gap: 16,
    paddingHorizontal: 16, // Extra horizontal space so scaled cards are not clipped at boundaries
    paddingVertical: 12, // Extra vertical padding so scaled cards are not clipped
  },
  similarCard: {
    width: 110,
    height: 165,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#141414',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  similarCardFocused: {
    zIndex: 10,
    borderColor: '#e50914',
    borderWidth: 3,
    backgroundColor: '#141414',
    shadowColor: '#e50914',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  similarCardInner: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  similarPoster: {
    width: '100%',
    height: '100%',
  },
});
