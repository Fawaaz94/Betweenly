import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { useMemo, type ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer, ScreenTitle } from '../../components/ui/primitives';
import { useTheme } from '../../theme/use-theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

type SettingsItem = {
  label: string;
  icon: IconName;
  route?: Href;
};

type SettingsSection = {
  key: string;
  items: SettingsItem[];
};

const settingsSections: SettingsSection[] = [
  {
    key: 'activity',
    items: [
      { label: 'Activities', icon: 'apps-outline', route: '/(tabs)/insights' },
      { label: 'Partners', icon: 'people-outline', route: '/partner/shared' },
      { label: 'Media Gallery', icon: 'images-outline' },
      { label: 'Tags', icon: 'pricetag-outline' },
      { label: 'STD Tests', icon: 'clipboard-outline' },
    ],
  },
  {
    key: 'location',
    items: [
      { label: 'Locations', icon: 'location-outline', route: '/(tabs)/calendar' },
      { label: 'Map', icon: 'map-outline' },
    ],
  },
  {
    key: 'system',
    items: [
      { label: 'Settings', icon: 'settings-outline', route: '/(tabs)/settings' },
      { label: 'Sync & Share', icon: 'cloud-upload-outline', route: '/partner/link' },
      { label: 'Backup & Restore', icon: 'refresh-circle-outline' },
    ],
  },
  {
    key: 'about',
    items: [
      { label: 'Write a Review', icon: 'star-outline' },
      { label: 'About', icon: 'information-circle-outline' },
    ],
  },
];

export function ProfileScreen() {
  const router = useRouter();
  const { colors, theme } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        screenTitleWrap: {
          paddingTop: theme.spacing.sm,
        },
        sectionCard: {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.borderMuted,
          borderRadius: theme.radius.lg,
          overflow: 'hidden',
        },
        row: {
          minHeight: theme.sizing.buttonHeight,
          paddingHorizontal: theme.spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        rowPressed: {
          backgroundColor: colors.surfaceAlt,
        },
        rowLeft: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.sm,
        },
        rowLabel: {
          color: colors.textPrimary,
          fontSize: theme.typography.fontSize.md,
          lineHeight: theme.typography.lineHeight.md,
          fontWeight: '500',
        },
        divider: {
          marginLeft: theme.spacing.md + theme.sizing.iconMd + theme.spacing.sm,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderMuted,
        },
      }),
    [colors, theme],
  );

  return (
    <ScreenContainer>
      <View style={styles.screenTitleWrap}>
        <ScreenTitle title="Settings" subtitle="Private preferences and app options" />
      </View>

      {settingsSections.map((section) => (
        <View key={section.key} style={styles.sectionCard}>
          {section.items.map((item, index) => {
            const isLast = index === section.items.length - 1;
            const route = item.route;

            return (
              <View key={item.label}>
                <Pressable
                  onPress={route ? () => router.push(route) : undefined}
                  style={({ pressed }) => [styles.row, pressed && route ? styles.rowPressed : null]}
                >
                  <View style={styles.rowLeft}>
                    <Ionicons name={item.icon} size={theme.sizing.iconMd} color={colors.textSecondary} />
                    <Text style={styles.rowLabel}>{item.label}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={theme.sizing.iconMd} color={colors.textMuted} />
                </Pressable>
                {!isLast ? <View style={styles.divider} /> : null}
              </View>
            );
          })}
        </View>
      ))}
    </ScreenContainer>
  );
}
