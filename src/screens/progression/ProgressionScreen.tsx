import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppCard } from '../../components/common/AppCard';
import {
  Header,
  ScreenScroll,
  screenStyles,
} from '../../components/common/ScreenShell';
import { gameStore, selectors, useGameStore } from '../../store/gameStore';
import { colors } from '../../theme/colors';
import { formatCurrency } from '../../utils/currency';

const RIVALS = [
  { name: 'Mira Chen', value: 4200000000 },
  { name: 'Atlas Group', value: 1800000000 },
  { name: 'Northstar Family', value: 620000000 },
];
const CAREERS = [
  {
    id: 'operator',
    title: 'Operator',
    description: 'Build businesses and master company management.',
  },
  {
    id: 'investor',
    title: 'Investor',
    description: 'Diversify into stocks, crypto, and property.',
  },
  {
    id: 'developer',
    title: 'Developer',
    description: 'Create a high-value real estate and lifestyle portfolio.',
  },
] as const;
export function ProgressionScreen() {
  const state = useGameStore(s => s);
  const players = [
    { name: state.profile.name, value: selectors.netWorth(state) },
    ...RIVALS,
  ].sort((a, b) => b.value - a.value);
  const rank =
    players.findIndex(player => player.name === state.profile.name) + 1;
  const canPrestige = selectors.netWorth(state) >= 1_000_000;
  return (
    <ScreenScroll>
      <Header
        eyebrow="Long-term progression"
        title="Legacy"
        icon="trophy-outline"
      />
      <AppCard>
        <Text style={screenStyles.cardTitle}>{state.activeTitle}</Text>
        <Text style={screenStyles.intro}>
          Level {state.profile.level} · {state.profile.xp} XP ·{' '}
          {state.profile.reputation} reputation · New Game+ {state.newGamePlus}
        </Text>
        <View style={styles.titleRow}>
          {state.titles.map(title => (
            <Pressable
              key={title}
              onPress={() => gameStore.equipTitle(title)}
              style={[
                styles.titlePill,
                title === state.activeTitle && styles.titlePillActive,
              ]}
            >
              <Text
                style={[
                  styles.titleText,
                  title === state.activeTitle && styles.titleTextActive,
                ]}
              >
                {title}
              </Text>
            </Pressable>
          ))}
        </View>
      </AppCard>
      <AppCard>
        <Text style={screenStyles.cardTitle}>Career path</Text>
        <Text style={screenStyles.intro}>
          Choose a long-term identity. Your path is permanent until New Game+.
        </Text>
        <View style={styles.careerGrid}>
          {CAREERS.map(career => (
            <Pressable
              key={career.id}
              disabled={Boolean(state.careerPath)}
              onPress={() => gameStore.chooseCareerPath(career.id)}
              style={[
                styles.career,
                state.careerPath === career.id && styles.careerActive,
                state.careerPath &&
                  state.careerPath !== career.id &&
                  styles.dim,
              ]}
            >
              <Text style={styles.careerTitle}>{career.title}</Text>
              <Text style={styles.careerText}>{career.description}</Text>
            </Pressable>
          ))}
        </View>
      </AppCard>
      <AppCard>
        <Text style={screenStyles.cardTitle}>Missions & challenges</Text>
        <Text style={screenStyles.intro}>
          Learn the systems: research, investing, business upgrades, staffing,
          and diversification.
        </Text>
        {state.missions
          .filter(item => !item.hidden)
          .map(mission => (
            <View key={mission.id} style={styles.mission}>
              <View style={styles.missionCopy}>
                <Text style={styles.missionTitle}>
                  {mission.title} · {mission.cadence?.toUpperCase()}
                </Text>
                <Text style={styles.missionText}>{mission.description}</Text>
                <Text style={styles.reward}>
                  {formatCurrency(mission.reward)} reward
                </Text>
              </View>
              <Pressable
                disabled={mission.claimed}
                onPress={() => gameStore.claimMissionReward(mission.id)}
                style={[styles.claim, mission.claimed && styles.claimed]}
              >
                <Text style={styles.claimText}>
                  {mission.claimed ? 'CLAIMED' : 'CLAIM'}
                </Text>
              </Pressable>
            </View>
          ))}
        <Text style={styles.streak}>
          Daily streak: {state.missionStreak} · Complete all daily objectives
          for a growing bonus.
        </Text>
      </AppCard>
      <AppCard>
        <Text style={screenStyles.cardTitle}>Achievements</Text>
        {state.achievements.map(item => (
          <View key={item.id} style={styles.achievement}>
            <View style={styles.missionCopy}>
              <Text style={styles.missionTitle}>
                {item.unlocked ? '✓ ' : '○ '}
                {item.title}
              </Text>
              <Text style={styles.missionText}>
                {item.unlocked
                  ? item.description
                  : item.hidden
                  ? 'Hidden achievement discovered through play.'
                  : item.description}
              </Text>
            </View>
            <Text style={item.unlocked ? styles.reward : styles.locked}>
              {item.unlocked ? 'UNLOCKED' : 'LOCKED'}
            </Text>
          </View>
        ))}
      </AppCard>
      <AppCard>
        <Text style={screenStyles.cardTitle}>Local leaderboard</Text>
        <Text style={screenStyles.intro}>
          A fictional benchmark against simulated founders. No network account
          or online leaderboard is used.
        </Text>
        {players.map((player, index) => (
          <View style={styles.row} key={player.name}>
            <Text style={styles.rank}>#{index + 1}</Text>
            <Text style={styles.name}>
              {player.name === state.profile.name
                ? `${player.name} (you)`
                : player.name}
            </Text>
            <Text style={styles.value}>{formatCurrency(player.value)}</Text>
          </View>
        ))}
        <Text style={styles.position}>Your position: #{rank}</Text>
      </AppCard>
      <AppCard>
        <Text style={screenStyles.cardTitle}>New Game+ prestige</Text>
        <Text style={screenStyles.intro}>
          Reset your empire while keeping achievements, titles, career path,
          reputation, and permanent income bonuses.
        </Text>
        <Text style={styles.points}>
          {state.prestigePoints} prestige points · {state.prestigeCount} resets
          · +{Math.round(state.permanentIncomeBonus * 100)}% permanent income
        </Text>
        <Text
          onPress={() =>
            canPrestige &&
            Alert.alert(
              'Start New Game+?',
              'This resets current assets and progression. Permanent progression remains.',
              [
                { text: 'Cancel' },
                {
                  text: 'Prestige',
                  style: 'destructive',
                  onPress: gameStore.prestige,
                },
              ],
            )
          }
          style={[styles.prestigeButton, !canPrestige && styles.disabled]}
        >
          {canPrestige
            ? 'START NEW GAME+'
            : `Need ${formatCurrency(
                1_000_000 - selectors.netWorth(state),
              )} more net worth`}
        </Text>
      </AppCard>
    </ScreenScroll>
  );
}
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rank: { width: 34, color: colors.gold, fontWeight: '900' },
  name: { flex: 1, color: colors.text, fontWeight: '700' },
  value: { color: colors.text, fontWeight: '800' },
  position: { color: colors.emerald, fontWeight: '800', marginTop: 16 },
  points: { color: colors.gold, fontWeight: '800', marginBottom: 16 },
  prestigeButton: {
    backgroundColor: colors.gold,
    borderRadius: 10,
    color: '#18202b',
    padding: 13,
    textAlign: 'center',
    fontWeight: '900',
  },
  disabled: { opacity: 0.4 },
  titleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 10 },
  titlePill: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 9,
  },
  titlePillActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  titleText: { color: colors.muted, fontSize: 10, fontWeight: '800' },
  titleTextActive: { color: '#18202b' },
  careerGrid: { gap: 8 },
  career: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 11,
  },
  careerActive: { borderColor: colors.emerald, backgroundColor: '#173d36' },
  dim: { opacity: 0.45 },
  careerTitle: { color: colors.text, fontWeight: '900' },
  careerText: { color: colors.muted, fontSize: 11, marginTop: 4 },
  mission: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 11,
  },
  missionCopy: { flex: 1, paddingRight: 8 },
  missionTitle: { color: colors.text, fontWeight: '800', fontSize: 12 },
  missionText: { color: colors.muted, fontSize: 10, marginTop: 3 },
  reward: {
    color: colors.emerald,
    fontSize: 10,
    fontWeight: '900',
    marginTop: 4,
  },
  claim: {
    backgroundColor: colors.gold,
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 10,
  },
  claimed: { backgroundColor: colors.surface2 },
  claimText: { color: '#18202b', fontSize: 9, fontWeight: '900' },
  streak: {
    color: colors.gold,
    fontSize: 10,
    fontWeight: '800',
    marginTop: 10,
  },
  achievement: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 10,
  },
  locked: { color: colors.muted, fontSize: 9, fontWeight: '900' },
});
