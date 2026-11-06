import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Banner, T } from '../../components/ui';
import { useColors } from '../../theme/tokens';
import { Cell, Grid, randInt, useBoardSize } from './shared';

export default function FindDifferent({ tr, data, onFinish }) {
  const c = useColors();
  const size = useBoardSize();
  const [round, setRound] = useState(0);
  const [misses, setMisses] = useState(0);
  const [wrong, setWrong] = useState(false);
  const odd = useMemo(() => randInt(16), [round]);
  const [base, other] = data.items[round];
  const tap = i => {
    if (i !== odd) { setMisses(misses + 1); setWrong(true); return; }
    setWrong(false);
    if (round + 1 === data.items.length) onFinish({ won: true, score: misses, lower: true, title: tr('眼力真好！', 'Sharp eyes!'), detail: misses ? tr(`點錯 ${misses} 次。`, `${misses} wrong taps.`) : tr('一次都沒點錯。', 'Not a single wrong tap.') });
    else setRound(round + 1);
  };
  return (
    <View>
      <T v="subhead" color={c.secondary} style={{ marginBottom: 14 }}>{tr(`第 ${round + 1} / ${data.items.length} 關：點出不一樣的那個`, `Round ${round + 1} of ${data.items.length}: tap the odd one`)}</T>
      <Grid n={4} size={size} render={i => <Cell icon={i === odd ? other : base} label={tr(`第 ${i + 1} 格`, `Cell ${i + 1}`)} onPress={() => tap(i)} />} />
      {wrong && <Banner tone="error" text={tr('不是這個，再找找。', 'Not that one. Keep looking.')} />}
    </View>
  );
}
