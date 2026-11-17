import { View } from 'react-native';
import Svg, { Ellipse, G } from 'react-native-svg';

/** Odivon mark: the slanted violet "O" on a navy tile (same as the app icon). */
export function Logo({ size = 48, light }: { size?: number; light?: boolean }) {
  const tile = light ? '#FFFFFF' : '#101828';
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.26, backgroundColor: tile, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox="0 0 150 150">
        <G transform="rotate(125.2 75 75)">
          <Ellipse cx={75} cy={75} rx={56} ry={46.7} fill="#917AFF" />
          <Ellipse cx={75} cy={75} rx={33.1} ry={23.6} fill={tile} />
        </G>
      </Svg>
    </View>
  );
}
