import React, { useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { Button, T } from '../../components/ui';
import { useColors } from '../../theme/tokens';
import { randInt, TimerBar, useCountdown } from './shared';

const LIMIT = 30;
const COLORS = [
  { zh: '紅', en: 'Red', hex: '#D8392B' }, { zh: '藍', en: 'Blue', hex: '#2F6FDE' },
  { zh: '綠', en: 'Green', hex: '#1E9E55' }, { zh: '黃', en: 'Yellow', hex: '#C98A00' },
];

export default function Stroop({ tr, onFinish }) {
  const c = useColors();
  const [round, setRound] = useState(0);
  const score = useRef(0);
  const q = useMemo(() => { const word = randInt(4); return { word, ink: (word + 1 + randInt(3)) % 4 }; }, [round]);
  const left = useCountdown(LIMIT, () => onFinish({ won: score.current >= 12, score: score.current, title: tr(`答對 ${score.current} 題`, `${score.current} correct`), detail: tr('大腦沒被騙太多次。', 'Your brain resisted the trick.') }));
  const tap = k => { score.current = Math.max(0, score.current + (k === q.ink ? 1 : -1)); setRound(round + 1); };
  return (
    <View>
      <TimerBar left={left} total={LIMIT} score={score.current} scoreLabel={tr('得分', 'Score')} />
      <T v="subhead" color={c.secondary} style={{ textAlign: 'center' }}>{tr('這個字是用什麼顏色寫的？', 'What colour is this word printed in?')}</T>
      <T style={{ fontSize: 64, lineHeight: 78, fontWeight: '800', textAlign: 'center', marginVertical: 22 }} color={COLORS[q.ink].hex}>{tr(COLORS[q.word].zh, COLORS[q.word].en)}</T>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {COLORS.map((x, k) => <Button key={k} kind="secondary" style={{ width: '48%', flexGrow: 1 }} title={tr(x.zh, x.en)} onPress={() => tap(k)} />)}
      </View>
    </View>
  );
}
