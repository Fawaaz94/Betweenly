import DateTimePicker, {type DateTimePickerEvent} from '@react-native-community/datetimepicker';
import {Ionicons} from '@expo/vector-icons';
import {useRouter} from 'expo-router';
import {useEffect, useMemo, useState} from 'react';
import {Alert, Image, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View,} from 'react-native';
import {toDateInput, toTimeInput} from '../../lib/date';
import type {CreateEventInput, IntimacyEvent} from '../../types/models';
import {EVENT_RATING_OPTIONS, type EventRatingValue, toEventRatingValue} from './event-rating';
import {useTheme} from '../../theme/use-theme';
import {useAppState} from '../app/app-context';

type PickerMode = 'date' | 'time' | null;

function formatDateLabel(date: Date) {
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

function getDefaultActivityId(activityIds: string[], isDefaultById: Map<string, boolean>, sexActivityId: string | null) {
  const explicitDefault = activityIds.find((id) => isDefaultById.get(id));
  if (explicitDefault) return explicitDefault;
  if (sexActivityId) return sexActivityId;
  return activityIds[0] ?? null;
}

function parseIsoDate(iso: string) {
  const parsed = new Date(iso);
  return Number.isNaN(+parsed) ? new Date() : parsed;
}

function mergeDateKeyWithCurrentTime(dateKey: string | null) {
  if (!dateKey) return new Date();
  const [year, month, day] = dateKey.split('-').map((value) => Number.parseInt(value, 10));
  if (!year || !month || !day) return new Date();

  const now = new Date();
  now.setFullYear(year, month - 1, day);
  return now;
}

function isProtectionUsedValue(value: string) {
  return !value.toLowerCase().includes('not used');
}

type EventEntryScreenProps = {
  mode: 'create' | 'edit';
  initialEvent?: IntimacyEvent;
};

export function EventEntryScreen({ mode, initialEvent }: EventEntryScreenProps) {
  const router = useRouter();
  const { colors, theme, themeMode } = useTheme();
  const { saveEvent, updateEvent, user, activities, partners, events, activeLogDate, setActiveLogDate } = useAppState();
  const isEditMode = mode === 'edit' && Boolean(initialEvent);

  const [entryDate, setEntryDate] = useState(() =>
    initialEvent ? parseIsoDate(initialEvent.dateTimeStart) : mergeDateKeyWithCurrentTime(activeLogDate),
  );
  const [pickerMode, setPickerMode] = useState<PickerMode>(null);
  const [iosPickerValue, setIosPickerValue] = useState(() =>
    initialEvent ? parseIsoDate(initialEvent.dateTimeStart) : mergeDateKeyWithCurrentTime(activeLogDate),
  );
  const [durationMinutes, setDurationMinutes] = useState(String(initialEvent?.durationMinutes ?? 45));
  const [notes, setNotes] = useState(initialEvent?.notes ?? '');
  const [noteHeight, setNoteHeight] = useState(120);
  const [rating, setRating] = useState<EventRatingValue>(() => toEventRatingValue(initialEvent?.overallRating));
  const [protectionUsed, setProtectionUsed] = useState(() => (initialEvent ? isProtectionUsedValue(initialEvent.toysUsed) : true));
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [pendingActivityId, setPendingActivityId] = useState<string | null>(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [pendingPartnerId, setPendingPartnerId] = useState<string | null>(null);
  const [hydratedEventId, setHydratedEventId] = useState<string | null>(null);
  const [activityModalVisible, setActivityModalVisible] = useState(false);
  const [partnerModalVisible, setPartnerModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activityIds = useMemo(() => activities.map((activity) => activity.id), [activities]);
  const isDefaultByActivityId = useMemo(
    () => new Map(activities.map((activity) => [activity.id, activity.isDefault])),
    [activities],
  );
  const sexActivityId = useMemo(
    () => activities.find((activity) => activity.name.trim().toLowerCase() === 'sex')?.id ?? null,
    [activities],
  );

  useEffect(() => {
    if (mode !== 'create') return;
    if (activities.length === 0) {
      setSelectedActivityId(null);
      return;
    }

    const exists = selectedActivityId ? activities.some((activity) => activity.id === selectedActivityId) : false;
    if (exists) return;

    const defaultActivityId = getDefaultActivityId(activityIds, isDefaultByActivityId, sexActivityId);
    setSelectedActivityId(defaultActivityId);
  }, [activities, activityIds, isDefaultByActivityId, mode, selectedActivityId, sexActivityId]);

  useEffect(() => {
    if (mode !== 'create') return;
    const seededDate = mergeDateKeyWithCurrentTime(activeLogDate);
    setEntryDate(seededDate);
    setIosPickerValue(seededDate);
  }, [activeLogDate, mode]);

  useEffect(() => {
    if (!isEditMode || !initialEvent) return;
    if (hydratedEventId === initialEvent.id) return;
    if (activities.length === 0) return;

    const matchedActivity = activities.find(
      (activity) => activity.name.trim().toLowerCase() === initialEvent.positions.trim().toLowerCase(),
    );
    const matchedPartner = partners.find(
      (partner) => partner.name.trim().toLowerCase() === (initialEvent.partnerName ?? '').trim().toLowerCase(),
    );

    setEntryDate(parseIsoDate(initialEvent.dateTimeStart));
    setIosPickerValue(parseIsoDate(initialEvent.dateTimeStart));
    setDurationMinutes(String(initialEvent.durationMinutes));
    setNotes(initialEvent.notes ?? '');
    setRating(toEventRatingValue(initialEvent.overallRating));
    setProtectionUsed(isProtectionUsedValue(initialEvent.toysUsed));
    setSelectedActivityId(
      matchedActivity?.id ?? getDefaultActivityId(activityIds, isDefaultByActivityId, sexActivityId),
    );
    setPendingActivityId(matchedActivity?.id ?? null);
    setSelectedPartnerId(matchedPartner?.id ?? null);
    setPendingPartnerId(matchedPartner?.id ?? null);
    setHydratedEventId(initialEvent.id);
  }, [
    activities,
    activityIds,
    hydratedEventId,
    initialEvent,
    isDefaultByActivityId,
    isEditMode,
    partners,
    sexActivityId,
  ]);

  useEffect(() => {
    if (!selectedPartnerId) return;
    const exists = partners.some((partner) => partner.id === selectedPartnerId);
    if (!exists) setSelectedPartnerId(null);
  }, [partners, selectedPartnerId]);

  const selectedActivity = useMemo(
    () => activities.find((activity) => activity.id === selectedActivityId) ?? null,
    [activities, selectedActivityId],
  );
  const selectedPartner = useMemo(
    () => partners.find((partner) => partner.id === selectedPartnerId) ?? null,
    [partners, selectedPartnerId],
  );

  const shouldHidePartnerAndProtectionSections = selectedActivity?.name.trim().toLowerCase() === 'masturbation';

  const activityEntryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const activity of activities) {
      const needle = activity.name.trim().toLowerCase();
      const count = events.filter((event) => event.positions.trim().toLowerCase().includes(needle)).length;
      counts.set(activity.id, count);
    }
    return counts;
  }, [activities, events]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.appBg,
        },
        content: {
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: theme.spacing.xxl,
          gap: theme.spacing.md,
        },
        header: {
          marginTop: theme.spacing.md,
          marginBottom: theme.spacing.xs,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        headerButton: {
          minWidth: 82,
          height: 40,
          borderRadius: theme.radius.pill,
          borderWidth: 1,
          borderColor: colors.borderMuted,
          backgroundColor: colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: theme.spacing.sm,
        },
        headerButtonText: {
          color: colors.accent,
          fontSize: theme.typography.fontSize.md,
          lineHeight: theme.typography.lineHeight.md,
          fontWeight: '600',
        },
        headerButtonMutedText: {
          color: colors.textMuted,
        },
        headerTitle: {
          color: colors.textPrimary,
          fontSize: theme.typography.fontSize.xl,
          lineHeight: theme.typography.lineHeight.xl,
          fontWeight: '700',
        },
        sectionCard: {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.borderMuted,
          borderRadius: theme.radius.xl,
          overflow: 'hidden',
        },
        row: {
          minHeight: theme.sizing.buttonHeight + 2,
          paddingHorizontal: theme.spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: theme.spacing.sm,
        },
        rowPressed: {
          backgroundColor: colors.surfaceAlt,
        },
        rowLabel: {
          color: colors.textPrimary,
          fontSize: theme.typography.fontSize.lg,
          lineHeight: theme.typography.lineHeight.lg,
          fontWeight: '500',
        },
        rowValueAccent: {
          color: colors.accent,
          fontSize: theme.typography.fontSize.lg,
          lineHeight: theme.typography.lineHeight.lg,
          fontWeight: '600',
        },
        divider: {
          marginLeft: theme.spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderMuted,
        },
        sectionTitleRow: {
          minHeight: theme.sizing.buttonHeight + 2,
          paddingHorizontal: theme.spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        selectedRow: {
          minHeight: theme.sizing.buttonHeight + 2,
          paddingHorizontal: theme.spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.sm,
        },
        selectedText: {
          color: colors.textPrimary,
          fontSize: theme.typography.fontSize.lg,
          lineHeight: theme.typography.lineHeight.lg,
          fontWeight: '500',
        },
        protectionWrap: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.xs,
        },
        protectionButton: {
          minWidth: 92,
          minHeight: 40,
          borderWidth: 1,
          borderColor: colors.borderMuted,
          borderRadius: theme.radius.pill,
          backgroundColor: colors.surfaceAlt,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: theme.spacing.md,
        },
        protectionButtonActive: {
          borderColor: colors.accent,
          backgroundColor: colors.chipActiveBg,
        },
        protectionText: {
          color: colors.textSecondary,
          fontSize: theme.typography.fontSize.md,
          lineHeight: theme.typography.lineHeight.md,
          fontWeight: '600',
        },
        protectionTextActive: {
          color: colors.accent,
        },
        ratingWrap: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: theme.spacing.xs,
          flexShrink: 1,
          marginTop: theme.spacing.xs,
        },
        ratingOption: {
          width: 50,
          height: 50,
          borderRadius: 25,
          borderWidth: 1,
          borderColor: colors.borderMuted,
          backgroundColor: colors.surfaceAlt,
          alignItems: 'center',
          justifyContent: 'center',
        },
        ratingOptionActive: {
          borderColor: colors.accent,
          backgroundColor: colors.chipActiveBg,
        },
        ratingEmojiWrap: {
          width: 30,
          height: 30,
          alignItems: 'center',
          justifyContent: 'center',
        },
        ratingEmoji: {
          fontSize: 25,
          lineHeight: 30,
          textAlign: 'center',
          textAlignVertical: 'center',
          includeFontPadding: false,
        },
        ratingHint: {
          marginTop: theme.spacing.xs,
          marginBottom: theme.spacing.sm,
          marginRight: theme.spacing.md,
          textAlign: 'right',
          color: colors.textSecondary,
          fontSize: theme.typography.fontSize.sm,
          lineHeight: theme.typography.lineHeight.sm,
          fontWeight: '600',
        },
        ratingRow: {
          paddingTop: theme.spacing.xs + 2,
        },
        durationInput: {
          minHeight: theme.sizing.buttonHeight + 2,
          paddingHorizontal: theme.spacing.md,
          color: colors.textPrimary,
          fontSize: theme.typography.fontSize.lg,
          lineHeight: theme.typography.lineHeight.lg,
        },
        noteInput: {
          minHeight: 120,
          borderWidth: 1,
          borderColor: colors.borderMuted,
          borderRadius: theme.radius.xl,
          backgroundColor: colors.surface,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.md,
          color: colors.textPrimary,
          fontSize: theme.typography.fontSize.md,
          lineHeight: theme.typography.lineHeight.md,
          textAlignVertical: 'top',
        },
        avatar: {
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: colors.surfaceAlt,
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
          fontSize: theme.typography.fontSize.xs,
          lineHeight: theme.typography.lineHeight.xs,
          fontWeight: '700',
        },
        errorText: {
          color: colors.danger,
          fontSize: theme.typography.fontSize.sm,
          lineHeight: theme.typography.lineHeight.sm,
        },
        modalBackdrop: {
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.34)',
          justifyContent: 'center',
          paddingHorizontal: theme.spacing.md,
        },
        modalSheet: {
          backgroundColor: colors.appBg,
          borderRadius: theme.radius.xxl,
          borderWidth: 1,
          borderColor: colors.borderMuted,
          overflow: 'hidden',
        },
        modalHeader: {
          minHeight: theme.sizing.buttonHeight + 8,
          paddingHorizontal: theme.spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        modalHeaderTitle: {
          color: colors.textPrimary,
          fontSize: theme.typography.fontSize.xl,
          lineHeight: theme.typography.lineHeight.xl,
          fontWeight: '700',
        },
        modalHeaderButton: {
          minWidth: 82,
          height: 40,
          borderRadius: theme.radius.pill,
          borderWidth: 1,
          borderColor: colors.borderMuted,
          backgroundColor: colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: theme.spacing.sm,
        },
        modalHeaderButtonText: {
          color: colors.accent,
          fontSize: theme.typography.fontSize.md,
          lineHeight: theme.typography.lineHeight.md,
          fontWeight: '600',
        },
        tabRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.xs,
          marginHorizontal: theme.spacing.md,
          marginBottom: theme.spacing.sm,
          marginTop: theme.spacing.xs,
        },
        tab: {
          flex: 1,
          minHeight: 36,
          borderRadius: theme.radius.pill,
          borderWidth: 1,
          borderColor: colors.borderMuted,
          backgroundColor: colors.surfaceAlt,
          alignItems: 'center',
          justifyContent: 'center',
        },
        tabActive: {
          backgroundColor: colors.surface,
        },
        tabText: {
          color: colors.textSecondary,
          fontSize: theme.typography.fontSize.sm,
          lineHeight: theme.typography.lineHeight.sm,
          fontWeight: '600',
        },
        tabTextActive: {
          color: colors.textPrimary,
        },
        modalListCard: {
          marginHorizontal: theme.spacing.md,
          marginBottom: theme.spacing.md,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.borderMuted,
          borderRadius: theme.radius.xl,
          overflow: 'hidden',
        },
        modalRow: {
          minHeight: theme.sizing.buttonHeight + 4,
          paddingHorizontal: theme.spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: theme.spacing.sm,
        },
        modalRowLeft: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.sm,
          flex: 1,
        },
        modalRowLabel: {
          color: colors.textPrimary,
          fontSize: theme.typography.fontSize.xl,
          lineHeight: theme.typography.lineHeight.xl,
          fontWeight: '500',
        },
        iosPickerSheet: {
          width: '100%',
          borderWidth: 1,
          borderColor: colors.borderMuted,
          borderRadius: theme.radius.lg,
          backgroundColor: colors.surface,
          overflow: 'hidden',
        },
        iosPickerModalBackdrop: {
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.34)',
          justifyContent: 'center',
          paddingHorizontal: theme.spacing.md,
        },
        iosPickerHeader: {
          minHeight: theme.sizing.buttonHeight,
          paddingHorizontal: theme.spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderMuted,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        iosPickerTitle: {
          color: colors.textPrimary,
          fontSize: theme.typography.fontSize.md,
          lineHeight: theme.typography.lineHeight.md,
          fontWeight: '600',
        },
      }),
    [colors, theme],
  );

  const openPicker = (mode: Exclude<PickerMode, null>) => {
    if (Platform.OS === 'ios') {
      setIosPickerValue(entryDate);
    }
    setPickerMode(mode);
  };

  const handleAndroidPickerChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS !== 'android') return;
    if (event.type === 'dismissed') {
      setPickerMode(null);
      return;
    }
    if (selected) {
      setEntryDate(selected);
    }
    setPickerMode(null);
  };

  const handleSave = async () => {
    if (isSaving) return;
    setErrorMessage(null);

    if (!selectedActivity) {
      setErrorMessage('Select an activity.');
      return;
    }

    const parsedDuration = Number.parseInt(durationMinutes.trim(), 10);
    if (!Number.isInteger(parsedDuration) || parsedDuration < 0) {
      setErrorMessage('Duration cannot be negative.');
      return;
    }

    try {
      setIsSaving(true);
      const partnerForEvent = shouldHidePartnerAndProtectionSections ? null : selectedPartner;
      const protectionValue = shouldHidePartnerAndProtectionSections
        ? 'Protection: Not used'
        : protectionUsed
          ? 'Protection: Used'
          : 'Protection: Not used';
      const payload: CreateEventInput = {
        ownerUserId: user?.email ?? 'local_user',
        eventType: partnerForEvent ? 'partnered' : 'solo',
        partnerName: partnerForEvent?.name ?? null,
        dateTimeStart: `${toDateInput(entryDate)}T${toTimeInput(entryDate)}:00`,
        dateTimeEnd: null,
        durationMinutes: parsedDuration,
        location: initialEvent?.location ?? 'Not set',
        overallRating: rating,
        emotionalRating: rating,
        notes: notes.trim(),
        positions: selectedActivity.name,
        toysUsed: protectionValue,
        whatWorkedWell: initialEvent?.whatWorkedWell ?? '',
        whatToTryNext: initialEvent?.whatToTryNext ?? '',
        isSharedWithPartner: Boolean(partnerForEvent && (initialEvent?.isSharedWithPartner ?? user?.relationshipMode === 'linked')),
      };

      if (isEditMode && initialEvent) {
        const updated = await updateEvent(initialEvent.id, payload);
        if (!updated) {
          throw new Error('Unable to update event.');
        }
        router.replace(`/events/${updated.id}`);
      } else {
        await saveEvent(payload);
        setActiveLogDate(null);
        router.replace('/(tabs)');
      }
    } catch {
      setErrorMessage('Unable to save. Please try again.');
      Alert.alert('Unable to save', 'Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const closeComposer = () => {
    if (!isEditMode) {
      setActiveLogDate(null);
    }
    if (router.canGoBack()) {
      router.back();
      return;
    }
    if (isEditMode && initialEvent) {
      router.replace(`/events/${initialEvent.id}`);
      return;
    }
    router.replace('/(tabs)');
  };

  const sortedActivities = useMemo(
    () => [...activities].sort((a, b) => (a.isDefault === b.isDefault ? a.name.localeCompare(b.name) : a.isDefault ? -1 : 1)),
    [activities],
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable onPress={closeComposer} style={styles.headerButton}>
            <Text style={[styles.headerButtonText, styles.headerButtonMutedText]}>Cancel</Text>
          </Pressable>
          <Text style={styles.headerTitle}>{isEditMode ? 'Edit Entry' : 'New Entry'}</Text>
          <Pressable onPress={() => void handleSave()} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>{isSaving ? 'Saving...' : 'Save'}</Text>
          </Pressable>
        </View>

        <View style={styles.sectionCard}>
          <Pressable onPress={() => openPicker('time')} style={({ pressed }) => [styles.row, pressed ? styles.rowPressed : null]}>
            <Text style={styles.rowLabel}>Time</Text>
            <Text style={styles.rowValueAccent}>{toTimeInput(entryDate)}</Text>
          </Pressable>
          <View style={styles.divider} />
          <Pressable onPress={() => openPicker('date')} style={({ pressed }) => [styles.row, pressed ? styles.rowPressed : null]}>
            <Text style={styles.rowLabel}>Date</Text>
            <Text style={styles.rowValueAccent}>{formatDateLabel(entryDate)}</Text>
          </Pressable>
        </View>

        <View style={styles.sectionCard}>
          <Pressable
            onPress={() => {
              setPendingActivityId(selectedActivityId);
              setActivityModalVisible(true);
            }}
            style={({ pressed }) => [styles.sectionTitleRow, pressed ? styles.rowPressed : null]}
          >
            <Text style={styles.rowLabel}>Select Activities</Text>
            <Ionicons name="chevron-forward" size={theme.sizing.iconSm} color={colors.textMuted} />
          </Pressable>
          {selectedActivity ? (
            <>
              <View style={styles.divider} />
              <View style={styles.selectedRow}>
                <Ionicons name={selectedActivity.icon} size={theme.sizing.iconMd} color={colors.accent} />
                <Text style={styles.selectedText}>{selectedActivity.name}</Text>
              </View>
            </>
          ) : null}
        </View>

        {!shouldHidePartnerAndProtectionSections ? (
          <View style={styles.sectionCard}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Protection</Text>
              <View style={styles.protectionWrap}>
                <Pressable
                  onPress={() => setProtectionUsed(true)}
                  style={[styles.protectionButton, protectionUsed ? styles.protectionButtonActive : null]}
                >
                  <Text style={[styles.protectionText, protectionUsed ? styles.protectionTextActive : null]}>Used</Text>
                </Pressable>
                <Pressable
                  onPress={() => setProtectionUsed(false)}
                  style={[styles.protectionButton, !protectionUsed ? styles.protectionButtonActive : null]}
                >
                  <Text style={[styles.protectionText, !protectionUsed ? styles.protectionTextActive : null]}>Not Used</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ) : null}

        <View style={styles.sectionCard}>
          <View style={[styles.row, styles.ratingRow]}>
            <Text style={styles.rowLabel}>Rating</Text>
            <View style={styles.ratingWrap}>
              {EVENT_RATING_OPTIONS.map((option) => {
                const isActive = rating === option.value;
                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="button"
                    accessibilityLabel={option.label}
                    onPress={() => setRating(option.value)}
                    style={[styles.ratingOption, isActive ? styles.ratingOptionActive : null]}
                  >
                    <View style={styles.ratingEmojiWrap}>
                      <Text style={styles.ratingEmoji}>{option.emoji}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <Text style={styles.ratingHint}>
            {EVENT_RATING_OPTIONS.find((option) => option.value === rating)?.label ?? 'Okay'}
          </Text>
        </View>

        {!shouldHidePartnerAndProtectionSections ? (
          <View style={styles.sectionCard}>
            <Pressable
              onPress={() => {
                setPendingPartnerId(selectedPartnerId);
                setPartnerModalVisible(true);
              }}
              style={({ pressed }) => [styles.sectionTitleRow, pressed ? styles.rowPressed : null]}
            >
              <Text style={styles.rowLabel}>Select Partners</Text>
              <Ionicons name="chevron-forward" size={theme.sizing.iconSm} color={colors.textMuted} />
            </Pressable>
            {selectedPartner ? (
              <>
                <View style={styles.divider} />
                <View style={styles.selectedRow}>
                  <View style={styles.avatar}>
                    {selectedPartner.avatarUri ? (
                      <Image source={{ uri: selectedPartner.avatarUri }} style={styles.avatarImage} resizeMode="cover" />
                    ) : (
                      <Text style={styles.avatarText}>{selectedPartner.name.slice(0, 1).toUpperCase()}</Text>
                    )}
                  </View>
                  <Text style={styles.selectedText}>{selectedPartner.name}</Text>
                </View>
              </>
            ) : null}
          </View>
        ) : null}

        <View style={styles.sectionCard}>
          <TextInput
            value={durationMinutes}
            onChangeText={setDurationMinutes}
            style={styles.durationInput}
            keyboardType="number-pad"
            placeholder="Duration"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <TextInput
          value={notes}
          onChangeText={setNotes}
          multiline
          onContentSizeChange={(event) => {
            const nextHeight = Math.max(120, Math.min(260, Math.ceil(event.nativeEvent.contentSize.height) + 14));
            setNoteHeight(nextHeight);
          }}
          style={[styles.noteInput, { height: noteHeight }]}
          placeholder="Note"
          placeholderTextColor={colors.textMuted}
        />

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        {Platform.OS === 'android' && pickerMode ? (
          <DateTimePicker value={entryDate} mode={pickerMode} display="default" onChange={handleAndroidPickerChange} />
        ) : null}
      </ScrollView>

      <Modal
        visible={Platform.OS === 'ios' && Boolean(pickerMode)}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerMode(null)}
      >
        <View style={styles.iosPickerModalBackdrop}>
          <View style={styles.iosPickerSheet}>
            <View style={styles.iosPickerHeader}>
              <Pressable onPress={() => setPickerMode(null)}>
                <Text style={styles.headerButtonText}>Cancel</Text>
              </Pressable>
              <Text style={styles.iosPickerTitle}>{pickerMode === 'date' ? 'Select Date' : 'Select Time'}</Text>
              <Pressable
                onPress={() => {
                  setEntryDate(iosPickerValue);
                  setPickerMode(null);
                }}
              >
                <Text style={styles.headerButtonText}>Done</Text>
              </Pressable>
            </View>
            {pickerMode ? (
              <DateTimePicker
                value={iosPickerValue}
                mode={pickerMode}
                display="spinner"
                onChange={(_, selected) => {
                  if (selected) setIosPickerValue(selected);
                }}
                themeVariant={themeMode}
              />
            ) : null}
          </View>
        </View>
      </Modal>

      <Modal visible={activityModalVisible} animationType="slide" transparent onRequestClose={() => setActivityModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Pressable
                style={styles.modalHeaderButton}
                onPress={() => {
                  setPendingActivityId(selectedActivityId);
                  setActivityModalVisible(false);
                }}
              >
                <Text style={styles.modalHeaderButtonText}>Cancel</Text>
              </Pressable>
              <Text style={styles.modalHeaderTitle}>Select Activities</Text>
              <Pressable
                style={styles.modalHeaderButton}
                onPress={() => {
                  setSelectedActivityId(pendingActivityId);
                  setActivityModalVisible(false);
                }}
              >
                <Text style={styles.modalHeaderButtonText}>Select</Text>
              </Pressable>
            </View>

            <View style={styles.tabRow}>
              <View style={styles.tab}>
                <Text style={styles.tabText}>Name</Text>
              </View>
              <View style={styles.tab}>
                <Text style={styles.tabText}>Entries</Text>
              </View>
              <View style={[styles.tab, styles.tabActive]}>
                <Text style={[styles.tabText, styles.tabTextActive]}>Custom</Text>
              </View>
            </View>

            <View style={styles.modalListCard}>
              {sortedActivities.map((activity, index) => {
                const isLast = index === sortedActivities.length - 1;
                const isSelected = pendingActivityId === activity.id;

                return (
                  <View key={activity.id}>
                    <Pressable style={styles.modalRow} onPress={() => setPendingActivityId(activity.id)}>
                      <View style={styles.modalRowLeft}>
                        <Ionicons name={activity.icon} size={theme.sizing.iconMd} color={colors.textSecondary} />
                        <Text style={styles.modalRowLabel}>{activity.name}</Text>
                      </View>
                      <View style={styles.modalRowLeft}>
                        {isSelected ? <Ionicons name="checkmark" size={theme.sizing.iconMd} color={colors.accent} /> : null}
                        <Text style={styles.tabText}>{activityEntryCounts.get(activity.id) ?? 0}</Text>
                        <Ionicons name="reorder-three-outline" size={theme.sizing.iconMd} color={colors.textMuted} />
                      </View>
                    </Pressable>
                    {!isLast ? <View style={styles.divider} /> : null}
                  </View>
                );
              })}
              <View style={styles.divider} />
              <Pressable
                style={styles.modalRow}
                onPress={() => {
                  setActivityModalVisible(false);
                  router.push('/activities/new');
                }}
              >
                <View style={[styles.modalRowLeft, { justifyContent: 'center' }]}>
                  <Ionicons name="add" size={theme.sizing.iconMd} color={colors.accent} />
                  <Text style={[styles.modalRowLabel, { color: colors.accent }]}>New</Text>
                </View>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={partnerModalVisible} animationType="slide" transparent onRequestClose={() => setPartnerModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Pressable
                style={styles.modalHeaderButton}
                onPress={() => {
                  setPendingPartnerId(selectedPartnerId);
                  setPartnerModalVisible(false);
                }}
              >
                <Text style={styles.modalHeaderButtonText}>Cancel</Text>
              </Pressable>
              <Text style={styles.modalHeaderTitle}>Select Partners</Text>
              <Pressable
                style={styles.modalHeaderButton}
                onPress={() => {
                  setSelectedPartnerId(pendingPartnerId);
                  setPartnerModalVisible(false);
                }}
              >
                <Text style={styles.modalHeaderButtonText}>Select</Text>
              </Pressable>
            </View>

            <View style={styles.modalListCard}>
              <Pressable style={styles.modalRow} onPress={() => setPendingPartnerId(null)}>
                <View style={styles.modalRowLeft}>
                  <Ionicons name="person-outline" size={theme.sizing.iconMd} color={colors.textSecondary} />
                  <Text style={styles.modalRowLabel}>No partner</Text>
                </View>
                {pendingPartnerId === null ? <Ionicons name="checkmark" size={theme.sizing.iconMd} color={colors.accent} /> : null}
              </Pressable>
              <View style={styles.divider} />
              {partners.map((partner, index) => {
                const isLast = index === partners.length - 1;
                const isSelected = pendingPartnerId === partner.id;
                return (
                  <View key={partner.id}>
                    <Pressable style={styles.modalRow} onPress={() => setPendingPartnerId(partner.id)}>
                      <View style={styles.modalRowLeft}>
                        <View style={styles.avatar}>
                          {partner.avatarUri ? (
                            <Image source={{ uri: partner.avatarUri }} style={styles.avatarImage} resizeMode="cover" />
                          ) : (
                            <Text style={styles.avatarText}>{partner.name.slice(0, 1).toUpperCase()}</Text>
                          )}
                        </View>
                        <Text style={styles.modalRowLabel}>{partner.name}</Text>
                      </View>
                      {isSelected ? <Ionicons name="checkmark" size={theme.sizing.iconMd} color={colors.accent} /> : null}
                    </Pressable>
                    {!isLast ? <View style={styles.divider} /> : null}
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export function LogEventScreen() {
  return <EventEntryScreen mode="create" />;
}
