import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../theme/use-theme';
import type { Partner } from '../../../types/models';
import { PartnerAvatar } from './PartnerAvatar';

type PartnerDetailModalProps = {
  visible: boolean;
  partner: Partner | null;
  partnerFlag: string;
  partnerAge: number | null;
  entriesCount: number;
  onClose: () => void;
  onEdit: () => void;
  onOpenEntries: () => void;
  onOpenInstagram: (value: string) => void;
  onOpenWhatsApp: (value: string) => void;
};

function formatBirthday(birthday: string | null) {
  if (!birthday) return 'Birthday not set';
  const date = new Date(`${birthday}T00:00:00`);
  if (Number.isNaN(+date)) return birthday;
  return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

export function PartnerDetailModal({
  visible,
  partner,
  partnerFlag,
  partnerAge,
  entriesCount,
  onClose,
  onEdit,
  onOpenEntries,
  onOpenInstagram,
  onOpenWhatsApp,
}: PartnerDetailModalProps) {
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
          gap: theme.spacing.md,
          minHeight: '72%',
        },
        handle: {
          alignSelf: 'center',
          width: 42,
          height: 4,
          borderRadius: 2,
          backgroundColor: colors.borderMuted,
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
        actionButton: {
          minWidth: 56,
          height: 38,
          borderRadius: theme.radius.pill,
          borderWidth: 1,
          borderColor: colors.borderMuted,
          backgroundColor: colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: theme.spacing.sm,
        },
        actionText: {
          color: colors.accent,
          fontSize: theme.typography.fontSize.sm,
          lineHeight: theme.typography.lineHeight.sm,
          fontWeight: '700',
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
        sectionCard: {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.borderMuted,
          borderRadius: theme.radius.lg,
          overflow: 'hidden',
        },
        row: {
          minHeight: theme.sizing.buttonHeight + 16,
          paddingHorizontal: theme.spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        rowLeft: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.sm,
          flex: 1,
        },
        rowText: {
          flex: 1,
          gap: 2,
        },
        label: {
          color: colors.textPrimary,
          fontSize: theme.typography.fontSize.md,
          lineHeight: theme.typography.lineHeight.md,
          fontWeight: '500',
        },
        value: {
          color: colors.textSecondary,
          fontSize: theme.typography.fontSize.sm,
          lineHeight: theme.typography.lineHeight.sm,
        },
        notesRow: {
          minHeight: theme.sizing.buttonHeight + 16,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: theme.spacing.sm,
        },
        notesScroll: {
          marginTop: 2,
          maxHeight: theme.spacing.huge * 2,
        },
      }),
    [colors, theme],
  );

  const birthdayLabel =
    partnerAge !== null ? `${formatBirthday(partner?.birthday ?? null)} (${partnerAge}y)` : formatBirthday(partner?.birthday ?? null);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          {partner ? (
            <>
              <View style={styles.header}>
                <Pressable style={styles.iconButton} onPress={onClose}>
                  <Ionicons name="close" size={theme.sizing.iconMd} color={colors.textPrimary} />
                </Pressable>
                <Text style={styles.title}>Partner</Text>
                <Pressable style={styles.actionButton} onPress={onEdit}>
                  <Text style={styles.actionText}>Edit</Text>
                </Pressable>
              </View>

              <View style={styles.profile}>
                <PartnerAvatar uri={partner.avatarUri} name={partner.name} size={96} />
                <Text style={styles.name}>{`${partner.name} ${partnerFlag}`}</Text>
              </View>

              <View style={styles.sectionCard}>
                <View style={styles.row}>
                  <View style={styles.rowLeft}>
                    <Ionicons name="gift-outline" size={theme.sizing.iconMd} color={colors.textSecondary} />
                    <View style={styles.rowText}>
                      <Text style={styles.label}>Birthday</Text>
                      <Text style={styles.value}>{birthdayLabel}</Text>
                    </View>
                  </View>
                </View>
                <Pressable style={styles.row} onPress={onOpenEntries}>
                  <View style={styles.rowLeft}>
                    <Ionicons name="list-outline" size={theme.sizing.iconMd} color={colors.textSecondary} />
                    <View style={styles.rowText}>
                      <Text style={styles.label}>Entries</Text>
                      <Text style={styles.value}>{entriesCount}x</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={theme.sizing.iconSm} color={colors.textMuted} />
                </Pressable>
              </View>

              <View style={styles.sectionCard}>
                <Pressable style={styles.row} onPress={() => onOpenInstagram(partner.instagram)}>
                  <View style={styles.rowLeft}>
                    <Ionicons name="logo-instagram" size={theme.sizing.iconMd} color={colors.textSecondary} />
                    <View style={styles.rowText}>
                      <Text style={styles.label}>Instagram</Text>
                      <Text style={styles.value}>{partner.instagram || 'Not set'}</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={theme.sizing.iconSm} color={colors.textMuted} />
                </Pressable>
                <Pressable style={styles.row} onPress={() => onOpenWhatsApp(partner.phoneNumber)}>
                  <View style={styles.rowLeft}>
                    <Ionicons name="logo-whatsapp" size={theme.sizing.iconMd} color={colors.textSecondary} />
                    <View style={styles.rowText}>
                      <Text style={styles.label}>WhatsApp</Text>
                      <Text style={styles.value}>{partner.phoneNumber || 'Not set'}</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={theme.sizing.iconSm} color={colors.textMuted} />
                </Pressable>
              </View>

              <View style={styles.sectionCard}>
                <View style={styles.notesRow}>
                  <Ionicons name="document-text-outline" size={theme.sizing.iconMd} color={colors.textSecondary} />
                  <View style={styles.rowText}>
                    <Text style={styles.label}>Notes</Text>
                    <ScrollView style={styles.notesScroll} nestedScrollEnabled showsVerticalScrollIndicator={false}>
                      <Text style={styles.value}>{partner.notes || 'No notes'}</Text>
                    </ScrollView>
                  </View>
                </View>
              </View>
            </>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
