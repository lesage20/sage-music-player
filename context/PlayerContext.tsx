import React, { createContext, useContext, useState, useEffect } from 'react';
import { Audio } from 'expo-av';

export type Song = {
  id: string;
  title: string;
  artist: string;
  album?: string;
  artwork?: string;
  uri: string;
};

type PlayerContextType = {
  currentSong: Song | null;
  setCurrentSong: (song: Song | null) => void;
  isPlaying: boolean;
  sound: Audio.Sound | null;
  loadAndPlaySong: (song: Song) => Promise<void>;
  playSound: () => Promise<void>;
  pauseSound: () => Promise<void>;
  playlist: Song[];
  setPlaylist: (songs: Song[]) => void;
  playNextSong: () => Promise<void>;
  playPreviousSong: () => Promise<void>;
  position: number;
  duration: number;
};

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlist, setPlaylistState] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  const loadAndPlaySong = async (song: Song) => {
    try {
      // Décharger le son précédent s'il existe
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: song.uri },
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded) {
            setPosition(status.positionMillis);
            setDuration(status.durationMillis || 0);
            setIsPlaying(status.isPlaying);
          }
        }
      );

      setSound(newSound);
      setCurrentSong(song);
      setIsPlaying(true);

      // Mettre à jour l'index si la chanson fait partie de la playlist
      const songIndex = playlist.findIndex(s => s.uri === song.uri);
      if (songIndex !== -1) {
        setCurrentIndex(songIndex);
      }
    } catch (error) {
      console.error('Error loading sound:', error);
    }
  };

  const setPlaylist = (songs: Song[]) => {
    setPlaylistState(songs);
    // Si une chanson est en cours de lecture, trouver son index dans la nouvelle playlist
    if (currentSong) {
      const currentIndex = songs.findIndex(song => song.uri === currentSong.uri);
      if (currentIndex !== -1) {
        setCurrentIndex(currentIndex);
      } else {
        // Si la chanson n'est pas dans la playlist, commencer au début
        setCurrentIndex(0);
        setCurrentSong(songs[0]);
      }
    } else if (songs.length > 0) {
      // Si aucune chanson n'est en cours, définir la première chanson
      setCurrentIndex(0);
      setCurrentSong(songs[0]);
    }
  };

  const playSound = async () => {
    if (sound) {
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  const pauseSound = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  };

  const playNextSong = async () => {
    if (playlist.length === 0) return;

    const nextIndex = (currentIndex + 1) % playlist.length;
    setCurrentIndex(nextIndex);
    await loadAndPlaySong(playlist[nextIndex]);
  };

  const playPreviousSong = async () => {
    if (playlist.length === 0) return;

    const previousIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
    setCurrentIndex(previousIndex);
    await loadAndPlaySong(playlist[previousIndex]);
  };

  // Mettre à jour la position toutes les 100ms pendant la lecture
  useEffect(() => {
    if (sound) {
      const interval = setInterval(async () => {
        if (isPlaying) {
          const status = await sound.getStatusAsync();
          if (status.isLoaded) {
            setPosition(status.positionMillis);
            setDuration(status.durationMillis || 0);
          }
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, [sound, isPlaying]);

  // Nettoyer le son quand le composant est démonté
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        setCurrentSong,
        isPlaying,
        sound,
        loadAndPlaySong,
        playSound,
        pauseSound,
        playlist,
        setPlaylist,
        playNextSong,
        playPreviousSong,
        position,
        duration,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
