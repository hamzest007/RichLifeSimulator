import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { BusinessesScreen } from '../screens/businesses/BusinessesScreen';
import { MarketsScreen } from '../screens/market/MarketsScreen';
import { AssetsScreen } from '../screens/realEstate/AssetsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { colors } from '../theme/colors';
import { AppIcon } from '../components/common/AppIcon';
import { useGameStore } from '../store/gameStore';

const Tab = createBottomTabNavigator();
const icons = {
  Home: ['home-outline', 'home'],
  Empire: ['business-outline', 'business'],
  Markets: ['trending-up-outline', 'trending-up'],
  Assets: ['home-outline', 'home'],
  Profile: ['person-outline', 'person'],
} as const;
export function MainTabNavigator({
  onOpenFinance,
  onOpenLifestyle,
  onOpenProgression,
  onOpenSettings,
  onOpenAsset,
  onOpenProperty,
}: {
  onOpenFinance: () => void;
  onOpenLifestyle: () => void;
  onOpenProgression: () => void;
  onOpenSettings: () => void;
  onOpenAsset: (kind: 'stocks' | 'crypto', id: string) => void;
  onOpenProperty: (id: string) => void;
}) {
  const dailyMissionBadge = useGameStore(
    s =>
      s.missions.filter(
        mission => mission.cadence === 'daily' && !mission.claimed,
      ).length,
  );
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#091522',
          borderTopColor: colors.border,
          height: 72,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
        tabBarBadge:
          route.name === 'Profile' && dailyMissionBadge > 0
            ? dailyMissionBadge
            : undefined,
        tabBarBadgeStyle: {
          backgroundColor: colors.red,
          color: colors.text,
          fontSize: 9,
          fontWeight: '900',
        },
        tabBarIcon: ({ color, size, focused }) => (
          <AppIcon
            name={icons[route.name as keyof typeof icons][focused ? 1 : 0]}
            color={color}
            size={focused ? size + 1 : size}
          />
        ),
      })}
    >
      <Tab.Screen name="Home">
        {({ navigation }) => (
          <DashboardScreen onNavigate={tab => navigation.navigate(tab)} />
        )}
      </Tab.Screen>
      <Tab.Screen name="Empire" component={BusinessesScreen} />
      <Tab.Screen name="Markets">
        {() => <MarketsScreen onOpenAsset={onOpenAsset} />}
      </Tab.Screen>
      <Tab.Screen name="Assets">
        {() => <AssetsScreen onOpenProperty={onOpenProperty} />}
      </Tab.Screen>
      <Tab.Screen name="Profile">
        {() => (
          <ProfileScreen
            onOpenFinance={onOpenFinance}
            onOpenLifestyle={onOpenLifestyle}
            onOpenProgression={onOpenProgression}
            onOpenSettings={onOpenSettings}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
