import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Dumbbell, TrendingUp, TrendingDown } from "lucide-react-native";
import { useThemedColors } from "../../hooks/useThemedColors";
import { formatSparklineData } from "./utils/exerciseProgressionUtils";

/**
 * Card component for displaying individual exercise progression
 */
export default function ExerciseProgressionCard({ 
    exercise, 
    onPress 
}) {
    const colors = useThemedColors();
    const sparklineData = formatSparklineData(exercise.data);
    const isPositive = exercise.progressionRate >= 0;
    const progressColor = isPositive ? colors.status.success : colors.status.error;
    const ProgressIcon = isPositive ? TrendingUp : TrendingDown;
    const dataPointCount = exercise.data.length;
    const first1RM = exercise.data[0]?.oneRM || 0;

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            style={{
                backgroundColor: colors.background.card,
                borderRadius: 16,
                padding: 0,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: colors.border.light,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 3,
                overflow: 'hidden',
            }}
        >
            {/* Card Content */}
            <View style={{ padding: 18 }}>
                {/* Header Row: Exercise Name and Progress Badge */}
                <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'flex-start', 
                    justifyContent: 'space-between',
                    marginBottom: 12,
                }}>
                    <View style={{ flex: 1, marginRight: 12 }}>
                        <Text 
                            style={{ 
                                fontSize: 17, 
                                fontWeight: '700', 
                                color: colors.text.primary,
                                marginBottom: 6,
                                letterSpacing: -0.3,
                            }}
                            numberOfLines={2}
                        >
                            {exercise.name}
                        </Text>
                    </View>
                    
                    {/* Progress Badge */}
                    <View style={{ 
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        gap: 4,
                        backgroundColor: progressColor + '20',
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: progressColor + '40',
                    }}>
                        <ProgressIcon size={14} color={progressColor} strokeWidth={2.5} />
                        <Text style={{ 
                            fontSize: 13, 
                            fontWeight: '700', 
                            color: progressColor,
                            letterSpacing: -0.2,
                        }}>
                            {isPositive ? '+' : ''}{exercise.progressionRate.toFixed(1)}%
                        </Text>
                    </View>
                </View>

                {/* Main Content Row: 1RM and Sparkline */}
                <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    gap: 16,
                }}>
                    {/* Left: 1RM Display */}
                    <View style={{ flex: 1 }}>
                        <View style={{ marginBottom: 4 }}>
                            <Text style={{ 
                                fontSize: 12, 
                                color: colors.text.tertiary,
                                fontWeight: '500',
                                textTransform: 'uppercase',
                                letterSpacing: 0.5,
                            }}>
                                Current 1RM
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                            <Text style={{ 
                                fontSize: 28, 
                                fontWeight: '800', 
                                color: colors.text.primary,
                                letterSpacing: -0.5,
                            }}>
                                {exercise.last1RM.toFixed(1)}
                            </Text>
                            <Text style={{ 
                                fontSize: 16, 
                                fontWeight: '600', 
                                color: colors.text.secondary,
                                marginBottom: 2,
                            }}>
                                kg
                            </Text>
                        </View>
                        {first1RM > 0 && (
                            <Text style={{ 
                                fontSize: 12, 
                                color: colors.text.tertiary,
                                marginTop: 4,
                            }}>
                                Started at {first1RM.toFixed(1)} kg
                            </Text>
                        )}
                    </View>

                    {/* Right: Trend Status */}
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ 
                            fontSize: 11, 
                            color: colors.text.tertiary,
                            fontWeight: '500',
                            marginBottom: 4,
                            textTransform: 'uppercase',
                            letterSpacing: 0.3,
                        }}>
                            Trend
                        </Text>
                        <View style={{ 
                            width: 100, 
                            height: 48,
                            backgroundColor: colors.background.primary,
                            borderRadius: 10,
                            padding: 6,
                            borderWidth: 1,
                            borderColor: colors.border.light,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <Text style={{ 
                                fontSize: 12, 
                                color: sparklineData.length > 1 ? progressColor : colors.text.tertiary, 
                                fontWeight: '600' 
                            }}>
                                {sparklineData.length > 1 ? 'Trending' : 'No trend'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Footer: Data Points Count */}
                <View style={{ 
                    marginTop: 12,
                    paddingTop: 12,
                    borderTopWidth: 1,
                    borderTopColor: colors.border.light,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Dumbbell size={14} color={colors.text.tertiary} />
                        <Text style={{ 
                            fontSize: 12, 
                            color: colors.text.tertiary,
                            fontWeight: '500',
                        }}>
                            {dataPointCount} {dataPointCount === 1 ? 'record' : 'records'}
                        </Text>
                    </View>
                    <Text style={{ 
                        fontSize: 11, 
                        color: colors.text.tertiary,
                        fontStyle: 'italic',
                    }}>
                        Tap to view details →
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}
