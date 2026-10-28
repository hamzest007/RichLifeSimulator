import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PROPERTIES } from '../../features/realEstate/propertyData';
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

type Props = { route?: { params?: { id: string } } };
export function PropertyDetailScreen({ route }: Props) {
  const state = useGameStore(s => s);
  const property = PROPERTIES.find(item => item.id === route?.params?.id);
  if (!property)
    return (
      <ScreenScroll>
        <Header eyebrow="Real estate" title="Property unavailable" />
      </ScreenScroll>
    );
  const owned = state.properties.find(item => item.id === property.id);
  const upgradeCost = owned
    ? Math.round(
        property.purchasePrice * 0.45 * Math.pow(1.55, owned.level - 1),
      )
    : 0;
  return (
    <ScreenScroll>
      <Header
        eyebrow={`${property.category} · Real estate`}
        title={property.name}
      />
      <AppCard style={styles.hero}>
        <Text style={styles.icon}>{property.icon}</Text>
        <Text style={styles.value}>
          {formatCurrency(property.purchasePrice)}
        </Text>
        <Text style={screenStyles.muted}>
          Estimated market value · {property.appreciation * 100}% annual
          appreciation
        </Text>
      </AppCard>
      <View style={styles.metrics}>
        <Metric label="Level" value={`${owned?.level ?? 0}`} />
        <Metric
          label="Occupancy"
          value={owned ? `${Math.round(owned.occupancy * 100)}%` : '—'}
        />
        <Metric
          label="Net rent/min"
          value={formatCurrency(
            property.rentPerTick - property.maintenancePerTick,
          )}
          positive
        />
      </View>
      <AppCard>
        <Text style={screenStyles.cardTitle}>Property economics</Text>
        <Text style={screenStyles.intro}>
          Gross rent {formatCurrency(property.rentPerTick)}/min · maintenance{' '}
          {formatCurrency(property.maintenancePerTick)}/min. Net rent
          contributes to passive income and rental progression.
        </Text>
        {owned ? (
          <View style={styles.actions}>
            <Pressable
              style={[
                styles.button,
                state.cash < upgradeCost && styles.disabled,
              ]}
              disabled={state.cash < upgradeCost}
              onPress={() => gameStore.upgradeProperty(property.id)}
            >
              <Text style={styles.buttonText}>
                Upgrade for {formatCurrency(upgradeCost)}
              </Text>
            </Pressable>
            <Pressable
              style={styles.outline}
              onPress={() => gameStore.sellProperty(property.id)}
            >
              <Text style={styles.outlineText}>Sell property</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={[
              styles.button,
              (state.cash < property.purchasePrice ||
                selectors.netWorth(state) < property.unlockNetWorth) &&
                styles.disabled,
            ]}
            disabled={
              state.cash < property.purchasePrice ||
              selectors.netWorth(state) < property.unlockNetWorth
            }
            onPress={() => gameStore.purchaseProperty(property.id)}
          >
            <Text style={styles.buttonText}>
              Purchase for {formatCurrency(property.purchasePrice)}
            </Text>
          </Pressable>
        )}
      </AppCard>
    </ScreenScroll>
  );
}
const styles = StyleSheet.create({
  hero: { borderColor: '#7c6738' },
  icon: { fontSize: 36, color: colors.gold },
  value: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '900',
    marginVertical: 8,
  },
  metrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  actions: { gap: 10 },
  button: {
    backgroundColor: colors.gold,
    borderRadius: 10,
    padding: 13,
    alignItems: 'center',
  },
  buttonText: { color: '#18202b', fontWeight: '900' },
  outline: {
    borderColor: colors.gold,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  outlineText: { color: colors.gold, fontWeight: '900' },
  disabled: { opacity: 0.4 },
});
