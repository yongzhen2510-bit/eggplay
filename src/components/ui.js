import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from './icons';
import { type, useColors } from '../theme/tokens';

const NATIVE = Platform.OS !== 'web';

// Read once at module load so a component's very first frame already respects the setting.
let reducedNow = false;
const reducedListeners = new Set();
const setReducedNow = v => { reducedNow = !!v; reducedListeners.forEach(fn => fn(reducedNow)); };
AccessibilityInfo.isReduceMotionEnabled?.().then(setReducedNow).catch(() => {});
AccessibilityInfo.addEventListener?.('reduceMotionChanged', setReducedNow);

export function useReducedMotion() {
  const [reduced, setReduced] = useState(reducedNow);
  useEffect(() => {
    setReduced(reducedNow);
    reducedListeners.add(setReduced);
    return () => reducedListeners.delete(setReduced);
  }, []);
  return reduced;
}

// Apple's two spring parameters converted to stiffness/damping. Springs start from the
// value on screen, so every animation can be interrupted and retargeted mid-flight.
export function spring(value, toValue, { response = 0.35, ratio = 1, reduced = false } = {}) {
  if (reduced) { value.setValue(toValue); return; }
  const w = (2 * Math.PI) / response;
  Animated.spring(value, { toValue, stiffness: w * w, damping: 2 * ratio * w, mass: 1, useNativeDriver: NATIVE }).start();
}

export function T({ v = 'body', color, style, children, ...rest }) {
  const c = useColors();
  return <Text style={[type[v], { color: color || c.label }, style]} {...rest}>{children}</Text>;
}

// A flat card that gives way under the finger. Selection adds a heavier outline, so it is never colour alone.
export function Tile({ onPress, selected, radius = 16, style, faceStyle, disabled, label, children }) {
  const c = useColors();
  const reduced = useReducedMotion();
  const s = useRef(new Animated.Value(1)).current;
  return (
    <Pressable
      accessibilityRole="button" accessibilityLabel={label}
      accessibilityState={{ selected: !!selected, disabled: !!disabled }}
      disabled={disabled} delayPressIn={0} onPress={onPress}
      onPressIn={() => spring(s, 0.96, { response: 0.14, reduced })}
      onPressOut={() => spring(s, 1, { response: 0.3, reduced })}
      style={style}
    >
      <Animated.View style={[{
        flex: 1, borderRadius: radius, backgroundColor: selected ? c.accentTint : c.surface,
        borderWidth: selected ? 2 : 1, borderColor: selected ? c.accent : c.edge, opacity: disabled ? 0.5 : 1,
        alignItems: 'center', justifyContent: 'center', transform: [{ scale: s }],
      }, faceStyle]}>{children}</Animated.View>
    </Pressable>
  );
}

// An icon on a soft rounded square: the one way a game, room or category is pictured.
export function Badge({ icon, tone = 'puzzle', size = 44 }) {
  const c = useColors();
  const [bg, fg] = { puzzle: [c.puzzleTint, c.puzzle], challenge: [c.challengeTint, c.challenge], neutral: [c.surface2, c.secondary] }[tone];
  return (
    <View style={{ width: size, height: size, borderRadius: Math.round(size * 0.3), backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={icon} size={Math.round(size * 0.56)} color={fg} />
    </View>
  );
}

export function Button({ title, onPress, kind = 'primary', icon, disabled, style }) {
  const c = useColors();
  const reduced = useReducedMotion();
  const s = useRef(new Animated.Value(1)).current;
  const primary = kind === 'primary';
  const fg = primary ? c.onAccent : c.accent;
  return (
    <Pressable
      accessibilityRole="button" accessibilityState={{ disabled: !!disabled }} disabled={disabled} delayPressIn={0} onPress={onPress}
      onPressIn={() => spring(s, 0.97, { response: 0.14, reduced })}
      onPressOut={() => spring(s, 1, { response: 0.3, reduced })} style={style}
    >
      <Animated.View style={{
        minHeight: 52, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', gap: 8,
        alignItems: 'center', justifyContent: 'center', backgroundColor: primary ? c.accent : c.accentTint,
        opacity: disabled ? 0.45 : 1, transform: [{ scale: s }],
      }}>
        {icon && <Icon name={icon} size={20} color={fg} strokeWidth={2} />}
        <T v="headline" color={fg} style={{ textAlign: 'center' }}>{title}</T>
      </Animated.View>
    </Pressable>
  );
}

export function IconButton({ icon, label, onPress, color, filled }) {
  const c = useColors();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} hitSlop={6}
      style={({ pressed }) => ({ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.5 : 1 })}>
      <Icon name={icon} size={24} color={color || c.accent} filled={filled} />
    </Pressable>
  );
}

export function NavBar({ title, backLabel, onBack, right }) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top, backgroundColor: c.bg }}>
      <View style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 }}>
        <View style={{ flex: 1, alignItems: 'flex-start' }}>
          {onBack && (
            <Pressable accessibilityRole="button" accessibilityLabel={backLabel} onPress={onBack} hitSlop={6}
              style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', minHeight: 44, paddingRight: 8, opacity: pressed ? 0.5 : 1 })}>
              <Icon name="chevronLeft" size={24} color={c.accent} strokeWidth={2} />
              <T v="body" color={c.accent} numberOfLines={1}>{backLabel}</T>
            </Pressable>
          )}
        </View>
        <T v="headline" numberOfLines={1} accessibilityRole="header" style={{ flex: 2, textAlign: 'center' }}>{title}</T>
        <View style={{ flex: 1, alignItems: 'flex-end' }}>{right}</View>
      </View>
    </View>
  );
}

// Forward screens arrive from the right, returning screens from the left: same path both ways.
export function ScreenEnter({ dir = 0, children }) {
  const reduced = useReducedMotion();
  const o = useRef(new Animated.Value(dir ? 0 : 1)).current;
  const x = useRef(new Animated.Value(dir * 28)).current;
  useEffect(() => {
    spring(o, 1, { response: 0.3 });
    spring(x, 0, { response: 0.38, reduced });
  }, []);
  return <Animated.View style={{ flex: 1, opacity: o, transform: [{ translateX: reduced ? 0 : x }] }}>{children}</Animated.View>;
}

// Inline feedback replaces Alert.alert, which interrupts play and does nothing on web.
export function Banner({ tone = 'info', text }) {
  const c = useColors();
  const reduced = useReducedMotion();
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => { a.setValue(0); spring(a, 1, { response: 0.32, ratio: tone === 'success' ? 0.75 : 1, reduced }); }, [text]);
  const map = {
    success: [c.successTint, c.success, 'checkCircle'],
    error: [c.dangerTint, c.danger, 'alertCircle'],
    info: [c.accentTint, c.accent, 'infoCircle'],
  }[tone];
  return (
    <Animated.View accessibilityLiveRegion="polite" style={{
      flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: map[0], borderRadius: 14, padding: 12, marginTop: 14,
      opacity: a, transform: [{ scale: a.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) }],
    }}>
      <Icon name={map[2]} size={20} color={map[1]} strokeWidth={2} />
      <T v="subhead" color={map[1]} style={{ flex: 1, fontWeight: '600' }}>{text}</T>
    </Animated.View>
  );
}

export function Segmented({ items, value, onChange }) {
  const c = useColors();
  const reduced = useReducedMotion();
  const [w, setW] = useState(0);
  const index = Math.max(0, items.findIndex(i => i.id === value));
  const x = useRef(new Animated.Value(0)).current;
  const seg = w / items.length;
  useEffect(() => { if (w) spring(x, index * seg, { reduced }); }, [index, w]);
  return (
    <View onLayout={e => setW(e.nativeEvent.layout.width - 8)} accessibilityRole="tablist"
      style={{ flexDirection: 'row', backgroundColor: c.surface2, borderRadius: 12, padding: 4 }}>
      {w > 0 && <Animated.View style={{ position: 'absolute', top: 4, bottom: 4, left: 4, width: seg, borderRadius: 9, backgroundColor: c.surface, transform: [{ translateX: x }] }} />}
      {items.map(i => (
        <Pressable key={i.id} accessibilityRole="tab" accessibilityState={{ selected: i.id === value }} onPress={() => onChange(i.id)}
          style={{ flex: 1, minHeight: 40, alignItems: 'center', justifyContent: 'center' }}>
          <T v="subhead" color={i.id === value ? c.label : c.secondary} style={{ fontWeight: i.id === value ? '600' : '400' }}>{i.label}</T>
        </Pressable>
      ))}
    </View>
  );
}

export function Group({ children, style }) {
  const c = useColors();
  return <View style={[{ backgroundColor: c.surface, borderRadius: 18, borderWidth: 1, borderColor: c.edge, overflow: 'hidden' }, style]}>{children}</View>;
}

// `accessory` sits beside the row's button, never inside it, so it stays its own control.
export function Row({ leading, title, subtitle, trailing, accessory, onPress, last, label }) {
  const c = useColors();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: accessory ? 4 : 0, borderBottomWidth: last ? 0 : 1, borderBottomColor: c.separator }}>
      <Pressable accessibilityRole={onPress ? 'button' : undefined} accessibilityLabel={label} onPress={onPress} disabled={!onPress}
        style={({ pressed }) => ({ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 64, paddingLeft: 14, paddingRight: accessory ? 4 : 16, paddingVertical: 10, backgroundColor: pressed ? c.surface2 : 'transparent' })}>
        {leading}
        <View style={{ flex: 1 }}>
          <T v="body" style={{ fontWeight: '500' }}>{title}</T>
          {!!subtitle && <T v="footnote" color={c.secondary}>{subtitle}</T>}
        </View>
        {trailing}
        {onPress && !accessory && <Icon name="chevronRight" size={18} color={c.placeholder} />}
      </Pressable>
      {accessory}
    </View>
  );
}

export const Field = React.forwardRef(function Field({ style, ...props }, ref) {
  const c = useColors();
  return <TextInput ref={ref} placeholderTextColor={c.placeholder} style={[type.body, { color: c.label, minHeight: 48, paddingVertical: 10 }, !NATIVE && { outlineColor: c.accent }, style]} {...props} />;
});

export function Section({ title, children, style }) {
  return (
    <View style={[{ marginTop: 26 }, style]}>
      <T v="title2" accessibilityRole="header" style={{ marginBottom: 12 }}>{title}</T>
      {children}
    </View>
  );
}

export function Page({ children, bottom = 32, scrollRef, ...rest }) {
  return (
    <ScrollView ref={scrollRef} keyboardShouldPersistTaps="handled" {...rest}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: bottom, width: '100%', maxWidth: 640, alignSelf: 'center' }}>
      {children}
    </ScrollView>
  );
}

export function Chip({ text, tone = 'neutral' }) {
  const c = useColors();
  const [bg, fg] = tone === 'accent' ? [c.accentTint, c.accent] : [c.surface2, c.secondary];
  return <View style={{ backgroundColor: bg, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 }}><T v="caption" color={fg}>{text}</T></View>;
}

export function EmptyState({ icon, title, body, children }) {
  const c = useColors();
  return (
    <View style={{ alignItems: 'center', paddingVertical: 40, paddingHorizontal: 12 }}>
      <Badge icon={icon} tone="neutral" size={72} />
      <T v="title2" style={{ marginTop: 14, textAlign: 'center' }}>{title}</T>
      {!!body && <T v="subhead" color={c.secondary} style={{ marginTop: 6, textAlign: 'center' }}>{body}</T>}
      {children && <View style={{ marginTop: 18, alignSelf: 'stretch' }}>{children}</View>}
    </View>
  );
}
