import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { VIRAL_ITEMS } from './(tabs)/index';

const ONBOARDING_KEY = 'has-seen-onboarding';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function OnboardingScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const insets = useSafeAreaInsets();

  const onboardingItems = useMemo(() => {
    const shuffled = shuffleArray(VIRAL_ITEMS);
    return shuffled.slice(0, 3);
  }, []);

  const handleScroll = useCallback((event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentIndex(index);
  }, []);

  const handleNext = useCallback(() => {
    if (currentIndex < onboardingItems.length - 1) {
      const nextIndex = currentIndex + 1;
      scrollViewRef.current?.scrollTo({
        x: nextIndex * SCREEN_WIDTH,
        animated: true,
      });
      setCurrentIndex(nextIndex);
    }
  }, [currentIndex, onboardingItems.length]);

  const handleGetStarted = useCallback(async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      router.replace('/pro-modal');
    } catch (error) {
      console.warn('Failed to save onboarding status', error);
      router.replace('/pro-modal');
    }
  }, [router]);

  const isLastSlide = currentIndex === onboardingItems.length - 1;

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent />
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}>
        {onboardingItems.map((item, index) => (
          <View key={item.id} style={[styles.slide, { width: SCREEN_WIDTH }]}>
            <Image 
              source={{ uri: item.image }} 
              style={styles.slideImage} 
              contentFit="contain"
              cachePolicy="memory-disk"
              transition={200}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.6)']}
              style={styles.gradient}
            />
            <SafeAreaView style={styles.safeArea} edges={['bottom']}>
              <View style={styles.slideContent}>
                <Text style={styles.slideTitle}>{item.title}</Text>
                <Text style={styles.slideSubtitle}>
                  {index === onboardingItems.length - 1
                    ? 'Start creating amazing AI videos'
                    : `Transform your photos with ${item.title}`}
                </Text>
                <View style={styles.dotsContainer}>
                  {onboardingItems.map((_, dotIndex) => (
                    <View
                      key={dotIndex}
                      style={[
                        styles.dot,
                        dotIndex === currentIndex && styles.dotActive,
                      ]}
                    />
                  ))}
                </View>
              </View>
            </SafeAreaView>
          </View>
        ))}
      </ScrollView>
      <View style={[styles.buttonContainer, { bottom: insets.bottom + 20, right: 20 }]}>
        <Pressable
          style={styles.arrowButton}
          onPress={isLastSlide ? handleGetStarted : handleNext}
          hitSlop={8}>
          <Ionicons name="arrow-forward" size={24} color="#000000" />
        </Pressable>
      </View>
    </View>
  );
}

export async function hasSeenOnboarding(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_KEY);
    return value === 'true';
  } catch {
    return false;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: {
    width: 24,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  slideImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  slideContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 12,
  },
  slideTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
  },
  slideSubtitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
    opacity: 0.9,
    marginBottom: 32,
  },
  buttonContainer: {
    position: 'absolute',
  },
  arrowButton: {
    width: 90,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

