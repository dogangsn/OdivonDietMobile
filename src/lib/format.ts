import type { Channel, Program, RequestStatus, RequestType, TaskCategory } from '@/api/types';
import type { IconName } from '@/ui/Icon';
import type { Tone } from '@/theme/tokens';

const tr = 'tr-TR';

export const time = (iso: string) => new Date(iso).toLocaleTimeString(tr, { hour: '2-digit', minute: '2-digit' });
export const dayMonth = (iso: string) => new Date(iso).toLocaleDateString(tr, { day: 'numeric', month: 'short' });
export const longDate = (d: Date = new Date()) => d.toLocaleDateString(tr, { weekday: 'long', day: 'numeric', month: 'long' });
export const kg = (v: number) => v.toLocaleString(tr, { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export function greeting(d: Date = new Date()): string {
  const h = d.getHours();
  if (h < 6) return 'İyi geceler';
  if (h < 12) return 'Günaydın';
  if (h < 18) return 'İyi günler';
  return 'İyi akşamlar';
}

export function relative(iso: string | null): string {
  if (!iso) return 'Hiç';
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60_000);
  if (min < 1) return 'şimdi';
  if (min < 60) return `${min} dk`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} sa`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d} gün`;
  return dayMonth(iso);
}

/** "şimdi", "25 dk sonra" or the clock time for an upcoming instant. */
export function untilLabel(iso: string): string {
  const min = Math.round((new Date(iso).getTime() - Date.now()) / 60_000);
  if (min <= 0 && min > -45) return 'şimdi';
  if (min > 0 && min < 60) return `${min} dk sonra`;
  return time(iso);
}

/** "az önce", "5 dk önce", "3 gün önce" or the date. */
export function ago(iso: string | null): string {
  if (!iso) return 'hiç';
  const r = relative(iso);
  if (r === 'şimdi') return 'az önce';
  return /^\d+ (dk|sa|gün)$/.test(r) ? `${r} önce` : r;
}

export function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export const PROGRAM_LABELS: Record<Program, string> = {
  weight_loss: 'Kilo verme',
  weight_gain: 'Kilo alma',
  sports: 'Sporcu beslenmesi',
  clinical: 'Klinik beslenme',
  healthy: 'Sağlıklı yaşam',
};

export const CHANNEL: Record<Channel, { label: string; icon: IconName; tone: Tone }> = {
  clinic: { label: 'Yüz yüze', icon: 'storefront-outline', tone: 'primary' },
  video: { label: 'Video', icon: 'videocam-outline', tone: 'info' },
  phone: { label: 'Telefon', icon: 'call-outline', tone: 'positive' },
  message: { label: 'Mesaj', icon: 'chatbubbles-outline', tone: 'warning' },
};

export const TASK_CATEGORY: Record<TaskCategory, { label: string; icon: IconName; tone: Tone }> = {
  meal_log: { label: 'Öğün kaydı', icon: 'restaurant-outline', tone: 'warning' },
  measurement: { label: 'Ölçüm', icon: 'scale-outline', tone: 'positive' },
  water: { label: 'Su', icon: 'water-outline', tone: 'info' },
  exercise: { label: 'Egzersiz', icon: 'barbell-outline', tone: 'primary' },
  photo: { label: 'Fotoğraf', icon: 'camera-outline', tone: 'danger' },
  other: { label: 'Diğer', icon: 'checkbox-outline', tone: 'neutral' },
};

export const REQUEST_TYPE: Record<RequestType, { label: string; icon: IconName }> = {
  appointment: { label: 'Randevu', icon: 'calendar-outline' },
  plan_change: { label: 'Plan değişikliği', icon: 'restaurant-outline' },
  question: { label: 'Soru', icon: 'chatbubbles-outline' },
  document: { label: 'Belge', icon: 'document-text-outline' },
  other: { label: 'Diğer', icon: 'ellipsis-horizontal' },
};

export const REQUEST_STATUS: Record<RequestStatus, { label: string; tone: Tone }> = {
  open: { label: 'Yeni', tone: 'primary' },
  in_progress: { label: 'İşlemde', tone: 'warning' },
  resolved: { label: 'Çözüldü', tone: 'positive' },
  rejected: { label: 'Reddedildi', tone: 'danger' },
};

export function bmi(weightKg: number, heightCm: number): number {
  const m = heightCm / 100;
  return Math.round((weightKg / (m * m)) * 10) / 10;
}

export function bmiLabel(value: number): { label: string; tone: Tone } {
  if (value < 18.5) return { label: 'Zayıf', tone: 'info' };
  if (value < 25) return { label: 'Normal', tone: 'positive' };
  if (value < 30) return { label: 'Fazla kilolu', tone: 'warning' };
  return { label: 'Obez', tone: 'danger' };
}
