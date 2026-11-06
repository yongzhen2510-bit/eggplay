import React, { useMemo, useRef, useState } from 'react';
import { PanResponder, View } from 'react-native';
import { T } from '../../components/ui';
import { useColors } from '../../theme/tokens';
import { Pad, randInt, TimerBar, useArrowKeys, useBoardSize, useCountdown } from './shared';

const LIMIT = 180;
const spawn = b => { const e = b.map((v, i) => (v ? -1 : i)).filter(i => i >= 0); if (!e.length) return b; const n = [...b]; n[e[randInt(e.length)]] = Math.random() < 0.9 ? 2 : 4; return n; };
const slide = line => {
  const v = line.filter(Boolean); const out = []; let gain = 0;
  for (let i = 0; i < v.length; i++) { if (v[i] === v[i + 1]) { out.push(v[i] * 2); gain += v[i] * 2; i++; } else out.push(v[i]); }
  while (out.length < 4) out.push(0);
  return { out, gain };
};
const LINES = {
  left: [0, 1, 2, 3].map(r => [0, 1, 2, 3].map(c => r * 4 + c)),
  right: [0, 1, 2, 3].map(r => [3, 2, 1, 0].map(c => r * 4 + c)),
  up: [0, 1, 2, 3].map(c => [0, 1, 2, 3].map(r => r * 4 + c)),
  down: [0, 1, 2, 3].map(c => [3, 2, 1, 0].map(r => r * 4 + c)),
};
function apply(b, d) {
  const n = [...b]; let gain = 0;
  LINES[d].forEach(idx => { const s = slide(idx.map(i => b[i])); gain += s.gain; idx.forEach((i, k) => { n[i] = s.out[k]; }); });
  return { board: n, gain, moved: n.some((v, i) => v !== b[i]) };
}
const stuck = b => Object.keys(LINES).every(d => !apply(b, d).moved);

export default function G2048({ tr, onFinish }) {
  const c = useColors();
  const size = useBoardSize(340);
  const [board, setBoard] = useState(() => spawn(spawn(Array(16).fill(0))));
  const [score, setScore] = useState(0);
  const finished = useRef(false);
  const live = useRef({}); live.current = { board, score };
  const end = why => {
    if (finished.current) return; finished.current = true;
    const { board: b, score: s } = live.current; const best = Math.max(...b);
    onFinish({ won: best >= 128, score: s, title: tr(`${s} 分`, `${s} points`), detail: `${why} ${tr('最大方塊', 'Top tile')} ${best}` });
  };
  const left = useCountdown(LIMIT, () => end(tr('時間到。', "Time's up.")));
  const move = d => {
    if (finished.current) return;
    const { board: b, score: s } = live.current;
    const r = apply(b, d);
    if (!r.moved) return;
    const n = spawn(r.board);
    live.current = { board: n, score: s + r.gain };
    setBoard(n); setScore(s + r.gain);
    if (stuck(n)) end(tr('沒有步可走了。', 'No moves left.'));
  };
  const mv = useRef(move); mv.current = move;
  useArrowKeys(move);
  const pan = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponderCapture: (_, g) => Math.abs(g.dx) > 10 || Math.abs(g.dy) > 10,
    onPanResponderRelease: (_, g) => { if (Math.max(Math.abs(g.dx), Math.abs(g.dy)) >= 20) mv.current(Math.abs(g.dx) > Math.abs(g.dy) ? (g.dx > 0 ? 'right' : 'left') : (g.dy > 0 ? 'down' : 'up')); },
  }), []);
  const gap = 8; const cell = (size - gap * 5) / 4;
  return (
    <View>
      <TimerBar left={left} total={LIMIT} score={score} scoreLabel={tr('得分', 'Score')} />
      <View {...pan.panHandlers} accessibilityLabel={tr(`棋盤，得分 ${score}`, `Board, score ${score}`)} style={{ width: size, alignSelf: 'center', padding: gap, gap, flexDirection: 'row', flexWrap: 'wrap', backgroundColor: c.surface2, borderRadius: 14 }}>
        {board.map((v, i) => {
          const hot = v >= 64; const warm = v >= 8;
          return (
            <View key={i} style={{ width: cell, height: cell, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: !v ? c.bg : hot ? c.accent : warm ? c.accentTint : c.surface }}>
              {!!v && <T style={{ fontSize: v >= 1000 ? 20 : 26, lineHeight: 32, fontWeight: '700' }} color={hot ? c.onAccent : warm ? c.accent : c.label}>{v}</T>}
            </View>
          );
        })}
      </View>
      <Pad onMove={move} tr={tr} />
    </View>
  );
}
