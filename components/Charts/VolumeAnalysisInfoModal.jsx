import React from "react"
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useThemedColors } from '../../hooks/useThemedColors'

const { height: screenHeight } = Dimensions.get('window')

export default function VolumeAnalysisInfoModal({ visible, onClose }) {
  const colors = useThemedColors();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" }}>
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={onClose}
          style={{ flex: 1 }}
        />
        <View 
          style={{ 
            backgroundColor: colors.background.card,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            height: screenHeight * 0.85,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.2,
            shadowRadius: 12,
            elevation: 20
          }}
        >
          {/* Drag Handle */}
          <View style={{ width: 40, height: 4, backgroundColor: colors.neutral[300], borderRadius: 2, alignSelf: "center", marginTop: 12, marginBottom: 8 }} />

          {/* Header */}
          <View style={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: colors.primary[100],
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12
                  }}
                >
                  <Ionicons name="bar-chart" size={24} color={colors.primary[600]} />
                </View>
                <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.neutral[900] }}>
                  Volume Analysis Explained
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: colors.neutral[100],
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Text style={{ fontSize: 20, color: colors.neutral[600], fontWeight: "500" }}>×</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Content */}
          <ScrollView 
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
          >
            {/* What is Volume */}
            <View 
              style={{ 
                backgroundColor: colors.primary[50],
                borderRadius: 16,
                padding: 20,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: colors.primary[200]
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: colors.primary[600],
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 10
                  }}
                >
                  <Ionicons name="calculator" size={18} color={colors.text.white} />
                </View>
                <Text style={{ fontSize: 16, fontWeight: "700", color: colors.neutral[900] }}>
                  What is Training Volume?
                </Text>
              </View>
              <Text style={{ fontSize: 14, color: colors.neutral[700], lineHeight: 22, marginBottom: 12 }}>
                Training volume is the total amount of work you perform. It's calculated as:
              </Text>
              <View 
                style={{ 
                  backgroundColor: colors.background.card, 
                  padding: 14, 
                  borderRadius: 10,
                  borderLeftWidth: 4,
                  borderLeftColor: colors.primary[600]
                }}
              >
                <Text style={{ fontSize: 15, color: colors.neutral[900], fontWeight: "700", textAlign: "center", marginBottom: 4 }}>
                  Volume = Weight × Reps × Sets
                </Text>
                <Text style={{ fontSize: 12, color: colors.neutral[600], textAlign: "center" }}>
                  💡 Example: 100kg × 10 reps × 3 sets = 3,000 kg
                </Text>
              </View>
            </View>

            {/* Metrics Explained */}
            <View style={{ marginBottom: 20 }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
                <Ionicons name="stats-chart" size={18} color={colors.primary[600]} style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 17, fontWeight: "700", color: colors.neutral[900] }}>
                  Key Metrics
                </Text>
              </View>
              
              {/* Total Volume */}
              <View 
                style={{ 
                  backgroundColor: colors.neutral[50],
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: colors.neutral[200]
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                  <View style={{ 
                    width: 36, 
                    height: 36, 
                    borderRadius: 18, 
                    backgroundColor: colors.primary[600],
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                    marginTop: 2
                  }}>
                    <Ionicons name="fitness" size={18} color={colors.text.white} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: "700", color: colors.neutral[900], marginBottom: 4 }}>
                      Total Volume
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.neutral[700], lineHeight: 20 }}>
                      Sum of all weight lifted during the selected timeframe. <Text style={{ fontWeight: "700" }}>Higher volume</Text> typically indicates more training stimulus.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Avg Per Workout */}
              <View 
                style={{ 
                  backgroundColor: colors.neutral[50],
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: colors.neutral[200]
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                  <View style={{ 
                    width: 36, 
                    height: 36, 
                    borderRadius: 18, 
                    backgroundColor: colors.primary[600],
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                    marginTop: 2
                  }}>
                    <Ionicons name="barbell" size={18} color={colors.text.white} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: "700", color: colors.neutral[900], marginBottom: 4 }}>
                      Average Per Workout
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.neutral[700], lineHeight: 20 }}>
                      Average volume per workout session (excluding rest days). Helps track workout <Text style={{ fontWeight: "700" }}>intensity</Text> over time.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Peak Day */}
              <View 
                style={{ 
                  backgroundColor: colors.neutral[50],
                  borderRadius: 12,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: colors.neutral[200]
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                  <View style={{ 
                    width: 36, 
                    height: 36, 
                    borderRadius: 18, 
                    backgroundColor: colors.primary[600],
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                    marginTop: 2
                  }}>
                    <Ionicons name="trophy" size={18} color={colors.text.white} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: "700", color: colors.neutral[900], marginBottom: 4 }}>
                      Peak Day
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.neutral[700], lineHeight: 20 }}>
                      Your highest volume achieved in a single day. This represents your <Text style={{ fontWeight: "700" }}>peak performance</Text> during the period.
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Trend Indicators */}
            <View 
              style={{ 
                backgroundColor: colors.status.successLight,
                borderRadius: 16,
                padding: 20,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: colors.status.success + "30"
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: colors.status.success,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 10
                  }}
                >
                  <Ionicons name="trending-up" size={18} color={colors.text.white} />
                </View>
                <Text style={{ fontSize: 16, fontWeight: "700", color: colors.neutral[900] }}>
                  Volume Trends
                </Text>
              </View>
              <Text style={{ fontSize: 14, color: colors.neutral[700], lineHeight: 22, marginBottom: 12 }}>
                Trends show whether your volume is increasing, decreasing, or staying stable by comparing the <Text style={{ fontWeight: "700" }}>first half</Text> vs <Text style={{ fontWeight: "700" }}>second half</Text> of your selected timeframe.
              </Text>
              <View 
                style={{ 
                  backgroundColor: colors.background.card, 
                  padding: 14, 
                  borderRadius: 10,
                }}
              >
                <Text style={{ fontSize: 13, color: colors.neutral[800], lineHeight: 19 }}>
                  <Text style={{ fontWeight: "700", color: colors.status.success }}>✓ Increasing:</Text> Volume up by 5%+{'\n'}
                  <Text style={{ fontWeight: "700", color: colors.status.warning }}>− Stable:</Text> Volume within ±5%{'\n'}
                  <Text style={{ fontWeight: "700", color: colors.status.error }}>✗ Decreasing:</Text> Volume down by 5%+
                </Text>
              </View>
            </View>

            {/* Workout Frequency */}
            <View 
              style={{ 
                backgroundColor: colors.neutral[50],
                borderRadius: 16,
                padding: 20,
                borderWidth: 1,
                borderColor: colors.neutral[200]
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: colors.primary[600],
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 10
                  }}
                >
                  <Ionicons name="calendar" size={18} color={colors.text.white} />
                </View>
                <Text style={{ fontSize: 16, fontWeight: "700", color: colors.neutral[900] }}>
                  Workout Frequency
                </Text>
              </View>
              <Text style={{ fontSize: 14, color: colors.neutral[700], lineHeight: 22 }}>
                Shows what percentage of days you worked out during the selected timeframe. <Text style={{ fontWeight: "700" }}>Consistency is key</Text> to achieving your fitness goals! 🎯
              </Text>
            </View>
          </ScrollView>

          {/* Footer Button */}
          <View style={{ 
            paddingHorizontal: 24, 
            paddingTop: 12, 
            paddingBottom: 20, 
            borderTopWidth: 1, 
            borderTopColor: colors.border.light, 
            backgroundColor: colors.background.card 
          }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                backgroundColor: colors.primary[600],
                paddingVertical: 14,
                borderRadius: 12,
                shadowColor: colors.primary[600],
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4
              }}
            >
              <Text style={{ 
                textAlign: "center", 
                color: colors.text.white, 
                fontWeight: "700",
                fontSize: 16
              }}>
                Got it! 💪
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

