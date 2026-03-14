import { useRouter } from 'expo-router';
import { GhostButton, NoteText, ScreenContainer, ScreenTitle } from '../../components/ui/primitives';

export function EditProfileScreen() {
  const router = useRouter();

  return (
    <ScreenContainer>
      <ScreenTitle title="Edit profile" subtitle="Update your private profile details" />
      <NoteText>Profile editing fields will be added here in the next iteration.</NoteText>
      <GhostButton label="Close" onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/profile'))} />
    </ScreenContainer>
  );
}
