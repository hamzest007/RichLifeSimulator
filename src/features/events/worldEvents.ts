import { WorldEvent } from '../../types/game';

export const WORLD_EVENTS: WorldEvent[] = [
  {
    id: 'supplier-shock',
    title: 'Supplier prices jump',
    category: 'Operations',
    description:
      'A key supplier raises prices by 20%. Protect margins, switch suppliers, or automate the bottleneck.',
    options: [
      {
        id: 'accept',
        label: 'Accept higher costs',
        description: 'Keep supply stable, but operating expenses rise.',
        expenseMultiplier: 1.2,
      },
      {
        id: 'switch',
        label: 'Find another supplier',
        description: 'Pay a transition fee and reduce the shock.',
        cashDelta: -2500,
        expenseMultiplier: 1.06,
      },
      {
        id: 'automate',
        label: 'Invest in automation',
        description: 'Pay now for a permanent efficiency response.',
        cashDelta: -12000,
        incomeMultiplier: 1.08,
        expenseMultiplier: 0.96,
      },
    ],
  },
  {
    id: 'market-crash',
    title: 'Market correction',
    category: 'Markets',
    description:
      'Risk assets sell off sharply. You can hold your positions, buy the dip, or raise cash.',
    options: [
      {
        id: 'hold',
        label: 'Hold positions',
        description: 'Ride out the volatility with no transaction cost.',
        marketMultiplier: 0.82,
      },
      {
        id: 'buy',
        label: 'Buy the dip',
        description: 'Invest capital into the recovery trade.',
        cashDelta: -5000,
        marketMultiplier: 0.9,
        reputationDelta: 1,
      },
      {
        id: 'cash',
        label: 'Raise cash',
        description:
          'Take a defensive position and reduce passive market upside.',
        marketMultiplier: 0.88,
        incomeMultiplier: 0.98,
      },
    ],
  },
  {
    id: 'industry-boom',
    title: 'Industry boom',
    category: 'Growth',
    description: 'Demand surges across one of your operating sectors.',
    options: [
      {
        id: 'scale',
        label: 'Scale aggressively',
        description: 'Fund the growth push and capture more demand.',
        cashDelta: -8000,
        incomeMultiplier: 1.16,
      },
      {
        id: 'steady',
        label: 'Stay disciplined',
        description: 'Take a smaller, safer boost.',
        incomeMultiplier: 1.07,
      },
      {
        id: 'sell',
        label: 'Sell the opportunity',
        description: 'Take a short-term gain and preserve liquidity.',
        cashDelta: 12000,
        reputationDelta: 1,
      },
    ],
  },
  {
    id: 'employee-strike',
    title: 'Employee strike warning',
    category: 'People',
    description:
      'Employee frustration is rising. Resolve it with concessions, leadership, or a hard line.',
    options: [
      {
        id: 'concessions',
        label: 'Improve benefits',
        description: 'Fund morale and protect productivity.',
        cashDelta: -6500,
        incomeMultiplier: 1.08,
        reputationDelta: 2,
      },
      {
        id: 'leadership',
        label: 'Deploy leadership',
        description: 'Use executives and culture to stabilize the workforce.',
        cashDelta: -2500,
        incomeMultiplier: 1.04,
      },
      {
        id: 'hardline',
        label: 'Hold the line',
        description: 'Save cash now, but productivity suffers.',
        incomeMultiplier: 0.88,
        reputationDelta: -2,
      },
    ],
  },
  {
    id: 'regulation',
    title: 'New regulation',
    category: 'Policy',
    description:
      'A new rule affects business operations. Compliance is expensive, but avoidance risks a larger penalty.',
    options: [
      {
        id: 'comply',
        label: 'Comply fully',
        description: 'Pay the cost and protect long-term reputation.',
        cashDelta: -9000,
        reputationDelta: 3,
      },
      {
        id: 'lobby',
        label: 'Lobby for a transition',
        description: 'Spend on advocacy and reduce the immediate burden.',
        cashDelta: -4000,
        expenseMultiplier: 1.04,
      },
      {
        id: 'delay',
        label: 'Delay compliance',
        description: 'Save cash now, accepting a temporary efficiency hit.',
        incomeMultiplier: 0.9,
        reputationDelta: -3,
      },
    ],
  },
  {
    id: 'tech-breakthrough',
    title: 'Technology breakthrough',
    category: 'Innovation',
    description:
      'A new technology could reshape your operating costs and demand.',
    options: [
      {
        id: 'research',
        label: 'Fund research',
        description: 'Invest in a faster, more profitable future.',
        cashDelta: -18000,
        incomeMultiplier: 1.14,
        expenseMultiplier: 0.94,
      },
      {
        id: 'license',
        label: 'License it',
        description: 'Pay a smaller fee for a reliable improvement.',
        cashDelta: -7000,
        incomeMultiplier: 1.06,
      },
      {
        id: 'wait',
        label: 'Wait and watch',
        description: 'Avoid risk and keep current operations unchanged.',
        reputationDelta: -1,
      },
    ],
  },
  {
    id: 'recession',
    title: 'Recession warning',
    category: 'Economy',
    description:
      'Consumer confidence is falling. Protect cash flow or invest through the downturn.',
    options: [
      {
        id: 'cut',
        label: 'Cut expenses',
        description: 'Protect liquidity while demand cools.',
        expenseMultiplier: 0.88,
        incomeMultiplier: 0.9,
        reputationDelta: -1,
      },
      {
        id: 'stimulus',
        label: 'Invest through it',
        description: 'Spend capital to capture discounted opportunities.',
        cashDelta: -15000,
        incomeMultiplier: 1.12,
        marketMultiplier: 1.08,
      },
      {
        id: 'reserve',
        label: 'Build reserves',
        description: 'Move cash into safety and wait for recovery.',
        cashDelta: 5000,
        incomeMultiplier: 0.95,
        marketMultiplier: 0.9,
      },
    ],
  },
  {
    id: 'rates',
    title: 'Interest-rate decision',
    category: 'Central Bank',
    description:
      'Rates are changing, affecting loans, property demand, and purchasing power.',
    options: [
      {
        id: 'lock',
        label: 'Lock financing',
        description: 'Pay a fee to stabilize your borrowing costs.',
        cashDelta: -3000,
        expenseMultiplier: 1.03,
        inflationDelta: -0.005,
      },
      {
        id: 'float',
        label: 'Stay flexible',
        description: 'Accept volatility for a chance at lower costs.',
        expenseMultiplier: 1.1,
        inflationDelta: 0.01,
      },
      {
        id: 'cash',
        label: 'Pay down debt',
        description: 'Reduce liabilities and improve resilience.',
        cashDelta: -10000,
        expenseMultiplier: 0.96,
        reputationDelta: 1,
      },
    ],
  },
];

export const eventForTick = (tick: number) =>
  WORLD_EVENTS[
    Math.abs(Math.floor(Math.sin(tick * 12.37) * 10000)) % WORLD_EVENTS.length
  ];
