import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { create } from 'zustand';
import { createDemoApi } from '@/api/demo';
import { ApiError, createHttpApi } from '@/api/http';
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
    const api = liveApi(tokens);
    // Make sure MainAPI accepts this account (tenant, diet module, verified e-mail) before entering the app.
    try {
      await api.me();
      await api.dashboard();
    } catch (e) {
      throw new Error(describeApiError(e));
    }
    await save({ mode: 'live', tokens });
    set({ mode: 'live', api });
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

/** Used while signed out: screens still mounted during the sign-out transition must not crash. */
const signedOutApi = new Proxy({} as DietApi, {
  get: () => () => Promise.reject(new Error('Oturum kapalı')),
});

export function useApi(): DietApi {
  const api = useSession((s) => s.api);
  return api ?? signedOutApi;
}

const API_MESSAGES: Record<string, string> = {
  TENANT_NOT_FOUND: 'Hesabınız MainAPI\'de bir işletmeye bağlı değil. Yöneticinizden sizi personel olarak eklemesini isteyin.',
  EMAIL_NOT_VERIFIED: 'E-posta adresiniz doğrulanmamış. Gelen kutunuzdaki doğrulama bağlantısına tıklayın.',
  FORBIDDEN_MODULE: 'İşletmenizde OdivonDiet ürünü açık değil.',
  SUBSCRIPTION_REQUIRED: 'İşletmenizin aboneliği aktif değil. Web panelden aboneliği yenileyin.',
  FORBIDDEN_PERMISSION: 'Bu uygulamayı kullanma yetkiniz yok. Yöneticinizden rol atamasını isteyin.',
  FORBIDDEN_ROLE: 'Bu uygulamayı kullanma yetkiniz yok. Yöneticinizden rol atamasını isteyin.',
  INVALID_TOKEN: 'Oturum doğrulanamadı (Firebase projesi uyuşmuyor olabilir).',
  AUTH_REQUIRED: 'Oturum doğrulanamadı.',
  CLIENT_UPGRADE_REQUIRED: 'Uygulamanın yeni sürümünü yükleyin.',
};

function describeApiError(e: unknown): string {
  if (e instanceof ApiError) {
    const text = API_MESSAGES[e.code] ?? e.message;
    return `${text} (kod: ${e.code}, ${e.status})`;
  }
  return 'MainAPI\'ye ulaşılamadı. İnternet bağlantınızı kontrol edin.';
}
