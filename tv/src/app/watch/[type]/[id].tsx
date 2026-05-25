import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Platform, ActivityIndicator, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { TVPressable } from '@/components/TVPressable';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { ArrowLeft, Play } from 'lucide-react-native';
import { Image } from 'expo-image';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getMediaDetails } from '@/services/tmdb';
import { useContinueWatching } from '@/hooks/useContinueWatching';
import { MediaItem } from '@/constants/mockData';

const { width } = Dimensions.get('window');

export default function TVWatchScreen() {
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
  const [showControls, setShowControls] = useState(true);
  const [pointerModeEnabled, setPointerModeEnabled] = useState(false);

  // Lock orientation to Landscape when playing video
  useEffect(() => {
    const lockLandscape = async () => {
      try {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      } catch (e) {
        console.warn('Failed to lock screen orientation to landscape:', e);
      }
    };
    lockLandscape();
  }, []);

  // Auto-hide controls after 4 seconds of inactivity if playing
  useEffect(() => {
    if (!isPaused && showControls) {
      const timer = setTimeout(() => {
        setShowControls(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showControls, isPaused]);

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
        const json = await getMediaDetails(id, type);
        if (active && json) {
          setMedia(json);
          saveToContinueWatching(json);
        }
      } catch (err) {
        console.warn('[TV Watch] Failed to fetch metadata, using minimal fallback:', err);
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

  // Sync pointer mode state with the webview whenever it changes
  useEffect(() => {
    if (webviewRef.current) {
      const cmd = `
        try {
          if (typeof window.setCursorMode === 'function') {
            window.setCursorMode(${pointerModeEnabled});
          }
        } catch(e) {}
        true;
      `;
      webviewRef.current.injectJavaScript(cmd);
    }
  }, [pointerModeEnabled]);

  const handlePlayClick = () => {
    setIsPaused(false);
    if (webviewRef.current) {
      const playCmd = `
        try {
          var vids = document.querySelectorAll('video');
          vids.forEach(function(v) { v.play(); });
          var iframes = document.querySelectorAll('iframe');
          iframes.forEach(function(f) {
            try {
              f.contentWindow.postMessage(JSON.stringify({ event: 'play' }), '*');
              f.contentWindow.postMessage('play', '*');
            } catch(e){}
          });
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
          setShowControls(true); // Always show back button and info overlay when paused
        } else if (status === 'play' || status === 'playing') {
          setIsPaused(false);
          setShowControls(false); // Auto-hide on play
        } else if (data.event === 'webview_click') {
          if (!isPaused) {
            if (!data.isCenter) {
              setShowControls(prev => !prev);
            }
          }
        } else if (data.event === 'webview_keydown') {
          const code = data.keyCode;
          // Space bar (32) or D-pad Enter/Select (13 or 23)
          if (code === 32 || code === 13 || code === 23) {
            if (!isPaused) {
              setIsPaused(true);
              setShowControls(true);
              if (webviewRef.current) {
                const pauseCmd = `
                  try {
                    var vids = document.querySelectorAll('video');
                    vids.forEach(function(v) { v.pause(); });
                    var iframes = document.querySelectorAll('iframe');
                    iframes.forEach(function(f) {
                      try {
                        f.contentWindow.postMessage(JSON.stringify({ event: 'pause' }), '*');
                        f.contentWindow.postMessage('pause', '*');
                      } catch(e){}
                    });
                    window.postMessage(JSON.stringify({ event: 'pause' }), '*');
                    window.postMessage({ event: 'pause' }, '*');
                  } catch(e) {}
                  true;
                `;
                webviewRef.current.injectJavaScript(pauseCmd);
              }
            } else {
              handlePlayClick();
            }
          } else if (code === 38 || code === 40 || code === 37 || code === 39) {
            // D-pad arrow keys: show the controls overlay so they can see the back button
            setShowControls(true);
          } else if (code === 27 || code === 8 || code === 4) {
            // Back/Escape/Backspace: toggle overlay visibility
            setShowControls(prev => !prev);
          }
        }
      }
    } catch (e) {
      // Ignore parsing errors
    }
  };

  const injectedJS = `
    (function() {
      // Set global pointer mode variables
      window.isCursorMode = false;
      window.setCursorMode = function(enabled) {
        window.isCursorMode = enabled;
        var cursorEl = document.getElementById('lumora-virtual-cursor');
        if (cursorEl) {
          cursorEl.style.display = enabled ? 'block' : 'none';
        }
      };

      // Create virtual cursor element
      var cursor = document.createElement('div');
      cursor.id = 'lumora-virtual-cursor';
      cursor.style.position = 'fixed';
      cursor.style.width = '24px';
      cursor.style.height = '24px';
      cursor.style.borderRadius = '50%';
      cursor.style.backgroundColor = 'rgba(229, 9, 20, 0.9)'; // Lumora Red
      cursor.style.border = '2px solid white';
      cursor.style.zIndex = '9999999';
      cursor.style.pointerEvents = 'none';
      cursor.style.boxShadow = '0 0 12px rgba(0,0,0,0.8)';
      cursor.style.display = 'none';
      document.body.appendChild(cursor);

      var cursorX = window.innerWidth / 2;
      var cursorY = window.innerHeight / 2;

      function updateCursorPosition() {
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
      }
      updateCursorPosition();

      var meta = document.querySelector('meta[name="viewport"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'viewport';
        document.getElementsByTagName('head')[0].appendChild(meta);
      }
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';

      document.addEventListener('click', function(e) {
        var rect = document.documentElement.getBoundingClientRect();
        var width = window.innerWidth || rect.width;
        var height = window.innerHeight || rect.height;
        
        var isCenter = (e.clientX > width * 0.3 && e.clientX < width * 0.7) &&
                       (e.clientY > height * 0.2 && e.clientY < height * 0.8);
                       
        try {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            event: 'webview_click',
            isCenter: isCenter
          }));
        } catch(err) {}
      });

      document.addEventListener('keydown', function(e) {
        var key = e.key || '';
        var keyCode = e.keyCode || e.which;
        
        // Prevent default spacebar/Enter scrolling/behaviors on TV browsers
        if (keyCode === 32 || keyCode === 13 || keyCode === 23) {
          e.preventDefault();
        }

        if (window.isCursorMode) {
          var step = 24; // step size in pixels
          if (keyCode === 37) { // Left
            cursorX = Math.max(10, cursorX - step);
            updateCursorPosition();
            e.preventDefault();
            e.stopPropagation();
            return;
          } else if (keyCode === 39) { // Right
            cursorX = Math.min(window.innerWidth - 10, cursorX + step);
            updateCursorPosition();
            e.preventDefault();
            e.stopPropagation();
            return;
          } else if (keyCode === 38) { // Up
            cursorY = Math.max(10, cursorY - step);
            updateCursorPosition();
            e.preventDefault();
            e.stopPropagation();
            return;
          } else if (keyCode === 40) { // Down
            cursorY = Math.min(window.innerHeight - 10, cursorY + step);
            updateCursorPosition();
            e.preventDefault();
            e.stopPropagation();
            return;
          } else if (keyCode === 13 || keyCode === 23 || keyCode === 32) { // Click/Select
            var el = document.elementFromPoint(cursorX, cursorY);
            if (el) {
              var mousedown = new MouseEvent('mousedown', {
                view: window,
                bubbles: true,
                cancelable: true,
                clientX: cursorX,
                clientY: cursorY
              });
              var click = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true,
                clientX: cursorX,
                clientY: cursorY
              });
              var mouseup = new MouseEvent('mouseup', {
                view: window,
                bubbles: true,
                cancelable: true,
                clientX: cursorX,
                clientY: cursorY
              });
              el.dispatchEvent(mousedown);
              el.dispatchEvent(click);
              el.dispatchEvent(mouseup);
            }
            e.preventDefault();
            e.stopPropagation();
            return;
          }
        }
        
        try {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            event: 'webview_keydown',
            key: key,
            keyCode: keyCode
          }));
        } catch(err) {}
      }, true); // Capture phase listener to intercept before web player shortcuts

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
      {Platform.OS === 'web' ? (
        React.createElement('iframe', {
          src: playerUrl,
          style: {
            width: '100%',
            height: '100%',
            border: 'none',
            backgroundColor: '#000',
          },
          allowFullScreen: true,
          allow: 'autoplay; fullscreen; picture-in-picture',
          onLoad: () => setIsLoading(false),
        })
      ) : (
        <WebView
          ref={webviewRef}
          source={{ uri: playerUrl }}
          style={styles.webview}
          focusable={true}
          allowsFullscreenVideo={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          allowsAirPlayForMediaPlayback={true}
          allowsPictureInPictureMediaPlayback={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          renderLoading={renderLoading}
          injectedJavaScript={injectedJS}
          onMessage={onMessage}
          onLoadEnd={() => {
            setIsLoading(false);
            if (webviewRef.current) {
              const cmd = `
                try {
                  if (typeof window.setCursorMode === 'function') {
                    window.setCursorMode(${pointerModeEnabled});
                  }
                } catch(e) {}
                true;
              `;
              webviewRef.current.injectJavaScript(cmd);
            }
          }}
          nestedScrollEnabled={true}
          allowsBackForwardNavigationGestures={false}
          overScrollMode="never"
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          userAgent={Platform.select({
            ios: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
            android: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
          })}
        />
      )}

      {/* Unified Overlay Container for Sibling Focus Navigation */}
      {(showControls || (isPaused && !isLoading)) && (
        <View style={styles.overlayContainer} pointerEvents="box-none">
          {/* Pause Overlay (D-pad Focusable) */}
          {isPaused && !isLoading && (
            <View style={styles.pauseOverlay}>
              {media?.backdrop_path ? (
                <Image 
                  source={{ uri: media.backdrop_path }} 
                  style={styles.pauseBackdrop}
                  contentFit="cover"
                />
              ) : null}
              
              <View style={styles.pauseGradient} />

              <View style={styles.pauseContent}>
                <TVPressable
                  onPress={handlePlayClick}
                  style={({ focused }: any) => [
                    styles.resumeBtn,
                    focused && styles.resumeBtnFocused
                  ]}
                >
                  {({ focused }: any) => (
                    <>
                      <Play color={focused ? '#fff' : '#000'} size={24} fill={focused ? '#fff' : '#000'} />
                      <Text style={[styles.resumeBtnText, focused && styles.resumeBtnTextFocused]}>Resume Playback</Text>
                    </>
                  )}
                </TVPressable>

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
                  <Text style={styles.tapText}>Select "Resume Playback" to continue</Text>
                </View>

                <View style={styles.pointerInstructionBox}>
                  <Text style={styles.pointerInstructionText}>
                    🎮 Cannot access player menus? Turn on "D-pad Pointer" in the top bar to move a virtual cursor with your remote control.
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Floating Back Header Panel (on top of pause overlay for focus access) */}
          {showControls && (
            <View style={[styles.headerOverlay, { paddingTop: Math.max(safeAreaInsets.top, Spacing.three) }]}>
              <TVPressable
                onPress={() => router.back()}
                style={({ focused }: any) => [
                  styles.backButton,
                  focused && styles.backButtonFocused
                ]}
              >
                {({ focused }: any) => (
                  <>
                    <ArrowLeft color={focused ? '#000' : '#fff'} size={20} />
                    <Text style={[styles.backText, focused && styles.backTextFocused]}>Back</Text>
                  </>
                )}
              </TVPressable>

              {/* Toggle Pointer Mode Button */}
              <TVPressable
                onPress={() => setPointerModeEnabled(prev => !prev)}
                style={({ focused }: any) => [
                  styles.controlToggleBtn,
                  pointerModeEnabled && styles.controlToggleBtnActive,
                  focused && styles.controlToggleBtnFocused
                ]}
              >
                {({ focused }: any) => (
                  <Text style={[
                    styles.controlToggleText,
                    pointerModeEnabled && styles.controlToggleTextActive,
                    focused && { color: '#000' }
                  ]}>
                    {pointerModeEnabled ? '🎮 D-pad Pointer: ON' : '🎮 D-pad Pointer: OFF'}
                  </Text>
                )}
              </TVPressable>

              {/* Pointer Instructions Hint */}
              <View style={styles.pointerHintContainer}>
                <Text style={styles.pointerHintText}>
                  {pointerModeEnabled 
                    ? "💡 D-pad: Move Cursor  |  Enter: Select  |  Back: Hide controls" 
                    : "💡 Turn ON to select Quality, Audio, & Subtitles via virtual cursor"
                  }
                </Text>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
  },
  headerOverlay: {
    paddingLeft: 54,
    paddingRight: 54,
    paddingBottom: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    zIndex: 100,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  backButtonFocused: {
    backgroundColor: '#fff',
    borderColor: '#fff',
    transform: [{ scale: 1.05 }],
  },
  backText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backTextFocused: {
    color: '#000',
  },
  controlToggleBtn: {
    marginLeft: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  controlToggleBtnActive: {
    borderColor: '#e50914',
    backgroundColor: 'rgba(229, 9, 20, 0.15)',
  },
  controlToggleBtnFocused: {
    backgroundColor: '#fff',
    borderColor: '#fff',
    transform: [{ scale: 1.05 }],
  },
  controlToggleText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  controlToggleTextActive: {
    color: '#e50914',
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
    fontSize: 16,
    fontWeight: '600',
  },
  pauseOverlay: {
    flex: 1,
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
    paddingHorizontal: 60,
    paddingTop: 20, // Reduced since parent container starts at Y=120
    alignItems: 'flex-start',
    gap: Spacing.five,
  },
  resumeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 8,
    gap: 8,
  },
  resumeBtnFocused: {
    backgroundColor: '#e50914',
    transform: [{ scale: 1.05 }],
  },
  resumeBtnText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resumeBtnTextFocused: {
    color: '#fff',
  },
  pauseMeta: {
    gap: Spacing.two,
    maxWidth: '85%',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  pauseTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
    marginTop: 4,
  },
  pauseOverview: {
    color: '#ccc',
    fontSize: 16,
    lineHeight: 22,
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
    fontSize: 12,
    fontWeight: 'bold',
  },
  tapText: {
    color: '#888',
    fontSize: 12,
    fontWeight: '500',
  },
  pointerHintContainer: {
    marginLeft: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  pointerHintText: {
    color: '#ffcc00',
    fontSize: 14,
    fontWeight: 'bold',
  },
  pointerInstructionBox: {
    marginTop: Spacing.two,
    backgroundColor: 'rgba(229, 9, 20, 0.1)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.3)',
    maxWidth: '85%',
  },
  pointerInstructionText: {
    color: '#eee',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
});
