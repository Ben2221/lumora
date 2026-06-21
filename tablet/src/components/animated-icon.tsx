import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

export function AnimatedSplashOverlay() {
  const [visible, setVisible] = useState(true);
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const dotOpacity = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(dotOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(900),
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start(() => setVisible(false));
  }, []);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity: screenOpacity }]}>
      <Animated.View style={[styles.content, { opacity: logoOpacity }]}>
        <View style={styles.logoRow}>
          <Text style={styles.logoText}>LUMORA</Text>
          <Animated.View style={[styles.redDot, { opacity: dotOpacity }]} />
        </View>
        <Text style={styles.tagline}>Stream Without Limits</Text>
      </Animated.View>
    </Animated.View>
  );
}

// Kept for API compatibility
export function AnimatedIcon() {
  return null;
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#070707',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  content: {
    alignItems: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  logoText: {
    fontSize: 72,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -3,
    fontFamily: 'Outfit-Black',
  },
  redDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e50914',
    marginBottom: 14,
  },
  tagline: {
    fontSize: 13,
    color: '#555',
    letterSpacing: 5,
    marginTop: 14,
    fontFamily: 'Inter-Regular',
    textTransform: 'uppercase',
  },
});
