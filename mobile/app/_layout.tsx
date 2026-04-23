import React, { useEffect, useCallback } from 'react';
import { View, Linking as RNLinking } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as Linking from 'expo-linking';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuthStore } from '../src/store/authStore';
import { OfflineBanner } from '../src/components/OfflineBanner';
import { parseWalletCallback } from '../src/services/walletConnectService';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { initialize, isLoading, login } = useAuthStore();

  const handleDeepLink = useCallback((event: { url: string }) => {
    const result = parseWalletCallback(event.url);
    if (result) {
      // Assuming login method accepts the public key and network
      login({
        address: result.publicKey,
        network: result.network,
        provider: 'lobstr' // or logic to determine provider
      });
    }
  }, [login]);

  useEffect(() => {
    initialize().finally(() => SplashScreen.hideAsync());

    // Set up deep link listener
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check for initial URL if app was opened via deep link
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => {
      subscription.remove();
    };
  }, [initialize, handleDeepLink]);

  if (isLoading) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <OfflineBanner />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="groups/[id]/index" options={{ headerShown: true, title: 'Group Details' }} />
        <Stack.Screen name="groups/[id]/contribute" options={{ headerShown: true, title: 'Make Contribution' }} />
        <Stack.Screen name="groups/create" options={{ headerShown: true, title: 'Create Group' }} />
        <Stack.Screen name="qr" options={{ headerShown: true, title: 'Scan QR Code', presentation: 'modal' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
