import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { countryCodeToFlagEmoji } from '../../../constants/countries';
import { useTheme } from '../../../theme/use-theme';
import type { Partner } from '../../../types/models';
import { PartnerAvatar } from './PartnerAvatar';

type PartnerListCardProps = {
  partner: Partner;
  entryCount: number;
  birthdayLabel: string;
  onPress: () => void;
  onLongPress: () => void;
};

export function PartnerListCard({ partner, entryCount, birthdayLabel, onPress, onLongPress }: PartnerListCardProps) {
  const { colors, theme } = useTheme();
  const flag = countryCodeToFlagEmoji(partner.nationality);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
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
        cardPressed: {
          backgroundColor: colors.surfaceAlt,
        },
        left: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.sm,
          flex: 1,
        },
        name: {
          color: colors.textPrimary,
          fontSize: theme.typography.fontSize.lg,
          lineHeight: theme.typography.lineHeight.lg,
          fontWeight: '600',
        },
        meta: {
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
        right: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.xs,
        },
        count: {
          color: colors.textMuted,
          fontSize: theme.typography.fontSize.md,
          lineHeight: theme.typography.lineHeight.md,
          fontWeight: '500',
        },
      }),
    [colors, theme],
  );

  return (
    <Pressable style={({ pressed }) => [styles.card, pressed ? styles.cardPressed : null]} onPress={onPress} onLongPress={onLongPress}>
      <View style={styles.left}>
        <PartnerAvatar uri={partner.avatarUri} name={partner.name} />
        <View>
          <Text style={styles.name}>{`${partner.name} ${flag}`}</Text>
          <Text style={styles.meta}>{birthdayLabel}</Text>
          {partner.isDefault ? (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultBadgeText}>Default</Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.right}>
        <Text style={styles.count}>{entryCount}x</Text>
        <Ionicons name="chevron-forward" size={theme.sizing.iconSm} color={colors.textMuted} />
      </View>
    </Pressable>
  );
}
