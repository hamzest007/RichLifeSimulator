import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {AppProviders} from './src/app/AppProviders';
import {AppInitializer} from './src/app/AppInitializer';
import {ErrorBoundary} from './src/app/ErrorBoundary';
import {OnboardingScreen} from './src/screens/onboarding/OnboardingScreen';
import {RootNavigator} from './src/navigation/RootNavigator';
import {useGameStore} from './src/store/gameStore';

export default function App() {
  return <ErrorBoundary><AppProviders><AppInitializer><EmpireRise/></AppInitializer></AppProviders></ErrorBoundary>;
}

function EmpireRise() {
  const onboardingComplete = useGameStore(state => state.onboardingComplete);
  return onboardingComplete ? <NavigationContainer><RootNavigator/></NavigationContainer> : <OnboardingScreen/>;
}
