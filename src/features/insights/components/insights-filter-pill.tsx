import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Theme, ThemeColors } from '../../../theme';

type InsightsFilterPillProps = {
  label: string;
  theme: Theme;
  colors: ThemeColors;
  onPress?: () => void;
};

export function InsightsFilterPill({ label, theme, colors, onPress }: InsightsFilterPillProps) {
  const styles = createStyles(theme, colors);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.pill, pressed ? styles.pillPressed : null]}>
      <View style={styles.iconWrap}>
        <Ionicons name="calendar-outline" size={theme.sizing.iconSm} color={colors.accent} />
      </View>
      <Text style={styles.label}>{label}</Text>
      <Ionicons name="chevron-down" size={theme.sizing.iconSm} color={colors.textMuted} />
    </Pressable>
  );
}

function createStyles(theme: Theme, colors: ThemeColors) {
  const pillBg = theme.mode === 'dark' ? colors.surface : '#FFF9FC';

  return StyleSheet.create({
    pill: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      borderRadius: theme.radius.pill,
      borderWidth: 1,
      borderColor: colors.borderMuted,
      backgroundColor: pillBg,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm - 2,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: theme.mode === 'dark' ? 0.16 : 0.1,
      shadowRadius: 10,
      elevation: 3,
    },
    pillPressed: {
      opacity: 0.86,
    },
    iconWrap: {
      width: 20,
      height: 20,
      borderRadius: theme.radius.pill,
      backgroundColor: colors.selectedSurface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      color: colors.textPrimary,
      fontSize: theme.typography.fontSize.sm,
      lineHeight: theme.typography.lineHeight.sm,
      fontWeight: '700',
    },
  });
}
