import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { AppButton } from '../../components/common/AppButton';
import { AppCard } from '../../components/common/AppCard';
import { AppIcon } from '../../components/common/AppIcon';
import {
  Header,
  Metric,
  ScreenScroll,
  screenStyles,
} from '../../components/common/ScreenShell';
import { colors } from '../../theme/colors';
import { formatCurrency } from '../../utils/currency';
import {
  calculateTapReward,
  gameStore,
  selectors,
  useGameStore,
} from '../../store/gameStore';

export function DashboardScreen({
  onNavigate,
}: {
  onNavigate: (tab: 'Empire' | 'Markets' | 'Assets') => void;
}) {
  const state = useGameStore(s => s);
  const netWorth = selectors.netWorth(state);
  const profit = selectors.profit(state);
  const revenue = selectors.revenue(state);
  const expenses = selectors.expenses(state);
  const tapReward = calculateTapReward(state);
  return (
    <ScreenScroll>
      <Header
        eyebrow={`Level ${state.profile.level} · ${
          netWorth >= 1e9
            ? 'Billionaire'
            : netWorth >= 1e6
            ? 'Millionaire'
            : 'Rising Founder'
        }`}
        title={`Good evening, ${state.profile.name}`}
      />
      {state.activeWorldEvent && (
        <AppCard style={styles.eventCard}>
          <View style={styles.eventTop}>
            <View style={styles.eventIcon}>
              <AppIcon
                name="alert-circle-outline"
                size={22}
                color={colors.gold}
              />
            </View>
            <View style={styles.eventCopy}>
              <Text style={styles.eventKicker}>
                {state.activeWorldEvent.category.toUpperCase()} · DECISION
                REQUIRED
              </Text>
              <Text style={styles.eventTitle}>
                {state.activeWorldEvent.title}
              </Text>
            </View>
          </View>
          <Text style={styles.eventDescription}>
            {state.activeWorldEvent.description}
          </Text>
          {state.activeWorldEvent.options.map(option => (
            <Pressable
              key={option.id}
              onPress={() => gameStore.resolveWorldEvent(option.id)}
              style={styles.eventOption}
            >
              <View style={styles.eventOptionCopy}>
                <Text style={styles.eventOptionTitle}>{option.label}</Text>
                <Text style={styles.eventOptionText}>{option.description}</Text>
              </View>
              <AppIcon
                name="chevron-forward-outline"
                size={16}
                color={colors.gold}
              />
            </Pressable>
          ))}
        </AppCard>
      )}
      <AppCard style={styles.returnCard}>
        <View style={styles.returnTop}>
          <View>
            <Text style={styles.returnKicker}>WELCOME BACK</Text>
            <Text style={styles.returnTitle}>
              {state.lastOfflineSummary?.netEarnings
                ? `You earned ${formatCurrency(
                    state.lastOfflineSummary.netEarnings,
                  )} offline`
                : 'Your empire is ready'}
            </Text>
          </View>
          <AppIcon name="time-outline" size={20} color={colors.gold} />
        </View>
        {state.lastOfflineSummary?.netEarnings ? (
          <View style={styles.returnMetrics}>
            <Metric
              label="Business income"
              value={formatCurrency(state.lastOfflineSummary.businessIncome)}
              positive
            />
            <Metric
              label="Property rent"
              value={formatCurrency(state.lastOfflineSummary.propertyRent)}
              positive
            />
            <Metric
              label="Expenses"
              value={formatCurrency(state.lastOfflineSummary.operatingExpenses)}
            />
          </View>
        ) : (
          <Text style={screenStyles.muted}>
            Income continues while you are away. Managers and automation improve
            collection efficiency.
          </Text>
        )}
        <Pressable
          accessibilityRole="button"
          onPress={() => gameStore.claimDailyReward()}
          disabled={
            state.dailyRewardDay === new Date().toISOString().slice(0, 10)
          }
          style={[
            styles.dailyReward,
            state.dailyRewardDay === new Date().toISOString().slice(0, 10) &&
              styles.rewardClaimed,
          ]}
        >
          <Text
            style={[
              styles.dailyRewardText,
              state.dailyRewardDay === new Date().toISOString().slice(0, 10) &&
                styles.dailyRewardTextClaimed,
            ]}
          >
            {state.dailyRewardDay === new Date().toISOString().slice(0, 10)
              ? 'DAILY REWARD CLAIMED'
              : 'CLAIM DAILY RETURN REWARD'}
          </Text>
        </Pressable>
      </AppCard>
      \n{' '}
      <AppCard style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.heroIcon}>
            <AppIcon name="diamond-outline" size={20} color={colors.gold} />
          </View>
          <View>
            <Text style={styles.caps}>PERSONAL BALANCE SHEET</Text>
            <Text style={styles.heroCaption}>Your empire is compounding</Text>
          </View>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>
        <View style={styles.heroMain}>
          <View>
            <Text style={styles.caps}>TOTAL NET WORTH</Text>
            <Text style={styles.heroValue}>{formatCurrency(netWorth)}</Text>
            <Text style={styles.positive}>
              ↗ {formatCurrency(profit)} / minute passive profit
            </Text>
          </View>
          <View style={styles.rank}>
            <Text style={styles.rankText}>{state.profile.level}</Text>
            <Text style={styles.muted}>LEVEL</Text>
          </View>
        </View>
      </AppCard>
      <AppCard style={styles.earnCard}>
        <View style={styles.earnIcon}>
          <AppIcon name="flash" size={25} color={colors.gold} />
        </View>
        <View style={styles.earnCopy}>
          <Text style={screenStyles.cardTitle}>Founder bonus</Text>
          <Text style={screenStyles.muted}>
            Tap to earn virtual cash and build momentum.
          </Text>
          <Text style={styles.tapStats}>
            {state.tapCount} taps · {formatCurrency(tapReward)} per tap
          </Text>
          <Text style={styles.levelText}>
            Tap power LVL {state.tapLevel} · Upgrade{' '}
            {formatCurrency(state.tapUpgradeCost)}
          </Text>
        </View>
        <View style={styles.earnButtons}>
          <AppButton label="EARN" onPress={() => gameStore.tapToEarn()} />
          <Pressable
            accessibilityRole="button"
            disabled={state.cash < state.tapUpgradeCost}
            onPress={() => gameStore.upgradeTap()}
            style={[
              styles.upgradeButton,
              state.cash < state.tapUpgradeCost && styles.upgradeDisabled,
            ]}
          >
            <AppIcon name="flash" size={13} color={colors.gold} />
            <Text style={styles.upgradeText}>UPGRADE</Text>
          </Pressable>
        </View>
      </AppCard>
      <AppCard>
        <View style={screenStyles.sectionHead}>
          <Text style={screenStyles.cardTitle}>Empire activity</Text>
          <Text style={screenStyles.muted}>LIVE COUNT</Text>
        </View>
        <View style={screenStyles.flowRow}>
          <Metric
            label="Purchases"
            value={`${selectors.purchaseCount(state)}`}
          />
          <Metric label="Sales" value={`${selectors.saleCount(state)}`} />
          <Metric label="Upgrades" value={`${selectors.upgradeCount(state)}`} />
          <Metric label="Taps" value={`${state.tapCount}`} />
        </View>
      </AppCard>
      <AppCard>
        <View style={screenStyles.sectionHead}>
          <Text style={screenStyles.cardTitle}>Net worth history</Text>
          <Text style={screenStyles.muted}>LIVE LEDGER</Text>
        </View>
        <HistoryChart
          values={state.netWorthHistory.map(point => point.value)}
        />
      </AppCard>
      <View style={styles.two}>
        <AppCard style={styles.half}>
          <Metric label="Cash balance" value={formatCurrency(state.cash)} />
        </AppCard>
        <AppCard style={styles.half}>
          <Metric
            label="Owned assets"
            value={formatCurrency(selectors.assets(state))}
          />
        </AppCard>
      </View>
      <View style={styles.two}>
        <AppCard style={styles.half}>
          <Metric
            label="Liabilities"
            value={formatCurrency(state.liabilities)}
          />
        </AppCard>
        <AppCard style={styles.half}>
          <Metric
            label="Daily profit"
            value={formatCurrency(state.dailyProfit)}
            positive
          />
        </AppCard>
      </View>
      <AppCard>
        <View style={screenStyles.sectionHead}>
          <Text style={screenStyles.cardTitle}>Cash flow</Text>
          <Text style={screenStyles.muted}>PER MINUTE</Text>
        </View>
        <View style={screenStyles.flowRow}>
          <Metric
            label="Revenue"
            value={`+${formatCurrency(revenue)}`}
            positive
          />
          <Metric label="Expenses" value={`-${formatCurrency(expenses)}`} />
          <Metric
            label="Net"
            value={`${profit >= 0 ? '+' : ''}${formatCurrency(profit)}`}
            positive={profit >= 0}
          />
        </View>
      </AppCard>
      <View style={styles.quickRow}>
        <Quick label="Start a business" onPress={() => onNavigate('Empire')} />
        <Quick label="Explore markets" onPress={() => onNavigate('Markets')} />
        <Quick label="View assets" onPress={() => onNavigate('Assets')} />
      </View>
      <AppCard>
        <Text style={screenStyles.cardTitle}>Recent activity</Text>
        {state.transactions.slice(0, 5).map(item => (
          <View style={styles.activity} key={item.id}>
            <Text style={styles.activityLabel}>{item.label}</Text>
            <Text
              style={[
                styles.activityAmount,
                item.amount >= 0 && styles.positive,
              ]}
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
function Quick({ label, onPress }: { label: string; onPress: () => void }) {
  const icon = label.includes('business')
    ? 'business-outline'
    : label.includes('market')
    ? 'trending-up-outline'
    : 'home-outline';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={styles.quick}
    >
      <View style={styles.quickIcon}>
        <AppIcon name={icon} size={22} color={colors.gold} />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
      <AppIcon name="arrow-forward-outline" size={16} color={colors.muted} />
    </Pressable>
  );
}
function HistoryChart({ values }: { values: number[] }) {
  const points = values.length > 1 ? values : [values[0] ?? 0, values[0] ?? 0];
  const min = Math.min(...points);
  const range = Math.max(1, Math.max(...points) - min);
  const path = points
    .map(
      (v, i) =>
        `${i ? 'L' : 'M'} ${(i / (points.length - 1)) * 300} ${
          78 - ((v - min) / range) * 65
        }`,
    )
    .join(' ');
  return (
    <Svg height="90" width="100%" viewBox="0 0 300 90">
      <Path
        d={path}
        fill="none"
        stroke={colors.emerald}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </Svg>
  );
}
const styles = StyleSheet.create({
  returnCard: { backgroundColor: '#12263a', borderColor: '#2f5771' },
  returnTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  returnKicker: {
    fontSize: 9,
    color: colors.emerald,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  returnTitle: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '900',
    marginTop: 4,
    marginBottom: 8,
  },
  returnMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  dailyReward: {
    marginTop: 14,
    borderRadius: 9,
    backgroundColor: colors.gold,
    paddingVertical: 10,
    alignItems: 'center',
  },
  rewardClaimed: { backgroundColor: colors.surface2 },
  dailyRewardText: { fontSize: 9, color: '#18202b', fontWeight: '900' },
  dailyRewardTextClaimed: { color: colors.muted },
  eventCard: { backgroundColor: '#2a2418', borderColor: '#806a3a' },
  eventTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  eventIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#51401f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventCopy: { flex: 1 },
  eventKicker: {
    color: colors.gold,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  eventTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
    marginTop: 4,
  },
  eventDescription: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginVertical: 12,
  },
  eventOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#806a3a66',
    paddingVertical: 11,
  },
  eventOptionCopy: { flex: 1, paddingRight: 8 },
  eventOptionTitle: { color: colors.text, fontWeight: '800', fontSize: 12 },
  eventOptionText: { color: colors.muted, fontSize: 10, marginTop: 3 },
  hero: { backgroundColor: colors.surface2, borderColor: '#806a3a' },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
  },
  heroIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: '#2b4d4a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCaption: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
  },
  liveBadge: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#173d36',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.emerald,
  },
  liveText: { fontSize: 9, color: colors.emerald, fontWeight: '900' },
  heroMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  caps: {
    fontSize: 10,
    letterSpacing: 1.3,
    color: colors.muted,
    fontWeight: '700',
  },
  heroValue: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '800',
    marginVertical: 7,
  },
  positive: { color: colors.emerald, fontWeight: '700' },
  rank: {
    borderRadius: 12,
    padding: 10,
    backgroundColor: '#263a45',
    alignItems: 'center',
  },
  rankText: { color: colors.gold, fontWeight: '900', fontSize: 24 },
  muted: { color: colors.muted, fontSize: 11 },
  earnCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#142c35',
    borderColor: '#2c6358',
  },
  earnIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#285347',
    marginRight: 11,
  },
  earnCopy: { flex: 1, marginRight: 8 },
  tapStats: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 6,
  },
  levelText: { color: colors.muted, fontSize: 10, marginTop: 5 },
  earnButtons: { gap: 7, alignItems: 'stretch' },
  upgradeButton: {
    borderColor: colors.gold,
    borderWidth: 1,
    borderRadius: 9,
    paddingVertical: 8,
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  upgradeText: { color: colors.gold, fontSize: 9, fontWeight: '900' },
  upgradeDisabled: { opacity: 0.4 },
  two: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  quickRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  quick: {
    flex: 1,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 15,
    padding: 14,
    minHeight: 86,
  },
  quickIcon: { marginBottom: 10 },
  quickLabel: { fontSize: 12, color: colors.text, fontWeight: '700', flex: 1 },
  activity: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  activityLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  activityAmount: { color: colors.text, fontWeight: '800' },
});
