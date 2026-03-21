import { useMemo, type PropsWithChildren } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useSegments, type Href } from 'expo-router';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Theme, ThemeColors } from '../../theme';
import { useTheme } from '../../theme/use-theme';

function useThemedStyles() {
  const { colors, theme } = useTheme();
  return useMemo(() => createStyles(theme, colors), [colors, theme]);
}

export function ScreenContainer({ children }: PropsWithChildren) {
  const styles = useThemedStyles();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const segments = useSegments() as string[];
  const isTabsRoute = segments.includes('(tabs)');
  const bottomScrollInset = theme.spacing.xxxl + insets.bottom + (isTabsRoute ? theme.sizing.tabBarHeight + theme.spacing.md : 0);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.screenContent, { paddingBottom: bottomScrollInset }]}
    >
      {children}
    </ScrollView>
  );
}

type ScreenTitleProps = {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  backFallbackHref?: Href;
};

export function ScreenTitle({ title, subtitle, showBackButton = false, backFallbackHref = '/(tabs)/profile' }: ScreenTitleProps) {
  const styles = useThemedStyles();
  const { colors, theme } = useTheme();
  const router = useRouter();
  const canGoBack = showBackButton && router.canGoBack();

  const handleBack = () => {
    if (canGoBack) {
      router.back();
      return;
    }

    router.replace(backFallbackHref);
  };

  return (
    <View style={styles.titleWrap}>
      {showBackButton ? (
        <Pressable onPress={handleBack} style={({ pressed }) => [styles.backButton, pressed ? styles.backButtonPressed : null]}>
          <Ionicons name="chevron-back" size={theme.sizing.iconMd} color={colors.textPrimary} />
        </Pressable>
      ) : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function Label({ children }: PropsWithChildren) {
  const styles = useThemedStyles();
  return <Text style={styles.label}>{children}</Text>;
}

export function Input(props: TextInputProps) {
  const styles = useThemedStyles();
  const { colors } = useTheme();

  return <TextInput placeholderTextColor={colors.textMuted} {...props} style={[styles.input, props.style]} />;
}

export function MultilineInput(props: TextInputProps) {
  const styles = useThemedStyles();

  return <Input multiline textAlignVertical="top" scrollEnabled {...props} style={[styles.input, styles.textArea, props.style]} />;
}

export function PrimaryButton({
  label,
  onPress,
  style,
}: {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
}) {
  const styles = useThemedStyles();

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.primaryButton, pressed ? styles.primaryButtonPressed : null, style]}>
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

export function GhostButton({ label, onPress }: { label: string; onPress: () => void }) {
  const styles = useThemedStyles();

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.ghostButton, pressed ? styles.ghostButtonPressed : null]}>
      <Text style={styles.ghostButtonText}>{label}</Text>
    </Pressable>
  );
}

export function DangerButton({ label, onPress }: { label: string; onPress: () => void }) {
  const styles = useThemedStyles();

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.dangerButton, pressed ? styles.dangerButtonPressed : null]}>
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

export function Row({ children, style }: PropsWithChildren<{ style?: ViewStyle }>) {
  const styles = useThemedStyles();
  return <View style={[styles.row, style]}>{children}</View>;
}

export function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const styles = useThemedStyles();

  return (
    <Pressable style={({ pressed }) => [styles.chip, active ? styles.chipActive : null, pressed ? styles.chipPressed : null]} onPress={onPress}>
      <Text style={[styles.chipText, active ? styles.chipTextActive : null]}>{label}</Text>
    </Pressable>
  );
}

export function Card({ children }: PropsWithChildren) {
  const styles = useThemedStyles();
  return <View style={styles.card}>{children}</View>;
}

export function CardTitle({ children }: PropsWithChildren) {
  const styles = useThemedStyles();
  return <Text style={styles.cardTitle}>{children}</Text>;
}

export function CardMeta({ children }: PropsWithChildren) {
  const styles = useThemedStyles();
  return <Text style={styles.cardMeta}>{children}</Text>;
}

export function CardBody({ children }: PropsWithChildren) {
  const styles = useThemedStyles();
  return <Text style={styles.cardBody}>{children}</Text>;
}

export function EmptyText({ children }: PropsWithChildren) {
  const styles = useThemedStyles();
  return <Text style={styles.emptyText}>{children}</Text>;
}

export function NoteText({ children }: PropsWithChildren) {
  const styles = useThemedStyles();
  return <Text style={styles.note}>{children}</Text>;
}

export function SectionTitle({ children }: PropsWithChildren) {
  const styles = useThemedStyles();
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export function StatRow({ label, value }: { label: string; value: string }) {
  const styles = useThemedStyles();

  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function createStyles(theme: Theme, colors: ThemeColors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.appBg,
    },
    screenContent: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl,
      gap: theme.spacing.md,
    },
    titleWrap: {
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.xs + 2,
      gap: theme.spacing.xs,
    },
    backButton: {
      width: 36,
      height: 36,
      borderRadius: theme.radius.pill,
      borderWidth: 1,
      borderColor: colors.borderMuted,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.xs,
    },
    backButtonPressed: {
      backgroundColor: colors.surfaceAlt,
    },
    title: {
      color: colors.textPrimary,
      fontSize: theme.typography.fontSize.xxl,
      fontWeight: '700',
      lineHeight: theme.typography.lineHeight.xxl,
    },
    subtitle: {
      color: colors.accentText,
      fontSize: theme.typography.fontSize.sm,
      lineHeight: theme.typography.lineHeight.sm,
    },
    sectionTitle: {
      color: colors.textPrimary,
      fontSize: theme.typography.fontSize.lg,
      fontWeight: '600',
      marginTop: theme.spacing.sm,
    },
    label: {
      color: colors.textSecondary,
      fontSize: theme.typography.fontSize.sm,
      fontWeight: '600',
      lineHeight: theme.typography.lineHeight.sm,
    },
    input: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm + 2,
      minHeight: theme.sizing.inputHeight,
      color: colors.textPrimary,
      fontSize: theme.typography.fontSize.sm,
      lineHeight: theme.typography.lineHeight.sm,
    },
    textArea: {
      minHeight: theme.sizing.inputHeight * 1.7,
      height: theme.sizing.inputHeight * 1.7,
      maxHeight: theme.sizing.inputHeight * 1.7,
      paddingTop: theme.spacing.sm + 2,
    },
    primaryButton: {
      marginTop: theme.spacing.sm + 2,
      backgroundColor: colors.accent,
      borderRadius: theme.radius.md,
      minHeight: theme.sizing.buttonHeight,
      paddingVertical: theme.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryButtonPressed: {
      backgroundColor: colors.accentPressed,
    },
    dangerButton: {
      marginTop: theme.spacing.sm + 2,
      backgroundColor: colors.danger,
      borderRadius: theme.radius.md,
      minHeight: theme.sizing.buttonHeight,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg + 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dangerButtonPressed: {
      backgroundColor: colors.dangerPressed,
    },
    primaryButtonText: {
      color: colors.textOnAccent,
      fontWeight: '700',
      fontSize: theme.typography.fontSize.md,
      lineHeight: theme.typography.lineHeight.md,
    },
    ghostButton: {
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: theme.radius.md,
      minHeight: theme.sizing.buttonHeight,
      paddingVertical: theme.spacing.sm + 2,
      paddingHorizontal: theme.spacing.md + 2,
      marginTop: theme.spacing.sm + 2,
      backgroundColor: colors.surface,
      justifyContent: 'center',
    },
    ghostButtonPressed: {
      backgroundColor: colors.surfaceAlt,
    },
    ghostButtonText: {
      color: colors.textPrimary,
      fontSize: theme.typography.fontSize.sm,
      fontWeight: '600',
      lineHeight: theme.typography.lineHeight.sm,
    },
    row: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      alignItems: 'center',
    },
    chip: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: theme.radius.pill,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: colors.surfaceAlt,
    },
    chipActive: {
      backgroundColor: colors.chipActiveBg,
      borderColor: colors.chipActiveBorder,
    },
    chipPressed: {
      opacity: 0.86,
    },
    chipText: {
      color: colors.textSecondary,
      fontSize: theme.typography.fontSize.xs,
      fontWeight: '600',
      lineHeight: theme.typography.lineHeight.xs,
    },
    chipTextActive: {
      color: colors.textOnAccent,
    },
    card: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.md,
      gap: theme.spacing.xs,
      ...theme.shadows.card,
    },
    cardTitle: {
      color: colors.textPrimary,
      fontSize: theme.typography.fontSize.md,
      fontWeight: '700',
      lineHeight: theme.typography.lineHeight.md,
    },
    cardMeta: {
      color: colors.accentText,
      fontSize: theme.typography.fontSize.xs,
      lineHeight: theme.typography.lineHeight.xs,
    },
    cardBody: {
      color: colors.textSecondary,
      fontSize: theme.typography.fontSize.sm,
      lineHeight: theme.typography.lineHeight.sm,
      marginTop: theme.spacing.xxs,
    },
    emptyText: {
      color: colors.textMuted,
      fontSize: theme.typography.fontSize.sm,
      lineHeight: theme.typography.lineHeight.sm,
    },
    note: {
      color: colors.textMuted,
      fontSize: theme.typography.fontSize.xs,
      lineHeight: theme.typography.lineHeight.xs,
    },
    statRow: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.borderMuted,
      borderRadius: theme.radius.md,
      paddingVertical: theme.spacing.sm + 2,
      paddingHorizontal: theme.spacing.md,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    statLabel: {
      color: colors.textSecondary,
      fontSize: theme.typography.fontSize.sm,
      lineHeight: theme.typography.lineHeight.sm,
    },
    statValue: {
      color: colors.textPrimary,
      fontSize: theme.typography.fontSize.sm,
      fontWeight: '700',
      lineHeight: theme.typography.lineHeight.sm,
      maxWidth: '55%',
      textAlign: 'right',
    },
  });
}
