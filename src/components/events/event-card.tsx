import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from '../ui/primitives';
import { useTheme } from '../../theme/use-theme';
import { useAppState } from '../../features/app/app-context';
import type { IntimacyEvent } from '../../types/models';
import { getEventRatingOption } from '../../features/events/event-rating';

function formatDateOnly(value: string) {
  const date = new Date(value);
  if (Number.isNaN(+date)) return value;
  return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

export function EventCard({ event, onPress }: { event: IntimacyEvent; onPress: (eventId: string) => void }) {
  const { colors, theme } = useTheme();
  const { partners } = useAppState();

  const partner = useMemo(
    () =>
      partners.find((item) => item.name.trim().toLowerCase() === (event.partnerName ?? '').trim().toLowerCase()) ?? null,
    [event.partnerName, partners],
  );

  const partnerLabel = event.partnerName?.trim() || 'No partner';
  const ratingOption = getEventRatingOption(event.overallRating);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        pressable: {
          marginBottom: theme.spacing.xs,
        },
        title: {
          color: colors.textPrimary,
          fontSize: theme.typography.fontSize.lg,
          lineHeight: theme.typography.lineHeight.lg,
          fontWeight: '700',
        },
        metaRow: {
          marginTop: theme.spacing.xs,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: theme.spacing.sm,
        },
        leftMeta: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.xs,
          flex: 1,
        },
        metaDate: {
          color: colors.textSecondary,
          fontSize: theme.typography.fontSize.sm,
          lineHeight: theme.typography.lineHeight.sm,
          fontWeight: '500',
        },
        separator: {
          color: colors.textMuted,
          fontSize: theme.typography.fontSize.sm,
          lineHeight: theme.typography.lineHeight.sm,
        },
        avatar: {
          width: 20,
          height: 20,
          borderRadius: 10,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          backgroundColor: colors.surfaceAlt,
          borderWidth: 1,
          borderColor: colors.borderMuted,
        },
        avatarImage: {
          width: '100%',
          height: '100%',
        },
        partnerName: {
          color: colors.textSecondary,
          fontSize: theme.typography.fontSize.sm,
          lineHeight: theme.typography.lineHeight.sm,
          fontWeight: '500',
          flexShrink: 1,
        },
        ratingSlot: {
          minWidth: 44,
          height: 40,
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: 'center',
        },
        rightMeta: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.xs,
        },
        ratingText: {
          fontSize: 30,
          lineHeight: 34,
          textAlign: 'center',
          textAlignVertical: 'center',
          includeFontPadding: false,
          marginTop: -30,
        },
        chevron: {
          marginTop: -30,
        },
      }),
    [colors, theme],
  );

  return (
    <Pressable onPress={() => onPress(event.id)} style={styles.pressable}>
      <Card>
        <Text style={styles.title}>{event.positions || 'Activity'}</Text>
        <View style={styles.metaRow}>
          <View style={styles.leftMeta}>
            <Text style={styles.metaDate}>{formatDateOnly(event.dateTimeStart)}</Text>
            <Text style={styles.separator}>|</Text>
            <View style={styles.avatar}>
              {partner?.avatarUri ? (
                <Image source={{ uri: partner.avatarUri }} style={styles.avatarImage} resizeMode="cover" />
              ) : (
                <Ionicons name="person" size={12} color={colors.textMuted} />
              )}
            </View>
            <Text style={styles.partnerName}>{partnerLabel}</Text>
          </View>

          <View style={styles.rightMeta}>
            <View style={styles.ratingSlot}>
              <Text style={styles.ratingText}>{ratingOption.emoji}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} style={styles.chevron} />
          </View>
        </View>
      </Card>
    </Pressable>
  );
}
