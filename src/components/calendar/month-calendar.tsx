import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Theme, ThemeColors } from '../../theme';
import { toDateInput } from '../../lib/date';
import { useTheme } from '../../theme/use-theme';
import type { IntimacyEvent } from '../../types/models';

type CalendarDayCell = {
  dateKey: string;
  dayLabel: number;
  inCurrentMonth: boolean;
};

function createMonthGrid(year: number, month: number): CalendarDayCell[][] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPreviousMonth = new Date(year, month, 0).getDate();
  const totalVisibleDays = firstDay + daysInMonth;
  const totalCells = Math.ceil(totalVisibleDays / 7) * 7;

  const flatCells: CalendarDayCell[] = [];

  for (let index = 0; index < totalCells; index += 1) {
    const dayOffset = index - firstDay + 1;

    if (dayOffset < 1) {
      const day = daysInPreviousMonth + dayOffset;
      const date = new Date(year, month - 1, day);
      flatCells.push({
        dateKey: toDateInput(date),
        dayLabel: day,
        inCurrentMonth: false,
      });
      continue;
    }

    if (dayOffset > daysInMonth) {
      const day = dayOffset - daysInMonth;
      const date = new Date(year, month + 1, day);
      flatCells.push({
        dateKey: toDateInput(date),
        dayLabel: day,
        inCurrentMonth: false,
      });
      continue;
    }

    const date = new Date(year, month, dayOffset);
    flatCells.push({
      dateKey: toDateInput(date),
      dayLabel: dayOffset,
      inCurrentMonth: true,
    });
  }

  const rows: CalendarDayCell[][] = [];
  for (let i = 0; i < flatCells.length; i += 7) {
    rows.push(flatCells.slice(i, i + 7));
  }

  return rows;
}

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
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(theme, colors), [colors, theme]);

  const matrix = useMemo(() => createMonthGrid(year, month), [month, year]);
  const eventCountByDay = useMemo(() => {
    const map = new Map<string, number>();
    for (const event of events) {
      const key = event.dateTimeStart.slice(0, 10);
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [events]);

  const dotColors = [colors.accent, colors.accentText, colors.danger, colors.textMuted];

  return (
    <View style={styles.calendarWrap}>
      <View style={styles.weekHeaderRow}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <Text key={`${day}-${index}`} style={styles.weekHeaderText}>
            {day}
          </Text>
        ))}
      </View>

      {matrix.map((week, weekIndex) => (
        <View key={`${weekIndex}`} style={styles.calendarWeekRow}>
          {week.map((cell) => {
            const isSelected = cell.dateKey === selectedDate;
            const eventCount = eventCountByDay.get(cell.dateKey) ?? 0;

            return (
              <Pressable
                key={cell.dateKey}
                style={[styles.calendarCell, isSelected ? styles.calendarCellSelected : null]}
                onPress={() => onSelectDate(cell.dateKey)}
              >
                <View style={[styles.dateCircle, isSelected ? styles.dateCircleSelected : null]}>
                  <Text
                    style={[
                      styles.calendarDate,
                      !cell.inCurrentMonth && !isSelected ? styles.calendarDateOutside : null,
                    ]}
                  >
                    {cell.dayLabel}
                  </Text>
                </View>
                {eventCount > 0 ? (
                  <View style={styles.dotRow}>
                    {new Array(Math.min(4, eventCount)).fill(null).map((_, dotIndex) => (
                      <View
                        key={`${cell.dateKey}-${dotIndex}`}
                        style={[styles.dot, { backgroundColor: dotColors[dotIndex % dotColors.length] }]}
                      />
                    ))}
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

function createStyles(theme: Theme, colors: ThemeColors) {
  return StyleSheet.create({
    calendarWrap: {
      paddingVertical: theme.spacing.xs,
    },
    weekHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.xs,
    },
    weekHeaderText: {
      flex: 1,
      textAlign: 'center',
      color: colors.textMuted,
      fontSize: theme.typography.fontSize.xs,
      lineHeight: theme.typography.lineHeight.xs,
    },
    calendarWeekRow: {
      flexDirection: 'row',
      marginTop: theme.spacing.xxs,
    },
    calendarCell: {
      flex: 1,
      minHeight: 48,
      borderRadius: theme.radius.md,
      marginHorizontal: theme.spacing.xxs,
      marginVertical: theme.spacing.xxs,
      justifyContent: 'center',
      alignItems: 'center',
      gap: theme.spacing.xxs,
    },
    calendarCellSelected: {
      backgroundColor: colors.selectedSurface,
    },
    calendarDate: {
      color: colors.textPrimary,
      fontSize: theme.typography.fontSize.sm,
      lineHeight: theme.typography.lineHeight.sm,
      fontWeight: '600',
    },
    dateCircle: {
      minWidth: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.xxs,
    },
    dateCircleSelected: {
      borderWidth: 1.5,
      borderColor: colors.accent,
    },
    calendarDateOutside: {
      color: colors.textMuted,
      opacity: 0.6,
    },
    dotRow: {
      flexDirection: 'row',
      gap: theme.spacing.xxs,
      alignItems: 'center',
    },
    dot: {
      width: 4,
      height: 4,
      borderRadius: 2,
    },
  });
}
