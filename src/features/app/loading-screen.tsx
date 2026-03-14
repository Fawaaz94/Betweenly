import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import type { ThemeColors } from '../../constants/theme';
import { useAppState } from './app-context';

export function LoadingScreen({ label = 'Loading private workspace...' }: { label?: string }) {
  const { colors } = useAppState();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.accent} />
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.appBg,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 10,
    },
    text: {
      color: colors.textSecondary,
      fontSize: 14,
    },
  });
}
