import { gameStore } from './gameStore';

describe('game actions', () => {
  beforeEach(() => gameStore.reset());

  it('rejects unaffordable purchases and records valid purchases', () => {
    expect(gameStore.purchaseBusiness('coffee')).toBe(true);
    expect(gameStore.purchaseBusiness('coffee')).toBe(false);
    expect(gameStore.getState().cash).toBe(8500);
    expect(gameStore.getState().businesses).toHaveLength(1);
  });

  it('tracks stock cost basis and realized profit', () => {
    expect(gameStore.buyStock('nova', 2)).toBe(true);
    expect(gameStore.sellStock('nova', 1)).toBe(true);
    expect(gameStore.getState().stocks[0].quantity).toBe(1);
    expect(gameStore.getState().stocks[0].averageCost).toBe(128);
  });

  it('prevents duplicate mission rewards', () => {
    gameStore.purchaseBusiness('coffee');
    expect(gameStore.claimMissionReward('first-business')).toBe(true);
    expect(gameStore.claimMissionReward('first-business')).toBe(false);
  });

  it('sells owned businesses for a bounded portion of equity', () => {
    gameStore.purchaseBusiness('coffee');
    expect(gameStore.sellBusiness('coffee')).toBe(true);
    expect(gameStore.getState().businesses).toHaveLength(0);
    expect(gameStore.getState().cash).toBeGreaterThan(8500);
  });

  it('supports property purchases and research prerequisites', () => {
    expect(gameStore.purchaseProperty('studio')).toBe(false);
    expect(gameStore.completeResearch('marketing')).toBe(false);
    expect(gameStore.completeResearch('automation')).toBe(true);
  });

  it('applies trade fees without changing the quoted average price', () => {
    expect(gameStore.buyStock('nova', 1)).toBe(true);
    expect(gameStore.getState().stocks[0].averageCost).toBe(128);
    expect(gameStore.getState().cash).toBe(9871);
  });

  it('tracks daily passive profit separately from realized trading profit', () => {
    gameStore.purchaseBusiness('coffee');
    gameStore.processGameTick();
    expect(gameStore.getState().dailyProfit).toBeGreaterThan(0);
    expect(gameStore.getState().realizedProfit).toBe(0);
  });

  it('keeps rental progression separate from business profit', () => {
    gameStore.purchaseBusiness('coffee');
    for (let tick = 0; tick < 400; tick += 1) gameStore.processGameTick();
    gameStore.purchaseProperty('studio');
    gameStore.processGameTick();
    expect(gameStore.getState().totalRentalIncome).toBeGreaterThan(0);
    expect(gameStore.getState().totalProfit).toBeGreaterThanOrEqual(
      gameStore.getState().totalRentalIncome,
    );
  });

  it('protects lifestyle and prestige gates', () => {
    expect(gameStore.purchaseLifestyle('sports-car')).toBe(false);
    expect(gameStore.prestige()).toBe(false);
    expect(gameStore.getState().prestigeCount).toBe(0);
  });

  it('awards a founder tap bonus and prevents instant duplicate taps', () => {
    expect(gameStore.tapToEarn()).toBe(50);
    expect(gameStore.tapToEarn()).toBe(0);
    expect(gameStore.getState().cash).toBe(10050);
    expect(gameStore.getState().tapCount).toBe(1);
    expect(gameStore.getState().transactions[0].label).toBe(
      'Founder tap bonus',
    );
  });

  it('calculates tap upgrades and resets safely', () => {
    expect(gameStore.upgradeTap()).toBe(true);
    expect(gameStore.getState().tapLevel).toBe(2);
    expect(gameStore.getState().tapUpgradeCost).toBe(1850);
    expect(gameStore.tapToEarn()).toBe(65);
    expect(gameStore.reset()).toBe(true);
    expect(gameStore.getState().cash).toBe(10000);
    expect(gameStore.getState().tapLevel).toBe(1);
    expect(gameStore.getState().tapCount).toBe(0);
  });

  it('persists onboarding completion in the save boundary', () => {
    expect(gameStore.completeOnboarding('Saved Founder')).toBe(true);
    expect(gameStore.getState().onboardingComplete).toBe(true);
    expect(gameStore.getState().profile.name).toBe('Saved Founder');
  });

  it('keeps the current run when explicitly saving and loading', () => {
    gameStore.completeOnboarding('Persistent Founder');
    gameStore.purchaseBusiness('coffee');
    const saved = gameStore.getState();
    gameStore.load();
    expect(gameStore.getState().profile.name).toBe(saved.profile.name);
    expect(gameStore.getState().onboardingComplete).toBe(true);
    expect(gameStore.getState().businesses).toHaveLength(1);
    expect(gameStore.getState().cash).toBe(saved.cash);
  });
});
