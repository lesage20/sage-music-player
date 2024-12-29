import { View, Text, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import SongItem from '../components/SongItem';
import SongItemSkeleton from '../components/SongItemSkeleton';
import { useState, useEffect, useMemo } from 'react';
import * as MediaLibrary from 'expo-media-library';
import { usePlayer } from '../context/PlayerContext';

const navigationTabs = ['Chansons', 'Vidéos', 'Artistes', 'Albums'];

type Song = {
  id: string;
  title: string;
  artist: string;
  album?: string;
  artwork?: string;
  uri: string;
};

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { setPlaylist } = usePlayer();

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status === 'granted') {
          const media = await MediaLibrary.getAssetsAsync({
            mediaType: 'audio',
          });
          const songsWithDetails = await Promise.all(
            media.assets.map(async (asset) => {
              const assetInfo = await MediaLibrary.getAssetInfoAsync(asset);
              return {
                id: asset.id,
                title: asset.filename.replace(/\.[^/.]+$/, ''),
                artist: 'Unknown Artist',
                uri: asset.uri,
                artwork: assetInfo.localUri
              };
            })
          );

          setSongs(songsWithDetails);
          setPlaylist(songsWithDetails);
        }
      } catch (error) {
        console.error('Error loading songs:', error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Filtrer les chansons en fonction de la recherche
  const filteredSongs = useMemo(() => {
    if (!searchQuery.trim()) return songs;
    
    const query = searchQuery.toLowerCase().trim();
    return songs.filter(song => 
      song.title.toLowerCase().includes(query) ||
      song.artist.toLowerCase().includes(query) ||
      (song.album && song.album.toLowerCase().includes(query))
    );
  }, [songs, searchQuery]);

  return (
    <View className="flex-1 bg-gray-900">
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <StatusBar style="light" />

      {/* Header */}
      <View className="pt-12 px-4 pb-4 border-b border-gray-800">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white text-2xl font-bold">Musique</Text>
          <TouchableOpacity>
            <Ionicons name="settings-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Barre de recherche */}
        <View className="bg-gray-800 rounded-full flex-row items-center px-4 h-10 mb-4">
          <Ionicons name="search" size={20} color="gray" />
          <TextInput
            className="flex-1 ml-2 text-white"
            placeholder="Rechercher une chanson..."
            placeholderTextColor="gray"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="gray" />
            </TouchableOpacity>
          )}
        </View>

        {/* Navigation Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row"
        >
          {navigationTabs.map((tab, index) => (
            <TouchableOpacity
              key={tab}
              className={`px-4 py-2 rounded-full mr-2 ${
                index === 0 ? 'bg-purple-600' : 'bg-gray-800'
              }`}
            >
              <Text
                className={`${
                  index === 0 ? 'text-white' : 'text-gray-400'
                }`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Quick Access Buttons */}
      <View className="flex-row px-4 py-4 space-x-4 gap-2">
        <TouchableOpacity 
          className="bg-purple-600 rounded-xl p-4 flex-1"
          onPress={() => router.push('/playlists')}
        >
          <Ionicons name="list" size={24} color="white" />
          <Text className="text-white mt-2">Playlists</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="bg-teal-600 rounded-xl p-4 flex-1">
          <Ionicons name="heart" size={24} color="white" />
          <Text className="text-white mt-2">Favoris</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="bg-orange-400 rounded-xl p-4 flex-1">
          <Ionicons name="time" size={24} color="white" />
          <Text className="text-white mt-2">Récents</Text>
        </TouchableOpacity>
      </View>

      {/* Liste des chansons */}
      <ScrollView className="flex-1 px-4">
        {isLoading ? (
          // Afficher 10 skeletons pendant le chargement
          [...Array(10)].map((_, index) => (
            <SongItemSkeleton key={index} />
          ))
        ) : filteredSongs.length === 0 ? (
          <View className="flex-1 items-center justify-center py-8">
            <Ionicons name="search" size={48} color="gray" />
            <Text className="text-gray-400 mt-4 text-center">
              Aucune chanson trouvée pour "{searchQuery}"
            </Text>
          </View>
        ) : (
          filteredSongs.map((song) => (
            <SongItem
              key={song.id}
              title={song.title}
              artist={song.artist}
              artwork={song.artwork}
              uri={song.uri}
              album={song.album}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}
