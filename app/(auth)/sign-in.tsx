import { Redirect } from 'expo-router';
import { SignInScreen } from '../../src/features/auth/sign-in-screen';
import { useAppState } from '../../src/features/app/app-context';

export default function SignInRoute() {
  const { user, isBootstrapping } = useAppState();

  if (isBootstrapping) return null;
  if (user) return <Redirect href="/(tabs)" />;

  return <SignInScreen />;
}
