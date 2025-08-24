import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  TextInput, 
  ScrollView,
  Alert 
} from "react-native";
import { X, Target, Calendar } from "lucide-react-native";
import { colors } from "../../constants/ui_colors";

export default function AddGoalModal({
  visible,
  onClose,
  onSubmit,
  initialValues = { 
    title: "", 
    description: "", 
    target_value: "",
    unit: "",
    target_date: ""
  },
  isEditing = false
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

    const goalData = {
      ...formState,
      target_value: parseFloat(formState.target_value) || 0,
      current_value: 0
    };

    onSubmit(goalData);
  };

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[80%]">
          <ScrollView className="p-6" showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-900 text-xl font-bold">
                {isEditing ? "Edit Goal" : "Add Fitness Goal"}
              </Text>
              <TouchableOpacity onPress={onClose} className="p-2 rounded-lg bg-gray-100">
                <X size={18} color={colors.text.tertiary} />
              </TouchableOpacity>
            </View>

            {/* Goal Title */}
            <View className="mb-4">
              <Text className="text-gray-700 mb-2 font-medium">Goal Title</Text>
              <TextInput
                placeholder="e.g. Bench Press 225 lbs"
                value={formState.title}
                onChangeText={text => setFormState(prev => ({ ...prev, title: text }))}
                className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                placeholderTextColor={colors.text.tertiary}
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
              />
            </View>

            {/* Target Value and Unit */}
            <View className="flex-row mb-4">
              <View className="flex-1 mr-2">
                <Text className="text-gray-700 mb-2 font-medium">Target Value</Text>
                <TextInput
                  keyboardType="numeric"
                  placeholder="225"
                  value={formState.target_value}
                  onChangeText={text => setFormState(prev => ({ ...prev, target_value: text }))}
                  className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                  placeholderTextColor={colors.text.tertiary}
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
              />
              <Text className="text-gray-500 text-sm mt-1">
                Leave empty for no deadline
              </Text>
            </View>

            {/* Action Buttons */}
            <View className="flex-row">
              <TouchableOpacity 
                onPress={onClose} 
                className="flex-1 bg-gray-100 rounded-xl py-4 mr-2 items-center"
              >
                <Text className="text-gray-700 font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleSubmit} 
                className="flex-1 bg-emerald-600 rounded-xl py-4 ml-2 items-center"
              >
                <Text className="text-white font-semibold">
                  {isEditing ? "Save Changes" : "Add Goal"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
