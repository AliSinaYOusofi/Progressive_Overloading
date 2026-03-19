import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import {
    CalendarDays, ChevronLeft, ChevronRight,
    Dumbbell, Flame, BarChart3, AlertCircle, RefreshCw
} from "lucide-react-native";
import { useThemedColors } from "../../hooks/useThemedColors";
import { useTheme } from "../../contexts/ThemeContext";
import { useAppStore } from "../../stores/useAppStore";
import { formatShortNumber } from "../../utils/numberUtils";
import { getExerciseSetsByDateRange } from "../../lib/database";

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

// ─── helpers ────────────────────────────────────────────────────────
function getMonthInfo(baseDate, offset) {
    const d = new Date(baseDate.getFullYear(), baseDate.getMonth() + offset, 1);
    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    return {
        year: d.getFullYear(),
        month: d.getMonth(),
        monthName: d.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        daysInMonth: lastDay.getDate(),
        firstDayOfWeek: d.getDay(),
        startDate: d,
        endDate: lastDay,
    };
}

function buildWorkoutDayKeys(sets) {
    return new Set(
        (sets || []).filter(s => s.performed_at).map(s => {
            const d = new Date(s.performed_at);
            return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        })
    );
}

function computeInsights(sets, year, month, daysInMonth, today) {
    const monthSets = (sets || []).filter(s => {
        if (!s.performed_at) return false;
        const d = new Date(s.performed_at);
        return d.getFullYear() === year && d.getMonth() === month;
    });

    const dayKeys = new Set(monthSets.map(s => new Date(s.performed_at).getDate()));
    const workoutDayCount = dayKeys.size;
    const totalVolume = monthSets.reduce(
        (sum, s) => sum + (s.weight || 0) * (s.reps || 0) * (s.sets || 1), 0
    );

    const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
    const elapsedDays = isCurrentMonth ? today.getDate() : daysInMonth;
    const consistency = elapsedDays > 0 ? Math.round((workoutDayCount / elapsedDays) * 100) : 0;

    let bestStreak = 0;
    let streak = 0;
    const maxDay = isCurrentMonth ? today.getDate() : daysInMonth;
    for (let d = 1; d <= maxDay; d++) {
        if (dayKeys.has(d)) {
            streak++;
            if (streak > bestStreak) bestStreak = streak;
        } else {
            streak = 0;
        }
    }

    return { workoutDayCount, totalVolume, consistency, bestStreak };
}

// ─── component ──────────────────────────────────────────────────────
export default function MonthlyActivityCard({ recentSets, onDayPress }) {
    const colors = useThemedColors();
    const { isDarkMode } = useTheme();
    const userId = useAppStore(state => state.user?.id);

    const [monthOffset, setMonthOffset] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Cache fetched months: key "YYYY-MM" → sets[]
    const cacheRef = useRef({});

    // Past-month sets (null when using recentSets for current month)
    const [fetchedSets, setFetchedSets] = useState(null);

    const today = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    const isCurrentMonth = monthOffset === 0;
    const monthInfo = useMemo(() => getMonthInfo(today, monthOffset), [monthOffset, today]);
    const { year, month, monthName, daysInMonth, firstDayOfWeek, startDate, endDate } = monthInfo;

    // The sets to use for the displayed month
    const activeSets = isCurrentMonth ? recentSets : fetchedSets;

    // Fetch past-month data
    useEffect(() => {
        if (isCurrentMonth) {
            setFetchedSets(null);
            setError(null);
            setLoading(false);
            return;
        }
        if (!userId) return;

        const cacheKey = `${year}-${month}`;

        if (cacheRef.current[cacheKey]) {
            setFetchedSets(cacheRef.current[cacheKey]);
            setError(null);
            setLoading(false);
            return;
        }

        let cancelled = false;
        setLoading(true);
        setError(null);
        setFetchedSets(null);

        getExerciseSetsByDateRange(userId, startDate, endDate)
            .then(data => {
                if (cancelled) return;
                cacheRef.current[cacheKey] = data;
                setFetchedSets(data);
            })
            .catch(err => {
                if (cancelled) return;
                setError("Couldn't load this month's data");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, [isCurrentMonth, userId, year, month, startDate, endDate]);

    const retry = useCallback(() => {
        const cacheKey = `${year}-${month}`;
        delete cacheRef.current[cacheKey];
        // re-trigger by bumping offset back and forth (force effect re-run)
        setMonthOffset(prev => prev); // no-op, so instead:
        setLoading(true);
        setError(null);
        setFetchedSets(null);
        getExerciseSetsByDateRange(userId, startDate, endDate)
            .then(data => {
                cacheRef.current[cacheKey] = data;
                setFetchedSets(data);
            })
            .catch(() => setError("Couldn't load this month's data"))
            .finally(() => setLoading(false));
    }, [userId, year, month, startDate, endDate]);

    // Derived data
    const workoutDayKeys = useMemo(() => buildWorkoutDayKeys(activeSets), [activeSets]);
    const insights = useMemo(
        () => computeInsights(activeSets, year, month, daysInMonth, today),
        [activeSets, year, month, daysInMonth, today]
    );

    const calendarCells = useMemo(() => {
        const cells = [];
        for (let i = 0; i < firstDayOfWeek; i++) {
            cells.push({ empty: true, key: `es-${i}` });
        }
        for (let d = 1; d <= daysInMonth; d++) {
            const dateKey = `${year}-${month}-${d}`;
            const hasWorkout = workoutDayKeys.has(dateKey);
            const dateObj = new Date(year, month, d);
            dateObj.setHours(0, 0, 0, 0);
            const isToday = dateObj.getTime() === today.getTime();
            const isFuture = dateObj > today;
            cells.push({ empty: false, day: d, hasWorkout, isToday, isFuture, dateObj, key: `d-${d}` });
        }
        const remainder = cells.length % 7;
        if (remainder > 0) {
            for (let i = 0; i < 7 - remainder; i++) {
                cells.push({ empty: true, key: `ee-${i}` });
            }
        }
        return cells;
    }, [firstDayOfWeek, daysInMonth, year, month, workoutDayKeys, today]);

    const rows = useMemo(() => {
        const r = [];
        for (let i = 0; i < calendarCells.length; i += 7) r.push(calendarCells.slice(i, i + 7));
        return r;
    }, [calendarCells]);

    // Navigation handlers
    const goBack = () => { setMonthOffset(prev => prev - 1); };
    const goForward = () => { setMonthOffset(prev => Math.min(prev + 1, 0)); };

    return (
        <View style={{
            backgroundColor: colors.background.card,
            borderRadius: 16,
            padding: 20,
            borderWidth: 1,
            borderColor: colors.border.light,
        }}>
            {/* ── Header ── */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <View style={{
                        width: 36, height: 36, borderRadius: 10,
                        backgroundColor: `${colors.primary[600]}15`,
                        alignItems: "center", justifyContent: "center",
                    }}>
                        <CalendarDays size={20} color={colors.primary[600]} />
                    </View>
                    <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text.primary }}>
                        {monthName}
                    </Text>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <TouchableOpacity
                        onPress={goBack}
                        activeOpacity={0.6}
                        disabled={loading}
                        style={{
                            width: 32, height: 32, borderRadius: 10,
                            backgroundColor: isDarkMode ? colors.neutral[200] : colors.neutral[100],
                            alignItems: "center", justifyContent: "center",
                            opacity: loading ? 0.4 : 1,
                        }}
                    >
                        <ChevronLeft size={18} color={colors.text.secondary} strokeWidth={2.5} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={goForward}
                        activeOpacity={0.6}
                        disabled={isCurrentMonth || loading}
                        style={{
                            width: 32, height: 32, borderRadius: 10,
                            backgroundColor: isDarkMode ? colors.neutral[200] : colors.neutral[100],
                            alignItems: "center", justifyContent: "center",
                            opacity: (isCurrentMonth || loading) ? 0.3 : 1,
                        }}
                    >
                        <ChevronRight size={18} color={colors.text.secondary} strokeWidth={2.5} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* ── Content: Loading / Error / Calendar ── */}
            {loading ? (
                <View style={{ alignItems: "center", paddingVertical: 48 }}>
                    <ActivityIndicator size="small" color={colors.primary[600]} />
                    <Text style={{
                        marginTop: 12, fontSize: 13, fontWeight: "500",
                        color: colors.text.tertiary,
                    }}>
                        Loading {monthName}...
                    </Text>
                </View>
            ) : error ? (
                <View style={{
                    alignItems: "center", paddingVertical: 36,
                    backgroundColor: `${colors.status.error}${isDarkMode ? '10' : '06'}`,
                    borderRadius: 12, marginBottom: 4,
                }}>
                    <View style={{
                        width: 40, height: 40, borderRadius: 20,
                        backgroundColor: `${colors.status.error}15`,
                        alignItems: "center", justifyContent: "center", marginBottom: 10,
                    }}>
                        <AlertCircle size={20} color={colors.status.error} />
                    </View>
                    <Text style={{
                        fontSize: 14, fontWeight: "600",
                        color: colors.text.primary, marginBottom: 4,
                    }}>
                        {error}
                    </Text>
                    <Text style={{
                        fontSize: 12, color: colors.text.tertiary, marginBottom: 14,
                    }}>
                        Check your connection and try again
                    </Text>
                    <TouchableOpacity
                        onPress={retry}
                        activeOpacity={0.7}
                        style={{
                            flexDirection: "row", alignItems: "center", gap: 6,
                            backgroundColor: colors.status.error,
                            paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10,
                        }}
                    >
                        <RefreshCw size={14} color="#fff" />
                        <Text style={{ fontSize: 13, fontWeight: "600", color: "#fff" }}>
                            Retry
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    {/* ── Insights strip ── */}
                    <View style={{ flexDirection: "row", gap: 8, marginBottom: 18 }}>
                        <InsightPill
                            icon={Flame}
                            value={`${insights.workoutDayCount}`}
                            label="days"
                            color={colors.status.success}
                            colors={colors}
                        />
                        <InsightPill
                            icon={Dumbbell}
                            value={formatShortNumber(insights.totalVolume)}
                            label="volume"
                            color={colors.status.info}
                            colors={colors}
                        />
                        <InsightPill
                            icon={BarChart3}
                            value={`${insights.consistency}%`}
                            label="consistency"
                            color={colors.primary[600]}
                            colors={colors}
                        />
                    </View>

                    {/* ── Day-of-week headers ── */}
                    <View style={{ flexDirection: "row", marginBottom: 8 }}>
                        {DAY_LABELS.map((label, i) => (
                            <View key={i} style={{ flex: 1, alignItems: "center" }}>
                                <Text style={{ fontSize: 11, fontWeight: "600", color: colors.text.tertiary }}>
                                    {label}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* ── Calendar grid ── */}
                    <View style={{ gap: 6 }}>
                        {rows.map((row, ri) => (
                            <View key={ri} style={{ flexDirection: "row" }}>
                                {row.map(cell => {
                                    if (cell.empty) {
                                        return <View key={cell.key} style={{ flex: 1, aspectRatio: 1 }} />;
                                    }
                                    return (
                                        <TouchableOpacity
                                            key={cell.key}
                                            onPress={() => onDayPress?.(cell.dateObj)}
                                            activeOpacity={0.7}
                                            disabled={cell.isFuture}
                                            style={{
                                                flex: 1, aspectRatio: 1,
                                                alignItems: "center", justifyContent: "center",
                                                opacity: cell.isFuture ? 0.3 : 1,
                                            }}
                                        >
                                            {(() => {
                                                const isPast = !cell.isFuture && !cell.isToday;
                                                const missed = isPast && !cell.hasWorkout;
                                                return (
                                                    <View style={{
                                                        width: 36, height: 36, borderRadius: 18,
                                                        alignItems: "center", justifyContent: "center",
                                                        backgroundColor: cell.hasWorkout
                                                            ? colors.status.success
                                                            : missed
                                                                ? `${colors.status.error}${isDarkMode ? '18' : '10'}`
                                                                : colors.background.primary,
                                                        borderWidth: cell.isToday ? 2.5 : (cell.hasWorkout || missed) ? 0 : 1,
                                                        borderColor: cell.isToday
                                                            ? colors.primary[600]
                                                            : colors.border.light,
                                                    }}>
                                                        <Text style={{
                                                            fontSize: 13, fontWeight: "700",
                                                            color: cell.hasWorkout
                                                                ? "#fff"
                                                                : missed
                                                                    ? colors.status.error
                                                                    : colors.text.tertiary,
                                                        }}>
                                                            {cell.day}
                                                        </Text>
                                                    </View>
                                                );
                                            })()}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        ))}
                    </View>

                    {/* ── Best streak bar ── */}
                    {insights.bestStreak > 0 && (
                        <View style={{
                            marginTop: 16,
                            flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
                            backgroundColor: `${colors.status.success}${isDarkMode ? '15' : '0A'}`,
                            borderWidth: 1,
                            borderColor: `${colors.status.success}${isDarkMode ? '25' : '15'}`,
                            borderRadius: 10,
                            paddingVertical: 8, paddingHorizontal: 14,
                        }}>
                            <Flame size={14} color={colors.status.success} />
                            <Text style={{ fontSize: 13, fontWeight: "600", color: colors.status.success }}>
                                Best streak this month: {insights.bestStreak} {insights.bestStreak === 1 ? "day" : "days"}
                            </Text>
                        </View>
                    )}
                </>
            )}
        </View>
    );
}

// ─── sub-components ─────────────────────────────────────────────────
function InsightPill({ icon: Icon, value, label, color, colors }) {
    return (
        <View style={{
            flex: 1, flexDirection: "row", alignItems: "center", gap: 6,
            backgroundColor: colors.background.primary,
            borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10,
            borderWidth: 1, borderColor: colors.border.light,
        }}>
            <Icon size={13} color={color} strokeWidth={2.5} />
            <View>
                <Text style={{ fontSize: 14, fontWeight: "700", color: colors.text.primary, lineHeight: 16 }}>
                    {value}
                </Text>
                <Text style={{ fontSize: 10, fontWeight: "500", color: colors.text.tertiary, lineHeight: 13 }}>
                    {label}
                </Text>
            </View>
        </View>
    );
}
