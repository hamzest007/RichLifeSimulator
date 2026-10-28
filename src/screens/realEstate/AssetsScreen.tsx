import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PROPERTIES } from '../../features/realEstate/propertyData';
import { BUSINESS_DEFINITIONS } from '../../features/businesses/businessData';
import { gameStore, selectors, useGameStore } from '../../store/gameStore';
import { AppCard } from '../../components/common/AppCard';
import { AppIcon } from '../../components/common/AppIcon';
import { PropertyArtwork } from '../../components/common/PropertyArtwork';
import {
  Header,
  Metric,
  ScreenScroll,
  screenStyles,
} from '../../components/common/ScreenShell';
import { colors } from '../../theme/colors';
import { formatCurrency } from '../../utils/currency';

const propertyIcon = (category: string) =>
  category === 'Residential'
    ? 'home-outline'
    : category === 'Hospitality'
    ? 'bed-outline'
    : category === 'Retail'
    ? 'cart-outline'
    : 'business-outline';

export function AssetsScreen({
  onOpenProperty,
}: {
  onOpenProperty: (id: string) => void;
}) {
  const state = useGameStore(s => s);
  const totalAssets = selectors.assets(state);
  const propertyValue = state.properties.reduce((sum, item) => {
    const property = PROPERTIES.find(def => def.id === item.id);
    return sum + (property?.purchasePrice ?? 0);
  }, 0);
  const businessValue = state.businesses.reduce((sum, item) => {
    const business = BUSINESS_DEFINITIONS.find(def => def.id === item.id);
    return sum + (business?.purchasePrice ?? 0) * (1 + (item.level - 1) * 0.72);
  }, 0);
  return (
    <ScreenScroll>
      <Header
        eyebrow="Balance sheet"
        title="Asset portfolio"
        icon="briefcase-outline"
      />
      <AppCard style={styles.hero}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.kicker}>TOTAL PORTFOLIO VALUE</Text>
            <Text style={styles.value}>{formatCurrency(totalAssets)}</Text>
            <Text style={styles.muted}>Your empire at a glance</Text>
          </View>
          <View style={styles.heroIcon}>
            <AppIcon name="briefcase-outline" size={25} color={colors.gold} />
          </View>
        </View>
        <View style={styles.metrics}>
          <Metric label="Businesses" value={formatCurrency(businessValue)} />
          <Metric label="Property" value={formatCurrency(propertyValue)} />
          <Metric
            label="Rental/min"
            value={formatCurrency(state.totalRentalIncome)}
            positive
          />
        </View>
      </AppCard>
      <View style={styles.sectionHead}>
        <Text style={styles.section}>REAL ESTATE</Text>
        <Text style={styles.count}>
          {state.properties.length}/{PROPERTIES.length} owned
        </Text>
      </View>
      {PROPERTIES.map(property => {
        const owned = state.properties.find(item => item.id === property.id);
        const upgradeCost = owned
          ? Math.round(
              property.purchasePrice * 0.45 * Math.pow(1.55, owned.level - 1),
            )
          : 0;
        const locked = selectors.netWorth(state) < property.unlockNetWorth;
        return (
          <AppCard
            key={property.id}
            style={[styles.card, owned && styles.ownedCard]}
          >
            <View style={styles.propertyArt}>
              <PropertyArtwork category={property.category} />
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => onOpenProperty(property.id)}
              style={styles.row}
            >
              <View style={[styles.assetIcon, owned && styles.assetIconOwned]}>
                <AppIcon
                  name={propertyIcon(property.category)}
                  size={22}
                  color={owned ? colors.emerald : colors.gold}
                />
              </View>
              <View style={styles.grow}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>{property.name}</Text>
                  {owned && <Text style={styles.owned}>OWNED</Text>}
                </View>
                <Text style={screenStyles.muted}>
                  {property.category} ·{' '}
                  {owned
                    ? `Level ${owned.level} · ${Math.round(
                        owned.occupancy * 100,
                      )}% occupied`
                    : `Rent ${formatCurrency(property.rentPerTick)}/min`}
                </Text>
                {owned && (
                  <Text style={styles.positive}>
                    {formatCurrency(
                      property.rentPerTick - property.maintenancePerTick,
                    )}{' '}
                    net rent/min
                  </Text>
                )}
              </View>
              <AppIcon
                name="chevron-forward-outline"
                size={18}
                color={colors.muted}
              />
            </Pressable>
            <View style={styles.actions}>
              {owned ? (
                <>
                  <Pressable
                    style={[
                      styles.mini,
                      state.cash < upgradeCost && styles.disabled,
                    ]}
                    disabled={state.cash < upgradeCost}
                    onPress={() => gameStore.upgradeProperty(property.id)}
                  >
                    <Text style={styles.miniText}>
                      UPGRADE {formatCurrency(upgradeCost)}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={styles.outline}
                    onPress={() => gameStore.sellProperty(property.id)}
                  >
                    <Text style={styles.outlineText}>SELL</Text>
                  </Pressable>
                </>
              ) : (
                <Pressable
                  style={[
                    styles.mini,
                    (state.cash < property.purchasePrice || locked) &&
                      styles.disabled,
                  ]}
                  disabled={state.cash < property.purchasePrice || locked}
                  onPress={() => gameStore.purchaseProperty(property.id)}
                >
                  <Text style={styles.miniText}>
                    {locked
                      ? 'LOCKED'
                      : `BUY ${formatCurrency(property.purchasePrice)}`}
                  </Text>
                </Pressable>
              )}
            </View>
          </AppCard>
        );
      })}
      <View style={styles.sectionHead}>
        <Text style={styles.section}>OPERATING COMPANIES</Text>
        <Text style={styles.count}>{state.businesses.length} owned</Text>
      </View>
      {state.businesses.length === 0 ? (
        <AppCard>
          <Text style={screenStyles.cardTitle}>Your portfolio is waiting</Text>
          <Text style={screenStyles.intro}>
            Acquire a business from the Empire tab to see your asset base grow
            here.
          </Text>
        </AppCard>
      ) : (
        state.businesses.map(business => {
          const def = BUSINESS_DEFINITIONS.find(
            item => item.id === business.id,
          )!;
          return (
            <AppCard key={business.id} style={styles.card}>
              <View style={styles.row}>
                <View style={[styles.assetIcon, styles.assetIconOwned]}>
                  <AppIcon
                    name="business-outline"
                    size={21}
                    color={colors.emerald}
                  />
                </View>
                <View style={styles.grow}>
                  <Text style={styles.name}>{def.name}</Text>
                  <Text style={screenStyles.muted}>
                    Level {business.level} ·{' '}
                    {formatCurrency(
                      def.purchasePrice * (1 + (business.level - 1) * 0.72),
                    )}{' '}
                    equity
                  </Text>
                </View>
                <Pressable
                  style={styles.outline}
                  onPress={() => gameStore.sellBusiness(business.id)}
                >
                  <Text style={styles.outlineText}>SELL</Text>
                </Pressable>
              </View>
            </AppCard>
          );
        })
      )}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: '#12283b', borderColor: '#806a3a' },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kicker: {
    fontSize: 10,
    letterSpacing: 1.3,
    color: colors.gold,
    fontWeight: '900',
  },
  value: {
    fontSize: 34,
    color: colors.text,
    fontWeight: '900',
    marginVertical: 7,
  },
  muted: { fontSize: 11, color: colors.muted },
  heroIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#2b4d4a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  section: {
    fontSize: 11,
    letterSpacing: 1.4,
    color: colors.muted,
    fontWeight: '900',
  },
  count: { fontSize: 10, color: colors.gold, fontWeight: '800' },
  card: { padding: 10 },
  propertyArt: {
    height: 92,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  ownedCard: { borderColor: '#286552' },
  row: { flexDirection: 'row', alignItems: 'center' },
  assetIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  assetIconOwned: { backgroundColor: '#173d36' },
  grow: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  name: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 15,
    marginBottom: 4,
  },
  owned: {
    fontSize: 8,
    color: colors.emerald,
    backgroundColor: '#285347',
    paddingVertical: 3,
    paddingHorizontal: 5,
    borderRadius: 5,
    fontWeight: '900',
  },
  positive: {
    color: colors.emerald,
    fontWeight: '700',
    fontSize: 11,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 7,
    marginTop: 12,
  },
  mini: {
    backgroundColor: colors.gold,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  outline: {
    borderColor: colors.gold,
    borderWidth: 1,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  miniText: { color: '#18202b', fontWeight: '800', fontSize: 9 },
  outlineText: { color: colors.gold, fontWeight: '800', fontSize: 9 },
  disabled: { opacity: 0.4 },
});
