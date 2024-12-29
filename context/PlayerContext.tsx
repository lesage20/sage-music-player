import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
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
  repeatMode: 'none' | 'all' | 'one';
  setRepeatMode: (mode: 'none' | 'all' | 'one') => void;
  isShuffleOn: boolean;
  setIsShuffleOn: (on: boolean) => void;
  shuffledPlaylist: Song[];
  setShuffledPlaylist: (songs: Song[]) => void;
};

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [repeatMode, setRepeatMode] = useState<'none' | 'all' | 'one'>('none');
  const [isShuffleOn, setIsShuffleOn] = useState(false);
  const [shuffledPlaylist, setShuffledPlaylist] = useState<Song[]>([]);

  // Fonction pour mélanger la playlist
  const shufflePlaylist = (songs: Song[]) => {
    const shuffled = [...songs];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setShuffledPlaylist(shuffled);
  };

  // Mettre à jour la playlist mélangée quand le shuffle est activé
  useEffect(() => {
    if (isShuffleOn && playlist.length > 0) {
      shufflePlaylist(playlist);
    }
  }, [isShuffleOn, playlist]);

  const getNextSongIndex = (currentIndex: number, currentPlaylist: Song[]) => {
    if (repeatMode === 'one') return currentIndex;
    if (currentIndex === currentPlaylist.length - 1) {
      return repeatMode === 'all' ? 0 : -1;
    }
    return currentIndex + 1;
  };

  const getPreviousSongIndex = (currentIndex: number, currentPlaylist: Song[]) => {
    if (repeatMode === 'one') return currentIndex;
    if (currentIndex === 0) {
      return repeatMode === 'all' ? currentPlaylist.length - 1 : -1;
    }
    return currentIndex - 1;
  };

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
    if (!currentSong) return;
    
    const currentPlaylist = isShuffleOn ? shuffledPlaylist : playlist;
    const currentIndex = currentPlaylist.findIndex(song => song.uri === currentSong.uri);
    if (currentIndex === -1) return;
    
    const nextIndex = getNextSongIndex(currentIndex, currentPlaylist);
    if (nextIndex === -1) return;

    await loadAndPlaySong(currentPlaylist[nextIndex]);
  };

  const playPreviousSong = async () => {
    if (!currentSong) return;
    
    const currentPlaylist = isShuffleOn ? shuffledPlaylist : playlist;
    const currentIndex = currentPlaylist.findIndex(song => song.uri === currentSong.uri);
    if (currentIndex === -1) return;
    
    const previousIndex = getPreviousSongIndex(currentIndex, currentPlaylist);
    if (previousIndex === -1) return;

    await loadAndPlaySong(currentPlaylist[previousIndex]);
  };

  // Gérer la fin de la lecture
  useEffect(() => {
    if (sound) {
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.isLoaded) {
          setPosition(status.positionMillis);
          setDuration(status.durationMillis);
          setIsPlaying(status.isPlaying);
          
          // Si la lecture est terminée
          if (status.didJustFinish) {
            playNextSong();
          }
        }
      });
    }
  }, [sound]);

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
        repeatMode,
        setRepeatMode,
        isShuffleOn,
        setIsShuffleOn,
        shuffledPlaylist,
        setShuffledPlaylist,
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
