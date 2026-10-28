import React, { useEffect, useState } from 'react';
import { AppState, StyleSheet, Text, View } from 'react-native';
import { gameStore } from '../store/gameStore';
import { colors } from '../theme/colors';

export function AppInitializer({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    gameStore.load();
    gameStore.processOfflineProgress();
    setReady(true);
    const timer = setInterval(() => gameStore.collect(), 60_000);
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') gameStore.processOfflineProgress();
    });
    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, []);
  if (!ready)
    return (
      <View style={styles.splash}>
        <Text style={styles.mark}>ER</Text>
        <Text style={styles.title}>EMPIRE RISE</Text>
        <Text style={styles.caption}>RESTORING YOUR EMPIRE</Text>
      </View>
    );
  return <>{children}</>;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  mark: {
    color: colors.gold,
    fontSize: 54,
    fontWeight: '900',
    letterSpacing: -5,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 3,
    marginTop: 12,
  },
  caption: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 10,
  },
});
