import { Card, CardBody, CardTitle } from '../ui/primitives';

export function TrendCard({ summary }: { summary: string }) {
  return (
    <Card>
      <CardTitle>Trend snapshot</CardTitle>
      <CardBody>{summary}</CardBody>
    </Card>
  );
}
