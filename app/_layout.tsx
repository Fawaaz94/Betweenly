import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../src/constants/theme';
import { AppProvider } from '../src/features/app/app-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.appBg },
            }}
          />
        </SafeAreaView>
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.appBg,
  },
});
