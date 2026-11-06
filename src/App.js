import React, { useEffect, useRef, useState } from 'react';
import { Animated, BackHandler, Pressable, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import ChatToast from './components/ChatToast';
import { Icon } from './components/icons';
import Logo from './components/Logo';
import { ScreenEnter, spring, T, useReducedMotion } from './components/ui';
import AuthScreen from './screens/AuthScreen';
import ChatRoomScreen, { ChatListScreen } from './screens/ChatScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import GameListScreen from './screens/GameListScreen';
import GameScreen from './screens/GameScreen';
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import { StoreProvider, useStore } from './state/store';
import { useColors } from './theme/tokens';

const TABS = [
  { id: 'home', icon: 'gamepad', zh: '首頁', en: 'Home' },
  { id: 'favorites', icon: 'heart', zh: '收藏', en: 'Saved' },
  { id: 'chat', icon: 'chat', zh: '聊天室', en: 'Chat' },
  { id: 'me', icon: 'person', zh: '我的', en: 'Me' },
];
const TAB_GAP = 4;

function TabBar({ tab, onChange }) {
  const c = useColors();
  const { tr } = useStore();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const [width, setWidth] = useState(0);
  const x = useRef(new Animated.Value(0)).current;
  const placedWidth = useRef(0);
  const slot = (width - TAB_GAP * (TABS.length - 1)) / TABS.length;
  const index = TABS.findIndex(t => t.id === tab);

  // The highlight slides to the chosen tab, but jumps into place on first layout and after a resize.
  useEffect(() => {
    if (!width) return;
    const target = index * (slot + TAB_GAP);
    if (placedWidth.current !== width) { placedWidth.current = width; x.setValue(target); return; }
    spring(x, target, { response: 0.36, ratio: 0.82, reduced });
  }, [index, width]);

  return (
    <View style={{ paddingHorizontal: 8, paddingTop: 6, backgroundColor: c.surface, borderTopWidth: 1, borderTopColor: c.separator, paddingBottom: Math.max(insets.bottom, 6) }}>
      <View accessibilityRole="tablist" onLayout={e => setWidth(e.nativeEvent.layout.width)} style={{ flexDirection: 'row', gap: TAB_GAP }}>
        {width > 0 && <Animated.View pointerEvents="none" style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: slot, borderRadius: 16, backgroundColor: c.accentTint, transform: [{ translateX: x }] }} />}
        {TABS.map(item => {
          const on = item.id === tab;
          const color = on ? c.accent : c.secondary;
          return (
            <Pressable key={item.id} accessibilityRole="tab" accessibilityState={{ selected: on }} aria-selected={on} onPress={() => onChange(item.id)}
              style={{ flex: 1, minHeight: 58, alignItems: 'center', justifyContent: 'center', gap: 2, paddingVertical: 6 }}>
              <Icon name={item.icon} size={22} color={color} filled={on} />
              <T v="caption" color={color} style={{ fontWeight: on ? '600' : '500' }}>{tr(item.zh, item.en)}</T>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function Root() {
  const c = useColors();
  const store = useStore();
  const [tab, setTab] = useState('home');
  const [stack, setStack] = useState([]);
  const dir = useRef(0);

  const nav = {
    push: (name, params) => { dir.current = 1; setStack(s => [...s, { name, params, key: `${name}-${Date.now()}` }]); },
    replace: (name, params) => { dir.current = 1; setStack(s => [...s.slice(0, -1), { name, params, key: `${name}-${Date.now()}` }]); },
    back: () => { dir.current = -1; setStack(s => s.slice(0, -1)); },
    tab: id => { dir.current = 0; setStack([]); setTab(id); },
  };

  const needsAuth = store.authOpen || (!store.user && !store.skippedAuth);
  useEffect(() => { if (store.user && store.authOpen) store.setAuthOpen(false); }, [store.user?.id]);

  useEffect(() => {
    const sub = BackHandler.addEventListener?.('hardwareBackPress', () => {
      if (store.authOpen) { store.setAuthOpen(false); return true; }
      if (stack.length) { nav.back(); return true; }
      if (tab !== 'home') { nav.tab('home'); return true; }
      return false;
    });
    return () => sub?.remove?.();
  }, [stack.length, tab, store.authOpen]);

  if (!store.ready) return <View style={{ flex: 1, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center' }}><Logo size={88} /></View>;
  if (needsAuth) return <AuthScreen />;

  const top = stack[stack.length - 1];
  const content = top ? (
    top.name === 'game' ? <GameScreen gameId={top.params.id} nav={nav} />
      : top.name === 'list' ? <GameListScreen type={top.params.type} nav={nav} />
        : <ChatRoomScreen room={top.params.room} nav={nav} />
  ) : tab === 'home' ? <HomeScreen nav={nav} />
    : tab === 'favorites' ? <FavoritesScreen nav={nav} />
      : tab === 'chat' ? <ChatListScreen nav={nav} />
        : <ProfileScreen />;

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, overflow: 'hidden' }}>
      <ScreenEnter key={top ? top.key : `tab-${tab}`} dir={dir.current}>{content}</ScreenEnter>
      {!top && <TabBar tab={tab} onChange={nav.tab} />}
      <ChatToast activeRoom={top?.name === 'room' ? top.params.room : null} muted={top?.name === 'game'} onOpen={room => nav.push('room', { room })} />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <StatusBar style="auto" />
        <Root />
      </StoreProvider>
    </SafeAreaProvider>
  );
}
