import { View, Text, TouchableOpacity } from "react-native"
import { useState, useEffect } from "react"
import { Ionicons } from "@expo/vector-icons"
import { useThemedColors } from "../../hooks/useThemedColors"
import { getCurrentUser, getVolumeAnalysis } from "../../lib/database"
import VolumeAnalysisInfoModal from "./VolumeAnalysisInfoModal"
import { formatShortNumber } from "../../utils/numberUtils"

export default function VolumeAnalysis({ 
  volumeAnalysis: initialData,
  parentTimeframe = 30 
}) {
  const colors = useThemedColors();
  const [hasUserChangedFilter, setHasUserChangedFilter] = useState(false)
  
  // Convert parent timeframe to component's format
  const convertParentTimeframe = (timeframe) => {
    if (timeframe === 'all') return 36500
    if (typeof timeframe === 'number') return timeframe
    return 30
  }
  
  const [selectedTimeframe, setSelectedTimeframe] = useState(() => convertParentTimeframe(parentTimeframe))
  const [volumeData, setVolumeData] = useState(initialData || {})
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState(null)
  const [showInfoModal, setShowInfoModal] = useState(false)
  
  // Sync with parent timeframe when it changes (only if user hasn't manually changed it)
  useEffect(() => {
    if (!hasUserChangedFilter) {
      const newTimeframe = convertParentTimeframe(parentTimeframe)
      setSelectedTimeframe(newTimeframe)
    }
    // Reset the flag when parent changes to 'all' to allow syncing
    if (parentTimeframe === 'all') {
      setHasUserChangedFilter(false)
    }
  }, [parentTimeframe])

  const timeframes = [
    { label: "7D", value: 7 },
    { label: "30D", value: 30 },
    { label: "90D", value: 90 },
    { label: "All", value: 36500 }, // 100 years for all time
  ]

  useEffect(() => {
    loadUser()
  }, [])

  useEffect(() => {
    if (userId) {
      loadVolumeData()
    }
  }, [userId, selectedTimeframe])

  const loadUser = async () => {
    const user = await getCurrentUser()
    if (user) {
      setUserId(user.id)
    }
  }

  const loadVolumeData = async () => {
    try {
      setLoading(true)
      const data = await getVolumeAnalysis(userId, selectedTimeframe)
      setVolumeData(data || {})
    } catch (error) {
      console.error("Error loading volume analysis:", error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate what percentage of days you worked out (dynamic based on timeframe)
  const actualTimeframe = selectedTimeframe === 36500 ? volumeData.workoutDays || 30 : selectedTimeframe
  const workoutFrequency = volumeData.workoutDays ? 
    (volumeData.workoutDays / actualTimeframe) * 100 : 0

  if (loading && (!volumeData || volumeData.totalVolume <= 0)) {
    return (
      <View className="mb-10">
        {/* Timeframe Filter */}
        <View style={{ marginBottom: 16 }}>
          <View 
            style={{ 
              flexDirection: "row", 
              backgroundColor: colors.background.secondary, 
              borderRadius: 12, 
              padding: 4 
            }}
          >
            {timeframes.map((timeframe) => (
              <TouchableOpacity
                key={timeframe.label}
                onPress={() => {
                  setSelectedTimeframe(timeframe.value)
                  setHasUserChangedFilter(true)
                }}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  borderRadius: 8,
                  backgroundColor: selectedTimeframe === timeframe.value 
                    ? colors.primary[600] 
                    : "transparent",
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontWeight: "600",
                    fontSize: 14,
                    color: selectedTimeframe === timeframe.value 
                      ? colors.text.white 
                      : colors.text.secondary,
                  }}
                >
                  {timeframe.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ backgroundColor: colors.background.card, borderRadius: 16, padding: 24, borderWidth: 1, borderColor: colors.border.light }}>
          <View style={{ alignItems: 'center', paddingVertical: 32 }}>
            <Ionicons name="analytics-outline" size={48} color={colors.primary[600]} />
            <Text style={{ color: colors.text.secondary, fontWeight: '500', marginTop: 12 }}>Loading volume data...</Text>
          </View>
        </View>
      </View>
    )
  }

  if (!volumeData || volumeData.totalVolume <= 0) {
    return (
      <View className="mb-10">
        {/* Timeframe Filter */}
        <View style={{ marginBottom: 16 }}>
          <View 
            style={{ 
              flexDirection: "row", 
              backgroundColor: colors.background.secondary, 
              borderRadius: 12, 
              padding: 4 
            }}
          >
            {timeframes.map((timeframe) => (
              <TouchableOpacity
                key={timeframe.label}
                onPress={() => {
                  setSelectedTimeframe(timeframe.value)
                  setHasUserChangedFilter(true)
                }}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  borderRadius: 8,
                  backgroundColor: selectedTimeframe === timeframe.value 
                    ? colors.primary[600] 
                    : "transparent",
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontWeight: "600",
                    fontSize: 14,
                    color: selectedTimeframe === timeframe.value 
                      ? colors.text.white 
                      : colors.text.secondary,
                  }}
                >
                  {timeframe.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ backgroundColor: colors.background.card, borderRadius: 16, padding: 24, borderWidth: 1, borderColor: colors.border.light }}>
          <View style={{ alignItems: 'center', paddingVertical: 32 }}>
            <Ionicons name="analytics-outline" size={48} color={colors.text.tertiary} />
            <Text style={{ color: colors.text.secondary, fontWeight: '500', marginTop: 12 }}>No volume data available</Text>
            <Text style={{ color: colors.text.tertiary, fontSize: 14, marginTop: 4 }}>Complete workouts to see analysis</Text>
          </View>
        </View>
      </View>
    )
  }

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "increasing":
        return "trending-up"
      case "decreasing":
        return "trending-down"
      default:
        return "remove"
    }
  }

  const getTrendColor = (trend) => {
    switch (trend) {
      case "increasing":
        return colors.status.success
      case "decreasing":
        return colors.status.error
      default:
        return colors.status.warning
    }
  }

  const timeframeLabel = timeframes.find(t => t.value === selectedTimeframe)?.label || "30D"

  return (
    <View>
      {/* Header with Info Icon */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text.primary }}>
          Volume Analysis
        </Text>
        <TouchableOpacity
          onPress={() => setShowInfoModal(true)}
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: colors.primary[100],
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Ionicons name="information" size={18} color={colors.primary[600]} />
        </TouchableOpacity>
      </View>

      {/* Timeframe Filter */}
      <View style={{ marginBottom: 16 }}>
        <View 
          style={{ 
            flexDirection: "row", 
            backgroundColor: colors.neutral[100], 
            borderRadius: 12, 
            padding: 4 
          }}
        >
          {timeframes.map((timeframe) => (
            <TouchableOpacity
              key={timeframe.label}
              onPress={() => setSelectedTimeframe(timeframe.value)}
              style={{
                flex: 1,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor: selectedTimeframe === timeframe.value 
                  ? colors.primary[600] 
                  : "transparent",
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  fontWeight: "600",
                  fontSize: 14,
                  color: selectedTimeframe === timeframe.value 
                    ? colors.text.white 
                    : colors.neutral[600],
                }}
              >
                {timeframe.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View 
        style={{ 
          backgroundColor: colors.background.card, 
          borderRadius: 16, 
          padding: 24, 
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
          borderWidth: 1, 
          borderColor: colors.border.light, 
          marginBottom: 16,
          opacity: loading ? 0.6 : 1 
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
          <View style={{ flex: 1, alignItems: 'center', backgroundColor: colors.background.primary, borderRadius: 12, padding: 16, marginRight: 8 }}>
            <Ionicons name="fitness" size={20} color={colors.primary[600]} style={{ marginBottom: 8 }} />
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text.primary, marginBottom: 4 }}>{formatShortNumber(volumeData.totalVolume || 0)}</Text>
            <Text style={{ fontSize: 12, color: colors.text.secondary, fontWeight: '500' }}>Total Volume</Text>
            <Text style={{ fontSize: 12, color: colors.text.tertiary }}>(kg)</Text>
          </View>

          <View style={{ flex: 1, alignItems: 'center', backgroundColor: colors.background.primary, borderRadius: 12, padding: 16, marginHorizontal: 4 }}>
            <Ionicons name="barbell" size={20} color={colors.primary[600]} style={{ marginBottom: 8 }} />
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text.primary, marginBottom: 4 }}>
              {formatShortNumber(volumeData.avgVolumePerWorkout || 0)}
            </Text>
            <Text style={{ fontSize: 12, color: colors.text.secondary, fontWeight: '500' }}>Avg/Workout</Text>
            <Text style={{ fontSize: 12, color: colors.text.tertiary }}>(kg)</Text>
          </View>

          <View style={{ flex: 1, alignItems: 'center', backgroundColor: colors.background.primary, borderRadius: 12, padding: 16, marginLeft: 8 }}>
            <Ionicons name="trophy" size={20} color={colors.primary[600]} style={{ marginBottom: 8 }} />
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text.primary, marginBottom: 4 }}>{formatShortNumber(volumeData.maxVolume || 0)}</Text>
            <Text style={{ fontSize: 12, color: colors.text.secondary, fontWeight: '500' }}>Peak Day</Text>
            <Text style={{ fontSize: 12, color: colors.text.tertiary }}>(kg)</Text>
          </View>
        </View>

        <View style={{ borderTopWidth: 1, borderTopColor: colors.border.light, paddingTop: 16, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ color: colors.text.secondary, fontWeight: '600' }}>Volume Trend</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons
                name={getTrendIcon(volumeData.trend)}
                size={16}
                color={getTrendColor(volumeData.trend)}
              />
              <Text
                style={{ 
                  fontSize: 14, 
                  fontWeight: 'bold', 
                  marginLeft: 4, 
                  textTransform: 'capitalize',
                  color: getTrendColor(volumeData.trend) 
                }}
              >
                {volumeData.trend}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ borderTopWidth: 1, borderTopColor: colors.border.light, paddingTop: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ color: colors.text.secondary, fontWeight: '600' }}>Workout Frequency</Text>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.primary[600] }}>
              {volumeData.workoutDays || 0} days
            </Text>
          </View>

          <View style={{ backgroundColor: colors.background.secondary, borderRadius: 9999, height: 8, marginBottom: 8 }}>
            <View
              style={{
                height: 8,
                borderRadius: 9999,
                width: `${Math.min(workoutFrequency, 100)}%`,
                backgroundColor: colors.primary[500],
              }}
            />
          </View>
          <Text style={{ fontSize: 12, color: colors.text.tertiary, textAlign: 'center' }}>
            {Math.min(workoutFrequency, 100).toFixed(0)}% workout frequency ({timeframeLabel})
          </Text>
        </View>
      </View>

      {/* Info Modal */}
      <VolumeAnalysisInfoModal
        visible={showInfoModal}
        onClose={() => setShowInfoModal(false)}
      />
    </View>
  )
}
