import { View, Text, TextInput, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import SongItem from '../components/SongItem';
import { useState, useEffect } from 'react';
import * as MediaLibrary from 'expo-media-library';

const navigationTabs = ['Chansons', 'Vidéos', 'Artistes', 'Albums', 'Doss'];

type Song = {
  id: string;
  title: string;
  artist: string;
  album: string;
  uri?: string;
  artwork?: string;
};

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([]);

  useEffect(() => {
    loadSongs();
  }, []);

  const loadSongs = async () => {
    try {
      // Demander la permission d'accéder à la médiathèque
      const permission = await MediaLibrary.requestPermissionsAsync();
      
      if (!permission.granted) {
        Alert.alert(
          "Permission requise",
          "L'application a besoin d'accéder à vos fichiers audio pour fonctionner."
        );
        return;
      }

      // Obtenir tous les fichiers audio
      const media = await MediaLibrary.getAssetsAsync({
        mediaType: 'audio',
        first: 100 // Limite le nombre de résultats pour de meilleures performances
      });

      // Obtenir les détails de chaque asset pour avoir l'artwork
      const songsWithDetails = await Promise.all(
        media.assets.map(async (asset) => {
          const assetInfo = await MediaLibrary.getAssetInfoAsync(asset);
          return {
            id: asset.id,
            title: asset.filename.replace(/\.[^/.]+$/, ""),
            artist: asset.artist || 'Artiste inconnu',
            album: asset.album || 'Album inconnu',
            uri: asset.uri,
            artwork: assetInfo.localUri
          };
        })
      );

      setSongs(songsWithDetails);
    } catch (error) {
      console.error('Erreur lors du chargement des chansons:', error);
      Alert.alert(
        "Erreur",
        "Impossible de charger vos fichiers audio. Veuillez réessayer."
      );
    }
  };

  return (
    <View className="flex-1 bg-gray-900">
      <StatusBar style="light" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-12 pb-4">
        <TouchableOpacity>
          <Ionicons name="menu" size={30} color="white" />
        </TouchableOpacity>
        
        {/* Search Bar */}
        <View className="flex-1 mx-4 flex-row items-center bg-gray-800 rounded-full px-4 ">
          <Ionicons name="search" size={20} color="gray" />
          <TextInput
            className="flex-1 ml-2 text-white"
            placeholder="Rechercher des chansons, des listes de lecture..."
            placeholderTextColor="gray"
          />
          <TouchableOpacity>
            <Ionicons name="mic" size={20} color="gray" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Access Buttons */}
      <View className="flex-row px-4 py-4 space-x-4 gap-2">
        <TouchableOpacity className="bg-purple-600 rounded-xl p-4 flex-1">
          <Ionicons name="star" size={24} color="white" />
          <Text className="text-white mt-2">Favoris</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="bg-teal-600 rounded-xl p-4 flex-1">
          <Ionicons name="list" size={24} color="white" />
          <Text className="text-white mt-2">Playlist</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="bg-orange-400 rounded-xl p-4 flex-1">
          <Ionicons name="time" size={24} color="white" />
          <Text className="text-white mt-2">Récent</Text>
        </TouchableOpacity>
      </View>

      {/* Navigation Tabs */}
      <View className="flex-row justify-between px-4 border-b border-gray-800">
        {navigationTabs.map((tab) => (
          <TouchableOpacity key={tab} className="pb-2">
            <Text className="text-gray-400">{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Random Play Button */}
      <View className="flex-row items-center justify-between px-4 py-4">
        <TouchableOpacity className="flex-row items-center">
          <View className="bg-purple-600 rounded-full p-2 mr-2">
            <Ionicons name="play" size={20} color="white" />
          </View>
          <Text className="text-white text-lg">Lecture aléatoire</Text>
        </TouchableOpacity>
        <View className="flex-row space-x-4">
          <Ionicons name="shuffle" size={24} color="white" />
          <Ionicons name="list" size={24} color="white" />
        </View>
      </View>

      {/* Song List */}
      <ScrollView className="flex-1 px-4">
        {songs.map((song) => (
          <SongItem
            key={song.id}
            title={song.title}
            artist={song.artist}
            album={song.album}
            artwork={song.artwork}
            uri={song.uri}
          />
        ))}
      </ScrollView>

      {/* Mini Player */}
      <View className="border-t border-gray-800 p-4 flex-row items-center">
        <LinearGradient
          colors={['#8B5CF6', '#3B82F6']}
          className="w-12 h-12 rounded-full"
        />
        <View className="flex-1 ml-3">
          <Text className="text-white">Titre en cours</Text>
          <Text className="text-gray-400">Artiste</Text>
        </View>
        <TouchableOpacity className="mr-4">
          <Ionicons name="play" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="play-skip-forward" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
