import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Home, Search, ListPlus } from 'lucide-react-native';
import { Spacing } from '@/constants/theme';

interface TabBarProps {
  activeTab: 'home' | 'explore' | 'mylist';
}

export function TabBar({ activeTab }: TabBarProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.tabButton}
          onPress={() => router.replace('/')}
        >
          <Home 
            color={activeTab === 'home' ? '#e50914' : '#888'} 
            size={20} 
            strokeWidth={activeTab === 'home' ? 2.5 : 2}
          />
          <Text style={[styles.tabLabel, activeTab === 'home' && styles.tabLabelActive]}>
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.tabButton}
          onPress={() => router.replace('/explore')}
        >
          <Search 
            color={activeTab === 'explore' ? '#e50914' : '#888'} 
            size={20} 
            strokeWidth={activeTab === 'explore' ? 2.5 : 2}
          />
          <Text style={[styles.tabLabel, activeTab === 'explore' && styles.tabLabelActive]}>
            Search
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.tabButton}
          onPress={() => router.replace('/mylist')}
        >
          <ListPlus 
            color={activeTab === 'mylist' ? '#e50914' : '#888'} 
            size={20} 
            strokeWidth={activeTab === 'mylist' ? 2.5 : 2}
          />
          <Text style={[styles.tabLabel, activeTab === 'mylist' && styles.tabLabelActive]}>
            My List
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 100,
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 15, 15, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: '100%',
    maxWidth: 400,
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingHorizontal: Spacing.two,
  },
  tabLabel: {
    color: '#888',
    fontSize: 10,
    fontWeight: 'bold',
  },
  tabLabelActive: {
    color: '#e50914',
  },
});
