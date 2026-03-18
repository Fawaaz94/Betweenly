import { useMemo, type PropsWithChildren } from 'react';
import { Pressable, StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme/use-theme';

type SlideUpSheetProps = PropsWithChildren<{
  onClose: () => void;
  sheetStyle?: StyleProp<ViewStyle>;
  dismissible?: boolean;
}>;

export function SlideUpSheet({ children, onClose, sheetStyle, dismissible = true }: SlideUpSheetProps) {
  const { colors, theme } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        backdrop: {
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(0,0,0,0.32)',
        },
        dismissLayer: {
          ...StyleSheet.absoluteFillObject,
        },
        sheet: {
          minHeight: '68%',
          maxHeight: '94%',
          borderTopLeftRadius: theme.radius.xxl,
          borderTopRightRadius: theme.radius.xxl,
          borderTopWidth: 1,
          borderLeftWidth: 1,
          borderRightWidth: 1,
          borderColor: colors.borderMuted,
          backgroundColor: colors.appBg,
          overflow: 'hidden',
        },
        handleWrap: {
          alignItems: 'center',
          paddingTop: theme.spacing.sm,
          paddingBottom: theme.spacing.xs,
        },
        handle: {
          width: 42,
          height: 4,
          borderRadius: 2,
          backgroundColor: colors.borderMuted,
        },
      }),
    [colors, theme],
  );

  return (
    <View style={styles.backdrop}>
      {dismissible ? <Pressable style={styles.dismissLayer} onPress={onClose} /> : null}
      <View style={[styles.sheet, sheetStyle]}>
        <View style={styles.handleWrap}>
          <View style={styles.handle} />
        </View>
        {children}
      </View>
    </View>
  );
}
