import { createContext, useContext, ReactNode, useState } from 'react';
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
  setIsPlaying: (playing: boolean) => void;
  sound: Audio.Sound | null;
  setSound: (sound: Audio.Sound | null) => void;
  position: number;
  setPosition: (position: number) => void;
  duration: number;
  setDuration: (duration: number) => void;
  playlist: Song[];
  setPlaylist: (songs: Song[]) => void;
  playNextSong: () => Promise<void>;
  playPreviousSong: () => Promise<void>;
  loadAndPlaySong: (song: Song) => Promise<void>;
};

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playlist, setPlaylist] = useState<Song[]>([]);

  const loadAndPlaySong = async (song: Song) => {
    try {
      // Arrêter la lecture en cours si elle existe
      if (sound) {
        await sound.unloadAsync();
      }

      // Charger le nouvel audio
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: song.uri },
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded) {
            setPosition(status.positionMillis);
            setDuration(status.durationMillis);
            setIsPlaying(status.isPlaying);
          }
        }
      );
      
      setSound(newSound);
      setIsPlaying(true);
      setCurrentSong(song);
    } catch (error) {
      console.error('Error loading audio:', error);
    }
  };

  const playNextSong = async () => {
    if (!currentSong || playlist.length === 0) return;
    
    const currentIndex = playlist.findIndex(song => song.uri === currentSong.uri);
    if (currentIndex === -1) return;
    
    const nextIndex = (currentIndex + 1) % playlist.length;
    await loadAndPlaySong(playlist[nextIndex]);
  };

  const playPreviousSong = async () => {
    if (!currentSong || playlist.length === 0) return;
    
    const currentIndex = playlist.findIndex(song => song.uri === currentSong.uri);
    if (currentIndex === -1) return;
    
    const previousIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    await loadAndPlaySong(playlist[previousIndex]);
  };

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        setCurrentSong,
        isPlaying,
        setIsPlaying,
        sound,
        setSound,
        position,
        setPosition,
        duration,
        setDuration,
        playlist,
        setPlaylist,
        playNextSong,
        playPreviousSong,
        loadAndPlaySong,
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
