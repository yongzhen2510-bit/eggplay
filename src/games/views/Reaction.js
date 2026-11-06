import React, { useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Icon } from '../../components/icons';
import { T } from '../../components/ui';
import { useColors } from '../../theme/tokens';
import { randInt } from './shared';

const ROUNDS = 3;
export default function Reaction({ tr, onFinish }) {
  const c = useColors();
  const [phase, setPhaseState] = useState('wait');
  const [times, setTimes] = useState([]);
  const [early, setEarly] = useState(false);
  // Timing must not depend on a re-render: read the live phase at the instant of the press.
  const live = useRef({ phase: 'wait', times: [], started: 0 });
  const timer = useRef(null);
  const setPhase = p => { live.current.phase = p; setPhaseState(p); };
  const arm = () => {
    clearTimeout(timer.current);
    setPhase('wait');
    timer.current = setTimeout(() => { live.current.started = Date.now(); setPhase('go'); }, 1200 + randInt(2200));
  };
  useEffect(() => { arm(); return () => clearTimeout(timer.current); }, []);
  const tap = () => {
    if (live.current.phase !== 'go') { setEarly(true); arm(); return; }
    const t = [...live.current.times, Date.now() - live.current.started];
    live.current.times = t;
    setEarly(false); setTimes(t);
    if (t.length === ROUNDS) {
      clearTimeout(timer.current);
      setPhase('done');
      const avg = Math.round(t.reduce((a, b) => a + b, 0) / ROUNDS);
      onFinish({ won: avg < 400, score: avg, lower: true, title: tr(`平均 ${avg} 毫秒`, `${avg} ms average`), detail: avg < 300 ? tr('快得不像人！', 'Superhuman!') : tr('再來一局，看能不能更快。', 'Go again and beat it.') });
    } else arm();
  };
  const go = phase === 'go';
  return (
    <View>
      <T v="subhead" color={c.secondary} style={{ marginBottom: 14 }}>{tr(`第 ${times.length + 1} / ${ROUNDS} 次`, `Try ${times.length + 1} of ${ROUNDS}`)}{times.length ? ` · ${times[times.length - 1]} ms` : ''}</T>
      <Pressable accessibilityRole="button" accessibilityLabel={go ? tr('現在按', 'Tap now') : tr('等待提示', 'Wait for it')} accessibilityLiveRegion="assertive" delayPressIn={0} onPressIn={tap}
        style={{ height: 320, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: go ? c.accent : c.surface2 }}>
        <Icon name={go ? 'flash' : 'hourglass'} size={56} color={go ? c.onAccent : c.secondary} filled={go} />
        <T v="title" color={go ? c.onAccent : c.label} style={{ marginTop: 10 }}>{go ? tr('現在按！', 'Tap Now!') : early ? tr('太早了，再等等', 'Too soon, wait') : tr('等提示…', 'Wait for it…')}</T>
      </Pressable>
    </View>
  );
}
