import React, { useMemo, useState, useCallback, useEffect } from "react";
import { View, Text, Pressable, Modal, TouchableOpacity, Dimensions } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolate, interpolateColor, Easing, FadeIn, FadeOut } from "react-native-reanimated";
import { GestureDetector, Gesture, GestureHandlerRootView } from "react-native-gesture-handler";
import { scheduleOnRN } from "react-native-worklets";
import { Target, Plus, ChevronDown, Clock, CheckCircle2, Check, Filter } from "lucide-react-native";
import { useThemedColors } from "../../hooks/useThemedColors";
import ModalCloseButton from "../ModalCloseButton";
import { MODAL_LAYOUT } from "../../constants/modal";

const INITIAL_VISIBLE = 3;
const LOAD_MORE_STEP = 5;
const TIMING_CONFIG = { duration: 350, easing: Easing.bezier(0.4, 0, 0.2, 1) };

const FILTER_OPTIONS = [
    { key: "active", label: "Active", icon: Target },
    { key: "completed", label: "Completed", icon: CheckCircle2 },
    { key: "expired", label: "Expired", icon: Clock },
];

function GoalRow({ goal, onPress, colors, variant }) {
    const progress = goal.target_value > 0
        ? Math.min(Math.max((goal.current_value / goal.target_value) * 100, 0), 100)
        : 0;

    const muted = variant === "expired";
    const completed = variant === "completed";

    const progressColor = muted
        ? colors.text.tertiary
        : completed
            ? colors.status.success
            : progress >= 100
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
                opacity: pressed ? 0.7 : muted ? 0.7 : 1,
            })}
        >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <Text
                    style={{ fontSize: 15, fontWeight: "600", color: muted ? colors.text.tertiary : colors.text.primary, flex: 1 }}
                    numberOfLines={1}
                >
                    {goal.title || "Untitled Goal"}
                </Text>
                {completed ? (
                    <View style={{
                        backgroundColor: colors.status.success + "15",
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderRadius: 8,
                        marginLeft: 8,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                    }}>
                        <CheckCircle2 size={12} color={colors.status.success} />
                        <Text style={{ fontSize: 12, fontWeight: "700", color: colors.status.success }}>
                            Done
                        </Text>
                    </View>
                ) : (
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
                )}
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
                    width: `${completed ? 100 : progress}%`,
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

function GoalList({ goals, onGoalPress, colors, variant }) {
    const [expanded, setExpanded] = useState(false);
    const [visibleCount, setVisibleCount] = useState(LOAD_MORE_STEP);

    const initialGoals = useMemo(() => goals.slice(0, INITIAL_VISIBLE), [goals]);
    const expandedGoals = useMemo(() => {
        return goals.slice(INITIAL_VISIBLE, INITIAL_VISIBLE + visibleCount);
    }, [goals, visibleCount]);

    const hiddenCount = goals.length - INITIAL_VISIBLE;
    const canExpand = hiddenCount >= 2;
    const totalExpandedAvailable = goals.length - INITIAL_VISIBLE;
    const hasMoreToLoad = expanded && (INITIAL_VISIBLE + visibleCount) < goals.length;
    const remainingToLoad = goals.length - INITIAL_VISIBLE - visibleCount;

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
        <>
            <View style={{ gap: 10 }}>
                {initialGoals.map((goal) => (
                    <GoalRow
                        key={goal.id}
                        goal={goal}
                        onPress={onGoalPress}
                        colors={colors}
                        variant={variant}
                    />
                ))}
            </View>

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
                                variant={variant}
                            />
                        </Animated.View>
                    ))}
                </Animated.View>
            )}

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

            {canExpand && (
                <ExpandToggle
                    expanded={expanded}
                    hiddenCount={hiddenCount}
                    onPress={toggleExpanded}
                    colors={colors}
                />
            )}

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
    );
}

function GoalFilterModal({ visible, onClose, selected, options, counts, onSelect }) {
    const colors = useThemedColors();
    const screenHeight = Dimensions.get("window").height;
    const translateY = useSharedValue(0);
    const SWIPE_THRESHOLD = screenHeight * 0.2;

    const handleClose = useCallback(() => {
        onClose();
    }, [onClose]);

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            if (event.translationY > 0) {
                translateY.value = event.translationY;
            }
        })
        .onEnd((event) => {
            if (event.translationY > SWIPE_THRESHOLD) {
                translateY.value = withTiming(screenHeight, { duration: 200 }, () => {
                    'worklet';
                    scheduleOnRN(handleClose);
                });
            } else {
                translateY.value = withTiming(0, { duration: 200 });
            }
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    const dragHandleAnimatedStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            translateY.value,
            [0, 50, 100],
            [colors.border.light, colors.primary[400], colors.primary[600]]
        );
        return { backgroundColor };
    });

    useEffect(() => {
        if (visible) {
            translateY.value = 0;
        }
    }, [visible, translateY]);

    const handleOptionSelect = useCallback((key) => {
        onSelect(key);
        onClose();
    }, [onSelect, onClose]);

    return (
        <Modal
            transparent
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
        >
            <GestureHandlerRootView style={{ flex: 1 }}>
                <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)", paddingHorizontal: MODAL_LAYOUT.horizontalMargin, paddingBottom: MODAL_LAYOUT.bottomPadding }}>
                    <TouchableOpacity activeOpacity={1} onPress={onClose} style={{ flex: 1 }} />
                    <GestureDetector gesture={panGesture}>
                        <Animated.View style={[{
                            backgroundColor: colors.background.card,
                            borderRadius: MODAL_LAYOUT.borderRadius,
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: -4 },
                            shadowOpacity: 0.2,
                            shadowRadius: 12,
                            elevation: 20,
                        }, animatedStyle]}>
                            {/* Drag Handle */}
                            <Animated.View style={[{
                                width: 48,
                                height: 4,
                                borderRadius: 2,
                                alignSelf: "center",
                                marginTop: 12,
                                marginBottom: 8,
                            }, dragHandleAnimatedStyle]} />

                            {/* Header */}
                            <View style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                paddingHorizontal: 24,
                                paddingBottom: 16,
                                borderBottomWidth: 1,
                                borderBottomColor: colors.border.light,
                            }}>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                    <Filter size={20} color={colors.text.primary} />
                                    <Text style={{ color: colors.text.primary, fontSize: 20, fontWeight: "bold" }}>
                                        Filter Goals
                                    </Text>
                                </View>
                                <ModalCloseButton onPress={onClose} />
                            </View>

                            {/* Options */}
                            <View style={{ padding: 24, gap: 10 }}>
                                {options.map((option) => {
                                    const Icon = option.icon;
                                    const isSelected = selected === option.key;
                                    const count = counts[option.key] || 0;

                                    return (
                                        <TouchableOpacity
                                            key={option.key}
                                            onPress={() => handleOptionSelect(option.key)}
                                            activeOpacity={0.6}
                                            style={{
                                                flexDirection: "row",
                                                alignItems: "center",
                                                padding: 16,
                                                borderRadius: 14,
                                                backgroundColor: isSelected ? colors.primary[600] + "10" : colors.background.primary,
                                                borderWidth: 1,
                                                borderColor: isSelected ? colors.primary[600] + "30" : colors.border.light,
                                            }}
                                        >
                                            <View style={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: 12,
                                                backgroundColor: isSelected ? colors.primary[600] + "18" : colors.background.card,
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}>
                                                <Icon
                                                    size={20}
                                                    color={isSelected ? colors.primary[600] : colors.text.tertiary}
                                                />
                                            </View>
                                            <View style={{ flex: 1, marginLeft: 14 }}>
                                                <Text style={{
                                                    fontSize: 16,
                                                    fontWeight: isSelected ? "700" : "500",
                                                    color: isSelected ? colors.primary[600] : colors.text.primary,
                                                }}>
                                                    {option.label}
                                                </Text>
                                                <Text style={{ fontSize: 13, color: colors.text.tertiary, marginTop: 2 }}>
                                                    {count} goal{count !== 1 ? "s" : ""}
                                                </Text>
                                            </View>
                                            {isSelected && (
                                                <View style={{
                                                    width: 24,
                                                    height: 24,
                                                    borderRadius: 12,
                                                    backgroundColor: colors.primary[600],
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                }}>
                                                    <Check size={14} color="#FFFFFF" strokeWidth={3} />
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </Animated.View>
                    </GestureDetector>
                </View>
            </GestureHandlerRootView>
        </Modal>
    );
}

const EMPTY_STATES = {
    active: {
        icon: Target,
        title: "No active goals",
        subtitle: "Set a fitness goal to stay motivated",
    },
    completed: {
        icon: CheckCircle2,
        title: "No completed goals",
        subtitle: "Complete a goal to see it here",
    },
    expired: {
        icon: Clock,
        title: "No expired goals",
        subtitle: "Goals that pass their target date appear here",
    },
};

export default function ActiveGoalsCard({ fitnessGoals, onGoalPress, onAddGoal }) {
    const colors = useThemedColors();
    const [filter, setFilter] = useState("active");
    const [showFilterModal, setShowFilterModal] = useState(false);

    const { activeGoals, completedGoals, expiredGoals } = useMemo(() => {
        const now = new Date();
        const active = [];
        const completed = [];
        const expired = [];

        (fitnessGoals || []).forEach(g => {
            if (!g) return;

            if (g.is_completed) {
                completed.push(g);
                return;
            }

            const targetDate = g.target_date ? new Date(g.target_date) : null;
            if (!targetDate || isNaN(targetDate.getTime())) return;

            if (targetDate >= now) {
                active.push(g);
            } else {
                expired.push(g);
            }
        });

        return { activeGoals: active, completedGoals: completed, expiredGoals: expired };
    }, [fitnessGoals]);

    const counts = useMemo(() => ({
        active: activeGoals.length,
        completed: completedGoals.length,
        expired: expiredGoals.length,
    }), [activeGoals.length, completedGoals.length, expiredGoals.length]);

    const totalGoals = activeGoals.length + completedGoals.length + expiredGoals.length;

    const currentGoals = filter === "active"
        ? activeGoals
        : filter === "completed"
            ? completedGoals
            : expiredGoals;

    const showFilterSelector = [activeGoals.length, completedGoals.length, expiredGoals.length].filter(n => n > 0).length > 1
        || (currentGoals.length === 0 && totalGoals > 0);

    const subtitle = useMemo(() => {
        const parts = [];
        if (activeGoals.length > 0) parts.push(`${activeGoals.length} active`);
        if (completedGoals.length > 0) parts.push(`${completedGoals.length} completed`);
        if (expiredGoals.length > 0) parts.push(`${expiredGoals.length} expired`);
        return parts.join(" \u00B7 ");
    }, [activeGoals.length, completedGoals.length, expiredGoals.length]);

    const selectedOption = FILTER_OPTIONS.find(o => o.key === filter);
    const SelectedIcon = selectedOption?.icon || Target;

    const emptyState = EMPTY_STATES[filter];
    const EmptyIcon = emptyState.icon;
    const emptyIconColor = filter === "expired" ? colors.text.tertiary
        : filter === "completed" ? colors.status.success
        : colors.primary[600];

    return (
        <View style={{
            backgroundColor: colors.background.card,
            borderRadius: 20,
            padding: 20,
            borderWidth: 1,
            borderColor: colors.border.light,
        }}>
            {/* Filter selector at top */}
            {showFilterSelector && (
                <Pressable
                    onPress={() => setShowFilterModal(true)}
                    style={({ pressed }) => ({
                        backgroundColor: colors.background.primary,
                        borderRadius: 12,
                        paddingHorizontal: 14,
                        paddingVertical: 11,
                        marginBottom: 14,
                        borderWidth: 1,
                        borderColor: colors.border.light,
                        opacity: pressed ? 0.7 : 1,
                    })}
                >
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 }}>
                            <View style={{
                                width: 30,
                                height: 30,
                                borderRadius: 8,
                                backgroundColor: colors.primary[600] + "12",
                                alignItems: "center",
                                justifyContent: "center",
                            }}>
                                <SelectedIcon size={15} color={colors.primary[600]} />
                            </View>
                            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text.primary }}>
                                {selectedOption?.label}
                            </Text>
                            <View style={{
                                backgroundColor: colors.primary[600] + "15",
                                paddingHorizontal: 7,
                                paddingVertical: 2,
                                borderRadius: 6,
                            }}>
                                <Text style={{ fontSize: 11, fontWeight: "700", color: colors.primary[600] }}>
                                    {counts[filter] || 0}
                                </Text>
                            </View>
                        </View>
                        <ChevronDown size={16} color={colors.text.tertiary} />
                    </View>
                </Pressable>
            )}

            {/* Header */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: showFilterSelector ? 2 : 0, borderTopWidth: showFilterSelector ? 1 : 0, borderTopColor: colors.border.light, marginBottom: 18 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1, marginTop: 10 }}>
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
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text.primary, letterSpacing: -0.3 }}>
                            Goals
                        </Text>
                        {subtitle.length > 0 && (
                            <Text style={{ fontSize: 11, fontWeight: "500", color: colors.text.tertiary, marginTop: 1 }}>
                                {subtitle}
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

            {/* Goal list or empty state */}
            {currentGoals.length === 0 ? (
                <View style={{ alignItems: "center", paddingVertical: 20 }}>
                    <View style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        backgroundColor: emptyIconColor + "15",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 12,
                    }}>
                        <EmptyIcon size={24} color={emptyIconColor} />
                    </View>
                    <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text.secondary, marginBottom: 4 }}>
                        {emptyState.title}
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.text.tertiary, textAlign: "center", lineHeight: 18 }}>
                        {emptyState.subtitle}
                    </Text>
                </View>
            ) : (
                <GoalList
                    key={filter}
                    goals={currentGoals}
                    onGoalPress={onGoalPress}
                    colors={colors}
                    variant={filter}
                />
            )}

            <GoalFilterModal
                visible={showFilterModal}
                onClose={() => setShowFilterModal(false)}
                selected={filter}
                options={FILTER_OPTIONS}
                counts={counts}
                onSelect={setFilter}
            />
        </View>
    );
}
