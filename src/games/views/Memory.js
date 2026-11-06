import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { T } from '../../components/ui';
import { shuffle } from '../catalog';
import { useColors } from '../../theme/tokens';
import { Cell, Grid, useBoardSize } from './shared';

export default function Memory({ tr, data, onFinish }) {
  const c = useColors();
  const size = useBoardSize();
  const cards = useMemo(() => shuffle([...data.items, ...data.items]), [data]);
  const [open, setOpen] = useState([]);
  const [done, setDone] = useState([]);
  const [moves, setMoves] = useState(0);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  const tap = i => {
    if (done.includes(i) || open.includes(i)) return;
    clearTimeout(timer.current);
    if (open.length !== 1) { setOpen([i]); return; }
    const pair = [open[0], i];
    setOpen(pair); setMoves(moves + 1);
    if (cards[pair[0]].icon === cards[pair[1]].icon) {
      const nd = [...done, ...pair];
      setDone(nd); setOpen([]);
      if (nd.length === cards.length) onFinish({ won: true, score: moves + 1, lower: true, title: tr('全部配對成功！', 'All matched!'), detail: tr(`翻了 ${moves + 1} 次。`, `${moves + 1} turns.`) });
    } else {
      timer.current = setTimeout(() => setOpen([]), 800);
    }
  };
  return (
    <View>
      <T v="subhead" color={c.secondary} style={{ marginBottom: 14 }}>{tr(`翻牌找出所有配對。已翻 ${moves} 次`, `Find every pair. ${moves} turns`)}</T>
      <Grid n={4} count={cards.length} size={size} render={i => {
        const up = open.includes(i) || done.includes(i);
        return <Cell icon={up ? cards[i].icon : undefined} text={up ? undefined : '?'} muted={!up} disabled={done.includes(i)} label={up ? tr(cards[i].zh, cards[i].en) : tr(`第 ${i + 1} 張牌`, `Card ${i + 1}`)} onPress={() => tap(i)} />;
      }} />
    </View>
  );
}
