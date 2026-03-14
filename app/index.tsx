import { Redirect } from 'expo-router';
import { LoadingScreen } from '../src/features/app/loading-screen';
import { useAppState } from '../src/features/app/app-context';

export default function IndexRoute() {
  const { isBootstrapping, user } = useAppState();

  if (isBootstrapping) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return <Redirect href="/(tabs)" />;
}
