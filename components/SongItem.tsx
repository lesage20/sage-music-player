import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { usePlayer } from '../context/PlayerContext';
import { Audio } from 'expo-av';

type SongItemProps = {
  title: string;
  artist: string;
  album?: string;
  artwork?: string;
  uri?: string;
};

export default function SongItem({ title, artist, album, artwork, uri }: SongItemProps) {
  const router = useRouter();
  const { 
    setCurrentSong, 
    setSound, 
    setIsPlaying, 
    setPosition, 
    setDuration,
    sound: currentSound // Récupérer le son actuel
  } = usePlayer();

  const handlePress = async () => {
    try {
      // Arrêter la lecture en cours si elle existe
      if (currentSound) {
        await currentSound.unloadAsync();
      }

      // Charger le nouvel audio
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: uri as string },
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded) {
            setPosition(status.positionMillis);
            setDuration(status.durationMillis);
            setIsPlaying(status.isPlaying);
          }
        }
      );
      
      setSound(newSound);
      setIsPlaying(true);
      
      // Mettre à jour la chanson courante
      setCurrentSong({
        id: 'current',
        title,
        artist,
        album: album || '',
        artwork,
        uri,
      });
      
      // Naviguer vers la page de lecture
      router.push({
        pathname: '/player',
        params: { title, artist, artwork, uri }
      });
    } catch (error) {
      console.error('Error loading audio:', error);
    }
  };

  return (
    <TouchableOpacity 
      className="flex-row items-center py-3"
      onPress={handlePress}
    >
      {artwork ? (
        <Image
          source={{ uri: artwork }}
          className="w-12 h-12"
          style={{ borderRadius: 5 }}
        />
      ) : (
        <LinearGradient
          colors={['#8B5CF6', '#3B82F6']}
          className="w-12 h-12 flex items-center justify-center"
          style={{ borderRadius: 5 }}
        >
          <Ionicons name="musical-note" size={24} color="white" />
        </LinearGradient>
      )}
      <View className="ml-3 flex-1">
        <Text className="text-white font-medium">{title}</Text>
        <Text className="text-gray-400">
          {artist}{album ? ` • ${album}` : ''}
        </Text>
      </View>
      <TouchableOpacity>
        <Ionicons name="share-outline" size={24} color="gray" />
      </TouchableOpacity>
      <TouchableOpacity className="ml-4">
        <Ionicons name="ellipsis-vertical" size={24} color="gray" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
