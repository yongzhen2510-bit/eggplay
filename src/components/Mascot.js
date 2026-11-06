import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import Logo from './Logo';
import { spring, useReducedMotion } from './ui';
import { useColors } from '../theme/tokens';

const SIZE = 112;

// The app icon comes to life: its hands rise to cover its eyes while you type a password.
export default function Mascot({ covering }) {
  const c = useColors();
  const reduced = useReducedMotion();
  const y = useRef(new Animated.Value(0)).current;
  useEffect(() => { spring(y, covering ? 1 : 0, { response: 0.3, ratio: 0.85, reduced }); }, [covering]);
  const lift = y.interpolate({ inputRange: [0, 1], outputRange: [SIZE * 0.72, 0] });
  const hand = left => <Animated.View style={{ position: 'absolute', left, top: SIZE * 0.3, width: 30, height: SIZE, borderRadius: 15, backgroundColor: c.paw, borderWidth: 1, borderColor: 'rgba(92,70,36,0.28)', transform: [{ translateY: lift }] }} />;
  return <View style={{ alignSelf: 'center' }}><Logo size={SIZE}>{hand(SIZE * 0.17)}{hand(SIZE * 0.51)}</Logo></View>;
}
