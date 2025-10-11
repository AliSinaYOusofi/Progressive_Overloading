import React from "react";
import { View, Text } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { colors } from "../../constants/ui_colors";

export default function StrengthStandards({ strengthStandards }) {
    const getStrengthLevel = (relativeStrength, exercise) => {
        // Basic strength standards (simplified)
        const standards = {
            'Bench Press': { beginner: 0.75, intermediate: 1.0, advanced: 1.25 },
            'Squat': { beginner: 1.0, intermediate: 1.5, advanced: 2.0 },
            'Deadlift': { beginner: 1.25, intermediate: 1.75, advanced: 2.5 },
            'Overhead Press': { beginner: 0.5, intermediate: 0.75, advanced: 1.0 }
        };
        
        const exerciseStandards = standards[exercise] || { beginner: 0.5, intermediate: 1.0, advanced: 1.5 };
        
        if (relativeStrength >= exerciseStandards.advanced) return { level: "Advanced", color: colors.status.success };
        if (relativeStrength >= exerciseStandards.intermediate) return { level: "Intermediate", color: colors.status.warning };
        return { level: "Beginner", color: colors.status.info };
    };

    if (!strengthStandards || strengthStandards.length === 0) {
        return null;
    }

    return (
        <View>
            <View className="gap-3">
                {strengthStandards.map((standard, index) => {
                    const strengthLevel = getStrengthLevel(standard.relativeStrength, standard.exercise);
                    return (
                        <View key={index} className="bg-white rounded-xl p-4 shadow-sm">
                            <View className="flex-row justify-between items-center mb-2">
                                <Text className="text-base font-semibold text-slate-900">{standard.exercise}</Text>
                                <View 
                                    className="px-2 py-1 rounded-xl"
                                    style={{ backgroundColor: strengthLevel.color }}
                                >
                                    <Text className="text-xs font-semibold text-white">{strengthLevel.level}</Text>
                                </View>
                            </View>
                            <View className="flex-row justify-between items-center">
                                <Text className="text-lg font-bold text-slate-900">
                                    {standard.oneRM.toFixed(1)} kg
                                </Text>
                                <Text className="text-sm text-slate-700">
                                    {standard.relativeStrength.toFixed(2)}x bodyweight
                                </Text>
                            </View>
                        </View>
                    );
                })}
            </View>
            
            {/* Strength Level Distribution Pie Chart */}
            {strengthStandards.length > 1 && (
                <View className="bg-white rounded-xl p-6 shadow-sm mt-4">
                    <Text className="text-base font-semibold text-slate-900 mb-6 text-center">Strength Level Distribution</Text>
                    <View className="items-center h-48 justify-center">
                        <PieChart
                            data={strengthStandards.map((standard, index) => {
                                const strengthLevel = getStrengthLevel(standard.relativeStrength, standard.exercise);
                                return {
                                    value: 1,
                                    color: strengthLevel.color,
                                    text: standard.exercise,
                                    textColor: colors.text.white,
                                    textSize: 9
                                };
                            })}
                            radius={70}
                            innerRadius={35}
                            centerLabelComponent={() => (
                                <View className="items-center">
                                    <Text className="text-lg font-bold text-slate-900">
                                        {strengthStandards.length}
                                    </Text>
                                    <Text className="text-xs text-slate-600">Exercises</Text>
                                </View>
                            )}
                        />
                    </View>
                </View>
            )}
        </View>
    );
}
