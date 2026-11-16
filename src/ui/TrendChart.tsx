import { useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Line, Path, Stop } from 'react-native-svg';
import { useAppTheme } from '@/theme/theme';
import { Text } from './Text';

export interface TrendPoint {
  label: string;
  value: number;
}

/** Smooth area chart for weight trends, with an optional dashed target line. */
export function TrendChart({ points, target, height = 150, unit = 'kg' }: { points: TrendPoint[]; target?: number; height?: number; unit?: string }) {
  const { colors } = useAppTheme();
  const [width, setWidth] = useState(0);
  if (points.length < 2)
    return (
      <View style={{ height, alignItems: 'center', justifyContent: 'center' }}>
        <Text tone="subtle" variant="caption">
          Grafik için en az iki ölçüm gerekli
        </Text>
      </View>
    );
  const values = points.map((p) => p.value).concat(target !== undefined ? [target] : []);
  const min = Math.min(...values) - 1;
  const max = Math.max(...values) + 1;
  const padX = 8;
  const padTop = 12;
  const padBottom = 22;
  const innerH = height - padTop - padBottom;
  const x = (i: number) => padX + (i / (points.length - 1)) * (width - padX * 2);
  const y = (v: number) => padTop + (1 - (v - min) / (max - min)) * innerH;
  const coords = points.map((p, i) => [x(i), y(p.value)] as const);
  let line = `M ${coords[0]![0]} ${coords[0]![1]}`;
  for (let i = 1; i < coords.length; i++) {
    const [px, py] = coords[i - 1]!;
    const [cx, cy] = coords[i]!;
    const mx = (px + cx) / 2;
    line += ` C ${mx} ${py}, ${mx} ${cy}, ${cx} ${cy}`;
  }
  const area = `${line} L ${coords[coords.length - 1]![0]} ${padTop + innerH} L ${coords[0]![0]} ${padTop + innerH} Z`;
  const last = coords[coords.length - 1]!;
  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={{ height }}>
      {width > 0 ? (
        <>
          <Svg width={width} height={height}>
            <Defs>
              <LinearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={colors.primary} stopOpacity={0.28} />
                <Stop offset="1" stopColor={colors.primary} stopOpacity={0} />
              </LinearGradient>
              <LinearGradient id="stroke" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor="#6366F1" />
                <Stop offset="1" stopColor="#9333EA" />
              </LinearGradient>
            </Defs>
            {target !== undefined ? (
              <Line x1={padX} x2={width - padX} y1={y(target)} y2={y(target)} stroke={colors.positive} strokeWidth={1.5} strokeDasharray="5 5" />
            ) : null}
            <Path d={area} fill="url(#area)" />
            <Path d={line} stroke="url(#stroke)" strokeWidth={3} fill="none" strokeLinecap="round" />
            <Circle cx={last[0]} cy={last[1]} r={6} fill={colors.card} stroke={colors.primary} strokeWidth={3} />
          </Svg>
          <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 2 }}>
            <Text variant="caption" tone="subtle" style={{ fontSize: 11 }}>
              {points[0]!.label}
            </Text>
            <Text variant="caption" tone="subtle" style={{ fontSize: 11 }}>
              {points[points.length - 1]!.label}
            </Text>
          </View>
          {target !== undefined ? (
            <View style={{ position: 'absolute', right: padX, top: Math.max(0, y(target) - 20) }}>
              <Text variant="caption" color={colors.positive} weight="bold" style={{ fontSize: 11 }}>
                Hedef {target} {unit}
              </Text>
            </View>
          ) : null}
        </>
      ) : null}
    </View>
  );
}
