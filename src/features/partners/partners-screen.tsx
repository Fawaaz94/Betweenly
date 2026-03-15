import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer, ScreenTitle } from '../../components/ui/primitives';
import { useTheme } from '../../theme/use-theme';

type SortKey = 'name' | 'entries' | 'age' | 'custom';

type PartnerListItem = {
  id: string;
  name: string;
  age: number;
  entries: number;
  custom: string;
};

const SORT_OPTIONS: Array<{ key: SortKey; label: string }> = [
  { key: 'name', label: 'Name' },
  { key: 'entries', label: 'Entries' },
  { key: 'age', label: 'Age' },
  { key: 'custom', label: 'Custom' },
];

const PARTNERS: PartnerListItem[] = [
  {
    id: 'partner_1',
    name: 'Lexi',
    age: 26,
    entries: 1,
    custom: 'Trusted',
  },
];

function sortPartners(items: PartnerListItem[], sortBy: SortKey): PartnerListItem[] {
  const list = [...items];

  switch (sortBy) {
    case 'name':
      return list.sort((a, b) => a.name.localeCompare(b.name));
    case 'age':
      return list.sort((a, b) => a.age - b.age);
    case 'custom':
      return list.sort((a, b) => a.custom.localeCompare(b.custom));
    case 'entries':
    default:
      return list.sort((a, b) => b.entries - a.entries);
  }
}

export function PartnersScreen() {
  const router = useRouter();
  const { colors, theme } = useTheme();
  const [sortBy, setSortBy] = useState<SortKey>('entries');

  const partners = useMemo(() => sortPartners(PARTNERS, sortBy), [sortBy]);

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
        segmentedWrap: {
          marginTop: theme.spacing.sm,
          backgroundColor: colors.surfaceAlt,
          borderRadius: theme.radius.pill,
          borderWidth: 1,
          borderColor: colors.borderMuted,
          padding: theme.spacing.xs,
          flexDirection: 'row',
          gap: theme.spacing.xs,
        },
        segmentButton: {
          flex: 1,
          minHeight: 34,
          borderRadius: theme.radius.pill,
          alignItems: 'center',
          justifyContent: 'center',
        },
        segmentButtonActive: {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.borderMuted,
        },
        segmentText: {
          color: colors.textSecondary,
          fontSize: theme.typography.fontSize.sm,
          lineHeight: theme.typography.lineHeight.sm,
          fontWeight: '500',
        },
        segmentTextActive: {
          color: colors.textPrimary,
          fontWeight: '600',
        },
        listCard: {
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
        },
        listCardPressed: {
          backgroundColor: colors.surfaceAlt,
        },
        partnerLeft: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.sm,
        },
        avatarWrap: {
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: colors.surfaceAlt,
          borderWidth: 1,
          borderColor: colors.borderMuted,
          alignItems: 'center',
          justifyContent: 'center',
        },
        avatarText: {
          color: colors.textPrimary,
          fontSize: theme.typography.fontSize.md,
          lineHeight: theme.typography.lineHeight.md,
          fontWeight: '700',
        },
        verificationDot: {
          position: 'absolute',
          right: -4,
          bottom: -4,
          width: 18,
          height: 18,
          borderRadius: 9,
          backgroundColor: colors.accent,
          borderWidth: 2,
          borderColor: colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
        },
        partnerName: {
          color: colors.textPrimary,
          fontSize: theme.typography.fontSize.lg,
          lineHeight: theme.typography.lineHeight.lg,
          fontWeight: '600',
        },
        partnerMeta: {
          color: colors.textSecondary,
          fontSize: theme.typography.fontSize.sm,
          lineHeight: theme.typography.lineHeight.sm,
        },
        partnerRight: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.xs,
        },
        entriesText: {
          color: colors.textMuted,
          fontSize: theme.typography.fontSize.md,
          lineHeight: theme.typography.lineHeight.md,
          fontWeight: '500',
        },
        footerHint: {
          textAlign: 'center',
          marginTop: theme.spacing.md,
          color: colors.textSecondary,
          fontSize: theme.typography.fontSize.sm,
          lineHeight: theme.typography.lineHeight.sm,
        },
      }),
    [colors, theme],
  );

  return (
    <ScreenContainer>
      <View style={styles.headerWrap}>
        <ScreenTitle title="Partners" showBackButton />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add partner"
          onPress={() => router.push('/partner/link')}
          style={({ pressed }) => [styles.addButton, pressed ? styles.addButtonPressed : null]}
        >
          <Ionicons name="add" size={theme.sizing.iconLg} color={colors.accent} />
        </Pressable>
      </View>

      <View style={styles.segmentedWrap}>
        {SORT_OPTIONS.map((option) => {
          const active = sortBy === option.key;
          return (
            <Pressable
              key={option.key}
              onPress={() => setSortBy(option.key)}
              style={[styles.segmentButton, active ? styles.segmentButtonActive : null]}
            >
              <Text style={[styles.segmentText, active ? styles.segmentTextActive : null]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {partners.map((partner) => (
        <Pressable
          key={partner.id}
          style={({ pressed }) => [styles.listCard, pressed ? styles.listCardPressed : null]}
          onLongPress={() => Alert.alert('Partner options', `More options for ${partner.name} will be added soon.`)}
          onPress={() => Alert.alert(partner.name, `${partner.entries} logged entries`)}
        >
          <View style={styles.partnerLeft}>
            <View style={styles.avatarWrap}>
              <Text style={styles.avatarText}>{partner.name.slice(0, 1).toUpperCase()}</Text>
              <View style={styles.verificationDot}>
                <Ionicons name="checkmark" size={10} color={colors.textOnAccent} />
              </View>
            </View>
            <View>
              <Text style={styles.partnerName}>{partner.name}</Text>
              <Text style={styles.partnerMeta}>{partner.age}y</Text>
            </View>
          </View>

          <View style={styles.partnerRight}>
            <Text style={styles.entriesText}>{partner.entries}x</Text>
            <Ionicons name="chevron-forward" size={theme.sizing.iconSm} color={colors.textMuted} />
          </View>
        </Pressable>
      ))}

      <Text style={styles.footerHint}>Long press partner for more options</Text>
    </ScreenContainer>
  );
}
