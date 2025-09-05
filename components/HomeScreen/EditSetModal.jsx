import React, { useEffect, useState } from "react";
import { View, Text, Modal, TouchableOpacity, TextInput, ActivityIndicator, Alert } from "react-native";
import { Trash2 } from "lucide-react-native";
import { colors } from "../../constants/ui_colors";
import ModalCloseButton from "../ModalCloseButton";

export default function EditSetModal({ visible, onClose, onSubmit, onDelete, isSubmitting, isDeleting, initialValues }) {
    const [exerciseName, setExerciseName] = useState("");
    const [weight, setWeight] = useState("");
    const [reps, setReps] = useState("");
    const [unit, setUnit] = useState("kg");
    const [sets, setSets] = useState("");

    useEffect(() => {
        if (visible && initialValues) {
            setExerciseName(initialValues.exerciseName || "");
            setWeight(String(initialValues.weight ?? ""));
            setReps(String(initialValues.reps ?? ""));
            setUnit(initialValues.unit || "kg");
            setSets(String(initialValues.sets ?? ""));
        }
    }, [visible, initialValues]);

    const handleSave = () => {
        const name = exerciseName.trim();
        if (!name) return Alert.alert("Exercise required", "Please enter an exercise name.");
        const w = parseFloat(weight);
        const r = parseInt(reps, 10);
        if (isNaN(w) || w < 0) return Alert.alert("Invalid weight", "Please enter a valid weight.");
        if (isNaN(r) || r <= 0 || r > 100) return Alert.alert("Invalid reps", "Reps must be between 1 and 100.");
        const u = (unit || "").trim();
        if (!u) return Alert.alert("Unit required", "Please enter a unit.");
        const s = parseInt(sets, 10);
        if (isNaN(s) || s <= 0 || s > 30) return Alert.alert("Invalid sets", "Sets must be between 1 and 30.");
        onSubmit({ exerciseName: name, weight: w, reps: r, sets: s, unit: u });
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <TouchableOpacity activeOpacity={1} onPress={onClose} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "flex-end" }}>
                <TouchableOpacity activeOpacity={1} onPress={() => {}} style={{ backgroundColor: "white", borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <Text style={{ fontSize: 18, fontWeight: "700", color: "#111827" }}>Edit Set</Text>
                        <ModalCloseButton onPress={onClose} disabled={isSubmitting || isDeleting} size={18} />
                    </View>

                    <View style={{ marginBottom: 12 }}>
                        <Text style={{ color: "#374151", marginBottom: 6 }}>Exercise</Text>
                        <TextInput editable={!isSubmitting && !isDeleting} value={exerciseName} onChangeText={setExerciseName} placeholder="e.g., Bench Press" style={{ borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 }} />
                    </View>

                    <View style={{ flexDirection: "row", gap: 12 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: "#374151", marginBottom: 6 }}>Weight</Text>
                            <TextInput editable={!isSubmitting && !isDeleting} value={weight} onChangeText={setWeight} keyboardType="numeric" placeholder="kg" style={{ borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 }} />
                        </View>
                        <View style={{ width: 90 }}>
                            <Text style={{ color: "#374151", marginBottom: 6 }}>Reps</Text>
                            <TextInput editable={!isSubmitting && !isDeleting} value={reps} onChangeText={setReps} keyboardType="number-pad" placeholder="e.g., 5" style={{ borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 }} />
                        </View>
                        <View style={{ width: 90 }}>
                            <Text style={{ color: "#374151", marginBottom: 6 }}>Sets</Text>
                            <TextInput editable={!isSubmitting && !isDeleting} value={sets} onChangeText={setSets} keyboardType="number-pad" placeholder="e.g., 3" style={{ borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 }} />
                        </View>
                        <View style={{ width: 90 }}>
                            <Text style={{ color: "#374151", marginBottom: 6 }}>Unit</Text>
                            <TextInput editable={!isSubmitting && !isDeleting} value={unit} onChangeText={setUnit} placeholder="kg / lb" autoCapitalize="none" autoCorrect={false} style={{ borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 }} />
                        </View>
                    </View>

                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 16 }}>
                        <TouchableOpacity onPress={onDelete} disabled={isDeleting || isSubmitting} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, backgroundColor: colors.background.card }}>
                            {isDeleting ? <ActivityIndicator color={colors.status.error} /> : <Trash2 size={18} color={colors.status.error} />}
                            <Text style={{ marginLeft: 8, color: colors.status.error, fontWeight: "600" }}>Delete</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleSave} disabled={isSubmitting || isDeleting} style={{ paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, backgroundColor: colors.primary[600] }}>
                            {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "white", fontWeight: "600" }}>Save</Text>}
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}


