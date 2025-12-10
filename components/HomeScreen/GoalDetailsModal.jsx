import React from "react";
import { View, Text, Modal, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { Target, CheckCircle2, RotateCcw, Pencil, Trash2, Calendar, TrendingUp, Clock } from "lucide-react-native";
import { formatDistanceToNow, format } from "date-fns";
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

    // Calculate progress
    const progress = selectedGoal.target_value > 0 
        ? (selectedGoal.current_value / selectedGoal.target_value) * 100 
        : 0;

    // Format dates with date-fns
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
                style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}
            >
                <View style={{ 
                    backgroundColor: colors.background.card, 
                    borderTopLeftRadius: 24, 
                    borderTopRightRadius: 24,
                    maxHeight: "85%",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 12,
                    elevation: 20
                }}>
                    <ScrollView 
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ padding: 24 }}
                    >
                        {/* Header */}
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                                <View style={{ backgroundColor: colors.primary[100], padding: 10, borderRadius: 20, marginRight: 12 }}>
                                    <Target size={18} color={colors.primary[600]} />
                                </View>
                                <Text style={{ fontSize: 20, fontWeight: "700", color: colors.text.primary, flex: 1 }}>
                                    {selectedGoal.title}
                                </Text>
                            </View>
                            <ModalCloseButton onPress={onClose} size={18} />
                        </View>

                        {/* Description */}
                        {selectedGoal.description && (
                            <View style={{ 
                                backgroundColor: colors.background.input, 
                                padding: 12, 
                                borderRadius: 12, 
                                marginBottom: 16,
                                borderWidth: 1,
                                borderColor: colors.border.light
                            }}>
                                <Text style={{ color: colors.text.secondary, fontSize: 14, lineHeight: 20 }}>
                                    {selectedGoal.description}
                                </Text>
                            </View>
                        )}

                        {/* Progress Section */}
                        <View style={{ marginBottom: 20 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                    <TrendingUp size={18} color={colors.text.secondary} />
                                    <Text style={{ color: colors.text.secondary, fontSize: 14, fontWeight: '600' }}>
                                        Progress
                                    </Text>
                                </View>
                                <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '700' }}>
                                    {Math.round(progress)}%
                                </Text>
                            </View>
                            
                            {/* Progress Bar */}
                            <View style={{ 
                                height: 8, 
                                backgroundColor: colors.background.input, 
                                borderRadius: 4, 
                                overflow: 'hidden',
                                marginBottom: 8
                            }}>
                                <View style={{ 
                                    height: '100%', 
                                    width: `${Math.min(progress, 100)}%`, 
                                    backgroundColor: colors.primary[600], 
                                    borderRadius: 4 
                                }} />
                            </View>

                            <View style={{ 
                                flexDirection: "row", 
                                alignItems: "center", 
                                backgroundColor: colors.background.input, 
                                paddingHorizontal: 12, 
                                paddingVertical: 8, 
                                borderRadius: 12, 
                                borderWidth: 1, 
                                borderColor: colors.border.light 
                            }}>
                                <Text style={{ color: colors.text.secondary, fontSize: 14, fontWeight: '500' }}>
                                    {selectedGoal.current_value} / {selectedGoal.target_value} {selectedGoal.unit}
                                </Text>
                            </View>
                        </View>

                        {/* Date Information */}
                        <View style={{ marginBottom: 20 }}>
                            {createdDate && (
                                <View style={{ 
                                    flexDirection: "row", 
                                    alignItems: "center", 
                                    marginBottom: 12, 
                                    paddingVertical: 10, 
                                    paddingHorizontal: 12, 
                                    backgroundColor: colors.background.input, 
                                    borderRadius: 12, 
                                    borderWidth: 1, 
                                    borderColor: colors.border.light 
                                }}>
                                    <Calendar size={16} color={colors.text.tertiary} />
                                    <View style={{ marginLeft: 10, flex: 1 }}>
                                        <Text style={{ color: colors.text.secondary, fontSize: 13, fontWeight: '600', marginBottom: 2 }}>
                                            Created
                                        </Text>
                                        <Text style={{ color: colors.text.secondary, fontSize: 14, fontWeight: '500' }}>
                                            {formattedCreatedDate}
                                        </Text>
                                        <Text style={{ color: colors.text.tertiary, fontSize: 12, marginTop: 2 }}>
                                            {createdDateDiff}
                                        </Text>
                                    </View>
                                </View>
                            )}

                            {formattedUpdatedDate && (
                                <View style={{ 
                                    flexDirection: "row", 
                                    alignItems: "center", 
                                    marginBottom: 12, 
                                    paddingVertical: 10, 
                                    paddingHorizontal: 12, 
                                    backgroundColor: colors.background.input, 
                                    borderRadius: 12, 
                                    borderWidth: 1, 
                                    borderColor: colors.border.light 
                                }}>
                                    <Clock size={16} color={colors.text.tertiary} />
                                    <View style={{ marginLeft: 10, flex: 1 }}>
                                        <Text style={{ color: colors.text.secondary, fontSize: 13, fontWeight: '600', marginBottom: 2 }}>
                                            Last Updated
                                        </Text>
                                        <Text style={{ color: colors.text.secondary, fontSize: 14, fontWeight: '500' }}>
                                            {formattedUpdatedDate}
                                        </Text>
                                        <Text style={{ color: colors.text.tertiary, fontSize: 12, marginTop: 2 }}>
                                            {updatedDateDiff}
                                        </Text>
                                    </View>
                                </View>
                            )}

                            {formattedTargetDate && (
                                <View style={{ 
                                    flexDirection: "row", 
                                    alignItems: "center", 
                                    marginBottom: 12, 
                                    paddingVertical: 10, 
                                    paddingHorizontal: 12, 
                                    backgroundColor: colors.background.input, 
                                    borderRadius: 12, 
                                    borderWidth: 1, 
                                    borderColor: colors.border.light 
                                }}>
                                    <Target size={16} color={colors.text.tertiary} />
                                    <View style={{ marginLeft: 10, flex: 1 }}>
                                        <Text style={{ color: colors.text.secondary, fontSize: 13, fontWeight: '600', marginBottom: 2 }}>
                                            Target Date
                                        </Text>
                                        <Text style={{ color: colors.text.secondary, fontSize: 14, fontWeight: '500' }}>
                                            {formattedTargetDate}
                                        </Text>
                                        <Text style={{ color: colors.text.tertiary, fontSize: 12, marginTop: 2 }}>
                                            {targetDateDiff}
                                        </Text>
                                    </View>
                                </View>
                            )}

                            {formattedCompletedDate && (
                                <View style={{ 
                                    flexDirection: "row", 
                                    alignItems: "center", 
                                    marginBottom: 12, 
                                    paddingVertical: 10, 
                                    paddingHorizontal: 12, 
                                    backgroundColor: colors.status.successLight || colors.background.input, 
                                    borderRadius: 12, 
                                    borderWidth: 1, 
                                    borderColor: colors.status.success + '30' || colors.border.light 
                                }}>
                                    <CheckCircle2 size={16} color={colors.status.success} />
                                    <View style={{ marginLeft: 10, flex: 1 }}>
                                        <Text style={{ color: colors.status.success, fontSize: 13, fontWeight: '600', marginBottom: 2 }}>
                                            Completed
                                        </Text>
                                        <Text style={{ color: colors.text.secondary, fontSize: 14, fontWeight: '500' }}>
                                            {formattedCompletedDate}
                                        </Text>
                                        <Text style={{ color: colors.text.tertiary, fontSize: 12, marginTop: 2 }}>
                                            {completedDateDiff}
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </View>

                        {/* Action Buttons */}
                        <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12, marginTop: 8 }}>
                            <TouchableOpacity
                                onPress={() => onToggleComplete(selectedGoal)}
                                disabled={isCompleteLoading || completeLoadingId === selectedGoal.id}
                                style={{
                                    flex: 1,
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: 14,
                                    backgroundColor: colors.background.input,
                                    borderRadius: 12,
                                    borderWidth: 1,
                                    borderColor: colors.border.light,
                                    opacity: (isCompleteLoading || completeLoadingId === selectedGoal.id) ? 0.6 : 1
                                }}
                            >
                                {isCompleteLoading || completeLoadingId === selectedGoal.id ? (
                                    <ActivityIndicator size="small" color={colors.primary[600]} />
                                ) : selectedGoal.is_completed ? (
                                    <RotateCcw size={18} color={colors.primary[600]} />
                                ) : (
                                    <CheckCircle2 size={18} color={colors.primary[600]} />
                                )}
                                <Text style={{ marginLeft: 8, color: colors.primary[600], fontWeight: "600", fontSize: 15 }}>
                                    {selectedGoal.is_completed ? "Reopen" : "Complete"}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => onEdit(selectedGoal)}
                                disabled={isCompleteLoading || isDeleteLoading || completeLoadingId === selectedGoal.id || deleteLoadingId === selectedGoal.id}
                                style={{
                                    flex: 1,
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: 14,
                                    backgroundColor: colors.background.input,
                                    borderRadius: 12,
                                    borderWidth: 1,
                                    borderColor: colors.border.light,
                                    opacity: (isCompleteLoading || isDeleteLoading || completeLoadingId === selectedGoal.id || deleteLoadingId === selectedGoal.id) ? 0.6 : 1
                                }}
                            >
                                <Pencil size={18} color={colors.text.secondary} />
                                <Text style={{ marginLeft: 8, color: colors.text.secondary, fontWeight: "600", fontSize: 15 }}>
                                    Edit
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => onDelete(selectedGoal.id)}
                                disabled={isDeleteLoading || deleteLoadingId === selectedGoal.id}
                                style={{
                                    flex: 1,
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: 14,
                                    backgroundColor: colors.status.errorLight || colors.background.input,
                                    borderRadius: 12,
                                    borderWidth: 1,
                                    borderColor: colors.status.error + '30' || colors.border.light,
                                    opacity: (isDeleteLoading || deleteLoadingId === selectedGoal.id) ? 0.6 : 1
                                }}
                            >
                                {isDeleteLoading || deleteLoadingId === selectedGoal.id ? (
                                    <ActivityIndicator size="small" color={colors.status.error} />
                                ) : (
                                    <Trash2 size={18} color={colors.status.error} />
                                )}
                                <Text style={{ marginLeft: 8, color: colors.status.error, fontWeight: "600", fontSize: 15 }}>
                                    Delete
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </TouchableOpacity>
        </Modal>
    );
}
