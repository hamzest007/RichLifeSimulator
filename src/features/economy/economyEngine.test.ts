import { createInitialGameState } from '../../constants/initialGameState';
import { getBusinessDefinition } from '../businesses/businessData';
import {
  calculateBusinessExpenses,
  calculateBusinessExpensesForState,
  calculateBusinessRevenue,
  calculateBusinessRevenueForState,
  calculateNetProfit,
  calculateNetWorth,
  calculateOfflineEarnings,
  calculateUpgradeCost,
  processGameTick,
} from './economyEngine';

describe('economy engine', () => {
  const definition = getBusinessDefinition('coffee')!;
  const business = {
    id: 'coffee' as const,
    level: 1,
    efficiency: 0.15,
    employees: 0,
    purchasedAt: 0,
    lifetimeProfit: 0,
  };
  it('calculates revenue, expenses and net profit deterministically', () => {
    expect(calculateBusinessRevenue(definition, business)).toBe(39);
    expect(calculateBusinessExpenses(definition, business)).toBe(12);
    expect(calculateNetProfit(definition, business)).toBe(27);
  });
  it('calculates upgrades and net worth', () => {
    expect(calculateUpgradeCost(definition, 1)).toBe(1625);
    const state = {
      ...createInitialGameState(1000),
      cash: 5000,
      businesses: [business],
    };
    expect(calculateNetWorth(state)).toBe(7500);
  });
  it('processes ticks without creating negative balances', () => {
    const state = { ...createInitialGameState(1000), businesses: [business] };
    const next = processGameTick(state, 2);
    expect(next.cash).toBe(10050);
    expect(next.totalTicks).toBe(2);
  });
  it('calculates elapsed offline earnings', () => {
    const state = {
      ...createInitialGameState(0),
      businesses: [business],
      lastProcessedAt: 0,
    };
    expect(calculateOfflineEarnings(state, 120_000)).toBe(50);
  });
  it('applies employee and research bonuses to stateful revenue', () => {
    const base = { ...createInitialGameState(0), businesses: [business] };
    const improved = {
      ...base,
      employees: { coffee: ['marketing'] },
      research: ['marketing'],
    };
    expect(
      calculateBusinessRevenueForState(improved, definition, business),
    ).toBeGreaterThan(
      calculateBusinessRevenueForState(base, definition, business),
    );
  });
  it('includes taxes in stateful operating expenses', () => {
    const state = { ...createInitialGameState(0), businesses: [business] };
    expect(
      calculateBusinessExpensesForState(state, definition, business),
    ).toBeGreaterThan(calculateBusinessExpenses(definition, business));
  });
  it('moves simulated market prices on a tick', () => {
    const state = createInitialGameState(0);
    const next = processGameTick(state, 1);
    expect(next.marketPrices.nova).not.toBe(state.marketPrices.nova);
  });
  it('persists a bounded market history on every tick', () => {
    const state = createInitialGameState(0);
    const next = processGameTick(state, 3);
    expect(next.marketHistory.nova).toHaveLength(7);
    expect(next.marketHistory.nova.at(-1)).toBe(next.marketPrices.nova);
  });
  it('calculates liabilities defensively', () => {
    const state = { ...createInitialGameState(0), liabilities: 1250 };
    expect(calculateNetWorth(state)).toBe(8750);
  });
});
