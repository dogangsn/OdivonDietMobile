import { router, useLocalSearchParams } from 'expo-router';
import { Linking, View } from 'react-native';
import { useClientOverview } from '@/features/queries';
import { bmi, bmiLabel, CHANNEL, dayMonth, kg, PROGRAM_LABELS, time } from '@/lib/format';
import { useAppTheme } from '@/theme/theme';
import type { IconName } from '@/ui/Icon';
import {
  Avatar,
  Card,
  EmptyState,
  Icon,
  IconButton,
  IconTile,
  ListRow,
  MacroBar,
  Pill,
  ProgressBar,
  ScalePressable,
  Screen,
  SectionHeader,
  Skeleton,
  Text,
  TrendChart,
} from '@/ui';

function Action({ icon, label, onPress, badge }: { icon: IconName; label: string; onPress: () => void; badge?: number }) {
  const { colors } = useAppTheme();
  return (
    <ScalePressable onPress={onPress} accessibilityLabel={label} style={{ flex: 1, alignItems: 'center', gap: 8 }}>
      <View style={{ width: 56, height: 56, borderRadius: 20, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={24} color={colors.primaryText} />
        {badge ? (
          <View style={{ position: 'absolute', top: -4, right: -4, minWidth: 20, height: 20, borderRadius: 10, backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.bg }}>
            <Text color="#FFF" weight="bold" style={{ fontSize: 10, lineHeight: 12 }}>
              {badge}
            </Text>
          </View>
        ) : null}
      </View>
      <Text variant="caption" weight="semibold" align="center">
        {label}
      </Text>
    </ScalePressable>
  );
}

export default function ClientDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();
  const { data, isLoading, refetch, isRefetching } = useClientOverview(id);

  if (isLoading || !data)
    return (
      <Screen back>
        <Skeleton height={180} radius={28} />
        <Skeleton height={80} radius={26} />
        <Skeleton height={200} radius={26} />
      </Screen>
    );

  const c = data.client;
  const name = `${c.firstName} ${c.lastName}`;
  const b = bmi(c.currentWeightKg, c.heightCm);
  const bl = bmiLabel(b);
  const diff = Math.round((c.currentWeightKg - c.startWeightKg) * 10) / 10;
  const points = [...data.measurements].reverse().map((m) => ({ label: dayMonth(m.date), value: m.weightKg }));

  return (
    <Screen
      back
      refreshing={isRefetching}
      onRefresh={refetch}
      right={c.phone ? <IconButton icon="call-outline" label="Ara" onPress={() => Linking.openURL(`tel:${c.phone.replace(/\s/g, '')}`)} /> : null}
    >
      <Card style={{ alignItems: 'center', gap: 12, paddingVertical: 24 }}>
        <Avatar name={name} size={76} />
        <View style={{ alignItems: 'center', gap: 6 }}>
          <Text variant="title">{name}</Text>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <Pill label={PROGRAM_LABELS[c.program]} tone="primary" />
            {c.status !== 'active' ? <Pill label={c.status === 'paused' ? 'Duraklatıldı' : 'Arşiv'} /> : null}
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignSelf: 'stretch', marginTop: 8 }}>
          {[
            { label: 'Güncel', value: kg(c.currentWeightKg), unit: 'kg', sub: `${diff > 0 ? '+' : ''}${kg(diff)} kg`, subColor: diff <= 0 ? colors.positive : colors.info },
            { label: 'Hedef', value: kg(c.targetWeightKg), unit: 'kg', sub: `%${c.goalProgressPct ?? 0} tamam`, subColor: colors.textMuted },
            { label: 'BKİ', value: b.toLocaleString('tr-TR'), unit: '', sub: bl.label, subColor: colors.warning },
          ].map((s, i) => (
            <View key={s.label} style={{ flex: 1, alignItems: 'center', gap: 2, borderLeftWidth: i ? 1 : 0, borderLeftColor: colors.border }}>
              <Text variant="overline" tone="subtle">
                {s.label}
              </Text>
              <Text variant="title" style={{ fontSize: 21 }}>
                {s.value}
                {s.unit ? <Text variant="caption" tone="subtle"> {s.unit}</Text> : null}
              </Text>
              <Text variant="caption" weight="bold" color={s.subColor}>
                {s.sub}
              </Text>
            </View>
          ))}
        </View>
        <View style={{ alignSelf: 'stretch', marginTop: 4 }}>
          <ProgressBar value={c.goalProgressPct ?? 0} height={10} />
        </View>
      </Card>

      <View style={{ flexDirection: 'row', paddingVertical: 4 }}>
        <Action icon="scale-outline" label="Ölçüm ekle" onPress={() => router.push(`/measure/${c.id}`)} />
        <Action icon="chatbubbles-outline" label="Mesaj" badge={data.unreadMessages} onPress={() => router.push(`/chat/${c.id}`)} />
        <Action icon="checkbox-outline" label="Görev ver" onPress={() => router.push({ pathname: '/task/new', params: { clientId: c.id } })} />
        <Action icon="calendar-outline" label="Görüşme" onPress={() => router.push({ pathname: '/consultation/new', params: { clientId: c.id } })} />
      </View>

      <SectionHeader title="Kilo grafiği" />
      <Card style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text variant="overline" tone="muted">
              Son {data.measurements.length} ölçüm
            </Text>
            <Text variant="heading" style={{ marginTop: 2 }}>
              {diff <= 0 ? `${kg(Math.abs(diff))} kg verdi` : `${kg(diff)} kg aldı`}
            </Text>
          </View>
          <IconTile name={diff <= 0 ? 'trending-down' : 'trending-up'} tone="positive" size={40} />
        </View>
        <TrendChart points={points} target={c.targetWeightKg} />
      </Card>

      {data.activePlan ? (
        <>
          <SectionHeader title="Aktif plan" />
          <Card style={{ gap: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <IconTile name="restaurant-outline" tone="warning" />
              <View style={{ flex: 1 }}>
                <Text variant="heading" numberOfLines={1}>
                  {data.activePlan.title}
                </Text>
                <Text variant="caption" tone="muted">
                  {dayMonth(data.activePlan.startDate)} – {dayMonth(data.activePlan.endDate)}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text variant="title" style={{ fontSize: 20 }}>
                  {data.activePlan.kcal.toLocaleString('tr-TR')}
                </Text>
                <Text variant="caption" tone="subtle">
                  kcal/gün
                </Text>
              </View>
            </View>
            <MacroBar protein={data.activePlan.proteinPct} carb={data.activePlan.carbPct} fat={data.activePlan.fatPct} />
            <View style={{ gap: 8 }}>
              {data.activePlan.meals.map((m, i) => (
                <View key={`${m.time}-${i}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.cardMuted, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11 }}>
                  <Text variant="caption" tone="muted" weight="semibold" style={{ width: 42 }}>
                    {m.time}
                  </Text>
                  <Text variant="bodyStrong" style={{ flex: 1 }}>
                    {m.name}
                  </Text>
                  <Text variant="caption" tone="subtle">
                    {m.kcal} kcal
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        </>
      ) : null}

      <SectionHeader title="Görüşmeler" action="Planla" onAction={() => router.push({ pathname: '/consultation/new', params: { clientId: c.id } })} />
      <Card style={{ paddingVertical: 6 }}>
        {data.nextConsultation ? (
          <ListRow
            highlight
            leading={<IconTile name={CHANNEL[data.nextConsultation.channel].icon} tone="positive" size={38} />}
            title={`${dayMonth(data.nextConsultation.at)} · ${time(data.nextConsultation.at)}`}
            subtitle={`${CHANNEL[data.nextConsultation.channel].label} · ${data.nextConsultation.durationMin} dk`}
            trailing={<Pill label="Yaklaşan" tone="positive" />}
          />
        ) : null}
        {data.recentConsultations.slice(0, 4).map((k, i, arr) => (
          <ListRow
            key={k.id}
            divider={i < arr.length - 1}
            leading={<IconTile name={CHANNEL[k.channel].icon} tone={k.status === 'cancelled' ? 'neutral' : CHANNEL[k.channel].tone} size={38} />}
            title={`${dayMonth(k.at)} · ${time(k.at)}`}
            subtitle={k.notes || CHANNEL[k.channel].label}
            trailing={k.status === 'done' ? <Pill label={k.adherence != null ? `Uyum %${k.adherence}` : 'Yapıldı'} tone="positive" /> : k.status === 'cancelled' ? <Pill label="İptal" /> : null}
          />
        ))}
        {!data.nextConsultation && !data.recentConsultations.length ? <EmptyState icon="calendar-outline" title="Görüşme kaydı yok" /> : null}
      </Card>

      {(c.conditions?.length || c.allergies?.length) ? (
        <>
          <SectionHeader title="Sağlık bilgileri" />
          <Card style={{ gap: 12 }}>
            {c.conditions?.length ? (
              <View style={{ gap: 8 }}>
                <Text variant="caption" tone="muted" weight="semibold">
                  Tanılar
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {c.conditions.map((x) => (
                    <Pill key={x} label={x} tone="info" />
                  ))}
                </View>
              </View>
            ) : null}
            {c.allergies?.length ? (
              <View style={{ gap: 8 }}>
                <Text variant="caption" tone="muted" weight="semibold">
                  Alerjiler
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {c.allergies.map((x) => (
                    <Pill key={x} label={x} tone="danger" icon="alert-circle-outline" />
                  ))}
                </View>
              </View>
            ) : null}
          </Card>
        </>
      ) : null}

      <SectionHeader title="İletişim" />
      <Card style={{ paddingVertical: 6 }}>
        <ListRow divider leading={<IconTile name="call-outline" tone="positive" size={38} />} title={c.phone || '—'} subtitle="Telefon" onPress={c.phone ? () => Linking.openURL(`tel:${c.phone.replace(/\s/g, '')}`) : undefined} />
        <ListRow leading={<IconTile name="mail-outline" tone="info" size={38} />} title={c.email || '—'} subtitle="E-posta" onPress={c.email ? () => Linking.openURL(`mailto:${c.email}`) : undefined} />
      </Card>
    </Screen>
  );
}
