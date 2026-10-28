import { GameState } from '../../types/game';
import {
  calculateOfflineEarnings,
  MAX_OFFLINE_SECONDS,
} from '../economy/economyEngine';

export const getOfflineProgress = (state: GameState, now: number) => ({
  elapsedSeconds: Math.max(
    0,
    Math.min(
      MAX_OFFLINE_SECONDS,
      Math.floor((now - state.lastProcessedAt) / 1000),
    ),
  ),
  earnings: calculateOfflineEarnings(state, now),
});
