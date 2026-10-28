import { createInitialGameState } from '../../constants/initialGameState';
import { hydrateGameState, serializeGameState } from './saveService';

describe('save service', () => {
  it('round trips a complete state', () => {
    const state = {
      ...createInitialGameState(100),
      cash: 4321,
      dailyProfit: 90,
    };
    expect(hydrateGameState(serializeGameState(state, 200), 300)).toMatchObject(
      { cash: 4321, dailyProfit: 90, lastSavedAt: 200 },
    );
  });

  it('migrates a legacy partial save with safe defaults', () => {
    const legacy = JSON.stringify({
      cash: 2500,
      businesses: [],
      profile: { name: 'Legacy' },
    });
    const hydrated = hydrateGameState(legacy, 500);
    expect(hydrated?.version).toBe(1);
    expect(hydrated?.marketHistory.nova.length).toBeGreaterThan(0);
    expect(hydrated?.liabilities).toBe(0);
  });

  it('rejects malformed or unsafe saves', () => {
    expect(hydrateGameState('{not-json}')).toBeNull();
    expect(
      hydrateGameState(JSON.stringify({ cash: Infinity, businesses: [] })),
    ).toBeNull();
    expect(
      hydrateGameState(
        JSON.stringify({ cash: 10, businesses: [], version: 99 }),
      ),
    ).toBeNull();
  });
});
