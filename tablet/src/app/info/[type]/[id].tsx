import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Play,
  ArrowLeft,
  Plus,
  Check,
  Calendar,
  Clock,
  Layers,
  Star,
  Disc,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getMediaDetails, getSeasonEpisodes } from '@/services/tmdb';
import { useWatchlist } from '@/hooks/useWatchlist';
import { Spacing } from '@/constants/theme';
import { MediaItem } from '@/constants/mockData';

export default function InfoScreen() {
  const { type, id } = useLocalSearchParams<{ type: 'movie' | 'tv'; id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();

  const [media, setMedia] = useState<MediaItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dimensions, setDimensions] = useState({
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  });

  const [activeSeason, setActiveSeason] = useState(1);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);
  const [isSeasonDropdownOpen, setIsSeasonDropdownOpen] = useState(false);

  useEffect(() => {
    const sub = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({ width: window.width, height: window.height });
    });
    return () => sub?.remove();
  }, []);

  useEffect(() => {
    if (!id || !type) return;
    setIsLoading(true);
    getMediaDetails(id as string, type as 'movie' | 'tv')
      .then((data) => { if (data) setMedia(data); })
      .finally(() => setIsLoading(false));
  }, [id, type]);

  useEffect(() => {
    if (!media || type !== 'tv') return;
    const validSeasons = (media.seasons || []).filter(s => s.season_number > 0);
    if (validSeasons.length === 0) return;
    const first = validSeasons[0].season_number;
    setActiveSeason(first);
    fetchEpisodes(first);
  }, [media]);

  const fetchEpisodes = async (seasonNum: number) => {
    if (!id) return;
    setIsLoadingEpisodes(true);
    try {
      const eps = await getSeasonEpisodes(id as string, seasonNum);
      setEpisodes(eps);
    } catch {
      setEpisodes([]);
    } finally {
      setIsLoadingEpisodes(false);
    }
  };

  const handleSeasonChange = (seasonNum: number) => {
    setActiveSeason(seasonNum);
    setIsSeasonDropdownOpen(false);
    fetchEpisodes(seasonNum);
  };

  const handlePlay = () => {
    const params: any = { type, id };
    if (type === 'tv') { params.season = '1'; params.episode = '1'; }
    router.push({ pathname: '/watch/[type]/[id]', params } as any);
  };

  const handleEpisodePlay = (seasonNum: number, episodeNum: number) => {
    router.push({
      pathname: '/watch/[type]/[id]',
      params: { type, id, season: seasonNum.toString(), episode: episodeNum.toString() },
    } as any);
  };

  const handleToggleWatchlist = () => {
    if (!media) return;
    if (isInWatchlist(media.id)) {
      removeFromWatchlist(media.id);
    } else {
      addToWatchlist(media as MediaItem);
    }
  };

  const isLandscape = dimensions.width > dimensions.height;
  const heroHeight = isLandscape ? dimensions.height * 0.78 : dimensions.height * 0.52;

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#e50914" size="large" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!media) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Content not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.redBtn}>
          <Text style={styles.redBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const validSeasons = (media.seasons || []).filter(s => s.season_number > 0);
  const currentSeason = validSeasons.find(s => s.season_number === activeSeason) || validSeasons[0];
  const inWatchlist = isInWatchlist(media.id);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} scrollEventThrottle={16}>

        {/* ── HERO BACKDROP ── */}
        <View style={[styles.heroContainer, { height: heroHeight }]}>
          <Image
            source={{ uri: media.backdrop_path }}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
          />
          {/* Top gradient (darkens the top for the back button) */}
          <LinearGradient
            colors={['rgba(0,0,0,0.65)', 'transparent']}
            style={styles.gradientTop}
          />
          {/* Bottom gradient (fades into page background) */}
          <LinearGradient
            colors={['transparent', 'rgba(7,7,7,0.75)', '#070707']}
            locations={[0.4, 0.8, 1]}
            style={styles.gradientBottom}
          />
          {/* Left gradient (darkens info side) */}
          <LinearGradient
            colors={['rgba(0,0,0,0.75)', 'transparent']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 0.55, y: 0.5 }}
            style={StyleSheet.absoluteFillObject}
          />

          {/* Back button */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backButton, { top: 16 }]}
            activeOpacity={0.8}
          >
            <ArrowLeft color="#fff" size={20} />
          </TouchableOpacity>

          {/* Hero content anchored to bottom */}
          <View style={styles.heroContent}>
            <View style={[styles.heroRow, isLandscape && styles.heroRowLandscape]}>
              {/* Poster (only in landscape) */}
              {isLandscape && (
                <View style={styles.posterWrapper}>
                  <Image
                    source={{ uri: media.poster_path }}
                    style={styles.poster}
                    contentFit="cover"
                  />
                </View>
              )}

              {/* Text info */}
              <View style={styles.heroText}>
                <Text style={styles.heroTitle} numberOfLines={2}>{media.title}</Text>

                {/* Meta badges */}
                <View style={styles.metaRow}>
                  <Text style={styles.matchBadge}>
                    {media.vote_average ? `${(media.vote_average * 10).toFixed(0)}% Match` : '98% Match'}
                  </Text>
                  <View style={styles.metaItem}>
                    <Calendar color="#9CA3AF" size={13} />
                    <Text style={styles.metaText}>
                      {media.release_date ? media.release_date.slice(0, 4) : '2024'}
                    </Text>
                  </View>
                  {type === 'tv' ? (
                    <View style={styles.metaItem}>
                      <Layers color="#9CA3AF" size={13} />
                      <Text style={styles.metaText}>
                        {media.number_of_seasons || validSeasons.length || 1} Seasons
                      </Text>
                    </View>
                  ) : media.runtime ? (
                    <View style={styles.metaItem}>
                      <Clock color="#9CA3AF" size={13} />
                      <Text style={styles.metaText}>
                        {Math.floor(media.runtime / 60)}h {media.runtime % 60}m
                      </Text>
                    </View>
                  ) : null}
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeBadgeText}>{type.toUpperCase()}</Text>
                  </View>
                </View>

                {/* Genre pills */}
                {media.genres && media.genres.length > 0 && (
                  <View style={styles.genreRow}>
                    {media.genres.map((g: any) => (
                      <View key={g.id} style={styles.genrePill}>
                        <Text style={styles.genrePillText}>{g.name}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Overview */}
                <Text style={styles.overview} numberOfLines={isLandscape ? 4 : 3}>
                  {media.overview || 'No description available.'}
                </Text>

                {/* Action buttons */}
                <View style={styles.actionRow}>
                  <TouchableOpacity onPress={handlePlay} style={styles.playBtn} activeOpacity={0.85}>
                    <Play color="#000" size={17} fill="#000" />
                    <Text style={styles.playBtnText}>Play Now</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleToggleWatchlist}
                    style={[styles.outlineBtn, inWatchlist && styles.outlineBtnActive]}
                    activeOpacity={0.8}
                  >
                    {inWatchlist
                      ? <Check color="#e50914" size={17} strokeWidth={3} />
                      : <Plus color="#fff" size={17} />
                    }
                    <Text style={[styles.outlineBtnText, inWatchlist && { color: '#e50914' }]}>
                      {inWatchlist ? 'In My List' : 'My List'}
                    </Text>
                  </TouchableOpacity>

                  {media.trailer_key && (
                    <TouchableOpacity
                      onPress={() =>
                        WebBrowser.openBrowserAsync(
                          `https://www.youtube.com/watch?v=${media.trailer_key}`
                        )
                      }
                      style={styles.outlineBtn}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.outlineBtnText, { color: '#e50914' }]}>
                        ▶ Trailer
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ── EPISODES (TV only) ── */}
        {type === 'tv' && validSeasons.length > 0 && (
          <View style={styles.section}>
            <View style={styles.episodeHeader}>
              <View style={styles.sectionTitleRow}>
                <Disc color="#e50914" size={18} />
                <Text style={styles.sectionTitle}>Episodes</Text>
              </View>

              {/* Season dropdown */}
              <View style={styles.seasonDropdownWrapper}>
                <TouchableOpacity
                  onPress={() => setIsSeasonDropdownOpen(v => !v)}
                  style={styles.seasonDropdownBtn}
                  activeOpacity={0.8}
                >
                  <Text style={styles.seasonDropdownLabel}>
                    {currentSeason?.name || `Season ${activeSeason}`}
                  </Text>
                  <Text style={styles.seasonEpCount}>
                    ({currentSeason?.episode_count || 0} Eps)
                  </Text>
                  {isSeasonDropdownOpen
                    ? <ChevronUp color="#9CA3AF" size={14} />
                    : <ChevronDown color="#9CA3AF" size={14} />
                  }
                </TouchableOpacity>

                {isSeasonDropdownOpen && (
                  <>
                    <View style={styles.seasonDropdownList}>
                      {validSeasons.map((s) => (
                        <TouchableOpacity
                          key={s.id}
                          onPress={() => handleSeasonChange(s.season_number)}
                          style={[
                            styles.seasonDropdownItem,
                            activeSeason === s.season_number && styles.seasonDropdownItemActive,
                          ]}
                        >
                          <Text style={[
                            styles.seasonDropdownItemText,
                            activeSeason === s.season_number && { color: '#fff', fontWeight: 'bold' },
                          ]}>
                            {s.name || `Season ${s.season_number}`}
                          </Text>
                          <Text style={[
                            styles.seasonEpCountSmall,
                            activeSeason === s.season_number && { color: '#fff' },
                          ]}>
                            {s.episode_count} Ep
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                )}
              </View>
            </View>

            {isLoadingEpisodes ? (
              <ActivityIndicator color="#e50914" style={{ marginTop: 20 }} />
            ) : (
              <View style={[styles.episodeGrid, isLandscape && styles.episodeGridLandscape]}>
                {episodes.map((ep) => (
                  <TouchableOpacity
                    key={ep.id}
                    onPress={() => handleEpisodePlay(activeSeason, ep.episode_number)}
                    style={[
                      styles.episodeCard,
                      isLandscape ? styles.episodeCardLandscape : styles.episodeCardPortrait,
                    ]}
                    activeOpacity={0.85}
                  >
                    <View style={styles.episodeThumbnail}>
                      {ep.still_path ? (
                        <Image
                          source={{ uri: ep.still_path }}
                          style={styles.episodeThumbnailImg}
                          contentFit="cover"
                        />
                      ) : (
                        <View style={[styles.episodeThumbnailImg, { backgroundColor: '#1a1a1a' }]} />
                      )}
                      <View style={styles.episodePlayOverlay}>
                        <View style={styles.episodePlayBtn}>
                          <Play color="#fff" size={12} fill="#fff" />
                        </View>
                      </View>
                      <View style={styles.episodeNumBadge}>
                        <Text style={styles.episodeNumText}>EP {ep.episode_number}</Text>
                      </View>
                    </View>
                    <View style={styles.episodeInfo}>
                      <Text style={styles.episodeName} numberOfLines={1}>{ep.name}</Text>
                      <Text style={styles.episodeOverview} numberOfLines={3}>{ep.overview}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ── CAST & CREW ── */}
        {((media.cast && media.cast.length > 0) || media.director) && (
          <View style={styles.section}>
            <View style={styles.sectionDivider}>
              <Text style={styles.sectionTitle}>Cast &amp; Crew</Text>
              {media.director && (
                <Text style={styles.directorLine}>
                  Director:{' '}
                  <Text style={styles.directorName}>{media.director}</Text>
                </Text>
              )}
            </View>
            {media.cast && media.cast.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.castScroll}
              >
                {media.cast.map((actor: any) => (
                  <View key={actor.id} style={styles.castCard}>
                    <View style={styles.castAvatarRing}>
                      {actor.profile_path ? (
                        <Image
                          source={{ uri: actor.profile_path }}
                          style={styles.castAvatar}
                          contentFit="cover"
                        />
                      ) : (
                        <View style={[styles.castAvatar, styles.castAvatarFallback]}>
                          <Text style={styles.castInitials}>
                            {actor.name.slice(0, 2).toUpperCase()}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.castName} numberOfLines={2}>{actor.name}</Text>
                    <Text style={styles.castCharacter} numberOfLines={1}>{actor.character}</Text>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        )}

        {/* ── MORE LIKE THIS ── */}
        {media.similar && media.similar.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionDivider}>
              <Text style={styles.sectionTitle}>More Like This</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.similarScroll}
            >
              {media.similar.map((item: any, idx: number) => (
                <TouchableOpacity
                  key={`${item.id}-${idx}`}
                  onPress={() =>
                    router.push({
                      pathname: '/info/[type]/[id]',
                      params: { type: item.type, id: item.id.toString() },
                    } as any)
                  }
                  style={styles.similarCard}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: item.poster_path }}
                    style={styles.similarCardImg}
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
        )}

        {/* ── REVIEWS ── */}
        {media.reviews && media.reviews.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionDivider}>
              <Text style={styles.sectionTitle}>User Reviews</Text>
            </View>
            <View style={[styles.reviewGrid, isLandscape && styles.reviewGridLandscape]}>
              {media.reviews.map((review: any, idx: number) => (
                <View
                  key={idx}
                  style={[
                    styles.reviewCard,
                    isLandscape ? styles.reviewCardLandscape : styles.reviewCardPortrait,
                  ]}
                >
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewAuthor}>@{review.author}</Text>
                    {review.rating && (
                      <View style={styles.reviewRatingBadge}>
                        <Star color="#e50914" size={10} fill="#e50914" />
                        <Text style={styles.reviewRatingText}>{review.rating}/10</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.reviewContent} numberOfLines={6}>
                    &ldquo;{review.content}&rdquo;
                  </Text>
                  <Text style={styles.reviewDate}>
                    {new Date(review.created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070707',
  },
  scrollContent: {
    paddingBottom: 0,
  },
  centered: {
    flex: 1,
    backgroundColor: '#070707',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 12,
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Outfit-Bold',
  },
  redBtn: {
    backgroundColor: '#e50914',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 6,
  },
  redBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Outfit-Bold',
    fontSize: 14,
  },

  // Hero
  heroContainer: {
    width: '100%',
    position: 'relative',
    backgroundColor: '#000',
    justifyContent: 'flex-end',
  },
  gradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    zIndex: 2,
  },
  gradientBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
    zIndex: 2,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    zIndex: 20,
  },
  heroContent: {
    position: 'relative',
    zIndex: 10,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
  },
  heroRow: {
    flexDirection: 'column',
    gap: Spacing.three,
  },
  heroRowLandscape: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 28,
  },
  posterWrapper: {
    width: 160,
    aspectRatio: 2 / 3,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    flexShrink: 0,
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  heroText: {
    flex: 1,
    gap: 10,
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: '900',
    color: '#fff',
    fontFamily: 'Outfit-Black',
    lineHeight: 50,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  matchBadge: {
    color: '#46d369',
    fontWeight: 'bold',
    fontSize: 13,
    fontFamily: 'Inter-Bold',
    backgroundColor: 'rgba(70,211,105,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(70,211,105,0.2)',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: '#9CA3AF',
    fontSize: 13,
    fontFamily: 'Inter-Medium',
  },
  typeBadge: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  typeBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
    letterSpacing: 1,
  },
  genreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genrePill: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  genrePillText: {
    color: '#9CA3AF',
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    fontWeight: '600',
  },
  overview: {
    color: '#D1D5DB',
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'Inter-Regular',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 6,
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#e50914',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    shadowColor: '#e50914',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  playBtnText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
    fontFamily: 'Outfit-Bold',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  outlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  outlineBtnActive: {
    borderColor: '#e50914',
    backgroundColor: 'rgba(229,9,20,0.08)',
  },
  outlineBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    fontFamily: 'Outfit-Bold',
  },

  // Trailer
  trailerContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
  },
  trailerWebView: {
    flex: 1,
    backgroundColor: '#000',
  },

  // Section wrapper
  section: {
    paddingHorizontal: Spacing.four,
    marginTop: Spacing.five,
  },
  sectionDivider: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    paddingBottom: 14,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    fontFamily: 'Outfit-Bold',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  directorLine: {
    color: '#9CA3AF',
    fontSize: 13,
    fontFamily: 'Inter-Regular',
  },
  directorName: {
    color: '#fff',
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },

  // Episodes
  episodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    paddingBottom: 14,
    marginBottom: 20,
    zIndex: 200,  // must sit above the episode grid rendered below it
  },
  seasonDropdownWrapper: {
    position: 'relative',
    zIndex: 50,
  },
  seasonDropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  seasonDropdownLabel: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
    fontFamily: 'Outfit-Bold',
  },
  seasonEpCount: {
    color: '#9CA3AF',
    fontSize: 11,
    fontFamily: 'Inter-Regular',
  },
  seasonEpCountSmall: {
    color: '#777',
    fontSize: 11,
    fontFamily: 'Inter-Regular',
  },
  seasonDropdownList: {
    position: 'absolute',
    right: 0,
    top: '110%',
    width: 220,
    backgroundColor: 'rgba(7,7,7,0.97)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    overflow: 'hidden',
    zIndex: 60,
    maxHeight: 240,
  },
  seasonDropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  seasonDropdownItemActive: {
    backgroundColor: '#e50914',
  },
  seasonDropdownItemText: {
    color: '#D1D5DB',
    fontSize: 13,
    fontFamily: 'Inter-Medium',
  },
  episodeGrid: {
    flexDirection: 'column',
    gap: 16,
  },
  episodeGridLandscape: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  episodeCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 8,
    overflow: 'hidden',
    flexDirection: 'column',
  },
  episodeCardPortrait: {
    width: '100%',
  },
  episodeCardLandscape: {
    width: '31.5%',
    margin: '0.9%',
  },
  episodeThumbnail: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#111',
    position: 'relative',
  },
  episodeThumbnailImg: {
    width: '100%',
    height: '100%',
  },
  episodePlayOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  episodePlayBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e50914',
    alignItems: 'center',
    justifyContent: 'center',
  },
  episodeNumBadge: {
    position: 'absolute',
    bottom: 6,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  episodeNumText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
    letterSpacing: 0.5,
  },
  episodeInfo: {
    padding: 12,
  },
  episodeName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  episodeOverview: {
    color: '#9CA3AF',
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    lineHeight: 16,
  },

  // Cast
  castScroll: {
    gap: 20,
    paddingBottom: 8,
  },
  castCard: {
    width: 90,
    alignItems: 'center',
    gap: 6,
  },
  castAvatarRing: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  castAvatar: {
    width: '100%',
    height: '100%',
  },
  castAvatarFallback: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  castInitials: {
    color: '#9CA3AF',
    fontWeight: 'bold',
    fontSize: 18,
    fontFamily: 'Outfit-Bold',
  },
  castName: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
    lineHeight: 14,
  },
  castCharacter: {
    color: '#6B7280',
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },

  // Similar
  similarScroll: {
    gap: 12,
    paddingBottom: 8,
  },
  similarCard: {
    width: 130,
    aspectRatio: 2 / 3,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    position: 'relative',
  },
  similarCardImg: {
    width: '100%',
    height: '100%',
  },
  cardBadge: {
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
  cardBadgeText: {
    color: '#fff',
    fontSize: 7,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },

  // Reviews
  reviewGrid: {
    gap: 14,
  },
  reviewGridLandscape: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  reviewCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    padding: 16,
    gap: 10,
  },
  reviewCardPortrait: {
    width: '100%',
  },
  reviewCardLandscape: {
    width: '31.5%',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewAuthor: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  reviewRatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(229,9,20,0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(229,9,20,0.2)',
  },
  reviewRatingText: {
    color: '#e50914',
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
  reviewContent: {
    color: '#9CA3AF',
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'Inter-Regular',
    fontStyle: 'italic',
  },
  reviewDate: {
    color: '#4B5563',
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
});
