export type BusinessId =
  | 'coffee'
  | 'grocery'
  | 'restaurant'
  | 'clothing'
  | 'delivery'
  | 'construction'
  | 'logistics'
  | 'technology'
  | 'bank'
  | 'manufacturing'
  | 'energy'
  | 'investment'
  | 'media'
  | 'aerospace'
  | 'biotech'
  | 'spaceport'
  | 'streaming'
  | 'telecom'
  | 'robotics'
  | 'pharma'
  | 'dealership'
  | 'ecommerce'
  | 'realestate-agency'
  | 'app-studio'
  | 'ai-labs'
  | 'automobile'
  | 'airline'
  | 'mining';

export type TransactionKind =
  | 'income'
  | 'expense'
  | 'purchase'
  | 'upgrade'
  | 'system';

export interface BusinessDefinition {
  id: BusinessId;
  name: string;
  category: string;
  icon: string;
  purchasePrice: number;
  baseRevenuePerTick: number;
  baseExpensesPerTick: number;
  unlockLevel: number;
  unlockNetWorth: number;
}

export interface OwnedBusiness {
  id: BusinessId;
  level: number;
  efficiency: number;
  employees: number;
  purchasedAt: number;
  lifetimeProfit: number;
  purchaseHistory?: number[];
  upgradeHistory?: Array<{ level: number; timestamp: number; cost: number }>;
  branches?: number;
  marketingLevel?: number;
  satisfaction?: number;
}

export interface Transaction {
  id: string;
  kind: TransactionKind;
  label: string;
  amount: number;
  createdAt: number;
}

export interface Holding {
  id: string;
  quantity: number;
  averageCost: number;
}
export interface MarketAsset {
  id: string;
  symbol: string;
  name: string;
  sector: string;
  price: number;
  volatility: number;
  history: number[];
  marketCap?: number;
  dailyChange?: number;
}
export interface PropertyDefinition {
  id: string;
  name: string;
  category: string;
  icon: string;
  purchasePrice: number;
  rentPerTick: number;
  maintenancePerTick: number;
  appreciation: number;
  unlockNetWorth: number;
}
export interface OwnedProperty {
  id: string;
  level: number;
  occupancy: number;
  purchasedAt: number;
  mortgageBalance?: number;
  renovationLevel?: number;
}
export interface LifestyleAsset {
  id: string;
  name: string;
  category: string;
  icon: string;
  price: number;
  prestigeRequired: number;
  description: string;
  monthlyExpense?: number;
  visual:
    | 'car'
    | 'home'
    | 'yacht'
    | 'jet'
    | 'island'
    | 'watch'
    | 'clothing'
    | 'office'
    | 'travel'
    | 'security'
    | 'staff';
}
export interface OwnedLifestyle {
  id: string;
  purchasedAt: number;
  condition?: number;
}
export type ExecutiveRole = 'CFO' | 'CTO' | 'COO' | 'CMO' | 'CEO';
export interface EmployeeDefinition {
  id: string;
  role: string;
  icon: string;
  salaryPerTick: number;
  bonus: number;
  description: string;
  department?: string;
  executiveRole?: ExecutiveRole;
}
export interface EmployeeState {
  salaryMultiplier: number;
  training: number;
  happiness: number;
  performance: number;
  promotions: number;
}
export interface ExecutiveAssignment {
  employeeId: string;
  appointedAt: number;
  bonus: number;
}
export interface ResearchDefinition {
  id: string;
  name: string;
  cost: number;
  prerequisite?: string;
  description: string;
}
export interface Mission {
  id: string;
  title: string;
  description: string;
  target: number;
  reward: number;
  type:
    | 'businesses'
    | 'profit'
    | 'netWorth'
    | 'stocks'
    | 'properties'
    | 'upgrades'
    | 'rental'
    | 'research'
    | 'lifestyle'
    | 'training'
    | 'portfolio';
  claimed: boolean;
  cadence?: 'daily' | 'weekly' | 'lifetime';
  hidden?: boolean;
}
export interface Achievement {
  id: string;
  title: string;
  description: string;
  target: number;
  unlocked: boolean;
  reward: number;
  hidden?: boolean;
}
export interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  saved: number;
}
export interface FinancialSnapshot {
  timestamp: number;
  cash: number;
  netWorth: number;
  income: number;
  expenses: number;
}
export interface WorldEventOption {
  id: string;
  label: string;
  description: string;
  cashDelta?: number;
  incomeMultiplier?: number;
  expenseMultiplier?: number;
  marketMultiplier?: number;
  inflationDelta?: number;
  reputationDelta?: number;
}
export interface WorldEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  options: WorldEventOption[];
}
export interface BankAccount {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit';
  balance: number;
  annualRate: number;
  creditLimit?: number;
}
export interface Loan {
  id: string;
  name: string;
  type: 'personal' | 'business' | 'mortgage' | 'creditLine';
  principal: number;
  balance: number;
  annualRate: number;
  minimumPayment: number;
  missedPayments: number;
}
export interface OfflineSummary {
  processedAt: number;
  elapsedSeconds: number;
  cappedSeconds: number;
  businessIncome: number;
  propertyRent: number;
  operatingExpenses: number;
  interestIncome: number;
  netEarnings: number;
  returnBonus: number;
}

export interface PlayerProfile {
  name: string;
  level: number;
  xp: number;
  reputation: number;
}

export interface GameState {
  version: number;
  profile: PlayerProfile;
  cash: number;
  businesses: OwnedBusiness[];
  transactions: Transaction[];
  netWorthHistory: Array<{ timestamp: number; value: number }>;
  lastProcessedAt: number;
  lastSavedAt: number;
  totalTicks: number;
  stocks: Holding[];
  crypto: Holding[];
  watchlist: string[];
  properties: OwnedProperty[];
  lifestyle: OwnedLifestyle[];
  employees: Record<string, string[]>;
  employeeStats: Record<string, EmployeeState>;
  executives: Record<string, ExecutiveAssignment>;
  departmentBudgets: Record<string, number>;
  companyCulture: number;
  boardApproval: number;
  research: string[];
  missions: Mission[];
  achievements: Achievement[];
  realizedProfit: number;
  marketPrices: Record<string, number>;
  marketHistory: Record<string, number[]>;
  dailyProfit: number;
  dailyProfitDay: string;
  totalProfit: number;
  totalRentalIncome: number;
  liabilities: number;
  emergencyFund: number;
  savingsGoals: SavingsGoal[];
  taxRate: number;
  inflationRate: number;
  financialHistory: FinancialSnapshot[];
  prestigePoints: number;
  prestigeCount: number;
  permanentIncomeBonus: number;
  missionDay: string;
  onboardingComplete: boolean;
  tapCount: number;
  lastTapAt: number;
  tapLevel: number;
  tapUpgradeCost: number;
  lifestyleMode: 'frugal' | 'luxury';
  lifestyleRating: number;
  weeklyMissionStart: string;
  missionStreak: number;
  titles: string[];
  activeTitle: string;
  careerPath: 'operator' | 'investor' | 'developer' | null;
  newGamePlus: number;
  activeWorldEvent: WorldEvent | null;
  eventIncomeMultiplier: number;
  eventExpenseMultiplier: number;
  eventMarketMultiplier: number;
  eventHistory: string[];
  bankAccounts: BankAccount[];
  loans: Loan[];
  creditScore: number;
  automatedTransfer: {
    enabled: boolean;
    amount: number;
    from: string;
    to: string;
  };
  budgetAllocation: {
    savings: number;
    investing: number;
    lifestyle: number;
    operations: number;
  };
  patents: string[];
  innovationLevel: number;
  lastOfflineSummary: OfflineSummary | null;
  dailyRewardDay: string;
  returnBonusClaimedAt: number;
}
