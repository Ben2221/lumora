import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Platform, ActivityIndicator, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { ArrowLeft, Play } from 'lucide-react-native';
import { Image } from 'expo-image';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { API_BASE_URL } from '@/constants/api';
import { useContinueWatching } from '@/hooks/useContinueWatching';
import { MediaItem } from '@/constants/mockData';

const { width } = Dimensions.get('window');

export default function WatchScreen() {
  const { type, id, season, episode } = useLocalSearchParams<{ 
    type: 'movie' | 'tv'; 
    id: string; 
    season?: string; 
    episode?: string; 
  }>();
  
  const router = useRouter();
  const theme = useTheme();
  const safeAreaInsets = useSafeAreaInsets();
  const { saveToContinueWatching } = useContinueWatching();
  const webviewRef = useRef<WebView>(null);

  const [media, setMedia] = useState<MediaItem | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Construct URL based on VidKing API docs
  let playerUrl = `https://www.vidking.net/embed/${type}/${id}`;

  const queryParams = new URLSearchParams({
    color: 'e50914',
    autoPlay: 'true'
  });

  if (type === 'tv') {
    const activeSeason = season || '1';
    const activeEpisode = episode || '1';
    playerUrl += `/${activeSeason}/${activeEpisode}`;
    
    queryParams.append('nextEpisode', 'true');
    queryParams.append('episodeSelector', 'true');
  }

  // Force auto-subtitles in English
  queryParams.append('sub', 'en');
  queryParams.append('subtitles', 'en');
  queryParams.append('subtitle', 'en');
  queryParams.append('cc_load_policy', '1');
  queryParams.append('cc_lang_pref', 'en');
  queryParams.append('hl', 'en');
  queryParams.append('lang', 'en');

  playerUrl += `?${queryParams.toString()}`;

  // Fetch real media details and add to Continue Watching list
  useEffect(() => {
    if (!id || !type) return;
    
    let active = true;
    const fetchDetails = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/media/${type}/${id}`);
        if (!res.ok) throw new Error('Failed to fetch details');
        const json = await res.json();
        if (active && json) {
          setMedia(json);
          saveToContinueWatching(json);
        }
      } catch (err) {
        console.warn('[Watch] Failed to fetch real metadata, using minimal fallback:', err);
        const fallbackItem: MediaItem = {
          id: parseInt(id),
          title: type === 'tv' ? `TV Series (ID: ${id})` : `Movie (ID: ${id})`,
          overview: 'Enjoy your viewing session. Lumora automatically manages English subtitles.',
          poster_path: '',
          backdrop_path: '',
          release_date: '',
          vote_average: 8.0,
          type: type
        };
        if (active) {
          setMedia(fallbackItem);
          saveToContinueWatching(fallbackItem);
        }
      }
    };

    fetchDetails();
    return () => {
      active = false;
    };
  }, [id, type]);

  const handlePlayClick = () => {
    setIsPaused(false);
    if (webviewRef.current) {
      const playCmd = `
        try {
          window.postMessage(JSON.stringify({ event: 'play' }), '*');
          window.postMessage({ event: 'play' }, '*');
        } catch(e) {}
        true;
      `;
      webviewRef.current.injectJavaScript(playCmd);
    }
  };

  const onMessage = (event: any) => {
    try {
      const rawData = event.nativeEvent.data;
      if (!rawData) return;
      const data = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
      if (data && typeof data === 'object') {
        const status = data.event || data.status;
        if (status === 'pause' || status === 'paused') {
          setIsPaused(true);
        } else if (status === 'play' || status === 'playing') {
          setIsPaused(false);
        }
      }
    } catch (e) {
      // Ignore parsing errors for other non-JSON events
    }
  };

  const injectedJS = `
    (function() {
      window.addEventListener('message', function(event) {
        if (event.origin.includes('vidking.net') || event.origin.includes('vidking')) {
          try {
            window.ReactNativeWebView.postMessage(JSON.stringify(event.data));
          } catch(e) {}
        }
      });
    })();
    true;
  `;

  const renderLoading = () => (
    <View style={styles.loadingOverlay}>
      <ActivityIndicator size="large" color="#e50914" />
      <Text style={styles.loadingText}>Initializing Stream...</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: '#000' }]}>
      {/* Floating Back Header Panel */}
      <View style={[styles.headerOverlay, { paddingTop: Math.max(safeAreaInsets.top, Spacing.three) }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft color="#fff" size={20} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      <WebView
        ref={webviewRef}
        source={{ uri: playerUrl }}
        style={styles.webview}
        allowsFullscreenVideo={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={renderLoading}
        injectedJavaScript={injectedJS}
        onMessage={onMessage}
        onLoadEnd={() => setIsLoading(false)}
        userAgent="Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Mobile Safari/537.36"
      />

      {/* Premium Dark Glassmorphic Pause Overlay with Promo Image */}
      {isPaused && !isLoading && (
        <TouchableOpacity 
          activeOpacity={1}
          onPress={handlePlayClick}
          style={styles.pauseOverlay}
        >
          {media?.backdrop_path ? (
            <Image 
              source={{ uri: media.backdrop_path }} 
              style={styles.pauseBackdrop}
              contentFit="cover"
            />
          ) : null}
          
          <View style={styles.pauseGradient} />

          <View style={styles.pauseContent}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handlePlayClick}
              style={styles.resumeBtn}
            >
              <Play color="#fff" size={20} fill="#fff" />
              <Text style={styles.resumeBtnText}>Resume Playback</Text>
            </TouchableOpacity>

            <View style={styles.pauseMeta}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Paused</Text>
              </View>
              <Text style={styles.pauseTitle}>
                {type === 'tv' && season && episode ? `S${season}:E${episode} - ${media?.title}` : media?.title}
              </Text>
              <Text style={styles.pauseOverview}>
                {media?.overview || 'Enjoy your viewing session. Lumora automatically manages English subtitles.'}
              </Text>
            </View>

            <View style={styles.pauseSubFooter}>
              <View style={styles.subBadge}>
                <Text style={styles.subBadgeText}>Auto-Subtitles: English</Text>
              </View>
              <Text style={styles.tapText}>Tap anywhere to resume</Text>
            </View>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
  },
  headerOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  backText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  loadingText: {
    color: '#B0B4BA',
    fontSize: 14,
    fontWeight: '600',
  },
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 40,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  pauseBackdrop: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.35,
    zIndex: -2,
  },
  pauseGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: -1,
  },
  pauseContent: {
    paddingHorizontal: Spacing.six,
    alignItems: 'flex-start',
    gap: Spacing.five,
  },
  resumeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e50914',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    gap: 8,
    shadowColor: '#e50914',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  resumeBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pauseMeta: {
    gap: Spacing.two,
    maxWidth: '85%',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  pauseTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 4,
  },
  pauseOverview: {
    color: '#ccc',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  pauseSubFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
  subBadge: {
    backgroundColor: 'rgba(70,211,105,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(70,211,105,0.3)',
  },
  subBadgeText: {
    color: '#46d369',
    fontSize: 11,
    fontWeight: 'bold',
  },
  tapText: {
    color: '#888',
    fontSize: 11,
    fontWeight: '500',
  },
});
