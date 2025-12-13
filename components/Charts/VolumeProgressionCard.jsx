import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Calendar, TrendingUp, TrendingDown, Minus } from "lucide-react-native";
import { useThemedColors } from "../../hooks/useThemedColors";
import { formatVolumeTrendData, calculateVolumeTrend } from "./utils/volumeProgressionUtils";

/**
 * Card component for displaying individual daily volume progression
 */
export default function VolumeProgressionCard({ 
    volumeEntry,
    onPress 
}) {
    const colors = useThemedColors();
    const trendData = formatVolumeTrendData([volumeEntry]);
    const hasTrend = trendData.length > 0;
    
    // Format date
    const formattedDate = new Date(volumeEntry.date).toLocaleDateString("en", { 
        month: "short", 
        day: "numeric",
        year: "numeric"
    });
    
    // Format volume with appropriate unit
    const formatVolume = (volume) => {
        if (volume >= 1000) {
            return `${(volume / 1000).toFixed(1)}k`;
        }
        return volume.toFixed(0);
    };

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
                {/* Header Row: Date and Trend Status */}
                <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'flex-start', 
                    justifyContent: 'space-between',
                    marginBottom: 12,
                }}>
                    <View style={{ flex: 1, marginRight: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                            <Calendar size={16} color={colors.text.secondary} />
                            <Text 
                                style={{ 
                                    fontSize: 17, 
                                    fontWeight: '700', 
                                    color: colors.text.primary,
                                    letterSpacing: -0.3,
                                }}
                            >
                                {formattedDate}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Main Content Row: Volume and Trend */}
                <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    gap: 16,
                }}>
                    {/* Left: Volume Display */}
                    <View style={{ flex: 1 }}>
                        <View style={{ marginBottom: 4 }}>
                            <Text style={{ 
                                fontSize: 12, 
                                color: colors.text.tertiary,
                                fontWeight: '500',
                                textTransform: 'uppercase',
                                letterSpacing: 0.5,
                            }}>
                                Total Volume
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                            <Text style={{ 
                                fontSize: 28, 
                                fontWeight: '800', 
                                color: colors.text.primary,
                                letterSpacing: -0.5,
                            }}>
                                {formatVolume(volumeEntry.totalVolume)}
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
                        {volumeEntry.exerciseCount > 0 && (
                            <Text style={{ 
                                fontSize: 12, 
                                color: colors.text.tertiary,
                                marginTop: 4,
                            }}>
                                {volumeEntry.exerciseCount} {volumeEntry.exerciseCount === 1 ? 'exercise' : 'exercises'}
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
                                color: hasTrend ? colors.primary[600] : colors.text.tertiary, 
                                fontWeight: '600' 
                            }}>
                                {hasTrend ? 'Trending' : 'No trend'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Footer: Exercise List */}
                {volumeEntry.exercises && volumeEntry.exercises.length > 0 && (
                    <View style={{ 
                        marginTop: 12,
                        paddingTop: 12,
                        borderTopWidth: 1,
                        borderTopColor: colors.border.light,
                    }}>
                        <Text style={{ 
                            fontSize: 11, 
                            color: colors.text.tertiary,
                            fontWeight: '500',
                            marginBottom: 6,
                            textTransform: 'uppercase',
                            letterSpacing: 0.3,
                        }}>
                            Exercises
                        </Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                            {volumeEntry.exercises.slice(0, 5).map((exercise, index) => (
                                <View
                                    key={index}
                                    style={{
                                        backgroundColor: colors.primary[50],
                                        paddingHorizontal: 10,
                                        paddingVertical: 4,
                                        borderRadius: 12,
                                        borderWidth: 1,
                                        borderColor: colors.primary[200],
                                    }}
                                >
                                    <Text style={{
                                        fontSize: 12,
                                        fontWeight: '500',
                                        color: colors.primary[700],
                                    }}>
                                        {exercise}
                                    </Text>
                                </View>
                            ))}
                            {volumeEntry.exercises.length > 5 && (
                                <View
                                    style={{
                                        backgroundColor: colors.background.primary,
                                        paddingHorizontal: 10,
                                        paddingVertical: 4,
                                        borderRadius: 12,
                                        borderWidth: 1,
                                        borderColor: colors.border.light,
                                    }}
                                >
                                    <Text style={{
                                        fontSize: 12,
                                        fontWeight: '500',
                                        color: colors.text.tertiary,
                                    }}>
                                        +{volumeEntry.exercises.length - 5} more
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* Footer: Tap to view details */}
                <View style={{ 
                    marginTop: 12,
                    paddingTop: 12,
                    borderTopWidth: 1,
                    borderTopColor: colors.border.light,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                }}>
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
