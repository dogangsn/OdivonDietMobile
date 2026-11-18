import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/theme/theme';
import { IconButton } from './Button';
import { KeyboardSafe } from './KeyboardSafe';
import { Text } from './Text';

/** Sheet-like form screen: title, close button, scrollable body and a sticky footer. */
export function ModalScreen({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: ReactNode; footer?: ReactNode }) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const top = Platform.OS === 'ios' ? 12 : insets.top + 8;
  return (
    <KeyboardSafe style={{ flex: 1, backgroundColor: colors.bg }}>
      {Platform.OS === 'ios' ? (
        <View style={{ alignItems: 'center', paddingTop: 8 }}>
          <View style={{ width: 40, height: 5, borderRadius: 3, backgroundColor: colors.borderStrong }} />
        </View>
      ) : null}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: top, gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text variant="title" accessibilityRole="header">
            {title}
          </Text>
          {subtitle ? (
            <Text tone="muted" style={{ marginTop: 4 }}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        <IconButton icon="close" label="Kapat" onPress={() => router.back()} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 32 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
      {footer ? (
        <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: insets.bottom + 12, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.bgElevated }}>
          {footer}
        </View>
      ) : null}
    </KeyboardSafe>
  );
}
