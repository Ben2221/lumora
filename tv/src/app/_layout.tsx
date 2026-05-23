import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, usePathname } from 'expo-router';
import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useFonts } from 'expo-font';
import { 
  Inter_400Regular, 
  Inter_500Medium, 
  Inter_600SemiBold, 
  Inter_700Bold 
} from '@expo-google-fonts/inter';
import { 
  Outfit_400Regular, 
  Outfit_500Medium, 
  Outfit_600SemiBold, 
  Outfit_700Bold, 
  Outfit_800ExtraBold, 
  Outfit_900Black 
} from '@expo-google-fonts/outfit';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { SideNavigation } from '@/components/SideNavigation';

export default function RootLayout() {
  const pathname = usePathname() || '/';

  // Enable spatial D-pad navigation on Web for easy browser testing
  React.useEffect(() => {
    if (Platform.OS !== 'web') return;

    const moveFocusSpatially = (direction: 'up' | 'down' | 'left' | 'right') => {
      const activeEl = document.activeElement as HTMLElement;
      
      // Find all potentially focusable elements in the viewport
      const allElements = Array.from(
        document.querySelectorAll('[tabindex="0"], button, input, [data-focusable="true"], a')
      ) as HTMLElement[];

      if (!activeEl || activeEl === document.body) {
        // Focus the first visible focusable element
        const firstFocusable = allElements.find(el => {
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        });
        if (firstFocusable) {
          firstFocusable.focus();
        }
        return;
      }

      const checkSidebar = (elem: HTMLElement) => {
        if (!elem || typeof elem.closest !== 'function') return false;
        return elem.closest('[data-testid="sidebar-container"], [data-sidebar-container], [testid="sidebar-container"]') !== null;
      };

      const isActiveSidebar = checkSidebar(activeEl);

      const activeRect = activeEl.getBoundingClientRect();
      const activeCenter = {
        x: activeRect.left + activeRect.width / 2,
        y: activeRect.top + activeRect.height / 2,
      };

      let bestElement: HTMLElement | null = null;
      let minScore = Infinity;

      for (const el of allElements) {
        if (el === activeEl) continue;

        const isCandidateSidebar = checkSidebar(el);

        // Boundary Rules:
        // 1. If currently inside the sidebar, you can ONLY focus main content by pressing RIGHT.
        if (isActiveSidebar && !isCandidateSidebar && direction !== 'right') {
          continue;
        }
        // 2. If currently in the main content, you can ONLY focus the sidebar by pressing LEFT.
        if (!isActiveSidebar && isCandidateSidebar && direction !== 'left') {
          continue;
        }
        
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;

        const center = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };

        const dx = center.x - activeCenter.x;
        const dy = center.y - activeCenter.y;

        // Check if in correct direction
        let isCorrectDirection = false;
        if (direction === 'left' && dx < -5) isCorrectDirection = true;
        if (direction === 'right' && dx > 5) isCorrectDirection = true;
        if (direction === 'up' && dy < -5) isCorrectDirection = true;
        if (direction === 'down' && dy > 5) isCorrectDirection = true;

        if (!isCorrectDirection) continue;

        let alignmentErr = 0;
        let distance = 0;
        
        if (direction === 'left' || direction === 'right') {
          alignmentErr = Math.abs(dy);
          distance = Math.abs(dx);
        } else {
          alignmentErr = Math.abs(dx);
          distance = Math.abs(dy);
        }

        // Weighted distance score prioritizing main axis alignment
        const score = distance + alignmentErr * 1.8;

        console.log(`Candidate:`, el.tagName, el.className, `isSidebar:`, isCandidateSidebar, `score:`, score);
        if (score < minScore) {
          minScore = score;
          bestElement = el;
        }
      }

      console.log(`SPATIAL NAV DIRECTION:`, direction, `Active:`, activeEl, `isActiveSidebar:`, isActiveSidebar, `Best:`, bestElement, `Score:`, minScore);
      if (bestElement) {
        bestElement.focus();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement as HTMLElement;
      const isInputFocused = activeEl && (
        activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        activeEl.getAttribute('role') === 'textbox' ||
        activeEl.getAttribute('contenteditable') === 'true'
      );

      const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
      if (keys.includes(e.key)) {
        // Allow left/right arrow keys to navigate text cursor inside input fields
        if (isInputFocused && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
          return;
        }

        e.preventDefault();
        
        let direction: 'up' | 'down' | 'left' | 'right' | null = null;
        if (e.key === 'ArrowUp') direction = 'up';
        if (e.key === 'ArrowDown') direction = 'down';
        if (e.key === 'ArrowLeft') direction = 'left';
        if (e.key === 'ArrowRight') direction = 'right';

        if (direction) {
          moveFocusSpatially(direction);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load typography fonts
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
    'Outfit-Regular': Outfit_400Regular,
    'Outfit-Medium': Outfit_500Medium,
    'Outfit-SemiBold': Outfit_600SemiBold,
    'Outfit-Bold': Outfit_700Bold,
    'Outfit-ExtraBold': Outfit_800ExtraBold,
    'Outfit-Black': Outfit_900Black,
  });

  if (!fontsLoaded) {
    return null;
  }

  // Determine active tab based on route path
  let activeTab: 'home' | 'explore' | 'mylist' = 'home';
  if (pathname.includes('/explore')) {
    activeTab = 'explore';
  } else if (pathname.includes('/mylist')) {
    activeTab = 'mylist';
  }

  // Only show the sidebar on primary browse/search tabs (hidden in details & player)
  const showSidebar = pathname === '/' || pathname === '/explore' || pathname === '/mylist';

  return (
    <ThemeProvider value={DarkTheme}>
      <AnimatedSplashOverlay />
      <View style={styles.rootContainer}>
        {showSidebar && <SideNavigation activeTab={activeTab} />}
        <View style={styles.mainContent}>
          <Stack 
            screenOptions={{ 
              headerShown: false,
              animation: 'fade', // Smooth fading transition suitable for TV screens
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="explore" />
            <Stack.Screen name="mylist" />
            <Stack.Screen name="info/[type]/[id]" />
            <Stack.Screen name="watch/[type]/[id]" />
          </Stack>
        </View>
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#000',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#000',
  },
});
