import { View, Text, StyleSheet, Button, Platform, StatusBar, SafeAreaView, Pressable } from "react-native";
import React, { useState } from "react";
import { Audio } from 'expo-av';
import { Recording } from "expo-av/build/Audio";
import { FlatList } from "react-native-gesture-handler";
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import MemoListItem, { Memo } from "@/components/MemoListItem";


const MemoScreen = () => {
  const [recording, setRecording] = useState<Recording>();
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [memos, setMemos] = useState<Memo[]>([]);

  const [audioMetering, setAudioMetering] = useState<number[]>([]);
  const metering = useSharedValue(-160);

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
      setAudioMetering([]);
      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        undefined,
        1000 / 60
      );
      setRecording(recording);
      console.log('Recording started');

      recording.setOnRecordingStatusUpdate((status) => {
        console.log(status.metering);
        if (status.metering) {
          metering.value = status.metering;
          setAudioMetering((currArr) => [...currArr, status.metering || -160]);
        }
      })
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
    metering.value = -160;
    const uri = recording.getURI();
    if (uri) {
      setMemos((existingMemos) => [{ uri, metering: audioMetering }, ...existingMemos]);
    }
    console.log('Recording stopped and stored at', uri);
  }

  const animatedRedCircle = useAnimatedStyle(() => ({
    width: withTiming(recording ? '70%' : '100%'),
    borderRadius: withTiming(recording ? 5 : 35)
  }))

  const animatedRecordWave = useAnimatedStyle(() => {
    const size = withTiming(
      interpolate(
        metering.value, [-160, -60, 0], [0, 0, -30]
      ),
      { duration: 100 }
    );

    return {
      top: size,
      bottom: size,
      left: size,
      right: size,
    };
  })
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Voice Memo</Text>
      </View>
      <FlatList style={styles.flatList} data={memos} renderItem={({ item }) => <MemoListItem memo={item} />} />
      <View style={styles.footer}>
        <View>
          <Animated.View style={[styles.recordWave, animatedRecordWave]} />
          <Pressable style={styles.recordButton}
            onPress={recording ? stopRecording : startRecording}
          >
            <Animated.View style={[styles.redCircle, animatedRedCircle]} />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,

  },
  header: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontFamily: 'Inter',
    fontSize: 22,
  },
  footer: {
    height: 150,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',

  },
  flatList: {
    backgroundColor: '#ecf0f1',
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
    backgroundColor: 'white',

  },
  recordWave: {
    backgroundColor: '#FF000055',
    position: 'absolute',
    top: -20,
    bottom: -20,
    left: -20,
    right: -20,
    borderRadius: 100,
  },
  redCircle: {
    backgroundColor: 'orangered',
    aspectRatio: 1,
    borderRadius: 50,


  }
});

export default MemoScreen;
