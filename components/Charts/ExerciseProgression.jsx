import React, { useState, useEffect } from "react";
import { View, Text, Dimensions, TouchableOpacity } from "react-native";
import { Dumbbell } from "lucide-react-native";
import { PieChart } from "react-native-gifted-charts";
import { useThemedColors } from "../../hooks/useThemedColors";
import { getCurrentUser } from "../../lib/database";
import ExerciseDetailModal from "./ExerciseDetailModal";

const { width: screenWidth } = Dimensions.get('window');

export default function ExerciseProgression({ exerciseProgression }) {
    const colors = useThemedColors();
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
                <View style={{
                    backgroundColor: colors.background.card,
                    borderRadius: 12,
                    padding: 24,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 2
                }}>
                    <View style={{ alignItems: 'center', height: 224, justifyContent: 'center' }}>
                        {buildPieData().length > 0 ? (
                            <PieChart
                                data={buildPieData()}
                                radius={80}
                                innerRadius={40}
                                innerCircleColor={colors.background.card}
                                showText
                                textColor={colors.text?.white || 'white'}
                                textSize={10}
                                centerLabelComponent={() => (
                                    <View style={{ alignItems: 'center' }}>
                                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text.primary }}>
                                            {getExerciseNames().length}
                                        </Text>
                                        <Text style={{ fontSize: 12, color: colors.text.secondary }}>Exercises</Text>
                                    </View>
                                )}
                            />
                        ) : (
                            <Text style={{ color: colors.text.secondary }}>No progression data</Text>
                        )}
                    </View>
                    {/* Legend */}
                    {buildPieData().length > 0 && (
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 16 }}>
                            {buildPieData().map((slice, idx) => (
                                <TouchableOpacity 
                                    key={idx} 
                                    style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 8, marginVertical: 4 }}
                                    onPress={() => handleExercisePress(slice.label)}
                                    activeOpacity={0.7}
                                >
                                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: slice.color, marginRight: 6 }} />
                                    <Text style={{ fontSize: 12, color: colors.text.secondary, textDecorationLine: 'underline' }}>
                                        {slice.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            ) : (
                <View style={{
                    backgroundColor: colors.background.card,
                    borderRadius: 12,
                    padding: 32,
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 2
                }}>
                    <Dumbbell size={48} color={colors.text.tertiary} />
                    <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text.primary, marginTop: 12, marginBottom: 4 }}>No exercise data yet</Text>
                    <Text style={{ fontSize: 14, color: colors.text.secondary, textAlign: 'center' }}>Start logging sets to see your progression!</Text>
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
