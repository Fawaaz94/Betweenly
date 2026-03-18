import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { MonthCalendar } from '../../components/calendar/month-calendar';
import { EventCard } from '../../components/events/event-card';
import { EmptyText, Input } from '../../components/ui/primitives';
import { toDateInput } from '../../lib/date';
import { useTheme } from '../../theme/use-theme';
import { useAppState } from '../app/app-context';
import type { IntimacyEvent } from '../../types/models';

function formatSelectedDateTitle(dateKey: string) {
  const selected = new Date(`${dateKey}T00:00:00`);
  if (Number.isNaN(+selected)) return dateKey;

  return selected.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function getSearchableText(event: IntimacyEvent) {
  return [
    event.partnerName,
    event.location,
    event.notes,
    event.positions,
    event.toysUsed,
    event.whatWorkedWell,
    event.whatToTryNext,
    event.eventType,
  ]
    .join(' ')
    .toLowerCase();
}

export function CalendarScreen() {
  const router = useRouter();
  const { colors, theme } = useTheme();
  const { events } = useAppState();
  const [cursor, setCursor] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(toDateInput(new Date()));
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const selectedDayEvents = useMemo(
    () =>
      events
        .filter((event) => event.dateTimeStart.slice(0, 10) === selectedDate)
        .sort((a, b) => +new Date(a.dateTimeStart) - +new Date(b.dateTimeStart)),
    [events, selectedDate],
  );

  const searchResults = useMemo(() => {
    if (normalizedQuery.length < 2) return [];

    return events
      .filter((event) => getSearchableText(event).includes(normalizedQuery))
      .sort((a, b) => +new Date(b.dateTimeStart) - +new Date(a.dateTimeStart));
  }, [events, normalizedQuery]);

  const searchActive = normalizedQuery.length >= 2;
  const agendaEvents = searchActive ? searchResults : selectedDayEvents;
  const todayKey = toDateInput(new Date());
  const agendaTitle = searchActive
    ? `Search results (${agendaEvents.length})`
    : selectedDate === todayKey
      ? 'Today'
      : formatSelectedDateTitle(selectedDate);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.appBg,
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: theme.spacing.xxl,
        },
        headerSection: {
          paddingTop: theme.spacing.sm,
        },
        topHeader: {
          marginBottom: theme.spacing.sm,
          flexDirection: 'row',
          justifyContent: 'flex-end',
          alignItems: 'center',
        },
        title: {
          color: colors.textPrimary,
          fontSize: theme.typography.fontSize.xxl,
          lineHeight: theme.typography.lineHeight.xxl,
          fontWeight: '700',
        },
        searchButton: {
          width: theme.sizing.buttonHeight - 8,
          height: theme.sizing.buttonHeight - 8,
          borderRadius: theme.radius.pill,
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          alignItems: 'center',
          justifyContent: 'center',
        },
        searchInputWrap: {
          marginBottom: theme.spacing.sm,
        },
        monthRow: {
          marginTop: theme.spacing.xs,
          marginBottom: theme.spacing.sm,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        monthTitle: {
          color: colors.textPrimary,
          fontSize: theme.typography.fontSize.lg,
          lineHeight: theme.typography.lineHeight.lg,
          fontWeight: '600',
        },
        monthNavButton: {
          width: 36,
          height: 36,
          borderRadius: theme.radius.pill,
          alignItems: 'center',
          justifyContent: 'center',
        },
        eventsContainer: {
          marginTop: theme.spacing.md,
          flex: 1,
          minHeight: 0,
        },
        eventsHeading: {
          marginBottom: theme.spacing.sm,
          color: colors.textPrimary,
          fontSize: theme.typography.fontSize.lg,
          lineHeight: theme.typography.lineHeight.lg,
          fontWeight: '600',
        },
        eventsList: {
          flex: 1,
        },
        eventsListContent: {
          paddingVertical: theme.spacing.xs,
        },
        emptyWrap: {
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: theme.spacing.lg,
        },
        queryHint: {
          color: colors.textMuted,
          fontSize: theme.typography.fontSize.xs,
          lineHeight: theme.typography.lineHeight.xs,
        },
      }),
    [colors, theme],
  );

  const renderAgendaEvent = ({ item }: { item: IntimacyEvent }) => (
    <EventCard event={item} onPress={(eventId) => router.push(`/events/${eventId}`)} />
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <View style={styles.topHeader}>
          {/*<Text style={styles.title}>Calendar</Text>*/}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={searchOpen ? 'Close search' : 'Open search'}
            style={styles.searchButton}
            onPress={() => {
              if (searchOpen) {
                setSearchOpen(false);
                setSearchQuery('');
                return;
              }

              setSearchOpen(true);
            }}
          >
            <Ionicons name={searchOpen ? 'close' : 'search'} size={theme.sizing.iconMd} color={colors.textSecondary} />
          </Pressable>
        </View>

        {searchOpen ? (
          <View style={styles.searchInputWrap}>
            <Input
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search notes, partner, location..."
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
            {normalizedQuery.length > 0 && normalizedQuery.length < 2 ? (
              <Text style={styles.queryHint}>Type at least 2 characters.</Text>
            ) : null}
          </View>
        ) : null}

        <View style={styles.monthRow}>
          <Pressable
            style={styles.monthNavButton}
            onPress={() => {
              const next = new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1);
              setCursor(next);
              setSelectedDate(toDateInput(next));
            }}
          >
            <Ionicons name="chevron-back" size={theme.sizing.iconMd} color={colors.textPrimary} />
          </Pressable>

          <Text style={styles.monthTitle}>{cursor.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</Text>

          <Pressable
            style={styles.monthNavButton}
            onPress={() => {
              const next = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
              setCursor(next);
              setSelectedDate(toDateInput(next));
            }}
          >
            <Ionicons name="chevron-forward" size={theme.sizing.iconMd} color={colors.textPrimary} />
          </Pressable>
        </View>

        <MonthCalendar
          year={cursor.getFullYear()}
          month={cursor.getMonth()}
          selectedDate={selectedDate}
          events={events}
          onSelectDate={setSelectedDate}
        />
      </View>

      <View style={styles.eventsContainer}>
        <Text style={styles.eventsHeading}>{agendaTitle}</Text>
        {agendaEvents.length === 0 ? (
          <View style={styles.emptyWrap}>
            <EmptyText>{searchActive ? 'No matching entries found.' : 'No entries scheduled for this day.'}</EmptyText>
          </View>
        ) : (
          <FlatList
            style={styles.eventsList}
            contentContainerStyle={styles.eventsListContent}
            data={agendaEvents}
            keyExtractor={(item) => item.id}
            renderItem={renderAgendaEvent}
          />
        )}
      </View>
    </View>
  );
}
