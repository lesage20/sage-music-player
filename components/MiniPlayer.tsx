import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePlayer } from '../context/PlayerContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function MiniPlayer() {
  const router = useRouter();
  const pathname = usePathname();
  const { currentSong, isPlaying, playSound, pauseSound } = usePlayer();

  // Ne pas afficher le MiniPlayer sur la page du player
  if (!currentSong || pathname === '/player') return null;

  return (
    <TouchableOpacity
      className="absolute bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800"
      onPress={() => router.push('/player')}
    >
      <View className="flex-row items-center p-2">
        {/* Artwork ou icône par défaut */}
        {currentSong.artwork ? (
          <Image
            source={{ uri: currentSong.artwork }}
            className="w-12 h-12"
            style={{ borderRadius: 6 }}
          />
        ) : (
          <LinearGradient
            colors={['#8B5CF6', '#3B82F6']}
            className="w-12 h-12 items-center justify-center"
            style={{ borderRadius: 6 }}
          >
            <Ionicons name="musical-note" size={24} color="white" />
          </LinearGradient>
        )}

        {/* Informations de la chanson */}
        <View className="flex-1 ml-3">
          <Text className="text-white font-medium" numberOfLines={1}>
            {currentSong.title}
          </Text>
          <Text className="text-gray-400 text-sm" numberOfLines={1}>
            {currentSong.artist}
          </Text>
        </View>

        {/* Boutons de contrôle */}
        <TouchableOpacity
          onPress={() => (isPlaying ? pauseSound() : playSound())}
          className="px-3"
        >
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={24}
            color="white"
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
