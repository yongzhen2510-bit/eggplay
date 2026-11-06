import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { Banner, T } from '../../components/ui';
import { useColors } from '../../theme/tokens';
import { Cell, Grid, randInt, useBoardSize } from './shared';

export default function Simon({ tr, onFinish }) {
  const c = useColors();
  const size = useBoardSize(300);
  const [seq, setSeq] = useState(() => [randInt(4)]);
  const [lit, setLit] = useState(null);
  const [playing, setPlaying] = useState(true);
  const [pos, setPos] = useState(0);
  const timers = useRef([]);
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));
  useEffect(() => {
    setPlaying(true); setPos(0);
    seq.forEach((v, i) => { later(() => setLit(v), 500 + i * 650); later(() => setLit(null), 500 + i * 650 + 420); });
    later(() => setPlaying(false), 500 + seq.length * 650);
    return () => { timers.current.forEach(clearTimeout); timers.current = []; };
  }, [seq]);
  const tap = v => {
    if (playing) return;
    if (v !== seq[pos]) {
      const best = seq.length - 1;
      onFinish({ won: best >= 5, score: best, title: tr(`記住了 ${best} 步`, `${best} steps remembered`), detail: tr('再挑戰一次，看能記多長。', 'Try again and go longer.') });
      return;
    }
    setLit(v); later(() => setLit(null), 160);
    if (pos + 1 === seq.length) setSeq([...seq, randInt(4)]); else setPos(pos + 1);
  };
  return (
    <View>
      <T v="subhead" color={c.secondary} style={{ marginBottom: 14 }}>{tr(`長度 ${seq.length}`, `Length ${seq.length}`)}</T>
      <Grid n={2} size={size} gap={12} render={i => <Cell text={i + 1} fontSize={36} selected={lit === i} onPress={() => tap(i)} />} />
      <Banner tone="info" text={playing ? tr('看好順序…', 'Watch the order…') : tr('換你按！', 'Your turn!')} />
    </View>
  );
}
