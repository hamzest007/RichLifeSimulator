import { GameState } from '../../types/game';
import { calculatePassiveIncomePerTick } from './economyEngine';
import { getBusinessDefinition } from '../businesses/businessData';
import { calculateBusinessExpensesForState } from './economyEngine';
import { PROPERTIES } from '../realEstate/propertyData';

export const calculateIncomePerMinute = (state: GameState) =>
  calculatePassiveIncomePerTick(state);
export const calculateCashFlow = (state: GameState) => {
  const expenses =
    state.businesses.reduce((total, owned) => {
      const definition = getBusinessDefinition(owned.id);
      return (
        total +
        (definition
          ? calculateBusinessExpensesForState(state, definition, owned)
          : 0)
      );
    }, 0) +
    state.properties.reduce(
      (total, owned) =>
        total +
        (PROPERTIES.find(property => property.id === owned.id)
          ?.maintenancePerTick ?? 0),
      0,
    );
  const income = calculateIncomePerMinute(state) + expenses;
  return { income, expenses, net: income - expenses };
};
