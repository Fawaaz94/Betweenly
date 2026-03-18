import { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme/use-theme';

export type ActionMenuOption = {
  key: string;
  label: string;
  onPress: () => void;
  destructive?: boolean;
  disabled?: boolean;
};

type ActionMenuModalProps = {
  visible: boolean;
  title?: string;
  options: ActionMenuOption[];
  onClose: () => void;
  cancelLabel?: string;
};

export function ActionMenuModal({ visible, title, options, onClose, cancelLabel = 'Cancel' }: ActionMenuModalProps) {
  const { colors, theme } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        backdrop: {
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.36)',
          justifyContent: 'flex-end',
          paddingHorizontal: theme.spacing.md,
          paddingBottom: theme.spacing.xxl,
        },
        dismissArea: {
          ...StyleSheet.absoluteFillObject,
        },
        sheet: {
          borderRadius: theme.radius.xl,
          borderWidth: 1,
          borderColor: colors.borderMuted,
          backgroundColor: colors.appBg,
          overflow: 'hidden',
        },
        titleWrap: {
          minHeight: theme.sizing.buttonHeight,
          alignItems: 'center',
          justifyContent: 'center',
          borderBottomWidth: 1,
          borderBottomColor: colors.borderMuted,
          paddingHorizontal: theme.spacing.md,
        },
        title: {
          color: colors.textSecondary,
          fontSize: theme.typography.fontSize.sm,
          lineHeight: theme.typography.lineHeight.sm,
          fontWeight: '600',
        },
        actionRow: {
          minHeight: theme.sizing.buttonHeight + 2,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: theme.spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderMuted,
          backgroundColor: colors.surface,
        },
        actionRowPressed: {
          backgroundColor: colors.surfaceAlt,
        },
        actionRowDisabled: {
          opacity: 0.52,
        },
        actionText: {
          color: colors.accent,
          fontSize: theme.typography.fontSize.lg,
          lineHeight: theme.typography.lineHeight.lg,
          fontWeight: '600',
        },
        actionTextDestructive: {
          color: colors.danger,
        },
        cancelButton: {
          marginTop: theme.spacing.sm,
          minHeight: theme.sizing.buttonHeight + 2,
          borderRadius: theme.radius.xl,
          borderWidth: 1,
          borderColor: colors.borderMuted,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.surface,
        },
        cancelButtonPressed: {
          backgroundColor: colors.surfaceAlt,
        },
        cancelText: {
          color: colors.textPrimary,
          fontSize: theme.typography.fontSize.lg,
          lineHeight: theme.typography.lineHeight.lg,
          fontWeight: '700',
        },
      }),
    [colors, theme],
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.dismissArea} onPress={onClose} />
        <View style={styles.sheet}>
          {title ? (
            <View style={styles.titleWrap}>
              <Text style={styles.title}>{title}</Text>
            </View>
          ) : null}

          {options.map((option, index) => (
            <Pressable
              key={option.key}
              disabled={option.disabled}
              onPress={() => {
                onClose();
                if (!option.disabled) option.onPress();
              }}
              style={({ pressed }) => [
                styles.actionRow,
                index === options.length - 1 ? { borderBottomWidth: 0 } : null,
                option.disabled ? styles.actionRowDisabled : null,
                pressed && !option.disabled ? styles.actionRowPressed : null,
              ]}
            >
              <Text style={[styles.actionText, option.destructive ? styles.actionTextDestructive : null]}>{option.label}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable onPress={onClose} style={({ pressed }) => [styles.cancelButton, pressed ? styles.cancelButtonPressed : null]}>
          <Text style={styles.cancelText}>{cancelLabel}</Text>
        </Pressable>
      </View>
    </Modal>
  );
}
