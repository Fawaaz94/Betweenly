import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import { LabeledInput } from '../../components/forms/labeled-input';
import {
  Chip,
  Label,
  MultilineInput,
  PrimaryButton,
  Row,
  ScreenContainer,
  ScreenTitle,
} from '../../components/ui/primitives';
import { toDateInput, toTimeInput } from '../../lib/date';
import { useAppState } from '../app/app-context';

export function LogEventScreen() {
  const router = useRouter();
  const { saveEvent, user } = useAppState();

  const [eventType, setEventType] = useState<'solo' | 'partnered'>('partnered');
  const [partnerName, setPartnerName] = useState('');
  const [date, setDate] = useState(toDateInput(new Date()));
  const [time, setTime] = useState(toTimeInput(new Date()));
  const [durationMinutes, setDurationMinutes] = useState('45');
  const [location, setLocation] = useState('Home');
  const [overallRating, setOverallRating] = useState('4');
  const [emotionalRating, setEmotionalRating] = useState('4');
  const [notes, setNotes] = useState('');
  const [positions, setPositions] = useState('');
  const [whatWorkedWell, setWhatWorkedWell] = useState('');
  const [whatToTryNext, setWhatToTryNext] = useState('');
  const [isSharedWithPartner, setIsSharedWithPartner] = useState(user?.relationshipMode === 'linked');

  return (
    <ScreenContainer>
      <ScreenTitle title="Log Event" subtitle="Quick private reflection" />

      <Label>Event type</Label>
      <Row>
        <Chip label="Partnered" active={eventType === 'partnered'} onPress={() => setEventType('partnered')} />
        <Chip label="Solo" active={eventType === 'solo'} onPress={() => setEventType('solo')} />
      </Row>

      {eventType === 'partnered' ? (
        <LabeledInput
          label="Partner display name"
          value={partnerName}
          onChangeText={setPartnerName}
          placeholder="Partner name"
        />
      ) : null}

      <LabeledInput
        label="Date (YYYY-MM-DD)"
        value={date}
        onChangeText={setDate}
        autoCapitalize="none"
        placeholder="2026-03-14"
      />
      <LabeledInput
        label="Start time (HH:MM)"
        value={time}
        onChangeText={setTime}
        autoCapitalize="none"
        placeholder="21:30"
      />
      <LabeledInput
        label="Duration (minutes)"
        value={durationMinutes}
        onChangeText={setDurationMinutes}
        keyboardType="number-pad"
      />
      <LabeledInput label="Location" value={location} onChangeText={setLocation} />
      <LabeledInput
        label="Overall rating (1-5)"
        value={overallRating}
        onChangeText={setOverallRating}
        keyboardType="number-pad"
      />
      <LabeledInput
        label="Emotional rating (1-5)"
        value={emotionalRating}
        onChangeText={setEmotionalRating}
        keyboardType="number-pad"
      />

      <Label>Notes</Label>
      <MultilineInput
        value={notes}
        onChangeText={setNotes}
        placeholder="Private reflection"
      />

      <LabeledInput
        label="Positions / activities"
        value={positions}
        onChangeText={setPositions}
        placeholder="Optional"
      />
      <LabeledInput label="What worked well" value={whatWorkedWell} onChangeText={setWhatWorkedWell} />
      <LabeledInput label="What to try next" value={whatToTryNext} onChangeText={setWhatToTryNext} />

      <Row>
        <Chip
          label={isSharedWithPartner ? 'Shared with partner' : 'Private only'}
          active={isSharedWithPartner}
          onPress={() => setIsSharedWithPartner((previous) => !previous)}
        />
      </Row>

      <PrimaryButton
        label="Save event"
        onPress={async () => {
          const dateTimeStart = `${date.trim()}T${time.trim()}:00`;
          if (Number.isNaN(+new Date(dateTimeStart))) {
            Alert.alert('Invalid date/time', 'Use YYYY-MM-DD and HH:MM values.');
            return;
          }

          const parsedDuration = Number.parseInt(durationMinutes, 10);
          const parsedOverall = Number.parseInt(overallRating, 10);
          const parsedEmotional = Number.parseInt(emotionalRating, 10);

          if (!parsedDuration || parsedDuration < 1) {
            Alert.alert('Invalid duration', 'Duration must be at least 1 minute.');
            return;
          }

          if (parsedOverall < 1 || parsedOverall > 5 || parsedEmotional < 1 || parsedEmotional > 5) {
            Alert.alert('Invalid rating', 'Ratings must be between 1 and 5.');
            return;
          }

          await saveEvent({
            eventType,
            partnerDisplayNameSnapshot: eventType === 'partnered' ? partnerName.trim() || 'Partner' : undefined,
            dateTimeStart,
            durationMinutes: parsedDuration,
            location: location.trim(),
            overallRating: parsedOverall,
            emotionalRating: parsedEmotional,
            notes: notes.trim(),
            positions: positions.trim(),
            whatWorkedWell: whatWorkedWell.trim(),
            whatToTryNext: whatToTryNext.trim(),
            isSharedWithPartner,
          });

          setPartnerName('');
          setNotes('');
          setPositions('');
          setWhatWorkedWell('');
          setWhatToTryNext('');
          router.replace('/(tabs)');
        }}
      />
    </ScreenContainer>
  );
}
