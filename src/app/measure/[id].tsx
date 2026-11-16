import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Platform, TextInput, View } from 'react-native';
import { useAddMeasurement, useClientOverview } from '@/features/queries';
import { bmi, bmiLabel, kg } from '@/lib/format';
import { useAppTheme } from '@/theme/theme';
import { font } from '@/theme/tokens';
import { Button, Card, Icon, Input, ModalScreen, Pill, ScalePressable, Text } from '@/ui';

function parse(value: string): number | undefined {
  const n = Number(value.replace(',', '.'));
  return value.trim() && Number.isFinite(n) ? n : undefined;
}

export default function AddMeasurement() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();
  const overview = useClientOverview(id);
  const client = overview.data?.client;
  const last = overview.data?.measurements[0];
  const [weight, setWeight] = useState<number | null>(null);
  const [waist, setWaist] = useState('');
  const [fat, setFat] = useState('');
  const [muscle, setMuscle] = useState('');
  const [note, setNote] = useState('');
  const save = useAddMeasurement(id);

  const value = weight ?? client?.currentWeightKg ?? 70;
  const delta = last ? Math.round((value - last.weightKg) * 10) / 10 : 0;
  const step = (d: number) => {
    if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => undefined);
    setWeight(Math.round((value + d) * 10) / 10);
  };
  const b = client ? bmi(value, client.heightCm) : null;

  const submit = async () => {
    await save.mutateAsync({ weightKg: value, waistCm: parse(waist), bodyFatPct: parse(fat), muscleMassKg: parse(muscle), note: note.trim() || undefined });
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    router.back();
  };

  return (
    <ModalScreen
      title="Ölçüm ekle"
      subtitle={client ? `${client.firstName} ${client.lastName}` : undefined}
      footer={<Button label="Ölçümü kaydet" icon="checkmark" size="lg" full loading={save.isPending} onPress={submit} />}
    >
      <Card style={{ alignItems: 'center', gap: 14, paddingVertical: 26 }}>
        <Text variant="overline" tone="muted">
          Kilo
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
          <ScalePressable onPress={() => step(-0.1)} accessibilityLabel="0,1 kg azalt" style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: colors.cardMuted, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="remove" size={24} color={colors.text} />
          </ScalePressable>
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <TextInput
              value={weight === null ? kg(value) : String(weight).replace('.', ',')}
              onChangeText={(t) => {
                const n = parse(t);
                if (n !== undefined) setWeight(n);
              }}
              keyboardType="decimal-pad"
              selectTextOnFocus
              accessibilityLabel="Kilo"
              style={{ fontFamily: font.extrabold, fontSize: 56, color: colors.text, width: 150, textAlign: 'center', letterSpacing: -2, outlineStyle: 'none' } as object}
            />
            <Text variant="heading" tone="subtle">
              kg
            </Text>
          </View>
          <ScalePressable onPress={() => step(0.1)} accessibilityLabel="0,1 kg artır" style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: colors.cardMuted, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="add" size={24} color={colors.text} />
          </ScalePressable>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
          {last ? <Pill label={`Son ölçüme göre ${delta > 0 ? '+' : ''}${kg(delta)} kg`} tone={delta <= 0 ? 'positive' : 'warning'} icon={delta <= 0 ? 'trending-down' : 'trending-up'} /> : null}
          {b ? <Pill label={`BKİ ${b.toLocaleString('tr-TR')} · ${bmiLabel(b).label}`} tone={bmiLabel(b).tone} /> : null}
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {[-1, -0.5, 0.5, 1].map((d) => (
            <ScalePressable key={d} onPress={() => step(d)} accessibilityLabel={`${d} kg`} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: colors.border }}>
              <Text variant="caption" weight="bold" tone="muted">
                {d > 0 ? '+' : ''}
                {String(d).replace('.', ',')}
              </Text>
            </ScalePressable>
          ))}
        </View>
      </Card>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Input label="Bel" suffix="cm" keyboardType="decimal-pad" placeholder={last?.waistCm ? String(last.waistCm) : '—'} value={waist} onChangeText={setWaist} />
        </View>
        <View style={{ flex: 1 }}>
          <Input label="Yağ oranı" suffix="%" keyboardType="decimal-pad" placeholder={last?.bodyFatPct ? String(last.bodyFatPct) : '—'} value={fat} onChangeText={setFat} />
        </View>
      </View>
      <Input label="Kas kütlesi" suffix="kg" keyboardType="decimal-pad" placeholder="—" value={muscle} onChangeText={setMuscle} />
      <Input label="Not" placeholder="Örn. sabah aç karnına" value={note} onChangeText={setNote} multiline />
      {save.error ? (
        <Text variant="caption" color={colors.danger}>
          {save.error.message}
        </Text>
      ) : null}
    </ModalScreen>
  );
}
