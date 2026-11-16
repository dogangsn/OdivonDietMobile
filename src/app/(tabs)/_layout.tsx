import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { useSession } from '@/auth/session';
import { TabBar } from '@/features/TabBar';
import { useAppTheme } from '@/theme/theme';

export default function TabsLayout() {
  const mode = useSession((s) => s.mode);
  const { colors } = useAppTheme();
  if (!mode) return <Redirect href="/login" />;
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.bg } }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="clients" />
      <Tabs.Screen name="messages" />
      <Tabs.Screen name="tasks" />
    </Tabs>
  );
}
