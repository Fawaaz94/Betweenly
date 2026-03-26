import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Theme, ThemeColors } from '../../../theme';
import type { InsightIconName, PartnerAvatar, TopPartnerData } from './insights-types';

type InsightsStatCardProps = {
  label: string;
  value: string;
  meta: string;
  icon: InsightIconName;
  theme: Theme;
  colors: ThemeColors;
  iconColor?: string;
  compact?: boolean;
};

export function InsightsStatCard({ label, value, meta, icon, theme, colors, iconColor, compact = false }: InsightsStatCardProps) {
  const styles = createStyles(theme, colors);
  const hasMeta = meta.trim().length > 0;

  return (
    <View style={[styles.card, compact ? styles.cardCompact : null]}>
      <View style={[styles.titleRow, compact ? styles.titleRowCompact : null]}>
        <View style={[styles.iconWrap, { backgroundColor: colors.selectedSurface }]}>
          <Ionicons name={icon} size={theme.sizing.iconSm} color={iconColor ?? colors.accent} />
        </View>
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
      </View>
      <Text style={[styles.value, compact ? styles.valueCompact : null]}>{value}</Text>
      {hasMeta ? <Text style={[styles.meta, styles.metaVisible]}>{meta}</Text> : null}
    </View>
  );
}

type TopPartnerStatCardProps = {
  data: TopPartnerData;
  theme: Theme;
  colors: ThemeColors;
  onPress?: () => void;
};

export function TopPartnerStatCard({ data, theme, colors, onPress }: TopPartnerStatCardProps) {
  const styles = createStyles(theme, colors);
  const topNames = data.names.slice(0, 2).join(', ');

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.card, pressed && onPress ? styles.cardPressed : null]}
    >
      <View style={styles.titleRow}>
        <View style={[styles.iconWrap, { backgroundColor: colors.selectedSurface }]}>
          <Ionicons name="people" size={theme.sizing.iconSm} color={colors.accent} />
        </View>
        <Text style={styles.label}>Top Partner</Text>
      </View>

      <View style={styles.avatarRow}>
        {data.avatars.map((avatar, index) => (
          <AvatarBubble key={avatar.id} avatar={avatar} offsetIndex={index} theme={theme} />
        ))}
        <Text style={styles.moreCount}>+{data.moreCount} more</Text>
      </View>

      <Text style={styles.partnerNames}>{topNames}</Text>
    </Pressable>
  );
}

function AvatarBubble({ avatar, offsetIndex, theme }: { avatar: PartnerAvatar; offsetIndex: number; theme: Theme }) {
  const overlap = offsetIndex === 0 ? 0 : -6;

  return (
    <View
      style={{
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: avatar.color,
        borderWidth: 1.5,
        borderColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: overlap,
      }}
    >
      <Text
        style={{
          color: '#FFFFFF',
          fontSize: theme.typography.fontSize.xs - 1,
          lineHeight: theme.typography.lineHeight.xs,
          fontWeight: '700',
        }}
      >
        {avatar.initial}
      </Text>
    </View>
  );
}

function createStyles(theme: Theme, colors: ThemeColors) {
  const cardBg = theme.mode === 'dark' ? colors.surface : '#FFFDFE';

  return StyleSheet.create({
    card: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.borderMuted,
      borderRadius: theme.radius.xl,
      backgroundColor: cardBg,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm + 1,
      gap: theme.spacing.xs + 1,
      minHeight: 122,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: theme.mode === 'dark' ? 0.18 : 0.09,
      shadowRadius: 12,
      elevation: 3,
    },
    cardCompact: {
      minHeight: 102,
      paddingVertical: theme.spacing.sm,
      gap: theme.spacing.xxs + 1,
    },
    cardPressed: {
      opacity: 0.88,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    titleRowCompact: {
      minHeight: 22,
    },
    iconWrap: {
      width: 22,
      height: 22,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      color: colors.textSecondary,
      fontSize: theme.typography.fontSize.sm,
      lineHeight: theme.typography.lineHeight.sm,
      fontWeight: '600',
      flexShrink: 1,
    },
    value: {
      marginTop: theme.spacing.xxs - 1,
      color: colors.textPrimary,
      fontSize: theme.typography.fontSize.xxl + 1,
      lineHeight: theme.typography.lineHeight.xxl + 1,
      fontWeight: '700',
    },
    valueCompact: {
      marginTop: theme.spacing.xxs - 1,
      fontSize: theme.typography.fontSize.xl + 2,
      lineHeight: theme.typography.lineHeight.xl + 2,
    },
    meta: {
      fontSize: theme.typography.fontSize.xs + 1,
      lineHeight: theme.typography.lineHeight.xs + 1,
      marginTop: theme.spacing.xxs,
    },
    metaVisible: {
      color: '#85A76D',
      fontWeight: '600',
    },
    avatarRow: {
      marginTop: theme.spacing.xs,
      flexDirection: 'row',
      alignItems: 'center',
    },
    moreCount: {
      marginLeft: theme.spacing.xs,
      color: colors.textSecondary,
      fontSize: theme.typography.fontSize.sm,
      lineHeight: theme.typography.lineHeight.sm,
      fontWeight: '600',
    },
    partnerNames: {
      marginTop: 'auto',
      color: colors.textMuted,
      fontSize: theme.typography.fontSize.sm,
      lineHeight: theme.typography.lineHeight.sm,
    },
  });
}
