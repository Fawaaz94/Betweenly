import { useState } from 'react';
import { CycleSettingsForm } from '../../components/profile/cycle-settings-form';
import {
  Chip,
  NoteText,
  PrimaryButton,
  Row,
  ScreenContainer,
  ScreenTitle,
  SectionTitle,
  StatRow,
} from '../../components/ui/primitives';
import { useAppState } from '../app/app-context';

export function ProfileScreen() {
  const { user, updateUser, cycleData, updateCycleData } = useAppState();
  const [draftCycleData, setDraftCycleData] = useState(cycleData);

  if (!user) {
    return null;
  }

  return (
    <ScreenContainer>
      <ScreenTitle title="Profile" subtitle="Privacy and personal settings" />

      <StatRow label="Email" value={user.email} />
      <StatRow label="Mode" value={user.relationshipMode === 'solo' ? 'Solo' : 'Partner-linked'} />

      <Row>
        <Chip
          label={user.cycleTrackingEnabled ? 'Cycle tracking on' : 'Enable cycle tracking'}
          active={user.cycleTrackingEnabled}
          onPress={() => {
            void updateUser({
              email: user.email,
              displayName: user.displayName,
              relationshipMode: user.relationshipMode,
              cycleTrackingEnabled: !user.cycleTrackingEnabled,
            });
          }}
        />
      </Row>

      {user.cycleTrackingEnabled ? (
        <>
          <SectionTitle>Cycle settings</SectionTitle>
          <CycleSettingsForm cycleData={draftCycleData} onChange={setDraftCycleData} />
          <PrimaryButton
            label="Save cycle settings"
            onPress={async () => {
              await updateCycleData({
                lastPeriodStart: draftCycleData.lastPeriodStart,
                averageCycleLength: draftCycleData.averageCycleLength,
                averagePeriodLength: draftCycleData.averagePeriodLength,
              });
            }}
          />
        </>
      ) : null}

      <NoteText>
        Privacy labels are intentionally non-explicit. Shared/private boundaries are modeled and ready for partner-linking
        next.
      </NoteText>
    </ScreenContainer>
  );
}
