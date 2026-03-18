import { useEffect, useCallback, useRef } from "react";
import { View, Text, Modal, TouchableOpacity, ActivityIndicator, ScrollView, Dimensions, Platform } from "react-native";
import { MODAL_LAYOUT } from "../../constants/modal";
import { Target, CheckCircle2, RotateCcw, Pencil, Trash2, Calendar, Clock, AlertCircle, Flame, TrendingUp } from "lucide-react-native";
import { formatDistanceToNow, format, differenceInDays } from "date-fns";
import { useThemedColors } from "../../hooks/useThemedColors";
import ModalCloseButton from "../ModalCloseButton";
import { GestureDetector, Gesture, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

export default function GoalDetailsModal({
    visible,
    onClose,
    selectedGoal,
    onToggleComplete,
    onEdit,
    onDelete,
    isCompleteLoading = false,
    isDeleteLoading = false,
    completeLoadingId = null,
    deleteLoadingId = null
}) {
    const colors = useThemedColors();
    const { height: screenHeight } = Dimensions.get("window");
    const translateY = useSharedValue(0);
    const SWIPE_THRESHOLD = screenHeight * 0.2;
    const pendingEditGoalRef = useRef(null);

    const handleClose = useCallback(() => {
        onClose();
    }, [onClose]);

    const handleModalDismiss = useCallback(() => {
        if (pendingEditGoalRef.current) {
            const goal = pendingEditGoalRef.current;
            pendingEditGoalRef.current = null;
            onEdit(goal);
        }
    }, [onEdit]);

    const handleEditPress = useCallback((goal) => {
        pendingEditGoalRef.current = goal;
        onClose();
        // onDismiss is iOS-only, so on Android use a timeout fallback
        if (Platform.OS !== 'ios') {
            setTimeout(() => {
                if (pendingEditGoalRef.current) {
                    const g = pendingEditGoalRef.current;
                    pendingEditGoalRef.current = null;
                    onEdit(g);
                }
            }, 350);
        }
    }, [onClose, onEdit]);

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

    if (!selectedGoal) return null;

    const progress = selectedGoal.target_value > 0
        ? (selectedGoal.current_value / selectedGoal.target_value) * 100
        : 0;
    const clampedProgress = Math.min(progress, 100);

    const createdDate = selectedGoal.created_at ? new Date(selectedGoal.created_at) : null;
    const updatedDate = selectedGoal.updated_at ? new Date(selectedGoal.updated_at) : null;
    const completedDate = selectedGoal.completed_at ? new Date(selectedGoal.completed_at) : null;
    const targetDate = selectedGoal.target_date ? new Date(selectedGoal.target_date) : null;

    const formattedCreatedDate = createdDate ? format(createdDate, 'MMM dd, yyyy') : null;
    const createdDateDiff = createdDate ? formatDistanceToNow(createdDate, { addSuffix: true }) : null;

    const formattedUpdatedDate = updatedDate && updatedDate.getTime() !== createdDate?.getTime()
        ? format(updatedDate, 'MMM dd, yyyy')
        : null;
    const updatedDateDiff = updatedDate && updatedDate.getTime() !== createdDate?.getTime()
        ? formatDistanceToNow(updatedDate, { addSuffix: true })
        : null;

    const formattedCompletedDate = completedDate ? format(completedDate, 'MMM dd, yyyy') : null;
    const completedDateDiff = completedDate ? formatDistanceToNow(completedDate, { addSuffix: true }) : null;

    const formattedTargetDate = targetDate ? format(targetDate, 'MMM dd, yyyy') : null;
    const targetDateDiff = targetDate ? formatDistanceToNow(targetDate, { addSuffix: true }) : null;

    const daysUntilTarget = targetDate ? differenceInDays(targetDate, new Date()) : null;

    const getDueDateInfo = (days) => {
        if (days === null) return null;
        if (days < 0) {
            return {
                label: "Overdue",
                text: `${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} overdue`,
                backgroundColor: colors.status.errorLight || colors.background.input,
                borderColor: colors.status.error + '20',
                textColor: colors.status.error,
                iconColor: colors.status.error
            };
        } else if (days === 0) {
            return {
                label: "Due Today",
                text: "Due today",
                backgroundColor: colors.status.warningLight || colors.background.input,
                borderColor: colors.status.warning + '20',
                textColor: colors.status.warning,
                iconColor: colors.status.warning
            };
        } else if (days <= 7) {
            return {
                label: days <= 3 ? "Urgent" : "This Week",
                text: `${days} day${days !== 1 ? 's' : ''} left`,
                backgroundColor: colors.status.warningLight || colors.background.input,
                borderColor: colors.status.warning + '20',
                textColor: colors.status.warning,
                iconColor: colors.status.warning
            };
        } else if (days <= 30) {
            return {
                label: "On Track",
                text: `${days} days left`,
                backgroundColor: colors.background.input,
                borderColor: colors.border.light,
                textColor: colors.text.secondary,
                iconColor: colors.text.tertiary
            };
        } else {
            return {
                label: "Plenty of Time",
                text: `${days} days left`,
                backgroundColor: colors.primary[100] || colors.background.input,
                borderColor: colors.primary[600] + '20',
                textColor: colors.primary[600],
                iconColor: colors.primary[600]
            };
        }
    };

    const dueDateInfo = getDueDateInfo(daysUntilTarget);

    const isCompleted = selectedGoal.is_completed;
    const statusColor = isCompleted ? colors.status.success : colors.primary[600];
    const statusBg = isCompleted
        ? (colors.status.successLight || colors.background.input)
        : (colors.primary[100] || colors.background.input);
    const statusLabel = isCompleted ? "Completed" : (progress >= 75 ? "Almost There" : progress >= 50 ? "Halfway" : "In Progress");

    const dateItems = [];
    if (createdDate) {
        dateItems.push({ icon: Calendar, label: "Started", value: formattedCreatedDate, sub: createdDateDiff, color: colors.text.tertiary });
    }
    if (formattedUpdatedDate) {
        dateItems.push({ icon: Clock, label: "Updated", value: formattedUpdatedDate, sub: updatedDateDiff, color: colors.text.tertiary });
    }
    if (formattedTargetDate) {
        dateItems.push({ icon: Target, label: "Due", value: formattedTargetDate, sub: targetDateDiff, color: colors.text.tertiary });
    }
    if (formattedCompletedDate) {
        dateItems.push({ icon: CheckCircle2, label: "Done", value: formattedCompletedDate, sub: completedDateDiff, color: colors.status.success });
    }

    return (
        <Modal
            transparent
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
            onDismiss={handleModalDismiss}
        >
            <GestureHandlerRootView style={{ flex: 1 }}>
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={onClose}
                    style={{
                        flex: 1,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        justifyContent: "flex-end",
                        paddingHorizontal: MODAL_LAYOUT.horizontalMargin,
                        paddingBottom: MODAL_LAYOUT.bottomPadding
                    }}
                >
                    <GestureDetector gesture={panGesture}>
                        <Animated.View style={[
                            {
                                backgroundColor: colors.background.card,
                                borderRadius: MODAL_LAYOUT.borderRadius,
                                maxHeight: "85%",
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: -4 },
                                shadowOpacity: 0.08,
                                shadowRadius: 16,
                                elevation: 20,
                                overflow: "hidden"
                            },
                            animatedStyle
                        ]}>
                            {/* Drag Handle */}
                            <Animated.View style={[
                                {
                                    width: 36,
                                    height: 4,
                                    borderRadius: 2,
                                    alignSelf: "center",
                                    marginTop: 12,
                                    marginBottom: 4
                                },
                                dragHandleAnimatedStyle
                            ]} />

                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 28 }}
                            >
                                {/* Header: Status + Close */}
                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                                    <View style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        backgroundColor: statusBg,
                                        paddingHorizontal: 12,
                                        paddingVertical: 6,
                                        borderRadius: 100,
                                        gap: 5
                                    }}>
                                        {isCompleted ? (
                                            <CheckCircle2 size={13} color={statusColor} />
                                        ) : (
                                            <Flame size={13} color={statusColor} />
                                        )}
                                        <Text style={{ color: statusColor, fontSize: 12, fontWeight: "700", letterSpacing: 0.3 }}>
                                            {statusLabel}
                                        </Text>
                                    </View>
                                    <ModalCloseButton onPress={onClose} size={18} />
                                </View>

                                {/* Title */}
                                <Text style={{
                                    fontSize: 24,
                                    fontWeight: "800",
                                    color: colors.text.primary,
                                    marginBottom: 4,
                                    letterSpacing: -0.5
                                }}>
                                    {selectedGoal.title}
                                </Text>

                                {/* Description */}
                                {selectedGoal.description && (
                                    <Text style={{
                                        color: colors.text.tertiary,
                                        fontSize: 14,
                                        lineHeight: 20,
                                        marginBottom: 4
                                    }}>
                                        {selectedGoal.description}
                                    </Text>
                                )}

                                {/* Progress Card */}
                                <View style={{
                                    marginTop: 16,
                                    marginBottom: 16,
                                    backgroundColor: colors.background.input,
                                    borderRadius: 20,
                                    padding: 18,
                                    borderWidth: 1,
                                    borderColor: colors.border.light
                                }}>
                                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                                            <TrendingUp size={14} color={colors.text.tertiary} />
                                            <Text style={{ color: colors.text.secondary, fontSize: 13, fontWeight: "600" }}>
                                                Progress
                                            </Text>
                                        </View>
                                        <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                                            <Text style={{ color: colors.text.primary, fontSize: 28, fontWeight: "800", letterSpacing: -1 }}>
                                                {Math.round(progress)}
                                            </Text>
                                            <Text style={{ color: colors.text.tertiary, fontSize: 14, fontWeight: "600", marginLeft: 1 }}>
                                                %
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Progress Bar */}
                                    <View style={{
                                        height: 8,
                                        backgroundColor: colors.border.light,
                                        borderRadius: 4,
                                        overflow: "hidden",
                                        marginBottom: 12
                                    }}>
                                        <View style={{
                                            height: "100%",
                                            width: `${clampedProgress}%`,
                                            backgroundColor: clampedProgress >= 100 ? colors.status.success : colors.primary[600],
                                            borderRadius: 4
                                        }} />
                                    </View>

                                    {/* Current / Target */}
                                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                        <Text style={{ color: colors.text.secondary, fontSize: 14, fontWeight: "600" }}>
                                            {selectedGoal.current_value}
                                            <Text style={{ color: colors.text.tertiary, fontWeight: "400" }}>
                                                {" / "}{selectedGoal.target_value}
                                            </Text>
                                        </Text>
                                        <View style={{
                                            backgroundColor: colors.background.card,
                                            paddingHorizontal: 10,
                                            paddingVertical: 4,
                                            borderRadius: 10
                                        }}>
                                            <Text style={{ color: colors.text.tertiary, fontSize: 12, fontWeight: "600" }}>
                                                {selectedGoal.unit}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Due Date Banner */}
                                {dueDateInfo && !isCompleted && (
                                    <View style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        backgroundColor: dueDateInfo.backgroundColor,
                                        borderRadius: 16,
                                        paddingHorizontal: 14,
                                        paddingVertical: 12,
                                        marginBottom: 16,
                                        borderWidth: 1,
                                        borderColor: dueDateInfo.borderColor,
                                        gap: 10
                                    }}>
                                        <AlertCircle size={18} color={dueDateInfo.iconColor} />
                                        <Text style={{ color: dueDateInfo.textColor, fontSize: 14, fontWeight: "700" }}>
                                            {dueDateInfo.text}
                                        </Text>
                                    </View>
                                )}

                                {!targetDate && !isCompleted && (
                                    <View style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        backgroundColor: colors.background.input,
                                        borderRadius: 16,
                                        paddingHorizontal: 14,
                                        paddingVertical: 12,
                                        marginBottom: 16,
                                        borderWidth: 1,
                                        borderColor: colors.border.light,
                                        gap: 10
                                    }}>
                                        <Calendar size={16} color={colors.text.tertiary} />
                                        <Text style={{ color: colors.text.tertiary, fontSize: 13, fontWeight: "500" }}>
                                            No target date set
                                        </Text>
                                    </View>
                                )}

                                {/* Dates Grid */}
                                {dateItems.length > 0 && (
                                    <View style={{
                                        flexDirection: "row",
                                        flexWrap: "wrap",
                                        gap: 8,
                                        marginBottom: 20
                                    }}>
                                        {dateItems.map((item, index) => {
                                            const Icon = item.icon;
                                            return (
                                                <View key={index} style={{
                                                    flex: 1,
                                                    minWidth: "45%",
                                                    backgroundColor: colors.background.input,
                                                    borderRadius: 16,
                                                    padding: 12,
                                                    borderWidth: 1,
                                                    borderColor: colors.border.light
                                                }}>
                                                    <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 6 }}>
                                                        <Icon size={12} color={item.color} />
                                                        <Text style={{ color: colors.text.tertiary, fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 }}>
                                                            {item.label}
                                                        </Text>
                                                    </View>
                                                    <Text style={{ color: colors.text.primary, fontSize: 13, fontWeight: "600", marginBottom: 1 }}>
                                                        {item.value}
                                                    </Text>
                                                    <Text style={{ color: colors.text.tertiary, fontSize: 11 }}>
                                                        {item.sub}
                                                    </Text>
                                                </View>
                                            );
                                        })}
                                    </View>
                                )}

                                {/* Action Buttons */}
                                <View style={{ flexDirection: "row", gap: 8 }}>
                                    {/* Complete/Reopen */}
                                    <TouchableOpacity
                                        onPress={() => onToggleComplete(selectedGoal)}
                                        disabled={isCompleteLoading || completeLoadingId === selectedGoal.id}
                                        activeOpacity={0.7}
                                        style={{
                                            flex: 1.2,
                                            flexDirection: "row",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            paddingVertical: 14,
                                            backgroundColor: isCompleted ? colors.background.input : colors.primary[600],
                                            borderRadius: 16,
                                            gap: 7,
                                            opacity: (isCompleteLoading || completeLoadingId === selectedGoal.id) ? 0.6 : 1
                                        }}
                                    >
                                        {isCompleteLoading || completeLoadingId === selectedGoal.id ? (
                                            <ActivityIndicator size="small" color={isCompleted ? colors.primary[600] : "#fff"} />
                                        ) : isCompleted ? (
                                            <RotateCcw size={16} color={colors.primary[600]} />
                                        ) : (
                                            <CheckCircle2 size={16} color="#fff" />
                                        )}
                                        <Text style={{
                                            color: isCompleted ? colors.primary[600] : "#fff",
                                            fontWeight: "700",
                                            fontSize: 14
                                        }}>
                                            {isCompleted ? "Reopen" : "Complete"}
                                        </Text>
                                    </TouchableOpacity>

                                    {/* Edit */}
                                    <TouchableOpacity
                                        onPress={() => handleEditPress(selectedGoal)}
                                        disabled={isCompleteLoading || isDeleteLoading || completeLoadingId === selectedGoal.id || deleteLoadingId === selectedGoal.id}
                                        activeOpacity={0.7}
                                        style={{
                                            flex: 0.8,
                                            flexDirection: "row",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            paddingVertical: 14,
                                            backgroundColor: colors.background.input,
                                            borderRadius: 16,
                                            gap: 7,
                                            borderWidth: 1,
                                            borderColor: colors.border.light,
                                            opacity: (isCompleteLoading || isDeleteLoading || completeLoadingId === selectedGoal.id || deleteLoadingId === selectedGoal.id) ? 0.6 : 1
                                        }}
                                    >
                                        <Pencil size={15} color={colors.text.secondary} />
                                        <Text style={{ color: colors.text.secondary, fontWeight: "600", fontSize: 14 }}>
                                            Edit
                                        </Text>
                                    </TouchableOpacity>

                                    {/* Delete */}
                                    <TouchableOpacity
                                        onPress={() => onDelete(selectedGoal.id)}
                                        disabled={isDeleteLoading || deleteLoadingId === selectedGoal.id}
                                        activeOpacity={0.7}
                                        style={{
                                            paddingVertical: 14,
                                            paddingHorizontal: 16,
                                            backgroundColor: colors.status.errorLight || colors.background.input,
                                            borderRadius: 16,
                                            alignItems: "center",
                                            justifyContent: "center",
                                            opacity: (isDeleteLoading || deleteLoadingId === selectedGoal.id) ? 0.6 : 1
                                        }}
                                    >
                                        {isDeleteLoading || deleteLoadingId === selectedGoal.id ? (
                                            <ActivityIndicator size="small" color={colors.status.error} />
                                        ) : (
                                            <Trash2 size={16} color={colors.status.error} />
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        </Animated.View>
                    </GestureDetector>
                </TouchableOpacity>
            </GestureHandlerRootView>
        </Modal>
    );
}
