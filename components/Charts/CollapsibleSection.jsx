import { useState } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { useThemedColors } from "../../hooks/useThemedColors";

export default function CollapsibleSection({ 
    title, 
    subtitle, 
    children, 
    defaultExpanded = false,
    icon: Icon 
}) {
    const colors = useThemedColors();
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    return (
        <View style={{ marginBottom: 24 }}>
            <TouchableOpacity
                onPress={() => setIsExpanded(!isExpanded)}
                style={{
                    backgroundColor: colors.background.card,
                    borderRadius: 12,
                    padding: 16,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 2,
                    marginBottom: 8
                }}
                activeOpacity={0.7}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                        {Icon && (
                            <View 
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 12,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 12,
                                    backgroundColor: colors.primary[100]
                                }}
                            >
                                <Icon size={20} color={colors.primary[600]} />
                            </View>
                        )}
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text.primary }}>{title}</Text>
                            {subtitle && (
                                <Text style={{ fontSize: 14, color: colors.text.secondary, marginTop: 2 }}>{subtitle}</Text>
                            )}
                        </View>
                    </View>
                    <View 
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: colors.background.primary
                        }}
                    >
                        {isExpanded ? (
                            <ChevronUp size={18} color={colors.primary[600]} />
                        ) : (
                            <ChevronDown size={18} color={colors.text.secondary} />
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


