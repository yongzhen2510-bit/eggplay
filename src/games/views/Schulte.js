import React, { useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { shuffle } from '../catalog';
import { Cell, Grid, TimerBar, useBoardSize, useCountdown } from './shared';

const LIMIT = 40;
export default function Schulte({ tr, onFinish }) {
  const size = useBoardSize();
  const nums = useMemo(() => shuffle([...Array(16).keys()].map(n => n + 1)), []);
  const [next, setNext] = useState(1);
  const reached = useRef(1);
  const left = useCountdown(LIMIT, () => onFinish({ won: false, title: tr(`追到 ${reached.current - 1}`, `Reached ${reached.current - 1}`), detail: tr('時間到，再衝一次！', "Time's up. Go again!") }));
  const tap = n => {
    if (n !== next) return;
    reached.current = n + 1; setNext(n + 1);
    if (n === 16) onFinish({ won: true, score: LIMIT - left, lower: true, title: tr(`${LIMIT - left} 秒完成`, `Done in ${LIMIT - left}s`), detail: tr('1 到 16 全部點完。', 'All the way from 1 to 16.') });
  };
  return (
    <View>
      <TimerBar left={left} total={LIMIT} score={next > 16 ? 16 : next} scoreLabel={tr('下一個', 'Next')} />
      <Grid n={4} size={size} render={i => <Cell text={nums[i]} disabled={nums[i] < next} muted={nums[i] < next} onPress={() => tap(nums[i])} />} />
    </View>
  );
}
