import { Card, CardBody, CardTitle, NoteText, ScreenContainer, ScreenTitle } from '../../src/components/ui/primitives';

export default function PartnerSharedRoute() {
  return (
    <ScreenContainer>
      <ScreenTitle title="Shared Experiences" subtitle="Phase 2 planned" />
      <Card>
        <CardTitle>Upcoming capability</CardTitle>
        <CardBody>Shared event feedback comparison and shared feed arrive after partner linking.</CardBody>
      </Card>
      <NoteText>The placeholder now follows the centralized color, surface, and typography treatment.</NoteText>
    </ScreenContainer>
  );
}
