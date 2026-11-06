import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import InstallCard from '../components/InstallCard';
import Logo from '../components/Logo';
import { Banner, Button, Group, Page, Row, Section, Segmented, T } from '../components/ui';
import { GAMES } from '../games/catalog';
import { useStore } from '../state/store';
import { useColors } from '../theme/tokens';

export default function ProfileScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { tr, user, lang, setLang, played, records, favorites, signOut, setAuthOpen, dbError } = useStore();
  const count = GAMES.filter(g => played[g.id]).length;
  const scored = GAMES.filter(g => records[g.id]?.best != null);
  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <Page>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 10 }}>
          <Logo size={56} />
          <View style={{ flex: 1 }}>
            <T v="title" accessibilityRole="header" numberOfLines={1}>{user ? user.name : tr('訪客', 'Guest')}</T>
            <T v="footnote" color={c.secondary} numberOfLines={1} style={{ marginTop: 1 }}>{user ? user.email : tr('紀錄只存在這台裝置', 'Your progress stays on this device')}</T>
          </View>
        </View>
        {user && dbError && <Banner tone="error" text={tr(`資料庫連線問題：${dbError}`, `Database problem: ${dbError}`)} />}
        <Section title={tr('紀錄', 'Progress')}>
          <Group>
            <Row title={tr('玩過的遊戲', 'Games played')} trailing={<T v="headline">{count} / {GAMES.length}</T>} />
            <Row last title={tr('收藏', 'Saved')} trailing={<T v="headline">{favorites.length}</T>} />
          </Group>
        </Section>
        <Section title={tr('最佳成績', 'Best scores')}>
          {scored.length ? (
            <Group>
              {scored.map((g, i) => {
                const r = records[g.id];
                return <Row key={g.id} last={i === scored.length - 1} title={tr(g.zh, g.en)}
                  subtitle={tr(`玩了 ${r.plays} 次，${r.last ? `上次 ${r.last.score}，` : ''}${r.lower ? '越小越好' : '越大越好'}`, `${r.plays} plays, ${r.last ? `last ${r.last.score}, ` : ''}${r.lower ? 'lower is better' : 'higher is better'}`)}
                  trailing={<T v="headline">{r.best}</T>} />;
              })}
            </Group>
          ) : <T v="subhead" color={c.secondary}>{tr('玩一局就會出現在這裡。', 'Play a round and it shows up here.')}</T>}
        </Section>
        <InstallCard style={{ marginTop: 26 }} />
        <Section title={tr('語言', 'Language')}>
          <Segmented value={lang} onChange={setLang} items={[{ id: 'zh', label: '繁體中文' }, { id: 'en', label: 'English' }]} />
        </Section>
        <Button style={{ marginTop: 28 }} kind="secondary" icon={user ? 'logOut' : 'logIn'} title={user ? tr('登出', 'Log Out') : tr('登入／註冊', 'Log In / Sign Up')} onPress={() => (user ? signOut() : setAuthOpen(true))} />
      </Page>
    </View>
  );
}
