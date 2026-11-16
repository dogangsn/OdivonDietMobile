import { View } from 'react-native';
import { useAppTheme } from '@/theme/theme';
import type { Tone } from '@/theme/tokens';
import { Card } from './Card';
import type { IconName } from './Icon';
import { IconTile } from './IconTile';
import { Text } from './Text';

/** Web-style KPI card: overline label, big number, pastel icon tile, footnote. */
export function KpiCard({
  label,
  value,
  unit,
  icon,
  tone = 'primary',
  footnote,
  onPress,
  compact,
}: {
  label: string;
  value: string | number;
  unit?: string;
  icon: IconName;
  tone?: Tone;
  footnote?: string;
  onPress?: () => void;
  compact?: boolean;
}) {
  const { colors } = useAppTheme();
  return (
    <Card onPress={onPress} style={{ flex: 1, gap: compact ? 10 : 14 }} accessibilityLabel={`${label}: ${value}`}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <Text variant="overline" tone="muted" style={{ flex: 1 }} numberOfLines={2}>
          {label}
        </Text>
        <IconTile name={icon} tone={tone} size={compact ? 36 : 44} />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
        <Text variant="metric" style={compact ? { fontSize: 26, lineHeight: 30 } : undefined}>
          {value}
        </Text>
        {unit ? (
          <Text variant="caption" tone="subtle" weight="bold">
            {unit}
          </Text>
        ) : null}
      </View>
      {footnote ? (
        <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 }}>
          <Text variant="caption" tone="muted" numberOfLines={1}>
            {footnote}
          </Text>
        </View>
      ) : null}
    </Card>
  );
}
