import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Text } from 'react-native';
import { LabeledInput } from '../../components/forms/labeled-input';
import { PrimaryButton, ScreenContainer, ScreenTitle } from '../../components/ui/primitives';
import { useTheme } from '../../theme/use-theme';
import { useAppState } from '../app/app-context';

export function AddPositionScreen() {
  const router = useRouter();
  const { colors, theme } = useTheme();
  const { positions, savePosition } = useAppState();
  const [name, setName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (isSaving) return;

    setErrorMessage(null);
    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMessage('Please enter a position name.');
      return;
    }

    const hasDuplicate = positions.some((position) => position.name.trim().toLowerCase() === trimmedName.toLowerCase());
    if (hasDuplicate) {
      setErrorMessage('This position already exists.');
      return;
    }

    try {
      setIsSaving(true);
      await savePosition({ name: trimmedName });
      router.back();
    } catch {
      setIsSaving(false);
      Alert.alert('Save failed', 'Please try again.');
    }
  };

  return (
    <ScreenContainer>
      <ScreenTitle title="Add Position" showBackButton />

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
