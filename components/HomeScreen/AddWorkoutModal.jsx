import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Switch
} from "react-native";
import { X, Plus, Trash2, Dumbbell } from "lucide-react-native";
import { colors } from "../../constants/ui_colors";

export default function AddWorkoutModal({
  visible,
  onClose,
  onSubmit,
  initialValues = {
    name: "",
    description: "",
    estimated_duration_minutes: "",
    category_id: null,
    exercises: []
  },
  isEditing = false,
  categories = []
}) {
  const [formState, setFormState] = useState(initialValues);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    if (visible) {
      setFormState(initialValues);
      setSelectedCategory(categories.find(c => c.id === initialValues.category_id) || null);
    }
  }, [visible, initialValues, categories]);

  const addExercise = () => {
    setFormState(prev => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        {
          id: Date.now().toString(),
          name: "",
          sets: 3,
          reps: 10,
          weight_kg: "",
          rest_seconds: 60,
          notes: ""
        }
      ]
    }));
  };

  const updateExercise = (index, field, value) => {
    setFormState(prev => ({
      ...prev,
      exercises: prev.exercises.map((exercise, i) =>
        i === index ? { ...exercise, [field]: value } : exercise
      )
    }));
  };

  const removeExercise = (index) => {
    setFormState(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = () => {
    if (!formState.name.trim()) {
      Alert.alert("Name required", "Please enter a workout name.");
      return;
    }

    if (formState.exercises.length === 0) {
      Alert.alert("Exercises required", "Please add at least one exercise.");
      return;
    }

    // Validate exercises
    for (let i = 0; i < formState.exercises.length; i++) {
      const exercise = formState.exercises[i];
      if (!exercise.name.trim()) {
        Alert.alert("Exercise name required", `Please enter a name for exercise ${i + 1}.`);
        return;
      }
    }

    const workoutData = {
      ...formState,
      category_id: selectedCategory?.id || null,
      exercises: formState.exercises.map((exercise, index) => ({
        ...exercise,
        order_index: index + 1
      }))
    };

    onSubmit(workoutData);
  };

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[90%]">
          <ScrollView className="p-6" showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-900 text-xl font-bold">
                {isEditing ? "Edit Workout" : "Create Workout Template"}
              </Text>
              <TouchableOpacity onPress={onClose} className="p-2 rounded-lg bg-gray-100">
                <X size={18} color={colors.text.tertiary} />
              </TouchableOpacity>
            </View>

            {/* Basic Info */}
            <View className="mb-4">
              <Text className="text-gray-700 mb-2 font-medium">Workout Name</Text>
              <TextInput
                placeholder="e.g. Push Day - Upper Body"
                value={formState.name}
                onChangeText={text => setFormState(prev => ({ ...prev, name: text }))}
                className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                placeholderTextColor={colors.text.tertiary}
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 mb-2 font-medium">Description (Optional)</Text>
              <TextInput
                placeholder="Describe your workout routine"
                value={formState.description}
                onChangeText={text => setFormState(prev => ({ ...prev, description: text }))}
                className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                placeholderTextColor={colors.text.tertiary}
                multiline
                numberOfLines={2}
              />
            </View>

            <View className="flex-row mb-4">
              <View className="flex-1 mr-2">
                <Text className="text-gray-700 mb-2 font-medium">Duration (minutes)</Text>
                <TextInput
                  keyboardType="number-pad"
                  placeholder="45"
                  value={formState.estimated_duration_minutes}
                  onChangeText={text => setFormState(prev => ({ ...prev, estimated_duration_minutes: text }))}
                  className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                  placeholderTextColor={colors.text.tertiary}
                />
              </View>
              <View className="flex-1 ml-2">
                <Text className="text-gray-700 mb-2 font-medium">Category</Text>
                <TouchableOpacity
                  className={`border rounded-xl px-4 py-3 ${selectedCategory ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'}`}
                  onPress={() => {
                    // Simple category selection - you could make this a proper picker
                    if (categories.length > 0) {
                      const currentIndex = categories.findIndex(c => c.id === selectedCategory?.id);
                      const nextIndex = (currentIndex + 1) % categories.length;
                      setSelectedCategory(categories[nextIndex]);
                    }
                  }}
                >
                  <Text className={`${selectedCategory ? 'text-emerald-700' : 'text-gray-500'}`}>
                    {selectedCategory ? selectedCategory.name : 'Select Category'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Exercises Section */}
            <View className="mb-4">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-gray-700 text-lg font-medium">Exercises</Text>
                <TouchableOpacity
                  onPress={addExercise}
                  className="flex-row items-center bg-emerald-100 px-3 py-2 rounded-lg"
                >
                  <Plus size={16} color={colors.primary[600]} />
                  <Text className="text-emerald-700 font-medium ml-1">Add Exercise</Text>
                </TouchableOpacity>
              </View>

              {formState.exercises.map((exercise, index) => (
                <View key={exercise.id} className="bg-gray-50 rounded-xl p-4 mb-3">
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-gray-700 font-medium">Exercise {index + 1}</Text>
                    <TouchableOpacity
                      onPress={() => removeExercise(index)}
                      className="bg-red-100 p-2 rounded-lg"
                    >
                      <Trash2 size={16} color={colors.status.error} />
                    </TouchableOpacity>
                  </View>

                  <TextInput
                    placeholder="Exercise name"
                    value={exercise.name}
                    onChangeText={text => updateExercise(index, 'name', text)}
                    className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 mb-3"
                    placeholderTextColor={colors.text.tertiary}
                  />

                  <View className="flex-row mb-3">
                    <View className="flex-1 mr-2">
                      <Text className="text-gray-600 text-sm mb-1">Sets</Text>
                      <TextInput
                        keyboardType="number-pad"
                        placeholder="3"
                        value={exercise.sets.toString()}
                        onChangeText={text => updateExercise(index, 'sets', parseInt(text) || 0)}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-gray-900"
                        placeholderTextColor={colors.text.tertiary}
                      />
                    </View>
                    <View className="flex-1 mr-2">
                      <Text className="text-gray-600 text-sm mb-1">Reps</Text>
                      <TextInput
                        keyboardType="number-pad"
                        placeholder="10"
                        value={exercise.reps.toString()}
                        onChangeText={text => updateExercise(index, 'reps', parseInt(text) || 0)}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-gray-900"
                        placeholderTextColor={colors.text.tertiary}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-600 text-sm mb-1">Rest (sec)</Text>
                      <TextInput
                        keyboardType="number-pad"
                        placeholder="60"
                        value={exercise.rest_seconds.toString()}
                        onChangeText={text => updateExercise(index, 'rest_seconds', parseInt(text) || 0)}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-gray-900"
                        placeholderTextColor={colors.text.tertiary}
                      />
                    </View>
                  </View>

                  <View className="flex-row">
                    <View className="flex-1 mr-2">
                      <Text className="text-gray-600 text-sm mb-1">Weight (kg)</Text>
                      <TextInput
                        keyboardType="numeric"
                        placeholder="0"
                        value={exercise.weight_kg}
                        onChangeText={text => updateExercise(index, 'weight_kg', text)}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-gray-900"
                        placeholderTextColor={colors.text.tertiary}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-600 text-sm mb-1">Notes</Text>
                      <TextInput
                        placeholder="Optional notes"
                        value={exercise.notes}
                        onChangeText={text => updateExercise(index, 'notes', text)}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-gray-900"
                        placeholderTextColor={colors.text.tertiary}
                      />
                    </View>
                  </View>
                </View>
              ))}

              {formState.exercises.length === 0 && (
                <View className="bg-gray-50 rounded-xl p-6 items-center">
                  <Dumbbell size={32} color={colors.text.tertiary} />
                  <Text className="text-gray-500 text-center mt-2">
                    No exercises added yet. Tap "Add Exercise" to get started.
                  </Text>
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View className="flex-row mt-6">
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
                  {isEditing ? "Save Changes" : "Create Workout"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}


