import { View } from 'react-native';
import { useAppTheme } from '@/theme/theme';
import { ScalePressable } from './Pressable';
import { Text } from './Text';

export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: readonly { value: T; label: string; count?: number }[];
  onChange: (value: T) => void;
}) {
  const { colors } = useAppTheme();
  return (
    <View style={{ flexDirection: 'row', backgroundColor: colors.cardMuted, borderRadius: 16, padding: 4, gap: 4 }}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <ScalePressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityState={{ selected: active }}
            accessibilityLabel={option.label}
            style={{
              flex: 1,
              paddingVertical: 9,
              borderRadius: 12,
              alignItems: 'center',
              backgroundColor: active ? colors.card : 'transparent',
              shadowColor: '#000',
              shadowOpacity: active ? 0.06 : 0,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 },
              elevation: active ? 1 : 0,
            }}
          >
            <Text variant="caption" weight="bold" color={active ? colors.text : colors.textMuted}>
              {option.label}
              {option.count ? ` · ${option.count}` : ''}
            </Text>
          </ScalePressable>
        );
      })}
    </View>
  );
}

export function Chips<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  const { colors } = useAppTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <ScalePressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityState={{ selected: active }}
            accessibilityLabel={option.label}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 999,
              backgroundColor: active ? colors.text : colors.card,
              borderWidth: 1,
              borderColor: active ? colors.text : colors.border,
            }}
          >
            <Text variant="caption" weight="bold" color={active ? colors.bg : colors.textMuted}>
              {option.label}
            </Text>
          </ScalePressable>
        );
      })}
    </View>
  );
}
