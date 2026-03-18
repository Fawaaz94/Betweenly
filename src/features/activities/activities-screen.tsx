import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { EmptyText, NoteText, ScreenContainer, ScreenTitle } from '../../components/ui/primitives';
import { useTheme } from '../../theme/use-theme';
import { useAppState } from '../app/app-context';

export function ActivitiesScreen() {
  const router = useRouter();
  const { colors, theme } = useTheme();
  const { activities, events } = useAppState();

  const activityEntryCounts = useMemo(() => {
    const counts = new Map<string, number>();

    for (const activity of activities) {
      const needle = activity.name.trim().toLowerCase();
      if (!needle) {
        counts.set(activity.id, 0);
        continue;
      }

      let count = 0;
      for (const event of events) {
        const haystack = [event.positions, event.whatWorkedWell, event.notes].join(' ').toLowerCase();
        if (haystack.includes(needle)) count += 1;
      }
      counts.set(activity.id, count);
    }

    return counts;
  }, [activities, events]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        headerWrap: {
          position: 'relative',
        },
        addButton: {
          position: 'absolute',
          top: theme.spacing.sm + 2,
          right: 0,
          width: 40,
          height: 40,
          borderRadius: theme.radius.pill,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.borderMuted,
          alignItems: 'center',
          justifyContent: 'center',
        },
        addButtonPressed: {
          backgroundColor: colors.surfaceAlt,
        },
        listCard: {
          marginTop: theme.spacing.md,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.borderMuted,
          borderRadius: theme.radius.xl,
          overflow: 'hidden',
        },
        row: {
          minHeight: theme.sizing.buttonHeight + 8,
          paddingHorizontal: theme.spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: theme.spacing.sm,
        },
        rowPressed: {
          backgroundColor: colors.surfaceAlt,
        },
        rowLeft: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.sm,
          flex: 1,
        },
        rowTitle: {
          color: colors.textPrimary,
          fontSize: theme.typography.fontSize.lg,
          lineHeight: theme.typography.lineHeight.lg,
          fontWeight: '500',
        },
        rowRight: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.xs,
        },
        rowMeta: {
          color: colors.textMuted,
          fontSize: theme.typography.fontSize.md,
          lineHeight: theme.typography.lineHeight.md,
          fontWeight: '500',
        },
        divider: {
          marginLeft: theme.spacing.md + theme.sizing.iconMd + theme.spacing.sm,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderMuted,
        },
      }),
    [colors, theme],
  );

  return (
    <ScreenContainer>
      <View style={styles.headerWrap}>
        <ScreenTitle title="Activities" showBackButton />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add activity"
          onPress={() => router.push('/activities/new')}
          style={({ pressed }) => [styles.addButton, pressed ? styles.addButtonPressed : null]}
        >
          <Ionicons name="add" size={theme.sizing.iconLg} color={colors.accent} />
        </Pressable>
      </View>

      <View style={styles.listCard}>
        {activities.map((activity, index) => {
          const isLast = index === activities.length - 1;
          const count = activityEntryCounts.get(activity.id) ?? 0;

          return (
            <View key={activity.id}>
              <Pressable
                style={({ pressed }) => [styles.row, pressed ? styles.rowPressed : null]}
                onLongPress={() => Alert.alert('Activity options', 'Custom activity options are coming soon.')}
              >
                <View style={styles.rowLeft}>
                  <Ionicons name={activity.icon} size={theme.sizing.iconMd} color={colors.textSecondary} />
                  <Text style={styles.rowTitle}>{activity.name}</Text>
                </View>
                <View style={styles.rowRight}>
                  <Text style={styles.rowMeta}>{count > 0 ? `${count}x` : ''}</Text>
                  <Ionicons name="chevron-forward" size={theme.sizing.iconSm} color={colors.textMuted} />
                </View>
              </Pressable>
              {!isLast ? <View style={styles.divider} /> : null}
            </View>
          );
        })}

        {activities.length === 0 ? (
          <View style={styles.row}>
            <EmptyText>No activities yet. Tap + to create one.</EmptyText>
          </View>
        ) : null}
      </View>

      <NoteText>Long press Activity for more options</NoteText>
    </ScreenContainer>
  );
}
