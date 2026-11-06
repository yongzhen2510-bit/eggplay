import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Modal, Platform, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatSecs } from './GameRow';
import { Badge, Button, spring, T, useReducedMotion } from './ui';
import { GAMES, shuffle } from '../games/catalog';
import { useStore } from '../state/store';
import { useColors } from '../theme/tokens';

// For the undecided: the app decides. Names flick past briefly, then land on something fresh.
export default function PickerSheet({ onClose, onPlay }) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const { tr, pickFresh, played } = useStore();
  const [shown, setShown] = useState(() => pickFresh());
  const [landed, setLanded] = useState(false);
  const y = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const scrim = useRef(new Animated.Value(0)).current;
  const timer = useRef(null);

  const roll = () => {
    clearInterval(timer.current);
    const target = pickFresh(landed ? shown.id : undefined);
    if (reduced) { setShown(target); setLanded(true); return; }
    setLanded(false);
    const reel = shuffle(GAMES).slice(0, 9);
    let i = 0;
    timer.current = setInterval(() => {
      if (i >= reel.length) { clearInterval(timer.current); setShown(target); setLanded(true); return; }
      setShown(reel[i++]);
    }, 70);
  };

  useEffect(() => {
    spring(y, 0, { response: 0.36 }); spring(scrim, 1, { response: 0.3 });
    roll();
    return () => clearInterval(timer.current);
  }, []);

  const close = () => { clearInterval(timer.current); onClose(); };
  const name = tr(shown.zh, shown.en);

  return (
    <Modal transparent visible animationType="none" onRequestClose={close} statusBarTranslucent={Platform.OS === 'android'}>
      <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: c.scrim, opacity: scrim }}>
        <Pressable accessibilityRole="button" accessibilityLabel={tr('關閉', 'Close')} style={{ flex: 1 }} onPress={close} />
      </Animated.View>
      <View style={{ flex: 1 }} pointerEvents="box-none" />
      <Animated.View accessibilityViewIsModal style={{ backgroundColor: c.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 24 + insets.bottom, width: '100%', maxWidth: 640, alignSelf: 'center', transform: [{ translateY: reduced ? 0 : y }] }}>
        <T v="subhead" color={c.secondary} style={{ textAlign: 'center' }}>{tr('今天就玩這款', 'Today you are playing')}</T>
        <View style={{ alignItems: 'center', marginTop: 14, marginBottom: 6 }}><Badge icon={shown.icon} tone={shown.type} size={80} /></View>
        <T v="title" accessibilityLiveRegion="polite" style={{ textAlign: 'center', marginTop: 6 }}>{name}</T>
        <T v="subhead" color={c.secondary} style={{ textAlign: 'center', marginTop: 4, minHeight: 21 }}>
          {landed ? `${tr(shown.dz, shown.de)} · ${formatSecs(shown.secs, tr)}${played[shown.id] ? '' : tr(' · 沒玩過', ' · New')}` : ' '}
        </T>
        <Button style={{ marginTop: 20 }} disabled={!landed} icon="play" title={tr('就決定是你了！', "You're the one!")} onPress={() => onPlay(shown)} />
        <Button style={{ marginTop: 10 }} kind="secondary" icon="shuffle" title={tr('換一個', 'Pick Another')} onPress={roll} />
      </Animated.View>
    </Modal>
  );
}
