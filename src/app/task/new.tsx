import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import type { TaskCategory } from '@/api/types';
import { useCreateTask } from '@/features/queries';
import { TASK_CATEGORY } from '@/lib/format';
import { useAppTheme } from '@/theme/theme';
import { Button, IconTile, Input, ModalScreen, ScalePressable, Text } from '@/ui';

const TEMPLATES: Record<TaskCategory, string> = {
  photo: 'Öğle yemeğinin fotoğrafını gönder',
  measurement: 'Haftalık tartı ölçümü',
  water: 'Günde 2,5 L su iç',
  exercise: '30 dk tempolu yürüyüş',
  meal_log: 'Bugünkü öğünlerini kaydet',
  other: '',
};

export default function NewTask() {
  const { clientId } = useLocalSearchParams<{ clientId: string }>();
  const { colors } = useAppTheme();
  const create = useCreateTask(clientId);
  const [category, setCategory] = useState<TaskCategory>('photo');
  const [title, setTitle] = useState(TEMPLATES.photo);
  const submit = async () => {
    if (!title.trim()) return;
    await create.mutateAsync({ title: title.trim(), category });
    router.back();
  };
  return (
    <ModalScreen title="Görev ver" subtitle="Danışanınız portalda ve sohbette görecek." footer={<Button label="Görevi gönder" icon="send" size="lg" full loading={create.isPending} onPress={submit} />}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {(Object.keys(TASK_CATEGORY) as TaskCategory[]).map((c) => {
          const meta = TASK_CATEGORY[c];
          const active = c === category;
          return (
            <ScalePressable
              key={c}
              onPress={() => {
                setCategory(c);
                setTitle(TEMPLATES[c]);
              }}
              accessibilityLabel={meta.label}
              accessibilityState={{ selected: active }}
              style={{ width: '31%', alignItems: 'center', gap: 8, paddingVertical: 14, borderRadius: 20, borderWidth: 1.5, borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.primarySoft : colors.card }}
            >
              <IconTile name={meta.icon} tone={meta.tone} size={40} />
              <Text variant="caption" weight="bold">
                {meta.label}
              </Text>
            </ScalePressable>
          );
        })}
      </View>
      <Input label="Görev" value={title} onChangeText={setTitle} multiline />
    </ModalScreen>
  );
}
