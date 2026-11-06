import React from 'react';
import { View } from 'react-native';
import { Icon } from './icons';
import Logo from './Logo';
import { Button, Group, IconButton, T } from './ui';
import { useInstall } from '../lib/install';
import { useStore } from '../state/store';
import { useColors } from '../theme/tokens';

function Step({ n, children }) {
  const c = useColors();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 28 }}>
      <View style={{ width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: c.accentTint }}>
        <T v="caption" color={c.accent}>{n}</T>
      </View>
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>{children}</View>
    </View>
  );
}

// Home shows it only where installing is possible, and it can be dismissed. Profile keeps it available.
export default function InstallCard({ dismissible, style }) {
  const c = useColors();
  const { tr, installDismissed, dismissInstall } = useStore();
  const { mode, install } = useInstall();
  if (mode === 'none') return null;
  if (dismissible && (installDismissed || mode === 'menu')) return null;
  return (
    <Group style={style}>
      <View style={{ padding: 14, gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Logo size={44} />
          <View style={{ flex: 1 }}>
            <T v="headline">{tr('加到裝置', 'Add to Device')}</T>
            <T v="footnote" color={c.secondary}>{tr('從主畫面直接開，像一般 App 一樣', 'Open it from your home screen like any app')}</T>
          </View>
          {dismissible && <IconButton icon="close" label={tr('不用了', 'No thanks')} color={c.secondary} onPress={dismissInstall} />}
        </View>
        {mode === 'prompt' && <Button icon="download" title={tr('加到裝置', 'Add to Device')} onPress={install} />}
        {mode === 'ios' && (
          <View style={{ gap: 6 }}>
            <Step n={1}>
              <T v="subhead">{tr('點瀏覽器的分享按鈕', 'Tap the browser\'s Share button')}</T>
              <Icon name="share" size={18} color={c.accent} />
            </Step>
            <Step n={2}><T v="subhead">{tr('選「加入主畫面」', 'Choose "Add to Home Screen"')}</T></Step>
            <Step n={3}><T v="subhead">{tr('點「新增」就完成了', 'Tap "Add" and you\'re done')}</T></Step>
          </View>
        )}
        {mode === 'menu' && <T v="subhead" color={c.secondary}>{tr('如果瀏覽器支援，可以在瀏覽器選單裡找到安裝或加到主畫面的選項。', 'If your browser supports it, look for an install or Add to Home Screen option in its menu.')}</T>}
      </View>
    </Group>
  );
}
