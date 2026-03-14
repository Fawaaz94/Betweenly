import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/theme';

export function LoadingScreen({ label = 'Loading private workspace...' }: { label?: string }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.accent} />
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
