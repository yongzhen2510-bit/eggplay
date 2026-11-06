import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { Icon } from '../../components/icons';
import { Banner, Button, T } from '../../components/ui';
import { useColors } from '../../theme/tokens';
import { TimerBar, useCountdown } from './shared';

export default function Quiz({ game, tr, data, onFinish }) {
  const c = useColors();
  const items = data.items;
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState(null);
  const scoreRef = useRef(0);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  const finish = () => {
    clearTimeout(timer.current);
    const s = scoreRef.current; const won = s >= Math.ceil(items.length * 0.6);
    onFinish({ won, score: s, title: tr(`答對 ${s} / ${items.length} 題`, `${s} of ${items.length} right`), detail: won ? tr('反應很快！', 'Nicely done!') : tr('再來一局，題目會換新的。', 'Go again for fresh questions.') });
  };
  const left = useCountdown(game.limit || 0, finish, !!game.limit);
  const q = items[i];
  const choose = k => {
    if (picked !== null) return;
    const right = k === q.answer;
    if (right) { scoreRef.current += 1; setScore(scoreRef.current); }
    setPicked(k);
    timer.current = setTimeout(() => {
      if (i + 1 === items.length) finish();
      else { setI(i + 1); setPicked(null); }
    }, right ? 500 : 1100);
  };
  return (
    <View>
      {game.limit ? <TimerBar left={left} total={game.limit} score={score} scoreLabel={tr('得分', 'Score')} /> : null}
      <T v="footnote" color={c.secondary}>{tr(`第 ${i + 1} / ${items.length} 題`, `Question ${i + 1} of ${items.length}`)}</T>
      <T v="title2" accessibilityRole="header" style={{ marginTop: 6, marginBottom: 18 }}>{q.prompt}</T>
      {q.icons && (
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14, paddingVertical: 22, marginBottom: 18, borderRadius: 18, backgroundColor: c.surface, borderWidth: 1, borderColor: c.edge }}>
          {q.icons.map((n, k) => (
            <React.Fragment key={k}>
              {k > 0 && <T v="title2" color={c.secondary}>+</T>}
              <Icon name={n} size={56} color={c.accent} strokeWidth={1.5} />
            </React.Fragment>
          ))}
        </View>
      )}
      <View style={{ gap: 10 }}>
        {q.options.map((o, k) => {
          const show = picked !== null && (k === q.answer || k === picked);
          return (
            <Button key={`${i}-${k}`} kind="secondary" disabled={picked !== null && !show} onPress={() => choose(k)}
              icon={show ? (k === q.answer ? 'checkCircle' : 'closeCircle') : undefined} title={o} />
          );
        })}
      </View>
      {picked !== null && <Banner tone={picked === q.answer ? 'success' : 'error'} text={picked === q.answer ? tr('答對了！', 'Correct!') : tr(`答案是「${q.options[q.answer]}」`, `It was "${q.options[q.answer]}"`)} />}
    </View>
  );
}
