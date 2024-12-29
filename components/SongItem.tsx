import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { usePlayer } from '../context/PlayerContext';
import { usePlaylists } from '../context/PlaylistContext';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import SongDropdown from './SongDropdown';

type SongItemProps = {
  title: string;
  artist: string;
  album?: string;
  artwork?: string;
  uri: string;
};

export default function SongItem({ title, artist, album, artwork, uri }: SongItemProps) {
  const router = useRouter();
  const { loadAndPlaySong } = usePlayer();
  const { playlists, addSongToPlaylist } = usePlaylists();

  const handlePress = async () => {
    await loadAndPlaySong({
      id: uri,
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
    const playlistNames = playlists.map(p => ({
      text: p.name,
      onPress: () => {
        addSongToPlaylist(p.id, {
          id: uri,
          title,
          artist,
          album,
          artwork,
          uri,
        });
        Alert.alert('Succès', 'Chanson ajoutée à la playlist');
      }
    }));

    if (playlistNames.length === 0) {
      Alert.alert(
        'Aucune playlist',
        "Créez d'abord une playlist pour pouvoir y ajouter des chansons.",
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Créer une playlist',
            onPress: () => router.push('/playlists'),
          },
        ]
      );
      return;
    }

    Alert.alert(
      'Ajouter à une playlist',
      'Choisissez une playlist',
      [
        { text: 'Annuler', style: 'cancel' },
        ...playlistNames.map(item => ({
          text: item.text,
          onPress: item.onPress,
        })),
      ]
    );
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
