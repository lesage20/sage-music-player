import React, { createContext, useContext, useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';

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
  repeatMode: 'none' | 'all' | 'one';
  setRepeatMode: (mode: 'none' | 'all' | 'one') => void;
  isShuffleOn: boolean;
  setIsShuffleOn: (isOn: boolean) => void;
};

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

// Configuration basique des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlist, setPlaylistState] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [repeatMode, setRepeatMode] = useState<'none' | 'all' | 'one'>('none');
  const [isShuffleOn, setIsShuffleOn] = useState(false);
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);

  // Initialiser les notifications
  useEffect(() => {
    async function setupNotifications() {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permissions not granted');
        return;
      }

      // Écouter les actions de notification
      const subscription = Notifications.addNotificationResponseReceivedListener(response => {
        const actionId = response.notification.request.content.data?.action;
        if (actionId) {
          switch (actionId) {
            case 'play':
              playSound();
              break;
            case 'pause':
              pauseSound();
              break;
            case 'next':
              playNextSong();
              break;
            case 'previous':
              playPreviousSong();
              break;
          }
        }
      });

      return () => subscription.remove();
    }

    setupNotifications();
  }, []);

  // Mettre à jour la notification
  const updateNotification = async () => {
    if (!currentSong) {
      await Notifications.dismissAllNotificationsAsync();
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: currentSong.title,
          body: currentSong.artist,
          data: {
            action: isPlaying ? 'pause' : 'play',
            songUri: currentSong.uri,
          },
          sticky: true,
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  };

  // Mettre à jour la notification quand l'état change
  useEffect(() => {
    updateNotification();
  }, [currentSong, isPlaying]);

  const shufflePlaylist = () => {
    if (playlist.length === 0) return;
    const indices = Array.from(Array(playlist.length).keys());
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    if (currentSong) {
      const currentSongIndex = indices.indexOf(currentIndex);
      if (currentSongIndex !== -1) {
        [indices[currentIndex], indices[currentSongIndex]] = 
        [indices[currentSongIndex], indices[currentIndex]];
      }
    }
    setShuffledIndices(indices);
  };

  useEffect(() => {
    if (isShuffleOn) {
      shufflePlaylist();
    }
  }, [isShuffleOn, playlist]);

  const loadAndPlaySong = async (song: Song) => {
    try {
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
            
            if (status.didJustFinish) {
              if (repeatMode === 'one') {
                newSound.replayAsync();
              } else {
                playNextSong();
              }
            }
          }
        }
      );

      // Configurer l'audio pour fonctionner en arrière-plan
      await Audio.setAudioModeAsync({
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      setSound(newSound);
      setCurrentSong(song);
      setIsPlaying(true);

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
    if (currentSong) {
      const currentIndex = songs.findIndex(song => song.uri === currentSong.uri);
      if (currentIndex !== -1) {
        setCurrentIndex(currentIndex);
      } else {
        setCurrentIndex(0);
        setCurrentSong(songs[0]);
      }
    } else if (songs.length > 0) {
      setCurrentIndex(0);
      setCurrentSong(songs[0]);
    }
    
    if (isShuffleOn) {
      shufflePlaylist();
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

  const getNextIndex = () => {
    if (playlist.length === 0) return -1;
    if (isShuffleOn) {
      const currentShuffledIndex = shuffledIndices.indexOf(currentIndex);
      return shuffledIndices[(currentShuffledIndex + 1) % playlist.length];
    }
    return (currentIndex + 1) % playlist.length;
  };

  const getPreviousIndex = () => {
    if (playlist.length === 0) return -1;
    if (isShuffleOn) {
      const currentShuffledIndex = shuffledIndices.indexOf(currentIndex);
      return shuffledIndices[currentShuffledIndex === 0 ? playlist.length - 1 : currentShuffledIndex - 1];
    }
    return currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
  };

  const playNextSong = async () => {
    if (playlist.length === 0) return;
    
    if (repeatMode === 'none' && currentIndex === playlist.length - 1) {
      await pauseSound();
      return;
    }

    const nextIndex = getNextIndex();
    if (nextIndex !== -1) {
      await loadAndPlaySong(playlist[nextIndex]);
    }
  };

  const playPreviousSong = async () => {
    if (playlist.length === 0) return;

    const previousIndex = getPreviousIndex();
    if (previousIndex !== -1) {
      await loadAndPlaySong(playlist[previousIndex]);
    }
  };

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
        repeatMode,
        setRepeatMode,
        isShuffleOn,
        setIsShuffleOn,
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
