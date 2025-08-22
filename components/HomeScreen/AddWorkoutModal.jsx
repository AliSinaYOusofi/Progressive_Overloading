import React, { useEffect, useState } from "react";
import { View, Text, Modal, TouchableOpacity, TextInput } from "react-native";
import { X } from "lucide-react-native";
import { colors, semanticColors } from "../../constants/ui_colors";

export default function AddWorkoutModal({
  visible,
  onClose,
  onSubmit,
  initialValues = { name: "", exercises: "", duration: "", lastWeight: "", targetIncrease: "" },
  isEditing = false,
}) {
  const [formState, setFormState] = useState(initialValues);

  useEffect(() => {
    if (visible) {
      setFormState(initialValues);
    }
  }, [visible, initialValues]);

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-gray-900 text-xl font-bold">{isEditing ? "Edit Workout" : "Add Workout"}</Text>
            <TouchableOpacity onPress={onClose} className="p-2 rounded-lg bg-gray-100">
              <X size={18} color={colors.text.tertiary} />
            </TouchableOpacity>
          </View>

          <View className="mt-2">
            <Text className="text-gray-700 mb-1">Name</Text>
            <TextInput
              placeholder="e.g. Push Day - Upper Body"
              value={formState.name}
              onChangeText={t => setFormState(s => ({ ...s, name: t }))}
              className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
              placeholderTextColor={colors.text.placeholder}
            />
          </View>

          <View className="mt-3 flex-row">
            <View className="flex-1 mr-2">
              <Text className="text-gray-700 mb-1">Exercises</Text>
              <TextInput
                keyboardType="number-pad"
                placeholder="6"
                value={formState.exercises}
                onChangeText={t => setFormState(s => ({ ...s, exercises: t }))}
                className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                placeholderTextColor={colors.text.placeholder}
              />
            </View>
            <View className="flex-1 ml-2">
              <Text className="text-gray-700 mb-1">Duration</Text>
              <TextInput
                placeholder="45-60 min"
                value={formState.duration}
                onChangeText={t => setFormState(s => ({ ...s, duration: t }))}
                className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                placeholderTextColor={colors.text.placeholder}
              />
            </View>
          </View>

          <View className="mt-3 flex-row">
            <View className="flex-1 mr-2">
              <Text className="text-gray-700 mb-1">Last Weight</Text>
              <TextInput
                placeholder="225 lbs"
                value={formState.lastWeight}
                onChangeText={t => setFormState(s => ({ ...s, lastWeight: t }))}
                className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                placeholderTextColor={colors.text.placeholder}
              />
            </View>
            <View className="flex-1 ml-2">
              <Text className="text-gray-700 mb-1">Target Increase</Text>
              <TextInput
                placeholder="+5 lbs"
                value={formState.targetIncrease}
                onChangeText={t => setFormState(s => ({ ...s, targetIncrease: t }))}
                className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                placeholderTextColor={colors.text.placeholder}
              />
            </View>
          </View>

          <View className="mt-5 flex-row">
            <TouchableOpacity onPress={onClose} className="flex-1 bg-gray-100 rounded-xl py-3 mr-2 items-center">
              <Text className="text-gray-700 font-semibold">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onSubmit(formState)} className="flex-1 bg-emerald-600 rounded-xl py-3 ml-2 items-center">
              <Text className="text-white font-semibold">{isEditing ? "Save Changes" : "Add Workout"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}


