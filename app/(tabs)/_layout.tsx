import { Redirect, Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
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
  const tabBarHorizontalPadding = theme.spacing.lg;
  const tabBarHeight = theme.sizing.tabBarHeight - 2;
  const tabBarBottom = Math.max(theme.spacing.lg, insets.bottom + theme.spacing.xs);
  const tabBarWidth = Math.min(viewportWidth - theme.spacing.xl * 2, 360);
  const fabSize = theme.sizing.buttonHeight + 6;
  const fabBottom = tabBarBottom + tabBarHeight - fabSize * 0.74;
  const iconSize = theme.sizing.iconMd - 3;
  const centerGap = fabSize + theme.spacing.md;
  const barInnerWidth = tabBarWidth - tabBarHorizontalPadding * 2;
  const itemWidth = Math.max(42, (barInnerWidth - centerGap) / 4);

  if (isBootstrapping) return <LoadingScreen />;
  if (!user) return <Redirect href="/(auth)/sign-in" />;

  const iconByRoute: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> =
    {
      index: { active: 'home', inactive: 'home-outline' },
      calendar: { active: 'calendar', inactive: 'calendar-outline' },
      insights: { active: 'stats-chart', inactive: 'stats-chart-outline' },
      profile: { active: 'settings', inactive: 'settings-outline' },
    };

  const styles = StyleSheet.create({
    root: {
      flex: 1,
    },
    tabBarOverlay: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      top: 0,
    },
    tabBarWrap: {
      position: 'absolute',
      alignSelf: 'center',
      width: tabBarWidth,
      height: tabBarHeight,
      bottom: tabBarBottom,
      borderRadius: tabBarHeight / 2,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.borderMuted,
      paddingHorizontal: tabBarHorizontalPadding,
      ...theme.shadows.tabBar,
    },
    tabBarRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    centerSpacer: {
      width: centerGap,
      height: 1,
    },
    tabButton: {
      width: itemWidth,
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 3,
    },
    tabLabel: {
      fontSize: theme.typography.fontSize.xs - 1,
      fontWeight: '600',
    },
    fabWrap: {
      position: 'absolute',
      bottom: fabBottom,
      left: '50%',
      marginLeft: -fabSize / 2,
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

  function CustomTabBar({ state, navigation, descriptors }: BottomTabBarProps) {
    const visibleRoutes = state.routes.filter((route) => {
      return route.name in iconByRoute;
    });
    const leftRoutes = visibleRoutes.slice(0, 2);
    const rightRoutes = visibleRoutes.slice(2, 4);

    const renderRoute = (route: (typeof visibleRoutes)[number]) => {
      const options = descriptors[route.key].options;
      const focused = state.index === state.routes.findIndex((candidate) => candidate.key === route.key);
      const tabIcon = iconByRoute[route.name];
      const tint = focused ? colors.accent : colors.textMuted;
      const label = typeof options.title === 'string' ? options.title : route.name;

      const onPress = () => {
        const event = navigation.emit({
          type: 'tabPress',
          target: route.key,
          canPreventDefault: true,
        });
        if (!focused && !event.defaultPrevented) {
          navigation.navigate(route.name);
        }
      };

      return (
        <Pressable key={route.key} onPress={onPress} style={styles.tabButton}>
          <Ionicons name={focused ? tabIcon.active : tabIcon.inactive} size={iconSize} color={tint} />
          <Text style={[styles.tabLabel, { color: tint }]} numberOfLines={1}>
            {label}
          </Text>
        </Pressable>
      );
    };

    return (
      <View pointerEvents="box-none" style={styles.tabBarOverlay}>
        <View style={styles.tabBarWrap}>
          <View style={styles.tabBarRow}>
            {leftRoutes.map(renderRoute)}
            <View style={styles.centerSpacer} />
            {rightRoutes.map(renderRoute)}
          </View>
        </View>

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

  return (
    <View style={styles.root}>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
          }}
        />
        <Tabs.Screen
          name="calendar"
          options={{
            title: 'Calendar',
          }}
        />
        <Tabs.Screen
          name="insights"
          options={{
            title: 'Insights',
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Settings',
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
    </View>
  );
}
