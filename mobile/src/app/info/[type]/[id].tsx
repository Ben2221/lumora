import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions, 
  Modal, 
  FlatList,
  Platform,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import { ArrowLeft, Play, Plus, Check, Star, Calendar, Clock, ChevronDown } from 'lucide-react-native';
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

const { width } = Dimensions.get('window');

export default function InfoScreen() {
  const { type, id } = useLocalSearchParams<{ type: 'movie' | 'tv'; id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const safeAreaInsets = useSafeAreaInsets();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();

  const [media, setMedia] = useState<MediaItem | null>(null);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [isSeasonModalVisible, setIsSeasonModalVisible] = useState(false);
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
        console.warn('[Info] Failed to fetch real media details, using fallback:', err);
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

  // Fetch real episodes for TV shows
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
        console.warn('[Info] Failed to fetch episodes, generating mock data:', err);
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
        <View style={styles.loadingBrandContainer}>
          <Text style={styles.loadingBrandText}>LUMORA</Text>
          <ActivityIndicator size="large" color="#e50914" style={{ marginTop: Spacing.two }} />
          <Text style={styles.loadingText}>Loading Details...</Text>
        </View>
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

  const handleCastClick = async (name: string) => {
    const url = `https://www.imdb.com/find/?q=${encodeURIComponent(name)}`;
    await WebBrowser.openBrowserAsync(url);
  };

  const playUrlParams = type === 'tv' 
    ? { pathname: '/watch/[type]/[id]', params: { type, id, season: selectedSeason.toString(), episode: '1' } }
    : { pathname: '/watch/[type]/[id]', params: { type, id } };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Backdrop Poster Banner */}
        <View style={styles.backdropContainer}>
          <Image
            source={{ uri: media.backdrop_path }}
            style={styles.backdropImage}
            contentFit="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.95)']}
            style={styles.gradientOverlay}
          />
          
          {/* Floating Back Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.back()}
            style={[styles.backButton, { top: Math.max(safeAreaInsets.top, Spacing.three) }]}
          >
            <ArrowLeft color="#fff" size={24} />
          </TouchableOpacity>
        </View>

        {/* Media Metadata Details Section */}
        <View style={styles.detailsWrapper}>
          <Text style={styles.title}>{media.title}</Text>
          
          <View style={styles.metadataRow}>
            <Text style={styles.matchText}>95% Match</Text>
            <View style={styles.metaBadge}>
              <Calendar color="#B0B4BA" size={12} />
              <Text style={styles.metaBadgeText}>{media.release_date.slice(0, 4)}</Text>
            </View>
            <View style={styles.metaBadge}>
              <Star color="#e50914" size={12} fill="#e50914" />
              <Text style={styles.metaBadgeText}>{media.vote_average.toFixed(1)}</Text>
            </View>
            <View style={styles.metaBadge}>
              <Clock color="#B0B4BA" size={12} />
              <Text style={styles.metaBadgeText}>
                {media.type === 'tv' 
                  ? `${media.number_of_seasons || media.seasons?.length || 1} Seasons`
                  : `${media.runtime || 120} min`
                }
              </Text>
            </View>
          </View>

          {/* Action buttons (Play & List) */}
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.playButton}
            onPress={() => router.push(playUrlParams as any)}
          >
            <Play color="#fff" size={18} fill="#fff" />
            <Text style={styles.playButtonText}>Play</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.listButton, isBookmarked && styles.listButtonActive]}
            onPress={handleToggleWatchlist}
          >
            {isBookmarked ? (
              <Check color="#e50914" size={18} strokeWidth={3} />
            ) : (
              <Plus color="#fff" size={18} />
            )}
            <Text style={[styles.listButtonText, isBookmarked && { color: '#e50914' }]}>
              {isBookmarked ? 'In My List' : 'My List'}
            </Text>
          </TouchableOpacity>

          {/* Synopsis */}
          <Text style={[styles.overview, { color: theme.text }]}>
            {media.overview}
          </Text>

          {/* Director details */}
          {media.director && (
            <Text style={styles.creatorRow}>
              <Text style={[styles.metaLabel, { color: theme.textSecondary }]}>Director: </Text>
              {media.director.split(',').map((name, index, array) => {
                const trimmedName = name.trim();
                return (
                  <React.Fragment key={trimmedName}>
                    <Text 
                      style={styles.creatorValue} 
                      onPress={() => handleCastClick(trimmedName)}
                    >
                      {trimmedName}
                    </Text>
                    {index < array.length - 1 && (
                      <Text style={[styles.metaLabel, { color: theme.textSecondary }]}>, </Text>
                    )}
                  </React.Fragment>
                );
              })}
            </Text>
          )}

          {/* Cast Cards */}
          {media.cast && media.cast.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Cast & Crew</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={styles.castScroll}
              >
                {media.cast.map((actor, idx) => (
                  <TouchableOpacity
                    key={idx}
                    activeOpacity={0.8}
                    style={styles.castCard}
                    onPress={() => handleCastClick(actor.name)}
                  >
                    <View style={styles.castAvatar}>
                      {actor.profile_path ? (
                        <Image
                          source={{ uri: actor.profile_path }}
                          style={styles.avatarImage}
                        />
                      ) : (
                        <View style={styles.avatarPlaceholder}>
                          <Text style={styles.placeholderText}>
                            {actor.name.substring(0, 2).toUpperCase()}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.castName} numberOfLines={1}>{actor.name}</Text>
                    <Text style={[styles.castCharacter, { color: theme.textSecondary }]} numberOfLines={1}>
                      {actor.character}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Season Selector for TV Shows */}
          {media.type === 'tv' && media.seasons && media.seasons.length > 0 && (
            <View style={styles.seasonContainer}>
              <Text style={styles.sectionTitle}>Episodes</Text>
              
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.seasonSelectButton}
                onPress={() => setIsSeasonModalVisible(true)}
              >
                <Text style={styles.seasonSelectText}>
                  Season {selectedSeason} ({media.seasons.find(s => s.season_number === selectedSeason)?.episode_count || 8} Episodes)
                </Text>
                <ChevronDown color="#fff" size={16} />
              </TouchableOpacity>

              {/* Episode List */}
              <View style={styles.episodeList}>
                {episodesLoading ? (
                  <ActivityIndicator size="small" color="#e50914" style={{ marginVertical: 20 }} />
                ) : (
                  episodes.map((episodeItem, epIdx) => (
                    <TouchableOpacity
                      key={episodeItem.id || epIdx}
                      activeOpacity={0.8}
                      style={styles.episodeRow}
                      onPress={() => {
                        router.push({
                          pathname: '/watch/[type]/[id]',
                          params: { 
                            type: 'tv', 
                            id: media.id.toString(), 
                            season: selectedSeason.toString(), 
                            episode: episodeItem.episode_number.toString() 
                          }
                        } as any);
                      }}
                    >
                      <View style={styles.episodeInfo}>
                        <Text style={styles.episodeNumber}>{episodeItem.episode_number}</Text>
                        {episodeItem.still_path ? (
                          <Image 
                            source={{ uri: episodeItem.still_path }} 
                            style={styles.episodeImage} 
                            contentFit="cover"
                          />
                        ) : null}
                        <View style={styles.episodeMeta}>
                          <Text style={styles.episodeTitle} numberOfLines={1}>
                            {episodeItem.name}
                          </Text>
                          <Text style={[styles.episodeOverviewText, { color: theme.textSecondary }]} numberOfLines={2}>
                            {episodeItem.overview || 'No description available.'}
                          </Text>
                        </View>
                      </View>
                      <Play color="#e50914" size={14} fill="#e50914" />
                    </TouchableOpacity>
                  ))
                )}
              </View>
            </View>
          )}

          {/* More Like This (Similar Titles) */}
          {media && media.similar && media.similar.length > 0 && (
            <View style={styles.similarContainer}>
              <Text style={styles.sectionTitle}>More Like This</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.similarScroll}
              >
                {media.similar.map((similarItem) => (
                  <TouchableOpacity
                    key={similarItem.id}
                    activeOpacity={0.8}
                    style={styles.similarCard}
                    onPress={() => {
                      router.push({
                        pathname: '/info/[type]/[id]',
                        params: { type: similarItem.type || type, id: similarItem.id.toString() }
                      } as any);
                    }}
                  >
                    <Image
                      source={{ uri: similarItem.poster_path }}
                      style={styles.similarPoster}
                      contentFit="cover"
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Season Selection Sheet Modal */}
      <Modal
        visible={isSeasonModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsSeasonModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalDismiss}
            activeOpacity={1}
            onPress={() => setIsSeasonModalVisible(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>Select Season</Text>
            </View>
            <FlatList
              data={media.seasons}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[
                    styles.modalOption,
                    selectedSeason === item.season_number && styles.modalOptionActive
                  ]}
                  onPress={() => {
                    setSelectedSeason(item.season_number);
                    setIsSeasonModalVisible(false);
                  }}
                >
                  <Text style={[
                    styles.modalOptionText,
                    selectedSeason === item.season_number && styles.modalOptionTextActive
                  ]}>
                    Season {item.season_number}
                  </Text>
                  <Text style={styles.modalOptionCount}>
                    {item.episode_count} Episodes
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingBrandContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  loadingBrandText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#e50914',
    letterSpacing: 3,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
  },
  loadingText: {
    color: '#B0B4BA',
    fontSize: 13,
    fontWeight: '600',
    marginTop: Spacing.two,
    letterSpacing: 0.5,
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  backdropContainer: {
    width: '100%',
    height: width * 0.56, // 16:9 ratio
    position: 'relative',
    backgroundColor: '#000',
  },
  backdropImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    left: Spacing.four,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  detailsWrapper: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fff',
    marginBottom: Spacing.two,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginBottom: Spacing.four,
    flexWrap: 'wrap',
  },
  matchText: {
    color: '#46d369',
    fontWeight: 'bold',
    fontSize: 14,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  metaBadgeText: {
    color: '#B0B4BA',
    fontSize: 11,
    fontWeight: 'bold',
  },
  playButton: {
    flexDirection: 'row',
    backgroundColor: '#e50914',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    borderRadius: 6,
    marginBottom: Spacing.two,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: Spacing.four,
  },
  listButtonActive: {
    borderColor: 'rgba(229,9,20,0.2)',
    backgroundColor: 'rgba(229,9,20,0.05)',
  },
  listButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  overview: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '400',
    marginBottom: Spacing.four,
  },
  creatorRow: {
    flexDirection: 'row',
    marginBottom: Spacing.four,
  },
  metaLabel: {
    fontSize: 13,
  },
  creatorValue: {
    fontSize: 13,
    color: '#e50914',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  sectionContainer: {
    marginTop: Spacing.two,
    marginBottom: Spacing.four,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: Spacing.three,
  },
  castScroll: {
    gap: Spacing.three,
  },
  castCard: {
    alignItems: 'center',
    width: 80,
  },
  castAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 6,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#B0B4BA',
    fontWeight: 'bold',
    fontSize: 14,
  },
  castName: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  castCharacter: {
    fontSize: 10,
    textAlign: 'center',
  },
  seasonContainer: {
    marginTop: Spacing.two,
  },
  seasonSelectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#222',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: Spacing.three,
  },
  seasonSelectText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  episodeList: {
    gap: Spacing.two,
  },
  episodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  episodeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  episodeNumber: {
    color: '#e50914',
    fontSize: 16,
    fontWeight: '900',
    width: 20,
  },
  episodeMeta: {
    justifyContent: 'center',
  },
  episodeTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  episodeDuration: {
    fontSize: 11,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalDismiss: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#111',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '50%',
    paddingBottom: 24,
  },
  modalHeader: {
    paddingVertical: Spacing.three,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  modalHeaderTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  modalOptionActive: {
    backgroundColor: 'rgba(229,9,20,0.05)',
  },
  modalOptionText: {
    color: '#B0B4BA',
    fontSize: 15,
    fontWeight: '500',
  },
  modalOptionTextActive: {
    color: '#e50914',
    fontWeight: 'bold',
  },
  modalOptionCount: {
    color: '#60646C',
    fontSize: 12,
  },
  episodeImage: {
    width: 80,
    height: 45,
    borderRadius: 4,
    backgroundColor: '#1a1a1a',
  },
  episodeOverviewText: {
    fontSize: 11,
    marginTop: 2,
    maxWidth: width - 180,
  },
  similarContainer: {
    marginTop: Spacing.four,
    marginBottom: Spacing.four,
  },
  similarScroll: {
    gap: Spacing.two,
  },
  similarCard: {
    width: 100,
    height: 150,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  similarPoster: {
    width: '100%',
    height: '100%',
  },
});
