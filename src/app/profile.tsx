import { router } from 'expo-router';
import { View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from '@/auth/session';
import { useMe } from '@/features/queries';
import { useAppTheme, type ThemePreference } from '@/theme/theme';
import { Avatar, Card, IconTile, ListRow, Pill, Screen, SectionHeader, Segmented, Text } from '@/ui';

export default function Profile() {
  const { preference, setPreference } = useAppTheme();
  const me = useMe();
  const mode = useSession((s) => s.mode);
  const signOut = useSession((s) => s.signOut);
  const qc = useQueryClient();
  const isManager = me.data?.role === 'owner' || me.data?.role === 'admin' || (me.data?.permissions?.dietReports ?? []).includes('view');
  const trialDays = me.data?.tenant.trialEndsAt ? Math.max(0, Math.ceil((new Date(me.data.tenant.trialEndsAt).getTime() - Date.now()) / 86_400_000)) : null;

  return (
    <Screen back title="Profil">
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Avatar name={me.data?.displayName ?? 'O D'} size={60} />
        <View style={{ flex: 1, gap: 4 }}>
          <Text variant="heading">{me.data?.displayName ?? '—'}</Text>
          <Text variant="caption" tone="muted">
            {me.data?.tenant.name}
          </Text>
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 2 }}>
            <Pill label={me.data?.role === 'owner' ? 'Klinik yöneticisi' : 'Diyetisyen'} tone="primary" />
            {mode === 'demo' ? <Pill label="Demo" tone="warning" /> : null}
          </View>
        </View>
      </Card>

      {isManager ? (
        <Card onPress={() => router.push('/admin')} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }} accessibilityLabel="Klinik özeti">
          <IconTile name="stats-chart-outline" tone="primary" />
          <View style={{ flex: 1 }}>
            <Text variant="bodyStrong">Klinik özeti</Text>
            <Text variant="caption" tone="muted">
              Ekip, görüşme yükü ve büyüme
            </Text>
          </View>
          <Pill label="Yönetici" tone="primary" />
        </Card>
      ) : null}

      <SectionHeader title="Görünüm" />
      <Segmented<ThemePreference>
        value={preference}
        onChange={setPreference}
        options={[
          { value: 'system', label: 'Otomatik' },
          { value: 'light', label: 'Açık' },
          { value: 'dark', label: 'Koyu' },
        ]}
      />

      <SectionHeader title="Hesap" />
      <Card style={{ paddingVertical: 6 }}>
        <ListRow divider leading={<IconTile name="briefcase-outline" tone="info" size={38} />} title="Abonelik" subtitle={trialDays !== null ? `Deneme · ${trialDays} gün kaldı` : 'Aktif'} trailing={<Text variant="caption" tone="subtle">Webden yönetilir</Text>} chevron={false} />
        <ListRow divider leading={<IconTile name="notifications-outline" tone="warning" size={38} />} title="Bildirimler" subtitle="Mesaj, talep ve randevu hatırlatmaları" chevron={false} />
        <ListRow leading={<IconTile name="finger-print-outline" tone="positive" size={38} />} title="Face ID / parmak izi" subtitle="Uygulama açılışında kilit" chevron={false} />
      </Card>

      <Card
        onPress={async () => {
          router.replace('/login');
          await signOut();
          qc.clear();
        }}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}
        accessibilityLabel="Çıkış yap"
      >
        <IconTile name="log-out-outline" tone="danger" />
        <Text variant="bodyStrong" tone="default" style={{ flex: 1 }}>
          Çıkış yap
        </Text>
      </Card>
      <Text variant="caption" tone="subtle" align="center">
        OdivonDiet Mobil · v0.1.0
      </Text>
    </Screen>
  );
}
