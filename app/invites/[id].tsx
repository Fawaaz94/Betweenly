import { Card, CardBody, CardTitle, NoteText, ScreenContainer, ScreenTitle } from '../../src/components/ui/primitives';

export default function InviteDetailsRoute() {
  return (
    <ScreenContainer>
      <ScreenTitle title="Invite Details" subtitle="Phase 3 planned" />
      <Card>
        <CardTitle>Upcoming capability</CardTitle>
        <CardBody>Detailed invite status and responses will be available in the next phase.</CardBody>
      </Card>
      <NoteText>This placeholder screen already uses shared surfaces, borders, and text tokens.</NoteText>
    </ScreenContainer>
  );
}
