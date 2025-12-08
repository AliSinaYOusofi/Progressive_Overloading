import React from "react";
import { View, Text, Modal, TouchableOpacity, ActivityIndicator } from "react-native";
import { Target, CheckCircle2, RotateCcw, Pencil, Trash2 } from "lucide-react-native";
import { useThemedColors } from "../../hooks/useThemedColors";
import ModalCloseButton from "../ModalCloseButton";

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
    if (!selectedGoal) return null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                activeOpacity={1}
                onPress={onClose}
                style={{
                    flex: 1,
                    backgroundColor: "rgba(0,0,0,0.4)",
                    justifyContent: "flex-end",
                }}
            >
                <View
                    style={{
                        backgroundColor: colors.background.primary,
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        padding: 20,
                    }}
                >
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <Text
                            style={{
                                fontSize: 18,
                                fontWeight: "700",
                                color: colors.text.primary,
                                flex: 1,
                            }}
                        >
                            {selectedGoal.title}
                        </Text>
                        <ModalCloseButton onPress={onClose} size={18} />
                    </View>
                    
                    {selectedGoal.description ? (
                        <Text
                            style={{
                                color: colors.text.secondary,
                                marginBottom: 8,
                            }}
                        >
                            {selectedGoal.description}
                        </Text>
                    ) : null}
                    
                    <Text
                        style={{
                            color: colors.text.secondary,
                            marginBottom: 4,
                        }}
                    >
                        Progress: {selectedGoal.current_value} /{" "}
                        {selectedGoal.target_value}{" "}
                        {selectedGoal.unit}
                    </Text>
                    
                    {selectedGoal.target_date ? (
                        <Text
                            style={{
                                color: colors.text.tertiary,
                                marginBottom: 4,
                            }}
                        >
                            Target date: {selectedGoal.target_date}
                        </Text>
                    ) : null}
                    
                    <Text
                        style={{
                            color: colors.text.tertiary,
                            marginBottom: 4,
                            fontSize: 12,
                        }}
                    >
                        Created: {new Date(selectedGoal.created_at).toLocaleDateString()}
                    </Text>
                    
                    {selectedGoal.updated_at && selectedGoal.updated_at !== selectedGoal.created_at ? (
                        <Text
                            style={{
                                color: colors.text.tertiary,
                                marginBottom: 4,
                                fontSize: 12,
                            }}
                        >
                            Last updated: {new Date(selectedGoal.updated_at).toLocaleDateString()}
                        </Text>
                    ) : null}
                    
                    {selectedGoal.completed_at ? (
                        <Text
                            style={{
                                color: colors.status.success,
                                marginBottom: 12,
                                fontSize: 12,
                                fontWeight: '600',
                            }}
                        >
                            Completed: {new Date(selectedGoal.completed_at).toLocaleDateString()}
                        </Text>
                    ) : null}

                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            marginTop: 12,
                        }}
                    >
                        <TouchableOpacity
                            onPress={() => onToggleComplete(selectedGoal)}
                            disabled={isCompleteLoading || completeLoadingId === selectedGoal.id}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                padding: 12,
                                backgroundColor: colors.background.card,
                                borderRadius: 12,
                            }}
                        >
                            {isCompleteLoading || completeLoadingId === selectedGoal.id ? (
                                <ActivityIndicator
                                    size="small"
                                    color={colors.primary[600]}
                                />
                            ) : selectedGoal.is_completed ? (
                                <RotateCcw
                                    size={18}
                                    color={colors.primary[600]}
                                />
                            ) : (
                                <CheckCircle2
                                    size={18}
                                    color={colors.primary[600]}
                                />
                            )}
                            <Text
                                style={{
                                    marginLeft: 8,
                                    color: colors.primary[600],
                                    fontWeight: "600",
                                }}
                            >
                                {selectedGoal.is_completed ? "Reopen" : "Complete"}
                            </Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            onPress={() => onEdit(selectedGoal)}
                            disabled={isCompleteLoading || isDeleteLoading || completeLoadingId === selectedGoal.id || deleteLoadingId === selectedGoal.id}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                padding: 12,
                                backgroundColor: colors.background.card,
                                borderRadius: 12,
                            }}
                        >
                            <Pencil
                                size={18}
                                color={(isCompleteLoading || isDeleteLoading || completeLoadingId === selectedGoal.id || deleteLoadingId === selectedGoal.id) ? colors.text.tertiary : colors.text.secondary}
                            />
                            <Text
                                style={{
                                    marginLeft: 8,
                                    color: (isCompleteLoading || isDeleteLoading || completeLoadingId === selectedGoal.id || deleteLoadingId === selectedGoal.id) ? colors.text.tertiary : colors.text.secondary,
                                    fontWeight: "600",
                                }}
                            >
                                Edit
                            </Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            onPress={() => onDelete(selectedGoal.id)}
                            disabled={isDeleteLoading || deleteLoadingId === selectedGoal.id}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                padding: 12,
                                backgroundColor: colors.background.card,
                                borderRadius: 12,
                            }}
                        >
                            {isDeleteLoading || deleteLoadingId === selectedGoal.id ? (
                                <ActivityIndicator
                                    size="small"
                                    color={colors.status.error}
                                />
                            ) : (
                                <Trash2
                                    size={18}
                                    color={colors.status.error}
                                />
                            )}
                            <Text
                                style={{
                                    marginLeft: 8,
                                    color: colors.status.error,
                                    fontWeight: "600",
                                }}
                            >
                                Delete
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>
    );
}
