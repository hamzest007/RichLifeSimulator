import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

interface State {
  error: Error | null;
}
export class ErrorBoundary extends React.Component<
  React.PropsWithChildren,
  State
> {
  state: State = { error: null };
  static getDerivedStateFromError(error: Error): State {
    return { error };
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Empire Rise needs a restart</Text>
        <Text style={styles.body}>
          Your local run is safe. Restart the app and try again.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => this.setState({ error: null })}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Try again</Text>
        </Pressable>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    padding: 28,
  },
  title: {
    color: colors.text,
    fontSize: 25,
    fontWeight: '800',
    marginBottom: 12,
  },
  body: { color: colors.muted, fontSize: 15, lineHeight: 23, marginBottom: 24 },
  button: {
    backgroundColor: colors.gold,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  buttonText: { color: '#18202b', fontWeight: '800' },
});
