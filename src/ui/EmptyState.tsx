import { View } from 'react-native';
import type { IconName } from './Icon';
import { IconTile } from './IconTile';
import { Text } from './Text';

export function EmptyState({ icon, title, body }: { icon: IconName; title: string; body?: string }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 32, paddingHorizontal: 24, gap: 10 }}>
      <IconTile name={icon} size={56} />
      <Text variant="heading" align="center">
        {title}
      </Text>
      {body ? (
        <Text tone="muted" align="center">
          {body}
        </Text>
      ) : null}
    </View>
  );
}
