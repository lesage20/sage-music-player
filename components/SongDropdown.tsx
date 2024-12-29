import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type SongDropdownProps = {
  onAddToPlaylist: () => void;
  onAddToFavorites: () => void;
  onSetAsRingtone: () => void;
  onShare: () => void;
};

export default function SongDropdown({
  onAddToPlaylist,
  onAddToFavorites,
  onSetAsRingtone,
  onShare,
}: SongDropdownProps) {
  const [visible, setVisible] = useState(false);

  const menuItems = [
    {
      icon: 'add-circle-outline',
      text: 'Ajouter à la playlist',
      onPress: () => {
        onAddToPlaylist();
        setVisible(false);
      },
    },
    {
      icon: 'heart-outline',
      text: 'Ajouter aux favoris',
      onPress: () => {
        onAddToFavorites();
        setVisible(false);
      },
    },
    {
      icon: 'notifications-outline',
      text: 'Utiliser comme sonnerie',
      onPress: () => {
        onSetAsRingtone();
        setVisible(false);
      },
    },
    {
      icon: 'share-outline',
      text: 'Partager',
      onPress: () => {
        onShare();
        setVisible(false);
      },
    },
  ];

  return (
    <View>
      <TouchableOpacity onPress={() => setVisible(true)}>
        <Ionicons name="ellipsis-vertical" size={24} color="gray" />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View className="absolute right-4 top-[25%] bg-gray-800 rounded-xl overflow-hidden w-56">
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.text}
                onPress={item.onPress}
                className={`flex-row items-center px-4 py-3 ${
                  index < menuItems.length - 1 ? 'border-b border-gray-700' : ''
                }`}
              >
                <Ionicons name={item.icon as any} size={20} color="#8B5CF6" />
                <Text className="text-white ml-3">{item.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
