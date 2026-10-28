import React, { useState } from 'react';
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

type Props = { route?: { params?: { kind: 'stocks' | 'crypto'; id: string } } };
export function StockDetailScreen({ route }: Props) {
  const params = route?.params ?? { kind: 'stocks' as const, id: '' };
  const state = useGameStore(s => s);
  const [quantity, setQuantity] = useState('1');
  const assets = params.kind === 'stocks' ? STOCKS : CRYPTO;
  const asset = assets.find(item => item.id === params.id);
  if (!asset)
    return (
      <ScreenScroll>
        <Header eyebrow="Market" title="Asset unavailable" />
      </ScreenScroll>
    );
  const current = state.marketPrices[asset.id] ?? asset.price;
  const history = state.marketHistory?.[asset.id] ?? asset.history;
  const holding = (params.kind === 'stocks' ? state.stocks : state.crypto).find(
    item => item.id === asset.id,
  );
  const qty = Math.max(0, Math.floor(Number(quantity) || 0));
  const trade = (buy: boolean) => {
    const action = () =>
      gameStore[
        params.kind === 'stocks'
          ? buy
            ? 'buyStock'
            : 'sellStock'
          : buy
          ? 'buyCrypto'
          : 'sellCrypto'
      ](asset.id, qty);
    if (current * qty > 10000)
      Alert.alert(
        'Confirm large trade',
        `${buy ? 'Buy' : 'Sell'} ${qty} ${asset.symbol}?`,
        [{ text: 'Cancel' }, { text: 'Confirm', onPress: action }],
      );
    else action();
  };
  return (
    <ScreenScroll>
      <Header
        eyebrow={`${params.kind === 'stocks' ? 'Stock' : 'Crypto'} · Fictional`}
        title={asset.name}
      />
      <AppCard style={styles.hero}>
        <Text style={styles.symbol}>{asset.symbol}</Text>
        <Text style={styles.price}>{formatCurrency(current)}</Text>
        <Text style={screenStyles.muted}>
          {asset.sector} · {Math.round(asset.volatility * 100)}% volatility ·
          virtual currency
        </Text>
        <Chart values={history} />
      </AppCard>
      <View style={styles.metrics}>
        <Metric label="Owned" value={`${holding?.quantity ?? 0}`} />
        <Metric
          label="Average cost"
          value={holding ? formatCurrency(holding.averageCost) : '—'}
        />
        <Metric
          label="Position value"
          value={formatCurrency((holding?.quantity ?? 0) * current)}
        />
      </View>
      <AppCard>
        <Text style={screenStyles.cardTitle}>Trade</Text>
        <Text style={screenStyles.intro}>
          Fees are applied by the game engine. Selling is limited to the
          quantity owned.
        </Text>
        <View style={styles.tradeRow}>
          <TextInput
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="number-pad"
            style={styles.input}
          />
          <Pressable style={styles.buy} onPress={() => trade(true)}>
            <Text style={styles.tradeText}>
              BUY {formatCurrency(current * qty)}
            </Text>
          </Pressable>
          <Pressable style={styles.sell} onPress={() => trade(false)}>
            <Text style={styles.sellText}>SELL</Text>
          </Pressable>
        </View>
      </AppCard>
    </ScreenScroll>
  );
}
function Chart({ values }: { values: number[] }) {
  const points = values.length > 1 ? values : [values[0] ?? 0, values[0] ?? 0];
  const min = Math.min(...points);
  const range = Math.max(1, Math.max(...points) - min);
  const path = points
    .map(
      (value, index) =>
        `${index ? 'L' : 'M'} ${(index / (points.length - 1)) * 300} ${
          100 - ((value - min) / range) * 80
        }`,
    )
    .join(' ');
  return (
    <Svg width="100%" height="110" viewBox="0 0 300 110">
      <Path
        d={path}
        fill="none"
        stroke={colors.gold}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </Svg>
  );
}
const styles = StyleSheet.create({
  hero: { borderColor: '#7c6738' },
  symbol: { color: colors.gold, fontSize: 16, fontWeight: '900' },
  price: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '900',
    marginVertical: 8,
  },
  metrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  tradeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: {
    width: 60,
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 8,
    padding: 9,
    color: colors.text,
    textAlign: 'center',
  },
  buy: {
    backgroundColor: colors.gold,
    borderRadius: 9,
    padding: 11,
    flex: 1,
    alignItems: 'center',
  },
  sell: {
    borderColor: colors.gold,
    borderWidth: 1,
    borderRadius: 9,
    padding: 10,
    flex: 1,
    alignItems: 'center',
  },
  tradeText: { fontSize: 10, fontWeight: '900', color: '#18202b' },
  sellText: { fontSize: 10, fontWeight: '900', color: colors.gold },
});
