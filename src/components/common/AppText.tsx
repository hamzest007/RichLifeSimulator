import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextProps,
  TextStyle,
} from 'react-native';
import { colors } from '../../theme/colors';

export function AppText({
  children,
  style,
  ...props
}: TextProps & { children?: React.ReactNode; style?: StyleProp<TextStyle> }) {
  return (
    <Text {...props} style={[styles.text, style]}>
      {children}
    </Text>
  );
}
export const styles = StyleSheet.create({
  text: { color: colors.text, fontSize: 14 },
});
