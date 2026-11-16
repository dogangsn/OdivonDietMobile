import Constants from 'expo-constants';
import type { DietApi } from './port';

export const API_BASE_URL: string =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? (Constants.expoConfig?.extra?.apiBaseUrl as string | undefined) ?? 'https://mainapi.odivon.com/api/v1';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

type TokenProvider = () => Promise<string | null>;

function query(params?: Record<string, string | undefined>): string {
  if (!params) return '';
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== '') as [string, string][];
  return entries.length ? `?${new URLSearchParams(entries).toString()}` : '';
}

/** MainAPI client: Firebase ID token, `{ success, data }` envelope, Turkish error messages. */
export function createHttpApi(token: TokenProvider): DietApi {
  async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const idToken = await token();
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        'X-Client-Platform': 'odivon-diet-mobile',
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const json = (await response.json().catch(() => null)) as
      | { success?: boolean; data?: T; error?: { code?: string; message?: string } }
      | null;
    if (!response.ok || json?.success === false) {
      throw new ApiError(
        response.status,
        json?.error?.code ?? 'HTTP_ERROR',
        json?.error?.message ?? 'Sunucuya ulaşılamadı. Lütfen tekrar deneyin.',
      );
    }
    return (json?.data ?? (json as T)) as T;
  }
  const get = <T,>(path: string) => request<T>('GET', path);
  const post = <T,>(path: string, body?: unknown) => request<T>('POST', path, body ?? {});
  const patch = <T,>(path: string, body: unknown) => request<T>('PATCH', path, body);

  return {
    me: () => get('/identity/me'),
    dashboard: () => get('/diet/dashboard'),
    adminSummary: () => get('/diet/admin/summary'),
    clients: (p) => get(`/diet/clients${query(p)}`),
    clientOverview: (id) => get(`/diet/clients/${id}/overview`),
    createClient: (input) => post('/diet/clients', input),
    addMeasurement: (clientId, input) => post(`/diet/clients/${clientId}/measurements`, input),
    consultations: (p) => get(`/diet/consultations${query(p)}`),
    createConsultation: (input) => post('/diet/consultations', input),
    updateConsultation: (id, input) => patch(`/diet/consultations/${id}`, input),
    conversations: () => get('/diet/conversations'),
    messages: (clientId) => get(`/diet/conversations/${clientId}/messages`),
    sendMessage: (clientId, body) => post(`/diet/conversations/${clientId}/messages`, { body }),
    markRead: (clientId) => post(`/diet/conversations/${clientId}/read`),
    tasks: (p) => get(`/diet/tasks${query(p)}`),
    createTask: (clientId, input) => post(`/diet/clients/${clientId}/tasks`, input),
    updateTask: (id, input) => patch(`/diet/tasks/${id}`, input),
    requests: (p) => get(`/diet/requests${query(p)}`),
    updateRequest: (id, input) => patch(`/diet/requests/${id}`, input),
    registerDevice: (token, platform) => post('/diet/devices', { token, platform }),
  };
}
