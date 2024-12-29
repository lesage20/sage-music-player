import { createContext, useContext, useState, ReactNode } from 'react';
import { Audio } from 'expo-av';

type Song = {
  id: string;
  title: string;
  artist: string;
  album: string;
  uri?: string;
  artwork?: string;
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
};

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

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
