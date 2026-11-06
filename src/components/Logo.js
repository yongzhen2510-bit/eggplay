import React from 'react';
import { Image, View } from 'react-native';
import { LOGO_URI } from '../assets/logo';

// The app icon, embedded as a data URI so it also survives Expo Snack's git import,
// which rejects repositories that contain image files.
export default function Logo({ size = 44, children, style }) {
  const radius = Math.round(size * 0.25);
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[{ width: size, height: size, borderRadius: radius, overflow: 'hidden', backgroundColor: '#5E6336' }, style]}>
      <Image source={{ uri: LOGO_URI }} style={{ width: size, height: size }} resizeMode="cover" />
      {children}
    </View>
  );
}
