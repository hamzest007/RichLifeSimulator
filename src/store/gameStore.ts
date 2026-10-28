import { create } from 'zustand';
import { createInitialGameState } from '../constants/initialGameState';
import {
  calculateBankInterestPerTick,
  calculateBusinessExpensesForState,
  calculateBusinessRevenueForState,
  calculateBusinessValue,
  calculateNetWorth,
  calculateOfflineBreakdown,
  calculatePassiveIncomePerTick,
  calculatePropertyIncome,
  calculateTotalAssets,
  calculateUpgradeCost,
  processGameTick,
} from '../features/economy/economyEngine';
import { getBusinessDefinition } from '../features/businesses/businessData';
import { CRYPTO, STOCKS } from '../features/market/marketData';
import { PROPERTIES } from '../features/realEstate/propertyData';
import { EMPLOYEES, RESEARCH } from '../features/progression/progressionData';
import { LIFESTYLE_ASSETS } from '../features/lifestyle/lifestyleData';
import { BusinessId, GameState, Holding } from '../types/game';
import { eventForTick } from '../features/events/worldEvents';
import {
  hydrateGameState,
  SAVE_KEY,
  serializeGameState,
} from '../services/storage/saveService';

type Listener = () => void;
let state = createInitialGameState();
const zustandState = create<{
  game: GameState;
  setGame: (game: GameState) => void;
}>(set => ({ game: state, setGame: game => set({ game }) }));
const listeners = new Set<Listener>();
const notify = () => listeners.forEach(listener => listener());
const now = () => Date.now();
const dayKey = (timestamp = now()) =>
  new Date(timestamp).toISOString().slice(0, 10);
const ledger = (
  kind: 'income' | 'expense' | 'purchase' | 'upgrade' | 'system',
  label: string,
  amount: number,
) => ({
  id: `${kind}-${now()}-${Math.random()}`,
  kind,
  label,
  amount,
  createdAt: now(),
});
const append = (next: GameState) => {
  const timestamp = now();
  const profile = {
    ...next.profile,
    level: Math.max(next.profile.level, 1 + Math.floor(next.profile.xp / 250)),
  };
  const lifestyleRating = Math.min(
    100,
    next.lifestyle.length * 7 +
    next.lifestyle.filter(item =>
      ['yacht', 'private-jet', 'island'].includes(item.id),
    ).length *
    12 +
    (next.lifestyleMode === 'luxury' ? 10 : 0),
  );
  const progressed = { ...next, profile, lifestyleRating };
  const value = calculateNetWorth(progressed);
  const achievementValue = (id: string) =>
    id === 'founder'
      ? progressed.businesses.length
      : id === 'operator'
        ? progressed.businesses.length
        : id === 'portfolio-builder'
          ? Number(progressed.businesses.length > 0) +
          Number(progressed.properties.length > 0) +
          Number(progressed.stocks.length > 0) +
          Number(progressed.lifestyle.length > 0)
          : id === 'hidden-operator'
            ? Number(progressed.profile.level >= 10 && progressed.tapCount <= 100)
            : calculateNetWorth(progressed);
  let reward = 0;
  const achievements = progressed.achievements.map(item => {
    if (!item.unlocked && achievementValue(item.id) >= item.target) {
      reward += item.reward;
      return { ...item, unlocked: true };
    }
    return item;
  });
  const unlockedTitles = achievements
    .filter(item => item.unlocked)
    .map(item => item.title);
  const titles = Array.from(new Set([...progressed.titles, ...unlockedTitles]));
  const transactions = reward
    ? [
      ledger('income', 'Achievement reward', reward),
      ...progressed.transactions,
    ].slice(0, 80)
    : progressed.transactions;
  const cash = progressed.cash + reward;
  state = {
    ...progressed,
    cash,
    achievements,
    titles,
    transactions,
    lastSavedAt: timestamp,
    netWorthHistory: [
      ...progressed.netWorthHistory,
      { timestamp, value: value + reward },
    ].slice(-60),
    financialHistory: [
      ...(progressed.financialHistory ?? []),
      {
        timestamp,
        cash,
        netWorth: value + reward,
        income: Math.max(0, cash - state.cash),
        expenses: Math.max(0, state.cash - cash),
      },
    ].slice(-180),
  };
  try {
    nativeStorage?.set(SAVE_KEY, serializeGameState(state, timestamp));
  } catch (error) {
    console.error('Error saving to native storage:', error);
    // Continue without saving to prevent crash
  }
  zustandState.getState().setGame(state);
  notify();
};

// MMKV is loaded lazily so unit tests and JS-only tooling remain runnable without native bindings.
let nativeStorage: {
  getString: (key: string) => string | undefined;
  set: (key: string, value: string) => void;
  delete: (key: string) => void;
} | null = null;
try {
  const { createMMKV } = require('react-native-mmkv');
  nativeStorage = createMMKV({ id: 'empire-rise' });
} catch {
  nativeStorage = null;
}
const clearNativeSave = () => {
  try {
    nativeStorage?.delete(SAVE_KEY);
  } catch {
    /* Storage can be unavailable during native reloads. */
  }
};
const trade = (
  kind: 'stocks' | 'crypto',
  id: string,
  quantity: number,
  isBuy: boolean,
): boolean => {
  const assets = kind === 'stocks' ? STOCKS : CRYPTO;
  const asset = assets.find(item => item.id === id);
  const holdings = state[kind];
  if (
    !asset ||
    !Number.isFinite(quantity) ||
    quantity <= 0 ||
    quantity > 1_000_000 ||
    Math.round(quantity * 10000) !== quantity * 10000
  )
    return false;
  const price = state.marketPrices[id] ?? asset.price;
  const existing = holdings.find(item => item.id === id);
  const feeRate = state.research.includes('finance') ? 0.005 : 0.01;
  const gross = price * quantity;
  const cost = Math.round(
    isBuy ? gross * (1 + feeRate) : gross * (1 - feeRate),
  );
  if (isBuy && state.cash < cost) return false;
  if (!isBuy && (!existing || existing.quantity < quantity)) return false;
  let nextHoldings: Holding[];
  let realized = state.realizedProfit;
  if (isBuy) {
    const oldQuantity = existing?.quantity ?? 0;
    const oldCost = (existing?.averageCost ?? 0) * oldQuantity;
    nextHoldings = existing
      ? holdings.map(item =>
        item.id === id
          ? {
            ...item,
            quantity: oldQuantity + quantity,
            averageCost: (oldCost + gross) / (oldQuantity + quantity),
          }
          : item,
      )
      : [...holdings, { id, quantity, averageCost: price }];
  } else {
    nextHoldings = holdings
      .map(item =>
        item.id === id ? { ...item, quantity: item.quantity - quantity } : item,
      )
      .filter(item => item.quantity > 0);
    realized += cost - (existing?.averageCost ?? price) * quantity;
  }
  append({
    ...state,
    cash: state.cash + (isBuy ? -cost : cost),
    [kind]: nextHoldings,
    realizedProfit: realized,
    transactions: [
      ledger(
        isBuy ? 'purchase' : 'income',
        `${isBuy ? 'Bought' : 'Sold'} ${quantity} ${asset.symbol} (incl. fee)`,
        isBuy ? -cost : cost,
      ),
      ...state.transactions,
    ].slice(0, 80),
  });
  return true;
};

export const gameStore = {
  getState: () => state,
  subscribe: (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  completeOnboarding: (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    try {
      append({
        ...state,
        onboardingComplete: true,
        profile: { ...state.profile, name: trimmed },
        transactions: [
          ledger('system', 'Founder profile created', 0),
          ...state.transactions,
        ],
      });
      return true;
    } catch (error) {
      console.error('Error completing onboarding:', error);
      state = {
        ...state,
        onboardingComplete: true,
        profile: { ...state.profile, name: trimmed },
        transactions: [
          ledger('system', 'Founder profile created', 0),
          ...state.transactions,
        ],
      };
      zustandState.getState().setGame(state);
      notify();
      return true;
    }
  },
  purchaseBusiness: (id: BusinessId) => {
    const definition = getBusinessDefinition(id);
    if (
      !definition ||
      state.businesses.some(item => item.id === id) ||
      state.cash < definition.purchasePrice ||
      state.profile.level < definition.unlockLevel ||
      calculateNetWorth(state) < definition.unlockNetWorth
    )
      return false;
    const timestamp = now();
    append({
      ...state,
      cash: state.cash - definition.purchasePrice,
      businesses: [
        ...state.businesses,
        {
          id,
          level: 1,
          efficiency: 0.15,
          employees: 0,
          purchasedAt: timestamp,
          lifetimeProfit: 0,
          purchaseHistory: [timestamp],
          upgradeHistory: [],
        },
      ],
      profile: {
        ...state.profile,
        xp: state.profile.xp + 100,
        reputation: state.profile.reputation + 2,
      },
      transactions: [
        ledger(
          'purchase',
          `Acquired ${definition.name}`,
          -definition.purchasePrice,
        ),
        ...state.transactions,
      ].slice(0, 80),
    });
    return true;
  },
  upgradeBusiness: (id: BusinessId) => {
    const business = state.businesses.find(item => item.id === id);
    const definition = getBusinessDefinition(id);
    if (!business || !definition || business.level >= 100) return false;
    const cost = calculateUpgradeCost(definition, business.level);
    if (state.cash < cost) return false;
    const timestamp = now();
    append({
      ...state,
      cash: state.cash - cost,
      businesses: state.businesses.map(item =>
        item.id === id
          ? {
            ...item,
            level: Math.min(100, item.level + 1),
            efficiency: Math.min(0.8, item.efficiency + 0.04),
            satisfaction: Math.min(1, (item.satisfaction ?? 0.72) + 0.01),
            upgradeHistory: [
              ...(item.upgradeHistory ?? []),
              { level: item.level + 1, timestamp, cost },
            ],
          }
          : item,
      ),
      profile: { ...state.profile, xp: state.profile.xp + 50 },
      transactions: [
        ledger('upgrade', `Upgraded ${definition.name}`, -cost),
        ...state.transactions,
      ].slice(0, 80),
    });
    return true;
  },
  expandBusiness: (id: BusinessId) => {
    const business = state.businesses.find(item => item.id === id);
    const definition = getBusinessDefinition(id);
    const branches = business?.branches ?? 0;
    const cost = Math.round(
      (definition?.purchasePrice ?? 0) * 0.35 * (branches + 1),
    );
    if (!business || !definition || state.cash < cost || branches >= 20)
      return false;
    append({
      ...state,
      cash: state.cash - cost,
      businesses: state.businesses.map(item =>
        item.id === id ? { ...item, branches: branches + 1 } : item,
      ),
      transactions: [
        ledger(
          'upgrade',
          `Opened branch ${branches + 1} for ${definition.name}`,
          -cost,
        ),
        ...state.transactions,
      ].slice(0, 80),
    });
    return true;
  },
  runMarketingCampaign: (id: BusinessId) => {
    const business = state.businesses.find(item => item.id === id);
    const definition = getBusinessDefinition(id);
    const level = business?.marketingLevel ?? 0;
    const cost = Math.round(
      (definition?.purchasePrice ?? 0) * 0.04 * (level + 1),
    );
    if (!business || !definition || state.cash < cost || level >= 10)
      return false;
    append({
      ...state,
      cash: state.cash - cost,
      businesses: state.businesses.map(item =>
        item.id === id
          ? {
            ...item,
            marketingLevel: level + 1,
            satisfaction: Math.min(1, (item.satisfaction ?? 0.72) + 0.03),
          }
          : item,
      ),
      transactions: [
        ledger('expense', `Marketing campaign: ${definition.name}`, -cost),
        ...state.transactions,
      ].slice(0, 80),
    });
    return true;
  },
  sellBusiness: (id: BusinessId) => {
    const business = state.businesses.find(item => item.id === id);
    const definition = getBusinessDefinition(id);
    if (!business || !definition) return false;
    const proceeds = Math.round(calculateBusinessValue(business) * 0.7);
    const businesses = state.businesses.filter(item => item.id !== id);
    const employees = { ...state.employees };
    delete employees[id];
    append({
      ...state,
      cash: state.cash + proceeds,
      businesses,
      employees,
      transactions: [
        ledger('income', `Sold ${definition.name}`, proceeds),
        ...state.transactions,
      ].slice(0, 80),
    });
    return true;
  },
  toggleWatchlist: (id: string) => {
    const watchlist = state.watchlist.includes(id)
      ? state.watchlist.filter(item => item !== id)
      : [...state.watchlist, id];
    append({
      ...state,
      watchlist,
      transactions: [
        ledger(
          'system',
          `${state.watchlist.includes(id) ? 'Removed from' : 'Added to'
          } watchlist`,
          0,
        ),
        ...state.transactions,
      ].slice(0, 80),
    });
    return true;
  },
  buyStock: (id: string, quantity: number) =>
    trade('stocks', id, quantity, true),
  sellStock: (id: string, quantity: number) =>
    trade('stocks', id, quantity, false),
  buyCrypto: (id: string, quantity: number) =>
    trade('crypto', id, quantity, true),
  sellCrypto: (id: string, quantity: number) =>
    trade('crypto', id, quantity, false),
  purchaseProperty: (id: string) => {
    const property = PROPERTIES.find(item => item.id === id);
    if (
      !property ||
      state.properties.some(item => item.id === id) ||
      state.cash < property.purchasePrice ||
      calculateNetWorth(state) < property.unlockNetWorth
    )
      return false;
    append({
      ...state,
      cash: state.cash - property.purchasePrice,
      properties: [
        ...state.properties,
        { id, level: 1, occupancy: 0.92, purchasedAt: now() },
      ],
      transactions: [
        ledger(
          'purchase',
          `Purchased ${property.name}`,
          -property.purchasePrice,
        ),
        ...state.transactions,
      ].slice(0, 80),
    });
    return true;
  },
  financeProperty: (id: string) => {
    const property = PROPERTIES.find(item => item.id === id);
    const downPayment = property ? Math.round(property.purchasePrice * 0.3) : 0;
    const mortgage = property ? property.purchasePrice - downPayment : 0;
    if (
      !property ||
      state.properties.some(item => item.id === id) ||
      state.cash < downPayment ||
      calculateNetWorth(state) < property.unlockNetWorth
    )
      return false;
    const loan = {
      id: `mortgage-${id}-${now()}`,
      name: `${property.name} mortgage`,
      type: 'mortgage' as const,
      principal: mortgage,
      balance: mortgage,
      annualRate: 0.065,
      minimumPayment: Math.max(100, Math.round(mortgage / 240)),
      missedPayments: 0,
    };
    append({
      ...state,
      cash: state.cash - downPayment,
      liabilities: state.liabilities + mortgage,
      loans: [...state.loans, loan],
      properties: [
        ...state.properties,
        {
          id,
          level: 1,
          occupancy: 0.92,
          purchasedAt: now(),
          mortgageBalance: mortgage,
        },
      ],
      transactions: [
        ledger(
          'purchase',
          `Financed ${property.name} · 30% down`,
          -downPayment,
        ),
        ...state.transactions,
      ].slice(0, 80),
    });
    return true;
  },
  upgradeProperty: (id: string) => {
    const owned = state.properties.find(item => item.id === id);
    const property = PROPERTIES.find(item => item.id === id);
    if (!owned || !property) return false;
    const cost = Math.round(
      property.purchasePrice * 0.45 * Math.pow(1.55, owned.level - 1),
    );
    if (state.cash < cost) return false;
    append({
      ...state,
      cash: state.cash - cost,
      properties: state.properties.map(item =>
        item.id === id
          ? {
            ...item,
            level: item.level + 1,
            occupancy: Math.min(1, item.occupancy + 0.03),
          }
          : item,
      ),
      transactions: [
        ledger('upgrade', `Upgraded ${property.name}`, -cost),
        ...state.transactions,
      ].slice(0, 80),
    });
    return true;
  },
  renovateProperty: (id: string) => {
    const owned = state.properties.find(item => item.id === id);
    const property = PROPERTIES.find(item => item.id === id);
    const level = owned?.renovationLevel ?? 0;
    const cost = property
      ? Math.round(property.purchasePrice * 0.12 * (level + 1))
      : 0;
    if (!owned || !property || state.cash < cost || level >= 10) return false;
    append({
      ...state,
      cash: state.cash - cost,
      properties: state.properties.map(item =>
        item.id === id
          ? {
            ...item,
            renovationLevel: level + 1,
            occupancy: Math.min(1, item.occupancy + 0.02),
          }
          : item,
      ),
      transactions: [
        ledger('upgrade', `Renovated ${property.name}`, -cost),
        ...state.transactions,
      ].slice(0, 80),
    });
    return true;
  },
  sellProperty: (id: string) => {
    const owned = state.properties.find(item => item.id === id);
    const property = PROPERTIES.find(item => item.id === id);
    if (!owned || !property) return false;
    const marketValue = Math.round(
      property.purchasePrice * (1 + (owned.level - 1) * 0.25),
    );
    const proceeds = Math.round(marketValue * 0.85);
    append({
      ...state,
      cash: state.cash + proceeds,
      properties: state.properties.filter(item => item.id !== id),
      transactions: [
        ledger('income', `Sold ${property.name}`, proceeds),
        ...state.transactions,
      ].slice(0, 80),
    });
    return true;
  },
  purchaseLifestyle: (id: string) => {
    const asset = LIFESTYLE_ASSETS.find(item => item.id === id);
    if (
      !asset ||
      state.lifestyle.some(item => item.id === id) ||
      state.cash < asset.price ||
      state.prestigeCount < asset.prestigeRequired
    )
      return false;
    append({
      ...state,
      cash: state.cash - asset.price,
      lifestyle: [...state.lifestyle, { id, purchasedAt: now(), condition: 1 }],
      profile: { ...state.profile, reputation: state.profile.reputation + 1 },
      transactions: [
        ledger('purchase', `Purchased new ${asset.name}`, -asset.price),
        ...state.transactions,
      ].slice(0, 80),
    });
    return true;
  },
  setLifestyleMode: (mode: 'frugal' | 'luxury') => {
    if (state.lifestyleMode === mode) return false;
    append({
      ...state,
      lifestyleMode: mode,
      profile: {
        ...state.profile,
        reputation: state.profile.reputation + (mode === 'luxury' ? 2 : 0),
      },
      transactions: [
        ledger(
          'system',
          `Lifestyle strategy: ${mode === 'luxury' ? 'Luxury' : 'Frugal'}`,
          0,
        ),
        ...state.transactions,
      ].slice(0, 80),
    });
    return true;
  },
  repairLifestyle: (id: string) => {
    const asset = LIFESTYLE_ASSETS.find(item => item.id === id);
    const owned = state.lifestyle.find(item => item.id === id);
    const condition = owned?.condition ?? 1;
    const repairCost = Math.max(
      500,
      Math.round((asset?.price ?? 0) * 0.025 * Math.max(0.1, 1 - condition)),
    );
    if (!asset || !owned || condition >= 1 || state.cash < repairCost)
      return false;
    append({
      ...state,
      cash: state.cash - repairCost,
      lifestyle: state.lifestyle.map(item =>
        item.id === id ? { ...item, condition: 1 } : item,
      ),
      transactions: [
        ledger('upgrade', `Repaired ${asset.name}`, -repairCost),
        ...state.transactions,
      ].slice(0, 80),
    });
    return true;
  },
  driveLifestyle: (id: string) => {
    const asset = LIFESTYLE_ASSETS.find(item => item.id === id);
    const owned = state.lifestyle.find(item => item.id === id);
    if (!asset || asset.visual !== 'car' || !owned) return false;
    append({
      ...state,
      lifestyle: state.lifestyle.map(item =>
        item.id === id
          ? { ...item, condition: Math.max(0.1, (item.condition ?? 1) - 0.1) }
          : item,
      ),
      transactions: [
        ledger('system', `Drove ${asset.name}`, 0),
        ...state.transactions,
      ].slice(0, 80),
    });
    return true;
  },
  sellLifestyle: (id: string) => {
    const asset = LIFESTYLE_ASSETS.find(item => item.id === id);
    if (!asset || !state.lifestyle.some(item => item.id === id)) return false;
    const resaleRate = state.businesses.some(item => item.id === 'dealership')
      ? 0.9
      : 0.82;
    const proceeds = Math.round(asset.price * resaleRate);
    append({
      ...state,
      cash: state.cash + proceeds,
      lifestyle: state.lifestyle.filter(item => item.id !== id),
      transactions: [
        ledger(
          'income',
          `Sold ${asset.name} (${Math.round(resaleRate * 100)}% resale)`,
          proceeds,
        ),
        ...state.transactions,
      ].slice(0, 80),
    });
    return true;
  },
  hireEmployee: (businessId: string, employeeId: string) => {
    const business = state.businesses.find(item => item.id === businessId);
    const employee = EMPLOYEES.find(item => item.id === employeeId);
    const assigned = state.employees[businessId] ?? [];
    const key = `${businessId}:${employeeId}`;
    if (
      !business ||
      !employee ||
      assigned.includes(employeeId) ||
      state.cash < employee.salaryPerTick * 10
    )
      return false;
    append({
      ...state,
      cash: state.cash - employee.salaryPerTick * 10,
      businesses: state.businesses.map(item =>
        item.id === businessId
          ? { ...item, employees: assigned.length + 1 }
          : item,
      ),
      employees: {
        ...state.employees,
        [businessId]: [...assigned, employeeId],
      },
      employeeStats: {
        ...state.employeeStats,
        [key]: {
          salaryMultiplier: 1,
          training: 0,
          happiness: 0.78,
          performance: 1,
          promotions: 0,
        },
      },
      transactions: [
        ledger(
          'expense',
          `Hired ${employee.role}`,
          -employee.salaryPerTick * 10,
        ),
        ...state.transactions,
      ].slice(0, 80),
    });
    return true;
  },
  fireEmployee: (businessId: string, employeeId: string) => {
    const assigned = state.employees[businessId] ?? [];
    if (!assigned.includes(employeeId)) return false;
    const key = `${businessId}:${employeeId}`;
    const executives = Object.fromEntries(
      Object.entries(state.executives).filter(
        ([, assignment]) => assignment.employeeId !== employeeId,
      ),
    );
    const employeeStats = { ...state.employeeStats };
    delete employeeStats[key];
    append({
      ...state,
      businesses: state.businesses.map(item =>
        item.id === businessId
          ? { ...item, employees: Math.max(0, item.employees - 1) }
          : item,
      ),
      employees: {
        ...state.employees,
        [businessId]: assigned.filter(id => id !== employeeId),
      },
      employeeStats,
      executives,
      boardApproval: Math.max(0, state.boardApproval - 0.02),
      transactions: [
        ledger('system', 'Employee released', 0),
        ...state.transactions,
      ].slice(0, 80),
    });
    return true;
  },
  trainEmployee: (businessId: string, employeeId: string) => {
    const employee = EMPLOYEES.find(item => item.id === employeeId);
    const assigned = state.employees[businessId] ?? [];
    const key = `${businessId}:${employeeId}`;
    const stats = state.employeeStats[key];
    const cost = Math.round(
      (employee?.salaryPerTick ?? 0) * 18 * ((stats?.training ?? 0) + 1),
    );
    if (
      !employee ||
      !assigned.includes(employeeId) ||
      !stats ||
      stats.training >= 10 ||
      state.cash < cost
    )
      return false;
    append({
      ...state,
      cash: state.cash - cost,
      employeeStats: {
        ...state.employeeStats,
        [key]: {
          ...stats,
          training: stats.training + 1,
          performance: Math.min(1.35, stats.performance + 0.025),
          happiness: Math.min(1, stats.happiness + 0.04),
        },
      },
      companyCulture: Math.min(1, state.companyCulture + 0.005),
      transactions: [
        ledger('expense', `Training: ${employee.role}`, -cost),
        ...state.transactions,
      ].slice(0, 80),
    });
    return true;
  },
  negotiateSalary: (businessId: string, employeeId: string) => {
    const key = `${businessId}:${employeeId}`;
    const stats = state.employeeStats[key];
    if (!stats || stats.salaryMultiplier <= 0.72) return false;
    append({
      ...state,
      employeeStats: {
        ...state.employeeStats,
        [key]: {
          ...stats,
          salaryMultiplier: Math.max(0.72, stats.salaryMultiplier - 0.07),
          happiness: Math.max(0, stats.happiness - 0.06),
        },
      },
      transactions: [
        ledger('system', 'Salary renegotiated', 0),
        ...state.transactions,
      ].slice(0, 80),
    });
    return true;
  },
  appointExecutive: (businessId: string, employeeId: string) => {
    const employee = EMPLOYEES.find(item => item.id === employeeId);
    const assigned = state.employees[businessId] ?? [];
    if (!employee?.executiveRole || !assigned.includes(employeeId))
      return false;
    append({
      ...state,
      executives: {
        ...state.executives,
        [employee.executiveRole]: {
          employeeId,
          appointedAt: now(),
          bonus: 0.06,
        },
      },
      boardApproval: Math.min(1, state.boardApproval + 0.04),
      transactions: [
        ledger('system', `Appointed ${employee.executiveRole}`, 0),
        ...state.transactions,
      ].slice(0, 80),
    });
    return true;
  },
  setDepartmentBudget: (department: string, multiplier: number) => {
    const value = Math.max(0.75, Math.min(1.5, Number(multiplier)));
    if (!Number.isFinite(value)) return false;
    append({
      ...state,
      departmentBudgets: { ...state.departmentBudgets, [department]: value },
      transactions: [
        ledger(
          'system',
          `${department} budget set to ${Math.round(value * 100)}%`,
          0,
        ),
        ...state.transactions,
      ].slice(0, 80),
    });
    return true;
  },
  improveCulture: () => {
    const cost = Math.round(5000 * (1 + (state.companyCulture ?? 0.72) * 4));
    if (state.cash < cost || state.companyCulture >= 1) return false;
    append({
      ...state,
      cash: state.cash - cost,
      companyCulture: Math.min(1, state.companyCulture + 0.05),
      boardApproval: Math.min(1, state.boardApproval + 0.02),
      transactions: [
        ledger('expense', 'Company culture initiative', -cost),
        ...state.transactions,
      ].slice(0, 80),
    });
    return true;
  },
  completeResearch: (id: string) => {
    const research = RESEARCH.find(item => item.id === id);
    if (
      !research ||
      state.research.includes(id) ||
      (research.prerequisite &&
        !state.research.includes(research.prerequisite)) ||
      state.cash < research.cost
    )
      return false;
    const innovationLevel = state.innovationLevel + 1;
    append({
      ...state,
      cash: state.cash - research.cost,
      research: [...state.research, id],
      patents: id === 'patents' ? [...state.patents, id] : state.patents,
      innovationLevel,
      profile: { ...state.profile, xp: state.profile.xp + 100 },
      transactions: [
        ledger('expense', `Completed ${research.name}`, -research.cost),
        ...state.transactions,
      ].slice(0, 80),
    });
    return true;
  },
  claimMissionReward: (id: string) => {
    const today = dayKey();
    const weekStart = new Date(`${today}T00:00:00Z`);
    weekStart.setUTCDate(weekStart.getUTCDate() - weekStart.getUTCDay());
    const weekKey = weekStart.toISOString().slice(0, 10);
    const newDay = state.missionDay !== today;
    const newWeek = state.weeklyMissionStart !== weekKey;
    const freshMissions = state.missions.map(item =>
      (item.cadence === 'daily' && newDay) ||
        (item.cadence === 'weekly' && newWeek)
        ? { ...item, claimed: false }
        : item,
    );
    const freshState =
      newDay || newWeek
        ? {
          ...state,
          missionDay: today,
          weeklyMissionStart: weekKey,
          dailyProfit: newDay ? 0 : state.dailyProfit,
          dailyProfitDay: today,
          missions: freshMissions,
        }
        : state;
    const mission = freshMissions.find(item => item.id === id);
    if (!mission || mission.claimed) return false;
    const trainingCount = Object.values(freshState.employeeStats).reduce(
      (sum, employee) => sum + employee.training,
      0,
    );
    const value =
      mission.type === 'businesses'
        ? freshState.businesses.length
        : mission.type === 'stocks'
          ? freshState.stocks.reduce((sum, item) => sum + item.quantity, 0)
          : mission.type === 'properties'
            ? freshState.properties.length
            : mission.type === 'netWorth'
              ? calculateNetWorth(freshState)
              : mission.type === 'upgrades'
                ? freshState.transactions.filter(item => item.kind === 'upgrade').length
                : mission.type === 'rental'
                  ? freshState.totalRentalIncome
                  : mission.type === 'research'
                    ? freshState.research.length
                    : mission.type === 'lifestyle'
                      ? freshState.lifestyle.length
                      : mission.type === 'training'
                        ? trainingCount
                        : mission.type === 'portfolio'
                          ? freshState.stocks.length + freshState.crypto.length
                          : mission.cadence === 'daily'
                            ? freshState.dailyProfit
                            : freshState.totalProfit;
    if (value < mission.target) return false;
    const missions = freshMissions.map(item =>
      item.id === id ? { ...item, claimed: true } : item,
    );
    const dailyComplete =
      mission.cadence === 'daily' &&
      missions
        .filter(item => item.cadence === 'daily')
        .every(item => item.claimed);
    const streak = dailyComplete
      ? freshState.missionStreak + 1
      : freshState.missionStreak;
    const streakBonus = dailyComplete ? Math.min(5000, streak * 250) : 0;
    append({
      ...freshState,
      cash: freshState.cash + mission.reward + streakBonus,
      missionStreak: streak,
      missions,
      transactions: [
        ledger(
          'income',
          `Mission reward: ${mission.title}`,
          mission.reward + streakBonus,
        ),
        ...freshState.transactions,
      ].slice(0, 80),
    });
    return true;
  },
  chooseCareerPath: (path: 'operator' | 'investor' | 'developer') => {
    if (state.careerPath) return false;
    append({
      ...state,
      careerPath: path,
      profile: { ...state.profile, reputation: state.profile.reputation + 5 },
      transactions: [
        ledger('system', `Career path: ${path}`, 0),
        ...state.transactions,
      ].slice(0, 80),
    });
    return true;
  },
  equipTitle: (title: string) => {
    if (!state.titles.includes(title)) return false;
    append({
      ...state,
      activeTitle: title,
      transactions: [
        ledger('system', `Equipped title: ${title}`, 0),
        ...state.transactions,
      ].slice(0, 80),
    });
    return true;
  },
  resolveWorldEvent: (optionId: string) => {
    const event = state.activeWorldEvent;
    const option = event?.options.find(item => item.id === optionId);
    if (!event || !option) return false;
    append({
      ...state,
      cash: Math.max(0, state.cash + (option.cashDelta ?? 0)),
      activeWorldEvent: null,
      eventIncomeMultiplier: option.incomeMultiplier ?? 1,
      eventExpenseMultiplier: option.expenseMultiplier ?? 1,
      eventMarketMultiplier: option.marketMultiplier ?? 1,
      inflationRate: Math.max(
        0,
        state.inflationRate + (option.inflationDelta ?? 0),
      ),
      profile: {
        ...state.profile,
        reputation: Math.max(
          0,
          state.profile.reputation + (option.reputationDelta ?? 0),
        ),
      },
      eventHistory: [event.id, ...state.eventHistory].slice(0, 30),
      transactions: [
        ledger(
          option.cashDelta && option.cashDelta >= 0
            ? 'income'
            : option.cashDelta
              ? 'expense'
              : 'system',
          `${event.title}: ${option.label}`,
          option.cashDelta ?? 0,
        ),
        ...state.transactions,
      ].slice(0, 80),
    });
    return true;
  },
  processGameTick: () => {
    const next = processGameTick(state, 1);
    const today = dayKey();
    const freshDay = state.dailyProfitDay !== today;
    const profit = calculatePassiveIncomePerTick(state);
    const rental = calculatePropertyIncome(state);
    const interest = calculateBankInterestPerTick(state);
    const auto = state.automatedTransfer.enabled
      ? Math.min(state.automatedTransfer.amount, Math.max(0, next.cash))
      : 0;
    const accounts = next.bankAccounts
      .map(account =>
        account.type === 'savings'
          ? { ...account, balance: account.balance + interest }
          : account,
      )
      .map(account =>
        account.id === state.automatedTransfer.to
          ? { ...account, balance: account.balance + auto }
          : account,
      );
    append({
      ...next,
      cash: next.cash - auto,
      bankAccounts: accounts,
      activeWorldEvent:
        !state.activeWorldEvent &&
          next.totalTicks > 0 &&
          next.totalTicks % 10 === 0
          ? eventForTick(next.totalTicks)
          : null,
      dailyProfit:
        (freshDay ? 0 : state.dailyProfit) + Math.max(0, profit + interest),
      dailyProfitDay: today,
      totalProfit: state.totalProfit + Math.max(0, profit + interest),
      totalRentalIncome: state.totalRentalIncome + Math.max(0, rental),
      missionDay: today === state.missionDay ? state.missionDay : today,
      missions:
        today === state.missionDay
          ? state.missions
          : state.missions.map(item =>
            item.cadence === 'daily' ? { ...item, claimed: false } : item,
          ),
    });
  },
  tapToEarn: () => {
    const timestamp = now();
    if (timestamp - state.lastTapAt < 350) return 0;
    const reward = calculateTapReward(state);
    const today = dayKey(timestamp);
    const freshDay = state.dailyProfitDay !== today;
    append({
      ...state,
      cash: state.cash + reward,
      tapCount: state.tapCount + 1,
      lastTapAt: timestamp,
      dailyProfit: (freshDay ? 0 : state.dailyProfit) + reward,
      dailyProfitDay: today,
      totalProfit: state.totalProfit + reward,
      missionDay: today,
      transactions: [
        ledger('income', 'Founder tap bonus', reward),
        ...state.transactions,
      ].slice(0, 80),
    });
    return reward;
  },
  upgradeTap: () => {
    if (state.cash < state.tapUpgradeCost) return false;
    const nextLevel = state.tapLevel + 1;
    const nextCost = Math.round(state.tapUpgradeCost * 1.85);
    append({
      ...state,
      cash: state.cash - state.tapUpgradeCost,
      tapLevel: nextLevel,
      tapUpgradeCost: nextCost,
      profile: { ...state.profile, xp: state.profile.xp + 40 },
      transactions: [
        ledger(
          'upgrade',
          `Upgraded founder tap to level ${nextLevel}`,
          -state.tapUpgradeCost,
        ),
        ...state.transactions,
      ].slice(0, 80),
    });
    return true;
  },
  collect: () => gameStore.processGameTick(),
  processOfflineProgress: () => {
    const timestamp = now();
    const today = dayKey(timestamp);
    const newDay = state.dailyProfitDay !== today;
    const breakdown = calculateOfflineBreakdown(state, timestamp);
    const earnings = breakdown.netEarnings + breakdown.returnBonus;
    const missions =
      state.missionDay === today
        ? state.missions
        : state.missions.map(item =>
          item.cadence === 'daily' ? { ...item, claimed: false } : item,
        );
    const summary = { ...breakdown, processedAt: timestamp };
    append({
      ...state,
      missionDay: today,
      dailyProfitDay: today,
      dailyProfit: (newDay ? 0 : state.dailyProfit) + earnings,
      totalProfit: state.totalProfit + Math.max(0, earnings),
      totalRentalIncome:
        state.totalRentalIncome + Math.max(0, breakdown.propertyRent),
      missions,
      cash: state.cash + earnings,
      lastProcessedAt: timestamp,
      lastOfflineSummary: summary,
      returnBonusClaimedAt: breakdown.returnBonus
        ? timestamp
        : state.returnBonusClaimedAt,
      transactions: earnings
        ? [
          ledger(
            'income',
            breakdown.returnBonus
              ? 'Offline earnings + return bonus'
              : 'Offline empire earnings',
            earnings,
          ),
          ...state.transactions,
        ].slice(0, 80)
        : state.transactions,
    });
    return earnings;
  },
  claimDailyReward: () => {
    const today = dayKey();
    if (state.dailyRewardDay === today) return false;
    const reward = 500 + state.profile.level * 100 + state.missionStreak * 50;
    append({
      ...state,
      cash: state.cash + reward,
      dailyRewardDay: today,
      transactions: [
        ledger('income', 'Daily return reward', reward),
        ...state.transactions,
      ].slice(0, 80),
    });
    return true;
  },
  transferBank: (
    from: 'cash' | string,
    to: 'cash' | string,
    amount: number,
  ) => {
    const transfer = Math.round(amount);
    const account = state.bankAccounts.find(item => item.id === from);
    const destination = state.bankAccounts.find(item => item.id === to);
    const sourceBalance = from === 'cash' ? state.cash : account?.balance ?? 0;
    if (
      (!destination && to !== 'cash') ||
      from === to ||
      !Number.isFinite(transfer) ||
      transfer <= 0 ||
      sourceBalance < transfer
    )
      return false;
    append({
      ...state,
      cash:
        (from === 'cash' ? state.cash - transfer : state.cash) +
        (to === 'cash' ? transfer : 0),
      bankAccounts: state.bankAccounts.map(item =>
        item.id === from
          ? { ...item, balance: item.balance - transfer }
          : item.id === to
            ? { ...item, balance: item.balance + transfer }
            : item,
      ),
      transactions: [
        ledger(
          'system',
          `Bank transfer ${from} → ${to}`,
          from === 'cash' ? -transfer : transfer,
        ),
        ...state.transactions,
      ].slice(0, 80),
    });
    return true;
  },
  setAutomatedTransfer: (enabled: boolean, amount?: number) => {
    append({
      ...state,
      automatedTransfer: {
        ...state.automatedTransfer,
        enabled,
        amount: Math.max(
          0,
          Math.round(amount ?? state.automatedTransfer.amount),
        ),
      },
      transactions: [
        ledger(
          'system',
          enabled ? 'Automated savings enabled' : 'Automated savings paused',
          0,
        ),
        ...state.transactions,
      ].slice(0, 80),
    });
    return true;
  },
  setBudgetAllocation: (budget: Partial<GameState['budgetAllocation']>) => {
    const next = { ...state.budgetAllocation, ...budget };
    const total =
      next.savings + next.investing + next.lifestyle + next.operations;
    if (Math.abs(total - 1) > 0.01) return false;
    append({ ...state, budgetAllocation: next });
    return true;
  },
  takeLoan: (
    amount: number,
    type: 'personal' | 'business' | 'creditLine' = 'business',
  ) => {
    const principal = Math.round(amount);
    const creditLimit = Math.max(
      1000,
      state.cash + selectors.netWorth(state) * 0.25,
    );
    const eligible =
      state.creditScore >= 580 &&
      state.liabilities < Math.max(1, selectors.netWorth(state)) * 0.8;
    if (
      !Number.isFinite(principal) ||
      principal <= 0 ||
      principal > 1_000_000_000 ||
      principal > creditLimit ||
      !eligible
    )
      return false;
    const annualRate = type === 'creditLine' ? 0.12 : 0.08;
    const interest = Math.round(principal * annualRate);
    const loan = {
      id: `loan-${now()}`,
      name: type === 'business' ? 'Business credit facility' : 'Personal loan',
      type,
      principal,
      balance: principal + interest,
      annualRate,
      minimumPayment: Math.max(100, Math.round((principal + interest) / 24)),
      missedPayments: 0,
    };
    append({
      ...state,
      cash: state.cash + principal,
      liabilities: state.liabilities + principal + interest,
      loans: [...state.loans, loan],
      creditScore: Math.min(850, state.creditScore + 2),
      transactions: [
        ledger(
          'income',
          `Loan received (${Math.round(annualRate * 100)}% interest)`,
          principal,
        ),
        ...state.transactions,
      ].slice(0, 80),
    });
    return true;
  },
  repayDebt: (amount: number) => {
    let remaining = Math.min(Math.round(amount), state.liabilities, state.cash);
    if (!Number.isFinite(remaining) || remaining <= 0) return false;
    const loans = state.loans
      .map(loan => {
        const payment = Math.min(remaining, loan.balance);
        remaining -= payment;
        return { ...loan, balance: loan.balance - payment };
      })
      .filter(loan => loan.balance > 0);
    const paid = Math.min(Math.round(amount), state.liabilities, state.cash);
    append({
      ...state,
      cash: state.cash - paid,
      liabilities: Math.max(0, state.liabilities - paid),
      loans,
      creditScore: Math.min(850, state.creditScore + 1),
      transactions: [
        ledger('expense', 'Debt repayment', -paid),
        ...state.transactions,
      ].slice(0, 80),
    });
    return true;
  },
  fundEmergency: (amount: number) => {
    const deposit = Math.min(Math.round(amount), state.cash);
    if (!Number.isFinite(deposit) || deposit <= 0) return false;
    append({
      ...state,
      cash: state.cash - deposit,
      emergencyFund: state.emergencyFund + deposit,
      savingsGoals: state.savingsGoals.map(goal =>
        goal.id === 'emergency'
          ? { ...goal, saved: goal.saved + deposit }
          : goal,
      ),
      transactions: [
        ledger('system', 'Emergency fund deposit', -deposit),
        ...state.transactions,
      ].slice(0, 80),
    });
    return true;
  },
  withdrawEmergency: (amount: number) => {
    const withdrawal = Math.min(Math.round(amount), state.emergencyFund);
    if (!Number.isFinite(withdrawal) || withdrawal <= 0) return false;
    append({
      ...state,
      cash: state.cash + withdrawal,
      emergencyFund: state.emergencyFund - withdrawal,
      savingsGoals: state.savingsGoals.map(goal =>
        goal.id === 'emergency'
          ? { ...goal, saved: Math.max(0, goal.saved - withdrawal) }
          : goal,
      ),
      transactions: [
        ledger('system', 'Emergency fund withdrawal', withdrawal),
        ...state.transactions,
      ].slice(0, 80),
    });
    return true;
  },
  prestige: () => {
    const netWorth = calculateNetWorth(state);
    if (netWorth < 1_000_000) return false;
    const points = Math.max(1, Math.floor(netWorth / 1_000_000));
    const fresh = createInitialGameState(now());
    append({
      ...fresh,
      onboardingComplete: true,
      profile: {
        ...fresh.profile,
        name: state.profile.name,
        reputation: state.profile.reputation + 10,
      },
      achievements: state.achievements,
      titles: state.titles,
      activeTitle: state.activeTitle,
      careerPath: state.careerPath,
      prestigePoints: state.prestigePoints + points,
      prestigeCount: state.prestigeCount + 1,
      newGamePlus: state.newGamePlus + 1,
      permanentIncomeBonus: state.permanentIncomeBonus + 0.05,
      transactions: [
        ledger(
          'system',
          `New Game+ ${state.newGamePlus + 1} · ${points} prestige points`,
          0,
        ),
        ...fresh.transactions,
      ],
    });
    return true;
  },
  save: () => {
    const timestamp = now();
    nativeStorage?.set(SAVE_KEY, serializeGameState(state, timestamp));
    state = { ...state, lastSavedAt: timestamp };
    zustandState.getState().setGame(state);
    notify();
  },
  load: () => {
    const hydrated = hydrateGameState(nativeStorage?.getString(SAVE_KEY));
    if (hydrated) {
      state = hydrated;
      zustandState.getState().setGame(state);
      notify();
    } else if (nativeStorage?.getString(SAVE_KEY))
      nativeStorage.delete(SAVE_KEY);
  },
  reset: () => {
    clearNativeSave();
    state = createInitialGameState();
    zustandState.getState().setGame(state);
    notify();
    return true;
  },
};

export const useGameStore = <T>(selector: (value: GameState) => T) =>
  zustandState(store => selector(store.game));
export const calculateTapReward = (value: GameState) =>
  25 +
  value.tapLevel * 15 +
  value.profile.level * 10 +
  value.businesses.length * 5 +
  value.prestigeCount * 10;
export const selectors = {
  netWorth: calculateNetWorth,
  assets: calculateTotalAssets,
  passiveIncome: calculatePassiveIncomePerTick,
  revenue: (state: GameState) =>
    state.businesses.reduce((sum, business) => {
      const definition = getBusinessDefinition(business.id);
      return (
        sum +
        (definition
          ? calculateBusinessRevenueForState(state, definition, business)
          : 0)
      );
    }, 0),
  expenses: (state: GameState) =>
    state.businesses.reduce((sum, business) => {
      const definition = getBusinessDefinition(business.id);
      return (
        sum +
        (definition
          ? calculateBusinessExpensesForState(state, definition, business)
          : 0)
      );
    }, 0) +
    state.properties.reduce((sum, property) => {
      const definition = PROPERTIES.find(item => item.id === property.id);
      return sum + (definition ? definition.maintenancePerTick : 0);
    }, 0),
  profit: (state: GameState) => calculatePassiveIncomePerTick(state),
  purchaseCount: (state: GameState) =>
    state.transactions.filter(
      item =>
        item.kind === 'purchase' ||
        item.label.startsWith('Purchased') ||
        item.label.startsWith('Bought') ||
        item.label.startsWith('Acquired'),
    ).length,
  saleCount: (state: GameState) =>
    state.transactions.filter(item => item.label.startsWith('Sold')).length,
  upgradeCount: (state: GameState) =>
    state.transactions.filter(item => item.kind === 'upgrade').length,
  ownedCount: (state: GameState) =>
    state.businesses.length +
    state.properties.length +
    state.stocks.length +
    state.crypto.length +
    state.lifestyle.length,
};
