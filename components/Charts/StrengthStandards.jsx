import React from "react";
import { View, Text } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { useThemedColors } from "../../hooks/useThemedColors";

export default function StrengthStandards({ strengthStandards }) {
    const colors = useThemedColors();
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
            <View style={{ gap: 12 }}>
                {strengthStandards.map((standard, index) => {
                    const strengthLevel = getStrengthLevel(standard.relativeStrength, standard.exercise);
                    return (
                        <View 
                            key={index} 
                            style={{
                                backgroundColor: colors.background.card,
                                borderRadius: 12,
                                padding: 16,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.05,
                                shadowRadius: 2,
                                elevation: 2
                            }}
                        >
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text.primary }}>{standard.exercise}</Text>
                                <View 
                                    style={{
                                        paddingHorizontal: 8,
                                        paddingVertical: 4,
                                        borderRadius: 12,
                                        backgroundColor: strengthLevel.color
                                    }}
                                >
                                    <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text.white }}>{strengthLevel.level}</Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text.primary }}>
                                    {standard.oneRM.toFixed(1)} kg
                                </Text>
                                <Text style={{ fontSize: 14, color: colors.text.secondary }}>
                                    {standard.relativeStrength.toFixed(2)}x bodyweight
                                </Text>
                            </View>
                        </View>
                    );
                })}
            </View>
            
            {/* Strength Level Distribution Pie Chart */}
            {strengthStandards.length > 1 && (
                <View style={{
                    backgroundColor: colors.background.card,
                    borderRadius: 12,
                    padding: 24,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 2,
                    marginTop: 16
                }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text.primary, marginBottom: 24, textAlign: 'center' }}>Strength Level Distribution</Text>
                    <View style={{ alignItems: 'center', height: 192, justifyContent: 'center' }}>
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
                            innerCircleColor={colors.background.card}
                            centerLabelComponent={() => (
                                <View style={{ alignItems: 'center' }}>
                                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text.primary }}>
                                        {strengthStandards.length}
                                    </Text>
                                    <Text style={{ fontSize: 12, color: colors.text.secondary }}>Exercises</Text>
                                </View>
                            )}
                        />
                    </View>
                </View>
            )}
        </View>
    );
}
