import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Slider from '@react-native-community/slider';
import { usePlayer } from '../context/PlayerContext';
import { StatusBar } from 'expo-status-bar';

export default function Player() {
  const router = useRouter();
  const { 
    currentSong, 
    isPlaying, 
    playSound,
    pauseSound,
    position,
    duration,
    playNextSong,
    playPreviousSong,
    repeatMode,
    setRepeatMode,
    isShuffleOn,
    setIsShuffleOn
  } = usePlayer();

  if (!currentSong) {
    return (
      <View className="flex-1 bg-purple-900 items-center justify-center">
        <Text className="text-white">Aucune musique en cours de lecture</Text>
      </View>
    );
  }

  const formatTime = (millis: number) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return `${minutes}:${Number(seconds) < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <View className="flex-1 bg-purple-900 px-4">
      <StatusBar style="light" />
      {/* Header */}
      <View className="flex-row items-center justify-between pt-12 pb-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back-outline" size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="ellipsis-vertical" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Cover Art */}
      <View className="items-center justify-center flex-1">
        {currentSong.artwork ? (
          <Image
            source={{ uri: currentSong.artwork }}
            className="w-80 h-80 rounded-lg"
          />
        ) : (
          <LinearGradient
            colors={['#8B5CF6', '#3B82F6']}
            className="w-[90vw] h-[40vh] rounded-lg items-center justify-center"
            style={{ borderRadius: 8 }}
          >
            <Ionicons name="musical-note" size={64} color="white" />
          </LinearGradient>
        )}
      </View>

      {/* Song Info */}
      <View className="items-center mb-8">
        <Text className="text-white text-2xl font-bold mb-2">{currentSong.title}</Text>
        <Text className="text-gray-300 text-lg">{currentSong.artist}</Text>
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
        <TouchableOpacity 
          onPress={() => {
            setIsShuffleOn(!isShuffleOn);
          }}
        >
          <Ionicons 
            name="shuffle" 
            size={24} 
            color={isShuffleOn ? "#8B5CF6" : "white"} 
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={playPreviousSong}>
          <Ionicons name="play-skip-back" size={36} color="white" />
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-white rounded-full p-4"
          onPress={() => isPlaying ? pauseSound() : playSound()}
        >
          <Ionicons 
            name={isPlaying ? "pause" : "play"} 
            size={30} 
            color="purple"
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={playNextSong}>
          <Ionicons name="play-skip-forward" size={36} color="white" />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => {
            const modes: ('none' | 'all' | 'one')[] = ['none', 'all', 'one'];
            const currentIndex = modes.indexOf(repeatMode);
            const nextIndex = (currentIndex + 1) % modes.length;
            setRepeatMode(modes[nextIndex]);
          }}
        >
          <View>
            <Ionicons 
              name={repeatMode === 'one' ? "repeat-once" : "repeat"} 
              size={24} 
              color={repeatMode === 'none' ? "white" : "#8B5CF6"} 
            />
            {repeatMode === 'one' && (
              <View className="absolute -top-2 -right-2">
                <Text className="text-xs text-purple-500">1</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
