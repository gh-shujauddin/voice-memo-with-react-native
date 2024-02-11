import React, { useState } from "react";
import { useEffect } from 'react';
import { useFonts, Inter_600SemiBold, Inter_700Bold, Inter_400Regular, Inter_900Black } from '@expo-google-fonts/inter';
// import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { FadeIn } from "react-native-reanimated";
import MemoScreen from "@/app/MemoScreen";
// SplashScreen.preventAutoHideAsync();

export default function RootLayout() {

  const [appReady, setAppReady] = useState(false);

  const [fontLoaded, fontError] = useFonts({
    Inter: Inter_400Regular,
    InterSemi: Inter_600SemiBold,
    InterBold: Inter_700Bold,
    InterBlack: Inter_900Black,
  });

  useEffect(() => {
    if (fontLoaded || fontError) {
      // SplashScreen.hideAsync();
      setAppReady(true);
    }
  }, [fontLoaded, fontError]);


  if (!appReady) {
    return;
  }
  return (

    <GestureHandlerRootView style={{ flex: 1 }}>
      <Animated.View entering={FadeIn} style={{ flex: 1 }}>
        <MemoScreen />
      </Animated.View>

    </GestureHandlerRootView>
  );
}