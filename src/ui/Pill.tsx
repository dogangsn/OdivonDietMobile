import { View } from 'react-native';
import { useAppTheme } from '@/theme/theme';
import { toneColors, type Tone } from '@/theme/tokens';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export function Pill({ label, tone = 'neutral', icon, solid }: { label: string; tone?: Tone; icon?: IconName; solid?: boolean }) {
  const { colors } = useAppTheme();
  const t = toneColors(colors, tone);
  const fg = solid ? '#FFFFFF' : t.fg;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        backgroundColor: solid ? (tone === 'primary' ? colors.primary : t.fg) : t.bg,
      }}
    >
      {icon ? <Icon name={icon} size={12} color={fg} /> : null}
      <Text variant="caption" color={fg} weight="bold" style={{ fontSize: 12, lineHeight: 16 }}>
        {label}
      </Text>
    </View>
  );
}

export function CountBadge({ count }: { count: number }) {
  const { colors } = useAppTheme();
  if (count <= 0) return null;
  return (
    <View
      style={{
        minWidth: 22,
        height: 22,
        paddingHorizontal: 6,
        borderRadius: 11,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text variant="caption" color="#FFFFFF" weight="bold" style={{ fontSize: 12, lineHeight: 15 }}>
        {count > 99 ? '99+' : count}
      </Text>
    </View>
  );
}
