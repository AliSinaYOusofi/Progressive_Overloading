import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Alert,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import { X, Palette, Tag } from "lucide-react-native";
import { colors } from "../../constants/ui_colors";
import { getCurrentUser, createWorkoutCategory } from "../../lib/database";
import {
    Dumbbell,
    Target,
    Flame,
    Zap,
    Star,
    Heart,
    Trophy,
    Award,
    Medal,
    Crown,
    Bolt,
} from "lucide-react-native";
const CATEGORY_COLORS = [
    "#6366f1",
    "#8b5cf6",
    "#ec4899",
    "#f43f5e",
    "#f97316",
    "#eab308",
    "#84cc16",
    "#22c55e",
    "#06b6d4",
    "#3b82f6",
    "#8b5cf6",
];

export const CATEGORY_ICONS = {
    Dumbbell: Dumbbell,
    Target: Target,
    Flame: Flame,
    Zap: Zap,
    Star: Star,
    Heart: Heart,
    Trophy: Trophy,
    Award: Award,
    Medal: Medal,
    Crown: Crown,
    Bolt: Bolt,
};

export default function AddCategoryModal({
    visible,
    onClose,
    onCategoryAdded,
    initialValues = {
        name: "",
        description: "",
        color: CATEGORY_COLORS[0],
        icon: 'Dumbbell'
    },
    isEditing = false,
}) {
    const [formState, setFormState] = useState(initialValues);
    const [selectedColor, setSelectedColor] = useState(initialValues.color);
    const [selectedIcon, setSelectedIcon] = useState(
        initialValues.icon || "Dumbbell"
    );
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            setFormState(initialValues);
            setSelectedColor(initialValues.color);
            setSelectedIcon(initialValues.icon);
        }
    }, [visible]);

    const handleSubmit = async () => {
        if (!formState.name.trim()) {
            Alert.alert("Name required", "Please enter a category name.");
            return;
        }

        setIsLoading(true);
        try {
            const user = await getCurrentUser();
            if (!user) {
                Alert.alert("Error", "User not found");
                return;
            }

            const categoryData = {
                user_id: user.id,
                name: formState.name.trim(),
                description: formState.description.trim(),
                color: selectedColor,
                icon: selectedIcon || "Dumbbell", // Store icon name as string
                is_active: true,
            };

            await createWorkoutCategory(categoryData);
            Alert.alert("Success", "Category created successfully!");
            onCategoryAdded();
        } catch (error) {
            console.error("Error creating category:", error);
            Alert.alert(
                "Error",
                "Failed to create category. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            transparent
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <ScrollView
                        style={styles.scrollView}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.title}>
                                {isEditing
                                    ? "Edit Category"
                                    : "Add Workout Category"}
                            </Text>
                            <TouchableOpacity
                                onPress={onClose}
                                style={styles.closeButton}
                            >
                                <X size={18} color={colors.text.tertiary} />
                            </TouchableOpacity>
                        </View>

                        {/* Category Name */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Category Name</Text>
                            <TextInput
                                placeholder="e.g. Push Day, Pull Day, Leg Day"
                                value={formState.name}
                                onChangeText={(text) =>
                                    setFormState((prev) => ({
                                        ...prev,
                                        name: text,
                                    }))
                                }
                                style={styles.textInput}
                                placeholderTextColor={colors.text.tertiary}
                            />
                        </View>

                        {/* Description */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                Description (Optional)
                            </Text>
                            <TextInput
                                placeholder="Describe this workout category"
                                value={formState.description}
                                onChangeText={(text) =>
                                    setFormState((prev) => ({
                                        ...prev,
                                        description: text,
                                    }))
                                }
                                style={[
                                    styles.textInput,
                                    styles.multilineInput,
                                ]}
                                placeholderTextColor={colors.text.tertiary}
                                multiline
                                numberOfLines={2}
                            />
                        </View>

                        {/* Color Selection */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Category Color</Text>
                            <View style={styles.colorGrid}>
                                {CATEGORY_COLORS.map((color, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        onPress={() => setSelectedColor(color)}
                                        style={[
                                            styles.colorOption,
                                            { backgroundColor: color },
                                            selectedColor === color &&
                                                styles.selectedColorOption,
                                        ]}
                                    />
                                ))}
                            </View>
                        </View>

                        {/* Icon Selection */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Category Icon</Text>
                            <View style={styles.iconGrid}>
                                {Object.keys(CATEGORY_ICONS).map((iconName) => {
                                    const Icon = CATEGORY_ICONS[iconName];
                                    return (
                                        <TouchableOpacity
                                            key={iconName}
                                            onPress={() =>
                                                setSelectedIcon(iconName)
                                            }
                                            style={[
                                                styles.iconOption,
                                                selectedIcon === iconName &&
                                                    styles.selectedIconOption,
                                            ]}
                                        >
                                            <Icon
                                                size={20}
                                                color={
                                                    selectedIcon === iconName
                                                        ? colors.primary[600]
                                                        : colors.text.tertiary
                                                }
                                            />
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                onPress={onClose}
                                style={[styles.button, styles.cancelButton]}
                                disabled={isLoading}
                            >
                                <Text style={styles.cancelButtonText}>
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleSubmit}
                                style={[styles.button, styles.submitButton]}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator
                                        size="small"
                                        color={colors.background.primary}
                                    />
                                ) : (
                                    <Text style={styles.submitButtonText}>
                                        {isEditing
                                            ? "Save Changes"
                                            : "Add Category"}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    modalContainer: {
        backgroundColor: colors.background.primary,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: "80%",
        shadowColor: colors.shadow.dark,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
    },
    scrollView: {
        padding: 24,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        color: colors.text.primary,
    },
    closeButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: colors.background.card,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: "500",
        color: colors.text.primary,
        marginBottom: 8,
    },
    textInput: {
        borderWidth: 1,
        borderColor: colors.border.light,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: colors.text.primary,
        backgroundColor: colors.background.primary,
    },
    multilineInput: {
        height: 60,
        textAlignVertical: "top",
    },
    colorGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    colorOption: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: colors.border.light,
    },
    selectedColorOption: {
        borderColor: colors.text.primary,
        borderWidth: 3,
    },
    iconGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    iconOption: {
        width: 48,
        height: 48,
        borderRadius: 12,
        marginRight: 12,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: colors.border.light,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.background.primary,
    },
    selectedIconOption: {
        borderColor: colors.primary[600],
        backgroundColor: colors.primary[50],
    },
    buttonContainer: {
        flexDirection: "row",
        marginTop: 8,
        paddingBottom: 40,
    },
    button: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    cancelButton: {
        backgroundColor: colors.background.card,
        marginRight: 8,
    },
    submitButton: {
        backgroundColor: colors.primary[600],
        marginLeft: 8,
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.text.secondary,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.background.primary,
    },
});
