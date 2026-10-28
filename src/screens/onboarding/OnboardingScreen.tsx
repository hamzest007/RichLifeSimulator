import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { AppButton } from '../../components/common/AppButton';
import { AppIcon } from '../../components/common/AppIcon';
import { colors } from '../../theme/colors';
import { formatCurrency } from '../../utils/currency';
import { gameStore } from '../../store/gameStore';

const steps = [
  {
    eyebrow: 'WELCOME TO EMPIRE RISE',
    title: 'Build something worth billions.',
    body: 'Start with limited capital, acquire your first business, and turn smart decisions into a lasting financial empire.',
    icon: 'sparkles-outline',
  },
  {
    eyebrow: 'THE FOUNDER LOOP',
    title: 'Operate. Invest. Compound.',
    body: 'Tap for founder bonuses, collect passive income, trade fictional markets, buy property, and unlock the world’s most exclusive assets.',
    icon: 'trending-up-outline',
  },
  {
    eyebrow: 'YOUR PROFILE',
    title: 'Name your empire.',
    body: 'Your founder name appears across your dashboard and is saved locally with your progress.',
    icon: 'person-outline',
  },
];

export function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const current = steps[step];
  const canContinue = step < 2 || name.trim().length >= 2;
  const cta = useMemo(
    () => (step < 2 ? 'Continue' : 'Launch my empire'),
    [step],
  );
  const advance = () => {
    if (!canContinue) return;
    if (step < 2) setStep(value => value + 1);
    else gameStore.completeOnboarding(name);
  };
  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <View style={styles.brand}>
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>E</Text>
            </View>
            <Text style={styles.brandText}>EMPIRE RISE</Text>
          </View>
          <Text style={styles.stepText}>0{step + 1} / 03</Text>
        </View>
        <View style={styles.artCard}>
          <Svg width="100%" height="100%" viewBox="0 0 360 225">
            <Rect width="360" height="225" fill="#10253a" />
            <Circle cx="272" cy="53" r="36" fill="#e7bd68" opacity=".18" />
            <Circle cx="272" cy="53" r="24" fill="#e7bd68" opacity=".16" />
            <Path
              d="M0 190c45-45 86-18 130-42 53-29 97 7 143-25 36-24 65-12 87-2v104H0z"
              fill="#0b1b2b"
            />
            <Path
              d="M40 183V104l55-38 55 38v79M151 183V83l55-59 55 59v100"
              fill="#183a4d"
              stroke="#3e826f"
              strokeWidth="2"
            />
            <Path
              d="M29 106l66-47 66 47M139 84l67-67 68 67"
              fill="none"
              stroke="#e7bd68"
              strokeWidth="4"
            />
            <Rect
              x="70"
              y="130"
              width="25"
              height="53"
              fill="#78b7b6"
              opacity=".8"
            />
            <Rect
              x="182"
              y="113"
              width="33"
              height="31"
              fill="#78b7b6"
              opacity=".8"
            />
            <Rect
              x="226"
              y="113"
              width="33"
              height="31"
              fill="#78b7b6"
              opacity=".8"
            />
            <Path d="M0 193h360" stroke="#45d39c" strokeWidth="3" />
            <Circle cx="304" cy="168" r="4" fill="#45d39c" />
          </Svg>
          <View style={styles.artBadge}>
            <AppIcon name={current.icon} size={16} color={colors.gold} />
            <Text style={styles.artBadgeText}>PRIVATE FOUNDER ACCESS</Text>
          </View>
        </View>
        <Text style={styles.eyebrow}>{current.eyebrow}</Text>
        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.body}>{current.body}</Text>
        {step === 0 && (
          <View style={styles.capitalCard}>
            <View style={styles.capitalIcon}>
              <AppIcon name="wallet-outline" size={22} color={colors.gold} />
            </View>
            <View style={styles.capitalCopy}>
              <Text style={styles.cardLabel}>STARTING CAPITAL</Text>
              <Text style={styles.capitalValue}>{formatCurrency(10000)}</Text>
            </View>
            <Text style={styles.virtual}>VIRTUAL</Text>
          </View>
        )}
        {step === 1 && (
          <View style={styles.featureGrid}>
            <Feature icon="flash-outline" title="Tap to earn" />
            <Feature icon="business-outline" title="Build businesses" />
            <Feature icon="home-outline" title="Own property" />
            <Feature icon="bar-chart-outline" title="Trade markets" />
          </View>
        )}
        {step === 2 && (
          <View style={styles.nameBox}>
            <Text style={styles.cardLabel}>FOUNDER NAME</Text>
            <TextInput
              autoFocus
              value={name}
              onChangeText={setName}
              maxLength={24}
              autoCapitalize="words"
              placeholder="e.g. Alex Morgan"
              placeholderTextColor={colors.muted}
              style={styles.input}
            />
            <Text style={styles.helper}>
              {name.trim().length < 2
                ? 'Use at least 2 characters.'
                : 'This name will be saved to your local empire.'}
            </Text>
          </View>
        )}
        <View style={styles.bottom}>
          <View style={styles.dots}>
            {steps.map((_, index) => (
              <View
                key={index}
                style={[styles.dot, index === step && styles.activeDot]}
              />
            ))}
          </View>
          <AppButton label={cta} onPress={advance} disabled={!canContinue} />
          {step > 0 && (
            <Pressable
              accessibilityRole="button"
              onPress={() => setStep(value => value - 1)}
              style={styles.back}
            >
              <AppIcon
                name="arrow-back-outline"
                size={15}
                color={colors.muted}
              />
              <Text style={styles.backText}>Back</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Feature({ icon, title }: { icon: string; title: string }) {
  return (
    <View style={styles.feature}>
      <View style={styles.featureIcon}>
        <AppIcon name={icon} size={18} color={colors.gold} />
      </View>
      <Text style={styles.featureText}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  container: { flexGrow: 1, padding: 24, paddingTop: 28, paddingBottom: 34 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandMark: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandMarkText: { color: '#18202b', fontSize: 17, fontWeight: '900' },
  brandText: {
    color: colors.text,
    fontSize: 12,
    letterSpacing: 1.5,
    fontWeight: '900',
  },
  stepText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  artCard: {
    height: 225,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 28,
    position: 'relative',
  },
  artBadge: {
    position: 'absolute',
    left: 14,
    bottom: 14,
    flexDirection: 'row',
    gap: 7,
    alignItems: 'center',
    backgroundColor: '#08111fcc',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 9,
  },
  artBadgeText: {
    fontSize: 9,
    letterSpacing: 1,
    color: colors.gold,
    fontWeight: '900',
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: 1.8,
    color: colors.gold,
    fontWeight: '900',
    marginBottom: 10,
  },
  title: {
    fontSize: 35,
    lineHeight: 40,
    color: colors.text,
    fontWeight: '900',
    letterSpacing: -0.8,
    marginBottom: 15,
  },
  body: { fontSize: 16, color: colors.muted, lineHeight: 25, marginBottom: 24 },
  capitalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 26,
  },
  capitalIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  capitalCopy: { flex: 1 },
  cardLabel: {
    fontSize: 10,
    letterSpacing: 1.2,
    color: colors.muted,
    fontWeight: '900',
  },
  capitalValue: {
    fontSize: 22,
    color: colors.text,
    fontWeight: '900',
    marginTop: 4,
  },
  virtual: {
    fontSize: 9,
    color: colors.emerald,
    fontWeight: '900',
    letterSpacing: 1,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 26,
  },
  feature: {
    width: '48%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 13,
  },
  featureIcon: { marginBottom: 10 },
  featureText: { color: colors.text, fontSize: 13, fontWeight: '800' },
  nameBox: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.gold,
    padding: 15,
    marginBottom: 26,
  },
  input: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '800',
    paddingVertical: 10,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
  },
  helper: { color: colors.muted, fontSize: 11, marginTop: 9 },
  bottom: { marginTop: 'auto' },
  dots: { flexDirection: 'row', gap: 7, marginBottom: 17 },
  dot: {
    height: 5,
    width: 22,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  activeDot: { width: 48, backgroundColor: colors.gold },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
  },
  backText: { color: colors.muted, fontWeight: '700', fontSize: 12 },
});
