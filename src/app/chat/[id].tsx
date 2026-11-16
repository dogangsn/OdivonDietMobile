import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Message } from '@/api/types';
import { useClientOverview, useMarkRead, useMessages, useSendMessage } from '@/features/queries';
import { time } from '@/lib/format';
import { useAppTheme } from '@/theme/theme';
import { font } from '@/theme/tokens';
import { Avatar, Icon, IconButton, ScalePressable, Text } from '@/ui';

function dayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const y = new Date(Date.now() - 86_400_000);
  if (d.toDateString() === today.toDateString()) return 'Bugün';
  if (d.toDateString() === y.toDateString()) return 'Dün';
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
}

function Bubble({ m, showDay }: { m: Message; showDay: boolean }) {
  const { colors } = useAppTheme();
  const mine = m.author === 'dietitian';
  return (
    <View style={{ gap: 8 }}>
      {showDay ? (
        <View style={{ alignItems: 'center', marginVertical: 8 }}>
          <Text variant="caption" tone="subtle" weight="semibold" style={{ backgroundColor: colors.cardMuted, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, overflow: 'hidden' }}>
            {dayLabel(m.at)}
          </Text>
        </View>
      ) : null}
      {m.author === 'system' ? (
        <View style={{ alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primarySoft, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 14, maxWidth: '85%' }}>
          <Icon name="sparkles-outline" size={14} color={colors.primaryText} />
          <Text variant="caption" color={colors.primaryText} weight="semibold">
            {m.body}
          </Text>
        </View>
      ) : (
        <View style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
          {mine ? (
            <LinearGradient colors={colors.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 20, borderBottomRightRadius: 6, paddingHorizontal: 14, paddingVertical: 10 }}>
              <Text color="#FFFFFF">{m.body}</Text>
              <Text variant="caption" color="rgba(255,255,255,0.75)" align="right" style={{ fontSize: 11, marginTop: 2 }}>
                {time(m.at)}
              </Text>
            </LinearGradient>
          ) : (
            <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 20, borderBottomLeftRadius: 6, paddingHorizontal: 14, paddingVertical: 10 }}>
              <Text>{m.body}</Text>
              <Text variant="caption" tone="subtle" style={{ fontSize: 11, marginTop: 2 }}>
                {time(m.at)}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

export default function Chat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const overview = useClientOverview(id);
  const { data } = useMessages(id);
  const send = useSendMessage(id);
  const markRead = useMarkRead();
  const [text, setText] = useState('');
  const list = useRef<FlatList<Message>>(null);
  const name = overview.data ? `${overview.data.client.firstName} ${overview.data.client.lastName}` : '';
  const messages = data ?? [];

  useEffect(() => {
    markRead.mutate(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, messages.length]);

  const submit = () => {
    const body = text.trim();
    if (!body) return;
    setText('');
    send.mutate(body);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.bgElevated }}>
        <IconButton icon="chevron-back" label="Geri" onPress={() => router.back()} />
        <ScalePressable onPress={() => router.push(`/client/${id}`)} accessibilityLabel={`${name} profili`} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
          {name ? <Avatar name={name} size={40} /> : null}
          <View style={{ flex: 1 }}>
            <Text variant="heading" numberOfLines={1}>
              {name}
            </Text>
            <Text variant="caption" tone="muted">
              Danışan · profili görüntüle
            </Text>
          </View>
        </ScalePressable>
      </View>
      <FlatList
        ref={list}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        onContentSizeChange={() => list.current?.scrollToEnd({ animated: false })}
        renderItem={({ item, index }) => <Bubble m={item} showDay={index === 0 || dayLabel(messages[index - 1]!.at) !== dayLabel(item.at)} />}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <Text tone="muted">İlk mesajınızı yazın 👋</Text>
          </View>
        }
      />
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingHorizontal: 12, paddingTop: 10, paddingBottom: insets.bottom + 10, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.bgElevated }}>
        <View style={{ flex: 1, minHeight: 46, maxHeight: 120, borderRadius: 23, backgroundColor: colors.cardMuted, paddingHorizontal: 16, justifyContent: 'center' }}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Mesaj yazın"
            placeholderTextColor={colors.textSubtle}
            multiline
            accessibilityLabel="Mesaj"
            style={{ fontFamily: font.medium, fontSize: 16, color: colors.text, paddingVertical: 10, outlineStyle: 'none' } as object}
          />
        </View>
        <ScalePressable onPress={submit} accessibilityLabel="Gönder" disabled={!text.trim()} scaleTo={0.9}>
          <LinearGradient colors={colors.gradient} style={{ width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', opacity: text.trim() ? 1 : 0.45 }}>
            <Icon name="send" size={19} color="#FFFFFF" />
          </LinearGradient>
        </ScalePressable>
      </View>
    </KeyboardAvoidingView>
  );
}
