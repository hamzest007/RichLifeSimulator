import { GameState } from '../../types/game';
import {
  calculateNetWorth,
  calculateTotalAssets,
  calculateTotalLiabilities,
} from './economyEngine';

export const getBalanceSheet = (state: GameState) => ({
  assets: calculateTotalAssets(state),
  liabilities: calculateTotalLiabilities(state),
  netWorth: calculateNetWorth(state),
});
