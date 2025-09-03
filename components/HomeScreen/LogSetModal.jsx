import React, { useState, useEffect } from "react";
import { View, Text, Modal, TouchableOpacity, TextInput, ActivityIndicator, Alert } from "react-native";
import { X } from "lucide-react-native";
import { colors } from "../../constants/ui_colors";

export default function LogSetModal({ visible, onClose, onSubmit, isSubmitting }) {
    const [exerciseName, setExerciseName] = useState("");
    const [weight, setWeight] = useState("");
    const [reps, setReps] = useState("");
    const [unit, setUnit] = useState("kg");
    const [sets, setSets] = useState("");

    useEffect(() => {
        if (!visible) {
            setExerciseName("");
            setWeight("");
            setReps("");
            setUnit("kg");
            setSets("");
        }
    }, [visible]);

    const handleSubmit = () => {
        const name = exerciseName.trim();
        if (!name) {
            Alert.alert("Exercise required", "Please enter an exercise name.");
            return;
        }
        const w = parseFloat(weight);
        const r = parseInt(reps, 10);
        if (isNaN(w) || w < 0) {
            Alert.alert("Invalid weight", "Please enter a valid weight.");
            return;
        }
        if (isNaN(r) || r <= 0 || r > 100) {
            Alert.alert("Invalid reps", "Reps must be between 1 and 100.");
            return;
        }
        const s = parseInt(sets, 10);
        if (isNaN(s) || s <= 0 || s > 30) {
            Alert.alert("Invalid sets", "Sets must be between 1 and 30.");
            return;
        }
        const u = (unit || "").trim();
        if (!u) {
            Alert.alert("Unit required", "Please enter a weight unit (e.g., kg or lb).");
            return;
        }
        onSubmit({ exerciseName: name, weight: w, reps: r, sets: s, unit: u });
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <TouchableOpacity activeOpacity={1} onPress={onClose} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "flex-end" }}>
                <TouchableOpacity activeOpacity={1} onPress={() => {}} style={{ backgroundColor: "white", borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <Text style={{ fontSize: 18, fontWeight: "700", color: "#111827" }}>Log Set</Text>
                        <TouchableOpacity onPress={onClose} disabled={isSubmitting}>
                            <X size={20} color={colors.text.secondary} />
                        </TouchableOpacity>
                    </View>

                    <View style={{ marginBottom: 12 }}>
                        <Text style={{ color: "#374151", marginBottom: 6 }}>Exercise</Text>
                        <TextInput
                            editable={!isSubmitting}
                            value={exerciseName}
                            onChangeText={setExerciseName}
                            placeholder="e.g., Bench Press"
                            style={{ borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 }}
                        />
                    </View>

                    <View style={{ flexDirection: "row", gap: 12 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: "#374151", marginBottom: 6 }}>Weight</Text>
                            <TextInput
                                editable={!isSubmitting}
                                value={weight}
                                onChangeText={setWeight}
                                keyboardType="numeric"
                                placeholder="kg"
                                style={{ borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 }}
                            />
                        </View>
                        <View style={{ width: 90 }}>
                            <Text style={{ color: "#374151", marginBottom: 6 }}>Reps</Text>
                            <TextInput
                                editable={!isSubmitting}
                                value={reps}
                                onChangeText={setReps}
                                keyboardType="number-pad"
                                placeholder="e.g., 5"
                                style={{ borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 }}
                            />
                        </View>
                        <View style={{ width: 90 }}>
                            <Text style={{ color: "#374151", marginBottom: 6 }}>Sets</Text>
                            <TextInput
                                editable={!isSubmitting}
                                value={sets}
                                onChangeText={setSets}
                                keyboardType="number-pad"
                                placeholder="e.g., 3"
                                style={{ borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 }}
                            />
                        </View>
                        <View style={{ width: 90 }}>
                            <Text style={{ color: "#374151", marginBottom: 6 }}>Unit</Text>
                            <TextInput
                                editable={!isSubmitting}
                                value={unit}
                                onChangeText={setUnit}
                                placeholder="kg / lb"
                                autoCapitalize="none"
                                autoCorrect={false}
                                style={{ borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 }}
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                        style={{ backgroundColor: colors.primary[600], borderRadius: 10, paddingVertical: 12, alignItems: "center", marginTop: 16 }}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={{ color: "white", fontWeight: "600" }}>Save</Text>
                        )}
                    </TouchableOpacity>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}


