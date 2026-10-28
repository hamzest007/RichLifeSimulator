import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabNavigator } from './MainTabNavigator';
import { FinanceScreen } from '../screens/profile/ProfileScreen';
import { colors } from '../theme/colors';
import { LifestyleScreen } from '../screens/lifestyle/LifestyleScreen';
import { ProgressionScreen } from '../screens/progression/ProgressionScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { StockDetailScreen } from '../screens/market/StockDetailScreen';
import { PropertyDetailScreen } from '../screens/realEstate/PropertyDetailScreen';

const Stack = createNativeStackNavigator();
export function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
      }}
    >
      <Stack.Screen name="Main" options={{ headerShown: false }}>
        {({ navigation }) => (
          <MainTabNavigator
            onOpenFinance={() => navigation.navigate('Finance')}
            onOpenLifestyle={() => navigation.navigate('Lifestyle')}
            onOpenProgression={() => navigation.navigate('Progression')}
            onOpenSettings={() => navigation.navigate('Settings')}
            onOpenAsset={(kind, id) =>
              navigation.navigate('AssetDetail', { kind, id })
            }
            onOpenProperty={id => navigation.navigate('PropertyDetail', { id })}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Finance" component={FinanceScreen} />
      <Stack.Screen name="Lifestyle" component={LifestyleScreen} />
      <Stack.Screen name="Progression" component={ProgressionScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen
        name="AssetDetail"
        component={StockDetailScreen}
        options={{ title: 'Market asset' }}
      />
      <Stack.Screen
        name="PropertyDetail"
        component={PropertyDetailScreen}
        options={{ title: 'Property detail' }}
      />
    </Stack.Navigator>
  );
}
