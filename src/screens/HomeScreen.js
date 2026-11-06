import React, { useState } from 'react';
import { Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../components/icons';
import InstallCard from '../components/InstallCard';
import Logo from '../components/Logo';
import PickerSheet from '../components/PickerSheet';
import { Badge, Button, Group, Page, Row, Section, T, Tile } from '../components/ui';
import { ROOMS } from '../data/rooms';
import { GAMES, gameById } from '../games/catalog';
import { useStore } from '../state/store';
import { useColors } from '../theme/tokens';

export default function HomeScreen({ nav }) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { fontScale } = useWindowDimensions();
  const { tr, played, favorites } = useStore();
  const [picking, setPicking] = useState(false);
  const fresh = GAMES.filter(g => !played[g.id]).length;
  const stacked = fontScale >= 1.4;
  const saved = favorites.map(gameById).filter(Boolean);
  const room = ROOMS[new Date().getDate() % ROOMS.length];

  const TypeTile = ({ type, icon, title, blurb }) => (
    <Tile radius={20} style={{ flex: stacked ? undefined : 1 }} label={title}
      faceStyle={{ minHeight: 148, padding: 16, alignItems: 'flex-start', justifyContent: 'space-between' }}
      onPress={() => nav.push('list', { type })}>
      <Badge icon={icon} tone={type} size={46} />
      <View style={{ marginTop: 18 }}>
        <T v="title2">{title}</T>
        <T v="footnote" color={c.secondary} style={{ marginTop: 2 }}>{blurb}</T>
      </View>
    </Tile>
  );

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <Page>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 10, marginBottom: 22 }}>
          <Logo size={56} />
          <View style={{ flex: 1 }}>
            <T v="title" accessibilityRole="header">玩擲</T>
            <T v="footnote" color={c.secondary} style={{ marginTop: 1 }}>
              {fresh ? tr(`還有 ${fresh} 款沒玩過，每局不用三分鐘`, `${fresh} games still new, each under three minutes`) : tr('全部玩過了！題目每次都不一樣', 'You played them all! Questions change every time')}
            </T>
          </View>
        </View>
        <View style={{ flexDirection: stacked ? 'column' : 'row', gap: 12 }}>
          <TypeTile type="puzzle" icon="puzzle" title={tr('益智遊戲', 'Puzzle')} blurb={tr('10 款 · 動動腦', '10 games · think')} />
          <TypeTile type="challenge" icon="trophy" title={tr('挑戰遊戲', 'Challenge')} blurb={tr('10 款 · 拚手速', '10 games · race')} />
        </View>
        <Button style={{ marginTop: 12 }} icon="dice" title={tr('不知道玩什麼？幫我選！', "Can't decide? Pick for Me!")} onPress={() => setPicking(true)} />

        <InstallCard dismissible style={{ marginTop: 14 }} />

        <Section title={tr('我的收藏', 'Saved')}>
          {saved.length ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 8 }}>
              {saved.map(g => (
                <Tile key={g.id} radius={16} label={tr(g.zh, g.en)} style={{ width: 108 }} faceStyle={{ padding: 12, minHeight: 104 }} onPress={() => nav.push('game', { id: g.id })}>
                  <Badge icon={g.icon} tone={g.type} size={40} />
                  <T v="footnote" numberOfLines={2} style={{ textAlign: 'center', marginTop: 8, fontWeight: '600' }}>{tr(g.zh, g.en)}</T>
                </Tile>
              ))}
            </ScrollView>
          ) : (
            <Pressable accessibilityRole="button" onPress={() => nav.tab('favorites')}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 64, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 18, backgroundColor: c.surface, borderWidth: 1, borderColor: c.edge }}>
              <Icon name="heart" size={22} color={c.secondary} />
              <T v="subhead" color={c.secondary} style={{ flex: 1 }}>{tr('按遊戲旁的愛心，喜歡的就不會忘記', 'Tap the heart beside a game to keep it here')}</T>
            </Pressable>
          )}
        </Section>

        <Section title={tr('聊天室', 'Chat')}>
          <Group>
            <Row last label={tr(room.zh, room.en)} title={tr(room.zh, room.en)} subtitle={tr('今日話題，進來聊聊', "Today's topic, come say hi")}
              leading={<Badge icon={room.icon} />} onPress={() => nav.push('room', { room: room.id })} />
          </Group>
        </Section>
      </Page>
      {picking && <PickerSheet onClose={() => setPicking(false)} onPlay={g => { setPicking(false); nav.push('game', { id: g.id }); }} />}
    </View>
  );
}
