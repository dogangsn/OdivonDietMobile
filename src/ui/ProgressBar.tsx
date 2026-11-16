import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';
import { useAppTheme } from '@/theme/theme';

export function ProgressBar({ value, height = 8, tone = 'positive' }: { value: number; height?: number; tone?: 'positive' | 'primary' }) {
  const { colors } = useAppTheme();
  const pct = Math.max(0, Math.min(100, value));
  const gradient = tone === 'positive' ? (['#34D399', '#10B981'] as const) : colors.gradient;
  return (
    <View style={{ height, borderRadius: height, backgroundColor: colors.cardMuted, overflow: 'hidden' }}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ width: `${pct}%`, height, borderRadius: height }}
      />
    </View>
  );
}
