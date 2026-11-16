import { router } from 'expo-router';
import { useDeferredValue, useState } from 'react';
import { View } from 'react-native';
import { useClients } from '@/features/queries';
import { ago, kg, PROGRAM_LABELS } from '@/lib/format';
import { useAppTheme } from '@/theme/theme';
import { Avatar, Card, Chips, EmptyState, IconButton, Input, Pill, ProgressBar, Screen, Skeleton, Text } from '@/ui';

const FILTERS = [
  { value: '', label: 'Tümü' },
  { value: 'active', label: 'Aktif' },
  { value: 'paused', label: 'Duraklatıldı' },
  { value: 'archived', label: 'Arşiv' },
] as const;

export default function Clients() {
  const { colors } = useAppTheme();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<(typeof FILTERS)[number]['value']>('');
  const deferred = useDeferredValue(search);
  const { data, isLoading, refetch, isRefetching } = useClients(deferred, status || undefined);

  return (
    <Screen
      tabBar
      title="Danışanlar"
      subtitle={data ? `${data.length} danışan` : ' '}
      refreshing={isRefetching}
      onRefresh={refetch}
      right={<IconButton icon="person-add-outline" label="Yeni danışan" tone="primary" onPress={() => router.push('/client/new')} />}
    >
      <Input icon="search" placeholder="İsim veya telefon ara" value={search} onChangeText={setSearch} autoCorrect={false} clearButtonMode="while-editing" />
      <Chips value={status} options={FILTERS} onChange={setStatus} />
      {isLoading ? (
        <View style={{ gap: 12 }}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} height={96} radius={26} />
          ))}
        </View>
      ) : data && data.length ? (
        data.map((c) => {
          const name = `${c.firstName} ${c.lastName}`;
          const diff = Math.round((c.currentWeightKg - c.startWeightKg) * 10) / 10;
          return (
            <Card key={c.id} onPress={() => router.push(`/client/${c.id}`)} style={{ gap: 14 }} accessibilityLabel={name}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Avatar name={name} size={48} />
                <View style={{ flex: 1, gap: 3 }}>
                  <Text variant="heading" numberOfLines={1}>
                    {name}
                  </Text>
                  <Text variant="caption" tone="muted" numberOfLines={1}>
                    {PROGRAM_LABELS[c.program]} · Son ölçüm {ago(c.lastMeasuredAt)}
                  </Text>
                </View>
                {c.status !== 'active' ? (
                  <Pill label={c.status === 'paused' ? 'Duraklatıldı' : 'Arşiv'} tone="neutral" />
                ) : (
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text variant="bodyStrong" weight="extrabold">
                      {kg(c.currentWeightKg)} <Text variant="caption" tone="subtle">kg</Text>
                    </Text>
                    <Text variant="caption" weight="bold" color={diff <= 0 ? colors.positive : colors.info}>
                      {diff > 0 ? '+' : ''}
                      {kg(diff)} kg
                    </Text>
                  </View>
                )}
              </View>
              <View style={{ gap: 6 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text variant="caption" tone="muted">
                    Hedef {kg(c.targetWeightKg)} kg
                  </Text>
                  <Text variant="caption" weight="bold">
                    %{c.goalProgressPct ?? 0}
                  </Text>
                </View>
                <ProgressBar value={c.goalProgressPct ?? 0} />
              </View>
            </Card>
          );
        })
      ) : (
        <EmptyState icon="people-outline" title={search ? 'Sonuç bulunamadı' : 'Henüz danışan yok'} body={search ? 'Farklı bir isim deneyin.' : 'Sağ üstteki butonla ilk danışanınızı ekleyin.'} />
      )}
    </Screen>
  );
}
