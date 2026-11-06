import React, { useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { Button, T } from '../../components/ui';
import { shuffle } from '../catalog';
import { randInt, TimerBar, useCountdown } from './shared';

const LIMIT = 45;
function make() {
  const op = ['+', '-', '×'][randInt(3)];
  let a; let b; let r;
  if (op === '×') { a = 2 + randInt(8); b = 2 + randInt(8); r = a * b; }
  else if (op === '+') { a = 5 + randInt(45); b = 5 + randInt(45); r = a + b; }
  else { a = 20 + randInt(60); b = 1 + randInt(a - 1); r = a - b; }
  const opts = new Set([r]);
  while (opts.size < 4) { const d = r + (randInt(2) ? 1 : -1) * (1 + randInt(10)); if (d >= 0) opts.add(d); }
  return { text: `${a} ${op} ${b}`, r, opts: shuffle([...opts]) };
}

export default function Mental({ tr, onFinish }) {
  const [round, setRound] = useState(0);
  const score = useRef(0);
  const q = useMemo(make, [round]);
  const left = useCountdown(LIMIT, () => onFinish({ won: score.current >= 10, score: score.current, title: tr(`答對 ${score.current} 題`, `${score.current} correct`), detail: tr('45 秒心算成績。', 'Your 45-second score.') }));
  const tap = v => { if (v === q.r) score.current += 1; else score.current = Math.max(0, score.current - 1); setRound(round + 1); };
  return (
    <View>
      <TimerBar left={left} total={LIMIT} score={score.current} scoreLabel={tr('得分', 'Score')} />
      <T v="largeTitle" accessibilityRole="header" style={{ textAlign: 'center', marginVertical: 26 }}>{q.text}</T>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {q.opts.map(v => <Button key={v} kind="secondary" style={{ width: '48%', flexGrow: 1 }} title={String(v)} onPress={() => tap(v)} />)}
      </View>
    </View>
  );
}
