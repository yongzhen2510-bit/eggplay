import React from 'react';
import { View } from 'react-native';
import GameRow from '../components/GameRow';
import { Button, Group, NavBar, Page } from '../components/ui';
import { GAMES } from '../games/catalog';
import { useStore } from '../state/store';

export default function GameListScreen({ type, nav }) {
  const { tr, pickFresh } = useStore();
  const games = GAMES.filter(g => g.type === type);
  return (
    <View style={{ flex: 1 }}>
      <NavBar title={type === 'puzzle' ? tr('益智遊戲', 'Puzzle') : tr('挑戰遊戲', 'Challenge')} backLabel={tr('首頁', 'Home')} onBack={nav.back} />
      <Page>
        <Button icon="dice" kind="secondary" style={{ marginBottom: 14 }} title={tr('這類隨便來一款', 'Surprise Me')} onPress={() => nav.push('game', { id: pickFresh(undefined, type).id })} />
        <Group>{games.map((g, i) => <GameRow key={g.id} game={g} nav={nav} last={i === games.length - 1} />)}</Group>
      </Page>
    </View>
  );
}
