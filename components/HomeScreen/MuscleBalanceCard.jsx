import React, { useMemo, useState, useCallback, useEffect } from "react";
import { View, Text, Pressable, UIManager, Platform } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolate, Easing, FadeIn, FadeOut, Layout } from "react-native-reanimated";
import { Activity, ChevronDown } from "lucide-react-native";
import { useThemedColors } from "../../hooks/useThemedColors";
import { formatShortNumber } from "../../utils/numberUtils";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const INITIAL_VISIBLE = 5;
const LOAD_MORE_STEP = 10;

const MUSCLE_GRADIENTS = [
    { bar: "#34D399", bg: "#34D39918" },  // emerald
    { bar: "#60A5FA", bg: "#60A5FA18" },  // blue
    { bar: "#FBBF24", bg: "#FBBF2418" },  // amber
    { bar: "#F472B6", bg: "#F472B618" },  // pink
    { bar: "#818CF8", bg: "#818CF818" },  // indigo
    { bar: "#FB923C", bg: "#FB923C18" },  // orange
    { bar: "#2DD4BF", bg: "#2DD4BF18" },  // teal
    { bar: "#E879F9", bg: "#E879F918" },  // fuchsia
    { bar: "#38BDF8", bg: "#38BDF818" },  // sky
    { bar: "#A3E635", bg: "#A3E63518" },  // lime
];

const formatName = (name) => {
    if (!name) return "";
    return name
        .split(" ")
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
};

const TIMING_CONFIG = { duration: 350, easing: Easing.bezier(0.4, 0, 0.2, 1) };

function MuscleRow({ group, index, maxVolume, totalVolume }) {
    const colors = useThemedColors();
    const barWidth = maxVolume > 0
        ? Math.max((group.volume / maxVolume) * 100, 8)
        : 0;
    const palette = MUSCLE_GRADIENTS[index % MUSCLE_GRADIENTS.length];
    const percentage = totalVolume > 0
        ? Math.round((group.volume / totalVolume) * 100)
        : 0;

    return (
        <View style={{ gap: 8 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <View style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: palette.bar,
                    }} />
                    <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text.primary, letterSpacing: -0.2 }}>
                        {formatName(group.muscleGroup)}
                    </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4 }}>
                    <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text.primary }}>
                        {formatShortNumber(Math.round(group.volume))}
                    </Text>
                    <Text style={{ fontSize: 11, fontWeight: "500", color: colors.text.tertiary }}>
                        kg · {percentage}%
                    </Text>
                </View>
            </View>
            <View style={{
                height: 10,
                backgroundColor: palette.bg,
                borderRadius: 5,
                overflow: "hidden",
            }}>
                <View style={{
                    height: "100%",
                    width: `${barWidth}%`,
                    backgroundColor: palette.bar,
                    borderRadius: 5,
                }} />
            </View>
        </View>
    );
}

function ExpandToggle({ expanded, hiddenCount, onPress, colors }) {
    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = withTiming(expanded ? 1 : 0, TIMING_CONFIG);
    }, [expanded]);

    const chevronStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${interpolate(progress.value, [0, 1], [0, 180])}deg` }],
    }));

    const lineStyle = useAnimatedStyle(() => ({
        opacity: interpolate(progress.value, [0, 1], [1, 0.4]),
        transform: [{ scaleX: interpolate(progress.value, [0, 1], [1, 0.6]) }],
    }));

    return (
        <Pressable
            onPress={onPress}
            hitSlop={{ top: 8, bottom: 12, left: 20, right: 20 }}
            style={{
                marginTop: 20,
                alignItems: "center",
                gap: 14,
            }}
        >
            {({ pressed }) => (
                <>
                    {/* Subtle animated divider line */}
                    <Animated.View style={[{
                        height: 1,
                        backgroundColor: colors.border.light,
                        alignSelf: "stretch",
                    }, lineStyle]} />

                    {/* Text + chevron */}
                    <View style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 5,
                        paddingBottom: 2,
                        opacity: pressed ? 0.5 : 1,
                    }}>
                        <Text style={{
                            fontSize: 13,
                            fontWeight: "600",
                            color: colors.text.tertiary,
                            letterSpacing: -0.1,
                        }}>
                            {expanded ? "Show less" : `${hiddenCount} more group${hiddenCount !== 1 ? "s" : ""}`}
                        </Text>
                        <Animated.View style={chevronStyle}>
                            <ChevronDown size={14} color={colors.text.tertiary} strokeWidth={2.5} />
                        </Animated.View>
                    </View>
                </>
            )}
        </Pressable>
    );
}

export default function MuscleBalanceCard({ heatmapData }) {
    const colors = useThemedColors();
    const [expanded, setExpanded] = useState(false);
    const [visibleCount, setVisibleCount] = useState(LOAD_MORE_STEP);

    const allGroups = useMemo(() => {
        if (!Array.isArray(heatmapData) || heatmapData.length === 0) return [];
        return heatmapData.filter(g => g && g.muscleGroup && typeof g.volume === "number" && g.volume > 0);
    }, [heatmapData]);

    const initialGroups = useMemo(() => allGroups.slice(0, INITIAL_VISIBLE), [allGroups]);

    const expandedGroups = useMemo(() => {
        return allGroups.slice(INITIAL_VISIBLE, INITIAL_VISIBLE + visibleCount);
    }, [allGroups, visibleCount]);

    const maxVolume = useMemo(() => {
        if (allGroups.length === 0) return 0;
        return Math.max(...allGroups.map(g => g.volume));
    }, [allGroups]);

    const totalVolume = useMemo(() => {
        return allGroups.reduce((sum, g) => sum + g.volume, 0);
    }, [allGroups]);

    const hiddenCount = allGroups.length - INITIAL_VISIBLE;
    const canExpand = hiddenCount >= 3;
    const totalExpandedAvailable = allGroups.length - INITIAL_VISIBLE;
    const hasMoreToLoad = expanded && (INITIAL_VISIBLE + visibleCount) < allGroups.length;
    const remainingToLoad = allGroups.length - INITIAL_VISIBLE - visibleCount;

    const toggleExpanded = useCallback(() => {
        setExpanded(prev => {
            if (prev) setVisibleCount(LOAD_MORE_STEP);
            return !prev;
        });
    }, []);

    const loadMore = useCallback(() => {
        setVisibleCount(prev => Math.min(prev + LOAD_MORE_STEP, totalExpandedAvailable));
    }, [totalExpandedAvailable]);

    if (allGroups.length === 0) {
        return (
            <View style={{
                backgroundColor: colors.background.card,
                borderRadius: 20,
                padding: 24,
                borderWidth: 1,
                borderColor: colors.border.light,
                alignItems: "center",
                paddingVertical: 36,
            }}>
                <View style={{
                    width: 52,
                    height: 52,
                    borderRadius: 16,
                    backgroundColor: colors.primary[600] + "12",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 14,
                }}>
                    <Activity size={24} color={colors.primary[600]} />
                </View>
                <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text.secondary, marginBottom: 4 }}>
                    No muscle data yet
                </Text>
                <Text style={{ fontSize: 13, color: colors.text.tertiary, textAlign: "center", lineHeight: 18 }}>
                    Log workouts to see your{"\n"}muscle group balance
                </Text>
            </View>
        );
    }

    return (
        <View style={{
            backgroundColor: colors.background.card,
            borderRadius: 20,
            padding: 20,
            borderWidth: 1,
            borderColor: colors.border.light,
        }}>
            {/* Header */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <View style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        backgroundColor: colors.primary[600] + "12",
                        alignItems: "center",
                        justifyContent: "center",
                    }}>
                        <Activity size={18} color={colors.primary[600]} />
                    </View>
                    <View>
                        <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text.primary, letterSpacing: -0.3 }}>
                            Muscle Balance
                        </Text>
                        <Text style={{ fontSize: 11, fontWeight: "500", color: colors.text.tertiary, marginTop: 1 }}>
                            Last 30 days · {allGroups.length} group{allGroups.length !== 1 ? "s" : ""}
                        </Text>
                    </View>
                </View>
                <View style={{
                    backgroundColor: colors.primary[600] + "10",
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 8,
                }}>
                    <Text style={{ fontSize: 12, fontWeight: "700", color: colors.primary[600] }}>
                        {formatShortNumber(Math.round(totalVolume))} kg
                    </Text>
                </View>
            </View>

            {/* Initial bars (always visible) */}
            <View style={{ gap: 14 }}>
                {initialGroups.map((group, index) => (
                    <MuscleRow
                        key={group.muscleGroup}
                        group={group}
                        index={index}
                        maxVolume={maxVolume}
                        totalVolume={totalVolume}
                    />
                ))}
            </View>

            {/* Expanded bars */}
            {expanded && expandedGroups.length > 0 && (
                <Animated.View
                    entering={FadeIn.duration(300).easing(Easing.bezier(0.4, 0, 0.2, 1))}
                    exiting={FadeOut.duration(200).easing(Easing.bezier(0.4, 0, 0.2, 1))}
                    layout={Layout.duration(300).easing(Easing.bezier(0.4, 0, 0.2, 1))}
                    style={{ gap: 14, marginTop: 14 }}
                >
                    {expandedGroups.map((group, index) => (
                        <Animated.View
                            key={group.muscleGroup}
                            entering={FadeIn.delay(index * 40).duration(250)}
                            exiting={FadeOut.duration(150)}
                        >
                            <MuscleRow
                                group={group}
                                index={INITIAL_VISIBLE + index}
                                maxVolume={maxVolume}
                                totalVolume={totalVolume}
                            />
                        </Animated.View>
                    ))}
                </Animated.View>
            )}

            {/* Load More button (inside expanded section) */}
            {hasMoreToLoad && (
                <Animated.View
                    entering={FadeIn.delay(100).duration(250)}
                    exiting={FadeOut.duration(150)}
                >
                    <Pressable
                        onPress={loadMore}
                        style={({ pressed }) => ({
                            marginTop: 16,
                            alignSelf: "center",
                            backgroundColor: pressed ? colors.primary[600] + "18" : colors.primary[600] + "0C",
                            paddingHorizontal: 20,
                            paddingVertical: 9,
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: colors.primary[600] + "20",
                        })}
                    >
                        <Text style={{ fontSize: 13, fontWeight: "600", color: colors.primary[600] }}>
                            Load {Math.min(LOAD_MORE_STEP, remainingToLoad)} more ({remainingToLoad} remaining)
                        </Text>
                    </Pressable>
                </Animated.View>
            )}

            {/* Expand / Collapse toggle (3+ hidden) */}
            {canExpand && (
                <ExpandToggle
                    expanded={expanded}
                    hiddenCount={hiddenCount}
                    onPress={toggleExpanded}
                    colors={colors}
                />
            )}

            {/* If fewer than 3 hidden, just show static count */}
            {hiddenCount > 0 && hiddenCount < 3 && (
                <View style={{
                    marginTop: 18,
                    paddingTop: 16,
                    borderTopWidth: 1,
                    borderTopColor: colors.border.light,
                    alignItems: "center",
                }}>
                    <Text style={{ fontSize: 12, fontWeight: "600", color: colors.text.tertiary }}>
                        +{hiddenCount} more group{hiddenCount !== 1 ? "s" : ""}
                    </Text>
                </View>
            )}
        </View>
    );
}
