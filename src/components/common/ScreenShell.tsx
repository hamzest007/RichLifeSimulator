import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { AppIcon } from './AppIcon';
import { selectors, useGameStore } from '../../store/gameStore';
import { formatCurrency } from '../../utils/currency';

const styles = StyleSheet.create({
    scroll: { flex: 1, backgroundColor: colors.bg },
    content: {
        flexGrow: 1,
        padding: 20,
        paddingTop: 24,
        paddingBottom: 120,
        backgroundColor: colors.bg,
    },
    header: { marginBottom: 22 },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 9,
    },
    headerIcon: {
        width: 34,
        height: 34,
        borderRadius: 12,
        backgroundColor: colors.surface2,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    eyebrow: {
        fontSize: 11,
        letterSpacing: 1.7,
        color: colors.gold,
        fontWeight: '700',
    },
    title: {
        fontSize: 30,
        color: colors.text,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    headerState: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 14,
    },
    statePill: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 9,
    },
    stateLabel: {
        fontSize: 9,
        color: colors.muted,
        fontWeight: '800',
        letterSpacing: 0.6,
    },
    stateValue: {
        fontSize: 12,
        color: colors.text,
        fontWeight: '900',
        marginLeft: 'auto',
    },
    activityPill: {
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 42,
        paddingHorizontal: 4,
    },
    activityValue: {
        fontSize: 12,
        color: colors.gold,
        fontWeight: '900',
        marginTop: 2,
    },
    latest: {
        color: colors.muted,
        fontSize: 10,
        fontWeight: '700',
        marginTop: 8,
        letterSpacing: 0.2,
    },
    synced: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 4,
    },
    syncedDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.emerald,
    },
    syncedText: { fontSize: 9, color: colors.emerald, fontWeight: '900' },
    metric: { gap: 6 },
    metricLabel: { fontSize: 11, color: colors.muted },
    metricValue: { fontSize: 18, color: colors.text, fontWeight: '800' },
    positive: { color: colors.emerald, fontWeight: '700' },
    muted: { color: colors.muted, fontSize: 11 },
    sectionHead: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardTitle: { fontSize: 16, color: colors.text, fontWeight: '800' },
    intro: {
        fontSize: 14,
        lineHeight: 21,
        color: colors.muted,
        marginBottom: 18,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    flowRow: { flexDirection: 'row', justifyContent: 'space-between' },
    miniButton: {
        backgroundColor: colors.gold,
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    miniOutline: {
        borderColor: colors.gold,
        borderWidth: 1,
        paddingVertical: 7,
        borderRadius: 8,
        alignItems: 'center',
    },
    miniText: { color: '#18202b', fontWeight: '800', fontSize: 10 },
    disabled: { opacity: 0.4 },
});
export function ScreenScroll({ children }: { children: React.ReactNode }) {
    return (
        <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            {children}
        </ScrollView>
    );
}
function resolveHeaderIcon(title: string, eyebrow: string) {
    const value = `${title} ${eyebrow}`.toLowerCase();
    if (value.includes('market') || value.includes('asset'))
        return 'trending-up-outline';
    if (value.includes('business') || value.includes('empire'))
        return 'business-outline';
    if (value.includes('property') || value.includes('real estate'))
        return 'home-outline';
    if (value.includes('finance') || value.includes('balance'))
        return 'wallet-outline';
    if (value.includes('profile')) return 'person-outline';
    if (value.includes('settings')) return 'settings-outline';
    if (value.includes('progress') || value.includes('mission'))
        return 'trophy-outline';
    if (value.includes('lifestyle')) return 'diamond-outline';
    return 'sparkles-outline';
}
export function Header({
    eyebrow,
    title,
    icon,
}: {
    eyebrow: string;
    title: string;
    icon?: string;
}) {
    const state = useGameStore(s => s);
    const latest = state.transactions[0];
    return (
        <View style={styles.header}>
            <View style={styles.headerTop}>
                <View style={styles.headerIcon}>
                    <AppIcon
                        name={icon ?? resolveHeaderIcon(title, eyebrow)}
                        size={18}
                        color={colors.gold}
                    />
                </View>
                <Text style={styles.eyebrow}>{eyebrow.toUpperCase()}</Text>
            </View>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.headerState}>
                <View style={styles.statePill}>
                    <AppIcon name="wallet-outline" size={14} color={colors.gold} />
                    <Text style={styles.stateLabel}>CASH</Text>
                    <Text style={styles.stateValue}>{formatCurrency(state.cash)}</Text>
                </View>
                <View style={styles.statePill}>
                    <AppIcon name="bar-chart-outline" size={14} color={colors.emerald} />
                    <Text style={styles.stateLabel}>NET WORTH</Text>
                    <Text style={styles.stateValue}>
                        {formatCurrency(selectors.netWorth(state))}
                    </Text>
                </View>
                <View style={styles.activityPill}>
                    <Text style={styles.stateLabel}>ACTIVITY</Text>
                    <Text style={styles.activityValue}>{state.transactions.length}</Text>
                </View>
                <View style={styles.synced}>
                    <View style={styles.syncedDot} />
                    <Text style={styles.syncedText}>LIVE</Text>
                </View>
            </View>
            {latest && (
                <Text numberOfLines={1} style={styles.latest}>
                    LAST · {latest.label}{' '}
                    {latest.amount !== 0
                        ? `· ${latest.amount > 0 ? '+' : ''}${formatCurrency(
                            latest.amount,
                        )}`
                        : ''}
                </Text>
            )}
        </View>
    );
}
export function Metric({
    label,
    value,
    positive,
}: {
    label: string;
    value: string;
    positive?: boolean;
}) {
    return (
        <View style={styles.metric}>
            <Text style={styles.metricLabel}>{label}</Text>
            <Text style={[styles.metricValue, positive && styles.positive]}>
                {value}
            </Text>
        </View>
    );
}
export const screenStyles = styles;
