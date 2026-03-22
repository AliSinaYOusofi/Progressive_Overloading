import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Calendar, ChevronLeft, ChevronRight, AlertCircle, RefreshCw } from "lucide-react-native";
import { useThemedColors } from "../../hooks/useThemedColors";
import { useTheme } from "../../contexts/ThemeContext";
import { useAppStore } from "../../stores/useAppStore";
import { getExerciseSetsByDateRange } from "../../lib/database";

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function getWeekInfo(today, weekOffset) {
    const startOfCurrentWeek = new Date(today);
    startOfCurrentWeek.setDate(today.getDate() - today.getDay());
    startOfCurrentWeek.setHours(0, 0, 0, 0);

    const start = new Date(startOfCurrentWeek);
    start.setDate(start.getDate() + weekOffset * 7);

    const days = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        d.setHours(0, 0, 0, 0);
        days.push(d);
    }

    const end = new Date(days[6]);
    end.setHours(23, 59, 59, 999);

    // Format label: "Mar 10 – 16" or "Mar 28 – Apr 3"
    const startMonth = days[0].toLocaleDateString("en-US", { month: "short" });
    const endMonth = days[6].toLocaleDateString("en-US", { month: "short" });
    const sameMonth = days[0].getMonth() === days[6].getMonth();
    const label = sameMonth
        ? `${startMonth} ${days[0].getDate()} – ${days[6].getDate()}`
        : `${startMonth} ${days[0].getDate()} – ${endMonth} ${days[6].getDate()}`;

    return { days, startDate: days[0], endDate: end, label };
}

function buildWorkoutDayKeys(sets) {
    return new Set(
        (sets || []).filter(s => s.performed_at).map(s => {
            const d = new Date(s.performed_at);
            return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        })
    );
}

export default function WeeklyActivityCard({ recentSets, onDayPress }) {
    const colors = useThemedColors();
    const { isDarkMode } = useTheme();
    const userId = useAppStore(state => state.user?.id);

    const [weekOffset, setWeekOffset] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [fetchedSets, setFetchedSets] = useState(null);
    const cacheRef = useRef({});

    const today = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    const isCurrentWeek = weekOffset === 0;
    const weekInfo = useMemo(() => getWeekInfo(today, weekOffset), [today, weekOffset]);
    const { days: weekDays, startDate, endDate, label: weekLabel } = weekInfo;

    const activeSets = isCurrentWeek ? recentSets : fetchedSets;

    // Fetch past-week data
    useEffect(() => {
        if (isCurrentWeek) {
            setFetchedSets(null);
            setError(null);
            setLoading(false);
            return;
        }
        if (!userId) return;

        const cacheKey = startDate.toISOString().slice(0, 10);

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
            .catch(() => {
                if (cancelled) return;
                setError("Couldn't load this week's data");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, [isCurrentWeek, userId, startDate, endDate]);

    const retry = useCallback(() => {
        const cacheKey = startDate.toISOString().slice(0, 10);
        delete cacheRef.current[cacheKey];
        setLoading(true);
        setError(null);
        setFetchedSets(null);
        getExerciseSetsByDateRange(userId, startDate, endDate)
            .then(data => {
                cacheRef.current[cacheKey] = data;
                setFetchedSets(data);
            })
            .catch(() => setError("Couldn't load this week's data"))
            .finally(() => setLoading(false));
    }, [userId, startDate, endDate]);

    const workoutDayKeys = useMemo(() => buildWorkoutDayKeys(activeSets), [activeSets]);

    const workoutCount = weekDays.filter(d => {
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        return workoutDayKeys.has(key) && d <= today;
    }).length;

    const goBack = () => setWeekOffset(prev => prev - 1);
    const goForward = () => setWeekOffset(prev => Math.min(prev + 1, 0));

    return (
        <View style={{
            backgroundColor: colors.background.card,
            borderRadius: 16,
            padding: 20,
            borderWidth: 1,
            borderColor: colors.border.light,
        }}>
            {/* ── Header ── */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <View style={{
                        width: 36, height: 36, borderRadius: 10,
                        backgroundColor: colors.status.success + "15",
                        alignItems: "center", justifyContent: "center",
                    }}>
                        <Calendar size={20} color={colors.status.success} />
                    </View>
                    <View>
                        <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text.primary }}>
                            {isCurrentWeek ? "This Week" : weekLabel}
                        </Text>
                        {!isCurrentWeek && !loading && !error && (
                            <Text style={{ fontSize: 12, fontWeight: "500", color: colors.text.tertiary, marginTop: 1 }}>
                                {workoutCount}/7 days
                            </Text>
                        )}
                    </View>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    {isCurrentWeek && (
                        <Text style={{ fontSize: 13, fontWeight: "600", color: colors.text.tertiary, marginRight: 8 }}>
                            {workoutCount}/7 days
                        </Text>
                    )}
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
                        disabled={isCurrentWeek || loading}
                        style={{
                            width: 32, height: 32, borderRadius: 10,
                            backgroundColor: isDarkMode ? colors.neutral[200] : colors.neutral[100],
                            alignItems: "center", justifyContent: "center",
                            opacity: (isCurrentWeek || loading) ? 0.3 : 1,
                        }}
                    >
                        <ChevronRight size={18} color={colors.text.secondary} strokeWidth={2.5} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* ── Content: Loading / Error / Days ── */}
            {loading ? (
                <View style={{ alignItems: "center", paddingVertical: 24 }}>
                    <ActivityIndicator size="small" color={colors.primary[600]} />
                    <Text style={{
                        marginTop: 10, fontSize: 13, fontWeight: "500",
                        color: colors.text.tertiary,
                    }}>
                        Loading {weekLabel}...
                    </Text>
                </View>
            ) : error ? (
                <View style={{
                    alignItems: "center", paddingVertical: 24,
                    backgroundColor: `${colors.status.error}${isDarkMode ? '10' : '06'}`,
                    borderRadius: 12,
                }}>
                    <View style={{
                        width: 36, height: 36, borderRadius: 18,
                        backgroundColor: `${colors.status.error}15`,
                        alignItems: "center", justifyContent: "center", marginBottom: 8,
                    }}>
                        <AlertCircle size={18} color={colors.status.error} />
                    </View>
                    <Text style={{
                        fontSize: 13, fontWeight: "600",
                        color: colors.text.primary, marginBottom: 3,
                    }}>
                        {error}
                    </Text>
                    <Text style={{
                        fontSize: 12, color: colors.text.tertiary, marginBottom: 12,
                    }}>
                        Check your connection and try again
                    </Text>
                    <TouchableOpacity
                        onPress={retry}
                        activeOpacity={0.7}
                        style={{
                            flexDirection: "row", alignItems: "center", gap: 5,
                            backgroundColor: colors.status.error,
                            paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8,
                        }}
                    >
                        <RefreshCw size={13} color="#fff" />
                        <Text style={{ fontSize: 12, fontWeight: "600", color: "#fff" }}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    {weekDays.map((day, index) => {
                        const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
                        const hasWorkout = workoutDayKeys.has(key);
                        const isToday = day.getTime() === today.getTime();
                        const isFuture = day > today;
                        const isPast = !isFuture && !isToday;
                        const missed = isPast && !hasWorkout;

                        return (
                            <TouchableOpacity
                                key={index}
                                onPress={() => onDayPress?.(day)}
                                activeOpacity={0.7}
                                style={{
                                    alignItems: "center",
                                    gap: 6,
                                    opacity: isFuture ? 0.35 : 1,
                                }}
                            >
                                <Text style={{
                                    fontSize: 11,
                                    fontWeight: "600",
                                    color: isToday ? colors.primary[600] : colors.text.tertiary,
                                }}>
                                    {DAY_LABELS[index]}
                                </Text>
                                <View style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 20,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: hasWorkout
                                        ? colors.status.success
                                        : missed
                                            ? `${colors.status.error}${isDarkMode ? '18' : '10'}`
                                            : colors.background.primary,
                                    borderWidth: isToday ? 2.5 : (hasWorkout || missed) ? 0 : 1,
                                    borderColor: isToday
                                        ? colors.primary[600]
                                        : colors.border.light,
                                }}>
                                    <Text style={{
                                        fontSize: 14,
                                        fontWeight: "700",
                                        color: hasWorkout
                                            ? "#fff"
                                            : missed
                                                ? colors.status.error
                                                : colors.text.tertiary,
                                    }}>
                                        {day.getDate()}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}
        </View>
    );
}
