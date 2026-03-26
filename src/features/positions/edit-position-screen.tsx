import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Text } from 'react-native';
import { LabeledInput } from '../../components/forms/labeled-input';
import { EmptyText, GhostButton, PrimaryButton, ScreenContainer, ScreenTitle } from '../../components/ui/primitives';
import { useTheme } from '../../theme/use-theme';
import { useAppState } from '../app/app-context';

export function EditPositionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, theme } = useTheme();
  const { positions, updatePosition } = useAppState();
  const position = positions.find((item) => item.id === id);
  const [name, setName] = useState(position?.name ?? '');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!position) {
    return (
      <ScreenContainer>
        <ScreenTitle title="Position not found" showBackButton />
        <EmptyText>This position was removed or not available.</EmptyText>
        <GhostButton label="Back" onPress={() => router.replace('/positions')} />
      </ScreenContainer>
    );
  }

  const handleSave = async () => {
    if (isSaving) return;

    setErrorMessage(null);
    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMessage('Please enter a position name.');
      return;
    }

    const hasDuplicate = positions.some(
      (item) => item.id !== position.id && item.name.trim().toLowerCase() === trimmedName.toLowerCase(),
    );
    if (hasDuplicate) {
      setErrorMessage('This position already exists.');
      return;
    }

    try {
      setIsSaving(true);
      await updatePosition(position.id, { name: trimmedName });
      router.back();
    } catch {
      setIsSaving(false);
      Alert.alert('Save failed', 'Please try again.');
    }
  };

  return (
    <ScreenContainer>
      <ScreenTitle title="Edit Position" showBackButton />

      <LabeledInput
        label="Position Name"
        value={name}
        onChangeText={setName}
        placeholder="Position name"
        autoCapitalize="words"
      />

      {errorMessage ? (
        <Text
          style={{
            color: colors.danger,
            fontSize: theme.typography.fontSize.sm,
            lineHeight: theme.typography.lineHeight.sm,
          }}
        >
          {errorMessage}
        </Text>
      ) : null}

      <PrimaryButton label={isSaving ? 'Saving...' : 'Save'} onPress={() => void handleSave()} />
    </ScreenContainer>
  );
}
