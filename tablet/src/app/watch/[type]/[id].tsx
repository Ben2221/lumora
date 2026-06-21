import React, { useState, useEffect, useRef, Component } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Play, ExternalLink } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMediaDetails } from '@/services/tmdb';

const CONTINUE_WATCHING_KEY = '@lumora_continue_watching';

// ─── Error boundary (Expo Go fallback) ───────────────────────────────────────
class WebViewErrorBoundary extends Component<
  { url: string; onError: () => void; children: React.ReactNode },
  { crashed: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { crashed: false };
  }
  componentDidCatch() {
    this.setState({ crashed: true });
    this.props.onError();
  }
  render() {
    if (this.state.crashed) {
      return (
        <View style={fallbackStyles.container}>
          <Play color="#e50914" size={52} />
          <Text style={fallbackStyles.title}>Player requires a dev build</Text>
          <Text style={fallbackStyles.body}>
            The embedded player needs a native EAS build.{'\n'}
            Tap below to open the player in your browser.
          </Text>
          <TouchableOpacity
            onPress={() => WebBrowser.openBrowserAsync(this.props.url)}
            style={fallbackStyles.btn}
            activeOpacity={0.85}
          >
            <ExternalLink color="#fff" size={18} />
            <Text style={fallbackStyles.btnText}>Open Player in Browser</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const fallbackStyles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#070707',
    alignItems: 'center', justifyContent: 'center',
    padding: 40, gap: 18,
  },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold', fontFamily: 'Outfit-Bold', textAlign: 'center', marginTop: 8 },
  body: { color: '#9CA3AF', fontSize: 16, fontFamily: 'Inter-Regular', textAlign: 'center', lineHeight: 26 },
  btn: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#e50914', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 8, marginTop: 8 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 17, fontFamily: 'Outfit-Bold' },
});

// ─── Ad/redirect blocking scripts ────────────────────────────────────────────
const BLOCK_ADS_JS = `
(function() {
  'use strict';

  function isAllowed(url) {
    if (!url) return true;
    var u = String(url);
    return u.startsWith('https://vidlink.pro') ||
           u.startsWith('https://cdn.jwplayer.com') ||
           u.startsWith('https://content.jwplatform.com') ||
           u.startsWith('#') ||
           u.startsWith('javascript') ||
           u.startsWith('blob:') ||
           u.startsWith('data:') ||
           u.startsWith('/');
  }

  // Block popup windows (non-configurable so page scripts cannot override)
  try {
    Object.defineProperty(window, 'open', {
      configurable: false, writable: false,
      value: function(url) {
        if (!url || url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('about:')) {
          return { focus: function(){}, close: function(){}, postMessage: function(){} };
        }
        return null;
      }
    });
  } catch(e) {}
  window.alert   = function() {};
  window.confirm = function() { return false; };
  window.prompt  = function() { return null; };

  // Freeze window.location assignment
  try {
    var _loc = window.location;
    Object.defineProperty(window, 'location', {
      configurable: false,
      get: function() { return _loc; },
      set: function() {},
    });
  } catch(e) {}

  // Block location.href = 'ad-url'
  try {
    var hrefDesc = Object.getOwnPropertyDescriptor(Location.prototype, 'href');
    if (hrefDesc && hrefDesc.set) {
      var _origHref = hrefDesc.set;
      Object.defineProperty(Location.prototype, 'href', {
        get: hrefDesc.get,
        set: function(url) { if (isAllowed(url)) _origHref.call(this, url); },
        configurable: true,
      });
    }
  } catch(e) {}

  // Block location.assign / location.replace
  try {
    var _assign = Location.prototype.assign;
    var _replace = Location.prototype.replace;
    Location.prototype.assign  = function(url) { if (isAllowed(url)) _assign.call(this, url); };
    Location.prototype.replace = function(url) { if (isAllowed(url)) _replace.call(this, url); };
  } catch(e) {}

  // Block ad link clicks via preventDefault ONLY.
  // Do NOT call stopImmediatePropagation — that would kill JW Player's own
  // click handlers on the same elements (breaking controls restore after auto-hide).
  document.addEventListener('click', function(e) {
    var node = e.target;
    for (var i = 0; i < 6 && node; i++, node = node.parentElement) {
      if (node.tagName === 'A') {
        var h = node.getAttribute('href') || '';
        if (h && !isAllowed(h)) e.preventDefault();
        break;
      }
    }
  }, true);

})();
true;
`;

// ─── Native WebView (lazy-required for Expo Go compatibility) ─────────────────
function PlayerWebView({ url, onLoad }: { url: string; onLoad: () => void }) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { WebView } = require('react-native-webview');

  const isAllowed = (u: string) =>
    u.startsWith('https://vidlink.pro') ||
    u.startsWith('https://cdn.jwplayer.com') ||
    u.startsWith('https://content.jwplatform.com') ||
    u.startsWith('blob:') ||
    u.startsWith('data:') ||
    u.startsWith('about:');

  return (
    <WebView
      source={{ uri: url }}
      style={styles.webview}
      allowsFullscreenVideo
      mediaPlaybackRequiresUserAction={false}
      javaScriptEnabled
      domStorageEnabled
      allowsInlineMediaPlayback
      injectedJavaScriptBeforeContentLoaded={BLOCK_ADS_JS}
      injectedJavaScriptForMainFrameOnly={false}
      onShouldStartLoadWithRequest={(req) => isAllowed(req.url)}
      onLoad={onLoad}
    />
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function WatchScreen() {
  const { type, id, season, episode } = useLocalSearchParams<{
    type: 'movie' | 'tv';
    id: string;
    season?: string;
    episode?: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // ── Auto-hide header ──────────────────────────────────────────────────────────
  const headerRef     = useRef<Animated.View>(null);
  const headerOpacity = useRef(new Animated.Value(1)).current;
  const hideTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleHide = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      Animated.timing(headerOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        // After native-driver animation completes, explicitly remove this view
        // from Android's native touch dispatch — opacity:0 via native driver does
        // NOT automatically stop hit-testing on Android.
        headerRef.current?.setNativeProps({ pointerEvents: 'none' });
      });
    }, 3500);
  };

  useEffect(() => {
    scheduleHide();
    return () => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current); };
  }, []);

  useEffect(() => {
    if (!id || !type) return;
    getMediaDetails(id as string, type as 'movie' | 'tv').then(async (data) => {
      if (!data) return;
      setTitle(data.title);
      try {
        const stored = await AsyncStorage.getItem(CONTINUE_WATCHING_KEY);
        const list = stored ? JSON.parse(stored) : [];
        const entry = {
          id: data.id, title: data.title, type,
          poster_path: data.poster_path, backdrop_path: data.backdrop_path,
          vote_average: data.vote_average || 8,
          release_date: data.release_date || '2024',
          overview: data.overview || '',
        };
        const updated = [entry, ...list.filter((i: any) => i.id !== data.id)].slice(0, 10);
        await AsyncStorage.setItem(CONTINUE_WATCHING_KEY, JSON.stringify(updated));
      } catch (e) { console.error('Failed to save continue watching', e); }
    });
  }, [id, type]);

  // Build VidLink embed URL
  const s  = season || '1';
  const ep = episode || '1';
  const basePath = type === 'tv'
    ? `https://vidlink.pro/tv/${id}/${s}/${ep}`
    : `https://vidlink.pro/movie/${id}`;
  const embedUrl = `${basePath}?${new URLSearchParams({
    autoplay: 'true', primaryColor: 'e50914', player: 'jw',
  }).toString()}`;

  // Auto-hiding header — always in layout, only opacity changes (no WebView re-renders)
  const header = (
    <Animated.View ref={headerRef} style={[styles.headerWrapper, { opacity: headerOpacity }]} pointerEvents="box-none">
      <LinearGradient
        colors={['rgba(0,0,0,0.75)', 'transparent']}
        style={[styles.headerOverlay, { paddingTop: (insets.top || 0) + 10 }]}
        pointerEvents="box-none"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.8}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <ArrowLeft color="#fff" size={22} />
        </TouchableOpacity>

        {title ? <Text style={styles.titleText} numberOfLines={1}>{title}</Text> : null}

        {type === 'tv' && season && episode && (
          <View style={styles.epBadge}>
            <Text style={styles.epBadgeText}>S{season} · E{episode}</Text>
          </View>
        )}
      </LinearGradient>
    </Animated.View>
  );

  // ── Web ──────────────────────────────────────────────────────────────────────
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        {/* @ts-ignore */}
        <iframe
          src={embedUrl}
          style={{ flex: 1, border: 'none', width: '100%', height: '100%' }}
          allowFullScreen
          allow="autoplay; encrypted-media; fullscreen"
          sandbox="allow-scripts allow-same-origin allow-presentation allow-fullscreen"
          referrerPolicy="no-referrer"
          title={title}
          onLoad={() => setIsLoading(false)}
        />
        {isLoading && (
          <View style={styles.loadingOverlay} pointerEvents="none">
            <ActivityIndicator color="#e50914" size="large" />
            <Text style={styles.loadingText}>Loading Player...</Text>
          </View>
        )}
        {header}
      </View>
    );
  }

  // ── Native ───────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <WebViewErrorBoundary url={embedUrl} onError={() => setIsLoading(false)}>
        <PlayerWebView url={embedUrl} onLoad={() => setIsLoading(false)} />
      </WebViewErrorBoundary>

      {isLoading && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator color="#e50914" size="large" />
          <Text style={styles.loadingText}>Loading Player...</Text>
        </View>
      )}

      {header}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  webview:   { flex: 1, backgroundColor: '#000' },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#000', zIndex: 10,
  },
  loadingText: { color: '#9CA3AF', marginTop: 14, fontSize: 16, fontFamily: 'Inter-Regular' },
  headerWrapper: {
    position: 'absolute', top: 0, left: 0, right: 0,
    zIndex: 50,
  },
  headerOverlay: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingBottom: 32,
    gap: 16,
  },
  backButton: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  titleText: {
    flex: 1, color: '#fff', fontSize: 18, fontWeight: 'bold',
    fontFamily: 'Outfit-Bold',
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  epBadge: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 6, paddingHorizontal: 12, paddingVertical: 5,
  },
  epBadgeText: { color: '#fff', fontSize: 13, fontWeight: 'bold', fontFamily: 'Inter-Bold' },
});
