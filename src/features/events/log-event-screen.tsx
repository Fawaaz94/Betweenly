import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { LabeledInput } from '../../components/forms/labeled-input';
import {
  Chip,
  Label,
  MultilineInput,
  NoteText,
  PrimaryButton,
  Row,
  ScreenContainer,
  ScreenTitle,
} from '../../components/ui/primitives';
import { createDefaultLogEventValues, type LogEventFormValues, validateLogEventForm } from '../../lib/validations';
import { useAppState } from '../app/app-context';

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function LogEventScreen() {
  const router = useRouter();
  const { colors, saveEvent, user } = useAppState();
  const [formValues, setFormValues] = useState<LogEventFormValues>(() =>
    createDefaultLogEventValues(user?.relationshipMode === 'linked'),
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');

  const styles = useMemo(
    () =>
      StyleSheet.create({
        errorText: {
          color: colors.danger,
          fontSize: 13,
          lineHeight: 18,
        },
        successText: {
          color: colors.accentText,
          fontSize: 13,
          lineHeight: 18,
        },
      }),
    [colors.accentText, colors.danger],
  );

  const setField = <K extends keyof LogEventFormValues>(field: K, value: LogEventFormValues[K]) => {
    setFormValues((previous) => ({ ...previous, [field]: value }));
  };

  const saveButtonLabel = saveStatus === 'saving' ? 'Saving...' : saveStatus === 'success' ? 'Saved' : 'Save event';

  const onSave = async () => {
    if (saveStatus === 'saving') return;

    setErrorMessage(null);

    const parsed = validateLogEventForm(formValues, {
      ownerUserId: user?.email,
    });

    if (!parsed.success) {
      setSaveStatus('idle');
      setErrorMessage(parsed.issues[0]?.message ?? 'Please review the form and try again.');
      return;
    }

    try {
      setSaveStatus('saving');
      const saved = await saveEvent(parsed.data);
      setSaveStatus('success');
      await wait(650);
      router.replace(`/events/${saved.id}`);
    } catch {
      setSaveStatus('idle');
      Alert.alert('Unable to save', 'Please try again.');
    }
  };

  return (
    <ScreenContainer>
      <ScreenTitle title="Log Event" subtitle="Private shared-experience reflection" />

      <Label>Event type</Label>
      <Row>
        <Chip label="Partnered" active={formValues.eventType === 'partnered'} onPress={() => setField('eventType', 'partnered')} />
        <Chip label="Solo" active={formValues.eventType === 'solo'} onPress={() => setField('eventType', 'solo')} />
      </Row>

      {formValues.eventType === 'partnered' ? (
        <LabeledInput
          label="Partner name"
          value={formValues.partnerName}
          onChangeText={(value) => setField('partnerName', value)}
          placeholder="Partner name"
        />
      ) : null}

      <LabeledInput
        label="Start date (YYYY-MM-DD)"
        value={formValues.startDate}
        onChangeText={(value) => setField('startDate', value)}
        autoCapitalize="none"
        placeholder="2026-03-14"
      />
      <LabeledInput
        label="Start time (HH:MM)"
        value={formValues.startTime}
        onChangeText={(value) => setField('startTime', value)}
        autoCapitalize="none"
        placeholder="21:30"
      />

      <Label>End time (optional)</Label>
      <NoteText>Set both end date and end time, or leave both empty and provide duration.</NoteText>
      <LabeledInput
        label="End date (YYYY-MM-DD)"
        value={formValues.endDate}
        onChangeText={(value) => setField('endDate', value)}
        autoCapitalize="none"
        placeholder="2026-03-14"
      />
      <LabeledInput
        label="End time (HH:MM)"
        value={formValues.endTime}
        onChangeText={(value) => setField('endTime', value)}
        autoCapitalize="none"
        placeholder="22:15"
      />
      <LabeledInput
        label="Duration in minutes (used when end time is empty)"
        value={formValues.durationMinutes}
        onChangeText={(value) => setField('durationMinutes', value)}
        keyboardType="number-pad"
      />
      <LabeledInput label="Location" value={formValues.location} onChangeText={(value) => setField('location', value)} />
      <LabeledInput
        label="Overall rating (1-5)"
        value={formValues.overallRating}
        onChangeText={(value) => setField('overallRating', value)}
        keyboardType="number-pad"
      />
      <LabeledInput
        label="Emotional rating (1-5)"
        value={formValues.emotionalRating}
        onChangeText={(value) => setField('emotionalRating', value)}
        keyboardType="number-pad"
      />

      <Label>Notes</Label>
      <MultilineInput value={formValues.notes} onChangeText={(value) => setField('notes', value)} placeholder="Private reflection" />

      <LabeledInput
        label="Positions / activities"
        value={formValues.positions}
        onChangeText={(value) => setField('positions', value)}
        placeholder="Optional"
      />
      <LabeledInput
        label="Toys used"
        value={formValues.toysUsed}
        onChangeText={(value) => setField('toysUsed', value)}
        placeholder="Optional"
      />
      <LabeledInput
        label="What worked well"
        value={formValues.whatWorkedWell}
        onChangeText={(value) => setField('whatWorkedWell', value)}
      />
      <LabeledInput
        label="What to try next"
        value={formValues.whatToTryNext}
        onChangeText={(value) => setField('whatToTryNext', value)}
      />

      <Row>
        <Chip
          label={formValues.isSharedWithPartner ? 'Shared with partner' : 'Private only'}
          active={formValues.isSharedWithPartner}
          onPress={() => setField('isSharedWithPartner', !formValues.isSharedWithPartner)}
        />
      </Row>

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      {saveStatus === 'success' ? <Text style={styles.successText}>Saved securely. Opening event details...</Text> : null}

      <PrimaryButton label={saveButtonLabel} onPress={() => void onSave()} />
    </ScreenContainer>
  );
}
