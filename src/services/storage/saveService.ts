import { createInitialGameState } from '../../constants/initialGameState';
import { GameState } from '../../types/game';

export const SAVE_KEY = 'empire-rise-save-v1';

export interface SaveStorage {
  getString(key: string): string | undefined;
  set(key: string, value: string): void;
  delete(key: string): void;
}

/**
 * Validates and migrates local saves at the boundary. Older saves may omit
 * fields added in later releases; defaults come from a fresh state so a
 * partial save cannot crash the game or create NaN values.
 */
export const hydrateGameState = (
  raw: string | undefined,
  now = Date.now(),
): GameState | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<GameState>;
    if (
      (parsed.version !== undefined && parsed.version !== 1) ||
      typeof parsed.cash !== 'number' ||
      !Number.isFinite(parsed.cash) ||
      !Array.isArray(parsed.businesses)
    )
      return null;
    const base = createInitialGameState(now);
    return {
      ...base,
      ...parsed,
      version: 1,
      cash: Math.max(0, parsed.cash),
      marketHistory: parsed.marketHistory ?? base.marketHistory,
      dailyProfit: parsed.dailyProfit ?? 0,
      dailyProfitDay: parsed.dailyProfitDay ?? base.dailyProfitDay,
      totalProfit: parsed.totalProfit ?? 0,
      totalRentalIncome: parsed.totalRentalIncome ?? 0,
      lifestyle: parsed.lifestyle ?? base.lifestyle,
      employeeStats: parsed.employeeStats ?? base.employeeStats,
      executives: parsed.executives ?? base.executives,
      departmentBudgets: parsed.departmentBudgets ?? base.departmentBudgets,
      companyCulture: parsed.companyCulture ?? base.companyCulture,
      boardApproval: parsed.boardApproval ?? base.boardApproval,
      watchlist: parsed.watchlist ?? base.watchlist,
      prestigePoints: parsed.prestigePoints ?? 0,
      prestigeCount: parsed.prestigeCount ?? 0,
      permanentIncomeBonus: parsed.permanentIncomeBonus ?? 0,
      liabilities: parsed.liabilities ?? 0,
      emergencyFund: parsed.emergencyFund ?? 0,
      savingsGoals: parsed.savingsGoals ?? base.savingsGoals,
      taxRate: parsed.taxRate ?? 0.05,
      inflationRate: parsed.inflationRate ?? 0.03,
      financialHistory: parsed.financialHistory ?? base.financialHistory,
      tapCount: parsed.tapCount ?? 0,
      lastTapAt: parsed.lastTapAt ?? 0,
      tapLevel: parsed.tapLevel ?? 1,
      tapUpgradeCost: parsed.tapUpgradeCost ?? 1000,
      lifestyleMode: parsed.lifestyleMode ?? 'frugal',
      lifestyleRating: parsed.lifestyleRating ?? 0,
      weeklyMissionStart: parsed.weeklyMissionStart ?? base.weeklyMissionStart,
      missionStreak: parsed.missionStreak ?? 0,
      titles: parsed.titles ?? base.titles,
      activeTitle: parsed.activeTitle ?? base.activeTitle,
      careerPath: parsed.careerPath ?? null,
      newGamePlus: parsed.newGamePlus ?? 0,
      activeWorldEvent: parsed.activeWorldEvent ?? null,
      eventIncomeMultiplier: parsed.eventIncomeMultiplier ?? 1,
      eventExpenseMultiplier: parsed.eventExpenseMultiplier ?? 1,
      eventMarketMultiplier: parsed.eventMarketMultiplier ?? 1,
      eventHistory: parsed.eventHistory ?? [],
      bankAccounts: parsed.bankAccounts ?? base.bankAccounts,
      loans: parsed.loans ?? base.loans,
      creditScore: parsed.creditScore ?? 680,
      automatedTransfer: parsed.automatedTransfer ?? base.automatedTransfer,
      budgetAllocation: parsed.budgetAllocation ?? base.budgetAllocation,
      patents: parsed.patents ?? [],
      innovationLevel: parsed.innovationLevel ?? 0,
      lastOfflineSummary: parsed.lastOfflineSummary ?? null,
      dailyRewardDay: parsed.dailyRewardDay ?? '',
      returnBonusClaimedAt: parsed.returnBonusClaimedAt ?? 0,
    };
  } catch {
    return null;
  }
};

export const serializeGameState = (state: GameState, timestamp = Date.now()) =>
  JSON.stringify({ ...state, lastSavedAt: timestamp });
