import React from 'react';
import { Alert, Pressable, StyleSheet, Text } from 'react-native';
import { AppCard } from '../../components/common/AppCard';
import {
  Header,
  ScreenScroll,
  screenStyles,
} from '../../components/common/ScreenShell';
import { gameStore } from '../../store/gameStore';
import { colors } from '../../theme/colors';

export function SettingsScreen() {
  return (
    <ScreenScroll>
      <Header eyebrow="Preferences" title="Settings" />
      <AppCard>
        <Text style={screenStyles.cardTitle}>Game data</Text>
        <Control
          label="Save progress"
          onPress={() => {
            gameStore.save();
            Alert.alert('Saved', 'Your empire has been saved locally.');
          }}
        />
        <Control
          label="Reset local empire"
          danger
          onPress={() =>
            Alert.alert(
              'Reset empire?',
              'This permanently removes this local run.',
              [
                { text: 'Cancel' },
                {
                  text: 'Reset',
                  style: 'destructive',
                  onPress: gameStore.reset,
                },
              ],
            )
          }
        />
      </AppCard>
      <AppCard>
        <Text style={screenStyles.cardTitle}>About this game</Text>
        <Text style={screenStyles.intro}>
          Empire Rise is an original, offline-capable investor tycoon. All
          companies, prices, currencies, rivals, and assets are fictional. No
          backend, wallet, blockchain, real-money trading, or live market feed
          is used.
        </Text>
      </AppCard>
    </ScreenScroll>
  );
}
function Control({
  label,
  onPress,
  danger,
}: {
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={styles.control}
    >
      <Text style={[styles.text, danger && styles.danger]}>{label}</Text>
      <Text style={screenStyles.muted}>›</Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  control: {
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  text: { color: colors.text, fontSize: 14, fontWeight: '600' },
  danger: { color: colors.red },
});
