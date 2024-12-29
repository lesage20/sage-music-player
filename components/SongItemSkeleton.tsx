import React, { useEffect } from 'react';
import { View, Animated, Easing } from 'react-native';

export default function SongItemSkeleton() {
  const animatedValue = new Animated.Value(0);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View className="flex-row items-center py-3">
      {/* Artwork skeleton */}
      <Animated.View 
        className="w-12 h-12 bg-gray-700 rounded"
        style={{ opacity }}
      />

      {/* Text content skeleton */}
      <View className="ml-3 flex-1">
        <Animated.View 
          className="h-4 bg-gray-700 rounded w-3/4 mb-2"
          style={{ opacity }}
        />
        <Animated.View 
          className="h-3 bg-gray-700 rounded w-1/2"
          style={{ opacity }}
        />
      </View>

      {/* Actions skeleton */}
      <Animated.View 
        className="w-6 h-6 bg-gray-700 rounded-full"
        style={{ opacity }}
      />
    </View>
  );
}
