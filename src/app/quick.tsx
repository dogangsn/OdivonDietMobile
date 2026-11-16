import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/theme/theme';
import type { Tone } from '@/theme/tokens';
import { Card, Icon, IconTile, ScalePressable, Text, type IconName } from '@/ui';

const ACTIONS: { icon: IconName; tone: Tone; title: string; body: string; to: '/client/new' | '/consultation/new' | '/(tabs)/clients' | '/(tabs)/messages' }[] = [
  { icon: 'person-add-outline', tone: 'primary', title: 'Yeni danışan', body: 'Kayıt ve başlangıç ölçüsü', to: '/client/new' },
  { icon: 'calendar-outline', tone: 'info', title: 'Görüşme planla', body: 'Yüz yüze, video veya telefon', to: '/consultation/new' },
  { icon: 'scale-outline', tone: 'positive', title: 'Ölçüm gir', body: 'Danışan seçip kilo ekle', to: '/(tabs)/clients' },
  { icon: 'chatbubbles-outline', tone: 'warning', title: 'Mesaj gönder', body: 'Danışan sohbetleri', to: '/(tabs)/messages' },
];

export default function Quick() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, justifyContent: 'flex-end' }}>
      <Pressable style={{ position: 'absolute', inset: 0, backgroundColor: colors.overlay }} onPress={() => router.back()} accessibilityLabel="Kapat" />
      <View style={{ backgroundColor: colors.bg, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 20, paddingBottom: insets.bottom + 20, gap: 12 }}>
        <View style={{ alignItems: 'center', marginBottom: 4 }}>
          <View style={{ width: 40, height: 5, borderRadius: 3, backgroundColor: colors.borderStrong }} />
        </View>
        <Text variant="title">Hızlı işlem</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {ACTIONS.map((a) => (
            <Card
              key={a.title}
              onPress={() => {
                router.back();
                setTimeout(() => router.push(a.to), 60);
              }}
              accessibilityLabel={a.title}
              style={{ width: '47.8%', gap: 12 }}
            >
              <IconTile name={a.icon} tone={a.tone} />
              <View style={{ gap: 2 }}>
                <Text variant="bodyStrong">{a.title}</Text>
                <Text variant="caption" tone="muted">
                  {a.body}
                </Text>
              </View>
            </Card>
          ))}
        </View>
        <ScalePressable onPress={() => router.back()} accessibilityLabel="Vazgeç" style={{ alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10 }}>
          <Icon name="close" size={18} color={colors.textMuted} />
          <Text tone="muted" weight="semibold">
            Vazgeç
          </Text>
        </ScalePressable>
      </View>
    </View>
  );
}
