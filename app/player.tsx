import { View, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Audio } from 'expo-av';
import Slider from '@react-native-community/slider';

export default function Player() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [sound, setSound] = useState<Audio.Sound>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  const { title, artist, artwork, uri } = params;

  useEffect(() => {
    loadAudio();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [uri]);

  const loadAudio = async () => {
    try {
      if (sound) await sound.unloadAsync();
      
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: uri as string },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );
      
      setSound(newSound);
      setIsPlaying(true);
    } catch (error) {
      console.error('Error loading audio:', error);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis);
      setIsPlaying(status.isPlaying);
    }
  };

  const togglePlayPause = async () => {
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    }
  };

  const formatTime = (millis: number) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return `${minutes}:${Number(seconds) < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <View className="flex-1 bg-purple-900 px-4">
      {/* Header */}
      <View className="flex-row items-center justify-between pt-12 pb-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-down" size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="ellipsis-vertical" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Cover Art */}
      <View className="items-center justify-center flex-1">
        {artwork ? (
          <Image
            source={{ uri: artwork as string }}
            className="w-72 h-72 rounded-lg"
          />
        ) : (
          <LinearGradient
            colors={['#8B5CF6', '#3B82F6']}
            className="w-72 h-72 rounded-lg items-center justify-center"
          >
            <Ionicons name="musical-note" size={64} color="white" />
          </LinearGradient>
        )}
      </View>

      {/* Song Info */}
      <View className="items-center mb-8">
        <Text className="text-white text-2xl font-bold mb-2">{title}</Text>
        <Text className="text-gray-300 text-lg">{artist}</Text>
      </View>

      {/* Progress Bar */}
      <View className="mb-8">
        <Slider
          style={{width: '100%', height: 40}}
          minimumValue={0}
          maximumValue={duration}
          value={position}
          onSlidingComplete={async (value) => {
            if (sound) {
              await sound.setPositionAsync(value);
            }
          }}
          minimumTrackTintColor="#fff"
          maximumTrackTintColor="#666"
          thumbTintColor="#fff"
        />
        <View className="flex-row justify-between">
          <Text className="text-gray-300">{formatTime(position)}</Text>
          <Text className="text-gray-300">{formatTime(duration)}</Text>
        </View>
      </View>

      {/* Controls */}
      <View className="flex-row items-center justify-between mb-12">
        <TouchableOpacity>
          <Ionicons name="shuffle" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="play-skip-back" size={36} color="white" />
        </TouchableOpacity>
        <TouchableOpacity 
          className="bg-white rounded-full p-4"
          onPress={togglePlayPause}
        >
          <Ionicons 
            name={isPlaying ? "pause" : "play"} 
            size={30} 
            color="purple"
          />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="play-skip-forward" size={36} color="white" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="repeat" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
