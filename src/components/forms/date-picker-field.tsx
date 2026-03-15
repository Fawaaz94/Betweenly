import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { toDateInput } from '../../lib/date';
import { useTheme } from '../../theme/use-theme';
import { Label } from '../ui/primitives';

type DatePickerFieldProps = {
  label: string;
  value: string;
  onChange: (nextDate: string) => void;
  placeholder?: string;
};

function parseDate(value: string) {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(+parsed)) return null;
  return parsed;
}

export function DatePickerField({ label, value, onChange, placeholder = 'Select date' }: DatePickerFieldProps) {
  const { colors, theme } = useTheme();
  const [showPicker, setShowPicker] = useState(false);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        trigger: {
          minHeight: theme.sizing.inputHeight,
          borderRadius: theme.radius.md,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.surface,
          paddingHorizontal: theme.spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        triggerText: {
          color: value ? colors.textPrimary : colors.textMuted,
          fontSize: theme.typography.fontSize.sm,
          lineHeight: theme.typography.lineHeight.sm,
        },
        iosPickerWrap: {
          borderWidth: 1,
          borderColor: colors.borderMuted,
          borderRadius: theme.radius.md,
          backgroundColor: colors.surface,
          marginTop: theme.spacing.xs,
          overflow: 'hidden',
        },
        iosPickerHeader: {
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.xs,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderMuted,
          flexDirection: 'row',
          justifyContent: 'flex-end',
        },
        iosDoneText: {
          color: colors.accent,
          fontSize: theme.typography.fontSize.sm,
          lineHeight: theme.typography.lineHeight.sm,
          fontWeight: '600',
        },
      }),
    [colors, theme, value],
  );

  const currentDate = parseDate(value) ?? new Date();

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }

    if (event.type === 'dismissed' || !selectedDate) return;
    onChange(toDateInput(selectedDate));
  };

  return (
    <View>
      <Label>{label}</Label>
      <Pressable onPress={() => setShowPicker(true)} style={styles.trigger}>
        <Text style={styles.triggerText}>{value || placeholder}</Text>
        <Ionicons name="calendar-outline" size={theme.sizing.iconMd} color={colors.textSecondary} />
      </Pressable>

      {showPicker ? (
        Platform.OS === 'ios' ? (
          <View style={styles.iosPickerWrap}>
            <View style={styles.iosPickerHeader}>
              <Pressable onPress={() => setShowPicker(false)}>
                <Text style={styles.iosDoneText}>Done</Text>
              </Pressable>
            </View>
            <DateTimePicker value={currentDate} mode="date" display="spinner" onChange={handleChange} />
          </View>
        ) : (
          <DateTimePicker value={currentDate} mode="date" display="default" onChange={handleChange} />
        )
      ) : null}
    </View>
  );
}
