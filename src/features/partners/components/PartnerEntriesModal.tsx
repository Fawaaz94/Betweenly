import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EmptyText } from '../../../components/ui/primitives';
import { useTheme } from '../../../theme/use-theme';
import type { IntimacyEvent, Partner } from '../../../types/models';
import { PartnerAvatar } from './PartnerAvatar';

type PartnerEntriesModalProps = {
  visible: boolean;
  partner: Partner | null;
  partnerFlag: string;
  monthKeys: string[];
  selectedMonth: 'all' | string;
  filteredEntries: IntimacyEvent[];
  onSelectMonth: (value: 'all' | string) => void;
  onClose: () => void;
  onEntryPress: (eventId: string) => void;
};

function formatMonthLabel(monthKey: string) {
  const date = new Date(`${monthKey}-01T00:00:00`);
  if (Number.isNaN(+date)) return monthKey;
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

function formatEventDateTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(+date)) return iso;
  return date.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function PartnerEntriesModal({
  visible,
  partner,
  partnerFlag,
  monthKeys,
  selectedMonth,
  filteredEntries,
  onSelectMonth,
  onClose,
  onEntryPress,
}: PartnerEntriesModalProps) {
  const { colors, theme } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        backdrop: {
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(0,0,0,0.32)',
        },
        sheet: {
          backgroundColor: colors.appBg,
          borderTopLeftRadius: theme.radius.xxl,
          borderTopRightRadius: theme.radius.xxl,
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.md,
          paddingBottom: theme.spacing.xxl,
          minHeight: '72%',
        },
        handle: {
          alignSelf: 'center',
          width: 42,
          height: 4,
          borderRadius: 2,
          backgroundColor: colors.borderMuted,
          marginBottom: theme.spacing.md,
        },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        iconButton: {
          width: 38,
          height: 38,
          borderRadius: theme.radius.pill,
          borderWidth: 1,
          borderColor: colors.borderMuted,
          backgroundColor: colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
        },
        title: {
          color: colors.textPrimary,
          fontSize: theme.typography.fontSize.lg,
          lineHeight: theme.typography.lineHeight.lg,
          fontWeight: '700',
        },
        profile: {
          alignItems: 'center',
          gap: theme.spacing.xs,
          marginTop: theme.spacing.sm,
        },
        name: {
          color: colors.textPrimary,
          fontSize: theme.typography.fontSize.xl,
          lineHeight: theme.typography.lineHeight.xl,
          fontWeight: '700',
        },
        entriesMetaRow: {
          marginTop: theme.spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        entriesHeaderLabel: {
          color: colors.textSecondary,
          fontSize: theme.typography.fontSize.sm,
          lineHeight: theme.typography.lineHeight.sm,
          fontWeight: '600',
        },
        entriesHeaderValue: {
          color: colors.textPrimary,
          fontSize: theme.typography.fontSize.md,
          lineHeight: theme.typography.lineHeight.md,
          fontWeight: '700',
        },
        monthFilters: {
          marginTop: theme.spacing.sm,
          marginBottom: theme.spacing.md,
          flexGrow: 0,
        },
        monthChip: {
          borderWidth: 1,
          borderColor: colors.borderMuted,
          backgroundColor: colors.surface,
          borderRadius: theme.radius.pill,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.xs,
          marginRight: theme.spacing.xs,
        },
        monthChipActive: {
          backgroundColor: colors.accent,
          borderColor: colors.accentPressed,
        },
        monthChipText: {
          color: colors.textPrimary,
          fontSize: theme.typography.fontSize.sm,
          lineHeight: theme.typography.lineHeight.sm,
          fontWeight: '600',
        },
        monthChipTextActive: {
          color: colors.textOnAccent,
        },
        sectionCard: {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.borderMuted,
          borderRadius: theme.radius.lg,
          overflow: 'hidden',
        },
        entryRow: {
          minHeight: theme.sizing.buttonHeight + 10,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottomWidth: 1,
          borderBottomColor: colors.borderMuted,
        },
        entryLeft: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.sm,
          flex: 1,
        },
        entryTitle: {
          color: colors.textPrimary,
          fontSize: theme.typography.fontSize.md,
          lineHeight: theme.typography.lineHeight.md,
          fontWeight: '600',
        },
        entryMeta: {
          color: colors.textSecondary,
          fontSize: theme.typography.fontSize.sm,
          lineHeight: theme.typography.lineHeight.sm,
        },
        emptyWrap: {
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.md,
        },
      }),
    [colors, theme],
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Pressable style={styles.iconButton} onPress={onClose}>
              <Ionicons name="close" size={theme.sizing.iconMd} color={colors.textPrimary} />
            </Pressable>
            <Text style={styles.title}>Entries</Text>
            <View style={styles.iconButton}>
              <Ionicons name="calendar-outline" size={theme.sizing.iconMd} color={colors.textSecondary} />
            </View>
          </View>

          {partner ? (
            <>
              <View style={styles.profile}>
                <PartnerAvatar uri={partner.avatarUri} name={partner.name} size={96} />
                <Text style={styles.name}>{`${partner.name} ${partnerFlag}`}</Text>
              </View>

              <View style={styles.entriesMetaRow}>
                <Text style={styles.entriesHeaderLabel}>Month filter</Text>
                <Text style={styles.entriesHeaderValue}>Total: {filteredEntries.length}</Text>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.monthFilters}>
                <Pressable
                  onPress={() => onSelectMonth('all')}
                  style={[styles.monthChip, selectedMonth === 'all' ? styles.monthChipActive : null]}
                >
                  <Text style={[styles.monthChipText, selectedMonth === 'all' ? styles.monthChipTextActive : null]}>All</Text>
                </Pressable>
                {monthKeys.map((key) => (
                  <Pressable
                    key={key}
                    onPress={() => onSelectMonth(key)}
                    style={[styles.monthChip, selectedMonth === key ? styles.monthChipActive : null]}
                  >
                    <Text style={[styles.monthChipText, selectedMonth === key ? styles.monthChipTextActive : null]}>
                      {formatMonthLabel(key)}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              <View style={styles.sectionCard}>
                {filteredEntries.map((entry) => (
                  <Pressable key={entry.id} style={styles.entryRow} onPress={() => onEntryPress(entry.id)}>
                    <View style={styles.entryLeft}>
                      <PartnerAvatar uri={partner.avatarUri} name={partner.name} />
                      <View>
                        <Text style={styles.entryTitle}>{entry.eventType === 'partnered' ? 'Partnered' : 'Solo'} entry</Text>
                        <Text style={styles.entryMeta}>{formatEventDateTime(entry.dateTimeStart)}</Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={theme.sizing.iconSm} color={colors.textMuted} />
                  </Pressable>
                ))}

                {filteredEntries.length === 0 ? (
                  <View style={styles.emptyWrap}>
                    <EmptyText>No entries for this month.</EmptyText>
                  </View>
                ) : null}
              </View>
            </>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
