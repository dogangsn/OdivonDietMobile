/**
 * Firebase Authentication over its REST API, so the app runs in Expo Go without native modules.
 * The web API key is public by design (it identifies the project); set EXPO_PUBLIC_FIREBASE_API_KEY.
 */
export interface FirebaseTokens {
  idToken: string;
  refreshToken: string;
  expiresAt: number;
}

const API_KEY = process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '';

export const firebaseConfigured = API_KEY.length > 0;

const MESSAGES: Record<string, string> = {
  EMAIL_NOT_FOUND: 'Bu e-posta ile kayıtlı hesap bulunamadı.',
  INVALID_PASSWORD: 'Şifre hatalı.',
  INVALID_LOGIN_CREDENTIALS: 'E-posta veya şifre hatalı.',
  USER_DISABLED: 'Hesabınız devre dışı bırakılmış.',
  TOO_MANY_ATTEMPTS_TRY_LATER: 'Çok fazla deneme yapıldı. Biraz sonra tekrar deneyin.',
};

export async function signInWithPassword(email: string, password: string): Promise<FirebaseTokens> {
  if (!firebaseConfigured) throw new Error('Uygulamada giriş ayarı eksik (Firebase API anahtarı). Lütfen yöneticinize başvurun.');
  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim(), password, returnSecureToken: true }),
  });
  const json = (await res.json()) as { idToken?: string; refreshToken?: string; expiresIn?: string; error?: { message?: string } };
  if (!res.ok || !json.idToken) {
    const code = json.error?.message?.split(' ')[0] ?? '';
    throw new Error(MESSAGES[code] ?? 'Giriş yapılamadı. Lütfen tekrar deneyin.');
  }
  return { idToken: json.idToken, refreshToken: json.refreshToken!, expiresAt: Date.now() + Number(json.expiresIn ?? 3600) * 1000 };
}

export async function refreshIdToken(refreshToken: string): Promise<FirebaseTokens> {
  const res = await fetch(`https://securetoken.googleapis.com/v1/token?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(refreshToken)}`,
  });
  const json = (await res.json()) as { id_token?: string; refresh_token?: string; expires_in?: string };
  if (!res.ok || !json.id_token) throw new Error('Oturumunuz sona erdi. Lütfen tekrar giriş yapın.');
  return { idToken: json.id_token, refreshToken: json.refresh_token ?? refreshToken, expiresAt: Date.now() + Number(json.expires_in ?? 3600) * 1000 };
}
