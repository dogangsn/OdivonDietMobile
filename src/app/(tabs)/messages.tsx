import { router } from 'expo-router';
import { View } from 'react-native';
import { useConversations } from '@/features/queries';
import { relative } from '@/lib/format';
import { useAppTheme } from '@/theme/theme';
import { Avatar, Card, CountBadge, EmptyState, Icon, IconButton, Screen, Skeleton, Text } from '@/ui';

export default function Messages() {
  const { colors } = useAppTheme();
  const { data, isLoading, refetch, isRefetching } = useConversations();
  const unread = (data ?? []).reduce((s, c) => s + c.unreadForStaff, 0);
  return (
    <Screen tabBar title="Mesajlar" subtitle={unread ? `${unread} okunmamış mesaj` : 'Tüm mesajlar okundu'} refreshing={isRefetching} onRefresh={refetch} right={<IconButton icon="create-outline" label="Yeni mesaj" tone="primary" onPress={() => router.push('/chat/new')} />}>
      {isLoading ? (
        [0, 1, 2].map((i) => <Skeleton key={i} height={78} radius={26} />)
      ) : data && data.length ? (
        <Card padded={false} style={{ paddingVertical: 6 }}>
          {data.map((c, i) => {
            const isUnread = c.unreadForStaff > 0;
            return (
              <Card
                key={c.clientId}
                padded={false}
                onPress={() => router.push(`/chat/${c.clientId}`)}
                accessibilityLabel={`${c.clientName}, ${isUnread ? `${c.unreadForStaff} okunmamış` : 'okundu'}`}
                style={{ borderWidth: 0, shadowOpacity: 0, elevation: 0, borderRadius: 0, backgroundColor: 'transparent' }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: i < data.length - 1 ? 1 : 0, borderBottomColor: colors.border }}>
                  <View>
                    <Avatar name={c.clientName} size={50} />
                    {isUnread ? <View style={{ position: 'absolute', right: 0, bottom: 0, width: 14, height: 14, borderRadius: 7, backgroundColor: colors.positive, borderWidth: 2, borderColor: colors.card }} /> : null}
                  </View>
                  <View style={{ flex: 1, gap: 3 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <Text variant="bodyStrong" weight={isUnread ? 'extrabold' : 'semibold'} numberOfLines={1} style={{ flex: 1 }}>
                        {c.clientName}
                      </Text>
                      <Text variant="caption" color={isUnread ? colors.primaryText : colors.textSubtle} weight={isUnread ? 'bold' : 'medium'}>
                        {relative(c.lastMessageAt)}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      {c.lastAuthor === 'dietitian' ? <Icon name="checkmark-done" size={15} color={colors.textSubtle} /> : null}
                      <Text variant="caption" color={isUnread ? colors.text : colors.textMuted} weight={isUnread ? 'semibold' : 'regular'} numberOfLines={1} style={{ flex: 1 }}>
                        {c.lastMessagePreview}
                      </Text>
                      <CountBadge count={c.unreadForStaff} />
                    </View>
                  </View>
                </View>
              </Card>
            );
          })}
        </Card>
      ) : (
        <EmptyState icon="chatbubbles-outline" title="Henüz mesaj yok" body="Sağ üstteki kalem simgesiyle bir danışan seçip mesaj başlatın." />
      )}
    </Screen>
  );
}
