import { Input, Label } from '../ui/primitives';
import type { CycleData } from '../../types/models';

export function CycleSettingsForm({
  cycleData,
  onChange,
}: {
  cycleData: CycleData;
  onChange: (nextCycleData: CycleData) => void;
}) {
  return (
    <>
      <Label>Last period start (YYYY-MM-DD)</Label>
      <Input
        value={cycleData.lastPeriodStart}
        onChangeText={(value) => onChange({ ...cycleData, lastPeriodStart: value })}
        autoCapitalize="none"
      />

      <Label>Average cycle length</Label>
      <Input
        value={String(cycleData.averageCycleLength)}
        onChangeText={(value) =>
          onChange({
            ...cycleData,
            averageCycleLength: Number.parseInt(value || '0', 10) || 28,
          })
        }
        keyboardType="number-pad"
      />

      <Label>Average period length</Label>
      <Input
        value={String(cycleData.averagePeriodLength)}
        onChangeText={(value) =>
          onChange({
            ...cycleData,
            averagePeriodLength: Number.parseInt(value || '0', 10) || 5,
          })
        }
        keyboardType="number-pad"
      />
    </>
  );
}
