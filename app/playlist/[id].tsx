import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePlaylists } from '../../context/PlaylistContext';
import SongItem from '../../components/SongItem';
import { usePlayer } from '../../context/PlayerContext';
import { StatusBar } from 'expo-status-bar';

export default function PlaylistScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { getPlaylistById, removeSongFromPlaylist, renamePlaylist } = usePlaylists();
  const { setPlaylist, loadAndPlaySong } = usePlayer();

  const playlist = getPlaylistById(id as string);

  if (!playlist) {
    return (
      <View className="flex-1 bg-gray-900 items-center justify-center">
        <Text className="text-white">Playlist introuvable</Text>
      </View>
    );
  }

  const handlePlayAll = () => {
    setPlaylist(playlist.songs);
    if (playlist.songs.length > 0) {
      router.push('/player');
    }
  };

  const handleRemoveSong = (songId: string) => {
    Alert.alert(
      'Retirer de la playlist',
      'Voulez-vous retirer cette chanson de la playlist ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Retirer',
          style: 'destructive',
          onPress: () => removeSongFromPlaylist(playlist.id, songId),
        },
      ]
    );
  };

  const handleRename = () => {
    Alert.prompt(
      'Renommer la playlist',
      'Entrez le nouveau nom de la playlist',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Renommer',
          onPress: (newName) => {
            if (newName?.trim()) {
              renamePlaylist(playlist.id, newName.trim());
            }
          },
        },
      ],
      'plain-text',
      playlist.name
    );
  };

  return (
    <View className="flex-1 bg-gray-900 pt-12">
      <StatusBar style="light" />
      <Stack.Screen
        options={{
          title: playlist.name,
          headerStyle: { backgroundColor: '#111827' },
          headerTintColor: '#fff',
          headerRight: () => (
            <TouchableOpacity onPress={handleRename}>
              <Ionicons name="pencil" size={24} color="white" />
            </TouchableOpacity>
          ),
        }}
      />

      {/* En-tête de la playlist */}
      <View className="p-4 border-b border-gray-800">
        <View className="items-center mb-4">
          <View className="bg-purple-600 w-32 h-32 rounded-xl items-center justify-center mb-4">
            <Ionicons name="musical-notes" size={64} color="white" />
          </View>
          <Text className="text-white text-xl font-bold">{playlist.name}</Text>
          <Text className="text-gray-400 mt-1">
            {playlist.songs.length} titre{playlist.songs.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {playlist.songs.length > 0 && (
          <TouchableOpacity
            onPress={handlePlayAll}
            className="flex-row items-center justify-center bg-purple-600 px-4 py-3 rounded-lg"
          >
            <Ionicons name="play" size={24} color="white" />
            <Text className="text-white ml-2 font-medium">
              Tout lire
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Liste des chansons */}
      <ScrollView className="flex-1">
        {playlist.songs.length === 0 ? (
          <View className="flex-1 items-center justify-center py-12">
            <Ionicons name="musical-notes" size={48} color="gray" />
            <Text className="text-gray-400 mt-4 text-center px-4">
              Cette playlist est vide.{'\n'}
              Ajoutez des chansons depuis la bibliothèque !
            </Text>
          </View>
        ) : (
          playlist.songs.map((song) => (
            <View key={song.id} className="flex-row items-center">
              <View className="flex-1">
                <SongItem
                  title={song.title}
                  artist={song.artist}
                  artwork={song.artwork}
                  uri={song.uri}
                  album={song.album}
                  onPress={async () => {
                    await loadAndPlaySong(song);
                    setPlaylist(playlist.songs);
                    router.push('/player');
                  }}
                />
              </View>
              <TouchableOpacity
                onPress={() => handleRemoveSong(song.id)}
                className="pr-4"
              >
                <Ionicons name="remove-circle-outline" size={24} color="gray" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
