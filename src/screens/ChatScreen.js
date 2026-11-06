import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Badge, Banner, Button, EmptyState, Field, Group, IconButton, NavBar, Page, Row, T } from '../components/ui';
import { ROOMS } from '../data/rooms';
import { api, chatSocket } from '../lib/api';
import { useStore } from '../state/store';
import { useColors } from '../theme/tokens';

export function ChatListScreen({ nav }) {
  const insets = useSafeAreaInsets();
  const { tr } = useStore();
  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <Page>
        <T v="largeTitle" accessibilityRole="header" style={{ marginTop: 8, marginBottom: 16 }}>{tr('聊天室', 'Chat')}</T>
        <Group>
          {ROOMS.map((r, i) => (
            <Row key={r.id} last={i === ROOMS.length - 1} label={tr(r.zh, r.en)} title={tr(r.zh, r.en)}
              leading={<Badge icon={r.icon} />} onPress={() => nav.push('room', { room: r.id })} />
          ))}
        </Group>
      </Page>
    </View>
  );
}

const unavailable = (msg, tr) => tr(`聊天室連線失敗：${msg}`, `Chat connection failed: ${msg}`);

export default function ChatRoomScreen({ room: roomId, nav }) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { tr, user, setAuthOpen } = useStore();
  const room = ROOMS.find(r => r.id === roomId);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const scroll = useRef(null);

  const add = m => setMessages(old => (old.some(x => x.id === m.id) ? old : [...old, m]));

  useEffect(() => {
    let alive = true;
    let socket = null;
    let retry = null;
    const load = () => api(`/rooms/${roomId}/messages`).then(({ messages: rows }) => {
      if (!alive) return;
      setError(null);
      setMessages(old => { const seen = new Set(rows.map(m => m.id)); return [...rows, ...old.filter(m => !seen.has(m.id))]; });
    }).catch(e => { if (alive) setError(e.message); }).finally(() => { if (alive) setLoading(false); });
    // A reconnect reloads history, so anything sent while the socket was down still appears.
    const connect = reload => {
      socket = chatSocket(roomId);
      if (!socket) return;
      socket.onopen = () => { if (reload) load(); };
      socket.onmessage = e => add(JSON.parse(e.data));
      socket.onclose = () => { if (alive) retry = setTimeout(() => connect(true), 3000); };
    };
    load();
    connect(false);
    return () => { alive = false; clearTimeout(retry); socket?.close(); };
  }, [roomId]);

  async function send() {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      const { message } = await api(`/rooms/${roomId}/messages`, { method: 'POST', body: { body } });
      setError(null); setDraft(''); add(message);
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <NavBar title={tr('聊天室', 'Chat')} backLabel={tr('返回', 'Back')} onBack={nav.back} />
      <Page bottom={12} scrollRef={scroll} onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: false })}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 8 }}>
          <Badge icon={room.icon} />
          <T v="headline" accessibilityRole="header" style={{ flex: 1 }}>{tr(room.zh, room.en)}</T>
        </View>
        {error && <Banner tone="error" text={unavailable(error, tr)} />}
        {loading && <ActivityIndicator color={c.accent} style={{ marginTop: 24 }} />}
        {!loading && !error && !messages.length && <EmptyState icon="chat" title={tr('還沒有人說話', 'No Messages Yet')} body={tr('當第一個開口的人吧！', 'Be the first to say something!')} />}
        {messages.map(m => {
          const mine = user && m.user_id === user.id;
          return (
            <View key={m.id} style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '82%', marginTop: 10 }}>
              {!mine && <T v="caption" color={c.secondary} style={{ marginBottom: 3, marginLeft: 4 }}>{m.author}</T>}
              <View style={{ backgroundColor: mine ? c.accent : c.surface, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 9, borderWidth: mine ? 0 : 1, borderColor: c.edge }}>
                <T v="body" color={mine ? c.onAccent : c.label}>{m.body}</T>
              </View>
            </View>
          );
        })}
      </Page>
      <View style={{ paddingHorizontal: 12, paddingTop: 8, paddingBottom: 8 + insets.bottom, backgroundColor: c.surface, borderTopWidth: 1, borderTopColor: c.separator }}>
        {user ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, width: '100%', maxWidth: 640, alignSelf: 'center' }}>
            <Field accessibilityLabel={tr('訊息', 'Message')} style={{ flex: 1, paddingHorizontal: 12 }} value={draft} onChangeText={setDraft} placeholder={tr('說點什麼…', 'Say something…')} maxLength={500} returnKeyType="send" onSubmitEditing={send} />
            <IconButton icon="send" label={tr('送出', 'Send')} onPress={send} color={draft.trim() ? c.accent : c.placeholder} />
          </View>
        ) : (
          <Button kind="secondary" icon="logIn" title={tr('登入後加入聊天', 'Log In to Chat')} onPress={() => setAuthOpen(true)} />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
