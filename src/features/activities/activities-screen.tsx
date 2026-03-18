import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { ActionMenuModal } from '../../components/ui/action-menu-modal';
import { EmptyText, NoteText, ScreenContainer, ScreenTitle } from '../../components/ui/primitives';
import { useTheme } from '../../theme/use-theme';
import { useAppState } from '../app/app-context';

export function ActivitiesScreen() {
  const router = useRouter();
  const { colors, theme } = useTheme();
  const { activities, events, deleteActivity, setDefaultActivity } = useAppState();
  const [actionActivityId, setActionActivityId] = useState<string | null>(null);

  const actionActivity = useMemo(
    () => activities.find((activity) => activity.id === actionActivityId) ?? null,
    [activities, actionActivityId],
  );

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
        defaultBadge: {
          borderRadius: theme.radius.pill,
          borderWidth: 1,
          borderColor: colors.borderMuted,
          paddingHorizontal: theme.spacing.xs,
          paddingVertical: 2,
          backgroundColor: colors.surfaceAlt,
        },
        defaultBadgeText: {
          color: colors.textSecondary,
          fontSize: theme.typography.fontSize.xs - 1,
          lineHeight: theme.typography.lineHeight.xs,
          fontWeight: '700',
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
                onLongPress={() => setActionActivityId(activity.id)}
              >
                <View style={styles.rowLeft}>
                  <Ionicons name={activity.icon} size={theme.sizing.iconMd} color={colors.textSecondary} />
                  <Text style={styles.rowTitle}>{activity.name}</Text>
                  {activity.isDefault ? (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>Default</Text>
                    </View>
                  ) : null}
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

      <ActionMenuModal
        visible={Boolean(actionActivity)}
        title={actionActivity ? actionActivity.name : 'Activity'}
        onClose={() => setActionActivityId(null)}
        options={
          actionActivity
            ? [
                {
                  key: 'default',
                  label: 'Set as default',
                  disabled: actionActivity.isDefault,
                  onPress: () => {
                    void setDefaultActivity(actionActivity.id);
                  },
                },
                {
                  key: 'edit',
                  label: 'Edit',
                  onPress: () => {
                    router.push({ pathname: '/activities/[id]', params: { id: actionActivity.id } });
                  },
                },
                {
                  key: 'delete',
                  label: 'Delete',
                  destructive: true,
                  onPress: () => {
                    Alert.alert('Delete activity?', 'This removes the activity from this device.', [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () => {
                          void deleteActivity(actionActivity.id);
                        },
                      },
                    ]);
                  },
                },
              ]
            : []
        }
      />
    </ScreenContainer>
  );
}
