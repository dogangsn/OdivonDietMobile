import { View } from 'react-native';
import { useAppTheme } from '@/theme/theme';
import { toneColors, type Tone } from '@/theme/tokens';
import { Icon, type IconName } from './Icon';

/** Pastel rounded square with an icon, as on the web KPI cards. */
export function IconTile({ name, tone = 'primary', size = 44 }: { name: IconName; tone?: Tone; size?: number }) {
  const { colors } = useAppTheme();
  const t = toneColors(colors, tone);
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.32,
        backgroundColor: t.bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon name={name} size={size * 0.48} color={t.fg} />
    </View>
  );
}
