import { useState } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';
import { useAppTheme } from '@/theme/theme';
import { font, radius } from '@/theme/tokens';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export interface InputProps extends TextInputProps {
  label?: string;
  icon?: IconName;
  suffix?: string;
  error?: string;
  right?: React.ReactNode;
}

export function Input({ label, icon, suffix, error, right, style, ...rest }: InputProps) {
  const { colors } = useAppTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ gap: 6 }}>
      {label ? (
        <Text variant="caption" tone="muted" weight="semibold">
          {label}
        </Text>
      ) : null}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          minHeight: 52,
          paddingHorizontal: 14,
          borderRadius: radius.lg,
          backgroundColor: colors.card,
          borderWidth: 1.5,
          borderColor: error ? colors.danger : focused ? colors.primary : colors.border,
        }}
      >
        {icon ? <Icon name={icon} size={19} color={focused ? colors.primaryText : colors.textSubtle} /> : null}
        <TextInput
          placeholderTextColor={colors.textSubtle}
          selectionColor={colors.primary}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          style={[{ flex: 1, minWidth: 0, fontFamily: font.medium, fontSize: 16, color: colors.text, paddingVertical: 12, outlineStyle: 'none' } as object, style]}
          {...rest}
        />
        {suffix ? (
          <Text tone="subtle" weight="semibold">
            {suffix}
          </Text>
        ) : null}
        {right}
      </View>
      {error ? (
        <Text variant="caption" color={colors.danger}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
