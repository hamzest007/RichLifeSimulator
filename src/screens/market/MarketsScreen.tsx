import React, { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { CRYPTO, STOCKS } from '../../features/market/marketData';
import { gameStore, useGameStore } from '../../store/gameStore';
import { AppCard } from '../../components/common/AppCard';
import {
  Header,
  Metric,
  ScreenScroll,
  screenStyles,
} from '../../components/common/ScreenShell';
import { colors } from '../../theme/colors';
import { formatCurrency } from '../../utils/currency';
import { AppIcon } from '../../components/common/AppIcon';
import { MarketArtwork } from '../../components/common/MarketArtwork';
import {
  calculatePortfolioValue,
  calculateUnrealizedProfitLoss,
} from '../../features/economy/economyEngine';

export function MarketsScreen({
  onOpenAsset,
}: {
  onOpenAsset: (kind: 'stocks' | 'crypto', id: string) => void;
}) {
  const state = useGameStore(s => s);
  const [kind, setKind] = useState<'stocks' | 'crypto'>('stocks');
  const [quantity, setQuantity] = useState('1');
  const [sector, setSector] = useState('All');
  const [query, setQuery] = useState('');
  const assets = kind === 'stocks' ? STOCKS : CRYPTO;
  const holdings = kind === 'stocks' ? state.stocks : state.crypto;
  const qty = Math.max(0, Number(quantity) || 0);
  const sectors = [
    'All',
    ...Array.from(new Set(assets.map(asset => asset.sector))),
  ];
  const visibleAssets = useMemo(
    () =>
      assets.filter(asset => {
        const holding = holdings.find(item => item.id === asset.id);
        return (
          (sector === 'All' || asset.sector === sector) &&
          (query.trim() === '' ||
            `${asset.symbol} ${asset.name} ${asset.sector}`
              .toLowerCase()
              .includes(query.trim().toLowerCase())) &&
          (sector !== 'Owned' || Boolean(holding))
        );
      }),
    [assets, holdings, query, sector],
  );
  const execute = (asset: (typeof STOCKS)[number], buy: boolean) => {
    const total = (state.marketPrices[asset.id] ?? asset.price) * qty;
    const action = () =>
      gameStore[
        kind === 'stocks'
          ? buy
            ? 'buyStock'
            : 'sellStock'
          : buy
          ? 'buyCrypto'
          : 'sellCrypto'
      ](asset.id, qty);
    if (total > 10000)
      Alert.alert(
        'Confirm large trade',
        `${buy ? 'Buy' : 'Sell'} ${qty} ${asset.symbol} for ${formatCurrency(
          total,
        )}?`,
        [{ text: 'Cancel' }, { text: 'Confirm', onPress: action }],
      );
    else action();
  };
  const marketIcon = (asset: (typeof STOCKS)[number]) =>
    kind === 'crypto'
      ? 'logo-bitcoin'
      : asset.sector === 'Technology'
      ? 'hardware-chip-outline'
      : asset.sector === 'Energy'
      ? 'flash-outline'
      : asset.sector === 'Healthcare'
      ? 'medkit-outline'
      : asset.sector === 'Finance'
      ? 'wallet-outline'
      : 'bar-chart-outline';
  return (
    <ScreenScroll>
      <Header eyebrow="Simulated markets" title="Market intelligence" />
      <AppCard style={styles.hero}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.caps}>MARKET PULSE · LIVE SIMULATION</Text>
            <Text style={styles.heroTitle}>
              {kind === 'stocks' ? 'Global equities' : 'Digital assets'}
            </Text>
          </View>
          <View style={styles.live}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>OPEN</Text>
          </View>
        </View>
        <Text style={styles.intro}>
          Trade fictional shares and digital assets with live simulated prices,
          cost basis, fees, and portfolio performance.
        </Text>
        <View style={styles.portfolioMetrics}>
          <Metric
            label="Market value"
            value={formatCurrency(
              calculatePortfolioValue(
                state.stocks,
                STOCKS,
                state.marketPrices,
              ) +
                calculatePortfolioValue(
                  state.crypto,
                  CRYPTO,
                  state.marketPrices,
                ),
            )}
          />
          <Metric
            label="Unrealized P/L"
            value={formatCurrency(calculateUnrealizedProfitLoss(state))}
            positive={calculateUnrealizedProfitLoss(state) >= 0}
          />
          <Metric
            label="Realized P/L"
            value={formatCurrency(state.realizedProfit)}
            positive={state.realizedProfit >= 0}
          />
        </View>
      </AppCard>
      <View style={styles.switch}>
        <Pressable
          style={[styles.switchButton, kind === 'stocks' && styles.selected]}
          onPress={() => {
            setKind('stocks');
            setSector('All');
          }}
        >
          <AppIcon
            name="trending-up-outline"
            size={16}
            color={kind === 'stocks' ? colors.gold : colors.muted}
          />
          <Text style={styles.switchText}>STOCKS · {STOCKS.length}</Text>
        </Pressable>
        <Pressable
          style={[styles.switchButton, kind === 'crypto' && styles.selected]}
          onPress={() => {
            setKind('crypto');
            setSector('All');
          }}
        >
          <AppIcon
            name="logo-bitcoin"
            size={16}
            color={kind === 'crypto' ? colors.gold : colors.muted}
          />
          <Text style={styles.switchText}>CRYPTO · {CRYPTO.length}</Text>
        </Pressable>
      </View>
      <View style={styles.searchRow}>
        <AppIcon name="trending-up-outline" size={16} color={colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search symbol or sector"
          placeholderTextColor={colors.muted}
          style={styles.search}
        />
      </View>
      <View style={styles.filters}>
        <Pressable
          style={[styles.filter, sector === 'Owned' && styles.selected]}
          onPress={() => setSector('Owned')}
        >
          <Text style={styles.filterText}>OWNED</Text>
        </Pressable>
        {sectors.map(item => (
          <Pressable
            key={item}
            style={[styles.filter, sector === item && styles.selected]}
            onPress={() => setSector(item)}
          >
            <Text style={styles.filterText}>{item.toUpperCase()}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.quantity}>
        <Text style={screenStyles.muted}>ORDER SHARES / UNITS</Text>
        <TextInput
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="decimal-pad"
          style={styles.input}
        />
        <Text style={screenStyles.muted}>fractional · 1% fee</Text>
      </View>
      {visibleAssets.map(asset => {
        const holding = holdings.find(item => item.id === asset.id);
        const history = state.marketHistory?.[asset.id] ?? asset.history;
        const current = state.marketPrices[asset.id] ?? asset.price;
        const previous = history.at(-2) ?? asset.price;
        const change =
          asset.dailyChange ??
          ((current - previous) / Math.max(0.01, previous)) * 100;
        const positionValue = (holding?.quantity ?? 0) * current;
        const positionPnl = holding
          ? (current - holding.averageCost) * holding.quantity
          : 0;
        const highRisk = asset.volatility >= 0.25;
        return (
          <AppCard key={asset.id} style={styles.asset}>
            <View style={styles.marketArt}>
              <MarketArtwork
                crypto={kind === 'crypto'}
                positive={change >= 0}
              />
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => onOpenAsset(kind, asset.id)}
              style={styles.grow}
            >
              <View style={styles.assetTop}>
                <View style={styles.assetIcon}>
                  <AppIcon
                    name={marketIcon(asset)}
                    size={21}
                    color={kind === 'crypto' ? '#b58cff' : colors.gold}
                  />
                </View>
                <View style={styles.assetIdentity}>
                  <Text style={styles.symbol}>{asset.symbol}</Text>
                  <Text style={screenStyles.muted}>
                    {asset.name} · {asset.sector}
                  </Text>
                </View>
                <Pressable
                  onPress={() => gameStore.toggleWatchlist(asset.id)}
                  style={styles.watch}
                >
                  <Text style={styles.watchText}>
                    {state.watchlist.includes(asset.id) ? '★' : '☆'}
                  </Text>
                </Pressable>
                <View style={styles.changePill}>
                  <Text style={change >= 0 ? styles.positive : styles.negative}>
                    {change >= 0 ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
                  </Text>
                </View>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.price}>{formatCurrency(current)}</Text>
                <Text style={screenStyles.muted}>
                  {Math.round(asset.volatility * 100)}% volatility
                </Text>
              </View>
              <Text style={screenStyles.muted}>
                Market cap{' '}
                {formatCurrency(asset.marketCap ?? asset.price * 1000000)}
              </Text>
              {highRisk && (
                <Text style={styles.risk}>HIGH RISK · volatile asset</Text>
              )}
              <Text
                style={
                  holding
                    ? positionPnl >= 0
                      ? styles.positionPositive
                      : styles.positionNegative
                    : screenStyles.muted
                }
              >
                {holding
                  ? `${holding.quantity} shares/units · ${formatCurrency(
                      positionValue,
                    )} value · ${positionPnl >= 0 ? '+' : ''}${formatCurrency(
                      positionPnl,
                    )} P/L`
                  : 'No open position'}
              </Text>
              <Chart values={history} positive={change >= 0} />
            </Pressable>
            <View style={styles.trade}>
              <Pressable
                style={[styles.buy, qty < 1 && styles.disabled]}
                disabled={qty < 1}
                onPress={() => execute(asset, true)}
              >
                <Text style={styles.tradeText}>BUY</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.sell,
                  (!holding || qty < 1 || qty > holding.quantity) &&
                    styles.disabled,
                ]}
                disabled={!holding || qty < 1 || qty > holding.quantity}
                onPress={() => execute(asset, false)}
              >
                <Text style={styles.sellText}>SELL</Text>
              </Pressable>
            </View>
          </AppCard>
        );
      })}
    </ScreenScroll>
  );
}
function Chart({
  values,
  positive = true,
}: {
  values: number[];
  positive?: boolean;
}) {
  const points = values.length > 1 ? values : [values[0] ?? 0, values[0] ?? 0];
  const min = Math.min(...points);
  const range = Math.max(1, Math.max(...points) - min);
  const path = points
    .map(
      (value, index) =>
        `${index ? 'L' : 'M'} ${(index / (points.length - 1)) * 160} ${
          38 - ((value - min) / range) * 30
        }`,
    )
    .join(' ');
  return (
    <Svg width="165" height="42" viewBox="0 0 160 42">
      <Path
        d={path}
        fill="none"
        stroke={positive ? colors.emerald : colors.red}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}
const styles = StyleSheet.create({
  hero: { borderColor: '#806a3a', backgroundColor: '#12243a' },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    marginTop: 7,
  },
  live: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#173d36',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 9,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.emerald,
  },
  liveText: { fontSize: 9, color: colors.emerald, fontWeight: '900' },
  caps: {
    fontSize: 10,
    letterSpacing: 1.3,
    color: colors.muted,
    fontWeight: '700',
  },
  intro: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.muted,
    marginVertical: 12,
  },
  portfolioMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  switch: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  switchButton: {
    flex: 1,
    padding: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  selected: { backgroundColor: colors.surface2, borderColor: colors.gold },
  switchText: { color: colors.text, fontWeight: '700', fontSize: 11 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 11,
    marginBottom: 10,
  },
  search: { flex: 1, color: colors.text, fontSize: 12, paddingVertical: 10 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  filter: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  filterText: { color: colors.muted, fontSize: 9, fontWeight: '900' },
  quantity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 12,
  },
  input: {
    width: 58,
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '800',
  },
  asset: { paddingVertical: 10 },
  marketArt: {
    height: 82,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  grow: { flex: 1 },
  assetTop: { flexDirection: 'row', alignItems: 'center' },
  assetIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  assetIdentity: { flex: 1 },
  symbol: { color: colors.text, fontWeight: '900', fontSize: 15 },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  price: { color: colors.text, fontSize: 17, fontWeight: '800' },
  watch: { paddingHorizontal: 5, marginRight: 4 },
  watchText: { color: colors.gold, fontSize: 20, lineHeight: 22 },
  risk: { color: colors.red, fontSize: 9, fontWeight: '900', marginTop: 5 },
  changePill: {
    backgroundColor: '#173d36',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 7,
  },
  positive: { color: colors.emerald, fontWeight: '700' },
  negative: { color: colors.red, fontWeight: '700' },
  positionPositive: {
    color: colors.emerald,
    fontSize: 10,
    fontWeight: '800',
    marginTop: 5,
  },
  positionNegative: {
    color: colors.red,
    fontSize: 10,
    fontWeight: '800',
    marginTop: 5,
  },
  trade: { gap: 5, marginLeft: 8 },
  buy: {
    backgroundColor: colors.gold,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  sell: {
    borderColor: colors.gold,
    borderWidth: 1,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  tradeText: { color: '#18202b', fontWeight: '800', fontSize: 10 },
  sellText: { color: colors.gold, fontWeight: '800', fontSize: 10 },
  disabled: { opacity: 0.4 },
});
