import React from "react";
import { View, Text, Modal, TouchableOpacity, ActivityIndicator } from "react-native";
import { Dumbbell, Repeat, Layers, Pencil, Trash2, Calendar } from "lucide-react-native";
import { formatDistanceToNow, format } from "date-fns";
import { useThemedColors } from "../../hooks/useThemedColors";
import ModalCloseButton from "../ModalCloseButton";

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
            <TouchableOpacity
                activeOpacity={1}
                onPress={onClose}
                style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}
            >
                <View style={{ backgroundColor: colors.background.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 }}>
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
                </View>
            </TouchableOpacity>
        </Modal>
    );
}
