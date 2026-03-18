import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleProp, StyleSheet, Text, type TextStyle, View } from 'react-native';
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

function isTruthyText(value: string | null | undefined) {
  return Boolean(value && value.trim());
}

function DetailRow({
  label,
  value,
  labelStyle,
  valueStyle,
}: {
  label: string;
  value: string;
  labelStyle: StyleProp<TextStyle>;
  valueStyle: StyleProp<TextStyle>;
}) {
  return (
    <View style={{ gap: 2 }}>
      <Text style={labelStyle}>{label}</Text>
      <Text style={valueStyle}>{value}</Text>
    </View>
  );
}

export function EventDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, theme } = useTheme();
  const { events, media, saveMedia, updateEvent, deleteEvent } = useAppState();
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  const event = events.find((item) => item.id === id);
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
        headerButton: {
          width: 38,
          height: 38,
          borderRadius: theme.radius.pill,
          borderWidth: 1,
          borderColor: colors.borderMuted,
          backgroundColor: colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
        },
        headerActionRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.xs,
        },
        headerTitle: {
          color: colors.textPrimary,
          fontSize: theme.typography.fontSize.lg,
          lineHeight: theme.typography.lineHeight.lg,
          fontWeight: '700',
        },
        body: {
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: theme.spacing.xxl,
          gap: theme.spacing.md,
        },
        sectionCard: {
          borderWidth: 1,
          borderColor: colors.borderMuted,
          borderRadius: theme.radius.xl,
          backgroundColor: colors.surface,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.md,
          gap: theme.spacing.sm,
        },
        sectionTitle: {
          color: colors.textPrimary,
          fontSize: theme.typography.fontSize.md,
          lineHeight: theme.typography.lineHeight.md,
          fontWeight: '700',
        },
        detailLabel: {
          color: colors.textMuted,
          fontSize: theme.typography.fontSize.xs,
          fontWeight: '600',
        },
        detailValue: {
          color: colors.textPrimary,
          fontSize: theme.typography.fontSize.md,
          fontWeight: '500',
        },
        sectionText: {
          color: colors.textSecondary,
          fontSize: theme.typography.fontSize.sm,
          lineHeight: theme.typography.lineHeight.sm,
        },
        mediaScroll: {
          marginHorizontal: -theme.spacing.xs,
        },
        mediaTile: {
          width: 124,
          height: 124,
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: colors.borderMuted,
          overflow: 'hidden',
          marginHorizontal: theme.spacing.xs,
          backgroundColor: colors.surfaceAlt,
        },
        mediaImage: {
          width: '100%',
          height: '100%',
        },
        actionRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.xs,
        },
        actionButton: {
          flex: 1,
          minHeight: theme.sizing.buttonHeight,
          borderRadius: theme.radius.pill,
          borderWidth: 1,
          borderColor: colors.borderMuted,
          backgroundColor: colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
        },
        actionButtonDanger: {
          borderColor: colors.danger,
          backgroundColor: colors.surfaceAlt,
        },
        actionText: {
          color: colors.accent,
          fontSize: theme.typography.fontSize.md,
          lineHeight: theme.typography.lineHeight.md,
          fontWeight: '700',
        },
        actionDangerText: {
          color: colors.danger,
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
          <Text style={styles.sectionTitle}>Event not found</Text>
          <Text style={styles.sectionText}>This entry was removed or no longer exists.</Text>
        </View>
      </SlideUpSheet>
    );
  }

  return (
    <SlideUpSheet onClose={handleClose}>
      <View style={styles.header}>
        <Pressable style={styles.headerButton} onPress={handleClose}>
          <Ionicons name="close" size={theme.sizing.iconMd} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Event Overview</Text>
        <View style={styles.headerActionRow}>
          <Pressable
            style={styles.headerButton}
            onPress={() => void handleAddImage()}
            accessibilityRole="button"
            accessibilityLabel="Add image"
          >
            <Ionicons
              name={isUploadingMedia ? 'hourglass-outline' : 'image-outline'}
              size={theme.sizing.iconMd}
              color={colors.accent}
            />
          </Pressable>
          <Pressable style={styles.headerButton} onPress={() => router.replace(`/events/edit/${event.id}`)}>
            <Ionicons name="create-outline" size={theme.sizing.iconMd} color={colors.accent} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionCard}>
          <DetailRow label="Date & time" value={formatDateTime(event.dateTimeStart)} labelStyle={styles.detailLabel} valueStyle={styles.detailValue} />
          <DetailRow label="Type" value={event.eventType === 'partnered' ? 'Partnered' : 'Solo'} labelStyle={styles.detailLabel} valueStyle={styles.detailValue} />
          <DetailRow label="Partner" value={event.partnerName || '-'} labelStyle={styles.detailLabel} valueStyle={styles.detailValue} />
          <DetailRow label="Activity" value={event.positions || '-'} labelStyle={styles.detailLabel} valueStyle={styles.detailValue} />
          <DetailRow label="Protection" value={event.toysUsed || 'Protection: Not used'} labelStyle={styles.detailLabel} valueStyle={styles.detailValue} />
          <DetailRow label="Duration" value={`${event.durationMinutes} minutes`} labelStyle={styles.detailLabel} valueStyle={styles.detailValue} />
          <DetailRow label="Location" value={event.location || '-'} labelStyle={styles.detailLabel} valueStyle={styles.detailValue} />
          <DetailRow label="Overall rating" value={`${event.overallRating}/5`} labelStyle={styles.detailLabel} valueStyle={styles.detailValue} />
          <DetailRow label="Emotional rating" value={`${event.emotionalRating}/5`} labelStyle={styles.detailLabel} valueStyle={styles.detailValue} />
          <DetailRow label="Visibility" value={event.isSharedWithPartner ? 'Shared' : 'Private'} labelStyle={styles.detailLabel} valueStyle={styles.detailValue} />
          <DetailRow label="End time" value={event.dateTimeEnd ? formatDateTime(event.dateTimeEnd) : '-'} labelStyle={styles.detailLabel} valueStyle={styles.detailValue} />
        </View>

        {isTruthyText(event.notes) ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.sectionText}>{event.notes}</Text>
          </View>
        ) : null}

        {isTruthyText(event.whatWorkedWell) ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>What Worked Well</Text>
            <Text style={styles.sectionText}>{event.whatWorkedWell}</Text>
          </View>
        ) : null}

        {isTruthyText(event.whatToTryNext) ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>What To Try Next</Text>
            <Text style={styles.sectionText}>{event.whatToTryNext}</Text>
          </View>
        ) : null}

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Images</Text>
          {eventMedia.length === 0 ? <Text style={styles.sectionText}>No images attached yet.</Text> : null}
          {eventMedia.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mediaScroll}>
              {eventMedia.map((item) => (
                <View key={item.id} style={styles.mediaTile}>
                  <Image source={{ uri: item.uri }} style={styles.mediaImage} resizeMode="cover" />
                </View>
              ))}
            </ScrollView>
          ) : null}
        </View>

        <View style={styles.actionRow}>
          <Pressable style={styles.actionButton} onPress={handleClose}>
            <Text style={styles.actionText}>Close</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={() => router.replace(`/events/edit/${event.id}`)}>
            <Text style={styles.actionText}>Edit</Text>
          </Pressable>
          <Pressable
            style={[styles.actionButton, styles.actionButtonDanger]}
            onPress={() => {
              Alert.alert('Delete event?', 'This removes the entry from this device.', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: async () => {
                    await deleteEvent(event.id);
                    handleClose();
                  },
                },
              ]);
            }}
          >
            <Text style={[styles.actionText, styles.actionDangerText]}>Delete</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SlideUpSheet>
  );
}
