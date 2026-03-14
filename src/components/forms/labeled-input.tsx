import type { TextInputProps } from 'react-native';
import { Input, Label } from '../ui/primitives';

export function LabeledInput({ label, ...inputProps }: TextInputProps & { label: string }) {
  return (
    <>
      <Label>{label}</Label>
      <Input {...inputProps} />
    </>
  );
}
