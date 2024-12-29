import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import Slider from '@react-native-community/slider';
import { usePlayer } from '../context/PlayerContext';

export default function Player() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { 
    currentSong, 
    setCurrentSong, 
    sound,
    isPlaying, 
    setIsPlaying,
    position,
    duration
  } = usePlayer();

  const { title, artist, artwork, uri } = params;

  useEffect(() => {
    if (!currentSong || currentSong.uri !== uri) {
      setCurrentSong({
        id: 'current',
        title: title as string,
        artist: artist as string,
        artwork: artwork as string,
        uri: uri as string,
      });
    }
  }, [uri]);

  const togglePlayPause = async () => {
    if (!sound) return;
    
    if (isPlaying) {
      await sound.pauseAsync();
      setIsPlaying(false);
    } else {
      await sound.playAsync();
      setIsPlaying(true);
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
