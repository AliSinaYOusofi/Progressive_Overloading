import React, { useState, useEffect } from "react";
import { View, Text, Dimensions, TouchableOpacity } from "react-native";
import { Dumbbell } from "lucide-react-native";
import { PieChart } from "react-native-gifted-charts";
import { colors } from "../../constants/ui_colors";
import { getCurrentUser } from "../../lib/database";
import ExerciseDetailModal from "./ExerciseDetailModal";

const { width: screenWidth } = Dimensions.get('window');

export default function ExerciseProgression({ exerciseProgression }) {
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        const user = await getCurrentUser();
        if (user) {
            setUserId(user.id);
        }
    };

    const handleExercisePress = (exerciseName) => {
        setSelectedExercise(exerciseName);
        setShowDetailModal(true);
    };

    if (!exerciseProgression) {
        return null;
    }

    const getExerciseNames = () => {
        return Object.keys(exerciseProgression || {}).slice(0, 5);
    };

    const calculateProgressionRate = (exerciseData) => {
        if (!exerciseData || !Array.isArray(exerciseData) || exerciseData.length < 2) return 0;
        const first = exerciseData[0]?.oneRM || 0;
        const last = exerciseData[exerciseData.length - 1]?.oneRM || 0;
        return last > first ? ((last - first) / first) * 100 : 0;
    };

    // Build pie slices using the latest 1RM per exercise (top 5)
    const buildPieData = () => {
        const exerciseNames = getExerciseNames();
        const slices = [];
        // Distinct color palette for better visibility
        const colorPalette = [
            '#10b981', // emerald-500
            '#3b82f6', // blue-500
            '#8b5cf6', // violet-500
            '#f59e0b', // amber-500
            '#ef4444', // red-500
            '#06b6d4', // cyan-500
            '#ec4899', // pink-500
            '#84cc16', // lime-500
            '#f97316', // orange-500
            '#6366f1', // indigo-500
        ];
        exerciseNames.forEach((name, idx) => {
            const data = exerciseProgression[name] || [];
            if (!data.length) return;
            const last = data[data.length - 1]?.oneRM || 0;
            slices.push({
                value: Math.max(0, last),
                color: colorPalette[idx % colorPalette.length],
                text: last > 0 ? String(Math.round(last)) : '',
                textColor: colors.text?.white || 'white',
                textSize: 10,
                label: name,
            });
        });
        // If all zeros, return empty to trigger fallback
        const total = slices.reduce((s, d) => s + d.value, 0);
        return total > 0 ? slices : [];
    };

    return (
        <View>
            {Object.keys(exerciseProgression).length > 0 ? (
                <View className="bg-white rounded-xl p-6 shadow-sm">
                    <View className="items-center h-56 justify-center">
                        {buildPieData().length > 0 ? (
                            <PieChart
                                data={buildPieData()}
                                radius={80}
                                innerRadius={40}
                                showText
                                textColor={colors.text?.white || 'white'}
                                textSize={10}
                                centerLabelComponent={() => (
                                    <View className="items-center">
                                        <Text className="text-lg font-bold text-slate-900">
                                            {getExerciseNames().length}
                                        </Text>
                                        <Text className="text-xs text-slate-600">Exercises</Text>
                                    </View>
                                )}
                            />
                        ) : (
                            <Text className="text-slate-600">No progression data</Text>
                        )}
                    </View>
                    {/* Legend */}
                    {buildPieData().length > 0 && (
                        <View className="flex-row flex-wrap justify-center mt-4">
                            {buildPieData().map((slice, idx) => (
                                <TouchableOpacity 
                                    key={idx} 
                                    className="flex-row items-center mx-2 my-1"
                                    onPress={() => handleExercisePress(slice.label)}
                                    activeOpacity={0.7}
                                >
                                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: slice.color, marginRight: 6 }} />
                                    <Text className="text-xs" style={{ color: colors.text?.secondary || '#666', textDecorationLine: 'underline' }}>
                                        {slice.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            ) : (
                <View className="bg-white rounded-xl p-8 items-center shadow-sm">
                    <Dumbbell size={48} color={colors.text?.tertiary || '#999'} />
                    <Text className="text-base font-semibold text-slate-900 mt-3 mb-1">No exercise data yet</Text>
                    <Text className="text-sm text-slate-700 text-center">Start logging sets to see your progression!</Text>
                </View>
            )}

            {/* Exercise Detail Modal */}
            {selectedExercise && userId && (
                <ExerciseDetailModal
                    visible={showDetailModal}
                    onClose={() => setShowDetailModal(false)}
                    exerciseName={selectedExercise}
                    userId={userId}
                />
            )}
        </View>
    );
}
