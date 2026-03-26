import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import type { Theme, ThemeColors } from '../../../theme';
import type { PositionBreakdownItem } from './insights-types';

type PositionsBreakdownCardProps = {
  items: PositionBreakdownItem[];
  theme: Theme;
  colors: ThemeColors;
};

export function PositionsBreakdownCard({ items, theme, colors }: PositionsBreakdownCardProps) {
  const styles = createStyles(theme, colors);
  const donutSize = 134;
  const strokeWidth = 36;
  const radius = (donutSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let cumulative = 0;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Positions Breakdown</Text>
      <View style={styles.body}>
        <View style={styles.legendCol}>
          {items.map((item) => (
            <PositionLegendRow key={item.id} item={item} theme={theme} colors={colors} />
          ))}
        </View>

        <View style={styles.chartWrap}>
          <View style={styles.chartHalo} />
          <Svg width={donutSize} height={donutSize}>
            <G>
              {items.map((item) => {
                const segmentLength = (item.percent / 100) * circumference;
                const dashOffset = -cumulative;
                cumulative += segmentLength;

                return (
                  <Circle
                    key={`slice-${item.id}`}
                    cx={donutSize / 2}
                    cy={donutSize / 2}
                    r={radius}
                    fill="none"
                    stroke={item.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="butt"
                  />
                );
              })}
            </G>
          </Svg>

          <View style={styles.centerCutout} />
          <View style={styles.centerLabelWrap}>
            <Text style={styles.centerLabel}>4</Text>
            <Text style={styles.centerSubLabel}>styles</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

type PositionLegendRowProps = {
  item: PositionBreakdownItem;
  theme: Theme;
  colors: ThemeColors;
};

export function PositionLegendRow({ item, theme, colors }: PositionLegendRowProps) {
  const styles = createLegendStyles(theme, colors);

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <View style={[styles.iconWrap, { backgroundColor: item.color }]}>
          <Ionicons name={item.icon} size={theme.sizing.iconXs} color="#FFFFFF" />
        </View>
        <Text style={styles.name} numberOfLines={1}>
          {item.label}
        </Text>
      </View>
      <Text style={styles.percent}>{item.percent}%</Text>
    </View>
  );
}

function createStyles(theme: Theme, colors: ThemeColors) {
  const cardBg = theme.mode === 'dark' ? colors.surface : '#FFFDFE';

  return StyleSheet.create({
    card: {
      borderWidth: 1,
      borderColor: colors.borderMuted,
      borderRadius: theme.radius.xl,
      backgroundColor: cardBg,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm + 2,
      gap: theme.spacing.sm,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: theme.mode === 'dark' ? 0.18 : 0.09,
      shadowRadius: 12,
      elevation: 3,
    },
    title: {
      color: colors.textPrimary,
      fontSize: theme.typography.fontSize.lg,
      lineHeight: theme.typography.lineHeight.lg,
      fontWeight: '700',
    },
    body: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs + 1,
    },
    legendCol: {
      flex: 1.12,
      gap: theme.spacing.xs + 1,
      paddingRight: theme.spacing.xs + 2,
    },
    chartWrap: {
      width: 146,
      height: 146,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    chartHalo: {
      position: 'absolute',
      width: 138,
      height: 138,
      borderRadius: 69,
      backgroundColor: colors.selectedSurface,
      opacity: 0.36,
    },
    centerCutout: {
      position: 'absolute',
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.borderMuted,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.mode === 'dark' ? 0.14 : 0.06,
      shadowRadius: 6,
      elevation: 1,
    },
    centerLabelWrap: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 1,
    },
    centerLabel: {
      color: colors.textPrimary,
      fontSize: theme.typography.fontSize.lg,
      lineHeight: theme.typography.lineHeight.lg - 2,
      fontWeight: '700',
    },
    centerSubLabel: {
      color: colors.textMuted,
      fontSize: theme.typography.fontSize.xs,
      lineHeight: theme.typography.lineHeight.xs - 2,
      fontWeight: '600',
    },
  });
}

function createLegendStyles(theme: Theme, colors: ThemeColors) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 22,
      gap: theme.spacing.xs + 1,
    },
    left: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      marginRight: theme.spacing.xxs + 1,
    },
    iconWrap: {
      width: 20,
      height: 20,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    name: {
      color: colors.textPrimary,
      fontSize: theme.typography.fontSize.sm,
      lineHeight: theme.typography.lineHeight.sm,
      fontWeight: '600',
    },
    percent: {
      color: colors.textPrimary,
      fontSize: theme.typography.fontSize.sm,
      lineHeight: theme.typography.lineHeight.sm,
      fontWeight: '700',
      width: 42,
      textAlign: 'right',
      fontVariant: ['tabular-nums'],
    },
  });
}
