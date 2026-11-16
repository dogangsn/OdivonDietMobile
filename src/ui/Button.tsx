import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, View, type StyleProp, type ViewStyle } from 'react-native';
import { useAppTheme } from '@/theme/theme';
import { radius } from '@/theme/tokens';
import { Icon, type IconName } from './Icon';
import { ScalePressable } from './Pressable';
import { Text } from './Text';

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  size?: 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
  full?: boolean;
}

export function Button({ label, onPress, variant = 'primary', icon, loading, disabled, size = 'md', style, full }: ButtonProps) {
  const { colors, isDark } = useAppTheme();
  const height = size === 'lg' ? 56 : 48;
  const fg =
    variant === 'primary' ? '#FFFFFF' : variant === 'danger' ? colors.danger : variant === 'ghost' ? colors.primaryText : colors.text;
  const content = (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height, paddingHorizontal: 20 }}>
      {loading ? <ActivityIndicator color={fg} /> : icon ? <Icon name={icon} size={19} color={fg} /> : null}
      <Text variant="bodyStrong" color={fg} weight="bold">
        {label}
      </Text>
    </View>
  );
  const shell: ViewStyle = {
    borderRadius: radius.lg,
    overflow: 'hidden',
    opacity: disabled ? 0.5 : 1,
    alignSelf: full ? 'stretch' : 'auto',
  };
  return (
    <ScalePressable
      onPress={disabled || loading ? undefined : onPress}
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || loading }}
      style={[
        shell,
        variant === 'primary' && {
          shadowColor: colors.primary,
          shadowOpacity: isDark ? 0.3 : 0.35,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
          elevation: 6,
          overflow: 'visible',
        },
        style,
      ]}
    >
      {variant === 'primary' ? (
        <LinearGradient colors={colors.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: radius.lg }}>
          {content}
        </LinearGradient>
      ) : (
        <View
          style={{
            borderRadius: radius.lg,
            backgroundColor: variant === 'secondary' ? colors.card : variant === 'danger' ? colors.dangerSoft : 'transparent',
            borderWidth: variant === 'secondary' ? 1 : 0,
            borderColor: colors.borderStrong,
          }}
        >
          {content}
        </View>
      )}
    </ScalePressable>
  );
}

export function IconButton({
  icon,
  onPress,
  label,
  tone = 'default',
  size = 42,
}: {
  icon: IconName;
  onPress?: () => void;
  label: string;
  tone?: 'default' | 'primary';
  size?: number;
}) {
  const { colors } = useAppTheme();
  return (
    <ScalePressable
      onPress={onPress}
      accessibilityLabel={label}
      hitSlop={6}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: tone === 'primary' ? colors.primarySoft : colors.card,
        borderWidth: tone === 'primary' ? 0 : 1,
        borderColor: colors.border,
      }}
    >
      <Icon name={icon} size={20} color={tone === 'primary' ? colors.primaryText : colors.text} />
    </ScalePressable>
  );
}
