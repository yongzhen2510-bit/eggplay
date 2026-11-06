import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, View } from 'react-native';
import { Icon } from '../../components/icons';
import { spring, T, useReducedMotion } from '../../components/ui';
import { shuffle } from '../catalog';
import { useColors } from '../../theme/tokens';
import { Pad, useArrowKeys, useBoardSize } from './shared';

const N = 8;
const DIRS = { up: [-1, 0, 'n', 's'], down: [1, 0, 's', 'n'], left: [0, -1, 'w', 'e'], right: [0, 1, 'e', 'w'] };
function generate() {
  const cells = Array.from({ length: N * N }, () => ({ n: true, s: true, e: true, w: true, seen: false }));
  const stack = [0]; cells[0].seen = true;
  while (stack.length) {
    const cur = stack[stack.length - 1];
    const r = Math.floor(cur / N); const col = cur % N;
    const next = shuffle(Object.values(DIRS)).map(([dr, dc, a, b]) => ({ r: r + dr, c: col + dc, a, b })).find(o => o.r >= 0 && o.r < N && o.c >= 0 && o.c < N && !cells[o.r * N + o.c].seen);
    if (!next) { stack.pop(); continue; }
    const k = next.r * N + next.c;
    cells[cur][next.a] = false; cells[k][next.b] = false; cells[k].seen = true; stack.push(k);
  }
  return cells;
}

export default function Maze({ tr, onFinish }) {
  const c = useColors();
  const reduced = useReducedMotion();
  const size = useBoardSize(340);
  const cell = size / N;
  const cells = useMemo(generate, []);
  const [pos, setPos] = useState(0);
  const [steps, setSteps] = useState(0);
  const x = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(0)).current;
  useEffect(() => { spring(x, (pos % N) * cell, { response: 0.22, reduced }); spring(y, Math.floor(pos / N) * cell, { response: 0.22, reduced }); }, [pos, cell]);
  const done = useRef(false);
  const move = d => {
    const [dr, dc, wall] = DIRS[d];
    if (done.current || cells[pos][wall]) return;
    const np = pos + dr * N + dc;
    setPos(np); setSteps(steps + 1);
    if (np === N * N - 1) { done.current = true; setTimeout(() => onFinish({ won: true, score: steps + 1, lower: true, title: tr('走出來了！', 'You made it out!'), detail: tr(`走了 ${steps + 1} 步。`, `${steps + 1} steps.`) }), 300); }
  };
  useArrowKeys(move);
  return (
    <View>
      <T v="subhead" color={c.secondary} style={{ marginBottom: 14 }}>{tr('從左上走到右下的旗子。', 'Get from the top left to the flag.')}</T>
      <View accessibilityLabel={tr(`迷宮，已走 ${steps} 步`, `Maze, ${steps} steps taken`)} style={{ width: size, height: size, alignSelf: 'center', backgroundColor: c.surface, flexDirection: 'row', flexWrap: 'wrap' }}>
        {cells.map((w, i) => (
          <View key={i} style={{ width: cell, height: cell, borderColor: c.label, borderTopWidth: w.n ? 2 : 0, borderBottomWidth: w.s ? 2 : 0, borderLeftWidth: w.w ? 2 : 0, borderRightWidth: w.e ? 2 : 0, alignItems: 'center', justifyContent: 'center' }}>
            {i === N * N - 1 && <Icon name="flag" size={cell * 0.6} color={c.accent} strokeWidth={2} />}
          </View>
        ))}
        <Animated.View pointerEvents="none" style={{ position: 'absolute', width: cell, height: cell, alignItems: 'center', justifyContent: 'center', transform: [{ translateX: x }, { translateY: y }] }}>
          <View style={{ width: cell * 0.55, height: cell * 0.55, borderRadius: cell, backgroundColor: c.accent }} />
        </Animated.View>
      </View>
      <Pad onMove={move} tr={tr} />
    </View>
  );
}
