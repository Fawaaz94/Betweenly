import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import { Chip, Input, Label, NoteText, PrimaryButton, Row, ScreenContainer, ScreenTitle } from '../../components/ui/primitives';
import { useAppState } from '../app/app-context';
import type { RelationshipMode } from '../../types/models';

export function SignInScreen() {
  const router = useRouter();
  const { createProfile } = useAppState();

  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [relationshipMode, setRelationshipMode] = useState<RelationshipMode>('solo');

  return (
    <ScreenContainer>
      <ScreenTitle title="Betweenly" subtitle="Private relationship wellness and intimacy journal" />

      <Label>Email</Label>
      <Input
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="you@example.com"
      />

      <Label>Display name</Label>
      <Input value={displayName} onChangeText={setDisplayName} placeholder="Your name" />

      <Label>Relationship mode</Label>
      <Row>
        <Chip label="Solo" active={relationshipMode === 'solo'} onPress={() => setRelationshipMode('solo')} />
        <Chip
          label="Partner-linked"
          active={relationshipMode === 'linked'}
          onPress={() => setRelationshipMode('linked')}
        />
      </Row>

      <PrimaryButton
        label="Continue"
        onPress={async () => {
          if (!email.trim() || !displayName.trim()) {
            Alert.alert('Missing info', 'Please enter both email and display name.');
            return;
          }

          await createProfile({
            email: email.trim(),
            displayName: displayName.trim(),
            relationshipMode,
            cycleTrackingEnabled: false,
          });

          router.replace('/(tabs)');
        }}
      />

      <PrimaryButton label="View onboarding" onPress={() => router.push('/(auth)/onboarding')} />

      <NoteText>
        Local-first mode is enabled: profile, cycle settings, and intimacy logs are persisted to device SQLite.
      </NoteText>
    </ScreenContainer>
  );
}
