import { useState } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { colors } from "../../constants/ui_colors";

export default function CollapsibleSection({ 
    title, 
    subtitle, 
    children, 
    defaultExpanded = false,
    icon: Icon 
}) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    return (
        <View className="mb-6">
            <TouchableOpacity
                onPress={() => setIsExpanded(!isExpanded)}
                className="bg-white rounded-xl p-4 shadow-sm mb-2"
                activeOpacity={0.7}
            >
                <View className="flex-row items-center justify-between">
                    <View className="flex-1 flex-row items-center">
                        {Icon && (
                            <View 
                                className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                                style={{ backgroundColor: colors.primary[100] }}
                            >
                                <Icon size={20} color={colors.primary[600]} />
                            </View>
                        )}
                        <View className="flex-1">
                            <Text className="text-lg font-bold text-slate-900">{title}</Text>
                            {subtitle && (
                                <Text className="text-sm text-slate-600 mt-0.5">{subtitle}</Text>
                            )}
                        </View>
                    </View>
                    <View 
                        className="w-8 h-8 rounded-full items-center justify-center"
                        style={{ backgroundColor: colors.neutral[100] }}
                    >
                        {isExpanded ? (
                            <ChevronUp size={18} color={colors.primary[600]} />
                        ) : (
                            <ChevronDown size={18} color={colors.neutral[600]} />
                        )}
                    </View>
                </View>
            </TouchableOpacity>

            {isExpanded && (
                <View>
                    {children}
                </View>
            )}
        </View>
    );
}


