import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useRequests, useTasks, useToggleTask, useUpdateRequest } from '@/features/queries';
import { ago, dayMonth, REQUEST_STATUS, REQUEST_TYPE, TASK_CATEGORY } from '@/lib/format';
import { useAppTheme } from '@/theme/theme';
import { Avatar, Button, Card, EmptyState, Icon, IconTile, Pill, ScalePressable, Screen, Segmented, Skeleton, Text } from '@/ui';

export default function Work() {
  const [tab, setTab] = useState<'requests' | 'tasks'>('requests');
  const requests = useRequests();
  const tasks = useTasks();
  const openRequests = (requests.data ?? []).filter((r) => r.status === 'open' || r.status === 'in_progress');
  const openTasks = (tasks.data ?? []).filter((t) => t.status === 'open');
  return (
    <Screen
      tabBar
      title="İşler"
      subtitle="Danışan talepleri ve verdiğiniz görevler"
      refreshing={requests.isRefetching || tasks.isRefetching}
      onRefresh={() => {
        requests.refetch();
        tasks.refetch();
      }}
    >
      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          { value: 'requests', label: 'Talepler', count: openRequests.length },
          { value: 'tasks', label: 'Görevler', count: openTasks.length },
        ]}
      />
      {tab === 'requests' ? <Requests /> : <Tasks />}
    </Screen>
  );
}

function Requests() {
  const { colors } = useAppTheme();
  const { data, isLoading } = useRequests();
  const update = useUpdateRequest();
  if (isLoading) return <Skeleton height={140} radius={26} />;
  if (!data?.length) return <EmptyState icon="mail-open-outline" title="Talep yok" body="Danışanlarınız portaldan talep gönderdiğinde burada görünür." />;
  return (
    <>
      {data.map((r) => {
        const status = REQUEST_STATUS[r.status];
        const open = r.status === 'open' || r.status === 'in_progress';
        return (
          <Card key={r.id} style={{ gap: 14, opacity: open ? 1 : 0.7 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <IconTile name={REQUEST_TYPE[r.type].icon} tone={r.type === 'appointment' ? 'info' : 'warning'} />
              <View style={{ flex: 1 }}>
                <Text variant="heading" numberOfLines={1}>
                  {r.subject}
                </Text>
                <Text variant="caption" tone="muted">
                  {REQUEST_TYPE[r.type].label} · {ago(r.createdAt)}
                </Text>
              </View>
              <Pill label={status.label} tone={status.tone} />
            </View>
            {r.detail ? <Text tone="muted">{r.detail}</Text> : null}
            {r.preferredDate ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.infoSoft, padding: 10, borderRadius: 14 }}>
                <Icon name="time-outline" size={16} color={colors.info} />
                <Text variant="caption" color={colors.info} weight="semibold">
                  Tercih: {dayMonth(r.preferredDate)} {r.preferredTime ?? ''}
                </Text>
              </View>
            ) : null}
            <ScalePressable onPress={() => router.push(`/client/${r.clientId}`)} accessibilityLabel={r.clientName ?? ''} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Avatar name={r.clientName ?? '?'} size={26} />
              <Text variant="caption" weight="semibold">
                {r.clientName}
              </Text>
            </ScalePressable>
            {open ? (
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Button label="Reddet" variant="secondary" style={{ flex: 1 }} onPress={() => update.mutate({ id: r.id, status: 'rejected' })} />
                {r.type === 'appointment' ? (
                  <Button label="Randevu ver" icon="calendar-outline" style={{ flex: 1.4 }} onPress={() => {
                    update.mutate({ id: r.id, status: 'resolved', response: 'Randevunuz oluşturuldu.' });
                    router.push({ pathname: '/consultation/new', params: { clientId: r.clientId } });
                  }} />
                ) : (
                  <Button label="Çözüldü" icon="checkmark" style={{ flex: 1.4 }} onPress={() => update.mutate({ id: r.id, status: 'resolved' })} />
                )}
              </View>
            ) : null}
          </Card>
        );
      })}
    </>
  );
}

function Tasks() {
  const { colors } = useAppTheme();
  const { data, isLoading } = useTasks();
  const toggle = useToggleTask();
  if (isLoading) return <Skeleton height={140} radius={26} />;
  if (!data?.length) return <EmptyState icon="checkbox-outline" title="Görev yok" body="Danışan detayından görev verebilirsiniz." />;
  const sorted = [...data].sort((a, b) => (a.status === b.status ? 0 : a.status === 'open' ? -1 : 1));
  return (
    <Card style={{ paddingVertical: 6 }}>
      {sorted.map((t, i) => {
        const cat = TASK_CATEGORY[t.category];
        const done = t.status === 'done';
        return (
          <View key={t.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: i < sorted.length - 1 ? 1 : 0, borderBottomColor: colors.border }}>
            <ScalePressable
              onPress={() => toggle.mutate({ id: t.id, status: done ? 'open' : 'done' })}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: done }}
              accessibilityLabel={t.title}
              style={{ width: 28, height: 28, borderRadius: 10, borderWidth: 2, borderColor: done ? colors.positive : colors.borderStrong, backgroundColor: done ? colors.positive : 'transparent', alignItems: 'center', justifyContent: 'center' }}
            >
              {done ? <Icon name="checkmark" size={17} color="#FFFFFF" /> : null}
            </ScalePressable>
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="bodyStrong" style={done ? { textDecorationLine: 'line-through', color: colors.textSubtle } : undefined} numberOfLines={1}>
                {t.title}
              </Text>
              <Text variant="caption" tone="muted" numberOfLines={1}>
                {t.clientName} · {t.dueDate ? `Son tarih ${dayMonth(t.dueDate)}` : 'Süresiz'}
              </Text>
            </View>
            <IconTile name={cat.icon} tone={cat.tone} size={34} />
          </View>
        );
      })}
    </Card>
  );
}
