import { Card, CardBody, CardTitle, NoteText, ScreenContainer, ScreenTitle } from '../../src/components/ui/primitives';

export default function NewInviteRoute() {
  return (
    <ScreenContainer>
      <ScreenTitle title="Plan Invite" subtitle="Phase 3 planned" />
      <Card>
        <CardTitle>Upcoming capability</CardTitle>
        <CardBody>Planned intimacy invites and optional calendar sync are queued for phase 3.</CardBody>
      </Card>
      <NoteText>This placeholder keeps the experience aligned with the private, local-first visual system.</NoteText>
    </ScreenContainer>
  );
}
