import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { View } from 'react-native';
import { useDashboard, useMe } from '@/features/queries';
import { CHANNEL, greeting, ago, longDate, time, untilLabel } from '@/lib/format';
import { useAppTheme } from '@/theme/theme';
import { toneColors } from '@/theme/tokens';
import {
  Avatar,
  Card,
  EmptyState,
  Icon,
  IconTile,
  KpiCard,
  ListRow,
  Pill,
  ProgressRing,
  ScalePressable,
  Screen,
  SectionHeader,
  Skeleton,
  Text,
} from '@/ui';

export default function Today() {
  const { colors } = useAppTheme();
  const me = useMe();
  const { data, isLoading, refetch, isRefetching } = useDashboard();
  const firstName = (me.data?.displayName ?? '').replace(/^Dyt\.\s*/, '').split(' ')[0] || 'Hoş geldiniz';
  const next = data?.nextConsultation;
  const remaining = data?.todayConsultations.filter((c) => c.status === 'scheduled').length ?? 0;
  const nowIso = new Date().toISOString();

  return (
    <Screen
      tabBar
      eyebrow={longDate()}
      title={`${greeting()}, ${firstName}`}
      subtitle="Bugünkü randevularınız ve ilgilenmeniz gereken danışanlar burada."
      refreshing={isRefetching}
      onRefresh={refetch}
      right={
        <>
          <ScalePressable
            onPress={() => router.push('/calendar')}
            accessibilityLabel="Takvim"
            style={{ width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}
          >
            <Icon name="calendar-outline" size={20} color={colors.text} />
          </ScalePressable>
          <ScalePressable onPress={() => router.push('/profile')} accessibilityLabel="Profil ve ayarlar">
            <Avatar name={me.data?.displayName ?? 'O D'} size={42} />
          </ScalePressable>
        </>
      }
    >
      {/* Next consultation hero */}
      <ScalePressable onPress={() => (next ? router.push(`/client/${next.clientId}`) : router.push('/consultation/new'))} scaleTo={0.985} accessibilityLabel="Sıradaki görüşme">
        <LinearGradient
          colors={colors.heroGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 28, padding: 20, overflow: 'hidden', gap: 16 }}
        >
          <View style={{ position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.08)', top: -60, right: -40 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.16)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 }}>
              <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#6EE7B7' }} />
              <Text variant="caption" color="#FFFFFF" weight="bold">
                {next ? 'Sıradaki görüşme' : 'Bugün boş saatiniz var'}
              </Text>
            </View>
            <Text variant="caption" color="rgba(255,255,255,0.8)" weight="semibold">
              {remaining} görüşme kaldı
            </Text>
          </View>
          {isLoading ? (
            <View style={{ gap: 8 }}>
              <Skeleton height={28} width="60%" />
              <Skeleton height={16} width="40%" />
            </View>
          ) : next ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <Avatar name={next.clientName} size={52} ring="rgba(255,255,255,0.5)" />
              <View style={{ flex: 1 }}>
                <Text variant="title" color="#FFFFFF" numberOfLines={1}>
                  {next.clientName}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <Icon name={CHANNEL[next.channel].icon} size={15} color="rgba(255,255,255,0.85)" />
                  <Text color="rgba(255,255,255,0.85)" weight="medium" numberOfLines={1} style={{ flexShrink: 1 }}>
                    {CHANNEL[next.channel].label}
                  </Text>
                </View>
              </View>
              <View style={{ alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 }}>
                <Text variant="title" color="#FFFFFF" style={{ fontSize: 20 }}>
                  {time(next.at)}
                </Text>
                {untilLabel(next.at) !== time(next.at) ? (
                  <Text variant="caption" color="rgba(255,255,255,0.8)" weight="semibold" style={{ fontSize: 11 }}>
                    {untilLabel(next.at)}
                  </Text>
                ) : null}
              </View>
            </View>
          ) : (
            <View>
              <Text variant="title" color="#FFFFFF">
                Planlanmış görüşme yok
              </Text>
              <Text color="rgba(255,255,255,0.85)" style={{ marginTop: 4 }}>
                Dokunarak yeni bir görüşme planlayın.
              </Text>
            </View>
          )}
        </LinearGradient>
      </ScalePressable>

      {/* KPI grid */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <KpiCard compact label="Aktif danışan" value={data?.activeClients ?? '–'} icon="people-outline" tone="primary" footnote={`${data?.newClientsThisMonth ?? 0} yeni bu ay`} onPress={() => router.push('/(tabs)/clients')} />
        <KpiCard compact label="Bugünkü görüşme" value={data?.todayConsultations.length ?? '–'} icon="calendar-outline" tone="info" footnote={next ? `Sıradaki ${time(next.at)}` : 'Hepsi tamam'} onPress={() => router.push('/calendar')} />
      </View>
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <ProgressRing value={data?.avgGoalProgressPct ?? null} size={72} />
        <View style={{ flex: 1, gap: 4 }}>
          <Text variant="overline" tone="muted">
            Ort. hedef ilerlemesi
          </Text>
          <Text variant="heading">Danışanlarınız hedefe yaklaşıyor</Text>
          <Text variant="caption" tone="muted">
            Aktif danışanların başlangıç kilosundan hedefe kat ettiği yol.
          </Text>
        </View>
      </Card>

      {/* Inbox shortcuts */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {[
          { label: 'Okunmamış', value: data?.unreadMessages ?? 0, icon: 'chatbubbles-outline' as const, tone: 'primary' as const, to: '/(tabs)/messages' as const },
          { label: 'Talep', value: data?.openRequests ?? 0, icon: 'mail-unread-outline' as const, tone: 'warning' as const, to: '/(tabs)/tasks' as const },
          { label: 'Açık görev', value: data?.openTasks ?? 0, icon: 'checkbox-outline' as const, tone: 'positive' as const, to: '/(tabs)/tasks' as const },
        ].map((item) => {
          const t = toneColors(colors, item.tone);
          return (
            <Card key={item.label} onPress={() => router.push(item.to)} style={{ flex: 1, padding: 14, gap: 10 }} accessibilityLabel={`${item.label}: ${item.value}`}>
              <IconTile name={item.icon} tone={item.tone} size={36} />
              <View>
                <Text variant="title" color={item.value ? t.fg : colors.text}>
                  {item.value}
                </Text>
                <Text variant="caption" tone="muted">
                  {item.label}
                </Text>
              </View>
            </Card>
          );
        })}
      </View>

      {/* Today's agenda */}
      <SectionHeader title="Bugünkü program" action="Takvim" onAction={() => router.push('/calendar')} />
      <Card style={{ paddingVertical: 6 }}>
        {isLoading ? (
          <View style={{ gap: 12, paddingVertical: 12 }}>
            <Skeleton height={44} />
            <Skeleton height={44} />
          </View>
        ) : data && data.todayConsultations.length ? (
          data.todayConsultations.map((c, i) => {
            const isNext = next?.id === c.id;
            const done = c.status === 'done';
            const past = c.at < nowIso && !done;
            return (
              <View key={c.id} style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ alignItems: 'center', width: 46, paddingTop: 14 }}>
                  <Text variant="caption" weight="bold" color={isNext ? colors.positive : done ? colors.textSubtle : colors.text}>
                    {time(c.at)}
                  </Text>
                  {i < data.todayConsultations.length - 1 ? <View style={{ flex: 1, width: 2, borderRadius: 1, backgroundColor: colors.border, marginTop: 6 }} /> : null}
                </View>
                <View style={{ flex: 1, marginVertical: 4 }}>
                  <ListRow
                    highlight={isNext}
                    onPress={() => router.push(`/client/${c.clientId}`)}
                    leading={<Avatar name={c.clientName} size={38} />}
                    title={c.clientName}
                    subtitle={CHANNEL[c.channel].label}
                    trailing={done ? <Pill label="Tamamlandı" tone="positive" icon="checkmark" /> : isNext ? <Pill label="Sıradaki" tone="positive" /> : past ? <Pill label="Bekliyor" tone="warning" /> : null}
                    chevron={false}
                  />
                </View>
              </View>
            );
          })
        ) : (
          <EmptyState icon="calendar-outline" title="Bugün görüşme yok" body="Yeni bir görüşme planlamak için + butonunu kullanın." />
        )}
      </Card>

      {/* Attention */}
      {data && data.attentionClients.length ? (
        <>
          <SectionHeader title="İlgilenmeniz gerekenler" />
          <Card style={{ paddingVertical: 6 }}>
            {data.attentionClients.slice(0, 4).map((c, i, arr) => (
              <ListRow
                key={c.id}
                divider={i < arr.length - 1}
                onPress={() => router.push(`/client/${c.id}`)}
                leading={<IconTile name="scale-outline" tone="warning" size={38} />}
                title={c.name}
                subtitle={c.lastMeasuredAt ? `Son ölçüm ${ago(c.lastMeasuredAt)}` : 'Henüz ölçüm yok'}
                trailing={<Pill label="Ölçüm al" tone="warning" />}
              />
            ))}
          </Card>
        </>
      ) : null}
    </Screen>
  );
}
