import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { triggerActionFeedback } from '../../services/haptics/hapticsService';

export function AppButton({
  label,
  onPress,
  disabled,
  outline,
  style,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  outline?: boolean;
  style?: ViewStyle;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={() => {
        triggerActionFeedback();
        onPress();
      }}
      style={[
        styles.button,
        outline && styles.outline,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.label, outline && styles.outlineLabel]}>
        {label}
      </Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.gold,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: colors.gold,
    borderWidth: 1,
  },
  disabled: { opacity: 0.4 },
  label: { color: '#18202b', fontWeight: '800', fontSize: 12 },
  outlineLabel: { color: colors.gold },
});
