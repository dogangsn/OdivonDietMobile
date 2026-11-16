import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import type { Program } from '@/api/types';
import { useCreateClient } from '@/features/queries';
import { PROGRAM_LABELS } from '@/lib/format';
import { useAppTheme } from '@/theme/theme';
import { Button, Chips, Input, ModalScreen, Segmented, Text } from '@/ui';

const num = (v: string) => Number(v.replace(',', '.'));

export default function NewClient() {
  const { colors } = useAppTheme();
  const create = useCreateClient();
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', email: '', heightCm: '', startWeightKg: '', targetWeightKg: '' });
  const [sex, setSex] = useState<'female' | 'male'>('female');
  const [program, setProgram] = useState<Program>('weight_loss');
  const [error, setError] = useState<string | null>(null);
  const set = (key: keyof typeof form) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async () => {
    setError(null);
    const h = num(form.heightCm);
    const s = num(form.startWeightKg);
    const t = num(form.targetWeightKg);
    if (!form.firstName.trim() || !form.lastName.trim()) return setError('Ad ve soyad zorunlu.');
    if (!(h >= 50 && h <= 250) || !(s >= 10 && s <= 400) || !(t >= 10 && t <= 400)) return setError('Boy, başlangıç ve hedef kilo değerlerini kontrol edin.');
    try {
      const client = await create.mutateAsync({ firstName: form.firstName.trim(), lastName: form.lastName.trim(), phone: form.phone || undefined, email: form.email || undefined, sex, heightCm: h, startWeightKg: s, targetWeightKg: t, program });
      router.replace(`/client/${client.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Kaydedilemedi.');
    }
  };

  return (
    <ModalScreen title="Yeni danışan" subtitle="Temel bilgiler yeterli, detayları sonra ekleyebilirsiniz." footer={<Button label="Danışanı kaydet" icon="checkmark" size="lg" full loading={create.isPending} onPress={submit} />}>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Input label="Ad" value={form.firstName} onChangeText={set('firstName')} autoCapitalize="words" />
        </View>
        <View style={{ flex: 1 }}>
          <Input label="Soyad" value={form.lastName} onChangeText={set('lastName')} autoCapitalize="words" />
        </View>
      </View>
      <Input label="Telefon" icon="call-outline" keyboardType="phone-pad" value={form.phone} onChangeText={set('phone')} placeholder="05xx xxx xx xx" />
      <Input label="E-posta" icon="mail-outline" keyboardType="email-address" autoCapitalize="none" value={form.email} onChangeText={set('email')} placeholder="Portal daveti için" />
      <View style={{ gap: 6 }}>
        <Text variant="caption" tone="muted" weight="semibold">
          Cinsiyet
        </Text>
        <Segmented value={sex} onChange={setSex} options={[{ value: 'female', label: 'Kadın' }, { value: 'male', label: 'Erkek' }]} />
      </View>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Input label="Boy" suffix="cm" keyboardType="decimal-pad" value={form.heightCm} onChangeText={set('heightCm')} />
        </View>
        <View style={{ flex: 1 }}>
          <Input label="Kilo" suffix="kg" keyboardType="decimal-pad" value={form.startWeightKg} onChangeText={set('startWeightKg')} />
        </View>
        <View style={{ flex: 1 }}>
          <Input label="Hedef" suffix="kg" keyboardType="decimal-pad" value={form.targetWeightKg} onChangeText={set('targetWeightKg')} />
        </View>
      </View>
      <View style={{ gap: 8 }}>
        <Text variant="caption" tone="muted" weight="semibold">
          Program
        </Text>
        <Chips value={program} onChange={setProgram} options={(Object.keys(PROGRAM_LABELS) as Program[]).map((p) => ({ value: p, label: PROGRAM_LABELS[p] }))} />
      </View>
      {error ? (
        <Text variant="caption" color={colors.danger}>
          {error}
        </Text>
      ) : null}
    </ModalScreen>
  );
}
