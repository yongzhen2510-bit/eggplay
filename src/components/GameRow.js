import React from 'react';
import { View } from 'react-native';
import { Badge, Chip, IconButton, Row } from './ui';
import { useStore } from '../state/store';
import { useColors } from '../theme/tokens';

export const formatSecs = (s, tr) => (s < 60 ? tr(`${s} 秒`, `${s}s`) : tr(`${Math.round(s / 60)} 分`, `${Math.round(s / 60)} min`));

export default function GameRow({ game, nav, last }) {
  const c = useColors();
  const { tr, played, favorites, toggleFavorite } = useStore();
  const saved = favorites.includes(game.id);
  const name = tr(game.zh, game.en);
  return (
    <Row last={last} label={name} title={name} subtitle={tr(game.dz, game.de)} onPress={() => nav.push('game', { id: game.id })}
      leading={<Badge icon={game.icon} tone={game.type} />}
      trailing={
        <View style={{ alignItems: 'flex-end', gap: 3 }}>
          {!played[game.id] && <Chip tone="accent" text={tr('沒玩過', 'New')} />}
          <Chip text={formatSecs(game.secs, tr)} />
        </View>
      }
      accessory={
        <IconButton icon="heart" filled={saved} color={saved ? c.danger : c.secondary}
          label={saved ? tr(`取消收藏${name}`, `Remove ${name} from saved`) : tr(`收藏${name}`, `Save ${name}`)} onPress={() => toggleFavorite(game.id)} />
      } />
  );
}
