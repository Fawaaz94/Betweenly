import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Alert, Image, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { countryCodeToFlagEmoji } from '../../constants/countries';
import { ActionMenuModal } from '../../components/ui/action-menu-modal';
import { EmptyText, NoteText, ScreenContainer, ScreenTitle } from '../../components/ui/primitives';
import { useTheme } from '../../theme/use-theme';
import { useAppState } from '../app/app-context';

function toWhatsAppUrl(phoneNumber: string) {
  const digits = phoneNumber.replace(/[^\d]/g, '');
  if (digits.length < 6) return null;
  return `https://wa.me/${digits}`;
}

function toInstagramUrl(handle: string) {
  const cleaned = handle.trim();
  if (!cleaned) return null;
  if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) return cleaned;
  return `https://instagram.com/${cleaned.replace(/^@+/, '')}`;
}

function formatBirthday(birthday: string | null) {
  if (!birthday) return 'Birthday not set';
  const date = new Date(`${birthday}T00:00:00`);
  if (Number.isNaN(+date)) return birthday;
  return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

function getAgeFromBirthday(birthday: string | null) {
  if (!birthday) return null;
  const date = new Date(`${birthday}T00:00:00`);
  if (Number.isNaN(+date)) return null;

  const now = new Date();
  let age = now.getFullYear() - date.getFullYear();
  const hasBirthdayPassedThisYear =
    now.getMonth() > date.getMonth() || (now.getMonth() === date.getMonth() && now.getDate() >= date.getDate());
  if (!hasBirthdayPassedThisYear) age -= 1;
  return age >= 0 ? age : null;
}

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

export function PartnersScreen() {
  const router = useRouter();
  const { colors, theme } = useTheme();
  const { partners, events, deletePartner, setDefaultPartner } = useAppState();
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [actionPartnerId, setActionPartnerId] = useState<string | null>(null);
  const longPressPartnerIdRef = useRef<string | null>(null);
  const [entriesModalVisible, setEntriesModalVisible] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<'all' | string>('all');

  const selectedPartner = useMemo(
    () => partners.find((partner) => partner.id === selectedPartnerId) ?? null,
    [partners, selectedPartnerId],
  );
  const actionPartner = useMemo(
    () => partners.find((partner) => partner.id === actionPartnerId) ?? null,
    [partners, actionPartnerId],
  );

  const entryCountByPartnerName = useMemo(() => {
    const counts = new Map<string, number>();
    for (const event of events) {
      const key = (event.partnerName ?? '').trim().toLowerCase();
      if (!key) continue;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  }, [events]);

  const selectedPartnerEvents = useMemo(() => {
    if (!selectedPartner) return [];
    const partnerName = selectedPartner.name.trim().toLowerCase();
    return events
      .filter((event) => (event.partnerName ?? '').trim().toLowerCase() === partnerName)
      .sort((a, b) => +new Date(b.dateTimeStart) - +new Date(a.dateTimeStart));
  }, [events, selectedPartner]);

  const monthKeys = useMemo(() => {
    const unique = new Set<string>();
    for (const event of selectedPartnerEvents) {
      unique.add(event.dateTimeStart.slice(0, 7));
    }
    return Array.from(unique).sort((a, b) => (a > b ? -1 : 1));
  }, [selectedPartnerEvents]);

  const filteredEntries = useMemo(() => {
    if (selectedMonth === 'all') return selectedPartnerEvents;
    return selectedPartnerEvents.filter((event) => event.dateTimeStart.startsWith(selectedMonth));
  }, [selectedMonth, selectedPartnerEvents]);

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
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: theme.spacing.sm,
        },
        listCardPressed: {
          backgroundColor: colors.surfaceAlt,
        },
        partnerLeft: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.sm,
          flex: 1,
        },
        avatarWrap: {
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: colors.surfaceAlt,
          borderWidth: 1,
          borderColor: colors.borderMuted,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        },
        avatarImage: {
          width: '100%',
          height: '100%',
        },
        avatarText: {
          color: colors.textPrimary,
          fontSize: theme.typography.fontSize.lg,
          lineHeight: theme.typography.lineHeight.lg,
          fontWeight: '700',
        },
        partnerName: {
          color: colors.textPrimary,
          fontSize: theme.typography.fontSize.lg,
          lineHeight: theme.typography.lineHeight.lg,
          fontWeight: '600',
        },
        partnerMeta: {
          color: colors.textSecondary,
          fontSize: theme.typography.fontSize.sm,
          lineHeight: theme.typography.lineHeight.sm,
        },
        defaultBadge: {
          marginTop: 4,
          alignSelf: 'flex-start',
          borderRadius: theme.radius.pill,
          borderWidth: 1,
          borderColor: colors.borderMuted,
          backgroundColor: colors.surfaceAlt,
          paddingHorizontal: theme.spacing.xs,
          paddingVertical: 2,
        },
        defaultBadgeText: {
          color: colors.textSecondary,
          fontSize: theme.typography.fontSize.xs - 1,
          lineHeight: theme.typography.lineHeight.xs,
          fontWeight: '700',
        },
        partnerRight: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.xs,
        },
        entryCount: {
          color: colors.textMuted,
          fontSize: theme.typography.fontSize.md,
          lineHeight: theme.typography.lineHeight.md,
          fontWeight: '500',
        },
        modalBackdrop: {
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(0,0,0,0.32)',
        },
        modalSheet: {
          backgroundColor: colors.appBg,
          borderTopLeftRadius: theme.radius.xxl,
          borderTopRightRadius: theme.radius.xxl,
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.md,
          paddingBottom: theme.spacing.xxl,
          gap: theme.spacing.md,
          minHeight: '72%',
        },
        entriesSheet: {
          backgroundColor: colors.appBg,
          borderTopLeftRadius: theme.radius.xxl,
          borderTopRightRadius: theme.radius.xxl,
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.md,
          paddingBottom: theme.spacing.xxl,
          minHeight: '72%',
        },
        modalHandle: {
          alignSelf: 'center',
          width: 42,
          height: 4,
          borderRadius: 2,
          backgroundColor: colors.borderMuted,
          marginBottom: theme.spacing.md,
        },
        modalHeader: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        modalIconButton: {
          width: 38,
          height: 38,
          borderRadius: theme.radius.pill,
          borderWidth: 1,
          borderColor: colors.borderMuted,
          backgroundColor: colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
        },
        modalActionButton: {
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
        modalActionText: {
          color: colors.accent,
          fontSize: theme.typography.fontSize.sm,
          lineHeight: theme.typography.lineHeight.sm,
          fontWeight: '700',
        },
        modalTitle: {
          color: colors.textPrimary,
          fontSize: theme.typography.fontSize.lg,
          lineHeight: theme.typography.lineHeight.lg,
          fontWeight: '700',
        },
        profileWrap: {
          alignItems: 'center',
          gap: theme.spacing.xs,
          marginTop: theme.spacing.sm,
        },
        modalAvatar: {
          width: 96,
          height: 96,
          borderRadius: 48,
          borderWidth: 1,
          borderColor: colors.borderMuted,
          backgroundColor: colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        },
        modalName: {
          color: colors.textPrimary,
          fontSize: theme.typography.fontSize.xl,
          lineHeight: theme.typography.lineHeight.xl,
          fontWeight: '700',
        },
        modalSub: {
          color: colors.textSecondary,
          fontSize: theme.typography.fontSize.sm,
          lineHeight: theme.typography.lineHeight.sm,
        },
        profileMetaRow: {
          width: '100%',
          flexDirection: 'row',
          alignItems: 'stretch',
          gap: theme.spacing.xs,
          marginTop: theme.spacing.xs,
        },
        profileMetaCard: {
          flex: 1,
          borderWidth: 1,
          borderColor: colors.borderMuted,
          borderRadius: theme.radius.md,
          backgroundColor: colors.surface,
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: theme.spacing.xs,
          gap: 2,
        },
        profileMetaLabel: {
          color: colors.textMuted,
          fontSize: theme.typography.fontSize.xs,
          lineHeight: theme.typography.lineHeight.xs,
          fontWeight: '600',
        },
        profileMetaValue: {
          color: colors.textPrimary,
          fontSize: theme.typography.fontSize.sm,
          lineHeight: theme.typography.lineHeight.sm,
          fontWeight: '600',
        },
        flagCard: {
          width: 60,
          borderWidth: 1,
          borderColor: colors.borderMuted,
          borderRadius: theme.radius.md,
          backgroundColor: colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
        },
        flagText: {
          fontSize: theme.typography.fontSize.xxl,
          lineHeight: theme.typography.lineHeight.xxl,
        },
        sectionCard: {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.borderMuted,
          borderRadius: theme.radius.lg,
          overflow: 'hidden',
        },
        sectionRow: {
          minHeight: theme.sizing.buttonHeight + 16,
          paddingHorizontal: theme.spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        sectionRowLeft: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.sm,
          flex: 1,
        },
        sectionTextBlock: {
          flex: 1,
          gap: 2,
        },
        sectionLabel: {
          color: colors.textPrimary,
          fontSize: theme.typography.fontSize.md,
          lineHeight: theme.typography.lineHeight.md,
          fontWeight: '500',
        },
        sectionValue: {
          color: colors.textSecondary,
          fontSize: theme.typography.fontSize.sm,
          lineHeight: theme.typography.lineHeight.sm,
          maxWidth: '55%',
          textAlign: 'right',
        },
        sectionSubValue: {
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
        notesIconWrap: {
          paddingTop: 2,
        },
        notesScroll: {
          marginTop: 2,
          maxHeight: theme.spacing.huge * 2,
        },
        notesScrollContent: {
          paddingRight: theme.spacing.xs,
        },
        noteText: {
          color: colors.textSecondary,
          fontSize: theme.typography.fontSize.sm,
          lineHeight: theme.typography.lineHeight.sm,
        },
        entriesMetaRow: {
          marginTop: theme.spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
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
      }),
    [colors, theme],
  );

  const openInstagram = async (handle: string) => {
    const url = toInstagramUrl(handle);
    if (!url) {
      Alert.alert('No Instagram', 'No Instagram handle has been saved.');
      return;
    }

    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert('Unavailable', 'Instagram cannot be opened on this device.');
      return;
    }

    await Linking.openURL(url);
  };

  const openWhatsApp = async (phoneNumber: string) => {
    const url = toWhatsAppUrl(phoneNumber);
    if (!url) {
      Alert.alert('No phone number', 'No valid phone number has been saved.');
      return;
    }

    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert('Unavailable', 'WhatsApp is not available on this device.');
      return;
    }

    await Linking.openURL(url);
  };

  const selectedPartnerFlag = countryCodeToFlagEmoji(selectedPartner?.nationality ?? '');
  const selectedPartnerAge = getAgeFromBirthday(selectedPartner?.birthday ?? null);

  return (
    <ScreenContainer>
      <View style={styles.headerWrap}>
        <ScreenTitle title="Partners" showBackButton />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add partner"
          onPress={() => router.push('/partner/new')}
          style={({ pressed }) => [styles.addButton, pressed ? styles.addButtonPressed : null]}
        >
          <Ionicons name="add" size={theme.sizing.iconLg} color={colors.accent} />
        </Pressable>
      </View>

      {partners.map((partner) => {
        const entryCount = entryCountByPartnerName.get(partner.name.trim().toLowerCase()) ?? 0;
        return (
          <Pressable
            key={partner.id}
            style={({ pressed }) => [styles.listCard, pressed ? styles.listCardPressed : null]}
            onPress={() => {
              if (longPressPartnerIdRef.current === partner.id) {
                longPressPartnerIdRef.current = null;
                return;
              }
              setSelectedMonth('all');
              setEntriesModalVisible(false);
              setSelectedPartnerId(partner.id);
            }}
            onLongPress={() => {
              longPressPartnerIdRef.current = partner.id;
              setActionPartnerId(partner.id);
            }}
          >
            <View style={styles.partnerLeft}>
              <View style={styles.avatarWrap}>
                {partner.avatarUri ? (
                  <Image source={{ uri: partner.avatarUri }} style={styles.avatarImage} resizeMode="cover" />
                ) : (
                  <Text style={styles.avatarText}>{partner.name.slice(0, 1).toUpperCase()}</Text>
                )}
              </View>
              <View>
                <Text style={styles.partnerName}>
                  {`${partner.name} ${countryCodeToFlagEmoji(partner.nationality)}`}
                </Text>
                <Text style={styles.partnerMeta}>{partner.birthday ? formatBirthday(partner.birthday) : 'Birthday not set'}</Text>
                {partner.isDefault ? (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>Default</Text>
                  </View>
                ) : null}
              </View>
            </View>

            <View style={styles.partnerRight}>
              <Text style={styles.entryCount}>{entryCount}x</Text>
              <Ionicons name="chevron-forward" size={theme.sizing.iconSm} color={colors.textMuted} />
            </View>
          </Pressable>
        );
      })}

      {partners.length === 0 ? <EmptyText>No partners added yet. Tap + to add your first partner.</EmptyText> : null}
      <NoteText>Tap a partner to view details, links, and entries.</NoteText>

      <Modal visible={Boolean(selectedPartner)} animationType="slide" transparent onRequestClose={() => setSelectedPartnerId(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />

            {selectedPartner ? (
              <>
                <View style={styles.modalHeader}>
                  <Pressable
                    style={styles.modalIconButton}
                    onPress={() => {
                      setEntriesModalVisible(false);
                      setSelectedPartnerId(null);
                    }}
                  >
                    <Ionicons name="close" size={theme.sizing.iconMd} color={colors.textPrimary} />
                  </Pressable>
                  <Text style={styles.modalTitle}>Partner</Text>
                  <Pressable
                    style={styles.modalActionButton}
                    onPress={() => {
                      const partnerId = selectedPartner.id;
                      setEntriesModalVisible(false);
                      setSelectedPartnerId(null);
                      router.push({ pathname: '/partner/[id]', params: { id: partnerId } });
                    }}
                  >
                    <Text style={styles.modalActionText}>Edit</Text>
                  </Pressable>
                </View>

                <View style={styles.profileWrap}>
                  <View style={styles.modalAvatar}>
                    {selectedPartner.avatarUri ? (
                      <Image source={{ uri: selectedPartner.avatarUri }} style={styles.avatarImage} resizeMode="cover" />
                    ) : (
                      <Text style={styles.avatarText}>{selectedPartner.name.slice(0, 1).toUpperCase()}</Text>
                    )}
                  </View>
                  <Text style={styles.modalName}>
                    {`${selectedPartner.name} ${selectedPartnerFlag}`}
                  </Text>
                </View>

                <View style={styles.sectionCard}>
                  <View style={styles.sectionRow}>
                    <View style={styles.sectionRowLeft}>
                      <Ionicons name="gift-outline" size={theme.sizing.iconMd} color={colors.textSecondary} />
                      <View style={styles.sectionTextBlock}>
                        <Text style={styles.sectionLabel}>Birthday</Text>
                        <Text style={styles.sectionSubValue}>
                          {selectedPartnerAge !== null
                            ? `${formatBirthday(selectedPartner.birthday)} (${selectedPartnerAge}y)`
                            : formatBirthday(selectedPartner.birthday)}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Pressable
                    style={styles.sectionRow}
                    onPress={() => {
                      setSelectedMonth('all');
                      setEntriesModalVisible(true);
                    }}
                  >
                    <View style={styles.sectionRowLeft}>
                      <Ionicons name="list-outline" size={theme.sizing.iconMd} color={colors.textSecondary} />
                      <View style={styles.sectionTextBlock}>
                        <Text style={styles.sectionLabel}>Entries</Text>
                        <Text style={styles.sectionSubValue}>{selectedPartnerEvents.length}x</Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={theme.sizing.iconSm} color={colors.textMuted} />
                  </Pressable>
                </View>

                <View style={styles.sectionCard}>
                  <Pressable style={styles.sectionRow} onPress={() => void openInstagram(selectedPartner.instagram)}>
                    <View style={styles.sectionRowLeft}>
                      <Ionicons name="logo-instagram" size={theme.sizing.iconMd} color={colors.textSecondary} />
                      <View style={styles.sectionTextBlock}>
                        <Text style={styles.sectionLabel}>Instagram</Text>
                        <Text style={styles.sectionSubValue}>{selectedPartner.instagram || 'Not set'}</Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={theme.sizing.iconSm} color={colors.textMuted} />
                  </Pressable>
                  <Pressable style={styles.sectionRow} onPress={() => void openWhatsApp(selectedPartner.phoneNumber)}>
                    <View style={styles.sectionRowLeft}>
                      <Ionicons name="logo-whatsapp" size={theme.sizing.iconMd} color={colors.textSecondary} />
                      <View style={styles.sectionTextBlock}>
                        <Text style={styles.sectionLabel}>WhatsApp</Text>
                        <Text style={styles.sectionSubValue}>{selectedPartner.phoneNumber || 'Not set'}</Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={theme.sizing.iconSm} color={colors.textMuted} />
                  </Pressable>
                </View>

                <View style={styles.sectionCard}>
                  <View style={styles.notesRow}>
                    <View style={styles.notesIconWrap}>
                      <Ionicons name="document-text-outline" size={theme.sizing.iconMd} color={colors.textSecondary} />
                    </View>
                    <View style={styles.sectionTextBlock}>
                      <Text style={styles.sectionLabel}>Notes</Text>
                      <ScrollView
                        style={styles.notesScroll}
                        contentContainerStyle={styles.notesScrollContent}
                        nestedScrollEnabled
                        showsVerticalScrollIndicator={false}
                      >
                        <Text style={styles.sectionSubValue}>{selectedPartner.notes || 'No notes'}</Text>
                      </ScrollView>
                    </View>
                  </View>
                </View>
              </>
            ) : null}
          </View>
        </View>
      </Modal>

      <Modal visible={entriesModalVisible} animationType="slide" transparent onRequestClose={() => setEntriesModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.entriesSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Pressable style={styles.modalIconButton} onPress={() => setEntriesModalVisible(false)}>
                <Ionicons name="close" size={theme.sizing.iconMd} color={colors.textPrimary} />
              </Pressable>
              <Text style={styles.modalTitle}>Entries</Text>
              <View style={styles.modalIconButton}>
                <Ionicons name="calendar-outline" size={theme.sizing.iconMd} color={colors.textSecondary} />
              </View>
            </View>

            {selectedPartner ? (
              <>
                <View style={styles.profileWrap}>
                  <View style={styles.modalAvatar}>
                    {selectedPartner.avatarUri ? (
                      <Image source={{ uri: selectedPartner.avatarUri }} style={styles.avatarImage} resizeMode="cover" />
                    ) : (
                      <Text style={styles.avatarText}>{selectedPartner.name.slice(0, 1).toUpperCase()}</Text>
                    )}
                  </View>
                  <Text style={styles.modalName}>
                    {`${selectedPartner.name} ${selectedPartnerFlag}`}
                  </Text>
                </View>

                <View style={styles.entriesMetaRow}>
                  <Text style={styles.entriesHeaderLabel}>Month filter</Text>
                  <Text style={styles.entriesHeaderValue}>Total: {filteredEntries.length}</Text>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.monthFilters}>
                  <Pressable
                    onPress={() => setSelectedMonth('all')}
                    style={[styles.monthChip, selectedMonth === 'all' ? styles.monthChipActive : null]}
                  >
                    <Text style={[styles.monthChipText, selectedMonth === 'all' ? styles.monthChipTextActive : null]}>All</Text>
                  </Pressable>
                  {monthKeys.map((key) => (
                    <Pressable
                      key={key}
                      onPress={() => setSelectedMonth(key)}
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
                    <Pressable
                      key={entry.id}
                      style={styles.entryRow}
                      onPress={() => {
                        setEntriesModalVisible(false);
                        setSelectedPartnerId(null);
                        router.push(`/events/${entry.id}`);
                      }}
                    >
                      <View style={styles.entryLeft}>
                        <View style={styles.avatarWrap}>
                          {selectedPartner.avatarUri ? (
                            <Image source={{ uri: selectedPartner.avatarUri }} style={styles.avatarImage} resizeMode="cover" />
                          ) : (
                            <Text style={styles.avatarText}>{selectedPartner.name.slice(0, 1).toUpperCase()}</Text>
                          )}
                        </View>
                        <View>
                          <Text style={styles.entryTitle}>{entry.eventType === 'partnered' ? 'Partnered' : 'Solo'} entry</Text>
                          <Text style={styles.entryMeta}>{formatEventDateTime(entry.dateTimeStart)}</Text>
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={theme.sizing.iconSm} color={colors.textMuted} />
                    </Pressable>
                  ))}

                  {filteredEntries.length === 0 ? <EmptyText>No entries for this month.</EmptyText> : null}
                </View>
              </>
            ) : null}
          </View>
        </View>
      </Modal>

      <ActionMenuModal
        visible={Boolean(actionPartner)}
        title={actionPartner ? actionPartner.name : 'Partner'}
        onClose={() => {
          longPressPartnerIdRef.current = null;
          setActionPartnerId(null);
        }}
        options={
          actionPartner
            ? [
                {
                  key: 'default',
                  label: 'Set as default',
                  disabled: actionPartner.isDefault,
                  onPress: () => {
                    void setDefaultPartner(actionPartner.id);
                  },
                },
                {
                  key: 'edit',
                  label: 'Edit',
                  onPress: () => {
                    router.push({ pathname: '/partner/[id]', params: { id: actionPartner.id } });
                  },
                },
                {
                  key: 'delete',
                  label: 'Delete',
                  destructive: true,
                  onPress: () => {
                    Alert.alert('Delete partner?', 'This will remove the partner from this device.', [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () => {
                          void deletePartner(actionPartner.id);
                          if (selectedPartnerId === actionPartner.id) {
                            setSelectedPartnerId(null);
                            setEntriesModalVisible(false);
                          }
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
