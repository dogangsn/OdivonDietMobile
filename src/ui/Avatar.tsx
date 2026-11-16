import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';
import { Text } from './Text';

const GRADIENTS: readonly (readonly [string, string])[] = [
  ['#F472B6', '#E11D48'],
  ['#818CF8', '#6D28D9'],
  ['#34D399', '#059669'],
  ['#FBBF24', '#EA580C'],
  ['#38BDF8', '#2563EB'],
  ['#C084FC', '#9333EA'],
];

function hash(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function initials(name: string): string {
  return name
    .replace(/^(Dyt|Dr|Uzm)\.?\s+/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toLocaleUpperCase('tr-TR'))
    .join('');
}

export function Avatar({ name, size = 44, ring }: { name: string; size?: number; ring?: string }) {
  const colors = GRADIENTS[hash(name) % GRADIENTS.length]!;
  return (
    <View style={ring ? { padding: 2, borderRadius: size, borderWidth: 2, borderColor: ring } : undefined}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }}
      >
        <Text color="#FFFFFF" weight="bold" style={{ fontSize: size * 0.36, lineHeight: size * 0.44 }}>
          {initials(name)}
        </Text>
      </LinearGradient>
    </View>
  );
}
