import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Switch,
  StyleSheet,
  ActivityIndicator
} from "react-native";
import { X, Plus, Trash2, Dumbbell } from "lucide-react-native";
import { colors } from "../../constants/ui_colors";
import { getCurrentUser, createWorkoutTemplate, createExercise, createWorkoutTemplateExercise } from "../../lib/database";

export default function AddWorkoutModal({
  visible,
  onClose,
  onWorkoutAdded,
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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setFormState(initialValues);
      setSelectedCategory(categories.find(c => c.id === initialValues.category_id) || null);
    }
  }, [visible]);

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

  const handleSubmit = async () => {
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

    setIsLoading(true);
    try {
      const user = await getCurrentUser();
      if (!user) {
        Alert.alert("Error", "User not found");
        return;
      }

      // Step 1: Create the workout template first
      const workoutTemplateData = {
        user_id: user.id,
        name: formState.name.trim(),
        description: formState.description.trim(),
        estimated_duration_minutes: parseInt(formState.estimated_duration_minutes) || 0,
        category_id: selectedCategory?.id || null,
        is_active: true
      };

      const workoutTemplate = await createWorkoutTemplate(workoutTemplateData);

      // Step 2: Create exercises and link them to the workout template
      for (let i = 0; i < formState.exercises.length; i++) {
        const exerciseData = formState.exercises[i];
        
        // Create the exercise in the exercises table
        const exercise = await createExercise({
          user_id: user.id,
          name: exerciseData.name.trim(),
          description: exerciseData.notes.trim() || null,
          category: 'strength', // Default category, can be made configurable later
          muscle_groups: [], // Can be made configurable later
          equipment: [], // Can be made configurable later
          is_custom: true
        });

        // Create the workout template exercise relationship
        await createWorkoutTemplateExercise({
          workout_template_id: workoutTemplate.id,
          exercise_id: exercise.id,
          order_index: i + 1,
          sets: exerciseData.sets,
          reps: exerciseData.reps,
          weight_kg: parseFloat(exerciseData.weight_kg) || null,
          rest_seconds: exerciseData.rest_seconds,
          notes: exerciseData.notes.trim() || null,
          user_id: user.id
        });
      }

      Alert.alert("Success", "Workout template created successfully!");
      onWorkoutAdded();
    } catch (error) {
      console.error("Error creating workout template:", error);
      Alert.alert("Error", "Failed to create workout template. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>
                {isEditing ? "Edit Workout" : "Create Workout Template"}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={18} color={colors.text.tertiary} />
              </TouchableOpacity>
            </View>

            {/* Basic Info */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Workout Name</Text>
              <TextInput
                placeholder="e.g. Push Day - Upper Body"
                value={formState.name}
                onChangeText={text => setFormState(prev => ({ ...prev, name: text }))}
                style={styles.textInput}
                placeholderTextColor={colors.text.tertiary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description (Optional)</Text>
              <TextInput
                placeholder="Describe your workout routine"
                value={formState.description}
                onChangeText={text => setFormState(prev => ({ ...prev, description: text }))}
                style={[styles.textInput, styles.multilineInput]}
                placeholderTextColor={colors.text.tertiary}
                multiline
                numberOfLines={2}
              />
            </View>

            <View style={styles.rowContainer}>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Duration (minutes)</Text>
                <TextInput
                  keyboardType="number-pad"
                  placeholder="45"
                  value={formState.estimated_duration_minutes}
                  onChangeText={text => setFormState(prev => ({ ...prev, estimated_duration_minutes: text }))}
                  style={styles.textInput}
                  placeholderTextColor={colors.text.tertiary}
                />
              </View>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Category</Text>
                <TouchableOpacity
                  style={[
                    styles.categoryButton,
                    selectedCategory && styles.selectedCategoryButton
                  ]}
                  onPress={() => {
                    // Cycle through categories or select first one if none selected
                    if (categories.length > 0) {
                      if (!selectedCategory) {
                        // No category selected, select the first one
                        setSelectedCategory(categories[0]);
                      } else {
                        // Find current category and select next one
                        const currentIndex = categories.findIndex(c => c.id === selectedCategory.id);
                        const nextIndex = (currentIndex + 1) % categories.length;
                        setSelectedCategory(categories[nextIndex]);
                      }
                    }
                  }}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    selectedCategory && styles.selectedCategoryButtonText
                  ]}>
                    {selectedCategory ? selectedCategory.name : 'Select Category'}
                  </Text>
                  {categories.length > 0 ? (
                    <Text style={styles.categoryHintText}>
                      Tap to cycle through categories
                    </Text>
                  ) : (
                    <Text style={styles.categoryHintText}>
                      No categories available
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Exercises Section */}
            <View style={styles.inputGroup}>
              <View style={styles.exercisesHeader}>
                <Text style={styles.sectionTitle}>Exercises</Text>
                <TouchableOpacity
                  onPress={addExercise}
                  style={styles.addExerciseButton}
                >
                  <Plus size={16} color={colors.primary[600]} />
                  <Text style={styles.addExerciseText}>Add Exercise</Text>
                </TouchableOpacity>
              </View>

              {formState.exercises.map((exercise, index) => (
                <View key={exercise.id} style={styles.exerciseCard}>
                  <View style={styles.exerciseHeader}>
                    <Text style={styles.exerciseTitle}>Exercise {index + 1}</Text>
                    <TouchableOpacity
                      onPress={() => removeExercise(index)}
                      style={styles.deleteExerciseButton}
                    >
                      <Trash2 size={16} color={colors.status.error} />
                    </TouchableOpacity>
                  </View>

                  <TextInput
                    placeholder="Exercise name"
                    value={exercise.name}
                    onChangeText={text => updateExercise(index, 'name', text)}
                    style={[styles.textInput, styles.exerciseNameInput]}
                    placeholderTextColor={colors.text.tertiary}
                  />

                  <View style={styles.exerciseRow}>
                    <View style={styles.exerciseField}>
                      <Text style={styles.exerciseFieldLabel}>Sets</Text>
                      <TextInput
                        keyboardType="number-pad"
                        placeholder="3"
                        value={exercise.sets.toString()}
                        onChangeText={text => updateExercise(index, 'sets', parseInt(text) || 0)}
                        style={styles.exerciseInput}
                        placeholderTextColor={colors.text.tertiary}
                      />
                    </View>
                    <View style={styles.exerciseField}>
                      <Text style={styles.exerciseFieldLabel}>Reps</Text>
                      <TextInput
                        keyboardType="number-pad"
                        placeholder="10"
                        value={exercise.reps.toString()}
                        onChangeText={text => updateExercise(index, 'reps', parseInt(text) || 0)}
                        style={styles.exerciseInput}
                        placeholderTextColor={colors.text.tertiary}
                      />
                    </View>
                    <View style={styles.exerciseField}>
                      <Text style={styles.exerciseFieldLabel}>Rest (sec)</Text>
                      <TextInput
                        keyboardType="number-pad"
                        placeholder="60"
                        value={exercise.rest_seconds.toString()}
                        onChangeText={text => updateExercise(index, 'rest_seconds', parseInt(text) || 0)}
                        style={styles.exerciseInput}
                        placeholderTextColor={colors.text.tertiary}
                      />
                    </View>
                  </View>

                  <View style={styles.exerciseRow}>
                    <View style={styles.exerciseField}>
                      <Text style={styles.exerciseFieldLabel}>Weight (kg)</Text>
                      <TextInput
                        keyboardType="numeric"
                        placeholder="0"
                        value={exercise.weight_kg}
                        onChangeText={text => updateExercise(index, 'weight_kg', text)}
                        style={styles.exerciseInput}
                        placeholderTextColor={colors.text.tertiary}
                      />
                    </View>
                    <View style={styles.exerciseField}>
                      <Text style={styles.exerciseFieldLabel}>Notes</Text>
                      <TextInput
                        placeholder="Optional notes"
                        value={exercise.notes}
                        onChangeText={text => updateExercise(index, 'notes', text)}
                        style={styles.exerciseInput}
                        placeholderTextColor={colors.text.tertiary}
                      />
                    </View>
                  </View>
                </View>
              ))}

              {formState.exercises.length === 0 && (
                <View style={styles.emptyState}>
                  <Dumbbell size={32} color={colors.text.tertiary} />
                  <Text style={styles.emptyStateText}>
                    No exercises added yet. Tap "Add Exercise" to get started.
                  </Text>
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={onClose}
                style={[styles.button, styles.cancelButton]}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmit}
                style={[styles.button, styles.submitButton]}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={colors.background.primary} />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {isEditing ? "Save Changes" : "Create Workout"}
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
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
    fontWeight: '500',
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
    textAlignVertical: 'top',
  },
  rowContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  halfWidth: {
    flex: 1,
    marginHorizontal: 4,
  },
  categoryButton: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background.primary,
  },
  selectedCategoryButton: {
    borderColor: colors.primary[600],
    backgroundColor: colors.primary[50],
  },
  categoryButtonText: {
    fontSize: 16,
    color: colors.text.tertiary,
  },
  selectedCategoryButtonText: {
    color: colors.primary[700],
  },
  categoryHintText: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 4,
    textAlign: 'center',
  },
  exercisesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[100],
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addExerciseText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary[700],
    marginLeft: 4,
  },
  exerciseCard: {
    backgroundColor: colors.background.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
  },
  deleteExerciseButton: {
    backgroundColor: colors.status.error + '20',
    padding: 8,
    borderRadius: 8,
  },
  exerciseNameInput: {
    marginBottom: 12,
  },
  exerciseRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  exerciseField: {
    flex: 1,
    marginHorizontal: 4,
  },
  exerciseFieldLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  exerciseInput: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.text.primary,
    backgroundColor: colors.background.primary,
  },
  emptyState: {
    backgroundColor: colors.background.card,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 24,
    paddingBottom: 40
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontWeight: '600',
    color: colors.text.secondary,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background.primary,
  },
});


