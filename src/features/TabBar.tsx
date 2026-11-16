import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Platform, View } from 'react-native';
import { useAppTheme } from '@/theme/theme';
import { Icon, type IconName } from '@/ui/Icon';
import { ScalePressable } from '@/ui/Pressable';
import { Text } from '@/ui/Text';
import { useConversations, useTasks } from './queries';

const TABS: Record<string, { label: string; icon: IconName; active: IconName }> = {
  index: { label: 'Bugün', icon: 'sunny-outline', active: 'sunny' },
  clients: { label: 'Danışanlar', icon: 'people-outline', active: 'people' },
  messages: { label: 'Mesajlar', icon: 'chatbubbles-outline', active: 'chatbubbles' },
  tasks: { label: 'İşler', icon: 'checkbox-outline', active: 'checkbox' },
};

/** Floating, frosted tab bar with a gradient "+" button in the middle (as in redesign/mobile.png). */
export function TabBar({ state, navigateToTab, insets }: BottomTabBarProps) {
  const { colors, isDark } = useAppTheme();
  const unread = (useConversations().data ?? []).reduce((s, c) => s + c.unreadForStaff, 0);
  const openTasks = useTasks('open').data?.length ?? 0;
  const badges: Record<string, number> = { messages: unread, tasks: openTasks };
  const routes = state.routes.filter((r) => TABS[r.name]);
  const left = routes.slice(0, 2);
  const right = routes.slice(2);

  const renderTab = (route: (typeof routes)[number]) => {
    const meta = TABS[route.name]!;
    const focused = state.routes[state.index]?.key === route.key;
    const badge = badges[route.name] ?? 0;
    return (
      <ScalePressable
        key={route.key}
        onPress={() => navigateToTab(route.key)}
        accessibilityRole="tab"
        accessibilityState={{ selected: focused }}
        accessibilityLabel={badge ? `${meta.label}, ${badge} yeni` : meta.label}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, paddingVertical: 8 }}
      >
        <View>
          <Icon name={focused ? meta.active : meta.icon} size={23} color={focused ? colors.primaryText : colors.textSubtle} />
          {badge > 0 ? (
            <View
              style={{
                position: 'absolute',
                top: -4,
                right: -10,
                minWidth: 18,
                height: 18,
                paddingHorizontal: 4,
                borderRadius: 9,
                backgroundColor: colors.danger,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: colors.card,
              }}
            >
              <Text color="#FFF" weight="bold" style={{ fontSize: 10, lineHeight: 12 }}>
                {badge > 9 ? '9+' : badge}
              </Text>
            </View>
          ) : null}
        </View>
        <Text variant="caption" weight={focused ? 'bold' : 'semibold'} color={focused ? colors.primaryText : colors.textSubtle} style={{ fontSize: 11, lineHeight: 14 }}>
          {meta.label}
        </Text>
      </ScalePressable>
    );
  };

  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingBottom: Math.max(insets.bottom, 12) }}>
      <View
        style={{
          borderRadius: 28,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: colors.border,
          shadowColor: colors.shadow,
          shadowOpacity: isDark ? 0.5 : 0.12,
          shadowRadius: 24,
          shadowOffset: { width: 0, height: 10 },
          elevation: 12,
          backgroundColor: Platform.OS === 'android' ? colors.card : 'transparent',
        }}
      >
        {Platform.OS === 'ios' ? <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} style={{ position: 'absolute', inset: 0 }} /> : null}
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.tabBar, paddingHorizontal: 6, height: 68 }}>
          {left.map(renderTab)}
          <View style={{ width: 72 }} />
          {right.map(renderTab)}
        </View>
      </View>
      <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, top: -18, alignItems: 'center' }}>
        <ScalePressable
          onPress={() => router.push('/quick')}
          accessibilityLabel="Hızlı ekle"
          scaleTo={0.92}
          style={{
            borderRadius: 22,
            shadowColor: colors.primary,
            shadowOpacity: 0.45,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 8 },
            elevation: 10,
          }}
        >
          <LinearGradient
            colors={colors.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ width: 62, height: 62, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: colors.bg }}
          >
            <Icon name="add" size={30} color="#FFFFFF" />
          </LinearGradient>
        </ScalePressable>
      </View>
    </View>
  );
}
