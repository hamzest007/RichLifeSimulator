import React from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { RESEARCH } from '../../features/progression/progressionData';
import {
  calculateTotalLiabilities,
  calculateUnrealizedProfitLoss,
} from '../../features/economy/economyEngine';
import { gameStore, selectors, useGameStore } from '../../store/gameStore';
import { AppCard } from '../../components/common/AppCard';
import {
  Header,
  Metric,
  ScreenScroll,
  screenStyles,
} from '../../components/common/ScreenShell';
import { colors } from '../../theme/colors';
import { formatCurrency } from '../../utils/currency';

const financeStyles = StyleSheet.create({
  financeHero: { backgroundColor: colors.surface2, borderColor: '#806a3a' },
  financeKicker: {
    color: colors.gold,
    fontSize: 10,
    letterSpacing: 1.4,
    fontWeight: '900',
  },
  financeValue: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '900',
    marginVertical: 8,
  },
  financeStatus: { color: colors.emerald, fontSize: 11, fontWeight: '900' },
  financeMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  safetyBar: {
    height: 7,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 18,
    marginBottom: 7,
  },
  safetyFill: {
    height: '100%',
    backgroundColor: colors.emerald,
    borderRadius: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 14,
  },
  financeInput: {
    width: 78,
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 8,
    color: colors.text,
    paddingVertical: 8,
    paddingHorizontal: 7,
    textAlign: 'center',
    fontWeight: '800',
  },
  financeButton: {
    backgroundColor: colors.gold,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  financeButtonText: { color: '#18202b', fontSize: 9, fontWeight: '900' },
  financeOutline: {
    borderColor: colors.gold,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 9,
    marginVertical: 9,
  },
  financeOutlineText: { color: colors.gold, fontSize: 9, fontWeight: '900' },
  reportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surface2,
    borderRadius: 12,
    padding: 13,
    marginTop: 18,
    marginBottom: 12,
  },
  reportLabel: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  reportValue: {
    color: colors.emerald,
    fontSize: 16,
    fontWeight: '900',
    marginTop: 5,
  },
});

export function ProfileScreen({
  onOpenFinance,
  onOpenLifestyle,
  onOpenProgression,
  onOpenSettings,
}: {
  onOpenFinance: () => void;
  onOpenLifestyle: () => void;
  onOpenProgression: () => void;
  onOpenSettings: () => void;
}) {
  const state = useGameStore(s => s);
  return (
    <ScreenScroll>
      <Header eyebrow="Founder profile" title={state.profile.name} />
      <AppCard style={styles.profile}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {state.profile.name.slice(0, 1).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.profileName}>{state.profile.name}</Text>
        <Text style={screenStyles.muted}>
          Reputation {state.profile.reputation} · {state.profile.xp} XP
        </Text>
      </AppCard>
      <AppCard>
        <Text style={screenStyles.cardTitle}>Finance snapshot</Text>
        <View style={screenStyles.flowRow}>
          <Metric
            label="Liabilities"
            value={formatCurrency(calculateTotalLiabilities(state))}
          />
          <Metric
            label="Realized P/L"
            value={formatCurrency(state.realizedProfit)}
            positive={state.realizedProfit >= 0}
          />
          <Metric
            label="Unrealized P/L"
            value={formatCurrency(calculateUnrealizedProfitLoss(state))}
            positive={calculateUnrealizedProfitLoss(state) >= 0}
          />
        </View>
      </AppCard>
      <AppCard>
        <Text style={screenStyles.cardTitle}>Game controls</Text>
        <Control label="Open full finance screen" onPress={onOpenFinance} />
        <Control label="Lifestyle assets" onPress={onOpenLifestyle} />
        <Control label="Leaderboard & prestige" onPress={onOpenProgression} />
        <Control label="Settings" onPress={onOpenSettings} />
        <Control
          label="Save progress"
          onPress={() => {
            gameStore.save();
            Alert.alert('Saved', 'Your empire has been saved locally.');
          }}
        />
        <Control
          label="Reset empire"
          danger
          onPress={() =>
            Alert.alert('Reset empire?', 'This removes your current run.', [
              { text: 'Cancel' },
              { text: 'Reset', style: 'destructive', onPress: gameStore.reset },
            ])
          }
        />
      </AppCard>
      <AppCard>
        <View style={styles.missionHeader}>
          <Text style={screenStyles.cardTitle}>Missions</Text>
          <View style={styles.dailyHeaderBadge}>
            <Text style={styles.dailyBadgeText}>DAILY + LIFETIME</Text>
          </View>
        </View>
        {state.missions.map(mission => {
          const highestBusinessLevel = state.businesses.reduce(
            (level, business) => Math.max(level, business.level),
            0,
          );
          const value =
            mission.type === 'businesses'
              ? state.businesses.length
              : mission.type === 'stocks'
                ? state.stocks.reduce((sum, item) => sum + item.quantity, 0)
                : mission.type === 'properties'
                  ? state.properties.length
                  : mission.type === 'netWorth'
                    ? selectors.netWorth(state)
                    : mission.type === 'upgrades'
                      ? highestBusinessLevel
                      : mission.type === 'rental'
                        ? state.totalRentalIncome
                        : mission.cadence === 'daily'
                          ? state.dailyProfit
                          : state.totalProfit;
          const done = value >= mission.target;
          return (
            <View style={styles.mission} key={mission.id}>
              <View style={styles.grow}>
                <View style={styles.missionTitleRow}>
                  <Text style={styles.controlText}>{mission.title}</Text>
                  <Text
                    style={
                      mission.cadence === 'daily'
                        ? styles.dailyBadge
                        : styles.lifetimeBadge
                    }
                  >
                    {mission.cadence === 'daily' ? 'DAILY' : 'LIFETIME'}
                  </Text>
                </View>
                <Text style={screenStyles.muted}>
                  {mission.description} ·{' '}
                  {formatCurrency(Math.min(value, mission.target))}/
                  {formatCurrency(mission.target)}
                </Text>
              </View>
              <Pressable
                style={[
                  styles.mini,
                  (!done || mission.claimed) && styles.disabled,
                ]}
                disabled={!done || mission.claimed}
                onPress={() => gameStore.claimMissionReward(mission.id)}
              >
                <Text style={styles.miniText}>
                  {mission.claimed ? 'CLAIMED' : `+$${mission.reward}`}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </AppCard>
      <AppCard>
        <Text style={screenStyles.cardTitle}>Research tree</Text>
        {RESEARCH.map(item => {
          const unlocked = state.research.includes(item.id);
          const available =
            !unlocked &&
            (!item.prerequisite || state.research.includes(item.prerequisite));
          return (
            <View style={styles.mission} key={item.id}>
              <View style={styles.grow}>
                <Text style={styles.controlText}>
                  {unlocked ? '✓ ' : ''}
                  {item.name}
                </Text>
                <Text style={screenStyles.muted}>{item.description}</Text>
              </View>
              <Pressable
                style={[
                  styles.mini,
                  (!available || state.cash < item.cost) && styles.disabled,
                ]}
                disabled={!available || state.cash < item.cost}
                onPress={() => gameStore.completeResearch(item.id)}
              >
                <Text style={styles.miniText}>
                  {unlocked ? 'DONE' : formatCurrency(item.cost)}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </AppCard>
      <AppCard>
        <Text style={screenStyles.cardTitle}>Achievements</Text>
        {state.achievements.map(item => (
          <View style={styles.mission} key={item.id}>
            <View style={styles.grow}>
              <Text style={styles.controlText}>
                {item.unlocked ? '✓ ' : '○ '}
                {item.title}
              </Text>
              <Text style={screenStyles.muted}>{item.description}</Text>
            </View>
            <Text style={item.unlocked ? styles.positive : screenStyles.muted}>
              {item.unlocked ? 'UNLOCKED' : `+$${item.reward}`}
            </Text>
          </View>
        ))}
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
      <Text style={[styles.controlText, danger && styles.danger]}>{label}</Text>
      <Text style={screenStyles.muted}>›</Text>
    </Pressable>
  );
}
export function FinanceScreen() {
  const state = useGameStore(s => s);
  const [amount, setAmount] = React.useState('1000');
  const [loan, setLoan] = React.useState('10000');
  const assets = selectors.assets(state);
  const passive = selectors.profit(state);
  const active = Math.max(0, state.dailyProfit - passive * 1440);
  const monthlyIncome = Math.max(0, passive * 60 * 24 * 30 + active * 30);
  const monthlyExpenses = selectors.expenses(state) * 60 * 24 * 30;
  const yearlyIncome = monthlyIncome * 12;
  const yearlyExpenses = monthlyExpenses * 12;
  const netWorth = selectors.netWorth(state);
  const milestone =
    netWorth >= 1_000_000_000
      ? 'BILLIONAIRE'
      : netWorth >= 10_000_000
        ? 'MULTIMILLIONAIRE'
        : netWorth >= 1_000_000
          ? 'MILLIONAIRE'
          : 'BUILDING WEALTH';
  const risk =
    state.liabilities > Math.max(1, netWorth) * 0.5
      ? 'HIGH RISK'
      : state.liabilities > 0
        ? 'MANAGED DEBT'
        : 'LOW RISK';
  const savings = state.bankAccounts.find(account => account.id === 'savings');
  const checking = state.bankAccounts.find(
    account => account.id === 'checking',
  );
  const debtToIncome =
    monthlyIncome > 0
      ? state.liabilities / monthlyIncome
      : state.liabilities > 0
        ? 99
        : 0;
  return (
    <ScreenScroll>
      <Header eyebrow="Personal & business finance" title="Finance center" />
      <AppCard style={financeStyles.financeHero}>
        <Text style={financeStyles.financeKicker}>TOTAL NET WORTH</Text>
        <Text style={financeStyles.financeValue}>
          {formatCurrency(netWorth)}
        </Text>
        <Text style={financeStyles.financeStatus}>
          {milestone} · {risk}
        </Text>
        <View style={financeStyles.financeMetrics}>
          <Metric
            label="Cash balance"
            value={formatCurrency(state.cash)}
            positive
          />
          <Metric label="Assets" value={formatCurrency(assets)} />
          <Metric
            label="Liabilities"
            value={formatCurrency(state.liabilities)}
          />
        </View>
      </AppCard>
      <AppCard>
        <Text style={screenStyles.cardTitle}>Banking & credit</Text>
        <View style={screenStyles.flowRow}>
          <Metric
            label="Checking"
            value={formatCurrency(checking?.balance ?? 0)}
          />
          <Metric
            label="Savings"
            value={formatCurrency(savings?.balance ?? 0)}
            positive
          />
          <Metric
            label="Interest"
            value={`${Math.round((savings?.annualRate ?? 0) * 100)}% APY`}
          />
        </View>
        <Text style={screenStyles.muted}>
          Credit score {state.creditScore} · Debt-to-income{' '}
          {Math.round(debtToIncome * 100)}% ·{' '}
          {state.creditScore >= 650
            ? 'Loan eligible'
            : 'Build credit to unlock better rates'}
        </Text>
        <View style={financeStyles.actionRow}>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="number-pad"
            style={financeStyles.financeInput}
          />
          <Pressable
            style={financeStyles.financeButton}
            onPress={() =>
              gameStore.transferBank('cash', 'savings', Number(amount))
            }
          >
            <Text style={financeStyles.financeButtonText}>TO SAVINGS</Text>
          </Pressable>
          <Pressable
            style={financeStyles.financeOutline}
            onPress={() =>
              gameStore.transferBank('savings', 'cash', Number(amount))
            }
          >
            <Text style={financeStyles.financeOutlineText}>WITHDRAW</Text>
          </Pressable>
        </View>
        <Pressable
          style={financeStyles.financeOutline}
          onPress={() =>
            gameStore.setAutomatedTransfer(!state.automatedTransfer.enabled)
          }
        >
          <Text style={financeStyles.financeOutlineText}>
            {state.automatedTransfer.enabled
              ? 'PAUSE AUTO-SAVE'
              : 'ENABLE AUTO-SAVE'}
          </Text>
        </Pressable>
        <Text style={screenStyles.muted}>
          Automated transfer: {formatCurrency(state.automatedTransfer.amount)}{' '}
          per minute from cash to savings
        </Text>
        <Text style={screenStyles.muted}>
          Budget: {Math.round(state.budgetAllocation.savings * 100)}% savings ·{' '}
          {Math.round(state.budgetAllocation.investing * 100)}% investing ·{' '}
          {Math.round(state.budgetAllocation.lifestyle * 100)}% lifestyle
        </Text>
        <Pressable
          style={financeStyles.financeOutline}
          onPress={() =>
            gameStore.setBudgetAllocation({
              savings: 0.3,
              investing: 0.2,
              lifestyle: 0.1,
              operations: 0.4,
            })
          }
        >
          <Text style={financeStyles.financeOutlineText}>
            SET BALANCED BUDGET
          </Text>
        </Pressable>
      </AppCard>
      <AppCard>
        <Text style={screenStyles.cardTitle}>Accounts & safety</Text>
        <View style={screenStyles.flowRow}>
          <Metric label="Operating cash" value={formatCurrency(state.cash)} />
          <Metric
            label="Emergency fund"
            value={formatCurrency(state.emergencyFund)}
            positive
          />
          <Metric
            label="Savings target"
            value={formatCurrency(state.savingsGoals[0]?.target ?? 0)}
          />
        </View>
        <View style={financeStyles.safetyBar}>
          <View
            style={[
              financeStyles.safetyFill,
              {
                width: `${Math.min(
                  100,
                  (state.emergencyFund /
                    Math.max(1, state.savingsGoals[0]?.target ?? 25000)) *
                  100,
                )}%`,
              },
            ]}
          />
        </View>
        <Text style={screenStyles.muted}>
          Emergency fund progress · {formatCurrency(state.emergencyFund)} saved
        </Text>
        <View style={financeStyles.actionRow}>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="number-pad"
            style={financeStyles.financeInput}
          />
          <Pressable
            style={financeStyles.financeButton}
            onPress={() => gameStore.fundEmergency(Number(amount))}
          >
            <Text style={financeStyles.financeButtonText}>SAVE</Text>
          </Pressable>
          <Pressable
            style={financeStyles.financeOutline}
            onPress={() => gameStore.withdrawEmergency(Number(amount))}
          >
            <Text style={financeStyles.financeOutlineText}>WITHDRAW</Text>
          </Pressable>
        </View>
      </AppCard>
      <AppCard>
        <Text style={screenStyles.cardTitle}>Income & expenses</Text>
        <View style={screenStyles.flowRow}>
          <Metric
            label="Passive / min"
            value={formatCurrency(passive)}
            positive
          />
          <Metric
            label="Active income"
            value={formatCurrency(active)}
            positive
          />
          <Metric
            label="Daily expenses"
            value={formatCurrency(selectors.expenses(state))}
          />
        </View>
        <View style={financeStyles.reportRow}>
          <View>
            <Text style={financeStyles.reportLabel}>MONTHLY REPORT</Text>
            <Text style={financeStyles.reportValue}>
              +{formatCurrency(monthlyIncome - monthlyExpenses)}
            </Text>
          </View>
          <View>
            <Text style={financeStyles.reportLabel}>YEARLY REPORT</Text>
            <Text style={financeStyles.reportValue}>
              +{formatCurrency(yearlyIncome - yearlyExpenses)}
            </Text>
          </View>
        </View>
        <Text style={screenStyles.muted}>
          Tax rate {Math.round(state.taxRate * 100)}% · Inflation{' '}
          {Math.round(state.inflationRate * 100)}% · purchasing power adjusts
          over time
        </Text>
      </AppCard>
      <AppCard>
        <Text style={screenStyles.cardTitle}>Assets & allocation</Text>
        <View style={screenStyles.flowRow}>
          <Metric
            label="Businesses"
            value={formatCurrency(
              state.businesses.reduce((sum, item) => sum + item.level * 0, 0) +
              selectors.assets(state) -
              state.stocks.reduce(
                (sum, item) =>
                  sum + (state.marketPrices[item.id] ?? 0) * item.quantity,
                0,
              ) -
              state.crypto.reduce(
                (sum, item) =>
                  sum + (state.marketPrices[item.id] ?? 0) * item.quantity,
                0,
              ),
            )}
          />
          <Metric
            label="Stocks"
            value={formatCurrency(
              state.stocks.reduce(
                (sum, item) =>
                  sum + (state.marketPrices[item.id] ?? 0) * item.quantity,
                0,
              ),
            )}
          />
          <Metric
            label="Crypto"
            value={formatCurrency(
              state.crypto.reduce(
                (sum, item) =>
                  sum + (state.marketPrices[item.id] ?? 0) * item.quantity,
                0,
              ),
            )}
          />
        </View>
        <Text style={screenStyles.muted}>
          Allocation is calculated from your live virtual portfolio and
          real-time simulated market prices.
        </Text>
      </AppCard>
      <AppCard>
        <Text style={screenStyles.cardTitle}>Loans & debt</Text>
        <Text style={screenStyles.muted}>
          Loans add 8% interest to liabilities. Repay debt to reduce bankruptcy
          risk.
        </Text>
        <View style={financeStyles.actionRow}>
          <TextInput
            value={loan}
            onChangeText={setLoan}
            keyboardType="number-pad"
            style={financeStyles.financeInput}
          />
          <Pressable
            style={financeStyles.financeButton}
            onPress={() => gameStore.takeLoan(Number(loan))}
          >
            <Text style={financeStyles.financeButtonText}>TAKE LOAN</Text>
          </Pressable>
          <Pressable
            style={financeStyles.financeOutline}
            onPress={() => gameStore.repayDebt(Number(loan))}
          >
            <Text style={financeStyles.financeOutlineText}>REPAY</Text>
          </Pressable>
        </View>
      </AppCard>
      <AppCard>
        <Text style={screenStyles.cardTitle}>Transaction ledger</Text>
        {state.transactions.slice(0, 12).map(item => (
          <View style={styles.ledger} key={item.id}>
            <Text style={styles.controlText}>{item.label}</Text>
            <Text
              style={[styles.controlText, item.amount >= 0 && styles.positive]}
            >
              {item.amount >= 0 ? '+' : ''}
              {formatCurrency(item.amount)}
            </Text>
          </View>
        ))}
      </AppCard>
    </ScreenScroll>
  );
}
const styles = StyleSheet.create({
  profile: {
    alignItems: 'center',
    paddingVertical: 25,
    backgroundColor: colors.surface2,
    borderColor: '#806a3a',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 4,
    borderColor: '#2b4d4a',
  },
  avatarText: { color: '#18202b', fontSize: 30, fontWeight: '900' },
  profileName: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 6,
  },
  missionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  dailyHeaderBadge: {
    backgroundColor: '#4a3034',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  dailyBadgeText: { color: colors.red, fontSize: 8, fontWeight: '900' },
  missionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  dailyBadge: {
    color: colors.gold,
    backgroundColor: '#4a3b24',
    borderRadius: 5,
    paddingVertical: 3,
    paddingHorizontal: 5,
    fontSize: 8,
    fontWeight: '900',
  },
  lifetimeBadge: {
    color: colors.muted,
    backgroundColor: colors.surface2,
    borderRadius: 5,
    paddingVertical: 3,
    paddingHorizontal: 5,
    fontSize: 8,
    fontWeight: '900',
  },
  missionTrack: {
    height: 5,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 8,
  },
  missionFill: {
    height: '100%',
    backgroundColor: colors.emerald,
    borderRadius: 3,
  },
  dailyFill: { backgroundColor: colors.gold },
  mission: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginTop: 15,
  },
  grow: { flex: 1 },
  control: {
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  controlText: { color: colors.text, fontSize: 14, fontWeight: '600' },
  mini: {
    backgroundColor: colors.gold,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  miniText: { color: '#18202b', fontWeight: '800', fontSize: 10 },
  disabled: { opacity: 0.4 },
  positive: { color: colors.emerald, fontWeight: '700' },
  danger: { color: colors.red },
  ledger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
});
