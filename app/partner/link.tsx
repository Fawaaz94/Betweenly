import { Card, CardBody, CardTitle, NoteText, ScreenContainer, ScreenTitle } from '../../src/components/ui/primitives';

export default function PartnerLinkRoute() {
  return (
    <ScreenContainer>
      <ScreenTitle title="Partner Link" subtitle="Phase 2 planned" />
      <Card>
        <CardTitle>Upcoming capability</CardTitle>
        <CardBody>Partner invitation and link acceptance flow will be added in the next milestone.</CardBody>
      </Card>
      <NoteText>This placeholder remains discreet and consistent with the shared theme foundation.</NoteText>
    </ScreenContainer>
  );
}
