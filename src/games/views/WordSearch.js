import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Banner, T } from '../../components/ui';
import { useColors } from '../../theme/tokens';
import { Cell, Grid, randInt, useBoardSize } from './shared';

const N = 5;
function build(word) {
  const across = Math.random() < 0.5;
  const line = randInt(N);
  const start = randInt(N - word.length + 1);
  const path = [...word].map((_, i) => (across ? line * N + start + i : (start + i) * N + line));
  const letters = Array.from({ length: N * N }, () => String.fromCharCode(65 + randInt(26)));
  path.forEach((p, i) => { letters[p] = word[i]; });
  return { letters, path };
}

export default function WordSearch({ tr, data, onFinish }) {
  const c = useColors();
  const size = useBoardSize();
  const [round, setRound] = useState(0);
  const [got, setGot] = useState(0);
  const [miss, setMiss] = useState(false);
  const item = data.items[round];
  const { letters, path } = useMemo(() => build(item.word), [item.word]);
  const tap = i => {
    if (i !== path[got]) { setGot(0); setMiss(true); return; }
    setMiss(false);
    if (got + 1 < path.length) { setGot(got + 1); return; }
    if (round + 1 === data.items.length) { onFinish({ won: true, title: tr('全部找到了！', 'Found them all!'), detail: tr(`找到 ${data.items.length} 個單字。`, `${data.items.length} words found.`) }); return; }
    setRound(round + 1); setGot(0);
  };
  return (
    <View>
      <T v="footnote" color={c.secondary}>{tr(`第 ${round + 1} / ${data.items.length} 個`, `Word ${round + 1} of ${data.items.length}`)}</T>
      <T v="headline" style={{ marginTop: 2 }}>{tr('提示：', 'Hint: ')}{item.hint}</T>
      <T v="title2" style={{ marginTop: 6, marginBottom: 12, letterSpacing: 3 }}>{[...item.word].map((ch, i) => (i < got ? ch : '＿')).join(' ')}</T>
      <Grid n={N} size={size} gap={6} render={i => <Cell text={letters[i]} fontSize={20} selected={path.indexOf(i) >= 0 && path.indexOf(i) < got} onPress={() => tap(i)} />} />
      {miss && <Banner tone="error" text={tr('順序不對，從第一個字母重來。單字是直的或橫的。', 'Wrong letter. Start again; words run across or down.')} />}
    </View>
  );
}
