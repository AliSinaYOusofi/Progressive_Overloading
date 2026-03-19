import React, { useMemo, useState, useCallback, useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolate, Easing, FadeIn, FadeOut } from "react-native-reanimated";
import { Target, Plus, ChevronDown } from "lucide-react-native";
import { useThemedColors } from "../../hooks/useThemedColors";

const INITIAL_VISIBLE = 3;
const LOAD_MORE_STEP = 5;
const TIMING_CONFIG = { duration: 350, easing: Easing.bezier(0.4, 0, 0.2, 1) };

function GoalRow({ goal, onPress, colors }) {
    const progress = goal.target_value > 0
        ? Math.min(Math.max((goal.current_value / goal.target_value) * 100, 0), 100)
        : 0;

    const progressColor = progress >= 100
        ? colors.status.success
        : progress >= 60
            ? colors.primary[600]
            : progress >= 30
                ? colors.status.warning
                : colors.status.error;

    return (
        <Pressable
            onPress={() => onPress?.(goal)}
            style={({ pressed }) => ({
                backgroundColor: colors.background.primary,
                borderRadius: 12,
                padding: 14,
                opacity: pressed ? 0.7 : 1,
            })}
        >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <Text
                    style={{ fontSize: 15, fontWeight: "600", color: colors.text.primary, flex: 1 }}
                    numberOfLines={1}
                >
                    {goal.title || "Untitled Goal"}
                </Text>
                <View style={{
                    backgroundColor: progressColor + "15",
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 8,
                    marginLeft: 8,
                }}>
                    <Text style={{ fontSize: 13, fontWeight: "700", color: progressColor }}>
                        {Math.round(progress)}%
                    </Text>
                </View>
            </View>
            <View style={{
                height: 6,
                backgroundColor: colors.border.light,
                borderRadius: 3,
                overflow: "hidden",
                marginBottom: 8,
            }}>
                <View style={{
                    height: "100%",
                    width: `${progress}%`,
                    backgroundColor: progressColor,
                    borderRadius: 3,
                }} />
            </View>
            <Text style={{ fontSize: 12, color: colors.text.tertiary }}>
                {goal.current_value ?? 0} / {goal.target_value ?? 0} {goal.unit || ""}
            </Text>
        </Pressable>
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
            style={{ marginTop: 20, alignItems: "center", gap: 14 }}
        >
            {({ pressed }) => (
                <>
                    <Animated.View style={[{
                        height: 1,
                        backgroundColor: colors.border.light,
                        alignSelf: "stretch",
                    }, lineStyle]} />

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
                            {expanded ? "Show less" : `${hiddenCount} more goal${hiddenCount !== 1 ? "s" : ""}`}
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

export default function ActiveGoalsCard({ fitnessGoals, onGoalPress, onAddGoal }) {
    const colors = useThemedColors();
    const [expanded, setExpanded] = useState(false);
    const [visibleCount, setVisibleCount] = useState(LOAD_MORE_STEP);

    const activeGoals = useMemo(() => {
        const now = new Date();
        return (fitnessGoals || []).filter(g => {
            if (!g || g.is_completed) return false;
            const targetDate = g.target_date ? new Date(g.target_date) : null;
            if (!targetDate || isNaN(targetDate.getTime())) return false;
            return targetDate >= now;
        });
    }, [fitnessGoals]);

    const initialGoals = useMemo(() => activeGoals.slice(0, INITIAL_VISIBLE), [activeGoals]);

    const expandedGoals = useMemo(() => {
        return activeGoals.slice(INITIAL_VISIBLE, INITIAL_VISIBLE + visibleCount);
    }, [activeGoals, visibleCount]);

    const hiddenCount = activeGoals.length - INITIAL_VISIBLE;
    const canExpand = hiddenCount >= 2;
    const totalExpandedAvailable = activeGoals.length - INITIAL_VISIBLE;
    const hasMoreToLoad = expanded && (INITIAL_VISIBLE + visibleCount) < activeGoals.length;
    const remainingToLoad = activeGoals.length - INITIAL_VISIBLE - visibleCount;

    const toggleExpanded = useCallback(() => {
        setExpanded(prev => {
            if (prev) setVisibleCount(LOAD_MORE_STEP);
            return !prev;
        });
    }, []);

    const loadMore = useCallback(() => {
        setVisibleCount(prev => Math.min(prev + LOAD_MORE_STEP, totalExpandedAvailable));
    }, [totalExpandedAvailable]);

    return (
        <View style={{
            backgroundColor: colors.background.card,
            borderRadius: 20,
            padding: 20,
            borderWidth: 1,
            borderColor: colors.border.light,
        }}>
            {/* Header */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <View style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        backgroundColor: colors.primary[600] + "12",
                        alignItems: "center",
                        justifyContent: "center",
                    }}>
                        <Target size={18} color={colors.primary[600]} />
                    </View>
                    <View>
                        <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text.primary, letterSpacing: -0.3 }}>
                            Active Goals
                        </Text>
                        {activeGoals.length > 0 && (
                            <Text style={{ fontSize: 11, fontWeight: "500", color: colors.text.tertiary, marginTop: 1 }}>
                                {activeGoals.length} goal{activeGoals.length !== 1 ? "s" : ""} in progress
                            </Text>
                        )}
                    </View>
                </View>
                <Pressable
                    onPress={onAddGoal}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={({ pressed }) => ({
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        backgroundColor: colors.primary[600] + "12",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: pressed ? 0.6 : 1,
                    })}
                >
                    <Plus size={18} color={colors.primary[600]} />
                </Pressable>
            </View>

            {/* Empty state */}
            {activeGoals.length === 0 ? (
                <View style={{ alignItems: "center", paddingVertical: 20 }}>
                    <View style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        backgroundColor: colors.primary[600] + "10",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 12,
                    }}>
                        <Target size={22} color={colors.primary[600]} />
                    </View>
                    <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text.secondary, marginBottom: 4 }}>
                        No active goals
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.text.tertiary, textAlign: "center", lineHeight: 18 }}>
                        Set a fitness goal to{"\n"}stay motivated
                    </Text>
                </View>
            ) : (
                <>
                    {/* Initial goals (always visible) */}
                    <View style={{ gap: 10 }}>
                        {initialGoals.map((goal) => (
                            <GoalRow
                                key={goal.id}
                                goal={goal}
                                onPress={onGoalPress}
                                colors={colors}
                            />
                        ))}
                    </View>

                    {/* Expanded goals */}
                    {expanded && expandedGoals.length > 0 && (
                        <Animated.View
                            entering={FadeIn.duration(300).easing(Easing.bezier(0.4, 0, 0.2, 1))}
                            exiting={FadeOut.duration(200).easing(Easing.bezier(0.4, 0, 0.2, 1))}
                            style={{ gap: 10, marginTop: 10 }}
                        >
                            {expandedGoals.map((goal, index) => (
                                <Animated.View
                                    key={goal.id}
                                    entering={FadeIn.delay(index * 50).duration(250)}
                                    exiting={FadeOut.duration(150)}
                                >
                                    <GoalRow
                                        goal={goal}
                                        onPress={onGoalPress}
                                        colors={colors}
                                    />
                                </Animated.View>
                            ))}
                        </Animated.View>
                    )}

                    {/* Load more button */}
                    {hasMoreToLoad && (
                        <Animated.View
                            entering={FadeIn.delay(100).duration(250)}
                            exiting={FadeOut.duration(150)}
                        >
                            <Pressable
                                onPress={loadMore}
                                style={({ pressed }) => ({
                                    marginTop: 14,
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

                    {/* Expand / Collapse toggle (2+ hidden) */}
                    {canExpand && (
                        <ExpandToggle
                            expanded={expanded}
                            hiddenCount={hiddenCount}
                            onPress={toggleExpanded}
                            colors={colors}
                        />
                    )}

                    {/* Static count for 1 hidden goal (not worth expanding) */}
                    {hiddenCount === 1 && (
                        <View style={{
                            marginTop: 18,
                            paddingTop: 14,
                            borderTopWidth: 1,
                            borderTopColor: colors.border.light,
                            alignItems: "center",
                        }}>
                            <Text style={{ fontSize: 12, fontWeight: "600", color: colors.text.tertiary }}>
                                +1 more goal
                            </Text>
                        </View>
                    )}
                </>
            )}
        </View>
    );
}
