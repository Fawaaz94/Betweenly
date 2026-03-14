import { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme/use-theme';

type ProfileHeaderProps = {
  displayName: string;
  email: string;
  avatarUri?: string | null;
  onEditProfilePress: () => void;
};

function getInitials(displayName: string) {
  const parts = displayName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) return 'U';
  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('');
}

export function ProfileHeader({ displayName, email, avatarUri, onEditProfilePress }: ProfileHeaderProps) {
  const { colors, theme } = useTheme();
  const initials = getInitials(displayName);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: theme.spacing.huge,
          paddingBottom: theme.spacing.xxl,
          backgroundColor: colors.appBg,
        },
        avatarWrap: {
          width: 104,
          height: 104,
          borderRadius: 52,
          backgroundColor: colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: colors.borderMuted,
          overflow: 'hidden',
          marginBottom: theme.spacing.md,
        },
        avatarImage: {
          width: '100%',
          height: '100%',
        },
        identityWrap: {
          alignItems: 'center',
          gap: theme.spacing.xs,
        },
        avatarFallback: {
          color: colors.textPrimary,
          fontSize: theme.typography.fontSize.xxl,
          lineHeight: theme.typography.lineHeight.xxl,
          fontWeight: '700',
        },
        name: {
          color: colors.textPrimary,
          fontSize: theme.typography.fontSize.xxl,
          lineHeight: theme.typography.lineHeight.xxl,
          fontWeight: '700',
          textAlign: 'center',
        },
        email: {
          color: colors.textSecondary,
          fontSize: theme.typography.fontSize.sm,
          lineHeight: theme.typography.lineHeight.sm,
          textAlign: 'center',
        },
        editButton: {
          marginTop: theme.spacing.md,
          minWidth: 150,
          minHeight: 44,
          borderRadius: theme.radius.pill,
          paddingHorizontal: theme.spacing.lg,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.textPrimary,
        },
        editButtonPressed: {
          opacity: 0.9,
        },
        editButtonText: {
          color: colors.appBg,
          fontSize: theme.typography.fontSize.sm,
          lineHeight: theme.typography.lineHeight.sm,
          fontWeight: '600',
          textAlign: 'center',
        },
      }),
    [colors, theme],
  );

  return (
    <View style={styles.container}>
      <View style={styles.avatarWrap}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatarImage} resizeMode="cover" />
        ) : (
          <Text style={styles.avatarFallback}>{initials}</Text>
        )}
      </View>

      <View style={styles.identityWrap}>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.email}>{email}</Text>
      </View>

      <Pressable onPress={onEditProfilePress} style={({ pressed }) => [styles.editButton, pressed ? styles.editButtonPressed : null]}>
        <Text style={styles.editButtonText}>Edit profile</Text>
      </Pressable>
    </View>
  );
}
