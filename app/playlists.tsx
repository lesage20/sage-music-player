import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePlaylists, Playlist } from '../context/PlaylistContext';
import { StatusBar } from 'expo-status-bar';

export default function PlaylistsScreen() {
  const router = useRouter();
  const { playlists, createPlaylist, deletePlaylist } = usePlaylists();
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un nom pour la playlist');
      return;
    }

    createPlaylist(newPlaylistName);
    setNewPlaylistName('');
    setIsCreating(false);
  };

  const handleDeletePlaylist = (playlist: Playlist) => {
    Alert.alert(
      'Supprimer la playlist',
      `Êtes-vous sûr de vouloir supprimer "${playlist.name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => deletePlaylist(playlist.id),
        },
      ]
    );
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View className="flex-1 bg-gray-900 pt-12">
      <StatusBar style="light" />
      <Stack.Screen
        options={{
          title: 'Mes Playlists',
          headerStyle: { backgroundColor: '#111827' },
          headerTintColor: '#fff',
        }}
      />

      {/* En-tête avec bouton de création */}
      <View className="p-4 border-b border-gray-800">
        {isCreating ? (
          <View className="flex-row items-center">
            <TextInput
              className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg mr-2"
              placeholder="Nom de la playlist"
              placeholderTextColor="gray"
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              autoFocus
            />
            <TouchableOpacity
              onPress={handleCreatePlaylist}
              className="bg-purple-600 p-2 rounded-lg mr-2"
            >
              <Ionicons name="checkmark" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setIsCreating(false);
                setNewPlaylistName('');
              }}
              className="bg-gray-700 p-2 rounded-lg"
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => setIsCreating(true)}
            className="flex-row items-center bg-purple-600 px-4 py-3 rounded-lg"
          >
            <Ionicons name="add" size={24} color="white" />
            <Text className="text-white ml-2 font-medium">
              Nouvelle playlist
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Liste des playlists */}
      <ScrollView className="flex-1">
        {playlists.length === 0 ? (
          <View className="flex-1 items-center justify-center py-12">
            <Ionicons name="musical-notes" size={48} color="gray" />
            <Text className="text-gray-400 mt-4 text-center px-4">
              Vous n'avez pas encore de playlist.{'\n'}
              Créez-en une pour commencer !
            </Text>
          </View>
        ) : (
          playlists.map((playlist) => (
            <TouchableOpacity
              key={playlist.id}
              className="flex-row items-center p-4 border-b border-gray-800"
              onPress={() => router.push(`/playlist/${playlist.id}`)}
            >
              <View className="bg-purple-600 w-12 h-12 rounded-lg items-center justify-center">
                <Ionicons name="musical-notes" size={24} color="white" />
              </View>
              <View className="flex-1 ml-3">
                <Text className="text-white font-medium">{playlist.name}</Text>
                <Text className="text-gray-400 text-sm">
                  {playlist.songs.length} titre{playlist.songs.length !== 1 ? 's' : ''} • Créée le{' '}
                  {formatDate(playlist.createdAt)}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleDeletePlaylist(playlist)}
                className="p-2"
              >
                <Ionicons name="trash-outline" size={20} color="gray" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}
