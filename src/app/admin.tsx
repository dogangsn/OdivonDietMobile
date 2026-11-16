import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAdminSummary } from '@/features/queries';
import { useAppTheme } from '@/theme/theme';
import { Avatar, Card, KpiCard, ProgressBar, ProgressRing, Screen, SectionHeader, Skeleton, Text } from '@/ui';

const MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

export default function Admin() {
  const { colors } = useAppTheme();
  const { data, isLoading, refetch, isRefetching } = useAdminSummary();
  if (isLoading || !data)
    return (
      <Screen back title="Klinik özeti">
        <Skeleton height={120} radius={26} />
        <Skeleton height={200} radius={26} />
      </Screen>
    );
  const maxMonth = Math.max(1, ...data.newClientsByMonth.map((m) => m.count));
  const maxLoad = Math.max(1, ...data.staff.map((s) => s.consultationsLast30Days));
  const total = data.clientsByStatus.active + data.clientsByStatus.paused + data.clientsByStatus.archived;

  return (
    <Screen back eyebrow="Yönetici" title="Klinik özeti" subtitle="Son 30 günün performansı" refreshing={isRefetching} onRefresh={refetch}>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <KpiCard compact label="Görüşme · 7 gün" value={data.consultationsLast7Days} icon="calendar-outline" tone="info" footnote={`${data.consultationsLast30Days} son 30 günde`} />
        <KpiCard compact label="Danışan" value={total} icon="people-outline" tone="primary" footnote={`${data.clientsByStatus.active} aktif`} />
      </View>
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <ProgressRing value={data.completionRatePct} size={76} />
        <View style={{ flex: 1, gap: 4 }}>
          <Text variant="overline" tone="muted">
            Görüşme tamamlama oranı
          </Text>
          <Text variant="heading">Planlanan görüşmelerin yapılma oranı</Text>
        </View>
      </Card>

      <SectionHeader title="Yeni danışanlar" />
      <Card style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 140, gap: 10 }}>
          {data.newClientsByMonth.map((m, i) => {
            const last = i === data.newClientsByMonth.length - 1;
            return (
              <View key={m.month} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
                <Text variant="caption" weight="bold" color={last ? colors.primaryText : colors.textMuted}>
                  {m.count}
                </Text>
                {last ? (
                  <LinearGradient colors={colors.gradient} style={{ width: '100%', height: Math.max(8, (m.count / maxMonth) * 100), borderRadius: 10 }} />
                ) : (
                  <View style={{ width: '100%', height: Math.max(8, (m.count / maxMonth) * 100), borderRadius: 10, backgroundColor: colors.primarySoft }} />
                )}
                <Text variant="caption" tone="subtle" style={{ fontSize: 11 }}>
                  {MONTHS[Number(m.month.slice(5, 7)) - 1]}
                </Text>
              </View>
            );
          })}
        </View>
      </Card>

      <SectionHeader title="Ekip yükü" />
      <Card style={{ gap: 16 }}>
        {data.staff.map((s) => (
          <View key={s.uid} style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Avatar name={s.name} size={40} />
              <View style={{ flex: 1 }}>
                <Text variant="bodyStrong" numberOfLines={1}>
                  {s.name}
                </Text>
                <Text variant="caption" tone="muted">
                  {s.activeClients} aktif danışan · {s.consultationsLast30Days} görüşme
                </Text>
              </View>
            </View>
            <ProgressBar value={(s.consultationsLast30Days / maxLoad) * 100} tone="primary" height={6} />
          </View>
        ))}
      </Card>
    </Screen>
  );
}
