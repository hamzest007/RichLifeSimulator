import {View} from 'react-native';

const Animated = {View};
export const useSharedValue = <T,>(value: T) => ({value});
export const useAnimatedStyle = (factory: () => object) => factory();
export const withTiming = <T,>(value: T) => value;
export default Animated;
