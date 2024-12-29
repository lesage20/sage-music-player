import { View, Text, TextInput, ScrollView, TouchableOpacity, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import SongItem from '../components/SongItem';
import { useState } from 'react';

const navigationTabs = ['Chansons', 'Vidéos', 'Artistes', 'Albums', 'Doss'];

type Song = {
  id: string;
  title: string;
  artist: string;
  album: string;
};

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([
    {
      id: '1',
      title: 'Ada Ehi ft Dena Mwana',
      artist: 'Artiste inconnu',
      album: 'Album inconnu'
    },
    {
      id: '2',
      title: 'Ada Ehi - Congratulations',
      artist: 'Artiste inconnu',
      album: 'Album inconnu'
    },
    {
      id: '3',
      title: 'ADA EHI - I TESTIFY',
      artist: 'Artiste inconnu',
      album: 'Album inconnu'
    },
    {
      id: '4',
      title: 'Ada Ehi - Settled',
      artist: 'Artiste inconnu',
      album: 'Album inconnu'
    },
    {
      id: '5',
      title: 'Ada Ehi - The Bridge',
      artist: 'Artiste inconnu',
      album: 'Album inconnu'
    }
  ]);

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
