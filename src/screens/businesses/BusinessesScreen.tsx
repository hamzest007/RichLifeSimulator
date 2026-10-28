import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BUSINESS_DEFINITIONS } from '../../features/businesses/businessData';
import {
  calculateBusinessExpensesForState,
  calculateBusinessRevenueForState,
  calculateNetProfitForState,
  calculateUpgradeCost,
} from '../../features/economy/economyEngine';
import { EMPLOYEES } from '../../features/progression/progressionData';
import { gameStore, selectors, useGameStore } from '../../store/gameStore';
import { BusinessId } from '../../types/game';
import { AppCard } from '../../components/common/AppCard';
import { AppIcon } from '../../components/common/AppIcon';
import {
  Header,
  Metric,
  ScreenScroll,
  screenStyles,
} from '../../components/common/ScreenShell';
import { AppButton } from '../../components/common/AppButton';
import { colors } from '../../theme/colors';
import { formatCurrency } from '../../utils/currency';

const categories = [
  'All',
  ...Array.from(new Set(BUSINESS_DEFINITIONS.map(item => item.category))),
];
const departments = [
  'Finance',
  'Technology',
  'Operations',
  'Marketing',
  'Executive',
];
const categoryIcon = (category: string) =>
  category === 'Technology'
    ? 'hardware-chip-outline'
    : category === 'Finance'
      ? 'wallet-outline'
      : category === 'Healthcare'
        ? 'medkit-outline'
        : category === 'Industrial'
          ? 'construct-outline'
          : category === 'Infrastructure'
            ? 'rocket-outline'
            : category === 'Entertainment'
              ? 'sparkles-outline'
              : category === 'Retail'
                ? 'cart-outline'
                : category === 'Automotive'
                  ? 'car-sport-outline'
                  : 'business-outline';

export function BusinessesScreen() {
  const state = useGameStore(s => s);
  const [selected, setSelected] = useState<BusinessId | null>(null);
  const [category, setCategory] = useState('All');
  const netWorth = selectors.netWorth(state);
  const ownedProfit = state.businesses.reduce((sum, business) => {
    const definition = BUSINESS_DEFINITIONS.find(
      item => item.id === business.id,
    );
    return (
      sum +
      (definition ? calculateNetProfitForState(state, definition, business) : 0)
    );
  }, 0);
  const visible = useMemo(
    () =>
      BUSINESS_DEFINITIONS.filter(
        item => category === 'All' || item.category === category,
      ),
    [category],
  );
  return (
    <ScreenScroll>
      <Header
        eyebrow="Operating companies"
        title="Your empire"
        icon="business-outline"
      />
      <AppCard style={styles.hero}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.kicker}>EMPIRE PORTFOLIO</Text>
            <Text style={styles.heroTitle}>
              {state.businesses.length} companies owned
            </Text>
          </View>
          <View style={styles.empireIcon}>
            <AppIcon name="business" size={24} color={colors.gold} />
          </View>
        </View>
        <Text style={styles.heroBody}>
          Acquire, staff, and upgrade companies. Every operation contributes to
          your cash flow and net worth.
        </Text>
        <View style={styles.metrics}>
          <Metric label="Cash" value={formatCurrency(state.cash)} />
          <Metric label="Net worth" value={formatCurrency(netWorth)} />
          <Metric
            label="Profit/min"
            value={formatCurrency(ownedProfit)}
            positive
          />
        </View>
        <View style={styles.peopleStrip}>
          <Text style={styles.peopleText}>
            BOARD APPROVAL {Math.round(state.boardApproval * 100)}%
          </Text>
          <Text style={styles.peopleText}>
            CULTURE {Math.round(state.companyCulture * 100)}%
          </Text>
          <Text style={styles.peopleText}>
            {Object.keys(state.executives).length}/5 EXECUTIVES
          </Text>
        </View>
      </AppCard>
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>Business catalogue</Text>
        <Text style={styles.count}>
          {BUSINESS_DEFINITIONS.length} industries
        </Text>
      </View>
      <View style={styles.filters}>
        {categories.map(item => (
          <Pressable
            key={item}
            onPress={() => setCategory(item)}
            style={[styles.filter, category === item && styles.filterActive]}
          >
            <Text
              style={[
                styles.filterText,
                category === item && styles.filterTextActive,
              ]}
            >
              {item}
            </Text>
          </Pressable>
        ))}
      </View>
      {visible.map(def => {
        const business = state.businesses.find(item => item.id === def.id);
        const locked =
          state.profile.level < def.unlockLevel ||
          netWorth < def.unlockNetWorth;
        const expanded = selected === def.id;
        const assigned = business ? state.employees[business.id] ?? [] : [];
        const profit = business
          ? calculateNetProfitForState(state, def, business)
          : 0;
        return (
          <AppCard
            key={def.id}
            style={[styles.card, business && styles.ownedCard]}
          >
            <Pressable
              onPress={() => setSelected(expanded ? null : def.id)}
              style={styles.row}
            >
              <View
                style={[
                  styles.businessIcon,
                  business && styles.businessIconOwned,
                ]}
              >
                <AppIcon
                  name={categoryIcon(def.category)}
                  size={22}
                  color={business ? colors.emerald : colors.gold}
                />
              </View>
              <View style={styles.grow}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>{def.name}</Text>
                  {business && (
                    <View style={styles.ownedPill}>
                      <Text style={styles.ownedText}>OWNED</Text>
                    </View>
                  )}
                </View>
                <Text style={screenStyles.muted}>
                  {def.category} ·{' '}
                  {business
                    ? `Level ${business.level}`
                    : locked
                      ? `Unlocks LVL ${def.unlockLevel}`
                      : 'Available now'}
                </Text>
                {business ? (
                  <Text style={styles.positive}>
                    {formatCurrency(profit)} net profit/min · {assigned.length}{' '}
                    staff
                  </Text>
                ) : (
                  <Text style={styles.price}>
                    {formatCurrency(def.purchasePrice)} acquisition
                  </Text>
                )}
              </View>
              <AppIcon
                name={expanded ? 'chevron-up-outline' : 'chevron-down-outline'}
                size={19}
                color={colors.muted}
              />
            </Pressable>
            {expanded && (
              <View style={styles.expand}>
                <View style={styles.breakdown}>
                  <Metric
                    label="Revenue"
                    value={formatCurrency(
                      business
                        ? calculateBusinessRevenueForState(state, def, business)
                        : def.baseRevenuePerTick,
                    )}
                    positive
                  />
                  <Metric
                    label="Expenses"
                    value={formatCurrency(
                      business
                        ? calculateBusinessExpensesForState(
                          state,
                          def,
                          business,
                        )
                        : def.baseExpensesPerTick,
                    )}
                  />
                  <Metric
                    label="Unlock"
                    value={locked ? `LVL ${def.unlockLevel}` : 'READY'}
                  />
                </View>
                <AppButton
                  label={
                    business
                      ? `Upgrade to level ${business.level + 1
                      } · ${formatCurrency(
                        calculateUpgradeCost(def, business.level),
                      )}`
                      : locked
                        ? `Locked · needs ${formatCurrency(
                          Math.max(0, def.unlockNetWorth - netWorth),
                        )}`
                        : `Acquire for ${formatCurrency(def.purchasePrice)}`
                  }
                  disabled={
                    locked || (!business && state.cash < def.purchasePrice)
                  }
                  onPress={() =>
                    business
                      ? gameStore.upgradeBusiness(def.id)
                      : gameStore.purchaseBusiness(def.id)
                  }
                  style={styles.action}
                />
                {business && (
                  <>
                    <View style={styles.management}>
                      <Text style={styles.staffHeading}>OPERATIONS</Text>
                      <Text style={styles.managementText}>
                        {business.branches ?? 0} branches · Marketing LVL{' '}
                        {business.marketingLevel ?? 0} · Satisfaction{' '}
                        {Math.round((business.satisfaction ?? 0.72) * 100)}%
                      </Text>
                      <View style={styles.staffGrid}>
                        <Pressable
                          style={styles.staffButton}
                          onPress={() => gameStore.expandBusiness(business.id)}
                        >
                          <AppIcon
                            name="business-outline"
                            size={15}
                            color={colors.gold}
                          />
                          <Text style={styles.staffText}>OPEN BRANCH</Text>
                        </Pressable>
                        <Pressable
                          style={styles.staffButton}
                          onPress={() =>
                            gameStore.runMarketingCampaign(business.id)
                          }
                        >
                          <AppIcon
                            name="sparkles-outline"
                            size={15}
                            color={colors.gold}
                          />
                          <Text style={styles.staffText}>MARKET</Text>
                        </Pressable>
                      </View>
                    </View>
                    <View style={styles.staff}>
                      <Text style={styles.staffHeading}>MANAGEMENT TEAM</Text>
                      <View style={styles.staffGrid}>
                        {EMPLOYEES.map(employee => (
                          <Pressable
                            key={employee.id}
                            accessibilityRole="button"
                            onPress={() =>
                              assigned.includes(employee.id)
                                ? gameStore.fireEmployee(
                                  business.id,
                                  employee.id,
                                )
                                : gameStore.hireEmployee(
                                  business.id,
                                  employee.id,
                                )
                            }
                            style={[
                              styles.staffButton,
                              assigned.includes(employee.id) && styles.active,
                            ]}
                          >
                            <Text style={styles.staffIcon}>
                              {employee.icon}
                            </Text>
                            <Text style={styles.staffText}>
                              {assigned.includes(employee.id)
                                ? `FIRE ${employee.role}`
                                : employee.role}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                      {assigned.length > 0 && (
                        <View style={styles.peopleActions}>
                          {assigned.map(employeeId => {
                            const employee = EMPLOYEES.find(
                              item => item.id === employeeId,
                            )!;
                            const key = `${business.id}:${employeeId}`;
                            const stats = state.employeeStats[key];
                            return (
                              <View key={employeeId} style={styles.peopleRow}>
                                <Text style={styles.peopleRowText}>
                                  {employee.role} ·{' '}
                                  {employee.executiveRole ??
                                    employee.department}{' '}
                                  ·{' '}
                                  {Math.round((stats?.performance ?? 1) * 100)}%
                                </Text>
                                <View style={styles.peopleButtons}>
                                  <Pressable
                                    onPress={() =>
                                      gameStore.trainEmployee(
                                        business.id,
                                        employeeId,
                                      )
                                    }
                                    style={styles.miniButton}
                                  >
                                    <Text style={styles.miniText}>TRAIN</Text>
                                  </Pressable>
                                  <Pressable
                                    onPress={() =>
                                      gameStore.negotiateSalary(
                                        business.id,
                                        employeeId,
                                      )
                                    }
                                    style={styles.miniButton}
                                  >
                                    <Text style={styles.miniText}>
                                      NEGOTIATE
                                    </Text>
                                  </Pressable>
                                  {employee.executiveRole && (
                                    <Pressable
                                      onPress={() =>
                                        gameStore.appointExecutive(
                                          business.id,
                                          employeeId,
                                        )
                                      }
                                      style={styles.miniButton}
                                    >
                                      <Text style={styles.miniText}>
                                        APPOINT {employee.executiveRole}
                                      </Text>
                                    </Pressable>
                                  )}
                                </View>
                              </View>
                            );
                          })}
                        </View>
                      )}
                    </View>
                    <View style={styles.leadership}>
                      <Text style={styles.staffHeading}>PEOPLE & CULTURE</Text>
                      <Text style={styles.managementText}>
                        Board {Math.round(state.boardApproval * 100)}% · Culture{' '}
                        {Math.round(state.companyCulture * 100)}% · Executives{' '}
                        {Object.keys(state.executives).length}/5
                      </Text>
                      <Pressable
                        onPress={() => gameStore.improveCulture()}
                        style={styles.cultureButton}
                      >
                        <Text style={styles.staffText}>
                          FUND CULTURE INITIATIVE
                        </Text>
                      </Pressable>
                      <Text style={styles.staffHeading}>
                        DEPARTMENT BUDGETS
                      </Text>
                      <View style={styles.budgetGrid}>
                        {departments.map(department => (
                          <Pressable
                            key={department}
                            onPress={() =>
                              gameStore.setDepartmentBudget(
                                department,
                                (state.departmentBudgets[department] ?? 1) >=
                                  1.5
                                  ? 0.75
                                  : (state.departmentBudgets[department] ?? 1) +
                                  0.25,
                              )
                            }
                            style={styles.budgetButton}
                          >
                            <Text style={styles.budgetName}>{department}</Text>
                            <Text style={styles.miniText}>
                              {Math.round(
                                (state.departmentBudgets[department] ?? 1) *
                                100,
                              )}
                              % · TAP
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    </View>
                  </>
                )}
              </View>
            )}
          </AppCard>
        );
      })}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: '#12283b', borderColor: '#806a3a' },
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
    fontSize: 23,
    color: colors.text,
    fontWeight: '900',
    marginTop: 7,
  },
  heroBody: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 20,
    marginVertical: 14,
  },
  empireIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#2b4d4a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metrics: { flexDirection: 'row', justifyContent: 'space-between' },
  peopleStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  peopleText: { color: colors.gold, fontSize: 8, fontWeight: '900' },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 11,
  },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '900' },
  count: { color: colors.muted, fontSize: 11, fontWeight: '800' },
  filters: { flexDirection: 'row', gap: 7, marginBottom: 14, flexWrap: 'wrap' },
  filter: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 9,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  filterActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  filterText: { color: colors.muted, fontSize: 10, fontWeight: '800' },
  filterTextActive: { color: '#18202b' },
  card: { padding: 14 },
  ownedCard: { borderColor: '#286552' },
  row: { flexDirection: 'row', alignItems: 'center' },
  businessIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  businessIconOwned: { backgroundColor: '#173d36' },
  grow: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  name: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 15,
    marginBottom: 4,
  },
  ownedPill: {
    backgroundColor: '#285347',
    borderRadius: 5,
    paddingVertical: 3,
    paddingHorizontal: 5,
  },
  ownedText: { fontSize: 8, color: colors.emerald, fontWeight: '900' },
  positive: {
    color: colors.emerald,
    fontWeight: '700',
    fontSize: 11,
    marginTop: 4,
  },
  price: { color: colors.gold, fontWeight: '800', fontSize: 11, marginTop: 4 },
  expand: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 13,
  },
  breakdown: { flexDirection: 'row', justifyContent: 'space-between' },
  action: { marginTop: 13 },
  management: {
    marginTop: 15,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  managementText: { color: colors.muted, fontSize: 10, marginTop: 5 },
  staff: { marginTop: 16 },
  staffHeading: {
    fontSize: 10,
    letterSpacing: 1.2,
    color: colors.muted,
    fontWeight: '900',
  },
  staffGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  staffButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 9,
    padding: 8,
    width: '31%',
  },
  active: { borderColor: colors.emerald, backgroundColor: '#173d36' },
  staffIcon: { color: colors.gold, fontSize: 16 },
  staffText: { color: colors.text, fontSize: 9, marginTop: 4 },
  peopleActions: { marginTop: 10, gap: 8 },
  peopleRow: { padding: 9, borderRadius: 9, backgroundColor: colors.surface2 },
  peopleRowText: { color: colors.text, fontSize: 10, fontWeight: '800' },
  peopleButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 7,
  },
  miniButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 7,
  },
  miniText: { color: colors.gold, fontSize: 8, fontWeight: '900' },
  leadership: {
    marginTop: 15,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cultureButton: {
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 8,
    padding: 9,
    alignItems: 'center',
    marginVertical: 9,
  },
  budgetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  budgetButton: {
    width: '31%',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
  },
  budgetName: {
    color: colors.text,
    fontSize: 9,
    fontWeight: '800',
    marginBottom: 4,
  },
});
