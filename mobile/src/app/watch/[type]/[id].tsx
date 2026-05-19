import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { ArrowLeft } from 'lucide-react-native';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

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
        source={{ uri: playerUrl }}
        style={styles.webview}
        allowsFullscreenVideo={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={renderLoading}
        userAgent="Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Mobile Safari/537.36"
      />
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
});
