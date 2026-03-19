import { Redirect, Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LoadingScreen } from '../../src/features/app/loading-screen';
import { useAppState } from '../../src/features/app/app-context';
import { useTheme } from '../../src/theme/use-theme';

export default function TabsLayout() {
  const router = useRouter();
  const { width: viewportWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { isBootstrapping, user } = useAppState();
  const { colors, theme } = useTheme();
  const tabBarHorizontalInset = theme.spacing.xs;
  const tabBarHorizontalPadding = theme.spacing.md;
  const tabBarHeight = theme.sizing.tabBarHeight;
  const tabBarBottom = theme.spacing.xxl;
  const fabSize = theme.sizing.buttonHeight + 6;
  const fabBottom = tabBarBottom + tabBarHeight - fabSize * 0.72;
  const iconSize = theme.sizing.iconMd - 3;
  const centerGap = fabSize + theme.spacing.xxs;
  const barInnerWidth =
    viewportWidth - tabBarHorizontalInset * 2 - tabBarHorizontalPadding * 2;
  // const itemWidth = Math.max(48, (barInnerWidth - centerGap) / 4);
  const itemWidth = Math.max(48, (barInnerWidth - centerGap) / 4);

  if (isBootstrapping) return <LoadingScreen />;
  if (!user) return <Redirect href="/(auth)/sign-in" />;

  const styles = StyleSheet.create({
    root: {
      flex: 1,
    },
    fabWrap: {
      position: 'absolute',
      alignSelf: 'center',
      bottom: fabBottom,
    },
    fabButton: {
      width: fabSize,
      height: fabSize,
      borderRadius: fabSize / 2,
      backgroundColor: colors.accent,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      ...theme.shadows.card,
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
            position: 'absolute',
            left: tabBarHorizontalInset,
            right: tabBarHorizontalInset,
            bottom: tabBarBottom,
            backgroundColor: colors.surface,
            borderColor: colors.borderMuted,
            borderWidth: 1,
            borderRadius: tabBarHeight / 2,
            height: tabBarHeight,
            paddingTop: 0,
            paddingBottom: 0,
            paddingHorizontal: tabBarHorizontalPadding,
            overflow: 'hidden',
            ...theme.shadows.tabBar,
          },
          tabBarItemStyle: {
            flex: 0,
            width: itemWidth,
            justifyContent: 'center',
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
                size={iconSize}
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
              flex: 0,
              width: itemWidth,
              justifyContent: 'center',
              marginRight: centerGap / 2,
            },
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'calendar' : 'calendar-outline'}
                size={iconSize}
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
              flex: 0,
              width: itemWidth,
              justifyContent: 'center',
              paddingVertical: theme.spacing.xxs,
              marginLeft: centerGap / 2,
            },
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'stats-chart' : 'stats-chart-outline'}
                size={iconSize}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'settings' : 'settings-outline'}
                size={iconSize}
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
      </View>
    </View>
  );
}
