import React from "react";
import { View, Text, Dimensions } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { useThemedColors } from "../../hooks/useThemedColors";
import { useTheme } from "../../contexts/ThemeContext";

const { width: screenWidth } = Dimensions.get('window');

export default function ProgressiveOverloadChart({ timeSeriesData, progression, exerciseName }) {
  const colors = useThemedColors();
  const { isDarkMode } = useTheme();

  if (!timeSeriesData || timeSeriesData.length < 2) {
    return null;
  }

  const getProgressionColor = (progression) => {
    switch (progression) {
      case "excellent":
        return colors.status.success;
      case "good":
        return colors.primary[600];
      case "stable":
        return colors.status.warning;
      case "declining":
        return colors.status.error;
      default:
        return colors.primary[600];
    }
  };

  // Format data for LineChart
  const formatChartData = () => {
    // Take last 15 data points or all if less
    const dataPoints = timeSeriesData.slice(-15);
    
    return dataPoints.map((point) => {
      const date = new Date(point.date);
      const label = date.toLocaleDateString('en', { month: 'short', day: 'numeric' });
      
      return {
        value: point.avg1RM,
        label: label,
        dataPointText: point.avg1RM.toFixed(1),
        labelTextStyle: { color: colors.text.tertiary, fontSize: 9 },
        dataPointTextStyle: { color: colors.text.primary, fontSize: 9 }
      };
    });
  };

  const chartData = formatChartData();
  const chartColor = getProgressionColor(progression);
  const minValue = Math.min(...timeSeriesData.map(d => d.avg1RM));
  const maxValue = Math.max(...timeSeriesData.map(d => d.avg1RM));
  const range = maxValue - minValue;
  const yAxisMax = maxValue + (range * 0.1); // Add 10% padding
  const yAxisMin = Math.max(0, minValue - (range * 0.1));

  // Calculate chart width accounting for container padding and screen margins
  // Container padding: 12px on each side = 24px total
  // Screen margins: ~48px on each side (from parent padding) = 96px total
  // So available width = screenWidth - 96 - 24 = screenWidth - 120
  const containerPadding = 12;
  const screenMargins = 48; // Approximate padding from parent ScrollView
  const availableWidth = screenWidth - (screenMargins * 2) - (containerPadding * 2);
  
  // Calculate spacing: width should account for initialSpacing and endSpacing
  // Formula: width = initialSpacing + (spacing * (dataPoints - 1)) + endSpacing
  const initialSpacing = 20;
  const endSpacing = 20;
  const chartWidth = availableWidth;
  const spacing = 48;

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ 
        fontSize: 11, 
        color: colors.text.tertiary, 
        marginBottom: 8,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.5
      }}>
        1RM Progression Over Time
      </Text>
      <View style={{ 
        backgroundColor: colors.background.primary,
        borderRadius: 8,
        padding: containerPadding,
        borderWidth: 1,
        borderColor: colors.border.light,
        overflow: 'hidden' // Prevent chart from extending beyond container
      }}>
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <LineChart
            data={chartData}
            width={chartWidth}
            height={140}
            color={chartColor}
            thickness={2}
            dataPointsColor={chartColor}
            dataPointsRadius={4}
            hideDataPoints={false}
            hideRules={false}
            rulesType="solid"
            rulesColor={colors.border.light}
            yAxisColor={colors.border.light}
            xAxisColor={colors.border.light}
            yAxisTextStyle={{ color: colors.text.tertiary, fontSize: 9 }}
            xAxisLabelTextStyle={{ color: colors.text.tertiary, fontSize: 8 }}
            showVerticalLines={false}
            showHorizontalLines={true}
            spacing={spacing}
            initialSpacing={initialSpacing}
            endSpacing={endSpacing}
            maxValue={yAxisMax}
            minValue={yAxisMin}
            noOfSections={4}
            yAxisSide="left"
            xAxisSide="bottom"
            curved={true}
            areaChart={true}
            startFillColor={chartColor + "40"}
            endFillColor={chartColor + "10"}
            startOpacity={0.4}
            endOpacity={0.1}
          />
        </View>
      </View>
    </View>
  );
}

