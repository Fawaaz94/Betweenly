import { DatePickerField } from '../forms/date-picker-field';
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
      <DatePickerField
        label="Last period start"
        value={cycleData.lastPeriodStart}
        onChange={(value) => onChange({ ...cycleData, lastPeriodStart: value })}
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
