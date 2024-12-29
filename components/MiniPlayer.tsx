import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { usePlayer } from '../context/PlayerContext';

export default function MiniPlayer() {
  const router = useRouter();
  const { currentSong, isPlaying, sound, setIsPlaying } = usePlayer();

  if (!currentSong) return null;

  const handlePlayPause = async () => {
    if (!sound) return;
    
    if (isPlaying) {
      await sound.pauseAsync();
      setIsPlaying(false);
    } else {
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  const handlePress = () => {
    router.push({
      pathname: '/player',
      params: {
        title: currentSong.title,
        artist: currentSong.artist,
        artwork: currentSong.artwork,
        uri: currentSong.uri,
      },
    });
  };

  return (
    <TouchableOpacity 
      className="absolute bottom-0 left-0 right-0 bg-purple-900 border-t border-purple-800"
      onPress={handlePress}
    >
      <View className="flex-row items-center justify-between px-4 py-2">
        <View className="flex-row items-center flex-1">
          {currentSong.artwork ? (
            <Image
              source={{ uri: currentSong.artwork }}
              className="w-12 h-12 rounded"
            />
          ) : (
            <LinearGradient
              colors={['#8B5CF6', '#3B82F6']}
              className="w-12 h-12 rounded items-center justify-center"
            >
              <Ionicons name="musical-note" size={24} color="white" />
            </LinearGradient>
          )}
          <View className="ml-3 flex-1">
            <Text className="text-white font-medium">{currentSong.title}</Text>
            <Text className="text-gray-300">{currentSong.artist}</Text>
          </View>
        </View>
        
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={handlePlayPause}
            className="mr-4"
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={24}
              color="white"
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}
