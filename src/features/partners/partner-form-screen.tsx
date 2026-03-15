import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { countries, countryCodeToFlagEmoji, findCountryByCode } from '../../constants/countries';
import { DatePickerField } from '../../components/forms/date-picker-field';
import { LabeledInput } from '../../components/forms/labeled-input';
import { DangerButton, Input, Label, MultilineInput, NoteText, PrimaryButton, ScreenContainer, ScreenTitle } from '../../components/ui/primitives';
import { type PartnerFormValues, validatePartnerForm } from '../../lib/partner-validations';
import type { CreatePartnerInput } from '../../types/models';
import { useTheme } from '../../theme/use-theme';

type PartnerFormScreenProps = {
  title: string;
  initialValues: PartnerFormValues;
  submitLabel: string;
  onSubmit: (input: CreatePartnerInput) => Promise<void>;
  onDelete?: () => Promise<void>;
};

export function PartnerFormScreen({ title, initialValues, submitLabel, onSubmit, onDelete }: PartnerFormScreenProps) {
  const { colors, theme } = useTheme();
  const [formValues, setFormValues] = useState<PartnerFormValues>(initialValues);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  useEffect(() => {
    setFormValues(initialValues);
  }, [initialValues]);

  const filteredCountries = useMemo(() => {
    const search = countrySearch.trim().toLowerCase();
    if (!search) return countries;
    return countries.filter((country) => {
      const haystack = `${country.name} ${country.code}`.toLowerCase();
      return haystack.includes(search);
    });
  }, [countrySearch]);

  const selectedCountry = useMemo(() => findCountryByCode(formValues.nationality), [formValues.nationality]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        avatarWrap: {
          alignItems: 'center',
          justifyContent: 'center',
          marginVertical: theme.spacing.sm,
          gap: theme.spacing.xs,
        },
        avatarButton: {
          width: 104,
          height: 104,
          borderRadius: 52,
          borderWidth: 1,
          borderColor: colors.borderMuted,
          backgroundColor: colors.surface,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
        },
        avatarFallback: {
          color: colors.textMuted,
          fontSize: theme.typography.fontSize.xxl,
          lineHeight: theme.typography.lineHeight.xxl,
          fontWeight: '600',
        },
        avatarImage: {
          width: '100%',
          height: '100%',
        },
        avatarEditBadge: {
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: colors.accent,
          borderWidth: 2,
          borderColor: colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
        },
        nationalityTrigger: {
          minHeight: theme.sizing.inputHeight,
          borderRadius: theme.radius.md,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.surface,
          paddingHorizontal: theme.spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        nationalityValue: {
          color: selectedCountry ? colors.textPrimary : colors.textMuted,
          fontSize: theme.typography.fontSize.sm,
          lineHeight: theme.typography.lineHeight.sm,
        },
        modalBackdrop: {
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.28)',
          justifyContent: 'flex-end',
        },
        modalSheet: {
          backgroundColor: colors.appBg,
          borderTopLeftRadius: theme.radius.xxl,
          borderTopRightRadius: theme.radius.xxl,
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.md,
          paddingBottom: theme.spacing.xxl,
          minHeight: '68%',
        },
        modalHandle: {
          alignSelf: 'center',
          width: 42,
          height: 4,
          borderRadius: 2,
          backgroundColor: colors.borderMuted,
          marginBottom: theme.spacing.md,
        },
        modalHeader: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: theme.spacing.sm,
        },
        modalTitle: {
          color: colors.textPrimary,
          fontSize: theme.typography.fontSize.lg,
          lineHeight: theme.typography.lineHeight.lg,
          fontWeight: '700',
        },
        closeButton: {
          width: 38,
          height: 38,
          borderRadius: theme.radius.pill,
          borderWidth: 1,
          borderColor: colors.borderMuted,
          backgroundColor: colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
        },
        countryList: {
          marginTop: theme.spacing.sm,
        },
        countryRow: {
          minHeight: theme.sizing.buttonHeight,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderMuted,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        countryRowLeft: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.sm,
          flex: 1,
        },
        countryFlag: {
          fontSize: theme.typography.fontSize.lg,
          lineHeight: theme.typography.lineHeight.lg,
        },
        countryName: {
          color: colors.textPrimary,
          fontSize: theme.typography.fontSize.md,
          lineHeight: theme.typography.lineHeight.md,
          fontWeight: '500',
        },
        countryCode: {
          color: colors.textSecondary,
          fontSize: theme.typography.fontSize.sm,
          lineHeight: theme.typography.lineHeight.sm,
        },
        errorText: {
          color: colors.danger,
          fontSize: theme.typography.fontSize.sm,
          lineHeight: theme.typography.lineHeight.sm,
        },
      }),
    [colors, theme, selectedCountry],
  );

  const setField = <K extends keyof PartnerFormValues>(field: K, value: PartnerFormValues[K]) => {
    setFormValues((previous) => ({ ...previous, [field]: value }));
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to choose a partner image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setField('avatarUri', result.assets[0]?.uri ?? null);
    }
  };

  const handleSubmit = async () => {
    if (saveStatus === 'saving') return;
    setErrorMessage(null);

    const parsed = validatePartnerForm(formValues);
    if (!parsed.success) {
      setSaveStatus('idle');
      setErrorMessage(parsed.issues[0]?.message ?? 'Please review this form.');
      return;
    }

    try {
      setSaveStatus('saving');
      await onSubmit(parsed.data);
      setSaveStatus('saved');
    } catch {
      setSaveStatus('idle');
      Alert.alert('Save failed', 'Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    Alert.alert('Delete partner?', 'This will remove the partner from this device.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void onDelete();
        },
      },
    ]);
  };

  return (
    <ScreenContainer>
      <ScreenTitle title={title} showBackButton />

      <View style={styles.avatarWrap}>
        <Pressable onPress={() => void pickImage()} style={styles.avatarButton}>
          {formValues.avatarUri ? (
            <Image source={{ uri: formValues.avatarUri }} resizeMode="cover" style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarFallback}>{formValues.name.trim().slice(0, 1).toUpperCase() || '?'}</Text>
          )}
          <View style={styles.avatarEditBadge}>
            <Ionicons name="camera" size={14} color={colors.textOnAccent} />
          </View>
        </Pressable>
        <NoteText>Tap photo to choose from gallery</NoteText>
      </View>

      <LabeledInput label="Name" value={formValues.name} onChangeText={(value) => setField('name', value)} placeholder="Name" />
      <DatePickerField label="Birthday" value={formValues.birthday} onChange={(value) => setField('birthday', value)} />

      <Label>Nationality</Label>
      <Pressable onPress={() => setCountryModalVisible(true)} style={styles.nationalityTrigger}>
        <Text style={styles.nationalityValue}>
          {selectedCountry ? `${countryCodeToFlagEmoji(selectedCountry.code)} ${selectedCountry.name}` : 'Select nationality'}
        </Text>
        <Ionicons name="chevron-down" size={theme.sizing.iconMd} color={colors.textSecondary} />
      </Pressable>

      <LabeledInput
        label="Instagram"
        value={formValues.instagram}
        onChangeText={(value) => setField('instagram', value)}
        autoCapitalize="none"
        placeholder="@username"
      />
      <LabeledInput
        label="Phone number"
        value={formValues.phoneNumber}
        onChangeText={(value) => setField('phoneNumber', value)}
        keyboardType="phone-pad"
        placeholder="Phone number"
      />

      <Label>Notes</Label>
      <MultilineInput value={formValues.notes} onChangeText={(value) => setField('notes', value)} placeholder="Add private notes" />

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <PrimaryButton label={saveStatus === 'saving' ? 'Saving...' : submitLabel} onPress={() => void handleSubmit()} />
      {onDelete ? <DangerButton label="Delete partner" onPress={() => void handleDelete()} /> : null}

      <Modal visible={countryModalVisible} animationType="slide" transparent onRequestClose={() => setCountryModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Pressable style={styles.closeButton} onPress={() => setCountryModalVisible(false)}>
                <Ionicons name="close" size={theme.sizing.iconMd} color={colors.textPrimary} />
              </Pressable>
              <Text style={styles.modalTitle}>Select Nationality</Text>
              <View style={styles.closeButton} />
            </View>

            <Label>Search country</Label>
            <Input value={countrySearch} onChangeText={setCountrySearch} placeholder="Type country name or code" autoCapitalize="none" />

            <ScrollView style={styles.countryList}>
              {filteredCountries.map((country) => (
                <Pressable
                  key={country.code}
                  style={styles.countryRow}
                  onPress={() => {
                    setField('nationality', country.code);
                    setCountrySearch('');
                    setCountryModalVisible(false);
                  }}
                >
                  <View style={styles.countryRowLeft}>
                    <Text style={styles.countryFlag}>{countryCodeToFlagEmoji(country.code)}</Text>
                    <Text style={styles.countryName}>{country.name}</Text>
                  </View>
                  <Text style={styles.countryCode}>{country.code}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
