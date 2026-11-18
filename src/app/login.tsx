import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Platform, ScrollView, View, type ScrollViewInstance } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { firebaseConfigured } from '@/auth/firebase';
import { useSession } from '@/auth/session';
import { useAppTheme } from '@/theme/theme';
import { Button, Card, Icon, Input, Logo, ScalePressable, Text, KeyboardSafe, useKeyboardHeight } from '@/ui';

const FEATURES = [
  { icon: 'sunny-outline' as const, text: 'Günün randevuları tek ekranda' },
  { icon: 'scale-outline' as const, text: 'Saniyeler içinde ölçüm girişi' },
  { icon: 'chatbubbles-outline' as const, text: 'Danışanlarınızla anlık mesajlaşma' },
];

export default function Login() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const mode = useSession((s) => s.mode);
  const signIn = useSession((s) => s.signIn);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState<'login' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scroll = useRef<ScrollViewInstance>(null);
  const keyboard = useKeyboardHeight();

  // Bring the form above the keyboard as soon as it opens.
  useEffect(() => {
    if (keyboard > 0) setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 60);
  }, [keyboard]);

  if (mode) return <Redirect href="/(tabs)" />;

  const submit = async () => {
    setError(null);
    if (!email.includes('@') || password.length < 6) {
      setError('E-posta adresinizi ve en az 6 karakterli şifrenizi girin.');
      return;
    }
    setBusy('login');
    try {
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Giriş yapılamadı.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <KeyboardSafe style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView ref={scroll} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" bounces={false}>
        <LinearGradient
          colors={colors.heroGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: insets.top + 36, paddingHorizontal: 24, paddingBottom: 86, borderBottomLeftRadius: 36, borderBottomRightRadius: 36, overflow: 'hidden' }}
        >
          <View style={{ position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(255,255,255,0.08)', top: -80, right: -70 }} />
          <View style={{ position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.07)', bottom: -40, left: -30 }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Logo size={46} light />
            <View>
              <Text variant="heading" color="#FFFFFF">
                OdivonDiet
              </Text>
              <Text variant="caption" color="rgba(255,255,255,0.75)">
                Diyetisyen & klinik uygulaması
              </Text>
            </View>
          </View>
          <Text variant="display" color="#FFFFFF" style={{ marginTop: 34, fontSize: 32, lineHeight: 38 }}>
            Danışanlarınız{'\n'}cebinizde.
          </Text>
          <View style={{ marginTop: 18, gap: 10 }}>
            {FEATURES.map((f) => (
              <View key={f.text} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 28, height: 28, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={f.icon} size={15} color="#FFFFFF" />
                </View>
                <Text color="rgba(255,255,255,0.92)" weight="medium">
                  {f.text}
                </Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        <View style={{ paddingHorizontal: 20, marginTop: -56, paddingBottom: insets.bottom + 24, gap: 16 }}>
          <Card style={{ gap: 14, padding: 22 }}>
            <View style={{ gap: 4 }}>
              <Text variant="title">Tekrar hoş geldiniz</Text>
              <Text tone="muted">Web paneldeki hesabınızla giriş yapın.</Text>
            </View>
            <Input
              label="E-posta"
              icon="mail-outline"
              placeholder="ornek@klinik.com"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
              value={email}
              onChangeText={setEmail}
              returnKeyType="next"
            />
            <Input
              label="Şifre"
              icon="lock-closed-outline"
              placeholder="••••••••"
              secureTextEntry={!show}
              autoComplete="password"
              textContentType="password"
              value={password}
              onChangeText={setPassword}
              onSubmitEditing={submit}
              returnKeyType="go"
              right={
                <ScalePressable onPress={() => setShow((v) => !v)} accessibilityLabel={show ? 'Şifreyi gizle' : 'Şifreyi göster'} hitSlop={10}>
                  <Icon name={show ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textSubtle} />
                </ScalePressable>
              }
            />
            {error ? (
              <View style={{ flexDirection: 'row', gap: 8, backgroundColor: colors.dangerSoft, padding: 12, borderRadius: 14 }}>
                <Icon name="alert-circle-outline" size={18} color={colors.danger} />
                <Text variant="caption" color={colors.danger} style={{ flex: 1 }}>
                  {error}
                </Text>
              </View>
            ) : null}
            <Button label="Giriş yap" size="lg" full loading={busy === 'login'} onPress={submit} />
            {!firebaseConfigured ? (
              <Text variant="caption" tone="subtle" align="center">
                Giriş henüz yapılandırılmadı. Lütfen yöneticinize başvurun.
              </Text>
            ) : null}
          </Card>

          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <Icon name="shield-checkmark-outline" size={14} color={colors.textSubtle} />
            <Text variant="caption" tone="subtle">
              Verileriniz KVKK uyumlu olarak şifrelenir
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardSafe>
  );
}
