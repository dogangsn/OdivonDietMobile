import { Redirect } from 'expo-router';
import { useSession } from '@/auth/session';

export default function Index() {
  const mode = useSession((s) => s.mode);
  return <Redirect href={mode ? '/(tabs)' : '/login'} />;
}
