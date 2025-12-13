import { View, Text, Dimensions, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { TrendingUp, TrendingDown, Minus, Activity, Dumbbell, Repeat, Filter, GitCompare } from "lucide-react-native"
import { useState, useEffect } from "react"
import { useThemedColors } from "../../hooks/useThemedColors"
import { useTheme } from "../../contexts/ThemeContext"
import { BarChart } from "react-native-gifted-charts"
import MonthlyTrendsFilterModal from "./MonthlyTrendsFilterModal"
import { sortMonthlyStats } from "./utils/monthlyTrendsUtils"

const { width: screenWidth } = Dimensions.get('window');

export default function MonthlyTrends({ monthlyStats, onCrossCheckPress }) {
  const colors = useThemedColors();
  const { isDarkMode } = useTheme();
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  
  if (!monthlyStats || monthlyStats.length === 0) {
    return (
      <View style={{ 
        alignItems: "center", 
        justifyContent: "center", 
        paddingVertical: 60 
      }}>
        <Ionicons name="bar-chart-outline" size={48} color={colors.text.tertiary} />
        <Text style={{ 
          fontSize: 16, 
          color: colors.text.secondary,
          marginTop: 16,
          textAlign: 'center',
        }}>
          No monthly data available
        </Text>
        <Text style={{ 
          fontSize: 14, 
          color: colors.text.tertiary,
          marginTop: 8,
          textAlign: 'center',
        }}>
          Complete more workouts to see your monthly trends
        </Text>
      </View>
    )
  }

  // Format volume
  const formatVolume = (volume) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    }
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}k`;
    }
    return volume.toFixed(0);
  };

  // Calculate summary statistics
  const totalExercises = monthlyStats.reduce((sum, m) => sum + (m?.workouts || 0), 0);
  const totalSets = monthlyStats.reduce((sum, m) => sum + (m?.totalSets || 0), 0);
  const totalVolume = monthlyStats.reduce((sum, m) => sum + (m?.totalVolume || 0), 0);
  const averageSetsPerMonth = monthlyStats.length > 0 ? totalSets / monthlyStats.length : 0;
  const averageVolumePerMonth = monthlyStats.length > 0 ? totalVolume / monthlyStats.length : 0;

  // Calculate trend direction (comparing current vs previous month)
  const currentMonth = monthlyStats[monthlyStats.length - 1];
  const previousMonth = monthlyStats[monthlyStats.length - 2];
  
  let workoutTrend = "stable";
  let trendPercentage = 0;
  if (currentMonth && previousMonth) {
    const currentValue = currentMonth.totalSets || 0;
    const previousValue = previousMonth.totalSets || 0;
    if (previousValue > 0) {
      trendPercentage = ((currentValue - previousValue) / previousValue) * 100;
      workoutTrend = currentValue > previousValue ? "up" : currentValue < previousValue ? "down" : "stable";
    }
  }

  const handleSortChange = (newSortBy, newSortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  // Sort monthly stats
  const sortedMonthlyStats = sortMonthlyStats(monthlyStats, sortBy, sortOrder);

  // Prepare bar chart data for volume (always chronological for trend visualization)
  const prepareVolumeBarData = () => {
    const chronologicalStats = sortMonthlyStats(monthlyStats, 'date', 'asc');
    return chronologicalStats
      .map((m, idx) => {
        try {
          const dateStr = m.month.includes('-') ? m.month + "-01" : m.month;
          const date = new Date(dateStr);
          const label = date.toLocaleDateString("en", { month: "short" });
          return {
            value: m?.totalVolume || 0,
            label: label,
            labelTextStyle: { 
              color: colors.text.tertiary, 
              fontSize: 10,
              fontWeight: '500',
            },
            frontColor: colors.primary[600],
            topLabelComponent: () => (
              <Text style={{ 
                fontSize: 9, 
                color: isDarkMode ? colors.text.white : colors.text.primary, 
                fontWeight: '600',
                marginBottom: 2 
              }}>
                {formatVolume(m?.totalVolume || 0)}
              </Text>
            ),
          };
        } catch (err) {
          console.error('Error formatting month data:', m, err);
          return null;
        }
      })
      .filter(item => item !== null)
      .reverse(); // Show most recent first
  };

  // Prepare bar chart data for sets (always chronological for trend visualization)
  const prepareSetsBarData = () => {
    const chronologicalStats = sortMonthlyStats(monthlyStats, 'date', 'asc');
    return chronologicalStats
      .map((m, idx) => {
        try {
          const dateStr = m.month.includes('-') ? m.month + "-01" : m.month;
          const date = new Date(dateStr);
          const label = date.toLocaleDateString("en", { month: "short" });
          return {
            value: m?.totalSets || 0,
            label: label,
            labelTextStyle: { 
              color: colors.text.tertiary, 
              fontSize: 10,
              fontWeight: '500',
            },
            frontColor: colors.status.success,
            topLabelComponent: () => (
              <Text style={{ 
                fontSize: 9, 
                color: isDarkMode ? colors.text.white : colors.text.primary, 
                fontWeight: '600',
                marginBottom: 2 
              }}>
                {m?.totalSets || 0}
              </Text>
            ),
          };
        } catch (err) {
          console.error('Error formatting month data:', m, err);
          return null;
        }
      })
      .filter(item => item !== null)
      .reverse(); // Show most recent first
  };

  const volumeBarData = prepareVolumeBarData();
  const setsBarData = prepareSetsBarData();
  const maxVolume = Math.max(...volumeBarData.map(d => d.value), 1);
  const maxSets = Math.max(...setsBarData.map(d => d.value), 1);

  // Calculate month-over-month changes for each month
  const getMonthChange = (current, previous) => {
    if (!previous || previous.totalSets === 0) return null;
    const change = ((current.totalSets - previous.totalSets) / previous.totalSets) * 100;
    return change;
  };


  return (
    <View>
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
          backgroundColor: colors.primary[50],
          borderRadius: 12,
          padding: 16,
          borderWidth: 1,
          borderColor: colors.primary[200],
        }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Activity size={18} color={colors.primary[600]} />
            <Text style={{ 
              fontSize: 12, 
              color: colors.text.tertiary,
              fontWeight: "500",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}>
              Total Volume
            </Text>
          </View>
          <Text style={{ 
            fontSize: 24, 
            fontWeight: "800", 
            color: colors.primary[700],
            letterSpacing: -0.5,
          }}>
            {formatVolume(totalVolume)}
          </Text>
          <Text style={{ 
            fontSize: 14, 
            color: colors.text.secondary,
            marginTop: 2,
          }}>
            kg across all months
          </Text>
        </View>

        <View style={{ 
          flex: 1,
          minWidth: "47%",
          backgroundColor: colors.status.success + '15',
          borderRadius: 12,
          padding: 16,
          borderWidth: 1,
          borderColor: colors.status.success + '30',
        }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Repeat size={18} color={colors.status.success} />
            <Text style={{ 
              fontSize: 12, 
              color: colors.text.tertiary,
              fontWeight: "500",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}>
              Total Sets
            </Text>
          </View>
          <Text style={{ 
            fontSize: 24, 
            fontWeight: "800", 
            color: colors.status.success,
            letterSpacing: -0.5,
          }}>
            {totalSets.toLocaleString()}
          </Text>
          <Text style={{ 
            fontSize: 14, 
            color: colors.text.secondary,
            marginTop: 2,
          }}>
            sets logged
          </Text>
        </View>

        <View style={{ 
          flex: 1,
          minWidth: "47%",
          backgroundColor: colors.background.primary,
          borderRadius: 12,
          padding: 16,
          borderWidth: 1,
          borderColor: colors.border.light,
        }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Dumbbell size={18} color={colors.primary[600]} />
            <Text style={{ 
              fontSize: 12, 
              color: colors.text.tertiary,
              fontWeight: "500",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}>
              Unique Exercises
            </Text>
          </View>
          <Text style={{ 
            fontSize: 24, 
            fontWeight: "800", 
            color: colors.text.primary,
            letterSpacing: -0.5,
          }}>
            {totalExercises}
          </Text>
          <Text style={{ 
            fontSize: 14, 
            color: colors.text.secondary,
            marginTop: 2,
          }}>
            exercises tracked
          </Text>
        </View>

        <View style={{ 
          flex: 1,
          minWidth: "47%",
          backgroundColor: colors.background.primary,
          borderRadius: 12,
          padding: 16,
          borderWidth: 1,
          borderColor: colors.border.light,
        }}>
          <Text style={{ 
            fontSize: 12, 
            color: colors.text.tertiary,
            fontWeight: "500",
            textTransform: "uppercase",
            letterSpacing: 0.5,
            marginBottom: 8,
          }}>
            Avg per Month
          </Text>
          <Text style={{ 
            fontSize: 20, 
            fontWeight: "800", 
            color: colors.text.primary,
            letterSpacing: -0.5,
          }}>
            {formatVolume(averageVolumePerMonth)}
          </Text>
          <Text style={{ 
            fontSize: 12, 
            color: colors.text.secondary,
            marginTop: 2,
          }}>
            {averageSetsPerMonth.toFixed(0)} sets
          </Text>
        </View>
      </View>

      {/* Trend Indicator */}
      {workoutTrend !== "stable" && (
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: workoutTrend === "up" 
            ? colors.status.success + '15' 
            : colors.status.error + '15',
          borderRadius: 12,
          padding: 14,
          marginBottom: 24,
          borderWidth: 1,
          borderColor: workoutTrend === "up" 
            ? colors.status.success + '30' 
            : colors.status.error + '30',
        }}>
          {workoutTrend === "up" ? (
            <TrendingUp size={20} color={colors.status.success} />
          ) : (
            <TrendingDown size={20} color={colors.status.error} />
          )}
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={{ 
              fontSize: 15, 
              fontWeight: "700", 
              color: colors.text.primary,
            }}>
              {workoutTrend === "up" ? "Activity Increased" : "Activity Decreased"}
            </Text>
            <Text style={{ 
              fontSize: 13, 
              color: colors.text.secondary,
              marginTop: 2,
            }}>
              {Math.abs(trendPercentage).toFixed(1)}% change from last month
            </Text>
          </View>
        </View>
      )}

      {/* Volume Bar Chart */}
      {volumeBarData.length > 0 && (
        <View style={{ 
          backgroundColor: colors.background.primary,
          borderRadius: 12,
          padding: 16,
          marginBottom: 24,
          borderWidth: 1,
          borderColor: colors.border.light,
        }}>
          <Text style={{ 
            fontSize: 16, 
            fontWeight: "600", 
            color: colors.text.primary,
            marginBottom: 16 
          }}>
            Monthly Volume
          </Text>
          <BarChart
            data={volumeBarData}
            width={screenWidth - 100}
            height={200}
            barWidth={30}
            initialSpacing={10}
            spacing={20}
            barBorderRadius={6}
            showGradient
            gradientColor={colors.primary[400]}
            yAxisThickness={1}
            xAxisThickness={1}
            xAxisColor={colors.border.medium}
            yAxisColor={colors.border.medium}
            yAxisTextStyle={{ color: colors.text.tertiary, fontSize: 11, fontWeight: '500' }}
            xAxisLabelTextStyle={{ color: colors.text.tertiary, fontSize: 10, fontWeight: '500' }}
            yAxisLabelWidth={40}
            maxValue={maxVolume * 1.1 || 1000}
            noOfSections={4}
            isAnimated
            animationDuration={1000}
            cappedBars
            capColor={colors.primary[700]}
            capThickness={3}
            capRadius={3}
            showValuesAsTopLabel
            topLabelTextStyle={{ color: isDarkMode ? colors.text.white : colors.text.primary, fontSize: 9, fontWeight: '600' }}
            topLabelContainerStyle={{ marginBottom: 6 }}
            rulesColor={colors.border.light}
            rulesType="solid"
            dashGap={0}
          />
        </View>
      )}

      {/* Sets Bar Chart */}
      {setsBarData.length > 0 && (
        <View style={{ 
          backgroundColor: colors.background.primary,
          borderRadius: 12,
          padding: 16,
          marginBottom: 24,
          borderWidth: 1,
          borderColor: colors.border.light,
        }}>
          <Text style={{ 
            fontSize: 16, 
            fontWeight: "600", 
            color: colors.text.primary,
            marginBottom: 16 
          }}>
            Monthly Sets
          </Text>
          <BarChart
            data={setsBarData}
            width={screenWidth - 100}
            height={200}
            barWidth={30}
            initialSpacing={10}
            spacing={20}
            barBorderRadius={6}
            showGradient
            gradientColor={colors.status.success}
            yAxisThickness={1}
            xAxisThickness={1}
            xAxisColor={colors.border.medium}
            yAxisColor={colors.border.medium}
            yAxisTextStyle={{ color: colors.text.tertiary, fontSize: 11, fontWeight: '500' }}
            xAxisLabelTextStyle={{ color: colors.text.tertiary, fontSize: 10, fontWeight: '500' }}
            yAxisLabelWidth={40}
            maxValue={maxSets * 1.1 || 100}
            noOfSections={4}
            isAnimated
            animationDuration={1000}
            cappedBars
            capColor={colors.status.success}
            capThickness={3}
            capRadius={3}
            showValuesAsTopLabel
            topLabelTextStyle={{ color: isDarkMode ? colors.text.white : colors.text.primary, fontSize: 9, fontWeight: '600' }}
            topLabelContainerStyle={{ marginBottom: 6 }}
            rulesColor={colors.border.light}
            rulesType="solid"
            dashGap={0}
          />
        </View>
      )}

      {/* Monthly Breakdown Cards */}
      <View>
        <View style={{ 
          flexDirection: "row", 
          alignItems: "center", 
          justifyContent: "space-between",
          marginBottom: 16 
        }}>
          <Text style={{ 
            fontSize: 18, 
            fontWeight: "bold", 
            color: colors.text.primary,
          }}>
            Breakdown
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <TouchableOpacity
              onPress={onCrossCheckPress}
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
              <GitCompare size={16} color={colors.primary[600]} />
              <Text style={{
                fontSize: 13,
                fontWeight: '600',
                color: colors.primary[600],
              }}>
                Cross Check
              </Text>
            </TouchableOpacity>
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
        </View>
        {sortedMonthlyStats.map((month, index) => {
            // Find previous month chronologically (not by sorted order)
            const allMonthsSortedByDate = sortMonthlyStats(monthlyStats, 'date', 'asc');
            const currentMonthIndex = allMonthsSortedByDate.findIndex(m => m.month === month.month);
            const previousMonth = currentMonthIndex > 0 ? allMonthsSortedByDate[currentMonthIndex - 1] : null;
            const monthChange = getMonthChange(month, previousMonth);
            
            try {
              const dateStr = month.month.includes('-') ? month.month + "-01" : month.month;
              const date = new Date(dateStr);
              const formattedDate = date.toLocaleDateString("en", { 
                month: "long", 
                year: "numeric" 
              });
              
              return (
                <View
                  key={month.month}
                  style={{
                    backgroundColor: colors.background.card,
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: colors.border.light,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ 
                        fontSize: 16, 
                        fontWeight: "700", 
                        color: colors.text.primary,
                        marginBottom: 4,
                      }}>
                        {formattedDate}
                      </Text>
                      {monthChange !== null && (
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}>
                          {monthChange > 0 ? (
                            <TrendingUp size={14} color={colors.status.success} />
                          ) : monthChange < 0 ? (
                            <TrendingDown size={14} color={colors.status.error} />
                          ) : (
                            <Minus size={14} color={colors.text.tertiary} />
                          )}
                          <Text style={{ 
                            fontSize: 12, 
                            color: monthChange > 0 
                              ? colors.status.success 
                              : monthChange < 0 
                                ? colors.status.error 
                                : colors.text.tertiary,
                            fontWeight: "600",
                          }}>
                            {monthChange > 0 ? '+' : ''}{monthChange.toFixed(1)}% from previous month
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={{ 
                    flexDirection: "row", 
                    justifyContent: "space-between",
                    gap: 12,
                  }}>
                    <View style={{ flex: 1, alignItems: "center" }}>
                      <Text style={{ 
                        fontSize: 20, 
                        fontWeight: "800", 
                        color: colors.primary[600],
                        letterSpacing: -0.5,
                      }}>
                        {formatVolume(month.totalVolume || 0)}
                      </Text>
                      <Text style={{ 
                        fontSize: 11, 
                        color: colors.text.tertiary,
                        marginTop: 2,
                        fontWeight: "500",
                      }}>
                        Volume (kg)
                      </Text>
                    </View>

                    <View style={{ width: 1, backgroundColor: colors.border.light }} />

                    <View style={{ flex: 1, alignItems: "center" }}>
                      <Text style={{ 
                        fontSize: 20, 
                        fontWeight: "800", 
                        color: colors.status.success,
                        letterSpacing: -0.5,
                      }}>
                        {month.totalSets || 0}
                      </Text>
                      <Text style={{ 
                        fontSize: 11, 
                        color: colors.text.tertiary,
                        marginTop: 2,
                        fontWeight: "500",
                      }}>
                        Total Sets
                      </Text>
                    </View>

                    <View style={{ width: 1, backgroundColor: colors.border.light }} />

                    <View style={{ flex: 1, alignItems: "center" }}>
                      <Text style={{ 
                        fontSize: 20, 
                        fontWeight: "800", 
                        color: colors.text.primary,
                        letterSpacing: -0.5,
                      }}>
                        {month.workouts || 0}
                      </Text>
                      <Text style={{ 
                        fontSize: 11, 
                        color: colors.text.tertiary,
                        marginTop: 2,
                        fontWeight: "500",
                      }}>
                        Exercises
                      </Text>
                    </View>
                  </View>
                </View>
              );
            } catch (err) {
              console.error('Error rendering month card:', month, err);
              return null;
            }
          })
          .filter(item => item !== null)
        }
      </View>

      {/* Filter Modal */}
      <MonthlyTrendsFilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
      />
    </View>
  )
}
