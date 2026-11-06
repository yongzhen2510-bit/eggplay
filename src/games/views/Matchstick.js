import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Banner, Button, T } from '../../components/ui';
import { shuffle } from '../catalog';
import { useColors } from '../../theme/tokens';

// Seven-segment digits as bitmasks, segments a–g = bits 0–6.
const D = [0b0111111, 0b0000110, 0b1011011, 0b1001111, 0b1100110, 0b1101101, 0b1111101, 0b0000111, 0b1111111, 0b1101111];
const ALL_TRUE = [];
for (let a = 0; a < 10; a++) for (let b = 0; b < 10; b++) for (const op of ['+', '-']) {
  const r = op === '+' ? a + b : a - b;
  if (r >= 0 && r < 10) ALL_TRUE.push({ a, op, b, r });
}
const isTrue = e => (e.op === '+' ? e.a + e.b : e.a - e.b) === e.r;
const str = e => `${e.a} ${e.op} ${e.b} = ${e.r}`;

// Every equation reachable by moving exactly one stick between (or within) digits.
function neighbours(e) {
  const v = [e.a, e.b, e.r];
  const out = [];
  for (let i = 0; i < 3; i++) for (let s = 0; s < 7; s++) {
    if (!(D[v[i]] >> s & 1)) continue;
    for (let j = 0; j < 3; j++) for (let t = 0; t < 7; t++) {
      const from = D[v[i]] & ~(1 << s);
      const base = i === j ? from : D[v[j]];
      if (base >> t & 1 || (i === j && t === s)) continue;
      const to = base | (1 << t);
      const nv = [...v];
      if (i === j) { const d = D.indexOf(to); if (d < 0) continue; nv[i] = d; } else {
        const di = D.indexOf(from); const dj = D.indexOf(to);
        if (di < 0 || dj < 0) continue;
        nv[i] = di; nv[j] = dj;
      }
      out.push({ a: nv[0], op: e.op, b: nv[1], r: nv[2] });
    }
  }
  return out;
}

export function makePuzzle() {
  for (const answer of shuffle(ALL_TRUE)) {
    const wrong = shuffle(neighbours(answer)).find(x => !isTrue(x));
    if (!wrong) continue;
    const reach = new Set(neighbours(wrong).map(str));
    const others = shuffle(ALL_TRUE).filter(x => !reach.has(str(x))).slice(0, 3);
    if (others.length < 3) continue;
    return { wrong, answer, options: shuffle([answer, ...others]) };
  }
  throw new Error('no matchstick puzzle');
}

const POS = [[1, 0, 1], [2, 1, 0], [2, 3, 0], [1, 4, 1], [0, 3, 0], [0, 1, 0], [1, 2, 1]]; // col, row-ish, horizontal
function Digit({ d, color }) {
  const U = 12; const L = 3 * U; const W = 6;
  return (
    <View style={{ width: L + W, height: 2 * L + W }}>
      {POS.map(([col, row, h], s) => (D[d] >> s & 1 ? (
        <View key={s} style={{ position: 'absolute', backgroundColor: color, borderRadius: 3,
          left: col === 1 ? W / 2 + 1 : col === 2 ? L : 0,
          top: h ? (row / 2) * L : row === 1 ? W / 2 + 1 : L + W / 2 + 1,
          width: h ? L - 2 : W, height: h ? W : L - 2 }} />
      ) : null))}
    </View>
  );
}

export default function Matchstick({ tr, onFinish }) {
  const c = useColors();
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [pick, setPick] = useState(null);
  const [fb, setFb] = useState(null);
  const p = useMemo(makePuzzle, [round]);
  const total = 3;
  const check = () => {
    const right = str(pick) === str(p.answer);
    if (fb) {
      const s = score;
      if (round + 1 === total) onFinish({ won: s >= 2, score: s, title: tr(`答對 ${s} / ${total} 題`, `${s} of ${total} right`), detail: s >= 2 ? tr('火柴棒難不倒你。', 'Matchsticks are no match for you.') : tr('再來一局，題目會換。', 'Go again for new puzzles.') });
      else { setRound(round + 1); setPick(null); setFb(null); }
      return;
    }
    if (right) setScore(score + 1);
    setFb(right ? 'right' : 'wrong');
  };
  return (
    <View>
      <T v="subhead" color={c.secondary}>{tr(`第 ${round + 1} / ${total} 題：只移動一根火柴，算式會變成哪一個？`, `Puzzle ${round + 1} of ${total}: move one stick. Which equation can it become?`)}</T>
      <View accessibilityLabel={str(p.wrong)} accessible style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginVertical: 22 }}>
        <Digit d={p.wrong.a} color={c.challenge} /><T v="title">{p.wrong.op}</T><Digit d={p.wrong.b} color={c.challenge} /><T v="title">=</T><Digit d={p.wrong.r} color={c.challenge} />
      </View>
      <View style={{ gap: 8 }}>
        {p.options.map(o => (
          <Button key={str(o)} kind={pick && str(pick) === str(o) ? 'primary' : 'secondary'} title={str(o)} disabled={!!fb} onPress={() => setPick(o)} />
        ))}
      </View>
      {fb && <Banner tone={fb === 'right' ? 'success' : 'error'} text={fb === 'right' ? tr('答對了！', 'Correct!') : tr(`答案是 ${str(p.answer)}`, `It was ${str(p.answer)}`)} />}
      <Button style={{ marginTop: 16 }} disabled={!pick} title={fb ? tr('下一題', 'Next') : tr('確認答案', 'Check')} onPress={check} />
    </View>
  );
}
