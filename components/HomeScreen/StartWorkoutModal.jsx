import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  ScrollView,
  Alert 
} from "react-native";
import { X, Play, Clock, Target, Dumbbell } from "lucide-react-native";
import { colors } from "../../constants/ui_colors";

export default function StartWorkoutModal({
  visible,
  onClose,
  onStartWorkout,
  workoutTemplate
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleStartWorkout = async () => {
    if (!workoutTemplate) return;
    
    setIsLoading(true);
    try {
      await onStartWorkout(workoutTemplate);
      onClose();
    } catch (error) {
      Alert.alert("Error", "Failed to start workout. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!workoutTemplate) return null;

  const exerciseCount = workoutTemplate.workout_template_exercises?.length || 0;
  const estimatedDuration = workoutTemplate.estimated_duration_minutes || 45;

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[80%]">
          <ScrollView className="p-6" showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-900 text-xl font-bold">Start Workout</Text>
              <TouchableOpacity onPress={onClose} className="p-2 rounded-lg bg-gray-100">
                <X size={18} color={colors.text.tertiary} />
              </TouchableOpacity>
            </View>

            {/* Workout Info */}
            <View className="bg-emerald-50 rounded-xl p-4 mb-6">
              <Text className="text-emerald-800 text-lg font-semibold mb-2">
                {workoutTemplate.name}
              </Text>
              {workoutTemplate.description && (
                <Text className="text-emerald-700 mb-3">
                  {workoutTemplate.description}
                </Text>
              )}
              
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Dumbbell size={16} color={colors.primary[600]} />
                  <Text className="text-emerald-700 ml-2 font-medium">
                    {exerciseCount} exercises
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Clock size={16} color={colors.primary[600]} />
                  <Text className="text-emerald-700 ml-2 font-medium">
                    ~{estimatedDuration} min
                  </Text>
                </View>
              </View>
            </View>

            {/* Exercise Preview */}
            <View className="mb-6">
              <Text className="text-gray-700 text-lg font-medium mb-3">Workout Plan</Text>
              {workoutTemplate.workout_template_exercises?.map((exercise, index) => (
                <View key={exercise.id} className="bg-gray-50 rounded-lg p-3 mb-2">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-gray-900 font-medium">
                      {index + 1}. {exercise.exercises?.name || exercise.name || 'Exercise'}
                    </Text>
                    <View className="flex-row items-center">
                      <Text className="text-gray-600 text-sm mr-2">
                        {exercise.sets}×{exercise.reps}
                      </Text>
                      {exercise.weight_kg && (
                        <Text className="text-gray-600 text-sm">
                          @{exercise.weight_kg}kg
                        </Text>
                      )}
                    </View>
                  </View>
                  {exercise.notes && (
                    <Text className="text-gray-500 text-sm mt-1">{exercise.notes}</Text>
                  )}
                </View>
              ))}
            </View>

            {/* Tips */}
            <View className="bg-blue-50 rounded-xl p-4 mb-6">
              <Text className="text-blue-800 font-medium mb-2">💡 Pro Tips</Text>
              <Text className="text-blue-700 text-sm">
                • Warm up properly before starting{'\n'}
                • Focus on form over weight{'\n'}
                • Take adequate rest between sets{'\n'}
                • Stay hydrated throughout
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
                onPress={handleStartWorkout}
                disabled={isLoading}
                className={`flex-1 rounded-xl py-4 ml-2 items-center flex-row justify-center ${
                  isLoading ? 'bg-gray-400' : 'bg-emerald-600'
                }`}
              >
                <Play size={20} color={isLoading ? colors.text.tertiary : colors.text.white} />
                <Text className={`font-semibold ml-2 ${
                  isLoading ? 'text-gray-500' : 'text-white'
                }`}>
                  {isLoading ? 'Starting...' : 'Start Workout'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
