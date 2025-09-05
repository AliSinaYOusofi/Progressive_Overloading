import { View, Text, Modal, TouchableOpacity, Linking } from "react-native"
import { ExternalLink, Dumbbell, Repeat, Layers } from "lucide-react-native"
import ModalCloseButton from "../ModalCloseButton"

export default function RMInfoModal({ visible, onClose }) {
  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        className="flex-1 justify-end"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <TouchableOpacity activeOpacity={1} onPress={() => {}}>
          <View className="bg-white rounded-t-3xl shadow-2xl" style={{ minHeight: "60%" }}>
            <View className="w-12 h-1 bg-gray-300 rounded-full self-center mt-3 mb-6" />

            <View className="px-6 pb-8">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-2xl font-bold text-gray-900">What is Rep Max (RM)?</Text>
                <ModalCloseButton onPress={onClose} size={18} />
              </View>

              <View className="mb-6">
                <Text className="text-gray-700 text-base leading-6 mb-4">
                  Rep Max (RM) is the maximum weight you can lift for a given number of reps.
                </Text>
                <View className="bg-emerald-50 border-l-4 border-emerald-400 p-4 rounded-r-lg">
                  <Text className="text-emerald-800 font-semibold mb-1">Formula Used:</Text>
                  <Text className="text-emerald-700">est 1RM = weight × (1 + reps / 30)</Text>
                </View>
              </View>

              <View className="bg-gray-50 rounded-2xl p-5 mb-6">
                <Text className="text-lg font-bold text-gray-900 mb-4">Examples</Text>

                <View className="space-y-3 mb-5">
                  <View className="flex-row items-center">
                    <View className="w-2 h-2 bg-emerald-500 rounded-full mr-3" />
                    <Text className="text-gray-700 flex-1">
                      <Text className="font-semibold">5RM:</Text> The most weight you can lift for 5 reps
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <View className="w-2 h-2 bg-emerald-500 rounded-full mr-3" />
                    <Text className="text-gray-700 flex-1">
                      <Text className="font-semibold">3RM:</Text> The most weight you can lift for 3 reps
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <View className="w-2 h-2 bg-emerald-500 rounded-full mr-3" />
                    <Text className="text-gray-700 flex-1">
                      <Text className="font-semibold">1RM:</Text> The most weight you can lift for 1 rep
                    </Text>
                  </View>
                </View>

                <View className="flex-row flex-wrap gap-2">
                  <View className="flex-row items-center bg-white px-3 py-2 rounded-full shadow-sm border border-gray-200">
                    <Dumbbell size={16} color="#10B981" />
                    <Text className="text-gray-700 text-sm font-medium ml-2">Weight</Text>
                  </View>
                  <View className="flex-row items-center bg-white px-3 py-2 rounded-full shadow-sm border border-gray-200">
                    <Repeat size={16} color="#10B981" />
                    <Text className="text-gray-700 text-sm font-medium ml-2">Reps</Text>
                  </View>
                  <View className="flex-row items-center bg-white px-3 py-2 rounded-full shadow-sm border border-gray-200">
                    <Layers size={16} color="#10B981" />
                    <Text className="text-gray-700 text-sm font-medium ml-2">Sets</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => Linking.openURL("https://en.wikipedia.org/wiki/One-repetition_maximum")}
                className="bg-emerald-500 rounded-2xl p-4 shadow-lg"
                style={{
                  shadowColor: "#10B981",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                }}
              >
                <View className="flex-row items-center justify-center">
                  <ExternalLink size={20} color="white" />
                  <Text className="text-white text-lg font-bold ml-3">Learn More about Rep Max</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )
}
