import { View } from 'react-native';
import { useAppTheme } from '@/theme/theme';
import { Text } from './Text';

const MACROS = [
  { key: 'protein', label: 'Protein', color: '#8B5CF6' },
  { key: 'carb', label: 'Karbonhidrat', color: '#F59E0B' },
  { key: 'fat', label: 'Yağ', color: '#10B981' },
] as const;

export function MacroBar({ protein, carb, fat }: { protein: number; carb: number; fat: number }) {
  const { colors } = useAppTheme();
  const values = { protein, carb, fat };
  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden', gap: 3, backgroundColor: colors.cardMuted }}>
        {MACROS.map((m) => (
          <View key={m.key} style={{ flex: values[m.key] || 0.0001, backgroundColor: m.color, borderRadius: 5 }} />
        ))}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {MACROS.map((m) => (
          <View key={m.key} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: m.color }} />
            <Text variant="caption" tone="muted">
              {m.label} <Text variant="caption" weight="bold">%{values[m.key]}</Text>
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
