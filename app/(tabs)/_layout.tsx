import { Redirect, Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LoadingScreen } from '../../src/features/app/loading-screen';
import { useAppState } from '../../src/features/app/app-context';
import { useTheme } from '../../src/theme/use-theme';

export default function TabsLayout() {
  const router = useRouter();
  const { isBootstrapping, user } = useAppState();
  const { colors, theme } = useTheme();

  if (isBootstrapping) return <LoadingScreen />;
  if (!user) return <Redirect href="/(auth)/sign-in" />;

  const styles = StyleSheet.create({
    root: {
      flex: 1,
    },
    fabWrap: {
      position: 'absolute',
      alignSelf: 'center',
      bottom: theme.spacing.lg,
    },
    fabButton: {
      width: theme.sizing.buttonHeight,
      height: theme.sizing.buttonHeight,
      borderRadius: theme.radius.pill,
      backgroundColor: colors.accent,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      ...theme.shadows.card,
    },
    fabLabel: {
      marginTop: theme.spacing.xs,
      color: colors.textSecondary,
      fontSize: theme.typography.fontSize.xs,
      lineHeight: theme.typography.lineHeight.xs,
      fontWeight: '600',
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.root}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.borderMuted,
            borderTopWidth: 1,
            height: theme.sizing.tabBarHeight,
            paddingTop: 0,
            paddingBottom: 0,
            ...theme.shadows.tabBar,
          },
          tabBarItemStyle: {
            borderRadius: theme.radius.md,
            justifyContent: 'center',
            paddingVertical: theme.spacing.xs,
          },
          tabBarLabelStyle: {
            fontSize: theme.typography.fontSize.xs - 1,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                size={theme.sizing.iconMd}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="calendar"
          options={{
            title: 'Calendar',
            tabBarItemStyle: {
                paddingRight: 18,
            },
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'calendar' : 'calendar-outline'}
                size={theme.sizing.iconMd}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="insights"
          options={{
              title: 'Insights',
              tabBarItemStyle: {
                  paddingLeft: 18,
              },
              tabBarIcon: ({ color, focused }) => (
                  <Ionicons
                    name={focused ? 'stats-chart' : 'stats-chart-outline'}
                    size={theme.sizing.iconMd}
                    color={color}
                  />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'person' : 'person-outline'}
                size={theme.sizing.iconMd}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="log"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            href: null,
          }}
        />
      </Tabs>

      <View style={styles.fabWrap} pointerEvents="box-none">
        <Pressable
          accessible
          accessibilityRole="button"
          accessibilityLabel="Log Event"
          style={styles.fabButton}
          onPress={() => router.push('/(tabs)/log')}
        >
          <Ionicons name="add" size={theme.sizing.iconLg} color={colors.textOnAccent} />
        </Pressable>
        <Text style={styles.fabLabel}>Log Event</Text>
      </View>
    </View>
  );
}
