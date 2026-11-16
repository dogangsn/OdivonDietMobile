import { Text as RNText, type TextProps, type TextStyle } from 'react-native';
import { useAppTheme } from '@/theme/theme';
import { font } from '@/theme/tokens';

type Variant = 'display' | 'title' | 'heading' | 'body' | 'bodyStrong' | 'caption' | 'overline' | 'metric';

const variants: Record<Variant, TextStyle> = {
  display: { fontFamily: font.extrabold, fontSize: 30, lineHeight: 36, letterSpacing: -0.8 },
  title: { fontFamily: font.bold, fontSize: 22, lineHeight: 28, letterSpacing: -0.4 },
  heading: { fontFamily: font.bold, fontSize: 17, lineHeight: 22, letterSpacing: -0.2 },
  body: { fontFamily: font.regular, fontSize: 15, lineHeight: 21 },
  bodyStrong: { fontFamily: font.semibold, fontSize: 15, lineHeight: 21 },
  caption: { fontFamily: font.medium, fontSize: 13, lineHeight: 18 },
  overline: { fontFamily: font.bold, fontSize: 11, lineHeight: 14, letterSpacing: 1.1 },
  metric: { fontFamily: font.extrabold, fontSize: 32, lineHeight: 36, letterSpacing: -1 },
};

export interface AppTextProps extends TextProps {
  variant?: Variant;
  color?: string;
  tone?: 'default' | 'muted' | 'subtle' | 'primary' | 'inverse';
  weight?: keyof typeof font;
  align?: TextStyle['textAlign'];
}

export function Text({ variant = 'body', color, tone = 'default', weight, align, style, children, ...rest }: AppTextProps) {
  // Turkish-aware upper case (i → İ), which CSS/RN textTransform gets wrong.
  const content = variant === 'overline' && typeof children === 'string' ? children.toLocaleUpperCase('tr-TR') : children;
  const { colors } = useAppTheme();
  const toneColor =
    tone === 'muted'
      ? colors.textMuted
      : tone === 'subtle'
        ? colors.textSubtle
        : tone === 'primary'
          ? colors.primaryText
          : tone === 'inverse'
            ? '#FFFFFF'
            : colors.text;
  return (
    <RNText
      maxFontSizeMultiplier={1.4}
      style={[
        variants[variant],
        { color: color ?? toneColor },
        weight ? { fontFamily: font[weight] } : null,
        align ? { textAlign: align } : null,
        style,
      ]}
      {...rest}
    >
      {content}
    </RNText>
  );
}
