import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useAppTheme } from '@/theme/theme';
import { Icon } from './Icon';
import { ScalePressable } from './Pressable';
import { Text } from './Text';

export interface ListRowProps {
  leading?: ReactNode;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  onPress?: () => void;
  chevron?: boolean;
  highlight?: boolean;
  divider?: boolean;
}

export function ListRow({ leading, title, subtitle, trailing, onPress, chevron = !!onPress, highlight, divider }: ListRowProps) {
  const { colors } = useAppTheme();
  const body = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: highlight ? 12 : 0,
        borderRadius: highlight ? 18 : 0,
        backgroundColor: highlight ? colors.positiveSoft : 'transparent',
        borderWidth: highlight ? 1 : 0,
        borderColor: highlight ? colors.positive + '55' : 'transparent',
        borderBottomWidth: divider && !highlight ? 1 : highlight ? 1 : 0,
        borderBottomColor: highlight ? colors.positive + '55' : colors.border,
      }}
    >
      {leading}
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" tone="muted" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing}
      {chevron ? <Icon name="chevron-forward" size={18} color={colors.textSubtle} /> : null}
    </View>
  );
  if (!onPress) return body;
  return (
    <ScalePressable onPress={onPress} scaleTo={0.985} accessibilityLabel={title}>
      {body}
    </ScalePressable>
  );
}
