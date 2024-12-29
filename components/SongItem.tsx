import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { usePlayer } from '../context/PlayerContext';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import SongDropdown from './SongDropdown';

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
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert("Erreur", "Le partage n'est pas disponible sur cet appareil");
        return;
      }

      const fileUri = uri;
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      
      if (!fileInfo.exists) {
        Alert.alert("Erreur", "Le fichier n'existe pas");
        return;
      }

      await Sharing.shareAsync(fileUri, {
        dialogTitle: `Partager ${title}`,
        mimeType: 'audio/*',
        UTI: 'public.audio'
      });
      
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert(
        "Erreur",
        "Une erreur est survenue lors du partage du fichier"
      );
    }
  };

  const handleAddToPlaylist = () => {
    // TODO: Implémenter l'ajout à la playlist
    Alert.alert("Info", "Fonctionnalité à venir : Ajouter à la playlist");
  };

  const handleAddToFavorites = () => {
    // TODO: Implémenter l'ajout aux favoris
    Alert.alert("Info", "Fonctionnalité à venir : Ajouter aux favoris");
  };

  const handleSetAsRingtone = () => {
    // TODO: Implémenter la fonction sonnerie
    Alert.alert("Info", "Fonctionnalité à venir : Définir comme sonnerie");
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
      <SongDropdown
        onAddToPlaylist={handleAddToPlaylist}
        onAddToFavorites={handleAddToFavorites}
        onSetAsRingtone={handleSetAsRingtone}
        onShare={handleShare}
      />
    </TouchableOpacity>
  );
}
