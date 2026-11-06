import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Banner, Button, T } from '../../components/ui';
import { shuffle } from '../catalog';
import { useColors } from '../../theme/tokens';
import { Cell, Grid, useBoardSize } from './shared';

function make() {
  const m = shuffle([1, 2, 3, 4]);
  const base = [[0, 1, 2, 3], [2, 3, 0, 1], [1, 0, 3, 2], [3, 2, 1, 0]].map(r => r.map(i => m[i]));
  const rows = shuffle(base).flat();
  const hide = new Set(shuffle([...Array(16).keys()]).slice(0, 8));
  return rows.map((v, i) => (hide.has(i) ? 0 : v));
}
const valid = b => [0, 1, 2, 3].every(k => new Set(b.slice(k * 4, k * 4 + 4)).size === 4 && new Set([0, 1, 2, 3].map(r => b[r * 4 + k])).size === 4);

export default function Sudoku({ tr, onFinish }) {
  const c = useColors();
  const size = useBoardSize(320);
  const clues = useMemo(make, []);
  const [board, setBoard] = useState(clues);
  const [sel, setSel] = useState(null);
  const [note, setNote] = useState(null);
  const put = n => { if (sel === null) return setNote(tr('先點一個空格。', 'Tap an empty cell first.')); const b = [...board]; b[sel] = n; setBoard(b); setNote(null); };
  const check = () => {
    if (board.includes(0)) return setNote(tr('還有空格沒填。', 'Some cells are still empty.'));
    if (valid(board)) return onFinish({ won: true, title: tr('解開了！', 'Solved!'), detail: tr('每列每行都沒有重複。', 'No repeats anywhere.') });
    setNote(tr('有數字重複了，再看看。', 'Something repeats. Take another look.'));
  };
  return (
    <View>
      <T v="subhead" color={c.secondary} style={{ marginBottom: 14 }}>{tr('填入 1～4，每一列和每一行都不能重複。', 'Fill in 1–4. No repeats in any row or column.')}</T>
      <Grid n={4} size={size} render={i => <Cell text={board[i] || ''} muted={!!clues[i]} disabled={!!clues[i]} selected={sel === i} label={board[i] ? `${board[i]}` : tr('空格', 'Empty')} onPress={() => setSel(i)} />} />
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 18, width: size, alignSelf: 'center' }}>
        {[1, 2, 3, 4].map(n => <View key={n} style={{ flex: 1, height: 58 }}><Cell text={n} label={tr(`填入 ${n}`, `Enter ${n}`)} onPress={() => put(n)} /></View>)}
      </View>
      {note && <Banner tone="info" text={note} />}
      <Button style={{ marginTop: 16 }} title={tr('檢查答案', 'Check Answer')} onPress={check} />
    </View>
  );
}
