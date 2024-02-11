import { View, Text, StyleSheet } from "react-native";
import React, { useState, useEffect } from "react";
import { FontAwesome5 } from '@expo/vector-icons';
import { AVPlaybackStatus, Audio } from "expo-av";
import { Sound } from "expo-av/build/Audio";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";

const MemoListItem = ({ uri }: { uri: string }) => {
  const [sound, setSound] = useState<Sound>();
  const [status, setStatus] = useState<AVPlaybackStatus>();

  async function loadSound() {
    console.log('Loading Sound');
    const { sound } = await Audio.Sound.createAsync(
      { uri: uri },
      { progressUpdateIntervalMillis: 1000 / 60 },
      onPlaybackStatusUpdate
    );
    setSound(sound);

  }

  useEffect(() => {
    loadSound();
  }, [uri]);

  const onPlaybackStatusUpdate = async (newStatus: AVPlaybackStatus) => {
    setStatus(newStatus);

    // if (!status?.isLoaded) {
    //   return;
    // }

    // if (status.didJustFinish) {
    //   await sound?.setPositionAsync(0);
    // }
  }
  async function playSound() {
    if (!sound) {
      return;
    }
    if (status?.isLoaded && status.isPlaying) {
      sound.setStatusAsync({ shouldPlay: false });
    } else
      await sound.replayAsync();
  }

  useEffect(() => {
    return sound
      ? () => {
        console.log('Unloading Sound');
        sound.unloadAsync();
      }
      : undefined;
  }, [sound]);

  const formatMillis = (millis: number) => {
    const minutes = Math.floor(millis / (1000 * 60));
    const seconds = Math.floor((millis % (1000 * 60)) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  const isPlaying = status?.isLoaded ? status.isPlaying : false;
  const position = status?.isLoaded ? status.positionMillis : 0;
  const duration = status?.isLoaded ? status.durationMillis : 1;

  const progress = position / duration;

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    left: `${progress * 100}%`
    // left: withTiming(`${progress * 100}%`, { duration: 100 }),
  }))
  return (
    <View style={styles.container}>
      <FontAwesome5
        onPress={playSound}
        name={isPlaying ? 'pause' : 'play'}
        color={'grey'}
        size={20} />
      <View style={styles.playbackContainer}>
        <View style={styles.playbackBackground} />
        <Animated.View style={[styles.playbackIndicator, animatedIndicatorStyle]} />
        <Text
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            color: 'gray',
            fontFamily: 'InterSemi',
            fontSize: 12
          }}>
          {formatMillis(position || 0)} / {formatMillis(duration || 0)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    alignItems: 'center',
    margin: 5,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
    gap: 15,

    //shadow
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  playbackContainer: {
    flex: 1,
    height: 50,
    justifyContent: 'center',

  },
  playbackBackground: {
    height: 3,
    backgroundColor: 'gainsboro',
    borderRadius: 5,
  },
  playbackIndicator: {
    width: 10,
    aspectRatio: 1,
    backgroundColor: 'royalblue',
    borderRadius: 10,
    flex: 1,
    position: 'absolute',

  }
});
export default MemoListItem;
