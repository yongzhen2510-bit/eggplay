import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GameRow from '../components/GameRow';
import { Banner, Button, EmptyState, Group, Page, T } from '../components/ui';
import { gameById } from '../games/catalog';
import { useStore } from '../state/store';

export default function FavoritesScreen({ nav }) {
  const insets = useSafeAreaInsets();
  const { tr, favorites, user, setAuthOpen, dbError } = useStore();
  const games = favorites.map(gameById).filter(Boolean);
  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <Page>
        <T v="largeTitle" accessibilityRole="header" style={{ marginTop: 8, marginBottom: 16 }}>{tr('我的收藏', 'Saved')}</T>
        {user && dbError && <Banner tone="error" text={tr(`收藏無法同步：${dbError}`, `Could not sync saves: ${dbError}`)} />}
        {games.length ? (
          <>
            <Button icon="shuffle" kind="secondary" style={{ marginBottom: 14 }} title={tr('從收藏隨便挑一款', 'Random from Saved')} onPress={() => nav.push('game', { id: games[Math.floor(Math.random() * games.length)].id })} />
            <Group>{games.map((g, i) => <GameRow key={g.id} game={g} nav={nav} last={i === games.length - 1} />)}</Group>
          </>
        ) : (
          <EmptyState icon="heart" title={tr('還沒有收藏', 'Nothing Saved Yet')} body={tr('玩到喜歡的遊戲，按愛心就會出現在這裡。', 'Tap the heart on a game you like and it lands here.')}>
            <Button icon="gamepad" title={tr('去找遊戲', 'Find a Game')} onPress={() => nav.tab('home')} />
          </EmptyState>
        )}
        {!user && <Button style={{ marginTop: 14 }} kind="secondary" icon="logIn" title={tr('登入後同步收藏', 'Log In to Sync Saves')} onPress={() => setAuthOpen(true)} />}
      </Page>
    </View>
  );
}
