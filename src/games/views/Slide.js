import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, View } from 'react-native';
import { spring, T, Tile, useReducedMotion } from '../../components/ui';
import { useColors } from '../../theme/tokens';
import { randInt, useBoardSize } from './shared';

const SOLVED = '1,2,3,4,5,6,7,8,0';
const adjacent = (a, b) => (Math.abs(a - b) === 3) || (Math.floor(a / 3) === Math.floor(b / 3) && Math.abs(a - b) === 1);
function scramble() {
  let t = [1, 2, 3, 4, 5, 6, 7, 8, 0];
  do {
    for (let k = 0; k < 40; k++) {
      const e = t.indexOf(0);
      const opts = t.map((_, i) => i).filter(i => adjacent(i, e));
      const i = opts[randInt(opts.length)];
      [t[i], t[e]] = [t[e], t[i]];
    }
  } while (t.join(',') === SOLVED);
  return t;
}

function Piece({ n, x, y, cell, onPress }) {
  const reduced = useReducedMotion();
  const ax = useRef(new Animated.Value(x)).current;
  const ay = useRef(new Animated.Value(y)).current;
  useEffect(() => { spring(ax, x, { reduced }); spring(ay, y, { reduced }); }, [x, y]);
  return (
    <Animated.View style={{ position: 'absolute', width: cell, height: cell, transform: [{ translateX: ax }, { translateY: ay }] }}>
      <Tile radius={14} label={`${n}`} style={{ flex: 1 }} onPress={onPress}>
        <T style={{ fontSize: 28, lineHeight: 34, fontWeight: '700' }}>{n}</T>
      </Tile>
    </Animated.View>
  );
}

export default function Slide({ tr, onFinish }) {
  const c = useColors();
  const size = useBoardSize(320);
  const gap = 8;
  const cell = (size - gap * 2) / 3;
  const start = useMemo(scramble, []);
  const [tiles, setTiles] = useState(start);
  const [moves, setMoves] = useState(0);
  const move = n => {
    const i = tiles.indexOf(n); const e = tiles.indexOf(0);
    if (!adjacent(i, e)) return;
    const next = [...tiles]; [next[i], next[e]] = [next[e], next[i]];
    setTiles(next); setMoves(moves + 1);
    if (next.join(',') === SOLVED) setTimeout(() => onFinish({ won: true, score: moves + 1, lower: true, title: tr('拼好了！', 'Solved!'), detail: tr(`用了 ${moves + 1} 步。`, `${moves + 1} moves.`) }), 350);
  };
  return (
    <View>
      <T v="subhead" color={c.secondary} style={{ marginBottom: 14 }}>{tr(`把數字排成 1～8，空格在右下。已走 ${moves} 步`, `Arrange 1–8 with the gap last. ${moves} moves`)}</T>
      <View style={{ width: size, height: size, alignSelf: 'center', backgroundColor: c.surface2, borderRadius: 16 }}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map(n => {
          const i = tiles.indexOf(n);
          return <Piece key={n} n={n} cell={cell} x={(i % 3) * (cell + gap)} y={Math.floor(i / 3) * (cell + gap)} onPress={() => move(n)} />;
        })}
      </View>
    </View>
  );
}
