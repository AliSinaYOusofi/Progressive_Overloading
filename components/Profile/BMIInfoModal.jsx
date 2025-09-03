import { View, Text, Modal, TouchableOpacity, Linking } from "react-native"
import { ExternalLink, Calculator } from "lucide-react-native"
import { colors } from '../../constants/ui_colors'

export default function BMIInfoModal({ visible, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        className="flex-1 justify-end"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <TouchableOpacity activeOpacity={1} className="bg-white rounded-t-3xl shadow-2xl">
          <View className="w-12 h-1 bg-gray-300 rounded-full self-center mt-3 mb-4" />

          <View className="flex-row justify-between items-center px-6 mb-4">
            <View className="flex-row items-center">
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: colors.primary[50] }}
              >
                <Calculator size={20} color={colors.primary[600]} />
              </View>
              <Text className="text-xl font-bold" style={{ color: colors.neutral[900] }}>
                What is BMI?
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.neutral[100] }}
            >
              <Text className="text-xl font-medium" style={{ color: colors.neutral[500] }}>
                ×
              </Text>
            </TouchableOpacity>
          </View>

          <View className="px-6 mb-6">
            <Text className="text-base leading-6" style={{ color: colors.neutral[600] }}>
              Body Mass Index (BMI) is a measure of body fat based on height and weight. It's calculated by dividing
              your weight in kilograms by your height in meters squared.
            </Text>

            <View
              className="mt-4 p-4 rounded-xl border-2"
              style={{ backgroundColor: colors.primary[50], borderColor: colors.primary[200] }}
            >
              <Text className="text-center font-semibold" style={{ color: colors.primary[800] }}>
                BMI = Weight (kg) ÷ Height² (m²)
              </Text>
            </View>
          </View>

          <View className="px-6 mb-6">
            <Text className="text-lg font-semibold mb-4" style={{ color: colors.neutral[900] }}>
              BMI Categories
            </Text>
            <View className="rounded-xl p-4 shadow-sm" style={{ backgroundColor: colors.neutral[50] }}>
              {[
                { label: "Underweight", range: "Below 18.5", color: colors.status.info },
                { label: "Normal", range: "18.5 - 24.9", color: colors.status.success },
                { label: "Overweight", range: "25.0 - 29.9", color: colors.status.warning },
                { label: "Obese", range: "30.0 and above", color: colors.status.error },
              ].map((category, index) => (
                <View key={index} className="flex-row justify-between items-center py-3">
                  <View className="flex-row items-center">
                    <View className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: category.color }} />
                    <Text className="font-medium" style={{ color: colors.neutral[700] }}>
                      {category.label}
                    </Text>
                  </View>
                  <Text className="font-semibold" style={{ color: colors.neutral[900] }}>
                    {category.range}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View className="px-6 pb-8">
            <TouchableOpacity
              onPress={() => Linking.openURL("https://www.cdc.gov/healthyweight/assessing/bmi/index.html")}
              className="flex-row items-center justify-center py-4 rounded-xl shadow-lg"
              style={{ backgroundColor: colors.primary[600] }}
            >
              <ExternalLink size={18} color="white" />
              <Text className="ml-2 text-white font-bold text-base">Learn More from CDC</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )
}
