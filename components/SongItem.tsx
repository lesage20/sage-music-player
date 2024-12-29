import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type SongItemProps = {
  title: string;
  artist: string;
  album?: string;
  onPress?: () => void;
};

export default function SongItem({ title, artist, album, onPress }: SongItemProps) {
  return (
    <TouchableOpacity 
      className="flex-row items-center py-3"
      onPress={onPress}
    >
      <LinearGradient
        colors={['#8B5CF6', '#3B82F6']}
        className="w-12 h-12 flex items-center justify-center"
        style={{ borderRadius: 5 }}
      />
      <View className="ml-3 flex-1">
        <Text className="text-white font-medium">{title}</Text>
        <Text className="text-gray-400">
          {artist}{album ? ` • ${album}` : ''}
        </Text>
      </View>
      <TouchableOpacity>
        <Ionicons name="share-outline" size={24} color="gray" />
      </TouchableOpacity>
      <TouchableOpacity className="ml-4">
        <Ionicons name="ellipsis-vertical" size={24} color="gray" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
