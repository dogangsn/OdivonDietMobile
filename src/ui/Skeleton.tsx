import { useEffect, useRef } from 'react';
import { Animated, Platform, type DimensionValue } from 'react-native';
import { useAppTheme } from '@/theme/theme';

export function Skeleton({ height = 16, width = '100%', radius = 10 }: { height?: number; width?: DimensionValue; radius?: number }) {
  const { colors } = useAppTheme();
  const opacity = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(opacity, { toValue: 0.5, duration: 700, useNativeDriver: Platform.OS !== 'web' }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);
  return <Animated.View style={{ height, width, borderRadius: radius, backgroundColor: colors.cardMuted, opacity }} />;
}
