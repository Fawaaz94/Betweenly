import { useRouter } from 'expo-router';
import { NoteText, PrimaryButton, ScreenContainer, ScreenTitle } from '../../src/components/ui/primitives';

export default function OnboardingRoute() {
  const router = useRouter();

  return (
    <ScreenContainer>
      <ScreenTitle title="Onboarding" subtitle="Private intimacy tracking and wellness reflection" />
      <NoteText>Use the app as a private relationship journal, with careful shared/private boundaries.</NoteText>
      <NoteText>Data is stored locally first using SQLite in this milestone.</NoteText>
      <PrimaryButton label="Continue to sign in" onPress={() => router.replace('/(auth)/sign-in')} />
    </ScreenContainer>
  );
}
