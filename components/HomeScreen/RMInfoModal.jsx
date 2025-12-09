import { View, Text, Modal, TouchableOpacity, Linking } from "react-native"
import { ExternalLink, Dumbbell, Repeat, Layers } from "lucide-react-native"
import { useThemedColors } from "../../hooks/useThemedColors"
import { useTheme } from "../../contexts/ThemeContext"
import ModalCloseButton from "../ModalCloseButton"

export default function RMInfoModal({ visible, onClose }) {
  const colors = useThemedColors();
  const { isDarkMode } = useTheme();
  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
        <TouchableOpacity activeOpacity={1} onPress={onClose} style={{ flex: 1 }} />
        <View style={{ 
          backgroundColor: colors.background.card, 
          borderTopLeftRadius: 24, 
          borderTopRightRadius: 24,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 10,
          minHeight: "60%",
        }}>
          <View style={{ width: 48, height: 4, backgroundColor: colors.border.light, borderRadius: 2, alignSelf: "center", marginTop: 12, marginBottom: 24 }} />

          <View style={{ paddingHorizontal: 24, paddingBottom: 32 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.text.primary }}>What is Rep Max (RM)?</Text>
              <ModalCloseButton onPress={onClose} size={18} />
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 16, color: colors.text.secondary, lineHeight: 24, marginBottom: 16 }}>
                Rep Max (RM) is the maximum weight you can lift for a given number of reps.
              </Text>
              <View style={{ backgroundColor: colors.primary[50], borderLeftWidth: 4, borderLeftColor: colors.primary[400], padding: 16, borderRadius: 12 }}>
                <Text style={{ fontWeight: "600", color: colors.text.primary, marginBottom: 4 }}>Formula Used:</Text>
                <Text style={{ color: colors.text.secondary }}>est 1RM = weight × (1 + reps / 30)</Text>
              </View>
            </View>

            <View style={{ backgroundColor: colors.background.primary, borderRadius: 16, padding: 20, marginBottom: 24 }}>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.text.primary, marginBottom: 16 }}>Examples</Text>

              <View style={{ marginBottom: 20 }}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                  <View style={{ width: 8, height: 8, backgroundColor: colors.primary[500], borderRadius: 4, marginRight: 12 }} />
                  <Text style={{ flex: 1, color: colors.text.secondary, fontSize: 15 }}>
                    <Text style={{ fontWeight: "600" }}>5RM:</Text> The most weight you can lift for 5 reps
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                  <View style={{ width: 8, height: 8, backgroundColor: colors.primary[500], borderRadius: 4, marginRight: 12 }} />
                  <Text style={{ flex: 1, color: colors.text.secondary, fontSize: 15 }}>
                    <Text style={{ fontWeight: "600" }}>3RM:</Text> The most weight you can lift for 3 reps
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{ width: 8, height: 8, backgroundColor: colors.primary[500], borderRadius: 4, marginRight: 12 }} />
                  <Text style={{ flex: 1, color: colors.text.secondary, fontSize: 15 }}>
                    <Text style={{ fontWeight: "600" }}>1RM:</Text> The most weight you can lift for 1 rep
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: colors.background.card, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.border.light }}>
                  <Dumbbell size={16} color={colors.primary[600]} />
                  <Text style={{ color: colors.text.secondary, fontSize: 14, fontWeight: "500", marginLeft: 8 }}>Weight</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: colors.background.card, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.border.light }}>
                  <Repeat size={16} color={colors.primary[600]} />
                  <Text style={{ color: colors.text.secondary, fontSize: 14, fontWeight: "500", marginLeft: 8 }}>Reps</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: colors.background.card, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.border.light }}>
                  <Layers size={16} color={colors.primary[600]} />
                  <Text style={{ color: colors.text.secondary, fontSize: 14, fontWeight: "500", marginLeft: 8 }}>Sets</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => Linking.openURL("https://en.wikipedia.org/wiki/One-repetition_maximum")}
              style={{
                backgroundColor: isDarkMode ? colors.primary[200] : colors.primary[600],
                borderRadius: 16,
                padding: 16,
                shadowColor: isDarkMode ? colors.primary[200] : colors.primary[600],
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                <ExternalLink size={20} color="white" />
                <Text style={{ color: "white", fontSize: 18, fontWeight: "bold", marginLeft: 12 }}>Learn More about Rep Max</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}
