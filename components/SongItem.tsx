import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { usePlayer } from '../context/PlayerContext';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

type SongItemProps = {
  title: string;
  artist: string;
  album?: string;
  artwork?: string;
  uri?: string;
};

export default function SongItem({ title, artist, album, artwork, uri }: SongItemProps) {
  const router = useRouter();
  const { loadAndPlaySong } = usePlayer();

  const handlePress = async () => {
    await loadAndPlaySong({
      id: 'current',
      title,
      artist,
      album,
      artwork,
      uri,
    });
    
    router.push({
      pathname: '/player',
      params: { title, artist, artwork, uri }
    });
  };

  const handleShare = async () => {
    try {
      // Vérifier si le partage est disponible sur cet appareil
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert("Erreur", "Le partage n'est pas disponible sur cet appareil");
        return;
      }

      // Créer un fichier temporaire avec les métadonnées dans le nom
      const fileUri = uri;
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      
      if (!fileInfo.exists) {
        Alert.alert("Erreur", "Le fichier n'existe pas");
        return;
      }

      // Partager le fichier
      await Sharing.shareAsync(fileUri, {
        dialogTitle: `Partager ${title}`,
        mimeType: 'audio/*',
        UTI: 'public.audio' // pour iOS
      });
      
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert(
        "Erreur",
        "Une erreur est survenue lors du partage du fichier"
      );
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
      <TouchableOpacity onPress={handleShare}>
        <Ionicons name="share-outline" size={24} color="gray" />
      </TouchableOpacity>
      <TouchableOpacity className="ml-4">
        <Ionicons name="ellipsis-vertical" size={24} color="gray" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
