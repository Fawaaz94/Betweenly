import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { useMemo, useState } from 'react';
import { Alert, Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { EmptyText, NoteText, ScreenContainer, ScreenTitle } from '../../components/ui/primitives';
import { useTheme } from '../../theme/use-theme';
import { useAppState } from '../app/app-context';

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(+date)) return value;
  return date.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function MediaGalleryScreen() {
  const { colors, theme } = useTheme();
  const { media, saveMedia, deleteMedia } = useAppState();
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const galleryItems = useMemo(
    () => [...media].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [media],
  );

  const selectedItem = useMemo(
    () => galleryItems.find((item) => item.id === selectedMediaId) ?? null,
    [galleryItems, selectedMediaId],
  );

  const getExtension = (uri: string, fileName: string | null | undefined) => {
    const filePart = (fileName ?? uri).split('?')[0];
    const ext = filePart.slice(filePart.lastIndexOf('.') + 1).toLowerCase();
    return ext && ext !== filePart ? ext : 'jpg';
  };

  const handleUpload = async () => {
    if (isUploading) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to add private media.');
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
      Alert.alert('Upload failed', 'No media was selected.');
      return;
    }

    try {
      setIsUploading(true);
      const mediaDirectory = `${FileSystem.documentDirectory}betweenly-media/`;
      await FileSystem.makeDirectoryAsync(mediaDirectory, { intermediates: true });
      const extension = getExtension(asset.uri, asset.fileName);
      const destination = `${mediaDirectory}media_${Date.now()}_${Math.floor(Math.random() * 100000)}.${extension}`;
      await FileSystem.copyAsync({ from: asset.uri, to: destination });

      await saveMedia({
        uri: destination,
        mediaType: 'image',
        sourceFilename: asset.fileName ?? null,
      });
    } catch {
      Alert.alert('Upload failed', 'Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const confirmDelete = (mediaId: string) => {
    const item = galleryItems.find((mediaItem) => mediaItem.id === mediaId);
    if (!item) return;

    Alert.alert('Delete media?', 'This removes the media from this app only.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await FileSystem.deleteAsync(item.uri, { idempotent: true });
            } catch {
              // Keep app flow resilient even if file deletion fails.
            }
            await deleteMedia(mediaId);
            if (selectedMediaId === mediaId) {
              setSelectedMediaId(null);
            }
          })();
        },
      },
    ]);
  };

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
        grid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing.sm,
        },
        tile: {
          width: '48.5%',
          borderWidth: 1,
          borderColor: colors.borderMuted,
          borderRadius: theme.radius.lg,
          backgroundColor: colors.surface,
          overflow: 'hidden',
        },
        image: {
          width: '100%',
          aspectRatio: 1,
          backgroundColor: colors.surfaceAlt,
        },
        meta: {
          padding: theme.spacing.sm,
          gap: 2,
        },
        title: {
          color: colors.textPrimary,
          fontSize: theme.typography.fontSize.sm,
          lineHeight: theme.typography.lineHeight.sm,
          fontWeight: '600',
        },
        subtitle: {
          color: colors.textSecondary,
          fontSize: theme.typography.fontSize.xs,
          lineHeight: theme.typography.lineHeight.xs,
        },
        badge: {
          marginTop: theme.spacing.xxs,
          alignSelf: 'flex-start',
          borderWidth: 1,
          borderColor: colors.borderMuted,
          borderRadius: theme.radius.pill,
          paddingHorizontal: theme.spacing.xs,
          paddingVertical: 2,
          backgroundColor: colors.surfaceAlt,
        },
        badgeText: {
          color: colors.textMuted,
          fontSize: theme.typography.fontSize.xs - 1,
          lineHeight: theme.typography.lineHeight.xs,
          fontWeight: '600',
        },
        modalBackdrop: {
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.92)',
          justifyContent: 'center',
        },
        closeButton: {
          position: 'absolute',
          top: theme.spacing.huge,
          right: theme.spacing.lg,
          width: 40,
          height: 40,
          borderRadius: theme.radius.pill,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255,255,255,0.16)',
        },
        modalImage: {
          width: '100%',
          height: '72%',
        },
        modalMeta: {
          alignSelf: 'center',
          marginTop: theme.spacing.md,
          color: '#FFFFFF',
          fontSize: theme.typography.fontSize.sm,
          lineHeight: theme.typography.lineHeight.sm,
        },
      }),
    [colors, theme],
  );

  return (
    <ScreenContainer>
      <View style={styles.headerWrap}>
        <ScreenTitle title="Media Gallery" subtitle="Private media saved in this app" showBackButton />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Upload media"
          onPress={() => void handleUpload()}
          style={({ pressed }) => [styles.addButton, pressed ? styles.addButtonPressed : null]}
        >
          <Ionicons name={isUploading ? 'hourglass-outline' : 'add'} size={theme.sizing.iconLg} color={colors.accent} />
        </Pressable>
      </View>

      {galleryItems.length === 0 ? <EmptyText>No media uploaded yet.</EmptyText> : null}

      <View style={styles.grid}>
        {galleryItems.map((item) => (
          <Pressable
            key={item.id}
            style={styles.tile}
            onPress={() => setSelectedMediaId(item.id)}
            onLongPress={() => confirmDelete(item.id)}
          >
            <Image source={{ uri: item.uri }} style={styles.image} resizeMode="cover" />
            <View style={styles.meta}>
              <Text style={styles.title}>{item.sourceFilename || 'Private media'}</Text>
              <Text style={styles.subtitle}>Added {formatDate(item.createdAt)}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Stored in app</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </View>

      <NoteText>
        Tap + to upload from phone gallery. Long press a media card to delete it from this private app gallery.
      </NoteText>

      <Modal
        visible={Boolean(selectedMediaId)}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedMediaId(null)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.closeButton} onPress={() => setSelectedMediaId(null)}>
            <Ionicons name="close" size={theme.sizing.iconMd} color="#FFFFFF" />
          </Pressable>
          {selectedItem ? <Image source={{ uri: selectedItem.uri }} style={styles.modalImage} resizeMode="contain" /> : null}
          {selectedItem ? <Text style={styles.modalMeta}>Added {formatDate(selectedItem.createdAt)}</Text> : null}
        </View>
      </Modal>
    </ScreenContainer>
  );
}
