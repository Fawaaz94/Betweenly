import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { ActionMenuModal } from '../../components/ui/action-menu-modal';
import { EmptyText, NoteText, ScreenContainer, ScreenTitle } from '../../components/ui/primitives';
import { countryCodeToFlagEmoji } from '../../constants/countries';
import { useTheme } from '../../theme/use-theme';
import { useAppState } from '../app/app-context';
import { PartnerDetailModal } from './components/PartnerDetailModal';
import { PartnerEntriesModal } from './components/PartnerEntriesModal';
import { PartnerListCard } from './components/PartnerListCard';
import { openExternalUrl } from './open-external-url';

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

  const closeModals = useCallback(() => {
    setSelectedPartnerId(null);
    setEntriesModalVisible(false);
  }, []);

  const openInstagram = useCallback(async (value: string) => {
    await openExternalUrl({
      value,
      toUrl: toInstagramUrl,
      missingTitle: 'No Instagram',
      missingMessage: 'No Instagram handle has been saved.',
      unavailableTitle: 'Unavailable',
      unavailableMessage: 'Instagram cannot be opened on this device.',
    });
  }, []);

  const openWhatsApp = useCallback(async (value: string) => {
    await openExternalUrl({
      value,
      toUrl: toWhatsAppUrl,
      missingTitle: 'No phone number',
      missingMessage: 'No valid phone number has been saved.',
      unavailableTitle: 'Unavailable',
      unavailableMessage: 'WhatsApp is not available on this device.',
    });
  }, []);

  const selectedPartnerFlag = useMemo(
    () => countryCodeToFlagEmoji(selectedPartner?.nationality ?? ''),
    [selectedPartner],
  );
  const selectedPartnerAge = useMemo(
    () => getAgeFromBirthday(selectedPartner?.birthday ?? null),
    [selectedPartner],
  );

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
      }),
    [colors, theme],
  );

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
          <PartnerListCard
            key={partner.id}
            partner={partner}
            entryCount={entryCount}
            birthdayLabel={partner.birthday ? formatBirthday(partner.birthday) : 'Birthday not set'}
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
          />
        );
      })}

      {partners.length === 0 ? <EmptyText>No partners added yet. Tap + to add your first partner.</EmptyText> : null}
      <NoteText>Tap a partner to view details, links, and entries.</NoteText>

      <PartnerDetailModal
        visible={Boolean(selectedPartner)}
        partner={selectedPartner}
        partnerFlag={selectedPartnerFlag}
        partnerAge={selectedPartnerAge}
        entriesCount={selectedPartnerEvents.length}
        onClose={closeModals}
        onEdit={() => {
          if (!selectedPartner) return;
          const partnerId = selectedPartner.id;
          closeModals();
          router.push({ pathname: '/partner/[id]', params: { id: partnerId } });
        }}
        onOpenEntries={() => {
          setSelectedMonth('all');
          setEntriesModalVisible(true);
        }}
        onOpenInstagram={(value) => void openInstagram(value)}
        onOpenWhatsApp={(value) => void openWhatsApp(value)}
      />

      <PartnerEntriesModal
        visible={entriesModalVisible}
        partner={selectedPartner}
        partnerFlag={selectedPartnerFlag}
        monthKeys={monthKeys}
        selectedMonth={selectedMonth}
        filteredEntries={filteredEntries}
        onSelectMonth={setSelectedMonth}
        onClose={() => setEntriesModalVisible(false)}
        onEntryPress={(eventId) => {
          closeModals();
          router.push(`/events/${eventId}`);
        }}
      />

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
                            closeModals();
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
