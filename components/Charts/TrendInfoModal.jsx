import React from "react"
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions
} from "react-native"
import { TrendingUp, TrendingDown, Activity, Calendar } from "lucide-react-native"
import { Ionicons } from "@expo/vector-icons"
import { useThemedColors } from '../../hooks/useThemedColors'

const { height: screenHeight } = Dimensions.get('window')

export default function TrendInfoModal({ visible, onClose }) {
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
                  <Ionicons name="information-circle" size={24} color={colors.primary[600]} />
                </View>
                <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.neutral[900] }}>
                  How Trends Work
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
            {/* Trend Calculation Card */}
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
                  <TrendingUp size={18} color={colors.text.white} />
                </View>
                <Text style={{ fontSize: 16, fontWeight: "700", color: colors.neutral[900] }}>
                  Trend Calculation
                </Text>
              </View>
              <Text style={{ fontSize: 14, color: colors.neutral[700], lineHeight: 22, marginBottom: 12 }}>
                Trends are calculated by comparing the <Text style={{ fontWeight: "700", color: colors.neutral[900] }}>first half</Text> of your selected timeframe with the <Text style={{ fontWeight: "700", color: colors.neutral[900] }}>second half</Text>. The percentage shows how much your average has changed.
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
                <Text style={{ fontSize: 13, color: colors.neutral[800], fontWeight: "500" }}>
                  💡 Example: In 30 days, we compare days 1-15 vs days 16-30
                </Text>
              </View>
            </View>

            {/* Trend Indicators Section */}
            <View style={{ marginBottom: 20 }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
                <Activity size={18} color={colors.primary[600]} style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 17, fontWeight: "700", color: colors.neutral[900] }}>
                  Trend Indicators
                </Text>
              </View>
              
              {/* Increasing */}
              <View 
                style={{ 
                  backgroundColor: colors.status.successLight,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: colors.status.success + "30"
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                  <View style={{ 
                    width: 36, 
                    height: 36, 
                    borderRadius: 18, 
                    backgroundColor: colors.status.success,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                    marginTop: 2
                  }}>
                    <TrendingUp size={18} color={colors.text.white} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: "700", color: colors.neutral[900], marginBottom: 4 }}>
                      Increasing
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.neutral[700], lineHeight: 20 }}>
                      Performance improved by <Text style={{ fontWeight: "700" }}>more than 2%</Text> — keep it up, you're making great progress!
                    </Text>
                  </View>
                </View>
              </View>

              {/* Stable */}
              <View 
                style={{ 
                  backgroundColor: colors.status.warningLight,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: colors.status.warning + "30"
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                  <View style={{ 
                    width: 36, 
                    height: 36, 
                    borderRadius: 18, 
                    backgroundColor: colors.status.warning,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                    marginTop: 2
                  }}>
                    <Activity size={18} color={colors.text.white} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: "700", color: colors.neutral[900], marginBottom: 4 }}>
                      Stable
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.neutral[700], lineHeight: 20 }}>
                      Performance stayed within <Text style={{ fontWeight: "700" }}>±2%</Text> — you're maintaining your strength consistently.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Decreasing */}
              <View 
                style={{ 
                  backgroundColor: colors.status.errorLight,
                  borderRadius: 12,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: colors.status.error + "30"
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                  <View style={{ 
                    width: 36, 
                    height: 36, 
                    borderRadius: 18, 
                    backgroundColor: colors.status.error,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                    marginTop: 2
                  }}>
                    <TrendingDown size={18} color={colors.text.white} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: "700", color: colors.neutral[900], marginBottom: 4 }}>
                      Decreasing
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.neutral[700], lineHeight: 20 }}>
                      Performance decreased by <Text style={{ fontWeight: "700" }}>more than 2%</Text> — consider rest, recovery, or checking your form.
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Consistency Card */}
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
                  <Calendar size={18} color={colors.text.white} />
                </View>
                <Text style={{ fontSize: 16, fontWeight: "700", color: colors.neutral[900] }}>
                  Consistency Score
                </Text>
              </View>
              <Text style={{ fontSize: 14, color: colors.neutral[700], lineHeight: 22 }}>
                Shows how many times per week you performed this exercise during the selected timeframe. <Text style={{ fontWeight: "700" }}>Higher consistency</Text> usually leads to better progress!
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
                Got it! 👍
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

