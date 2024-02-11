import { View, Text, StyleSheet, Button, Platform, StatusBar, SafeAreaView, Pressable } from "react-native";
import React, { useState } from "react";
import { Audio } from 'expo-av';
import { Recording } from "expo-av/build/Audio";
import { FlatList } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import MemoListItem from "@/components/MemoListItem";

const MemoScreen = () => {
  const [recording, setRecording] = useState<Recording>();
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [memos, setMemos] = useState<string[]>([]);
  async function startRecording() {
    try {
      if (permissionResponse.status !== 'granted') {
        console.log('Requesting permission..');
        await requestPermission();
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    if (!recording) {
      return;
    }

    console.log('Stopping recording..');
    setRecording(undefined);
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync(
      {
        allowsRecordingIOS: false,
      }
    );
    const uri = recording.getURI();
    if (uri) {
      setMemos((existingMemos) => [uri, ...existingMemos]);
    }
    console.log('Recording stopped and stored at', uri);
  }

  const animatedRedCircle = useAnimatedStyle(() => ({
    width: withTiming(recording ? '70%' : '100%'),
    borderRadius: withTiming(recording ? 5 : 35)
  }))

  return (
    <SafeAreaView style={styles.container}>
      <FlatList data={memos} renderItem={({ item }) => <MemoListItem uri={item} />} />
      <View style={styles.footer}>

        <Pressable style={styles.recordButton}
          onPress={recording ? stopRecording : startRecording}
        >
          <Animated.View style={[styles.redCircle, animatedRedCircle]}>

          </Animated.View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,

  },
  footer: {
    height: 150,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',

  },
  recordButton: {
    borderColor: 'grey',
    borderWidth: 2,
    borderRadius: 50,
    padding: 3,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',

  },
  redCircle: {
    backgroundColor: 'orangered',
    aspectRatio: 1,
    borderRadius: 50,


  }
});

export default MemoScreen;
