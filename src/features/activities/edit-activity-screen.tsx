import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { LabeledInput } from '../../components/forms/labeled-input';
import { EmptyText, GhostButton, Label, PrimaryButton, ScreenContainer, ScreenTitle } from '../../components/ui/primitives';
import { ACTIVITY_ICON_OPTIONS, type ActivityIconName } from '../../constants/activities';
import { useTheme } from '../../theme/use-theme';
import { useAppState } from '../app/app-context';

export function EditActivityScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, theme } = useTheme();
  const { activities, updateActivity } = useAppState();
  const activity = activities.find((item) => item.id === id);
  const [name, setName] = useState(activity?.name ?? '');
  const [selectedIcon, setSelectedIcon] = useState<ActivityIconName>(activity?.icon ?? ACTIVITY_ICON_OPTIONS[0].name);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        iconsWrap: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing.sm,
        },
        iconOption: {
          width: '30%',
          minHeight: 84,
          borderWidth: 1,
          borderColor: colors.borderMuted,
          borderRadius: theme.radius.lg,
          backgroundColor: colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme.spacing.xs,
        },
        iconOptionActive: {
          borderColor: colors.accent,
          backgroundColor: colors.chipActiveBg,
        },
        iconLabel: {
          color: colors.textSecondary,
          fontSize: theme.typography.fontSize.xs,
          lineHeight: theme.typography.lineHeight.xs,
          fontWeight: '600',
          textAlign: 'center',
        },
        iconLabelActive: {
          color: colors.accent,
        },
        errorText: {
          color: colors.danger,
          fontSize: theme.typography.fontSize.sm,
          lineHeight: theme.typography.lineHeight.sm,
        },
      }),
    [colors, theme],
  );

  if (!activity) {
    return (
      <ScreenContainer>
        <ScreenTitle title="Activity not found" showBackButton />
        <EmptyText>This activity was removed or not available.</EmptyText>
        <GhostButton label="Back" onPress={() => router.replace('/activities')} />
      </ScreenContainer>
    );
  }

  const handleSave = async () => {
    if (isSaving) return;

    setErrorMessage(null);
    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMessage('Please enter an activity name.');
      return;
    }

    const hasDuplicate = activities.some(
      (item) => item.id !== activity.id && item.name.trim().toLowerCase() === trimmedName.toLowerCase(),
    );
    if (hasDuplicate) {
      setErrorMessage('This activity already exists.');
      return;
    }

    try {
      setIsSaving(true);
      await updateActivity(activity.id, { name: trimmedName, icon: selectedIcon });
      router.back();
    } catch {
      setIsSaving(false);
      Alert.alert('Save failed', 'Please try again.');
    }
  };

  return (
    <ScreenContainer>
      <ScreenTitle title="Edit Activity" showBackButton />

      <LabeledInput
        label="Activity Name"
        value={name}
        onChangeText={setName}
        placeholder="Activity name"
        autoCapitalize="words"
      />

      <Label>Select Icon</Label>
      <View style={styles.iconsWrap}>
        {ACTIVITY_ICON_OPTIONS.map((iconOption) => {
          const isSelected = selectedIcon === iconOption.name;
          return (
            <Pressable
              key={iconOption.name}
              onPress={() => setSelectedIcon(iconOption.name)}
              style={({ pressed }) => [styles.iconOption, isSelected ? styles.iconOptionActive : null, pressed ? { opacity: 0.82 } : null]}
            >
              <Ionicons
                name={iconOption.name}
                size={theme.sizing.iconLg}
                color={isSelected ? colors.accent : colors.textSecondary}
              />
              <Text style={[styles.iconLabel, isSelected ? styles.iconLabelActive : null]}>{iconOption.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <PrimaryButton label={isSaving ? 'Saving...' : 'Save'} onPress={() => void handleSave()} />
    </ScreenContainer>
  );
}
