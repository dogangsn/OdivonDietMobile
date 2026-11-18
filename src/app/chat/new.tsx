import { router } from 'expo-router';
import { useDeferredValue, useState } from 'react';
import { View } from 'react-native';
import { useClients } from '@/features/queries';
import { PROGRAM_LABELS } from '@/lib/format';
import { useAppTheme } from '@/theme/theme';
import { Avatar, Card, EmptyState, Icon, Input, ModalScreen, Skeleton, Text } from '@/ui';

/** Pick a client to start (or continue) a conversation with. */
export default function NewMessage() {
  const { colors } = useAppTheme();
  const [search, setSearch] = useState('');
  const deferred = useDeferredValue(search);
  const { data, isLoading } = useClients(deferred, 'active');

  return (
    <ModalScreen title="Yeni mesaj" subtitle="Mesaj göndermek istediğiniz danışanı seçin.">
      <Input icon="search" placeholder="İsim veya telefon ara" value={search} onChangeText={setSearch} autoCorrect={false} autoFocus />
      {isLoading ? (
        [0, 1, 2].map((i) => <Skeleton key={i} height={64} radius={20} />)
      ) : data && data.length ? (
        <Card padded={false} style={{ paddingVertical: 4 }}>
          {data.map((c, i) => (
            <Card
              key={c.id}
              padded={false}
              onPress={() => router.replace(`/chat/${c.id}`)}
              accessibilityLabel={`${`${c.firstName} ${c.lastName}`} ile mesajlaş`}
              style={{ borderWidth: 0, shadowOpacity: 0, elevation: 0, borderRadius: 0, backgroundColor: 'transparent' }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: i < data.length - 1 ? 1 : 0, borderBottomColor: colors.border }}>
                <Avatar name={`${c.firstName} ${c.lastName}`} size={42} />
                <View style={{ flex: 1 }}>
                  <Text variant="bodyStrong" numberOfLines={1}>
                    {`${c.firstName} ${c.lastName}`}
                  </Text>
                  <Text variant="caption" tone="muted" numberOfLines={1}>
                    {PROGRAM_LABELS[c.program] ?? c.program}
                  </Text>
                </View>
                <Icon name="chatbubble-ellipses-outline" size={20} color={colors.primaryText} />
              </View>
            </Card>
          ))}
        </Card>
      ) : (
        <EmptyState icon="people-outline" title="Danışan bulunamadı" body={search ? 'Aramanızı değiştirip tekrar deneyin.' : 'Önce Danışanlar sekmesinden danışan ekleyin.'} />
      )}
    </ModalScreen>
  );
}
