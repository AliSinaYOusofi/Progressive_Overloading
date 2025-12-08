import { View, Text, Modal, TouchableOpacity, Linking } from "react-native"
import { ExternalLink, Calculator } from "lucide-react-native"
import { useThemedColors } from '../../hooks/useThemedColors'

export default function BMIInfoModal({ visible, onClose }) {
  const colors = useThemedColors();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <TouchableOpacity 
          activeOpacity={1} 
          style={{ 
            backgroundColor: colors.background.card, 
            borderTopLeftRadius: 24, 
            borderTopRightRadius: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 8
          }}
        >
          <View style={{ 
            width: 48, 
            height: 4, 
            backgroundColor: colors.border.light, 
            borderRadius: 2, 
            alignSelf: 'center', 
            marginTop: 12, 
            marginBottom: 16 
          }} />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                  backgroundColor: colors.primary[50]
                }}
              >
                <Calculator size={20} color={colors.primary[600]} />
              </View>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text.primary }}>
                What is BMI?
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.background.primary
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: '500', color: colors.text.tertiary }}>
                ×
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
            <Text style={{ fontSize: 16, lineHeight: 24, color: colors.text.secondary }}>
              Body Mass Index (BMI) is a measure of body fat based on height and weight. It's calculated by dividing
              your weight in kilograms by your height in meters squared.
            </Text>

            <View
              style={{
                marginTop: 16,
                padding: 16,
                borderRadius: 12,
                borderWidth: 2,
                backgroundColor: colors.primary[50],
                borderColor: colors.primary[200]
              }}
            >
              <Text style={{ textAlign: 'center', fontWeight: '600', color: colors.primary[800] }}>
                BMI = Weight (kg) ÷ Height² (m²)
              </Text>
            </View>
          </View>

          <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 16, color: colors.text.primary }}>
              BMI Categories
            </Text>
            <View style={{ 
              borderRadius: 12, 
              padding: 16, 
              backgroundColor: colors.background.primary,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 2
            }}>
              {[
                { label: "Underweight", range: "Below 18.5", color: colors.status.info },
                { label: "Normal", range: "18.5 - 24.9", color: colors.status.success },
                { label: "Overweight", range: "25.0 - 29.9", color: colors.status.warning },
                { label: "Obese", range: "30.0 and above", color: colors.status.error },
              ].map((category, index) => (
                <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 12, height: 12, borderRadius: 6, marginRight: 12, backgroundColor: category.color }} />
                    <Text style={{ fontWeight: '500', color: colors.text.secondary }}>
                      {category.label}
                    </Text>
                  </View>
                  <Text style={{ fontWeight: '600', color: colors.text.primary }}>
                    {category.range}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={{ paddingHorizontal: 24, paddingBottom: 32 }}>
            <TouchableOpacity
              onPress={() => Linking.openURL("https://www.cdc.gov/healthyweight/assessing/bmi/index.html")}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 16,
                borderRadius: 12,
                backgroundColor: colors.primary[600],
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
                elevation: 4
              }}
            >
              <ExternalLink size={18} color="white" />
              <Text style={{ marginLeft: 8, color: colors.text.white, fontWeight: 'bold', fontSize: 16 }}>Learn More from CDC</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )
}
