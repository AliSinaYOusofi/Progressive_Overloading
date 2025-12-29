import React, { useMemo } from "react";
import { View, Text, Dimensions, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Target, CheckCircle2, Clock, TrendingUp, AlertCircle } from "lucide-react-native";
import { useThemedColors } from "../../hooks/useThemedColors";
import { useTheme } from "../../contexts/ThemeContext";
import { LineChart, BarChart, PieChart } from "react-native-gifted-charts";

const { width: screenWidth } = Dimensions.get('window');

export default function GoalAnalytics({ goalAnalytics }) {
  const colors = useThemedColors();
  const { isDarkMode } = useTheme();

  if (!goalAnalytics || goalAnalytics.totalGoals === 0) {
    return (
      <View style={{ 
        alignItems: "center", 
        justifyContent: "center", 
        paddingVertical: 60 
      }}>
        <Target size={48} color={colors.text.tertiary} />
        <Text style={{ 
          fontSize: 16, 
          color: colors.text.secondary,
          marginTop: 16,
          textAlign: 'center',
        }}>
          No goal data available
        </Text>
        <Text style={{ 
          fontSize: 14, 
          color: colors.text.tertiary,
          marginTop: 8,
          textAlign: 'center',
        }}>
          Create goals to see your analytics
        </Text>
      </View>
    );
  }

  // Format completion rate data for line chart
  const completionRateData = useMemo(() => {
    if (!goalAnalytics.completionRateOverTime || goalAnalytics.completionRateOverTime.length === 0) {
      return [];
    }
    
    return goalAnalytics.completionRateOverTime.map((point) => {
      const date = new Date(point.date + '-01');
      const label = date.toLocaleDateString('en', { month: 'short' });
      
      return {
        value: point.completionRate,
        label: label,
        dataPointText: `${point.completionRate}%`,
        labelTextStyle: { color: colors.text.tertiary, fontSize: 9 },
        dataPointTextStyle: { color: colors.text.primary, fontSize: 9 }
      };
    });
  }, [goalAnalytics.completionRateOverTime, colors]);

  // Format goals created data for bar chart
  const goalsCreatedData = useMemo(() => {
    if (!goalAnalytics.goalsCreatedOverTime || goalAnalytics.goalsCreatedOverTime.length === 0) {
      return [];
    }
    
    return goalAnalytics.goalsCreatedOverTime.map((point, index) => {
      const date = new Date(point.date + '-01');
      const label = index % Math.max(1, Math.ceil(goalAnalytics.goalsCreatedOverTime.length / 6)) === 0 || index === goalAnalytics.goalsCreatedOverTime.length - 1
        ? date.toLocaleDateString('en', { month: 'short' })
        : '';
      
      return {
        value: point.count,
        label,
        frontColor: colors.primary[600],
        gradientColor: colors.primary[400],
      };
    });
  }, [goalAnalytics.goalsCreatedOverTime, colors]);

  // Format progress data for line chart
  const progressData = useMemo(() => {
    if (!goalAnalytics.averageProgressOverTime || goalAnalytics.averageProgressOverTime.length === 0) {
      return [];
    }
    
    return goalAnalytics.averageProgressOverTime.map((point) => {
      const date = new Date(point.date + '-01');
      const label = date.toLocaleDateString('en', { month: 'short' });
      
      return {
        value: point.avgProgress,
        label: label,
        dataPointText: `${point.avgProgress}%`,
        labelTextStyle: { color: colors.text.tertiary, fontSize: 9 },
        dataPointTextStyle: { color: colors.text.primary, fontSize: 9 }
      };
    });
  }, [goalAnalytics.averageProgressOverTime, colors]);

  // Format status breakdown for pie chart
  const statusPieData = useMemo(() => {
    const { active, completed, expired } = goalAnalytics.statusBreakdown || {};
    const total = (active || 0) + (completed || 0) + (expired || 0);
    
    if (total === 0) return [];
    
    const data = [];
    // Order: Completed (green), Active (blue), Expired (red)
    if (completed > 0) {
      data.push({
        value: (completed / total) * 100,
        color: colors.status.success, // Green for completed
        text: `${Math.round((completed / total) * 100)}%`,
        textColor: colors.text.white,
        textSize: 10,
      });
    }
    if (active > 0) {
      data.push({
        value: (active / total) * 100,
        color: colors.status.info, // Blue for active (very different from green)
        text: `${Math.round((active / total) * 100)}%`,
        textColor: colors.text.white,
        textSize: 10,
      });
    }
    if (expired > 0) {
      data.push({
        value: (expired / total) * 100,
        color: colors.status.error, // Red for expired
        text: `${Math.round((expired / total) * 100)}%`,
        textColor: colors.text.white,
        textSize: 10,
      });
    }
    
    return data;
  }, [goalAnalytics.statusBreakdown, colors]);

  const chartWidth = useMemo(() => {
    const containerPadding = 16;
    const screenMargins = 48;
    return screenWidth - (screenMargins * 2) - (containerPadding * 2);
  }, []);

  return (
    <ScrollView 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Summary Stats */}
      <View style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
      }}>
        <View style={{
          flex: 1,
          minWidth: '47%',
          backgroundColor: colors.background.card,
          borderRadius: 12,
          padding: 16,
          borderWidth: 1,
          borderColor: colors.border.light,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Target size={18} color={colors.primary[600]} />
            <Text style={{ fontSize: 12, color: colors.text.tertiary, fontWeight: '600', marginLeft: 6 }}>
              Total Goals
            </Text>
          </View>
          <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text.primary }}>
            {goalAnalytics.totalGoals}
          </Text>
        </View>

        <View style={{
          flex: 1,
          minWidth: '47%',
          backgroundColor: colors.background.card,
          borderRadius: 12,
          padding: 16,
          borderWidth: 1,
          borderColor: colors.border.light,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <CheckCircle2 size={18} color={colors.status.success} />
            <Text style={{ fontSize: 12, color: colors.text.tertiary, fontWeight: '600', marginLeft: 6 }}>
              Completed
            </Text>
          </View>
          <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text.primary }}>
            {goalAnalytics.completedGoals}
          </Text>
        </View>

        <View style={{
          flex: 1,
          minWidth: '47%',
          backgroundColor: colors.background.card,
          borderRadius: 12,
          padding: 16,
          borderWidth: 1,
          borderColor: colors.border.light,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Clock size={18} color={colors.primary[600]} />
            <Text style={{ fontSize: 12, color: colors.text.tertiary, fontWeight: '600', marginLeft: 6 }}>
              Avg Completion
            </Text>
          </View>
          <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text.primary }}>
            {goalAnalytics.averageCompletionTime || 0}
          </Text>
          <Text style={{ fontSize: 11, color: colors.text.tertiary, marginTop: 2 }}>
            days
          </Text>
        </View>

        <View style={{
          flex: 1,
          minWidth: '47%',
          backgroundColor: colors.background.card,
          borderRadius: 12,
          padding: 16,
          borderWidth: 1,
          borderColor: colors.border.light,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <TrendingUp size={18} color={colors.primary[600]} />
            <Text style={{ fontSize: 12, color: colors.text.tertiary, fontWeight: '600', marginLeft: 6 }}>
              Completion Rate
            </Text>
          </View>
          <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text.primary }}>
            {goalAnalytics.totalGoals > 0 
              ? Math.round((goalAnalytics.completedGoals / goalAnalytics.totalGoals) * 100)
              : 0}%
          </Text>
        </View>
      </View>

      {/* Completion Rate Over Time */}
      {completionRateData.length > 0 && (
        <View style={{
          backgroundColor: colors.background.card,
          borderRadius: 16,
          padding: 20,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: colors.border.light,
        }}>
          <Text style={{
            fontSize: 18,
            fontWeight: '700',
            color: colors.text.primary,
            marginBottom: 16,
          }}>
            Completion Rate Over Time
          </Text>
          <Text style={{
            fontSize: 13,
            color: colors.text.secondary,
            marginBottom: 20,
          }}>
            Percentage of goals completed each month
          </Text>
          <LineChart
            data={completionRateData}
            width={chartWidth}
            height={200}
            color={colors.primary[600]}
            thickness={3}
            curved={true}
            areaChart={true}
            startFillColor={colors.primary[600] + '40'}
            endFillColor={colors.primary[600] + '10'}
            startOpacity={0.4}
            endOpacity={0.1}
            dataPointsColor={colors.primary[600]}
            dataPointsRadius={4}
            textShiftY={-10}
            textShiftX={-5}
            textFontSize={10}
            yAxisColor={colors.border.light}
            xAxisColor={colors.border.light}
            rulesColor={colors.border.light}
            yAxisTextStyle={{ color: colors.text.tertiary, fontSize: 10 }}
            maxValue={100}
            yAxisLabelSuffix="%"
            noOfSections={4}
            spacing={48}
          />
        </View>
      )}

      {/* Goals Created Over Time */}
      {goalsCreatedData.length > 0 && (
        <View style={{
          backgroundColor: colors.background.card,
          borderRadius: 16,
          padding: 20,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: colors.border.light,
        }}>
          <Text style={{
            fontSize: 18,
            fontWeight: '700',
            color: colors.text.primary,
            marginBottom: 16,
          }}>
            Goals Created Over Time
          </Text>
          <Text style={{
            fontSize: 13,
            color: colors.text.secondary,
            marginBottom: 20,
          }}>
            Number of goals created each month
          </Text>
          <BarChart
            data={goalsCreatedData}
            width={chartWidth}
            height={200}
            barWidth={Math.max(20, Math.min(35, (chartWidth - 60) / Math.max(goalsCreatedData.length, 1) - 15))}
            initialSpacing={20}
            spacing={Math.max(12, (chartWidth - 60) / Math.max(goalsCreatedData.length, 1) - Math.max(20, Math.min(35, (chartWidth - 60) / Math.max(goalsCreatedData.length, 1) - 15)))}
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
            noOfSections={4}
            maxValue={Math.max(...goalsCreatedData.map(d => d.value), 1) * 1.1 || 10}
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
          />
        </View>
      )}

      {/* Status Breakdown */}
      {statusPieData.length > 0 && (
        <View style={{
          backgroundColor: colors.background.card,
          borderRadius: 16,
          padding: 20,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: colors.border.light,
        }}>
          <Text style={{
            fontSize: 18,
            fontWeight: '700',
            color: colors.text.primary,
            marginBottom: 16,
          }}>
            Goals Status Breakdown
          </Text>
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <PieChart
              data={statusPieData}
              radius={100}
              innerRadius={40}
              innerCircleColor={colors.background.card}
              centerLabelComponent={() => {
                return (
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.text.primary }}>
                      {goalAnalytics.totalGoals}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.text.secondary }}>
                      Total
                    </Text>
                  </View>
                );
              }}
            />
          </View>
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.status.success }} />
                <Text style={{ fontSize: 14, color: colors.text.primary, fontWeight: '600' }}>
                  Completed
                </Text>
              </View>
              <Text style={{ fontSize: 14, color: colors.text.secondary, fontWeight: '600' }}>
                {goalAnalytics.statusBreakdown.completed}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.status.info }} />
                <Text style={{ fontSize: 14, color: colors.text.primary, fontWeight: '600' }}>
                  Active
                </Text>
              </View>
              <Text style={{ fontSize: 14, color: colors.text.secondary, fontWeight: '600' }}>
                {goalAnalytics.statusBreakdown.active}
              </Text>
            </View>
            {goalAnalytics.statusBreakdown.expired > 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.status.error }} />
                  <Text style={{ fontSize: 14, color: colors.text.primary, fontWeight: '600' }}>
                    Expired
                  </Text>
                </View>
                <Text style={{ fontSize: 14, color: colors.text.secondary, fontWeight: '600' }}>
                  {goalAnalytics.statusBreakdown.expired}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Average Progress Over Time */}
      {progressData.length > 0 && (
        <View style={{
          backgroundColor: colors.background.card,
          borderRadius: 16,
          padding: 20,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: colors.border.light,
        }}>
          <Text style={{
            fontSize: 18,
            fontWeight: '700',
            color: colors.text.primary,
            marginBottom: 16,
          }}>
            Average Progress Over Time
          </Text>
          <Text style={{
            fontSize: 13,
            color: colors.text.secondary,
            marginBottom: 20,
          }}>
            Average progress percentage (current/target) of goals created each month
          </Text>
          <LineChart
            data={progressData}
            width={chartWidth}
            height={200}
            color={colors.primary[600]}
            thickness={3}
            curved={true}
            areaChart={true}
            startFillColor={colors.primary[600] + '40'}
            endFillColor={colors.primary[600] + '10'}
            startOpacity={0.4}
            endOpacity={0.1}
            dataPointsColor={colors.primary[600]}
            dataPointsRadius={4}
            textShiftY={-10}
            textShiftX={-5}
            textFontSize={10}
            yAxisColor={colors.border.light}
            xAxisColor={colors.border.light}
            rulesColor={colors.border.light}
            yAxisTextStyle={{ color: colors.text.tertiary, fontSize: 10 }}
            maxValue={100}
            yAxisLabelSuffix="%"
            noOfSections={4}
            spacing={48}
          />
        </View>
      )}
    </ScrollView>
  );
}

