import React, { useEffect, useCallback } from "react";
import { View, Text, Modal, TouchableOpacity, ActivityIndicator, Dimensions } from "react-native";
import { Dumbbell, Repeat, Layers, Pencil, Trash2, Calendar } from "lucide-react-native";
import { formatDistanceToNow, format } from "date-fns";
import { useThemedColors } from "../../hooks/useThemedColors";
import ModalCloseButton from "../ModalCloseButton";
import { GestureDetector, Gesture, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

export default function SetDetailsModal({
    visible,
    onClose,
    selectedSet,
    onEdit,
    onDelete,
    isDeleting = false,
    deleteLoadingId = null
}) {
    const colors = useThemedColors();
    const screenHeight = Dimensions.get("window").height;
    const translateY = useSharedValue(0);
    const SWIPE_THRESHOLD = screenHeight * 0.01; // 20% of screen height

    // Define close function in RN Runtime scope (required for scheduleOnRN)
    const handleClose = useCallback(() => {
        onClose();
    }, [onClose]);

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            // Only allow downward swipes (positive translationY)
            if (event.translationY > 0) {
                translateY.value = event.translationY;
            }
        })
        .onEnd((event) => {
            if (event.translationY > SWIPE_THRESHOLD) {
                // Swipe exceeded threshold, animate out then close modal
                translateY.value = withTiming(screenHeight, { duration: 200 }, () => {
                    'worklet';
                    scheduleOnRN(handleClose);
                });
            } else {
                // Snap back to original position
                translateY.value = withTiming(0, { duration: 200 });
            }
        });

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
        };
    });

    // Animated style for drag handle that changes color when swiping
    const dragHandleAnimatedStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            translateY.value,
            [0, 50, 100],
            [colors.border.light, colors.primary[400], colors.primary[600]]
        );
        return {
            backgroundColor,
        };
    });

    // Reset translateY when modal becomes visible
    useEffect(() => {
        if (visible) {
            translateY.value = 0;
        }
    }, [visible, translateY]);

    if (!selectedSet) return null;

    // Get the date from performed_at or created_at
    const setDate = selectedSet.performed_at || selectedSet.created_at;
    const dateObj = setDate ? new Date(setDate) : null;
    const formattedDate = dateObj ? format(dateObj, 'MMM dd, yyyy') : 'Unknown date';
    const dateDifference = dateObj ? formatDistanceToNow(dateObj, { addSuffix: true }) : '';

    return (
        <Modal
            transparent
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
        >
            <GestureHandlerRootView style={{ flex: 1 }}>
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={onClose}
                    style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}
                >
                    <GestureDetector gesture={panGesture}>
                        <Animated.View style={[
                            { 
                                backgroundColor: colors.background.card, 
                                borderTopLeftRadius: 20, 
                                borderTopRightRadius: 20, 
                                padding: 20 
                            },
                            animatedStyle
                        ]}>
                            {/* Drag Handle */}
                            <Animated.View style={[
                                { 
                                    width: 48, 
                                    height: 4, 
                                    borderRadius: 2, 
                                    alignSelf: "center", 
                                    marginTop: 2, 
                                    marginBottom: 16 
                                },
                                dragHandleAnimatedStyle
                            ]} />
                            
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                            <View style={{ backgroundColor: colors.primary[100], padding: 8, borderRadius: 20, marginRight: 12 }}>
                                <Dumbbell size={16} color={colors.primary[600]} />
                            </View>
                            <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text.primary }}>
                                {selectedSet.exercises?.name || "Exercise"}
                            </Text>
                        </View>
                        <ModalCloseButton onPress={onClose} size={18} />
                    </View>
                    
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: colors.background.input, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: colors.border.light }}>
                            <Dumbbell size={18} color={colors.text.tertiary} />
                            <Text style={{ color: colors.text.secondary, fontSize: 14, marginLeft: 6, fontWeight: '500' }}>{selectedSet.weight} {selectedSet.unit}</Text>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: colors.background.input, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: colors.border.light }}>
                            <Repeat size={18} color={colors.text.tertiary} />
                            <Text style={{ color: colors.text.secondary, fontSize: 14, marginLeft: 6, fontWeight: '500' }}>{selectedSet.reps} reps</Text>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: colors.background.input, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: colors.border.light }}>
                            <Layers size={18} color={colors.text.tertiary} />
                            <Text style={{ color: colors.text.secondary, fontSize: 14, marginLeft: 6, fontWeight: '500' }}>{selectedSet.sets} sets</Text>
                        </View>
                    </View>

                    {/* Date Information */}
                    {dateObj && (
                        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: colors.background.input, borderRadius: 12, borderWidth: 1, borderColor: colors.border.light }}>
                            <Calendar size={16} color={colors.text.tertiary} />
                            <View style={{ marginLeft: 8, flex: 1 }}>
                                <Text style={{ color: colors.text.secondary, fontSize: 14, fontWeight: '500' }}>
                                    {formattedDate}
                                </Text>
                                <Text style={{ color: colors.text.tertiary, fontSize: 12, marginTop: 2 }}>
                                    {dateDifference}
                                </Text>
                            </View>
                        </View>
                    )}

                    <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
                        <TouchableOpacity
                            onPress={onEdit}
                            style={{ 
                                flex: 1,
                                flexDirection: "row", 
                                alignItems: "center", 
                                justifyContent: "center",
                                padding: 12, 
                                backgroundColor: colors.background.primary, 
                                borderRadius: 12,
                                borderWidth: 1,
                                borderColor: colors.border.light
                            }}
                        >
                            <Pencil size={18} color={colors.primary[600]} />
                            <Text style={{ marginLeft: 8, color: colors.primary[600], fontWeight: "600" }}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={onDelete}
                            disabled={isDeleting || deleteLoadingId === selectedSet.id}
                            style={{ 
                                flex: 1,
                                flexDirection: "row", 
                                alignItems: "center", 
                                justifyContent: "center",
                                padding: 12, 
                                backgroundColor: colors.status.errorLight, 
                                borderRadius: 12,
                                opacity: (isDeleting || deleteLoadingId === selectedSet.id) ? 0.6 : 1
                            }}
                        >
                            {isDeleting || deleteLoadingId === selectedSet.id ? (
                                <ActivityIndicator size="small" color={colors.status.error} />
                            ) : (
                                <Trash2 size={18} color={colors.status.error} />
                            )}
                            <Text style={{ marginLeft: 8, color: colors.status.error, fontWeight: "600" }}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                        </Animated.View>
                    </GestureDetector>
                </TouchableOpacity>
            </GestureHandlerRootView>
        </Modal>
    );
}
