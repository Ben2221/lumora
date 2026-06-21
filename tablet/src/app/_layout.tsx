import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
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

SplashScreen.preventAutoHideAsync().catch(() => {});

// Override navigation theme so its background exactly matches the app
const AppTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#070707',
    card: '#070707',
  },
};

export default function RootLayout() {
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

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return <View style={styles.root} />;
  }

  return (
    <ThemeProvider value={AppTheme}>
      {/* Hard dark background behind every screen — eliminates the flash */}
      <View style={styles.root}>
        <AnimatedSplashOverlay />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: styles.screen,
            animation: 'none',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="search" />
          <Stack.Screen name="info/[type]/[id]" />
          <Stack.Screen name="watch/[type]/[id]" />
        </Stack>
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#070707',
  },
  screen: {
    backgroundColor: '#070707',
  },
});
