import React from "react";
import { View, Text, Modal, TouchableOpacity, ActivityIndicator } from "react-native";
import { Dumbbell, Repeat, Layers, Pencil, Trash2 } from "lucide-react-native";
import { colors } from "../../constants/ui_colors";
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
    if (!selectedSet) return null;

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
                <View style={{ backgroundColor: colors.background.primary, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                            <View className="bg-emerald-100 p-2 rounded-full mr-3">
                                <Dumbbell size={16} color={colors.primary[600]} />
                            </View>
                            <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text.primary }}>
                                {selectedSet.exercises?.name || "Exercise"}
                            </Text>
                        </View>
                        <ModalCloseButton onPress={onClose} size={18} />
                    </View>
                    
                    <View style={{ flexDirection: "row", marginBottom: 16 }}>
                        <View className="flex-row items-center bg-emerald-50 px-2 py-1 rounded-full mr-2">
                            <Dumbbell size={14} color={colors.icon.accent} />
                            <Text className="text-gray-700 text-xs ml-1">{selectedSet.weight} {selectedSet.unit}</Text>
                        </View>
                        <View className="flex-row items-center bg-emerald-50 px-2 py-1 rounded-full mr-2">
                            <Repeat size={14} color={colors.icon.accent} />
                            <Text className="text-gray-700 text-xs ml-1">{selectedSet.reps} reps</Text>
                        </View>
                        <View className="flex-row items-center bg-emerald-50 px-2 py-1 rounded-full">
                            <Layers size={14} color={colors.icon.accent} />
                            <Text className="text-gray-700 text-xs ml-1">{selectedSet.sets} sets</Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <TouchableOpacity
                            onPress={onEdit}
                            style={{ flexDirection: "row", alignItems: "center", padding: 12, backgroundColor: colors.background.card, borderRadius: 12 }}
                        >
                            <Pencil size={18} color={colors.primary[600]} />
                            <Text style={{ marginLeft: 8, color: colors.primary[600], fontWeight: "600" }}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={onDelete}
                            disabled={isDeleting || deleteLoadingId === selectedSet.id}
                            style={{ flexDirection: "row", alignItems: "center", padding: 12, backgroundColor: colors.background.card, borderRadius: 12 }}
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
