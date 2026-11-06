import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Badge, IconButton, spring, T, useReducedMotion } from './ui';
import { ROOMS } from '../data/rooms';
import { chatSocket } from '../lib/api';
import { useStore } from '../state/store';
import { useColors } from '../theme/tokens';

const SHOW_MS = 5000;
const EXIT_MS = 250;
const RECONNECT_MS = 3000;

// Listens to every room and shows new messages from other people. `muted` covers the moments a popup
// would get in the way: mid-game, where it could cover a timed board, and in the room being read.
export default function ChatToast({ activeRoom, muted, onOpen }) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const { tr, user } = useStore();
  const [message, setMessage] = useState(null);
  const a = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef(null);
  const clearTimer = useRef(null);
  const latest = useRef({});
  latest.current = { activeRoom, muted, userId: user?.id };

  const hide = () => {
    clearTimeout(hideTimer.current);
    spring(a, 0, { response: 0.3, reduced });
    clearTimer.current = setTimeout(() => setMessage(null), EXIT_MS);
  };

  const show = m => {
    clearTimeout(hideTimer.current);
    clearTimeout(clearTimer.current);
    setMessage(m);
    spring(a, 1, { response: 0.36, ratio: 0.85, reduced });
    hideTimer.current = setTimeout(hide, SHOW_MS);
  };

  useEffect(() => {
    let alive = true;
    let socket = null;
    let retry = null;
    const connect = () => {
      socket = chatSocket();
      if (!socket) return;
      socket.onmessage = e => {
        const m = JSON.parse(e.data);
        const { activeRoom: open, muted: quiet, userId } = latest.current;
        if (quiet || m.room === open || m.user_id === userId || !ROOMS.some(r => r.id === m.room)) return;
        show(m);
      };
      socket.onclose = () => { if (alive) retry = setTimeout(connect, RECONNECT_MS); };
    };
    connect();
    return () => {
      alive = false;
      clearTimeout(retry);
      clearTimeout(hideTimer.current);
      clearTimeout(clearTimer.current);
      socket?.close();
    };
  }, []);

  // Never leave a popup covering the screen the player just moved to.
  useEffect(() => { if (message && (muted || message.room === activeRoom)) hide(); }, [muted, activeRoom]);

  if (!message) return null;
  const room = ROOMS.find(r => r.id === message.room);
  return (
    <Animated.View pointerEvents="box-none" accessibilityLiveRegion="polite" style={{
      position: 'absolute', top: insets.top + 8, left: 12, right: 12, alignItems: 'center', opacity: a,
      transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [-24, 0] }) }],
    }}>
      <View style={{
        width: '100%', maxWidth: 616, flexDirection: 'row', alignItems: 'center', borderRadius: 18, borderWidth: 1, borderColor: c.edge, backgroundColor: c.surface,
        shadowColor: '#000', shadowOpacity: 0.16, shadowRadius: 18, shadowOffset: { width: 0, height: 6 }, elevation: 6,
      }}>
        <Pressable accessibilityRole="button" accessibilityLabel={tr(`${message.author} 傳來訊息：${message.body}。開啟聊天室`, `${message.author} says: ${message.body}. Open chat room`)}
          onPress={() => { hide(); onOpen(message.room); }}
          style={({ pressed }) => ({ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, paddingRight: 4, borderRadius: 18, opacity: pressed ? 0.6 : 1 })}>
          <Badge icon={room.icon} size={40} />
          <View style={{ flex: 1 }}>
            <T v="subhead" numberOfLines={1} style={{ fontWeight: '600' }}>{message.author}</T>
            <T v="footnote" color={c.secondary} numberOfLines={2}>{message.body}</T>
          </View>
        </Pressable>
        <IconButton icon="close" label={tr('關閉通知', 'Dismiss notification')} color={c.secondary} onPress={hide} />
      </View>
    </Animated.View>
  );
}
