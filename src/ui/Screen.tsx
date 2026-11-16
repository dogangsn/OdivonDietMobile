import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { RefreshControl, ScrollView, View, type ScrollViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/theme/theme';
import { IconButton } from './Button';
import { Text } from './Text';

export interface ScreenProps extends Omit<ScrollViewProps, 'refreshControl'> {
  title?: string;
  eyebrow?: string;
  subtitle?: string;
  right?: ReactNode;
  back?: boolean;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  /** Extra bottom space for the floating tab bar. */
  tabBar?: boolean;
  children?: ReactNode;
}

export function Screen({ title, eyebrow, subtitle, right, back, scroll = true, refreshing, onRefresh, tabBar, children, contentContainerStyle, ...rest }: ScreenProps) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const header =
    title || back || right ? (
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 20, paddingBottom: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 42 }}>
          {back ? <IconButton icon="chevron-back" label="Geri" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} /> : <View />}
          <View style={{ flexDirection: 'row', gap: 10 }}>{right}</View>
        </View>
        {eyebrow ? (
          <Text variant="caption" tone="primary" weight="bold" style={{ marginTop: back ? 14 : 4 }}>
            {eyebrow}
          </Text>
        ) : null}
        {title ? (
          <Text variant="display" style={{ marginTop: eyebrow ? 2 : back ? 14 : 4 }} accessibilityRole="header">
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text tone="muted" style={{ marginTop: 6 }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    ) : (
      <View style={{ height: insets.top }} />
    );
  const bottom = insets.bottom + (tabBar ? 110 : 32);
  if (!scroll)
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        {header}
        <View style={[{ flex: 1 }, contentContainerStyle]}>{children}</View>
      </View>
    );
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={[{ paddingBottom: bottom }, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.primary} /> : undefined}
      {...rest}
    >
      {header}
      <View style={{ paddingHorizontal: 20, gap: 16, paddingTop: 8 }}>{children}</View>
    </ScrollView>
  );
}

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  const { colors } = useAppTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
      <Text variant="heading">{title}</Text>
      {action ? (
        <Text
          variant="caption"
          weight="bold"
          color={colors.primaryText}
          onPress={onAction}
          accessibilityRole="link"
          style={{ backgroundColor: colors.primarySoft, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, overflow: 'hidden' }}
        >
          {action}
        </Text>
      ) : null}
    </View>
  );
}
