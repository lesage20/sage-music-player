import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type SongDropdownProps = {
  onAddToPlaylist: () => void;
  onAddToFavorites: () => void;
  onSetAsRingtone: () => void;
  onShare: () => void;
};

type Position = {
  x: number;
  y: number;
};

export default function SongDropdown({
  onAddToPlaylist,
  onAddToFavorites,
  onSetAsRingtone,
  onShare,
}: SongDropdownProps) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const windowWidth = Dimensions.get('window').width;
  const menuWidth = 224; // 56 * 4 (w-56 in Tailwind)

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

  const handlePress = (event: any) => {
    // Obtenir les coordonnées du clic
    const { pageX, pageY } = event.nativeEvent;
    
    // Ajuster la position X pour que le menu ne dépasse pas de l'écran
    const x = Math.min(pageX, windowWidth - menuWidth - 16);
    
    setPosition({ x, y: pageY });
    setVisible(true);
  };

  return (
    <View>
      <TouchableOpacity onPress={handlePress}>
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
          <View 
            className="absolute bg-gray-800 rounded-xl overflow-hidden w-56"
            style={{
              left: position.x,
              top: position.y,
              transform: [{ translateY: -120 }] // Déplacer le menu vers le haut pour le centrer
            }}
          >
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
