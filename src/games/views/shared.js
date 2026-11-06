import React, { useEffect, useRef, useState } from 'react';
import { Platform, useWindowDimensions, View } from 'react-native';
import { Icon } from '../../components/icons';
import { T, Tile } from '../../components/ui';
import { useColors } from '../../theme/tokens';

export const randInt = n => Math.floor(Math.random() * n);

export function useBoardSize(max = 360) {
  const { width } = useWindowDimensions();
  return Math.min(Math.min(width, 640) - 40, max);
}

export function useCountdown(secs, onEnd, active = true) {
  const [left, setLeft] = useState(secs);
  const end = useRef(onEnd); end.current = onEnd;
  useEffect(() => {
    if (!active) return undefined;
    const t = setInterval(() => setLeft(v => v - 1), 1000);
    return () => clearInterval(t);
  }, [active]);
  useEffect(() => { if (left <= 0 && active) end.current(); }, [left, active]);
  return Math.max(0, left);
}

export function TimerBar({ left, total, score, scoreLabel }) {
  const c = useColors();
  const low = left <= 5;
  return (
    <View style={{ marginBottom: 14 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Icon name="timer" size={18} color={low ? c.danger : c.secondary} strokeWidth={2} />
          <T v="headline" color={low ? c.danger : c.label} accessibilityLabel={`${left}`}>{left}s</T>
        </View>
        {score !== undefined && <T v="headline">{scoreLabel} {score}</T>}
      </View>
      <View style={{ height: 6, borderRadius: 3, backgroundColor: c.surface2, overflow: 'hidden' }}>
        <View style={{ height: 6, width: `${(left / total) * 100}%`, borderRadius: 3, backgroundColor: low ? c.danger : c.accent }} />
      </View>
    </View>
  );
}

export function Grid({ n, size, gap = 8, count, render }) {
  const cell = (size - gap * (n - 1)) / n;
  return (
    <View style={{ width: size, alignSelf: 'center', flexDirection: 'row', flexWrap: 'wrap', gap }}>
      {Array.from({ length: count ?? n * n }, (_, i) => <View key={i} style={{ width: cell, height: cell }}>{render(i, cell)}</View>)}
    </View>
  );
}

export function Cell({ text, icon, selected, disabled, onPress, label, muted, fontSize = 24 }) {
  const c = useColors();
  return (
    <Tile radius={12} selected={selected} disabled={disabled} onPress={onPress} label={label || String(text ?? '')}
      style={{ flex: 1 }} faceStyle={muted ? { backgroundColor: c.surface2 } : null}>
      {icon ? <Icon name={icon} size={fontSize + 14} color={c.label} /> : <T style={{ fontSize, lineHeight: fontSize + 6, fontWeight: '700' }}>{text}</T>}
    </Tile>
  );
}

export function Pad({ onMove, tr }) {
  const Key = ({ icon, dir, label }) => (
    <Tile radius={14} label={label} style={{ width: 62, height: 58 }} onPress={() => onMove(dir)}>
      <PadIcon name={icon} />
    </Tile>
  );
  return (
    <View style={{ alignItems: 'center', gap: 6, marginTop: 18 }}>
      <Key icon="arrowUp" dir="up" label={tr('上', 'Up')} />
      <View style={{ flexDirection: 'row', gap: 6 }}>
        <Key icon="arrowLeft" dir="left" label={tr('左', 'Left')} />
        <Key icon="arrowDown" dir="down" label={tr('下', 'Down')} />
        <Key icon="arrowRight" dir="right" label={tr('右', 'Right')} />
      </View>
    </View>
  );
}
function PadIcon({ name }) { const c = useColors(); return <Icon name={name} size={24} color={c.label} strokeWidth={2} />; }

export function useArrowKeys(onMove) {
  const fn = useRef(onMove); fn.current = onMove;
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return undefined;
    const map = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
    const h = e => { if (map[e.key]) { e.preventDefault(); fn.current(map[e.key]); } };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);
}
