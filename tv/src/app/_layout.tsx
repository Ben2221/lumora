import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, usePathname } from 'expo-router';
import React from 'react';
import { View, StyleSheet } from 'react-native';
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
