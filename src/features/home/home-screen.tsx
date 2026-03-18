import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { EventCard } from '../../components/events/event-card';
import {
  EmptyText,
  NoteText,
  PrimaryButton,
  ScreenContainer,
  ScreenTitle,
  SectionTitle,
  StatRow,
} from '../../components/ui/primitives';
import { calculateStreak, getCyclePhase, toDateInput } from '../../lib/date';
import { useTheme } from '../../theme/use-theme';
import { useAppState } from '../app/app-context';

export function HomeScreen() {
  const router = useRouter();
  const { colors, theme } = useTheme();
  const {
    user,
    events,
    cycleData,
    partners,
    activities,
    quickCounterIncrement,
    quickCounterDecrement,
    quickCounterUndoAvailable,
  } = useAppState();
  const [counterBusy, setCounterBusy] = useState(false);

  if (!user) {
    return null;
  }

  const today = toDateInput(new Date());
  const todayCount = events.filter((event) => event.dateTimeStart.startsWith(today)).length;
  const streakDays = calculateStreak(events);
  const cyclePhase = user.cycleTrackingEnabled ? getCyclePhase(cycleData, new Date()) : null;
  const hasDefaultPartner = partners.some((partner) => partner.isDefault);
  const hasDefaultActivity = activities.some((activity) => activity.isDefault);
  const quickCounterReady = hasDefaultPartner && hasDefaultActivity;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        quickCounterCard: {
          marginTop: theme.spacing.xs,
          marginBottom: theme.spacing.xs,
          borderWidth: 1,
          borderColor: colors.borderMuted,
          borderRadius: theme.radius.lg,
          backgroundColor: theme.mode === 'dark' ? colors.surface : colors.textPrimary,
          minHeight: theme.sizing.buttonHeight + 8,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: theme.spacing.sm,
        },
        quickCounterButton: {
          width: 52,
          height: 42,
          borderRadius: theme.radius.md,
          borderWidth: 1,
          borderColor: theme.mode === 'dark' ? colors.borderMuted : 'rgba(255,255,255,0.22)',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.mode === 'dark' ? colors.surfaceAlt : 'rgba(255,255,255,0.08)',
        },
        quickCounterButtonPressed: {
          opacity: 0.82,
        },
        quickCounterButtonDisabled: {
          opacity: 0.42,
        },
        quickCounterButtonText: {
          color: theme.mode === 'dark' ? colors.textPrimary : '#FFFFFF',
          fontSize: theme.typography.fontSize.xl,
          lineHeight: theme.typography.lineHeight.xl,
          fontWeight: '700',
          marginTop: -1,
        },
        quickCounterValue: {
          color: theme.mode === 'dark' ? colors.textPrimary : '#FFFFFF',
          fontSize: theme.typography.fontSize.xl,
          lineHeight: theme.typography.lineHeight.xl,
          fontWeight: '700',
          minWidth: 48,
          textAlign: 'center',
        },
      }),
    [colors, theme],
  );

  const onQuickIncrement = async () => {
    if (counterBusy) return;
    setCounterBusy(true);
    try {
      const result = await quickCounterIncrement();
      if (!result.ok) {
        Alert.alert(
          'Defaults required',
          'Set a default partner and a default activity in Settings before using quick counter.',
        );
      }
    } finally {
      setCounterBusy(false);
    }
  };

  const onQuickDecrement = async () => {
    if (counterBusy || !quickCounterUndoAvailable) return;
    setCounterBusy(true);
    try {
      await quickCounterDecrement();
    } finally {
      setCounterBusy(false);
    }
  };

  return (
    <ScreenContainer>
      <ScreenTitle title={`Welcome, ${user.displayName}`} subtitle="Today at a glance" />

      <StatRow label="Today entries" value={String(todayCount)} />
      <StatRow label="Current streak" value={`${streakDays} day${streakDays === 1 ? '' : 's'}`} />
      <StatRow label="Next planned invite" value="Not set" />
      {cyclePhase ? <StatRow label="Cycle snapshot" value={cyclePhase} /> : null}

      <View style={styles.quickCounterCard}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Undo quick log"
          disabled={!quickCounterUndoAvailable || counterBusy}
          onPress={() => void onQuickDecrement()}
          style={({ pressed }) => [
            styles.quickCounterButton,
            (!quickCounterUndoAvailable || counterBusy) ? styles.quickCounterButtonDisabled : null,
            pressed ? styles.quickCounterButtonPressed : null,
          ]}
        >
          <Text style={styles.quickCounterButtonText}>-</Text>
        </Pressable>

        <Text style={styles.quickCounterValue}>{todayCount}</Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Quick log plus"
          disabled={counterBusy}
          onPress={() => void onQuickIncrement()}
          style={({ pressed }) => [
            styles.quickCounterButton,
            counterBusy ? styles.quickCounterButtonDisabled : null,
            pressed ? styles.quickCounterButtonPressed : null,
          ]}
        >
          <Text style={styles.quickCounterButtonText}>+</Text>
        </Pressable>
      </View>
      {!quickCounterReady ? (
        <NoteText>Set a default partner and default activity in Settings to enable quick counter logging.</NoteText>
      ) : null}

      <SectionTitle>Recents</SectionTitle>
      {events.length === 0 ? (
        <EmptyText>No entries yet. Add your first event from Log Event.</EmptyText>
      ) : (
        events.slice(0, 10).map((event) => (
          <EventCard key={event.id} event={event} onPress={(eventId) => router.push(`/events/${eventId}`)} />
        ))
      )}

      <NoteText>Private notes remain local to this device in V1.</NoteText>
    </ScreenContainer>
  );
}
