import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { hasSeenOnboarding } from './onboarding';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const segments = useSegments();
  const router = useRouter();
  const [isOnboardingChecked, setIsOnboardingChecked] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const seen = await hasSeenOnboarding();
        setIsOnboardingChecked(true);
        
        if (!seen && segments[0] !== 'onboarding') {
          router.replace('/onboarding');
        }
      } catch (error) {
        console.warn('Failed to check onboarding status', error);
        setIsOnboardingChecked(true);
      }
    };

    checkOnboarding();
  }, [segments, router]);

  if (!isOnboardingChecked) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name="onboarding" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="all-items" options={{ headerShown: false }} />
        <Stack.Screen name="item/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="view-video/[id]" options={{ headerShown: false }} />
        <Stack.Screen
          name="pro-modal"
          options={{
            presentation: 'transparentModal',
            headerShown: false,
            animation: 'slide_from_right',
            gestureDirection: 'horizontal',
          }}
        />
        <Stack.Screen
          name="settings-modal"
          options={{
            presentation: 'transparentModal',
            headerShown: false,
            animation: 'slide_from_bottom',
            gestureDirection: 'vertical',
          }}
        />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <RootLayoutNav />
      <StatusBar style="light" translucent animated />
    </ThemeProvider>
  );
}
