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
import { useTheme } from '../../contexts/ThemeContext'
import { MODAL_LAYOUT } from "../../constants/modal"

const { height: screenHeight } = Dimensions.get('window')

export default function TrendInfoModal({ visible, onClose }) {
  const colors = useThemedColors();
  const { isDarkMode } = useTheme();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)", paddingHorizontal: MODAL_LAYOUT.horizontalMargin, paddingBottom: MODAL_LAYOUT.bottomPadding }}>
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={onClose}
          style={{ flex: 1 }}
        />
        <View 
          style={{ 
            backgroundColor: colors.background.card,
            borderRadius: MODAL_LAYOUT.borderRadius,
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
                    backgroundColor: colors.background.secondary || colors.neutral[100],
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12
                  }}
                >
                  <Ionicons name="information-circle" size={24} color={colors.icon?.primary || colors.primary[600]} />
                </View>
                <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.text.primary }}>
                  How Trends Work
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: colors.background.primary,
                  borderWidth: 1,
                  borderColor: colors.border.light,
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Text style={{ fontSize: 20, color: colors.text.tertiary, fontWeight: "500" }}>×</Text>
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
                backgroundColor: colors.background.card,
                borderRadius: 16,
                padding: 20,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: colors.border.light
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: colors.background.secondary || colors.neutral[100],
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 10
                  }}
                >
                  <TrendingUp size={18} color={colors.icon?.primary || colors.primary[600]} />
                </View>
                <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text.primary }}>
                  Trend Calculation
                </Text>
              </View>
              <Text style={{ fontSize: 14, color: colors.text.secondary, lineHeight: 22, marginBottom: 12 }}>
                Trends are calculated by comparing the <Text style={{ fontWeight: "700", color: colors.text.primary }}>first half</Text> of your selected timeframe with the <Text style={{ fontWeight: "700", color: colors.text.primary }}>second half</Text>. The percentage shows how much your average has changed.
              </Text>
              <View 
                style={{ 
                  backgroundColor: colors.background.primary, 
                  padding: 14, 
                  borderRadius: 10,
                  borderLeftWidth: 4,
                  borderLeftColor: colors.primary[600]
                }}
              >
                <Text style={{ fontSize: 13, color: colors.text.secondary, fontWeight: "500" }}>
                  💡 Example: In 30 days, we compare days 1-15 vs days 16-30
                </Text>
              </View>
            </View>

            {/* Trend Indicators Section */}
            <View style={{ marginBottom: 20 }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
                <Activity size={18} color={colors.icon?.primary || colors.primary[600]} style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 17, fontWeight: "700", color: colors.text.primary }}>
                  Trend Indicators
                </Text>
              </View>
              
              {/* Increasing */}
              <View 
                style={{ 
                  backgroundColor: colors.status.success + "15",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: colors.status.success + "25"
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
                    <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text.primary, marginBottom: 4 }}>
                      Increasing
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.text.secondary, lineHeight: 20 }}>
                      Performance improved by <Text style={{ fontWeight: "700", color: colors.text.primary }}>more than 2%</Text> — keep it up, you're making great progress!
                    </Text>
                  </View>
                </View>
              </View>

              {/* Stable */}
              <View 
                style={{ 
                  backgroundColor: colors.status.warning + "15",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: colors.status.warning + "25"
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
                    <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text.primary, marginBottom: 4 }}>
                      Stable
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.text.secondary, lineHeight: 20 }}>
                      Performance stayed within <Text style={{ fontWeight: "700", color: colors.text.primary }}>±2%</Text> — you're maintaining your strength consistently.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Decreasing */}
              <View 
                style={{ 
                  backgroundColor: colors.status.error + "15",
                  borderRadius: 12,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: colors.status.error + "25"
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
                    <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text.primary, marginBottom: 4 }}>
                      Decreasing
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.text.secondary, lineHeight: 20 }}>
                      Performance decreased by <Text style={{ fontWeight: "700", color: colors.text.primary }}>more than 2%</Text> — consider rest, recovery, or checking your form.
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Consistency Card */}
            <View 
              style={{ 
                backgroundColor: colors.background.card,
                borderRadius: 16,
                padding: 20,
                borderWidth: 1,
                borderColor: colors.border.light
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: colors.background.secondary || colors.neutral[100],
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 10
                  }}
                >
                  <Calendar size={18} color={colors.icon?.primary || colors.primary[600]} />
                </View>
                <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text.primary }}>
                  Consistency Score
                </Text>
              </View>
              <Text style={{ fontSize: 14, color: colors.text.secondary, lineHeight: 22 }}>
                Shows how many times per week you performed this exercise during the selected timeframe. <Text style={{ fontWeight: "700", color: colors.text.primary }}>Higher consistency</Text> usually leads to better progress!
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
                backgroundColor: isDarkMode ? colors.primary[200] : colors.primary[600],
                paddingVertical: 14,
                borderRadius: 12,
                shadowColor: isDarkMode ? colors.primary[200] : colors.primary[600],
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

