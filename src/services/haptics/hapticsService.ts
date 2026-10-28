import { Vibration } from 'react-native';

/** Uses the platform's lightweight vibration fallback when available. */
export const triggerActionFeedback = () => {
  try {
    Vibration.vibrate(10);
  } catch {
    /* Some test/runtime hosts do not expose vibration. */
  }
};
