import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { initializeRevenueCat } from '@/utils/revenuecat';
import { requestTrackingPermission } from '@/utils/tracking-transparency';
import { hasSeenOnboarding } from './onboarding';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        // Request App Tracking Transparency permission (iOS only)
       

        // Initialize RevenueCat
        await initializeRevenueCat();
        
        // Check onboarding
        const seen = await hasSeenOnboarding();
        if (isMounted && !seen) {
          router.replace('/onboarding');
           try {
          const { status, granted } = await requestTrackingPermission();
          console.log('Tracking permission status:', status, 'granted:', granted);
        } catch (trackingError) {
          // Tracking transparency is iOS only, ignore errors on other platforms
          console.log('Tracking transparency not available:', trackingError);
        }
        }
      } catch (error) {
        console.warn('Failed to initialize app', error);
        // Still check onboarding even if RevenueCat fails
        try {
          const seen = await hasSeenOnboarding();
          if (isMounted && !seen) {
            router.replace('/onboarding');
          }
        } catch (onboardingError) {
          console.warn('Failed to check onboarding status', onboardingError);
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, [router]);

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
          animation: 'slide_from_bottom',
          gestureDirection: 'vertical',
          gestureEnabled: true,
          animationDuration: 300,
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
