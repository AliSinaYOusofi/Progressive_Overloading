import { View, Text, TouchableOpacity, Dimensions } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useState, useEffect, useMemo } from "react"
import { Filter, ChevronDown, Trophy, Award, TrendingUp, Calendar, Dumbbell, Target } from "lucide-react-native"
import { useThemedColors } from "../../hooks/useThemedColors"
import { useTheme } from "../../contexts/ThemeContext"
import { BarChart } from "react-native-gifted-charts"
import { getCurrentUser } from "../../lib/database"
import ExerciseDetailModal from "./ExerciseDetailModal"
import PersonalRecordsFilterModal from "./PersonalRecordsFilterModal"
import { sortPersonalRecords } from "./utils/personalRecordsUtils"

const { width: screenWidth } = Dimensions.get('window');

const INITIAL_DISPLAY_COUNT = 10;
const LOAD_MORE_COUNT = 10;

// Helper to remove floating point noise (e.g. 13.200000000000001) at a given precision
const normalizeNumber = (num, decimals = 1) => {
    const n = Number(num);
    if (!Number.isFinite(n)) return 0;
    return Number(n.toFixed(decimals));
};

export default function PersonalRecords({ personalRecords, onInfoPress }) {
  const colors = useThemedColors();
  const { isDarkMode } = useTheme();
  const [selectedExercise, setSelectedExercise] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [userId, setUserId] = useState(null)
  const [visibleCount, setVisibleCount] = useState(INITIAL_DISPLAY_COUNT)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [sortBy, setSortBy] = useState('oneRM')
  const [sortOrder, setSortOrder] = useState('desc')

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    const user = await getCurrentUser()
    if (user) {
      setUserId(user.id)
    }
  }

  const handleExercisePress = (exerciseName) => {
    setSelectedExercise(exerciseName)
    setShowDetailModal(true)
  }

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + LOAD_MORE_COUNT);
  };

  const handleSortChange = (newSortBy, newSortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  // Reset visible count when personalRecords or sort changes
  useEffect(() => {
    setVisibleCount(INITIAL_DISPLAY_COUNT);
  }, [personalRecords, sortBy, sortOrder]);

  if (!personalRecords || personalRecords.length === 0) {
    return (
      <View>
        <View style={{
          borderRadius: 16,
          padding: 32,
          alignItems: 'center',
          backgroundColor: colors.background.primary
        }}>
          <Ionicons name="medal-outline" size={48} color={colors.text.tertiary} />
          <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 8, color: colors.text.secondary }}>
            No Records Yet
          </Text>
          <Text style={{ textAlign: 'center', color: colors.text.tertiary }}>
            Start working out to set your first personal records!
          </Text>
        </View>
      </View>
    )
  }

  const getExerciseIcon = (exercise) => {
    const exerciseName = exercise.toLowerCase()
    if (exerciseName.includes("bench") || exerciseName.includes("press")) return "barbell"
    if (exerciseName.includes("squat")) return "fitness"
    if (exerciseName.includes("deadlift")) return "barbell"
    if (exerciseName.includes("curl")) return "fitness"
    if (exerciseName.includes("row")) return "barbell"
    return "trophy"
  }

  const getRankIcon = (index) => {
    switch (index) {
      case 0:
        return { name: "trophy", color: colors.primary[500] } // Gold
      case 1:
        return { name: "medal", color: colors.primary[400] } // Silver
      case 2:
        return { name: "medal-outline", color: colors.primary[600] } // Bronze
      default:
        return { name: "star", color: colors.primary[500] }
    }
  }

  if (!personalRecords || personalRecords.length === 0) {
    return (
      <View>
        <View style={{
          borderRadius: 16,
          padding: 32,
          alignItems: 'center',
          backgroundColor: colors.background.primary
        }}>
          <Ionicons name="medal-outline" size={48} color={colors.text.tertiary} />
          <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 8, color: colors.text.secondary }}>
            No Records Yet
          </Text>
          <Text style={{ textAlign: 'center', color: colors.text.tertiary }}>
            Start working out to set your first personal records!
          </Text>
        </View>
      </View>
    )
  }

  const sortedRecords = sortPersonalRecords(personalRecords, sortBy, sortOrder);
  const visibleRecords = sortedRecords.slice(0, visibleCount);
  const hasMore = sortedRecords.length > visibleCount;
  const remainingCount = sortedRecords.length - visibleCount;

  // Calculate comprehensive summary statistics
  const summaryStats = useMemo(() => {
    if (!personalRecords || personalRecords.length === 0) {
      return {
        totalRecords: 0,
        uniqueExercises: 0,
        average1RM: 0,
        strongestRecord: null,
        recentRecords: 0,
        totalWeight: 0,
        averageWeight: 0,
      };
    }

    const uniqueExercises = new Set(personalRecords.map(r => r.exercise)).size;
    const all1RMs = personalRecords.map(r => r.oneRM).filter(rm => rm > 0);
    const average1RM = all1RMs.length > 0 
      ? all1RMs.reduce((sum, rm) => sum + rm, 0) / all1RMs.length 
      : 0;

    const strongestRecord = personalRecords.reduce((strongest, current) => {
      if ((current.oneRM || 0) > (strongest?.oneRM || 0)) {
        return current;
      }
      return strongest;
    }, null);

    // Count recent records (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentRecords = personalRecords.filter(r => {
      const recordDate = new Date(r.date);
      return recordDate >= sevenDaysAgo;
    }).length;

    const allWeights = personalRecords.map(r => r.weight || 0).filter(w => w > 0);
    const totalWeight = allWeights.reduce((sum, w) => sum + w, 0);
    const averageWeight = allWeights.length > 0 
      ? totalWeight / allWeights.length 
      : 0;

    return {
      totalRecords: personalRecords.length,
      uniqueExercises,
      average1RM,
      strongestRecord,
      recentRecords,
      totalWeight,
      averageWeight,
    };
  }, [personalRecords]);

  // Get top 5 records by 1RM
  const topRecords = useMemo(() => {
    if (!personalRecords || personalRecords.length === 0) return [];
    return [...personalRecords]
      .sort((a, b) => b.oneRM - a.oneRM)
      .slice(0, 5);
  }, [personalRecords]);

  // Get records by exercise (grouped)
  const recordsByExercise = useMemo(() => {
    if (!personalRecords || personalRecords.length === 0) return [];
    
    const grouped = personalRecords.reduce((acc, record) => {
      if (!acc[record.exercise]) {
        acc[record.exercise] = [];
      }
      acc[record.exercise].push(record);
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([exercise, records]) => ({
        exercise,
        records,
        best1RM: Math.max(...records.map(r => r.oneRM)),
        count: records.length,
      }))
      .sort((a, b) => b.best1RM - a.best1RM)
      .slice(0, 8);
  }, [personalRecords]);

  // Prepare bar chart data for top exercises by 1RM
  const barChartData = useMemo(() => {
    if (!recordsByExercise || recordsByExercise.length === 0) return [];
    
    return recordsByExercise.map((item) => {
      const name = item.exercise.length > 10 
        ? item.exercise.substring(0, 10) + '...' 
        : item.exercise;
      
      // Clean up any floating point noise so gifted-charts doesn't render long decimals in the top label
      const clean1RM = normalizeNumber(item.best1RM, 1);
      
      return {
        value: clean1RM,
        label: name,
        labelTextStyle: { 
          color: colors.text.tertiary, 
          fontSize: 9,
          fontWeight: '500',
        },
        frontColor: colors.primary[600],
        topLabelComponent: () => (
          <Text style={{ 
            fontSize: 8, 
            color: isDarkMode ? colors.text.white : colors.text.primary, 
            fontWeight: '600',
            marginBottom: 2 
          }}>
            {clean1RM.toFixed(1).replace(/\.?0+$/, '')}
          </Text>
        ),
      };
    });
  }, [recordsByExercise, colors, isDarkMode]);

  // Get most recent records
  const recentRecords = useMemo(() => {
    if (!personalRecords || personalRecords.length === 0) return [];
    return [...personalRecords]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);
  }, [personalRecords]);

  return (
    <View>
      {/* Header with Info Icon and Filter */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text.primary }}>
            Personal Records
          </Text>
          {onInfoPress && (
            <TouchableOpacity
              onPress={onInfoPress}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: colors.background.primary,
                borderWidth: 1,
                borderColor: colors.border.light,
              }}
            >
              <Ionicons name="information-circle" size={18} color={colors.icon.primary || colors.primary[600]} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Summary Statistics */}
      <View style={{ 
        flexDirection: "row", 
        flexWrap: "wrap", 
        gap: 12,
        marginBottom: 24 
      }}>
        <View style={{ 
          flex: 1,
          minWidth: "47%",
          backgroundColor: colors.background.card,
          borderRadius: 12,
          padding: 16,
          borderWidth: 1,
          borderColor: colors.border.light,
        }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Trophy size={18} color={colors.icon.primary} />
            <Text style={{ 
              fontSize: 12, 
              color: colors.text.tertiary,
              fontWeight: "500",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}>
              Total Records
            </Text>
          </View>
          <Text style={{ 
            fontSize: 24, 
            fontWeight: "800", 
            color: colors.text.primary,
            letterSpacing: -0.5,
          }}>
            {summaryStats.totalRecords}
          </Text>
          <Text style={{ 
            fontSize: 14, 
            color: colors.text.secondary,
            marginTop: 2,
          }}>
            {summaryStats.uniqueExercises} {summaryStats.uniqueExercises === 1 ? 'exercise' : 'exercises'}
          </Text>
        </View>

        <View style={{ 
          flex: 1,
          minWidth: "47%",
          backgroundColor: colors.background.card,
          borderRadius: 12,
          padding: 16,
          borderWidth: 1,
          borderColor: colors.border.light,
        }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Target size={18} color={colors.icon.primary} />
            <Text style={{ 
              fontSize: 12, 
              color: colors.text.tertiary,
              fontWeight: "500",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}>
              Avg 1RM
            </Text>
          </View>
          <Text style={{ 
            fontSize: 24, 
            fontWeight: "800", 
            color: colors.text.primary,
            letterSpacing: -0.5,
          }}>
            {summaryStats.average1RM.toFixed(1).replace(/\.?0+$/, '')}
          </Text>
          <Text style={{ 
            fontSize: 14, 
            color: colors.text.secondary,
            marginTop: 2,
          }}>
            kg across all exercises
          </Text>
        </View>

        {summaryStats.strongestRecord && (
          <View style={{ 
            flex: 1,
            minWidth: "47%",
            backgroundColor: colors.background.card,
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border.light,
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Award size={18} color={colors.primary[600]} />
              <Text style={{ 
                fontSize: 12, 
                color: colors.text.tertiary,
                fontWeight: "500",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}>
                Strongest
              </Text>
            </View>
            <Text style={{ 
              fontSize: 20, 
              fontWeight: "800", 
              color: colors.text.primary,
              letterSpacing: -0.5,
            }}>
              {summaryStats.strongestRecord.oneRM.toFixed(1).replace(/\.?0+$/, '')} kg
            </Text>
            <Text style={{ 
              fontSize: 12, 
              color: colors.text.secondary,
              marginTop: 2,
            }} numberOfLines={1}>
              {summaryStats.strongestRecord.exercise}
            </Text>
          </View>
        )}

        <View style={{ 
          flex: 1,
          minWidth: "47%",
          backgroundColor: colors.background.card,
          borderRadius: 12,
          padding: 16,
          borderWidth: 1,
          borderColor: colors.border.light,
        }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Calendar size={18} color={colors.primary[600]} />
            <Text style={{ 
              fontSize: 12, 
              color: colors.text.tertiary,
              fontWeight: "500",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}>
              Recent
            </Text>
          </View>
          <Text style={{ 
            fontSize: 20, 
            fontWeight: "800", 
            color: colors.text.primary,
            letterSpacing: -0.5,
          }}>
            {summaryStats.recentRecords}
          </Text>
          <Text style={{ 
            fontSize: 12, 
            color: colors.text.secondary,
            marginTop: 2,
          }}>
            records this week
          </Text>
        </View>
      </View>

      {/* Top Records Highlight */}
      {topRecords.length > 0 && (
        <View style={{ 
          marginBottom: 24,
        }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <View style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.background.secondary || colors.neutral[100],
            }}>
              <Trophy size={18} color={colors.icon.primary} />
            </View>
            <Text style={{ 
              fontSize: 16, 
              fontWeight: "600", 
              color: colors.text.primary,
            }}>
              Top 5 Records
            </Text>
          </View>
          {topRecords.map((record, index) => {
            // Calculate percentage relative to top record (index 0)
            const topRecord1RM = topRecords[0]?.oneRM || 1;
            const percentage = topRecord1RM > 0 
              ? (record.oneRM / topRecord1RM) * 100 
              : 0;
            
            return (
              <View
                key={`${record.exercise}-${index}`}
                style={{
                  backgroundColor: colors.background.card,
                  borderRadius: 14,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: colors.border.light,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 12 }}>
                  {/* Rank Badge */}
                  <View style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: colors.background.secondary || colors.neutral[100],
                    marginRight: 12,
                  }}>
                    <Text style={{ 
                      fontSize: 14, 
                      fontWeight: "700", 
                      color: colors.text.secondary,
                    }}>
                      #{index + 1}
                    </Text>
                  </View>
                  
                  {/* Exercise Info */}
                  <View style={{ flex: 1 }}>
                    <Text style={{ 
                      fontSize: 16, 
                      fontWeight: "600", 
                      color: colors.text.primary,
                      marginBottom: 4,
                    }}>
                      {record.exercise}
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <Text style={{ 
                        fontSize: 12, 
                        color: colors.text.tertiary,
                      }}>
                        {record.weight} {record.unit || 'kg'}
                      </Text>
                      <Text style={{ 
                        fontSize: 12, 
                        color: colors.text.tertiary,
                      }}>
                        •
                      </Text>
                      <Text style={{ 
                        fontSize: 12, 
                        color: colors.text.tertiary,
                      }}>
                        {record.reps} reps
                      </Text>
                    </View>
                  </View>
                </View>
                
                {/* 1RM Display */}
                <View style={{ 
                  flexDirection: "row", 
                  alignItems: "center", 
                  justifyContent: "space-between",
                  paddingTop: 12,
                  borderTopWidth: 1,
                  borderTopColor: colors.border.light,
                }}>
                  <View>
                    <Text style={{ 
                      fontSize: 13, 
                      fontWeight: "600", 
                      color: colors.text.secondary,
                      marginBottom: 2,
                    }}>
                      1RM
                    </Text>
                    <Text style={{ 
                      fontSize: 20, 
                      fontWeight: "700", 
                      color: colors.text.primary,
                    }}>
                      {record.oneRM.toFixed(1).replace(/\.?0+$/, '')} kg
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={{ 
                      fontSize: 13, 
                      fontWeight: "600", 
                      color: colors.text.secondary,
                      marginBottom: 2,
                    }}>
                      Relative to top
                    </Text>
                    <Text style={{ 
                      fontSize: 20, 
                      fontWeight: "700", 
                      color: colors.text.primary,
                    }}>
                      {percentage.toFixed(0)}%
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Top Exercises by 1RM Chart */}
      {barChartData.length > 0 && (
        <View style={{ 
          backgroundColor: colors.background.primary,
          borderRadius: 12,
          padding: 16,
          marginBottom: 24,
          borderWidth: 1,
          borderColor: colors.border.light,
          overflow: 'hidden' // Prevent chart from extending beyond container
        }}>
          <Text style={{ 
            fontSize: 16, 
            fontWeight: "600", 
            color: colors.text.primary,
            marginBottom: 16 
          }}>
            Best 1RM by Exercise
          </Text>
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <BarChart
              data={barChartData}
              width={screenWidth - 120} // Account for container padding (16*2) + screen margins (48*2)
              height={200}
              barWidth={25}
              initialSpacing={20} // Increased to prevent first bar clipping
              spacing={12}
              barBorderRadius={6}
              showGradient
              gradientColor={colors.primary[400]}
              yAxisThickness={1}
              xAxisThickness={1}
              xAxisColor={colors.border.medium}
              yAxisColor={colors.border.medium}
              yAxisTextStyle={{ color: colors.text.tertiary, fontSize: 10, fontWeight: '500' }}
              xAxisLabelTextStyle={{ color: colors.text.tertiary, fontSize: 9, fontWeight: '500' }}
              yAxisLabelWidth={40}
              maxValue={Math.max(...barChartData.map(d => d.value)) * 1.1 || 100}
              noOfSections={4}
              isAnimated
              animationDuration={1000}
              cappedBars
              capColor={colors.primary[700]}
              capThickness={3}
              capRadius={3}
              showValuesAsTopLabel
              topLabelTextStyle={{ color: isDarkMode ? colors.text.white : colors.text.primary, fontSize: 8, fontWeight: '600' }}
              topLabelContainerStyle={{ marginBottom: 6 }}
              rulesColor={colors.border.light}
              rulesType="solid"
              dashGap={0}
            />
          </View>
        </View>
      )}

      {/* Recent Achievements */}
      {recentRecords.length > 0 && summaryStats.strongestRecord && (
        <View style={{ 
          marginBottom: 24,
        }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <View style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.background.secondary || colors.neutral[100],
            }}>
              <TrendingUp size={18} color={colors.icon.primary} />
            </View>
            <Text style={{ 
              fontSize: 16, 
              fontWeight: "600", 
              color: colors.text.primary,
            }}>
              Recent Achievements
            </Text>
          </View>
          {recentRecords.map((record, index) => {
            const recordDate = new Date(record.date);
            const daysAgo = Math.floor((new Date() - recordDate) / (1000 * 60 * 60 * 24));
            const dateText = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`;
            
            // Calculate percentage relative to strongest record
            const percentage = summaryStats.strongestRecord.oneRM > 0
              ? (record.oneRM / summaryStats.strongestRecord.oneRM) * 100
              : 0;
            
            return (
              <View
                key={`recent-${record.exercise}-${index}`}
                style={{
                  backgroundColor: colors.background.card,
                  borderRadius: 14,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: colors.border.light,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 12 }}>
                  {/* Exercise Icon */}
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: colors.background.secondary || colors.neutral[100],
                    marginRight: 12,
                  }}>
                    <Dumbbell size={18} color={colors.icon.primary} />
                  </View>
                  
                  {/* Exercise Info */}
                  <View style={{ flex: 1 }}>
                    <Text style={{ 
                      fontSize: 16, 
                      fontWeight: "600", 
                      color: colors.text.primary,
                      marginBottom: 4,
                    }}>
                      {record.exercise}
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <Text style={{ 
                        fontSize: 12, 
                        color: colors.text.tertiary,
                      }}>
                        {dateText}
                      </Text>
                      <Text style={{ 
                        fontSize: 12, 
                        color: colors.text.tertiary,
                      }}>
                        •
                      </Text>
                      <Text style={{ 
                        fontSize: 12, 
                        color: colors.text.tertiary,
                      }}>
                        {record.weight} {record.unit || 'kg'} × {record.reps} reps
                      </Text>
                    </View>
                  </View>
                </View>
                
                {/* Stats Row */}
                <View style={{ 
                  flexDirection: "row", 
                  alignItems: "center", 
                  justifyContent: "space-between",
                  paddingTop: 12,
                  borderTopWidth: 1,
                  borderTopColor: colors.border.light,
                }}>
                  <View>
                    <Text style={{ 
                      fontSize: 13, 
                      fontWeight: "600", 
                      color: colors.text.secondary,
                      marginBottom: 2,
                    }}>
                      1RM
                    </Text>
                    <Text style={{ 
                      fontSize: 18, 
                      fontWeight: "700", 
                      color: colors.text.primary,
                    }}>
                      {record.oneRM.toFixed(1).replace(/\.?0+$/, '')} kg
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={{ 
                      fontSize: 13, 
                      fontWeight: "600", 
                      color: colors.text.secondary,
                      marginBottom: 2,
                    }}>
                      Relative to best
                    </Text>
                    <Text style={{ 
                      fontSize: 18, 
                      fontWeight: "700", 
                      color: colors.text.primary,
                    }}>
                      {percentage.toFixed(0)}%
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Controls Row */}
      <View style={{ 
        flexDirection: "row", 
        alignItems: "center", 
        justifyContent: "space-between", 
        marginBottom: 16 
      }}>
        <Text style={{ 
          fontSize: 14, 
          color: colors.text.secondary,
          fontWeight: '500',
        }}>
          {sortedRecords.length} {sortedRecords.length === 1 ? 'record' : 'records'}
          {hasMore && ` • Showing ${visibleCount}`}
        </Text>
        <TouchableOpacity
          onPress={() => setShowFilterModal(true)}
          activeOpacity={0.7}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 12,
            paddingVertical: 6,
            backgroundColor: colors.background.primary,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.border.light,
          }}
        >
          <Filter size={16} color={colors.primary[600]} />
          <Text style={{
            fontSize: 13,
            fontWeight: '600',
            color: colors.primary[600],
          }}>
            Filter
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ gap: 16 }}>
        {visibleRecords.map((record, index) => {
          return (
            <View
              key={index}
              style={{
                borderRadius: 16,
                padding: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 2,
                borderWidth: 1,
                backgroundColor: colors.background.card,
                borderColor: colors.border.light,
              }}
            >
              {/* Header with exercise */}
              <View style={{ marginBottom: 16 }}>
                <TouchableOpacity 
                  onPress={() => handleExercisePress(record.exercise)}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text.primary, textDecorationLine: 'underline', marginBottom: 4 }}>
                    {record.exercise}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.text.tertiary }}>
                    {new Date(record.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Stats row */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 12, fontWeight: '500', marginBottom: 4, color: colors.text.secondary }}>
                    Weight
                  </Text>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text.primary }}>
                    {record.weight}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.text.tertiary }}>
                    {record.unit || "kg"}
                  </Text>
                </View>

                <View style={{ width: 1, height: 48, backgroundColor: colors.border.light }} />

                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 12, fontWeight: '500', marginBottom: 4, color: colors.text.secondary }}>
                    Reps
                  </Text>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text.primary }}>
                    {record.reps}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.text.tertiary }}>
                    reps
                  </Text>
                </View>

                <View style={{ width: 1, height: 48, backgroundColor: colors.border.light }} />

                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 12, fontWeight: '500', marginBottom: 4, color: colors.text.secondary }}>
                    1RM
                  </Text>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.primary[600] }}>
                    {record.oneRM.toFixed(1)}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.text.tertiary }}>
                    kg
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
            </View>
          )
        })}
      </View>

      {/* Load More Button */}
      {hasMore && (
        <TouchableOpacity
          onPress={handleLoadMore}
          activeOpacity={0.7}
          style={{
            marginTop: 8,
            marginBottom: 12,
            paddingVertical: 14,
            paddingHorizontal: 20,
            backgroundColor: colors.background.primary,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border.light,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Text style={{
            fontSize: 15,
            fontWeight: '600',
            color: colors.primary[600],
          }}>
            Load {Math.min(LOAD_MORE_COUNT, remainingCount)} More
          </Text>
          <ChevronDown size={18} color={colors.primary[600]} />
        </TouchableOpacity>
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

      {/* Filter Modal */}
      <PersonalRecordsFilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
      />
    </View>
  )
}
