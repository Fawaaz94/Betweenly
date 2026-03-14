import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/theme';
import { createMonthMatrix, toDateInput } from '../../lib/date';
import type { IntimacyEvent } from '../../types/models';

export function MonthCalendar({
  year,
  month,
  selectedDate,
  events,
  onSelectDate,
}: {
  year: number;
  month: number;
  selectedDate: string;
  events: IntimacyEvent[];
  onSelectDate: (date: string) => void;
}) {
  const matrix = createMonthMatrix(year, month);
  const eventsByDay = new Set(events.map((event) => event.dateTimeStart.slice(0, 10)));

  return (
    <View>
      <View style={styles.weekHeaderRow}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <Text key={day} style={styles.weekHeaderText}>
            {day}
          </Text>
        ))}
      </View>

      {matrix.map((week, weekIndex) => (
        <View key={`${weekIndex}`} style={styles.calendarWeekRow}>
          {week.map((day, dayIndex) => {
            if (!day) {
              return <View key={`empty-${weekIndex}-${dayIndex}`} style={styles.calendarCell} />;
            }

            const key = toDateInput(new Date(year, month, day));
            const isSelected = key === selectedDate;
            const hasEvents = eventsByDay.has(key);

            return (
              <Pressable
                key={key}
                style={[styles.calendarCell, isSelected ? styles.calendarCellSelected : null]}
                onPress={() => onSelectDate(key)}
              >
                <Text style={styles.calendarDate}>{day}</Text>
                {hasEvents ? <View style={styles.dot} /> : null}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  weekHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  weekHeaderText: {
    flex: 1,
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 12,
  },
  calendarWeekRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  calendarCell: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    borderRadius: 8,
    margin: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  calendarCellSelected: {
    borderColor: colors.accent,
    backgroundColor: '#172554',
  },
  calendarDate: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  dot: {
    marginTop: 3,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
});
