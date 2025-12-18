import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, Dimensions, TouchableOpacity } from "react-native";
import { Activity } from "lucide-react-native";
import { Ionicons } from "@expo/vector-icons";
import { PieChart, RadarChart } from "react-native-gifted-charts";
import { useThemedColors } from "../../hooks/useThemedColors";
import { useTheme } from "../../contexts/ThemeContext";
import MuscleGroupExerciseModal from "./MuscleGroupExerciseModal";
import { formatShortNumber } from "../../utils/numberUtils";

const { width: screenWidth } = Dimensions.get('window');

/**
 * Normalize muscle group name for display
 * @param {string} muscleGroup - Muscle group name (e.g., "abdominals")
 * @returns {string} Formatted name (e.g., "Abdominals")
 */
const formatMuscleGroupName = (muscleGroup) => {
  if (!muscleGroup) return "";
  return muscleGroup
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};


/**
 * Get color intensity based on volume (relative to max volume)
 * @param {number} volume - Current volume
 * @param {number} maxVolume - Maximum volume in dataset
 * @param {Object} colors - Theme colors
 * @param {boolean} isDarkMode - Dark mode flag
 * @returns {string} Color for indicator bar
 */
const getColorIntensity = (volume, maxVolume, colors, isDarkMode) => {
  if (maxVolume === 0) return colors.primary[200];
  
  const intensity = volume / maxVolume; // 0 to 1
  
  if (intensity >= 0.8) {
    return colors.primary[600];
  } else if (intensity >= 0.6) {
    return colors.primary[500];
  } else if (intensity >= 0.4) {
    return colors.primary[400];
  } else if (intensity >= 0.2) {
    return colors.primary[300];
  } else {
    return colors.primary[200];
  }
};

export default function MuscleGroupHeatmap({ heatmapData, timeframe = 30 }) {
  const colors = useThemedColors();
  const { isDarkMode } = useTheme();
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(null);
  const [showExerciseModal, setShowExerciseModal] = useState(false);

  // Calculate max volume for color gradient
  const maxVolume = useMemo(() => {
    if (!heatmapData || heatmapData.length === 0) return 0;
    return Math.max(...heatmapData.map(item => item.volume));
  }, [heatmapData]);

  // Empty state
  if (!heatmapData || heatmapData.length === 0) {
    return (
      <View style={{ 
        alignItems: "center", 
        justifyContent: "center", 
        paddingVertical: 60 
      }}>
        <Ionicons name="fitness-outline" size={48} color={colors.text.tertiary} />
        <Text style={{ 
          fontSize: 16, 
          color: colors.text.secondary,
          marginTop: 16,
          textAlign: 'center',
        }}>
          No muscle group data available
        </Text>
        <Text style={{ 
          fontSize: 14, 
          color: colors.text.tertiary,
          marginTop: 8,
          textAlign: 'center',
        }}>
          Log more exercises to see your muscle group heatmap
        </Text>
      </View>
    );
  }

  // Color palettes - distinct colors for each chart to avoid confusion
  const barChartColors = useMemo(() => [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#F97316', // Orange
  ], []);

  const pieChartColors = useMemo(() => [
    '#6366F1', // Indigo
    '#14B8A6', // Teal
    '#FBBF24', // Yellow
    '#DC2626', // Red
    '#9333EA', // Violet
    '#059669', // Emerald
  ], []);


  // Prepare pie chart data for muscle group distribution
  const pieChartData = useMemo(() => {
    if (!heatmapData || heatmapData.length === 0) return [];
    
    // Show top 6 muscle groups for pie chart
    const topGroups = heatmapData.slice(0, 6);
    const totalVolume = topGroups.reduce((sum, item) => sum + item.volume, 0);
    
    if (totalVolume === 0) return [];
    
    return topGroups.map((item, index) => {
      const muscleGroupName = formatMuscleGroupName(item.muscleGroup);
      const percentage = (item.volume / totalVolume) * 100;
      
      return {
        value: percentage,
        color: pieChartColors[index % pieChartColors.length],
        text: percentage >= 5 ? `${percentage.toFixed(0)}%` : '', // Only show text if >= 5%
        textColor: colors.text.white,
        textSize: 10,
        focused: false,
      };
    });
  }, [heatmapData, colors, pieChartColors]);

  // Prepare radar chart data for muscle group volume
  const radarChartData = useMemo(() => {
    if (!heatmapData || heatmapData.length === 0) return [];
    
    // Show top 6-8 muscle groups for radar chart (optimal for radar visualization)
    const topGroups = heatmapData.slice(0, 8);
    
    // Normalize values to 0-100 scale based on max volume
    const normalizedData = topGroups.map((item) => {
      const percentage = maxVolume > 0 ? (item.volume / maxVolume) * 100 : 0;
      return percentage;
    });
    
    return normalizedData;
  }, [heatmapData, maxVolume]);

  // Prepare radar chart labels
  const radarChartLabels = useMemo(() => {
    if (!heatmapData || heatmapData.length === 0) return [];
    const topGroups = heatmapData.slice(0, 8);
    return topGroups.map((item) => {
      const name = formatMuscleGroupName(item.muscleGroup);
      return name.length > 10 ? name.substring(0, 10) : name;
    });
  }, [heatmapData, colors]);

  // Handle muscle group card press
  const handleMuscleGroupPress = (muscleGroupItem) => {
    setSelectedMuscleGroup(muscleGroupItem);
    setShowExerciseModal(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowExerciseModal(false);
    setSelectedMuscleGroup(null);
  };

  return (
    <View style={{ marginTop: 8 }}>
      {/* Muscle Group Cards Grid */}
      <View style={{ 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 16
      }}>
        {heatmapData.map((item, index) => {
          const muscleGroupName = formatMuscleGroupName(item.muscleGroup);
          const intensityColor = getColorIntensity(item.volume, maxVolume, colors, isDarkMode);
          const intensity = maxVolume > 0 ? (item.volume / maxVolume) * 100 : 0;
          
          return (
            <View
              key={item.muscleGroup || index}
              style={{
                width: '48%',
                backgroundColor: colors.background.card,
                borderRadius: 12,
                padding: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 2,
                minHeight: 140,
              }}
            >
              {/* Intensity Indicator Bar */}
              <View style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                backgroundColor: intensityColor,
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
              }} />

              {/* Muscle Group Name */}
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: colors.text.primary,
                  marginBottom: 12,
                  marginTop: 4,
                }}
                numberOfLines={2}
              >
                {muscleGroupName}
              </Text>

              {/* Volume */}
              <View style={{ marginBottom: 8 }}>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: '800',
                    color: colors.text.primary,
                    marginBottom: 2,
                  }}
                >
                  {formatShortNumber(item.volume)}
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    color: colors.text.secondary,
                  }}
                >
                  kg volume
                </Text>
              </View>

              {/* Stats Row */}
              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between',
                marginTop: 'auto',
                paddingTop: 8,
                borderTopWidth: 1,
                borderTopColor: colors.border.light,
              }}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: colors.text.primary,
                    }}
                  >
                    {item.sets}
                  </Text>
                  <Text
                    style={{
                      fontSize: 10,
                      color: colors.text.secondary,
                    }}
                  >
                    sets
                  </Text>
                </View>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: colors.text.primary,
                    }}
                  >
                    {item.exerciseCount}
                  </Text>
                  <Text
                    style={{
                      fontSize: 10,
                      color: colors.text.secondary,
                    }}
                  >
                    exercises
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      {/* Pie Chart for Distribution */}
      {pieChartData.length > 0 && (
        <View style={{
          backgroundColor: colors.background.card,
          borderRadius: 12,
          padding: 24,
          marginBottom: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 2
        }}>
          <Text style={{ 
            fontSize: 16, 
            fontWeight: '600', 
            color: colors.text.primary, 
            marginBottom: 16,
            textAlign: 'center'
          }}>
            Muscle Group Distribution
          </Text>
          <View style={{ alignItems: 'center', height: 220, justifyContent: 'center' }}>
            <PieChart
              data={pieChartData}
              radius={80}
              innerRadius={40}
              innerCircleColor={colors.background.card}
              centerLabelComponent={() => {
                const topGroup = heatmapData[0];
                return (
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.text.primary }}>
                      {formatMuscleGroupName(topGroup?.muscleGroup || '')}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.text.secondary }}>
                      Top Group
                    </Text>
                  </View>
                );
              }}
            />
          </View>
          {/* Legend */}
          <View style={{ marginTop: 16, gap: 8 }}>
            {heatmapData.slice(0, 6).map((item, index) => {
              return (
                <View key={item.muscleGroup} style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  paddingVertical: 4
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <View style={{
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: pieChartColors[index % pieChartColors.length],
                      marginRight: 8
                    }} />
                    <Text style={{ 
                      fontSize: 13, 
                      color: colors.text.primary,
                      flex: 1
                    }} numberOfLines={1}>
                      {formatMuscleGroupName(item.muscleGroup)}
                    </Text>
                  </View>
                  <Text style={{ 
                    fontSize: 13, 
                    fontWeight: '600',
                    color: colors.text.secondary 
                  }}>
                    {formatShortNumber(item.volume)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Radar Chart for Muscle Group Volume */}
      {radarChartData.length > 0 && radarChartLabels.length > 0 && (
        <View style={{
          backgroundColor: colors.background.card,
          borderRadius: 12,
          padding: 24,
          marginBottom: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 2
        }}>
          <Text style={{ 
            fontSize: 16, 
            fontWeight: '600', 
            color: colors.text.primary, 
            marginBottom: 16,
            textAlign: 'center'
          }}>
            Muscle Group Volume Comparison
          </Text>
          <View style={{ alignItems: 'center', justifyContent: 'center', height: 300 }}>
            <RadarChart
              data={radarChartData}
              labels={radarChartLabels}
              height={250}
              width={Math.min(screenWidth - 100, 300)}
              dataPointsColor={colors.primary[600]}
              dataPointsRadius={4}
              fillColor={colors.primary[600] + '40'}
              strokeColor={colors.primary[600]}
              strokeWidth={2}
              innerRadius={20}
              outerRadius={100}
              labelConfig={{
                stroke: colors.text.primary,
                fontWeight: '500',
                fontSize: 11,
              }}
              isAnimated={true}
              animationDuration={1000}
              maxValue={100}
              noOfSections={5}
            />
          </View>
        </View>
      )}

      {/* Muscle Groups List Section */}
      {heatmapData.length > 0 && (
        <View style={{
          backgroundColor: colors.background.card,
          borderRadius: 12,
          padding: 24,
          marginBottom: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 2
        }}>
          {/* Header */}
          <Text style={{ 
            fontSize: 16, 
            fontWeight: '600', 
            color: colors.text.primary, 
            marginBottom: 16,
          }}>
            Muscle Groups
          </Text>

          {/* Muscle Group Cards List */}
          <View style={{ gap: 12 }}>
            {heatmapData.slice(0, 8).map((item, index) => {
              const percentage = maxVolume > 0 ? (item.volume / maxVolume) * 100 : 0;
              return (
                <TouchableOpacity
                  key={item.muscleGroup}
                  onPress={() => handleMuscleGroupPress(item)}
                  activeOpacity={0.7}
                  style={{ 
                    backgroundColor: colors.background.card,
                    borderRadius: 12,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: colors.border.light,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                  }}
                >
                  <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    marginBottom: 12,
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <Text style={{
                        fontSize: 13,
                        fontWeight: '600',
                        color: colors.text.tertiary,
                        marginRight: 10,
                        minWidth: 20,
                      }}>
                        {index + 1}.
                      </Text>
                      <Text style={{ 
                        fontSize: 15, 
                        fontWeight: '600',
                        color: colors.text.primary,
                        flex: 1
                      }} numberOfLines={1}>
                        {formatMuscleGroupName(item.muscleGroup)}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ 
                        fontSize: 15, 
                        fontWeight: '600',
                        color: colors.text.primary 
                      }}>
                        {formatShortNumber(item.volume)}
                      </Text>
                      <Text style={{ 
                        fontSize: 12, 
                        color: colors.text.secondary 
                      }}>
                        {percentage.toFixed(0)}%
                      </Text>
                    </View>
                  </View>
                  
                  {/* Footer: Tap to view details */}
                  <View style={{ 
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
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* Muscle Group Exercise Modal */}
      {selectedMuscleGroup && (
        <MuscleGroupExerciseModal
          visible={showExerciseModal}
          onClose={handleCloseModal}
          muscleGroup={selectedMuscleGroup.muscleGroup}
          exercises={selectedMuscleGroup.exercises || []}
          stats={{
            volume: selectedMuscleGroup.volume,
            sets: selectedMuscleGroup.sets,
            exerciseCount: selectedMuscleGroup.exerciseCount,
          }}
          timeframe={timeframe}
        />
      )}
    </View>
  );
}

