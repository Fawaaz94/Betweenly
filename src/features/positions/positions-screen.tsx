import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { ActionMenuModal } from '../../components/ui/action-menu-modal';
import { EmptyText, NoteText, ScreenContainer, ScreenTitle } from '../../components/ui/primitives';
import { useTheme } from '../../theme/use-theme';
import { useAppState } from '../app/app-context';

function eventContainsPositionName(positionsLabel: string, positionName: string) {
  const needle = positionName.trim().toLowerCase();
  if (!needle) return false;

  return positionsLabel
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .some((value) => value === needle);
}

export function PositionsScreen() {
  const router = useRouter();
  const { colors, theme } = useTheme();
  const { positions, events, deletePosition } = useAppState();
  const [actionPositionId, setActionPositionId] = useState<string | null>(null);

  const actionPosition = useMemo(
    () => positions.find((position) => position.id === actionPositionId) ?? null,
    [actionPositionId, positions],
  );

  const positionEntryCounts = useMemo(() => {
    const counts = new Map<string, number>();

    for (const position of positions) {
      let count = 0;
      for (const event of events) {
        if ((event.positionIds ?? []).includes(position.id)) {
          count += 1;
          continue;
        }
        if (eventContainsPositionName(event.positions, position.name)) {
          count += 1;
        }
      }
      counts.set(position.id, count);
    }

    return counts;
  }, [events, positions]);

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
        <ScreenTitle title="Positions" showBackButton />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add position"
          onPress={() => router.push('/positions/new')}
          style={({ pressed }) => [styles.addButton, pressed ? styles.addButtonPressed : null]}
        >
          <Ionicons name="add" size={theme.sizing.iconLg} color={colors.accent} />
        </Pressable>
      </View>

      <View style={styles.listCard}>
        {positions.map((position, index) => {
          const isLast = index === positions.length - 1;
          const count = positionEntryCounts.get(position.id) ?? 0;

          return (
            <View key={position.id}>
              <Pressable
                style={({ pressed }) => [styles.row, pressed ? styles.rowPressed : null]}
                onLongPress={() => setActionPositionId(position.id)}
              >
                <View style={styles.rowLeft}>
                  <Ionicons name="body-outline" size={theme.sizing.iconMd} color={colors.textSecondary} />
                  <Text style={styles.rowTitle}>{position.name}</Text>
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

        {positions.length === 0 ? (
          <View style={styles.row}>
            <EmptyText>No positions yet. Tap + to create one.</EmptyText>
          </View>
        ) : null}
      </View>

      <NoteText>Long press Position for more options</NoteText>

      <ActionMenuModal
        visible={Boolean(actionPosition)}
        title={actionPosition ? actionPosition.name : 'Position'}
        onClose={() => setActionPositionId(null)}
        options={
          actionPosition
            ? [
                {
                  key: 'edit',
                  label: 'Edit',
                  onPress: () => {
                    router.push({ pathname: '/positions/[id]', params: { id: actionPosition.id } });
                  },
                },
                {
                  key: 'delete',
                  label: 'Delete',
                  destructive: true,
                  onPress: () => {
                    Alert.alert('Delete position?', 'This removes the position from this device.', [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () => {
                          void deletePosition(actionPosition.id);
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
