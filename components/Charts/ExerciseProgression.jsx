import React from "react";
import { View, Text, Dimensions } from "react-native";
import { Dumbbell } from "lucide-react-native";
import { PieChart } from "react-native-gifted-charts";
import { colors } from "../../constants/ui_colors";

const { width: screenWidth } = Dimensions.get('window');

export default function ExerciseProgression({ exerciseProgression }) {
    const getExerciseNames = () => {
        return Object.keys(exerciseProgression).slice(0, 5);
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
        const colorVariants = [colors.primary[600], colors.primary[500], colors.primary[700] || colors.primary[600], colors.status.success, colors.status.warning];
        exerciseNames.forEach((name, idx) => {
            const data = exerciseProgression[name] || [];
            if (!data.length) return;
            const last = data[data.length - 1]?.oneRM || 0;
            slices.push({
                value: Math.max(0, last),
                color: colorVariants[idx % colorVariants.length],
                text: last > 0 ? String(Math.round(last)) : '',
                textColor: colors.text.white,
                textSize: 10,
                label: name,
            });
        });
        // If all zeros, return empty to trigger fallback
        const total = slices.reduce((s, d) => s + d.value, 0);
        return total > 0 ? slices : [];
    };

    return (
        <View className="mb-8">
            <View className="flex-row items-center justify-between mb-1">
                <Text className="text-xl font-semibold text-slate-900">Exercise Progression</Text>
            </View>
            <Text className="text-sm text-slate-700 mb-4">Current 1RM distribution (top exercises)</Text>
            
            {Object.keys(exerciseProgression).length > 0 ? (
                <View className="bg-white rounded-xl p-6 shadow-sm">
                    <View className="items-center h-56 justify-center">
                        <PieChart
                            data={buildPieData()}
                            radius={80}
                            innerRadius={40}
                            showText
                            textColor={colors.text.white}
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
                    </View>
                    {/* Legend */}
                    <View className="flex-row flex-wrap justify-center mt-4">
                        {buildPieData().map((slice, idx) => (
                            <View key={idx} className="flex-row items-center mx-2 my-1">
                                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: slice.color, marginRight: 6 }} />
                                <Text className="text-xs" style={{ color: colors.text.secondary }}>{slice.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            ) : (
                <View className="bg-white rounded-xl p-8 items-center shadow-sm">
                    <Dumbbell size={48} color={colors.text.tertiary} />
                    <Text className="text-base font-semibold text-slate-900 mt-3 mb-1">No exercise data yet</Text>
                    <Text className="text-sm text-slate-700 text-center">Start logging sets to see your progression!</Text>
                </View>
            )}
        </View>
    );
}
