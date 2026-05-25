import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Home, Search, ListPlus } from 'lucide-react-native';
import { Spacing } from '@/constants/theme';

interface SideNavigationProps {
  activeTab: 'home' | 'explore' | 'mylist';
}

export function SideNavigation({ activeTab }: SideNavigationProps) {
  const router = useRouter();
  const [focusedItem, setFocusedItem] = useState<string | null>(null);

  const navigationItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'explore', label: 'Search', icon: Search, path: '/explore' },
    { id: 'mylist', label: 'My List', icon: ListPlus, path: '/mylist' },
  ];

  const isExpanded = focusedItem !== null;

  const handleFocus = (id: string) => {
    setFocusedItem(id);
  };

  const handleBlur = (id: string) => {
    setTimeout(() => {
      setFocusedItem((curr) => (curr === id ? null : curr));
    }, 150);
  };

  return (
    <View 
      style={[
        styles.container,
        isExpanded ? styles.containerExpanded : styles.containerCollapsed
      ]}
      testID="sidebar-container"
      {...Platform.select({
        web: { dataSet: { 'sidebar-container': 'true' } } as any,
        default: {},
      })}
    >
      <View style={styles.header}>
        <Image 
          source={require('../../assets/images/favicon.png')} 
          style={styles.logoImage} 
        />
        {isExpanded && (
          <Text style={styles.logoText}>
            LUMORA
          </Text>
        )}
      </View>
 
      <View style={styles.menuItems}>
        {navigationItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          const isItemFocused = focusedItem === item.id;

          return (
            <Pressable
              key={item.id}
              focusable={true}
              testID="sidebar-item"
              {...Platform.select({
                web: { dataSet: { 'sidebar-item': 'true' } } as any,
                default: {},
              })}
            style={[styles.navItem, { width: isExpanded ? 190 : 60 }]}
              onPress={() => {
                router.replace(item.path as any);
              }}
              onFocus={() => handleFocus(item.id)}
              onBlur={() => handleBlur(item.id)}
            >
              <View style={[
                styles.navItemContent,
                isActive && styles.navItemActive,
                isItemFocused && styles.navItemFocused,
                { width: '100%' }
              ]}>
                <Icon 
                  color={isItemFocused ? '#000' : (isActive ? '#e50914' : '#aaa')} 
                  size={24} 
                  strokeWidth={isItemFocused || isActive ? 2.5 : 2}
                />
                {isExpanded && (
                  <Text 
                    style={[
                      styles.navLabel, 
                      isActive && styles.navLabelActive,
                      isItemFocused && styles.navLabelFocused
                    ]}
                    numberOfLines={1}
                  >
                    {item.label}
                  </Text>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>

      {isExpanded && (
        <View style={styles.footer}>
          <Text style={styles.footerText} numberOfLines={1}>
            Press Right to close menu
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    height: '100%',
    backgroundColor: '#070707',
    borderRightWidth: 1,
    borderRightColor: '#141414',
    zIndex: 1000,
    elevation: 25, // Ensure Android TV focus engine treats it as floating on top
    paddingVertical: 54, // Safe TV top/bottom margin (5% of 1080px)
    alignItems: 'flex-start',
    paddingLeft: 48, // Safe TV left margin (approx. 5% of 1920px)
  },
  containerCollapsed: {
    width: 108, // Increased from 80 to fit the extra padding and keep spacing
  },
  containerExpanded: {
    width: 268, // Increased from 240 to match
    shadowColor: '#000',
    shadowOffset: { width: 10, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 60,
    paddingLeft: 2,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#e50914',
    letterSpacing: -1,
    fontFamily: 'Outfit-Black',
  },
  logoImage: {
    width: 28,
    height: 28,
    borderRadius: 4,
  },
  menuItems: {
    flex: 1,
    width: '100%',
    gap: 16,
  },
  navItem: {
    width: 60, // Expanded collapsed size to eliminate layout gap for focus engine
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    backgroundColor: 'transparent',
    overflow: 'visible', // Allow expanded inner view to draw text & long white focused background
    ...Platform.select({
      web: {
        cursor: 'pointer',
      } as any,
    }),
  },
  navItemActive: {
    backgroundColor: 'rgba(229, 9, 20, 0.08)',
  },
  navItemFocused: {
    backgroundColor: '#fff',
  },
  navItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 8,
    paddingLeft: 6,
    gap: 16,
    overflow: 'hidden', // Clips label gracefully during collapsed state
  },
  navLabel: {
    color: '#aaa',
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: 'Outfit-Bold',
  },
  navLabelActive: {
    color: '#e50914',
  },
  navLabelFocused: {
    color: '#000',
  },
  footer: {
    width: '100%',
    paddingLeft: 2,
    marginTop: 20,
  },
  footerText: {
    color: '#555',
    fontSize: 10,
    fontFamily: 'Inter-Regular',
  },
});
