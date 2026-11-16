import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import type { Channel } from '@/api/types';
import { useClients, useCreateConsultation } from '@/features/queries';
import { CHANNEL } from '@/lib/format';
import { useAppTheme } from '@/theme/theme';
import { Avatar, Button, Icon, ModalScreen, ScalePressable, Text } from '@/ui';

const SLOTS = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'];

export default function NewConsultation() {
  const { clientId: preset } = useLocalSearchParams<{ clientId?: string }>();
  const { colors } = useAppTheme();
  const clients = useClients(undefined, 'active');
  const create = useCreateConsultation();
  const [clientId, setClientId] = useState<string | undefined>(preset);
  const [dayOffset, setDayOffset] = useState(0);
  const [slot, setSlot] = useState('10:00');
  const [channel, setChannel] = useState<Channel>('clinic');
  const days = useMemo(() => Array.from({ length: 10 }, (_, i) => new Date(Date.now() + i * 86_400_000)), []);

  const submit = async () => {
    if (!clientId) return;
    const d = new Date(days[dayOffset]!);
    const [h, m] = slot.split(':').map(Number);
    d.setHours(h!, m!, 0, 0);
    await create.mutateAsync({ clientId, at: d.toISOString(), channel, durationMin: 45 });
    router.back();
  };

  const chip = (active: boolean) => ({
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: active ? colors.primary : colors.border,
    backgroundColor: active ? colors.primarySoft : colors.card,
  });

  return (
    <ModalScreen title="Görüşme planla" footer={<Button label="Görüşmeyi oluştur" icon="calendar-outline" size="lg" full disabled={!clientId} loading={create.isPending} onPress={submit} />}>
      <Text variant="caption" tone="muted" weight="semibold">
        Danışan
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
        {(clients.data ?? []).map((c) => {
          const name = `${c.firstName} ${c.lastName}`;
          const active = c.id === clientId;
          return (
            <ScalePressable key={c.id} onPress={() => setClientId(c.id)} accessibilityLabel={name} accessibilityState={{ selected: active }} style={{ alignItems: 'center', gap: 6, width: 72 }}>
              <Avatar name={name} size={54} ring={active ? colors.primary : 'transparent'} />
              <Text variant="caption" weight={active ? 'bold' : 'medium'} numberOfLines={1} color={active ? colors.primaryText : colors.textMuted}>
                {c.firstName}
              </Text>
            </ScalePressable>
          );
        })}
      </ScrollView>
      <Text variant="caption" tone="muted" weight="semibold">
        Gün
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {days.map((d, i) => (
          <ScalePressable key={i} onPress={() => setDayOffset(i)} accessibilityLabel={d.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })} style={[chip(i === dayOffset), { alignItems: 'center', width: 64 }]}>
            <Text variant="caption" tone="muted">
              {i === 0 ? 'Bugün' : i === 1 ? 'Yarın' : d.toLocaleDateString('tr-TR', { weekday: 'short' })}
            </Text>
            <Text variant="heading" color={i === dayOffset ? colors.primaryText : colors.text}>
              {d.getDate()}
            </Text>
          </ScalePressable>
        ))}
      </ScrollView>
      <Text variant="caption" tone="muted" weight="semibold">
        Saat
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {SLOTS.map((s) => (
          <ScalePressable key={s} onPress={() => setSlot(s)} accessibilityLabel={s} accessibilityState={{ selected: s === slot }} style={[chip(s === slot), { width: '22.6%', alignItems: 'center' }]}>
            <Text variant="bodyStrong" color={s === slot ? colors.primaryText : colors.text}>
              {s}
            </Text>
          </ScalePressable>
        ))}
      </View>
      <Text variant="caption" tone="muted" weight="semibold">
        Kanal
      </Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {(['clinic', 'video', 'phone'] as Channel[]).map((ch) => (
          <ScalePressable key={ch} onPress={() => setChannel(ch)} accessibilityLabel={CHANNEL[ch].label} accessibilityState={{ selected: ch === channel }} style={[chip(ch === channel), { flex: 1, alignItems: 'center', gap: 6 }]}>
            <Icon name={CHANNEL[ch].icon} size={20} color={ch === channel ? colors.primaryText : colors.textMuted} />
            <Text variant="caption" weight="bold" color={ch === channel ? colors.primaryText : colors.textMuted}>
              {CHANNEL[ch].label}
            </Text>
          </ScalePressable>
        ))}
      </View>
    </ModalScreen>
  );
}
