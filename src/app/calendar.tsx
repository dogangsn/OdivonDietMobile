import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useConsultations, useUpdateConsultation } from '@/features/queries';
import { CHANNEL, sameDay, time } from '@/lib/format';
import { useAppTheme } from '@/theme/theme';
import { Avatar, Card, EmptyState, IconButton, Pill, ScalePressable, Screen, Text } from '@/ui';

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export default function Calendar() {
  const { colors } = useAppTheme();
  const today = startOfDay(new Date());
  const [selected, setSelected] = useState(today);
  const days = useMemo(() => Array.from({ length: 14 }, (_, i) => new Date(today.getTime() + (i - 3) * 86_400_000)), [today.getTime()]);
  const from = days[0]!.toISOString();
  const to = new Date(days[days.length - 1]!.getTime() + 86_400_000).toISOString();
  const { data, refetch, isRefetching } = useConsultations(from, to);
  const update = useUpdateConsultation();
  const items = (data ?? []).filter((c) => sameDay(new Date(c.at), selected));
  const busy = new Set((data ?? []).filter((c) => c.status !== 'cancelled').map((c) => startOfDay(new Date(c.at)).getTime()));

  return (
    <Screen
      back
      title="Takvim"
      subtitle={selected.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
      refreshing={isRefetching}
      onRefresh={refetch}
      right={<IconButton icon="add" label="Görüşme planla" tone="primary" onPress={() => router.push('/consultation/new')} />}
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 20 }} style={{ marginHorizontal: -20, paddingLeft: 20 }} contentOffset={{ x: 150, y: 0 }}>
        {days.map((d) => {
          const active = sameDay(d, selected);
          const isToday = sameDay(d, today);
          return (
            <ScalePressable
              key={d.toISOString()}
              onPress={() => setSelected(d)}
              accessibilityLabel={d.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
              accessibilityState={{ selected: active }}
              style={{ width: 58, paddingVertical: 12, borderRadius: 20, alignItems: 'center', gap: 4, backgroundColor: active ? colors.primary : colors.card, borderWidth: 1, borderColor: active ? colors.primary : isToday ? colors.primary + '66' : colors.border }}
            >
              <Text variant="caption" weight="semibold" color={active ? 'rgba(255,255,255,0.8)' : colors.textSubtle} style={{ fontSize: 12 }}>
                {d.toLocaleDateString('tr-TR', { weekday: 'short' })}
              </Text>
              <Text variant="title" color={active ? '#FFFFFF' : colors.text} style={{ fontSize: 20 }}>
                {d.getDate()}
              </Text>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: busy.has(d.getTime()) ? (active ? '#FFFFFF' : colors.primary) : 'transparent' }} />
            </ScalePressable>
          );
        })}
      </ScrollView>
      {items.length ? (
        items.map((c) => {
          const ch = CHANNEL[c.channel];
          return (
            <Card key={c.id} onPress={() => router.push(`/client/${c.clientId}`)} style={{ gap: 14, opacity: c.status === 'cancelled' ? 0.55 : 1 }} accessibilityLabel={`${time(c.at)} ${c.clientName}`}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ alignItems: 'center', width: 54 }}>
                  <Text variant="heading">{time(c.at)}</Text>
                  <Text variant="caption" tone="subtle">
                    {c.durationMin} dk
                  </Text>
                </View>
                <View style={{ width: 3, alignSelf: 'stretch', borderRadius: 2, backgroundColor: c.status === 'done' ? colors.positive : colors.primary }} />
                <Avatar name={c.clientName ?? '?'} size={42} />
                <View style={{ flex: 1 }}>
                  <Text variant="bodyStrong" numberOfLines={1}>
                    {c.clientName}
                  </Text>
                  <Text variant="caption" tone="muted">
                    {ch.label}
                  </Text>
                </View>
                {c.status === 'done' ? <Pill label="Yapıldı" tone="positive" icon="checkmark" /> : c.status === 'cancelled' ? <Pill label="İptal" /> : null}
              </View>
              {c.status === 'scheduled' ? (
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <ScalePressable onPress={() => update.mutate({ id: c.id, status: 'cancelled' })} accessibilityLabel="İptal et" style={{ flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 14, backgroundColor: colors.cardMuted }}>
                    <Text variant="caption" weight="bold" tone="muted">
                      İptal et
                    </Text>
                  </ScalePressable>
                  <ScalePressable onPress={() => update.mutate({ id: c.id, status: 'done' })} accessibilityLabel="Tamamlandı" style={{ flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 14, backgroundColor: colors.positiveSoft }}>
                    <Text variant="caption" weight="bold" color={colors.positive}>
                      Tamamlandı
                    </Text>
                  </ScalePressable>
                </View>
              ) : null}
            </Card>
          );
        })
      ) : (
        <EmptyState icon="calendar-outline" title="Bu gün boş" body="Sağ üstteki + ile görüşme planlayabilirsiniz." />
      )}
    </Screen>
  );
}
