import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  TextInput, 
  ScrollView,
  Alert,
  ActivityIndicator 
} from "react-native";
import { Target, Calendar, CheckCircle2, RotateCcw, Trash2 } from "lucide-react-native";
import { colors } from "../../constants/ui_colors";
import ModalCloseButton from "../ModalCloseButton";

export default function AddGoalModal({
  visible,
  onClose,
  onSubmit,
  initialValues = { 
    title: "", 
    description: "", 
    target_value: "",
    current_value: "",
    unit: "",
    target_date: ""
  },
  isEditing = false,
  isLoading = false,
  // Optional edit actions (shown only when isEditing is true)
  onToggleComplete,
  onDelete,
  isCompleted = false,
  completeLoading = false,
  deleteLoading = false
}) {
  const [formState, setFormState] = useState(initialValues);

  useEffect(() => {
    if (visible) {
      setFormState(initialValues);
    }
  }, [visible, initialValues]);

  const handleSubmit = () => {
    if (!formState.title.trim()) {
      Alert.alert("Title required", "Please enter a goal title.");
      return;
    }

    if (!formState.target_value.trim()) {
      Alert.alert("Target value required", "Please enter a target value.");
      return;
    }

    if (!formState.current_value.trim()) {
      Alert.alert("Current value required", "Please enter a current value.");
      return;
    }

    const currentValue = parseFloat(formState.current_value);
    const targetValue = parseFloat(formState.target_value);

    if (isNaN(currentValue) || isNaN(targetValue)) {
      Alert.alert("Invalid values", "Please enter valid numbers for current and target values.");
      return;
    }

    if (currentValue > targetValue) {
      Alert.alert("Invalid values", "Current value cannot be greater than target value. The target should be your goal to achieve.");
      return;
    }
    console.log(currentValue, targetValue, currentValue > targetValue)
    const goalData = {
      ...formState,
      target_value: parseFloat(formState.target_value) || 0,
      current_value: formState.current_value !== undefined && formState.current_value !== null && `${formState.current_value}`.trim() !== "" 
        ? parseFloat(formState.current_value) || 0 
        : 0
    };

    onSubmit(goalData);
  };

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={isLoading ? undefined : onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[80%]">
          <ScrollView className="p-6" showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-gray-900 text-xl font-bold">
                {isEditing ? "Edit Goal" : "Add Fitness Goal"}
              </Text>
              <ModalCloseButton onPress={onClose} disabled={isLoading} size={18} />
            </View>

            {/* Edit actions row (Complete/Reopen, Delete) */}
            {isEditing && (onToggleComplete || onDelete) ? (
              <View className="flex-row justify-end mb-4">
                {onToggleComplete ? (
                  <TouchableOpacity
                    onPress={onToggleComplete}
                    disabled={isLoading || completeLoading}
                    className="flex-row items-center px-3 py-2 rounded-xl mr-2"
                    style={{ backgroundColor: "#F4F6F8", opacity: isLoading || completeLoading ? 0.6 : 1 }}
                  >
                    {completeLoading ? (
                      <ActivityIndicator size="small" color={colors.primary[600]} />
                    ) : isCompleted ? (
                      <RotateCcw size={18} color={colors.primary[600]} />
                    ) : (
                      <CheckCircle2 size={18} color={colors.primary[600]} />
                    )}
                    <Text className="ml-2 font-semibold" style={{ color: colors.primary[600] }}>
                      {isCompleted ? "Reopen" : "Complete"}
                    </Text>
                  </TouchableOpacity>
                ) : null}

                {onDelete ? (
                  <TouchableOpacity
                    onPress={onDelete}
                    disabled={isLoading || deleteLoading}
                    className="flex-row items-center px-3 py-2 rounded-xl"
                    style={{ backgroundColor: "#FDECEC", opacity: isLoading || deleteLoading ? 0.6 : 1 }}
                  >
                    {deleteLoading ? (
                      <ActivityIndicator size="small" color={colors.status?.error || "#EF4444"} />
                    ) : (
                      <Trash2 size={18} color={colors.status?.error || "#EF4444"} />
                    )}
                    <Text className="ml-2 font-semibold" style={{ color: colors.status?.error || "#EF4444" }}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null}

            {/* Goal Title */}
            <View className="mb-4">
              <Text className="text-gray-700 mb-2 font-medium">Goal Title</Text>
              <TextInput
                placeholder="e.g. Bench Press 225 lbs"
                value={formState.title}
                onChangeText={text => setFormState(prev => ({ ...prev, title: text }))}
                className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                placeholderTextColor={colors.text.tertiary}
                editable={!isLoading}
              />
            </View>

            {/* Description */}
            <View className="mb-4">
              <Text className="text-gray-700 mb-2 font-medium">Description (Optional)</Text>
              <TextInput
                placeholder="Describe your goal in detail"
                value={formState.description}
                onChangeText={text => setFormState(prev => ({ ...prev, description: text }))}
                className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                placeholderTextColor={colors.text.tertiary}
                multiline
                numberOfLines={3}
                editable={!isLoading}
              />
            </View>

            {/* Current Value / Target Value / Unit */}
            <View className="flex-row mb-4">
              <View className="flex-1 mr-2">
                <Text className="text-gray-700 mb-2 font-medium">Current Value</Text>
                <TextInput
                  keyboardType="numeric"
                  placeholder="e.g. 180"
                  value={formState.current_value}
                  onChangeText={text => setFormState(prev => ({ ...prev, current_value: text }))}
                  className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                  placeholderTextColor={colors.text.tertiary}
                  editable={!isLoading}
                />
              </View>
              <View className="flex-1 mx-1">
                <Text className="text-gray-700 mb-2 font-medium">Target Value</Text>
                <TextInput
                  keyboardType="numeric"
                  placeholder="225"
                  value={formState.target_value}
                  onChangeText={text => setFormState(prev => ({ ...prev, target_value: text }))}
                  className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                  placeholderTextColor={colors.text.tertiary}
                  editable={!isLoading}
                />
              </View>
              <View className="flex-1 ml-2">
                <Text className="text-gray-700 mb-2 font-medium">Unit</Text>
                <TextInput
                  placeholder="lbs, kg, reps, etc."
                  value={formState.unit}
                  onChangeText={text => setFormState(prev => ({ ...prev, unit: text }))}
                  className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                  placeholderTextColor={colors.text.tertiary}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Target Date */}
            <View className="mb-6">
              <Text className="text-gray-700 mb-2 font-medium">Target Date (Optional)</Text>
              <TextInput
                placeholder="YYYY-MM-DD"
                value={formState.target_date}
                onChangeText={text => setFormState(prev => ({ ...prev, target_date: text }))}
                className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                placeholderTextColor={colors.text.tertiary}
                editable={!isLoading}
              />
              <Text className="text-gray-500 text-sm mt-1">
                Leave empty for no deadline
              </Text>
            </View>

            {/* Action Buttons */}
            <View className="flex-row">
              <TouchableOpacity 
                onPress={onClose} 
                disabled={isLoading}
                className="flex-1 bg-gray-100 rounded-xl py-4 mr-2 items-center"
                style={{ opacity: isLoading ? 0.5 : 1 }}
              >
                <Text className="text-gray-700 font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleSubmit} 
                disabled={isLoading}
                className="flex-1 bg-emerald-600 rounded-xl py-4 ml-2 items-center"
                style={{ opacity: isLoading ? 0.7 : 1 }}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white font-semibold">
                    {isEditing ? "Save Changes" : "Add Goal"}
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
