import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setToken } from '../lib/api';
import { GAMES } from '../games/catalog';

const KEY = 'letsplay:state:v2';
const SESSION_KEY = 'letsplay:session:v1';
const Ctx = createContext(null);
export const useStore = () => useContext(Ctx);

export function StoreProvider({ children }) {
  const [state, setState] = useState({ lang: 'zh', favorites: [], played: {}, records: {}, skippedAuth: false, installDismissed: false });
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [dbError, setDbError] = useState(null);
  const uid = session?.user?.id;

  const saveSession = useCallback(next => {
    setToken(next?.token ?? null);
    setSession(next);
    (next ? AsyncStorage.setItem(SESSION_KEY, JSON.stringify(next)) : AsyncStorage.removeItem(SESSION_KEY)).catch(() => {});
  }, []);
  const endSession = useCallback(() => {
    saveSession(null);
    setState(s => ({ ...s, favorites: [], played: {}, records: {} }));
  }, [saveSession]);
  // An expired token signs the player out. Any other failure just shows as a sync problem.
  const report = useCallback(e => {
    if (e.status === 401) { endSession(); return; }
    setDbError(e.message);
  }, [endSession]);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(raw => { if (raw) setState(s => ({ ...s, ...JSON.parse(raw) })); }).catch(() => {}).finally(() => setReady(true));
    // The saved session opens the app offline; the server gets the final say once it can be reached.
    AsyncStorage.getItem(SESSION_KEY).then(raw => {
      if (!raw) return;
      const saved = JSON.parse(raw);
      setToken(saved.token);
      setSession(saved);
      api('/me').then(({ user }) => saveSession({ token: saved.token, user })).catch(e => { if (e.status === 401) endSession(); });
    }).catch(() => {});
  }, []);
  useEffect(() => { if (ready) AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {}); }, [state, ready]);

  // Signed in: the database is the source of truth. Guests keep data on this device only.
  useEffect(() => {
    if (!uid) return;
    api('/me/state').then(({ favorites, plays, records: rows }) => {
      setDbError(null);
      const played = {};
      plays.forEach(p => { played[p.game_id] = played[p.game_id] || new Date(p.played_at).getTime(); });
      const records = {};
      setState(s => {
        (rows || []).forEach(r => {
          const remote = r.last != null ? { score: r.last, at: new Date(r.last_at).getTime() } : null;
          const local = s.records[r.game_id]?.last;
          records[r.game_id] = { best: r.best, lower: r.lower, plays: r.plays, last: local && (!remote || local.at > remote.at) ? local : remote };
        });
        return { ...s, favorites, played, records };
      });
    }).catch(report);
  }, [uid]);

  const toggleFavorite = useCallback(id => {
    const on = state.favorites.includes(id);
    setState(s => ({ ...s, favorites: on ? s.favorites.filter(f => f !== id) : [id, ...s.favorites] }));
    if (uid) {
      api(`/me/favorites/${id}`, { method: on ? 'DELETE' : 'PUT' }).then(() => setDbError(null)).catch(report);
    }
  }, [uid, state.favorites, report]);

  // A number beats the saved best only in the game's own direction: lower for moves and times, higher for points.
  const markPlayed = useCallback((id, won, score, lower) => {
    const hasScore = Number.isInteger(score);
    setState(s => {
      const prev = s.records[id] || { best: null, lower: false, plays: 0, last: null };
      const beats = hasScore && (prev.best == null || (lower ? score < prev.best : score > prev.best));
      const next = { best: beats ? score : prev.best, lower: hasScore ? !!lower : prev.lower, plays: prev.plays + 1, last: hasScore ? { score, at: Date.now() } : prev.last };
      return { ...s, played: { ...s.played, [id]: Date.now() }, records: { ...s.records, [id]: next } };
    });
    if (uid) api('/me/plays', { method: 'POST', body: { game: id, won, ...(hasScore ? { score, lower: !!lower } : null) } }).then(() => setDbError(null)).catch(report);
  }, [uid, report]);

  // For the undecided who crave novelty: never-played first, then whatever was played longest ago.
  const pickFresh = useCallback((exclude, type) => {
    const pool = GAMES.filter(g => g.id !== exclude && (!type || g.type === type));
    const never = pool.filter(g => !state.played[g.id]);
    const from = never.length ? never : [...pool].sort((a, b) => state.played[a.id] - state.played[b.id]).slice(0, Math.ceil(pool.length / 3));
    return from[Math.floor(Math.random() * from.length)];
  }, [state.played]);

  const authenticate = (path, body) => api(path, { method: 'POST', body }).then(saveSession);
  const signIn = (email, password) => authenticate('/auth/login', { email, password });
  const signUp = (email, password, nickname) => authenticate('/auth/signup', { email, password, nickname });

  const user = session?.user ? { id: uid, email: session.user.email, name: session.user.nickname } : null;

  const value = useMemo(() => ({
    ...state, ready, user, dbError, zh: state.lang === 'zh', tr: (z, e) => (state.lang === 'zh' ? z : e),
    setLang: lang => setState(s => ({ ...s, lang })), skipAuth: () => setState(s => ({ ...s, skippedAuth: true })),
    dismissInstall: () => setState(s => ({ ...s, installDismissed: true })),
    toggleFavorite, markPlayed, pickFresh, signIn, signUp, signOut: endSession, authOpen, setAuthOpen,
  }), [state, ready, session, dbError, toggleFavorite, markPlayed, pickFresh, endSession, authOpen]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
