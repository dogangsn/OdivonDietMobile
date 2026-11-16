import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';

/** OdivonDiet mark: leaf-drop in a gradient squircle. */
export function Logo({ size = 48, light }: { size?: number; light?: boolean }) {
  return (
    <LinearGradient
      colors={light ? ['#FFFFFF', '#EDE9FE'] : ['#34D399', '#059669']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ width: size, height: size, borderRadius: size * 0.3, alignItems: 'center', justifyContent: 'center' }}
    >
      <Svg width={size * 0.56} height={size * 0.56} viewBox="0 0 24 24">
        <Path
          d="M12 3c3.9 3.2 6 6.4 6 9.6A6 6 0 0 1 12 18.6a6 6 0 0 1-6-6C6 9.4 8.1 6.2 12 3Z"
          fill={light ? '#7C3AED' : '#FFFFFF'}
        />
        <Path d="M12 9.5v11" stroke={light ? '#FFFFFF' : '#059669'} strokeWidth={1.6} strokeLinecap="round" />
        <Path d="M12 14.2l2.4-2.2" stroke={light ? '#FFFFFF' : '#059669'} strokeWidth={1.6} strokeLinecap="round" />
      </Svg>
    </LinearGradient>
  );
}
