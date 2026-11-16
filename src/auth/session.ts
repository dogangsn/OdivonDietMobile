import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { create } from 'zustand';
import { createDemoApi } from '@/api/demo';
import { createHttpApi } from '@/api/http';
import type { DietApi } from '@/api/port';
import { refreshIdToken, signInWithPassword, type FirebaseTokens } from './firebase';

const KEY = 'odivon.session';

interface StoredSession {
  mode: 'demo' | 'live';
  tokens?: FirebaseTokens;
}

interface SessionState {
  ready: boolean;
  mode: 'demo' | 'live' | null;
  api: DietApi | null;
  hydrate: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  startDemo: () => Promise<void>;
  signOut: () => Promise<void>;
}

async function save(value: StoredSession | null) {
  try {
    if (Platform.OS === 'web') {
      if (value) localStorage.setItem(KEY, JSON.stringify(value));
      else localStorage.removeItem(KEY);
      return;
    }
    if (value) await SecureStore.setItemAsync(KEY, JSON.stringify(value));
    else await SecureStore.deleteItemAsync(KEY);
  } catch {
    // Storage can be unavailable (private browsing); the session then lasts until the app closes.
  }
}

async function load(): Promise<StoredSession | null> {
  try {
    const raw = Platform.OS === 'web' ? localStorage.getItem(KEY) : await SecureStore.getItemAsync(KEY);
    return raw ? (JSON.parse(raw) as StoredSession) : null;
  } catch {
    return null;
  }
}

function liveApi(initial: FirebaseTokens): DietApi {
  let tokens = initial;
  return createHttpApi(async () => {
    if (Date.now() > tokens.expiresAt - 60_000) {
      tokens = await refreshIdToken(tokens.refreshToken);
      await save({ mode: 'live', tokens });
    }
    return tokens.idToken;
  });
}

export const useSession = create<SessionState>((set) => ({
  ready: false,
  mode: null,
  api: null,
  hydrate: async () => {
    const stored = await load();
    if (stored?.mode === 'demo') set({ ready: true, mode: 'demo', api: createDemoApi() });
    else if (stored?.mode === 'live' && stored.tokens) set({ ready: true, mode: 'live', api: liveApi(stored.tokens) });
    else set({ ready: true });
  },
  signIn: async (email, password) => {
    const tokens = await signInWithPassword(email, password);
    await save({ mode: 'live', tokens });
    set({ mode: 'live', api: liveApi(tokens) });
  },
  startDemo: async () => {
    await save({ mode: 'demo' });
    set({ mode: 'demo', api: createDemoApi() });
  },
  signOut: async () => {
    await save(null);
    set({ mode: null, api: null });
  },
}));

export function useApi(): DietApi {
  const api = useSession((s) => s.api);
  if (!api) throw new Error('Oturum yok');
  return api;
}
