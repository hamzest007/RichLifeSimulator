import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { LIFESTYLE_ASSETS } from '../../features/lifestyle/lifestyleData';
import { gameStore, useGameStore } from '../../store/gameStore';
import { AppCard } from '../../components/common/AppCard';
import { AppIcon } from '../../components/common/AppIcon';
import { LifestyleArtwork } from '../../components/common/LifestyleArtwork';
import {
  Header,
  ScreenScroll,
  screenStyles,
} from '../../components/common/ScreenShell';
import { colors } from '../../theme/colors';
import { formatCurrency } from '../../utils/currency';
import { GameState } from '../../types/game';
import { calculateLifestyleExpensesPerTick } from '../../features/economy/economyEngine';

const filters = [
  'All',
  'Cars',
  'Owned',
  'Affordable',
  'Homes',
  'Leisure',
  'Aviation',
  'Legacy',
];

export function LifestyleScreen() {
  const state = useGameStore(s => s);
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [highToLow, setHighToLow] = useState(false);
  const dealershipOwned = state.businesses.some(
    item => item.id === 'dealership',
  );
  const collectionValue = state.lifestyle.reduce((sum, item) => {
    const asset = LIFESTYLE_ASSETS.find(entry => entry.id === item.id);
    return sum + (asset?.price ?? 0);
  }, 0);
  const visible = useMemo(
    () =>
      LIFESTYLE_ASSETS.filter(asset => {
        const owned = state.lifestyle.some(item => item.id === asset.id);
        const matchesFilter =
          filter === 'All' ||
          (filter === 'Cars' && asset.visual === 'car') ||
          (filter === 'Owned' && owned) ||
          (filter === 'Affordable' && asset.price <= state.cash) ||
          (filter === 'Homes' && asset.visual === 'home') ||
          asset.category === filter;
        const matchesSearch =
          `${asset.name} ${asset.category} ${asset.description}`
            .toLowerCase()
            .includes(query.trim().toLowerCase());
        return matchesFilter && matchesSearch;
      }).sort((a, b) => (highToLow ? b.price - a.price : a.price - b.price)),
    [filter, highToLow, query, state.cash, state.lifestyle],
  );
  const carsOwned = state.lifestyle.filter(
    item =>
      LIFESTYLE_ASSETS.find(asset => asset.id === item.id)?.visual === 'car',
  ).length;
  const monthlyLifestyleCost =
    calculateLifestyleExpensesPerTick(state) * 30 * 24 * 60;
  return (
    <ScreenScroll>
      <Header
        eyebrow="Private collection"
        title="Luxury garage"
        icon="diamond-outline"
      />
      <AppCard style={styles.hero}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.kicker}>COLLECTOR MARKET · LIVE</Text>
            <Text style={styles.heroTitle}>
              {carsOwned} cars in your collection
            </Text>
          </View>
          <View style={styles.heroIcon}>
            <AppIcon name="car-sport-outline" size={24} color={colors.gold} />
          </View>
        </View>
        <Text style={styles.intro}>
          Buy, collect, drive, repair, and resell premium cars. Your auto
          dealership improves resale value once acquired.
        </Text>
        <View style={styles.stats}>
          <Text style={styles.stat}>
            <Text style={styles.statValue}>{state.lifestyle.length}</Text> owned
            assets
          </Text>
          <Text style={styles.stat}>
            <Text style={styles.statValue}>
              {formatCurrency(collectionValue)}
            </Text>{' '}
            collection value
          </Text>
          <Text style={styles.stat}>
            <Text style={styles.statValue}>{state.lifestyleRating}/100</Text>{' '}
            lifestyle rating
          </Text>
        </View>
        <View style={modeStyles.strategy}>
          <View style={modeStyles.strategyCopy}>
            <Text style={modeStyles.strategyKicker}>LIFESTYLE STRATEGY</Text>
            <Text style={modeStyles.strategyTitle}>
              {state.lifestyleMode === 'frugal'
                ? 'Frugal billionaire'
                : 'Luxury billionaire'}
            </Text>
            <Text style={screenStyles.muted}>
              {state.lifestyleMode === 'frugal'
                ? 'Keep expenses lean and reinvest more of every profit.'
                : 'Spend for prestige, status, and a stronger luxury collection.'}
            </Text>
            <Text style={modeStyles.expense}>
              Lifestyle run-rate · {formatCurrency(monthlyLifestyleCost)}/mo
            </Text>
          </View>
          <View style={modeStyles.buttons}>
            <Pressable
              onPress={() => gameStore.setLifestyleMode('frugal')}
              style={[
                modeStyles.button,
                state.lifestyleMode === 'frugal' && modeStyles.buttonActive,
              ]}
            >
              <Text
                style={[
                  modeStyles.buttonText,
                  state.lifestyleMode === 'frugal' &&
                    modeStyles.buttonTextActive,
                ]}
              >
                FRUGAL
              </Text>
            </Pressable>
            <Pressable
              onPress={() => gameStore.setLifestyleMode('luxury')}
              style={[
                modeStyles.button,
                state.lifestyleMode === 'luxury' && modeStyles.buttonActive,
              ]}
            >
              <Text
                style={[
                  modeStyles.buttonText,
                  state.lifestyleMode === 'luxury' &&
                    modeStyles.buttonTextActive,
                ]}
              >
                LUXURY
              </Text>
            </Pressable>
          </View>
        </View>
      </AppCard>
      <View style={styles.searchRow}>
        <AppIcon name="trending-up-outline" size={16} color={colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search cars, homes, yachts..."
          placeholderTextColor={colors.muted}
          style={styles.search}
        />
        <Pressable
          onPress={() => setHighToLow(value => !value)}
          style={styles.sort}
        >
          <AppIcon
            name="swap-horizontal-outline"
            size={14}
            color={colors.gold}
          />
          <Text style={styles.sortText}>
            {highToLow ? 'PRICE ↓' : 'PRICE ↑'}
          </Text>
        </Pressable>
      </View>
      <View style={styles.filters}>
        {filters.map(item => (
          <Pressable
            key={item}
            onPress={() => setFilter(item)}
            style={[styles.filter, filter === item && styles.activeFilter]}
          >
            <Text
              style={[
                styles.filterText,
                filter === item && styles.activeFilterText,
              ]}
            >
              {item}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.marketLine}>
        <Text style={styles.marketLineText}>
          {visible.length} market listings
        </Text>
        <Text style={styles.marketLineText}>
          {dealershipOwned ? 'Dealer network active' : 'Private buyer mode'}
        </Text>
      </View>
      {visible.map(asset => (
        <LifestyleCard key={asset.id} asset={asset.id} state={state} />
      ))}
    </ScreenScroll>
  );
}

function LifestyleCard({
  asset: id,
  state,
}: {
  asset: string;
  state: GameState;
}) {
  const asset = LIFESTYLE_ASSETS.find(item => item.id === id)!;
  const ownedItem = state.lifestyle.find(item => item.id === asset.id);
  const owned = Boolean(ownedItem);
  const locked = state.prestigeCount < asset.prestigeRequired;
  const condition = ownedItem?.condition ?? 1;
  const repairCost = Math.max(
    500,
    Math.round(asset.price * 0.025 * Math.max(0.1, 1 - condition)),
  );
  return (
    <AppCard style={[styles.card, owned && styles.ownedCard]}>
      <View style={styles.art}>
        <LifestyleArtwork type={asset.visual} />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {owned ? 'IN COLLECTION' : asset.category.toUpperCase()}
          </Text>
        </View>
      </View>
      <View style={styles.info}>
        <View style={styles.copy}>
          <Text style={styles.name}>{asset.name}</Text>
          <Text style={screenStyles.muted}>{asset.description}</Text>
          <Text style={styles.price}>{formatCurrency(asset.price)}</Text>
          {owned && (
            <Text style={styles.conditionValue}>
              {Math.round(condition * 100)}% condition
            </Text>
          )}
        </View>
        {owned ? (
          <View style={styles.ownedActions}>
            {asset.visual === 'car' && (
              <Pressable
                accessibilityRole="button"
                onPress={() => gameStore.driveLifestyle(asset.id)}
                style={styles.drive}
              >
                <AppIcon
                  name="car-sport-outline"
                  size={13}
                  color={colors.emerald}
                />
                <Text style={styles.driveText}>DRIVE</Text>
              </Pressable>
            )}
            <Pressable
              accessibilityRole="button"
              disabled={condition >= 1}
              onPress={() => gameStore.repairLifestyle(asset.id)}
              style={[styles.repair, condition >= 1 && styles.disabled]}
            >
              <AppIcon name="construct-outline" size={13} color={colors.gold} />
              <Text style={styles.sellText}>
                {condition >= 1
                  ? 'NEW'
                  : `REPAIR ${formatCurrency(repairCost)}`}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => gameStore.sellLifestyle(asset.id)}
              style={styles.sell}
            >
              <AppIcon
                name="swap-horizontal-outline"
                size={14}
                color={colors.gold}
              />
              <Text style={styles.sellText}>
                SELL {formatCurrency(Math.round(asset.price * 0.82))}
              </Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            disabled={locked || state.cash < asset.price}
            onPress={() => gameStore.purchaseLifestyle(asset.id)}
            style={[
              styles.buy,
              (locked || state.cash < asset.price) && styles.disabled,
            ]}
          >
            <Text style={styles.buyText}>
              {locked
                ? `PRESTIGE ${asset.prestigeRequired}`
                : state.cash < asset.price
                ? 'NEED FUNDS'
                : asset.visual === 'car'
                ? 'BUY CAR'
                : 'BUY NOW'}
            </Text>
          </Pressable>
        )}
      </View>
    </AppCard>
  );
}

const modeStyles = StyleSheet.create({
  strategy: {
    marginTop: 14,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#0b1c2d',
    borderWidth: 1,
    borderColor: '#28506b',
    flexDirection: 'row',
    alignItems: 'center',
  },
  strategyCopy: { flex: 1, paddingRight: 10 },
  strategyKicker: {
    fontSize: 9,
    color: colors.gold,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  strategyTitle: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '900',
    marginTop: 4,
  },
  expense: {
    fontSize: 10,
    color: colors.emerald,
    fontWeight: '800',
    marginTop: 7,
  },
  buttons: { gap: 6 },
  button: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 9,
  },
  buttonActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  buttonText: { fontSize: 8, color: colors.muted, fontWeight: '900' },
  buttonTextActive: { color: '#18202b' },
});

const styles = StyleSheet.create({
  hero: { backgroundColor: '#13283d', borderColor: '#806a3a' },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kicker: {
    fontSize: 10,
    color: colors.gold,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  heroTitle: {
    fontSize: 22,
    color: colors.text,
    fontWeight: '900',
    marginTop: 7,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#2b4d4a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  intro: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.muted,
    marginVertical: 14,
  },
  stats: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  stat: { color: colors.muted, fontSize: 10, fontWeight: '700', flex: 1 },
  statValue: { color: colors.text, fontWeight: '900' },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 11,
    marginBottom: 11,
  },
  search: { color: colors.text, flex: 1, fontSize: 12, paddingVertical: 11 },
  sort: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 7,
    paddingHorizontal: 7,
    borderRadius: 7,
    backgroundColor: colors.surface2,
  },
  sortText: { color: colors.gold, fontSize: 9, fontWeight: '900' },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 8 },
  filter: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 9,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  activeFilter: { backgroundColor: colors.gold, borderColor: colors.gold },
  filterText: { color: colors.muted, fontSize: 10, fontWeight: '800' },
  activeFilterText: { color: '#18202b' },
  marketLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  marketLineText: { color: colors.muted, fontSize: 10, fontWeight: '800' },
  card: { padding: 10 },
  ownedCard: { borderColor: '#286552' },
  art: {
    height: 150,
    borderRadius: 13,
    overflow: 'hidden',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#08111fcc',
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 7,
  },
  badgeText: {
    fontSize: 8,
    color: colors.gold,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingTop: 14,
  },
  copy: { flex: 1, marginRight: 8 },
  name: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '800',
    marginBottom: 4,
  },
  price: { fontSize: 15, color: colors.gold, fontWeight: '900', marginTop: 8 },
  conditionValue: {
    fontSize: 10,
    color: colors.emerald,
    fontWeight: '900',
    marginTop: 5,
  },
  ownedActions: { alignItems: 'flex-end', gap: 6 },
  buy: {
    backgroundColor: colors.gold,
    borderRadius: 9,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  buyText: { fontSize: 9, color: '#18202b', fontWeight: '900' },
  sell: {
    borderColor: colors.gold,
    borderWidth: 1,
    borderRadius: 9,
    paddingVertical: 8,
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sellText: { fontSize: 9, color: colors.gold, fontWeight: '900' },
  drive: {
    borderColor: colors.emerald,
    borderWidth: 1,
    borderRadius: 9,
    paddingVertical: 8,
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  driveText: { fontSize: 9, color: colors.emerald, fontWeight: '900' },
  repair: {
    borderColor: colors.gold,
    borderWidth: 1,
    borderRadius: 9,
    paddingVertical: 8,
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  disabled: { opacity: 0.4 },
});
