import { View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import { useAppTheme } from '@/theme/theme';
import { radius } from '@/theme/tokens';
import { ScalePressable } from './Pressable';

export interface CardProps extends ViewProps {
  padded?: boolean;
  muted?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function Card({ padded = true, muted, onPress, style, children, accessibilityLabel, ...rest }: CardProps) {
  const { colors, isDark } = useAppTheme();
  const base: ViewStyle = {
    backgroundColor: muted ? colors.cardMuted : colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: padded ? 18 : 0,
    shadowColor: colors.shadow,
    shadowOpacity: isDark ? 0 : 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: isDark ? 0 : 2,
  };
  if (onPress)
    return (
      <ScalePressable onPress={onPress} style={[base, style]} accessibilityLabel={accessibilityLabel} scaleTo={0.985}>
        {children}
      </ScalePressable>
    );
  return (
    <View style={[base, style]} {...rest}>
      {children}
    </View>
  );
}
