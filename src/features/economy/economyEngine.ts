import { BusinessDefinition, GameState, OwnedBusiness } from '../../types/game';
import { getBusinessDefinition } from '../businesses/businessData';
import { STOCKS, CRYPTO } from '../market/marketData';
import { PROPERTIES } from '../realEstate/propertyData';
import { EMPLOYEES } from '../progression/progressionData';
import { LIFESTYLE_ASSETS } from '../lifestyle/lifestyleData';

export const TICK_SECONDS = 60;
export const MAX_OFFLINE_SECONDS = 60 * 60 * 8;

export const calculateUpgradeCost = (
  definition: BusinessDefinition,
  level: number,
) =>
  Math.round(
    definition.purchasePrice * 0.65 * Math.pow(1.58, Math.max(0, level - 1)),
  );

export const calculateBusinessRevenue = (
  definition: BusinessDefinition,
  business: OwnedBusiness,
) =>
  Math.round(
    definition.baseRevenuePerTick *
      business.level *
      (1 + business.efficiency) *
      (1 + (business.branches ?? 0) * 0.6) *
      (1 + (business.marketingLevel ?? 0) * 0.08),
  );

export const calculateBusinessExpenses = (
  definition: BusinessDefinition,
  business: OwnedBusiness,
) =>
  Math.round(
    definition.baseExpensesPerTick * (1 + (business.level - 1) * 0.34) +
      business.employees * 9,
  );

export const calculateNetProfit = (
  definition: BusinessDefinition,
  business: OwnedBusiness,
) =>
  calculateBusinessRevenue(definition, business) -
  calculateBusinessExpenses(definition, business);

export const calculateBusinessRevenueForState = (
  state: GameState,
  definition: BusinessDefinition,
  business: OwnedBusiness,
) => {
  const staff = state.employees[business.id] ?? [];
  const staffBonus = staff.reduce((total, id) => {
    const employee = EMPLOYEES.find(item => item.id === id);
    const stats = state.employeeStats?.[`${business.id}:${id}`];
    const performance = stats?.performance ?? 1;
    const training = 1 + (stats?.training ?? 0) * 0.04;
    const executiveBonus =
      employee?.executiveRole &&
      state.executives?.[employee.executiveRole]?.employeeId === id
        ? state.executives[employee.executiveRole].bonus ?? 0
        : 0;
    return (
      total + (employee?.bonus ?? 0) * performance * training + executiveBonus
    );
  }, 0);
  const researchBonus =
    (state.research.includes('marketing') ? 0.08 : 0) +
    (state.research.includes('automation') ? 0.05 : 0) +
    (state.research.includes('ai-operations') ? 0.1 : 0) +
    (state.research.includes('analytics') ? 0.06 : 0) +
    (state.research.includes('customer-insights') ? 0.06 : 0) +
    (state.research.includes('product-innovation') ? 0.08 : 0) +
    (state.research.includes('patents') ? 0.15 : 0);
  const cultureBonus =
    1 + Math.max(-0.08, (state.companyCulture ?? 0.72) - 0.7) * 0.35;
  const budgetBonus =
    1 +
    Math.max(
      -0.05,
      Math.min(0.08, ((state.departmentBudgets?.Marketing ?? 1) - 1) * 0.04),
    );
  return Math.round(
    calculateBusinessRevenue(definition, business) *
      (1 + staffBonus + researchBonus) *
      cultureBonus *
      budgetBonus,
  );
};

export const calculateBusinessExpensesForState = (
  state: GameState,
  definition: BusinessDefinition,
  business: OwnedBusiness,
) => {
  const staff = state.employees[business.id] ?? [];
  const salaries = staff.reduce((total, id) => {
    const employee = EMPLOYEES.find(item => item.id === id);
    const stats = state.employeeStats?.[`${business.id}:${id}`];
    return (
      total +
      Math.round(
        (employee?.salaryPerTick ?? 0) * (stats?.salaryMultiplier ?? 1),
      )
    );
  }, 0);
  const accountantReduction = staff.includes('accountant')
    ? 0.06 + ((state.departmentBudgets?.Finance ?? 1) - 1) * 0.02
    : 0;
  const operationsReduction =
    (state.research.includes('operations') ? 0.08 : 0) +
    (state.research.includes('manufacturing') ? 0.08 : 0) +
    (state.research.includes('logistics-optimization') ? 0.1 : 0) +
    (state.research.includes('renewable-energy') ? 0.12 : 0) +
    (state.research.includes('forecasting') ? 0.04 : 0);
  const cultureCost =
    1 + Math.max(0, 0.65 - (state.companyCulture ?? 0.72)) * 0.2;
  const operatingCost = Math.max(
    0,
    Math.round(
      (calculateBusinessExpenses(definition, business) + salaries) *
        (1 + (business.branches ?? 0) * 0.42) *
        cultureCost *
        (1 - accountantReduction - operationsReduction),
    ),
  );
  const taxes = Math.round(
    calculateBusinessRevenueForState(state, definition, business) *
      (state.taxRate ?? 0.05),
  );
  return operatingCost + taxes;
};

export const calculateNetProfitForState = (
  state: GameState,
  definition: BusinessDefinition,
  business: OwnedBusiness,
) =>
  calculateBusinessRevenueForState(state, definition, business) -
  calculateBusinessExpensesForState(state, definition, business);

export const calculatePassiveIncomePerTick = (state: GameState) => {
  const revenue = state.businesses.reduce((total, business) => {
    const definition = getBusinessDefinition(business.id);
    return definition
      ? total + calculateBusinessRevenueForState(state, definition, business)
      : total;
  }, 0);
  const expenses = state.businesses.reduce((total, business) => {
    const definition = getBusinessDefinition(business.id);
    return definition
      ? total + calculateBusinessExpensesForState(state, definition, business)
      : total;
  }, 0);
  const businessProfit =
    revenue * (state.eventIncomeMultiplier ?? 1) -
    expenses * (state.eventExpenseMultiplier ?? 1);
  const propertyProfit =
    calculatePropertyIncome(state) * (state.eventIncomeMultiplier ?? 1);
  return (
    (businessProfit + propertyProfit) *
      (1 + (state.permanentIncomeBonus ?? 0)) -
    calculateLifestyleExpensesPerTick(state)
  );
};

export const calculateBusinessValue = (business: OwnedBusiness) => {
  const definition = getBusinessDefinition(business.id);
  return definition
    ? Math.round(definition.purchasePrice * (1 + (business.level - 1) * 0.72))
    : 0;
};

export const calculatePortfolioValue = (
  holdings: { id: string; quantity: number }[],
  assets: { id: string; price: number }[],
  prices?: Record<string, number>,
) =>
  holdings.reduce(
    (total, holding) =>
      total +
      (prices?.[holding.id] ??
        assets.find(asset => asset.id === holding.id)?.price ??
        0) *
        holding.quantity,
    0,
  );

export const calculatePropertyIncome = (state: GameState) =>
  state.properties.reduce((total, owned) => {
    const property = PROPERTIES.find(item => item.id === owned.id);
    const researchBonus = state.research.includes('realestate') ? 0.1 : 0;
    const renovationBonus = 1 + (owned.renovationLevel ?? 0) * 0.06;
    const mortgageInterest = ((owned.mortgageBalance ?? 0) * 0.08) / 365 / 1440;
    const propertyTax = property
      ? (property.purchasePrice * 0.01) / 365 / 1440
      : 0;
    return property
      ? total +
          Math.round(
            (property.rentPerTick * (1 + researchBonus) * renovationBonus -
              property.maintenancePerTick -
              propertyTax -
              mortgageInterest) *
              owned.occupancy *
              (1 + (owned.level - 1) * 0.12),
          )
      : total;
  }, 0);

export const calculateLifestyleExpensesPerTick = (state: GameState) => {
  const monthly = state.lifestyle.reduce(
    (total, owned) =>
      total +
      (LIFESTYLE_ASSETS.find(asset => asset.id === owned.id)?.monthlyExpense ??
        0),
    0,
  );
  return Math.round(
    (monthly * (state.lifestyleMode === 'luxury' ? 1.35 : 0.35)) /
      (30 * 24 * 60),
  );
};

export const calculateBankInterestPerTick = (state: GameState) =>
  state.bankAccounts.reduce(
    (total, account) =>
      total +
      (account.type === 'savings'
        ? (account.balance * account.annualRate) / 365 / 1440
        : 0),
    0,
  );

export const calculateTotalAssets = (state: GameState) =>
  state.businesses.reduce(
    (total, business) => total + calculateBusinessValue(business),
    0,
  ) +
  calculatePortfolioValue(state.stocks, STOCKS, state.marketPrices) +
  calculatePortfolioValue(state.crypto, CRYPTO, state.marketPrices) +
  state.properties.reduce((total, owned) => {
    const property = PROPERTIES.find(item => item.id === owned.id);
    const appreciationTicks = Math.max(0, Math.floor(state.totalTicks / 1440));
    return (
      total +
      (property
        ? Math.round(
            property.purchasePrice *
              (1 +
                (property.appreciation * appreciationTicks) / 365 +
                (owned.level - 1) * 0.25),
          )
        : 0)
    );
  }, 0) +
  state.lifestyle.reduce(
    (total, owned) =>
      total +
      (LIFESTYLE_ASSETS.find(asset => asset.id === owned.id)?.price ?? 0),
    0,
  ) +
  state.bankAccounts.reduce((total, account) => total + account.balance, 0);

export const calculateTotalLiabilities = (state: GameState) =>
  Math.max(0, Number.isFinite(state.liabilities) ? state.liabilities : 0);
export const calculateNetWorth = (state: GameState) =>
  Math.max(
    0,
    state.cash + calculateTotalAssets(state) - calculateTotalLiabilities(state),
  );

export const calculateRealizedProfitLoss = (state: GameState) =>
  state.realizedProfit;
export const calculateUnrealizedProfitLoss = (state: GameState) =>
  state.stocks.reduce(
    (total, holding) =>
      total +
      ((state.marketPrices[holding.id] ?? 0) - holding.averageCost) *
        holding.quantity,
    0,
  ) +
  state.crypto.reduce(
    (total, holding) =>
      total +
      ((state.marketPrices[holding.id] ?? 0) - holding.averageCost) *
        holding.quantity,
    0,
  );

export const calculateOfflineEarnings = (state: GameState, now: number) => {
  return calculateOfflineBreakdown(state, now).netEarnings;
};

export const calculateOfflineBreakdown = (state: GameState, now: number) => {
  const elapsedSeconds = Math.max(
    0,
    Math.floor((now - state.lastProcessedAt) / 1000),
  );
  const cap = state.research.includes('automation')
    ? MAX_OFFLINE_SECONDS * 3
    : MAX_OFFLINE_SECONDS;
  const cappedSeconds = Math.min(cap, elapsedSeconds);
  const ticks = cappedSeconds / TICK_SECONDS;
  const businessIncomePerTick = state.businesses.reduce((total, business) => {
    const definition = getBusinessDefinition(business.id);
    return definition
      ? total + calculateBusinessRevenueForState(state, definition, business)
      : total;
  }, 0);
  const operatingExpensesPerTick =
    state.businesses.reduce((total, business) => {
      const definition = getBusinessDefinition(business.id);
      return definition
        ? total + calculateBusinessExpensesForState(state, definition, business)
        : total;
    }, 0) + calculateLifestyleExpensesPerTick(state);
  const propertyRentPerTick = calculatePropertyIncome(state);
  const interestPerTick = calculateBankInterestPerTick(state);
  const managerCount = state.businesses.reduce(
    (total, business) =>
      total +
      (state.employees[business.id] ?? []).filter(
        id => id === 'manager' || id === 'executive',
      ).length,
    0,
  );
  const automationMultiplier =
    1 + managerCount * 0.04 + (state.research.includes('automation') ? 0.1 : 0);
  const businessIncome = Math.floor(
    ticks * businessIncomePerTick * automationMultiplier,
  );
  const propertyRent = Math.floor(ticks * propertyRentPerTick);
  const operatingExpenses = Math.floor(ticks * operatingExpensesPerTick);
  const interestIncome = Math.floor(ticks * interestPerTick);
  const netEarnings = Math.max(
    0,
    businessIncome + propertyRent + interestIncome - operatingExpenses,
  );
  return {
    elapsedSeconds,
    cappedSeconds,
    businessIncome,
    propertyRent,
    operatingExpenses,
    interestIncome,
    netEarnings,
    returnBonus:
      elapsedSeconds >= 3600
        ? Math.min(2500, 250 + state.profile.level * 50)
        : 0,
  };
};

export const simulateMarketPrices = (state: GameState, seed: number) => {
  const next = { ...state.marketPrices };
  [...STOCKS, ...CRYPTO].forEach((asset, index) => {
    const raw = Math.sin(seed * 0.017 + index * 13.37) * asset.volatility;
    next[asset.id] = Math.max(
      0.01,
      Number(
        (
          next[asset.id] *
          (1 + raw * (state.eventMarketMultiplier ?? 1))
        ).toFixed(2),
      ),
    );
  });
  return next;
};

export const processGameTick = (state: GameState, ticks = 1): GameState => {
  const safeTicks = Math.max(0, Math.floor(ticks));
  const profit = calculatePassiveIncomePerTick(state) * safeTicks;
  if (!safeTicks) return state;
  const marketPrices = Array.from({ length: safeTicks }).reduce<
    Record<string, number>
  >(
    (prices, _, index) =>
      simulateMarketPrices(
        { ...state, marketPrices: prices },
        state.totalTicks + index + 1,
      ),
    state.marketPrices,
  );
  const marketHistory = Object.fromEntries(
    [...STOCKS, ...CRYPTO].map(asset => [
      asset.id,
      [
        ...(state.marketHistory?.[asset.id] ?? asset.history),
        marketPrices[asset.id],
      ].slice(-60),
    ]),
  );
  return {
    ...state,
    cash: Math.max(0, state.cash + profit),
    totalTicks: state.totalTicks + safeTicks,
    lastProcessedAt: state.lastProcessedAt + safeTicks * TICK_SECONDS * 1000,
    marketPrices,
    marketHistory,
    transactions:
      profit === 0
        ? state.transactions
        : [
            {
              id: `tick-${Date.now()}`,
              kind: 'income' as const,
              label: 'Business operations',
              amount: profit,
              createdAt: Date.now(),
            },
            ...state.transactions,
          ].slice(0, 40),
  };
};
