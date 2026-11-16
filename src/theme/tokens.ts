/**
 * OdivonDiet design tokens. Same language as the web panel (redesign/*.png): Plus Jakarta Sans,
 * indigo → violet brand gradient, emerald for progress, soft pastel icon tiles, large rounded cards.
 */
export const palette = {
  indigo: '#6366F1',
  violet: '#7C3AED',
  violetDeep: '#5B21B6',
  emerald: '#10B981',
  emeraldDeep: '#047857',
  amber: '#F59E0B',
  rose: '#F43F5E',
  sky: '#0EA5E9',
} as const;

export interface ThemeColors {
  bg: string;
  bgElevated: string;
  card: string;
  cardMuted: string;
  border: string;
  borderStrong: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  primary: string;
  primaryText: string;
  primarySoft: string;
  positive: string;
  positiveSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  info: string;
  infoSoft: string;
  overlay: string;
  tabBar: string;
  shadow: string;
  gradient: readonly [string, string];
  heroGradient: readonly [string, string, string];
}

export const light: ThemeColors = {
  bg: '#F6F7FB',
  bgElevated: '#FFFFFF',
  card: '#FFFFFF',
  cardMuted: '#F3F4F9',
  border: '#E8EAF2',
  borderStrong: '#D9DCE8',
  text: '#0F172A',
  textMuted: '#5B6478',
  textSubtle: '#8A93A6',
  primary: '#6D4AFF',
  primaryText: '#5B32F0',
  primarySoft: '#F1EDFF',
  positive: '#059669',
  positiveSoft: '#E7F8F1',
  warning: '#B45309',
  warningSoft: '#FFF5E1',
  danger: '#E11D48',
  dangerSoft: '#FFECEF',
  info: '#0284C7',
  infoSoft: '#E8F5FD',
  overlay: 'rgba(15, 23, 42, 0.45)',
  tabBar: 'rgba(255, 255, 255, 0.92)',
  shadow: '#4C3FB0',
  gradient: [palette.indigo, palette.violet],
  heroGradient: ['#6366F1', '#7C3AED', '#9333EA'],
};

export const dark: ThemeColors = {
  bg: '#0B0D17',
  bgElevated: '#12152A',
  card: '#151829',
  cardMuted: '#1C2036',
  border: '#242842',
  borderStrong: '#30355A',
  text: '#F3F4FA',
  textMuted: '#A3A9C2',
  textSubtle: '#6E7493',
  primary: '#8B6CFF',
  primaryText: '#B4A1FF',
  primarySoft: '#241E4A',
  positive: '#34D399',
  positiveSoft: '#0F2E26',
  warning: '#FBBF24',
  warningSoft: '#33270C',
  danger: '#FB7185',
  dangerSoft: '#3A1520',
  info: '#38BDF8',
  infoSoft: '#0E2A3B',
  overlay: 'rgba(0, 0, 0, 0.6)',
  tabBar: 'rgba(18, 21, 42, 0.92)',
  shadow: '#000000',
  gradient: ['#6D6AF8', '#8B5CF6'],
  heroGradient: ['#4F46E5', '#6D28D9', '#7E22CE'],
};

export const radius = { sm: 10, md: 14, lg: 20, xl: 26, pill: 999 } as const;
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 } as const;

export const font = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
} as const;

export type Tone = 'primary' | 'positive' | 'warning' | 'danger' | 'info' | 'neutral';

export function toneColors(c: ThemeColors, tone: Tone): { fg: string; bg: string } {
  switch (tone) {
    case 'primary':
      return { fg: c.primaryText, bg: c.primarySoft };
    case 'positive':
      return { fg: c.positive, bg: c.positiveSoft };
    case 'warning':
      return { fg: c.warning, bg: c.warningSoft };
    case 'danger':
      return { fg: c.danger, bg: c.dangerSoft };
    case 'info':
      return { fg: c.info, bg: c.infoSoft };
    default:
      return { fg: c.textMuted, bg: c.cardMuted };
  }
}
