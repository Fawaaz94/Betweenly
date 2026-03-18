import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SlideUpSheet } from '../../components/ui/slide-up-sheet';
import { formatDateTime } from '../../lib/date';
import { useTheme } from '../../theme/use-theme';
import { useAppState } from '../app/app-context';
import type { AppMedia } from '../../types/models';

function getExtension(uri: string, fileName: string | null | undefined) {
  const filePart = (fileName ?? uri).split('?')[0];
  const ext = filePart.slice(filePart.lastIndexOf('.') + 1).toLowerCase();
  return ext && ext !== filePart ? ext : 'jpg';
}

function toProtectionLabel(value: string) {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return 'Not used';
  if (normalized.includes('not used')) return 'Not used';
  if (normalized.includes('used')) return 'Used';
  return value;
}

export function EventDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, theme } = useTheme();
  const { events, media, partners, saveMedia, updateEvent } = useAppState();
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  const event = events.find((item) => item.id === id);
  const eventPartner = useMemo(
    () => partners.find((partner) => partner.name.trim().toLowerCase() === (event?.partnerName ?? '').trim().toLowerCase()) ?? null,
    [event?.partnerName, partners],
  );
  const eventMedia = useMemo(() => {
    if (!event) return [];
    const byId = new Map(media.map((item) => [item.id, item]));
    return (event.mediaIds ?? []).map((mediaId) => byId.get(mediaId)).filter((item): item is AppMedia => Boolean(item));
  }, [event, media]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        header: {
          minHeight: 52,
          paddingHorizontal: theme.spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: theme.spacing.xs,
        },
        actionGroup: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.xs,
        },
        iconButton: {
          width: 42,
          height: 42,
          borderRadius: theme.radius.pill,
          borderWidth: 1,
          borderColor: colors.borderMuted,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.surface,
        },
        body: {
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: theme.spacing.xxl,
        },
        title: {
          marginTop: theme.spacing.xs,
          color: colors.accent,
          fontSize: theme.typography.fontSize.xxl,
          lineHeight: theme.typography.lineHeight.xxl,
          fontWeight: '700',
        },
        dateText: {
          color: colors.textSecondary,
          fontSize: theme.typography.fontSize.md,
          lineHeight: theme.typography.lineHeight.md,
          fontWeight: '500',
        },
        partnerChip: {
          marginTop: theme.spacing.lg,
          alignSelf: 'flex-start',
          borderWidth: 1,
          borderColor: colors.borderMuted,
          borderRadius: theme.radius.pill,
          backgroundColor: colors.surface,
          paddingVertical: theme.spacing.xs,
          paddingHorizontal: theme.spacing.sm,
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.xs,
        },
        avatar: {
          width: 30,
          height: 30,
          borderRadius: 15,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          backgroundColor: colors.surfaceAlt,
        },
        avatarImage: {
          width: '100%',
          height: '100%',
        },
        avatarText: {
          color: colors.textPrimary,
          fontSize: theme.typography.fontSize.xs,
          fontWeight: '700',
        },
        partnerText: {
          color: colors.textPrimary,
          fontSize: theme.typography.fontSize.lg,
          lineHeight: theme.typography.lineHeight.lg,
          fontWeight: '500',
        },
        rowWrap: {
          marginTop: theme.spacing.lg,
          gap: theme.spacing.md,
        },
        detailRow: {
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: theme.spacing.sm,
        },
        detailLabel: {
          color: colors.textMuted,
          fontSize: theme.typography.fontSize.md,
          lineHeight: theme.typography.lineHeight.md,
          fontWeight: '500',
        },
        detailValue: {
          color: colors.textPrimary,
          fontSize: theme.typography.fontSize.xl,
          lineHeight: theme.typography.lineHeight.xl,
          fontWeight: '500',
        },
        detailTextWrap: {
          flex: 1,
          gap: 2,
        },
        imagesSection: {
          marginTop: theme.spacing.xl,
          gap: theme.spacing.sm,
        },
        imagesTitle: {
          color: colors.textSecondary,
          fontSize: theme.typography.fontSize.md,
          lineHeight: theme.typography.lineHeight.md,
          fontWeight: '600',
        },
        mediaScroll: {
          paddingRight: theme.spacing.sm,
        },
        mediaTile: {
          width: 120,
          height: 120,
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: colors.borderMuted,
          overflow: 'hidden',
          marginRight: theme.spacing.sm,
          backgroundColor: colors.surfaceAlt,
        },
        mediaImage: {
          width: '100%',
          height: '100%',
        },
      }),
    [colors, theme],
  );

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)');
  };

  const handleAddImage = async () => {
    if (!event || isUploadingMedia) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to attach images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.9,
      allowsEditing: false,
    });

    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset?.uri) {
      Alert.alert('Add image failed', 'No image was selected.');
      return;
    }

    try {
      setIsUploadingMedia(true);
      const mediaDirectory = `${FileSystem.documentDirectory}betweenly-media/`;
      await FileSystem.makeDirectoryAsync(mediaDirectory, { intermediates: true });
      const extension = getExtension(asset.uri, asset.fileName);
      const destination = `${mediaDirectory}media_${Date.now()}_${Math.floor(Math.random() * 100000)}.${extension}`;
      await FileSystem.copyAsync({ from: asset.uri, to: destination });

      const savedMedia = await saveMedia({
        uri: destination,
        mediaType: 'image',
        sourceFilename: asset.fileName ?? null,
      });

      const nextMediaIds = Array.from(new Set([...(event.mediaIds ?? []), savedMedia.id]));
      await updateEvent(event.id, { mediaIds: nextMediaIds });
    } catch {
      Alert.alert('Add image failed', 'Please try again.');
    } finally {
      setIsUploadingMedia(false);
    }
  };

  if (!event) {
    return (
      <SlideUpSheet onClose={handleClose}>
        <View style={styles.body}>
          <Text style={styles.title}>Event not found</Text>
        </View>
      </SlideUpSheet>
    );
  }

  const noteValue = event.notes.trim();
  const partnerName = event.partnerName?.trim() ?? '';
  const hasPartner = Boolean(partnerName);
  const hasNotes = Boolean(noteValue);
  const hasImages = eventMedia.length > 0;

  return (
    <SlideUpSheet onClose={handleClose}>
      <View style={styles.header}>
        <Pressable style={styles.iconButton} onPress={handleClose}>
          <Ionicons name="close" size={theme.sizing.iconMd} color={colors.textMuted} />
        </Pressable>

        <View style={styles.actionGroup}>
          <Pressable style={styles.iconButton} onPress={() => void handleAddImage()}>
            <Ionicons
              name={isUploadingMedia ? 'hourglass-outline' : 'image-outline'}
              size={theme.sizing.iconMd}
              color={colors.textSecondary}
            />
          </Pressable>
          <Pressable style={styles.iconButton} onPress={() => router.replace(`/events/edit/${event.id}`)}>
            <Ionicons name="create-outline" size={theme.sizing.iconMd} color={colors.accent} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{event.positions || 'Activity'}</Text>
        <Text style={styles.dateText}>{formatDateTime(event.dateTimeStart)}</Text>

        {hasPartner ? (
          <View style={styles.partnerChip}>
            <View style={styles.avatar}>
              {eventPartner?.avatarUri ? (
                <Image source={{ uri: eventPartner.avatarUri }} style={styles.avatarImage} resizeMode="cover" />
              ) : (
                <Text style={styles.avatarText}>{partnerName.slice(0, 1).toUpperCase()}</Text>
              )}
            </View>
            <Text style={styles.partnerText}>{partnerName}</Text>
          </View>
        ) : null}

        <View style={styles.rowWrap}>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={theme.sizing.iconMd} color={colors.textMuted} />
            <View style={styles.detailTextWrap}>
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailValue}>{`${event.durationMinutes} min`}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="shield-checkmark-outline" size={theme.sizing.iconMd} color={colors.textMuted} />
            <View style={styles.detailTextWrap}>
              <Text style={styles.detailLabel}>Protection</Text>
              <Text style={styles.detailValue}>{toProtectionLabel(event.toysUsed)}</Text>
            </View>
          </View>

          {hasNotes ? (
            <View style={styles.detailRow}>
              <Ionicons name="create-outline" size={theme.sizing.iconMd} color={colors.textMuted} />
              <View style={styles.detailTextWrap}>
                <Text style={styles.detailLabel}>Note</Text>
                <Text style={styles.detailValue}>{noteValue}</Text>
              </View>
            </View>
          ) : null}
        </View>

        {hasImages ? (
          <View style={styles.imagesSection}>
            <Text style={styles.imagesTitle}>Images</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mediaScroll}>
              {eventMedia.map((item) => (
                <View key={item.id} style={styles.mediaTile}>
                  <Image source={{ uri: item.uri }} style={styles.mediaImage} resizeMode="cover" />
                </View>
              ))}
            </ScrollView>
          </View>
        ) : null}
      </ScrollView>
    </SlideUpSheet>
  );
}
