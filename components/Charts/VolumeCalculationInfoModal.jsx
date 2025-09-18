import { View, Text, Modal, TouchableOpacity, ScrollView, Dimensions } from "react-native"
import { Calculator, BarChart3, TrendingUp } from "lucide-react-native"
import { colors } from '../../constants/ui_colors'

const { height: screenHeight } = Dimensions.get('window')

export default function VolumeCalculationInfoModal({ visible, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={onClose}
          className="flex-1"
        />
        <View 
          className="bg-white rounded-t-3xl shadow-2xl"
          style={{ maxHeight: screenHeight * 0.9, minHeight: screenHeight * 0.8 }}
        >
          <View className="w-12 h-1 bg-gray-300 rounded-full self-center mt-3 mb-4" />

          <View className="flex-row justify-between items-center px-6 mb-4">
            <View className="flex-row items-center">
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: colors.primary[50] }}
              >
                <BarChart3 size={20} color={colors.primary[600]} />
              </View>
              <Text className="text-xl font-bold" style={{ color: colors.neutral[900] }}>
                Volume Calculation
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

          <ScrollView 
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
              <Text style={{ fontSize: 16, lineHeight: 24, marginBottom: 16, color: colors.neutral[600] }}>
                Training volume is calculated by multiplying the weight lifted by the number of repetitions for each set, then summing all sets for the day.
              </Text>

              <View
                style={{ 
                  padding: 16, 
                  borderRadius: 12, 
                  borderWidth: 2, 
                  marginBottom: 16,
                  backgroundColor: colors.primary[50], 
                  borderColor: colors.primary[200] 
                }}
              >
                <Text style={{ textAlign: 'center', fontWeight: '600', fontSize: 18, color: colors.primary[800] }}>
                  Volume = Weight × Reps
                </Text>
                <Text style={{ textAlign: 'center', fontSize: 14, marginTop: 4, color: colors.primary[700] }}>
                  (per individual set)
                </Text>
              </View>

              <View
                style={{ 
                  padding: 16, 
                  borderRadius: 12, 
                  borderWidth: 2,
                  backgroundColor: colors.neutral[50], 
                  borderColor: colors.neutral[200] 
                }}
              >
                <Text style={{ textAlign: 'center', fontWeight: '600', fontSize: 18, color: colors.neutral[800] }}>
                  Daily Total = Sum of all set volumes
                </Text>
              </View>
            </View>

            <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 16, color: colors.neutral[900] }}>
                Example Calculation
              </Text>
              <View style={{ borderRadius: 12, padding: 16, backgroundColor: colors.neutral[50] }}>
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontWeight: '600', marginBottom: 8, color: colors.neutral[800] }}>
                    Exercise: Bench Press
                  </Text>
                  <View style={{ marginLeft: 16 }}>
                    <Text style={{ color: colors.neutral[600], marginBottom: 4 }}>Set 1: 50kg × 10 reps = 500kg</Text>
                    <Text style={{ color: colors.neutral[600], marginBottom: 4 }}>Set 2: 50kg × 8 reps = 400kg</Text>
                    <Text style={{ color: colors.neutral[600], marginBottom: 4 }}>Set 3: 50kg × 6 reps = 300kg</Text>
                  </View>
                </View>

                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontWeight: '600', marginBottom: 8, color: colors.neutral[800] }}>
                    Exercise: Squats
                  </Text>
                  <View style={{ marginLeft: 16 }}>
                    <Text style={{ color: colors.neutral[600], marginBottom: 4 }}>Set 1: 60kg × 12 reps = 720kg</Text>
                    <Text style={{ color: colors.neutral[600], marginBottom: 4 }}>Set 2: 60kg × 10 reps = 600kg</Text>
                  </View>
                </View>

                <View style={{ borderTopWidth: 1, paddingTop: 12, marginTop: 12, borderTopColor: colors.neutral[200] }}>
                  <Text style={{ fontWeight: 'bold', textAlign: 'center', fontSize: 18, color: colors.primary[600] }}>
                    Daily Total: 2,520kg
                  </Text>
                </View>
              </View>
            </View>

            <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 16, color: colors.neutral[900] }}>
                Why This Matters
              </Text>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
                  <View style={{ 
                    width: 24, 
                    height: 24, 
                    borderRadius: 12, 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    marginRight: 12, 
                    marginTop: 2,
                    backgroundColor: colors.primary[100] 
                  }}>
                    <TrendingUp size={14} color={colors.primary[600]} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '600', color: colors.neutral[800] }}>Training Load</Text>
                    <Text style={{ fontSize: 14, color: colors.neutral[600] }}>Measures total work performed</Text>
                  </View>
                </View>
                
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <View style={{ 
                    width: 24, 
                    height: 24, 
                    borderRadius: 12, 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    marginRight: 12, 
                    marginTop: 2,
                    backgroundColor: colors.primary[100] 
                  }}>
                    <Calculator size={14} color={colors.primary[600]} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '600', color: colors.neutral[800] }}>Progress Tracking</Text>
                    <Text style={{ fontSize: 14, color: colors.neutral[600] }}>Helps monitor strength gains over time</Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={{ 
            paddingHorizontal: 24, 
            paddingBottom: 32, 
            paddingTop: 16, 
            borderTopWidth: 1, 
            borderTopColor: colors.neutral[200] 
          }}>
            <TouchableOpacity
              onPress={onClose}
              style={{ 
                paddingVertical: 16, 
                borderRadius: 12, 
                backgroundColor: colors.primary[600],
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5
              }}
            >
              <Text style={{ 
                textAlign: 'center', 
                color: 'white', 
                fontWeight: 'bold', 
                fontSize: 16 
              }}>
                Got it!
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}
