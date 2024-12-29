import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Song = {
  id: string;
  title: string;
  artist: string;
  album?: string;
  artwork?: string;
  uri: string;
};

export type Playlist = {
  id: string;
  name: string;
  songs: Song[];
  createdAt: number;
};

type PlaylistContextType = {
  playlists: Playlist[];
  createPlaylist: (name: string) => Promise<Playlist>;
  deletePlaylist: (id: string) => Promise<void>;
  addSongToPlaylist: (playlistId: string, song: Song) => Promise<void>;
  removeSongFromPlaylist: (playlistId: string, songId: string) => Promise<void>;
  getPlaylistById: (id: string) => Playlist | undefined;
  renamePlaylist: (id: string, newName: string) => Promise<void>;
};

const PLAYLISTS_STORAGE_KEY = '@music_player_playlists';

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

export function PlaylistProvider({ children }: { children: React.ReactNode }) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  // Charger les playlists au démarrage
  useEffect(() => {
    loadPlaylists();
  }, []);

  // Sauvegarder les playlists
  const savePlaylists = async (newPlaylists: Playlist[]) => {
    try {
      await AsyncStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(newPlaylists));
    } catch (error) {
      console.error('Error saving playlists:', error);
    }
  };

  // Charger les playlists
  const loadPlaylists = async () => {
    try {
      const savedPlaylists = await AsyncStorage.getItem(PLAYLISTS_STORAGE_KEY);
      if (savedPlaylists) {
        setPlaylists(JSON.parse(savedPlaylists));
      }
    } catch (error) {
      console.error('Error loading playlists:', error);
    }
  };

  const createPlaylist = async (name: string): Promise<Playlist> => {
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name,
      songs: [],
      createdAt: Date.now(),
    };
    const updatedPlaylists = [...playlists, newPlaylist];
    setPlaylists(updatedPlaylists);
    await savePlaylists(updatedPlaylists);
    return newPlaylist;
  };

  const deletePlaylist = async (id: string) => {
    const updatedPlaylists = playlists.filter(playlist => playlist.id !== id);
    setPlaylists(updatedPlaylists);
    await savePlaylists(updatedPlaylists);
  };

  const addSongToPlaylist = async (playlistId: string, song: Song) => {
    const updatedPlaylists = playlists.map(playlist => {
      if (playlist.id === playlistId) {
        // Vérifier si la chanson n'est pas déjà dans la playlist
        if (!playlist.songs.some(s => s.id === song.id)) {
          return {
            ...playlist,
            songs: [...playlist.songs, song],
          };
        }
      }
      return playlist;
    });
    setPlaylists(updatedPlaylists);
    await savePlaylists(updatedPlaylists);
  };

  const removeSongFromPlaylist = async (playlistId: string, songId: string) => {
    const updatedPlaylists = playlists.map(playlist => {
      if (playlist.id === playlistId) {
        return {
          ...playlist,
          songs: playlist.songs.filter(song => song.id !== songId),
        };
      }
      return playlist;
    });
    setPlaylists(updatedPlaylists);
    await savePlaylists(updatedPlaylists);
  };

  const getPlaylistById = (id: string) => {
    return playlists.find(playlist => playlist.id === id);
  };

  const renamePlaylist = async (id: string, newName: string) => {
    const updatedPlaylists = playlists.map(playlist => {
      if (playlist.id === id) {
        return {
          ...playlist,
          name: newName,
        };
      }
      return playlist;
    });
    setPlaylists(updatedPlaylists);
    await savePlaylists(updatedPlaylists);
  };

  return (
    <PlaylistContext.Provider
      value={{
        playlists,
        createPlaylist,
        deletePlaylist,
        addSongToPlaylist,
        removeSongFromPlaylist,
        getPlaylistById,
        renamePlaylist,
      }}
    >
      {children}
    </PlaylistContext.Provider>
  );
}

export function usePlaylists() {
  const context = useContext(PlaylistContext);
  if (context === undefined) {
    throw new Error('usePlaylists must be used within a PlaylistProvider');
  }
  return context;
}
