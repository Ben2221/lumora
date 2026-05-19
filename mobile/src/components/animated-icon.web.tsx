import { Image } from 'expo-image';
import { useState, useEffect } from 'react';
import { Dimensions, StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  Easing,
  runOnJS
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export function AnimatedSplashOverlay() {
  const [visible, setVisible] = useState(true);
  
  // Animation shared values
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);
  const containerOpacity = useSharedValue(1);

  useEffect(() => {
    // Start sequence of entrance animations
    scale.value = withTiming(1, {
      duration: 850,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    });
    opacity.value = withTiming(1, {
      duration: 850,
    });

    // Animate text shortly after
    const textTimer = setTimeout(() => {
      textOpacity.value = withTiming(1, { duration: 600 });
      textTranslateY.value = withTiming(0, {
        duration: 600,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
      });
    }, 450);

    // Fade out container after 2.3 seconds
    const exitTimer = setTimeout(() => {
      containerOpacity.value = withTiming(0, {
        duration: 550,
        easing: Easing.linear,
      }, (finished) => {
        if (finished) {
          runOnJS(setVisible)(false);
        }
      });
    }, 2300);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(exitTimer);
    };
  }, []);

  const animatedLogoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, animatedContainerStyle]}>
      {/* Cinematic Red Ambient Glow */}
      <View style={styles.glowCircle} />
      
      <View style={styles.content}>
        <Animated.View style={[styles.logoWrapper, animatedLogoStyle]}>
          <Image 
            source={require('@/assets/images/icon.png')} 
            style={styles.logoImage} 
            contentFit="contain"
          />
        </Animated.View>
        
        <Animated.View style={[styles.textWrapper, animatedTextStyle]}>
          <Text style={styles.appName}>LUMORA</Text>
          <Text style={styles.tagline}>Stream the Extraordinary</Text>
        </Animated.View>
        
        <ActivityIndicator size="small" color="#e50914" style={styles.spinner} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowCircle: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#e50914',
    opacity: 0.12,
    shadowColor: '#e50914',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 110,
    elevation: 35,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  logoWrapper: {
    width: 110,
    height: 110,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#e50914',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 12,
    backgroundColor: '#111',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  textWrapper: {
    alignItems: 'center',
    gap: 6,
  },
  appName: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 9,
    textAlign: 'center',
    textShadowColor: 'rgba(229,9,20,0.45)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  tagline: {
    color: '#777777',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
  spinner: {
    marginTop: 20,
  },
});
