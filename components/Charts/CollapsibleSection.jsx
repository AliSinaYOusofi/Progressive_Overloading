import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { useThemedColors } from "../../hooks/useThemedColors";
import { useTheme } from "../../contexts/ThemeContext";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from "react-native-reanimated";

const AnimatedView = Animated.createAnimatedComponent(View);

export default function CollapsibleSection({ 
    title, 
    subtitle, 
    children, 
    defaultExpanded = false,
    icon: Icon 
}) {
    const colors = useThemedColors();
    const { isDarkMode } = useTheme();
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const chevronScale = useSharedValue(1);
    const chevronRotation = useSharedValue(0);

    const chevronAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { scale: chevronScale.value },
                { rotate: `${chevronRotation.value}deg` }
            ],
        };
    });

    return (
        <View style={{ marginBottom: 16 }}>
            <TouchableOpacity
                onPress={() => {
                    setIsExpanded(!isExpanded);
                    chevronScale.value = withSpring(1.1, { damping: 15, stiffness: 400 });
                    setTimeout(() => {
                        chevronScale.value = withSpring(1, { damping: 15, stiffness: 400 });
                    }, 150);
                }}
                activeOpacity={0.92}
                style={{
                    backgroundColor: colors.background.card,
                    borderRadius: 16,
                    padding: 24,
                    borderWidth: 1,
                    borderColor: isDarkMode 
                        ? `${colors.border.light}80` 
                        : `${colors.border.light}CC`,
                    shadowColor: isDarkMode ? '#000' : colors.primary[600],
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isDarkMode ? 0.15 : 0.06,
                    shadowRadius: isDarkMode ? 8 : 6,
                    elevation: isDarkMode ? 3 : 2,
                }}
            >
                <View>
                    {/* Content */}
                    <View style={{ flex: 1 }}>
                        <Text
                            style={{
                                fontSize: 19,
                                fontWeight: "600",
                                letterSpacing: -0.5,
                                color: colors.text.primary,
                                lineHeight: 24,
                                marginBottom: 8,
                            }}
                        >
                            {title}
                        </Text>
                        {subtitle && (
                            <Text
                                style={{
                                    fontSize: 14,
                                    fontWeight: "400",
                                    lineHeight: 20,
                                    color: colors.text.secondary,
                                    letterSpacing: -0.1,
                                    marginBottom: 16,
                                }}
                            >
                                {subtitle}
                            </Text>
                        )}
                    </View>

                    {/* Horizontal Line */}
                    <View
                        style={{
                            height: 1,
                            backgroundColor: isDarkMode 
                                ? `${colors.border.light}60` 
                                : `${colors.border.light}AA`,
                            marginBottom: 12,
                            marginTop: 4,
                        }}
                    />

                    {/* Chevron - Below HR */}
                    <View style={{ alignItems: 'flex-end' }}>
                        <AnimatedView
                            style={[
                                {
                                    padding: 8,
                                    borderRadius: 8,
                                    backgroundColor: isDarkMode 
                                        ? colors.neutral[700]
                                        : colors.neutral[100],
                                },
                                chevronAnimatedStyle,
                            ]}
                        >
                            {isExpanded ? (
                                <ChevronUp 
                                    size={20} 
                                    color={isDarkMode ? colors.text.tertiary : colors.text.tertiary} 
                                    strokeWidth={2.2} 
                                />
                            ) : (
                                <ChevronDown 
                                    size={20} 
                                    color={isDarkMode ? colors.text.tertiary : colors.text.tertiary} 
                                    strokeWidth={2.2} 
                                />
                            )}
                        </AnimatedView>
                    </View>
                </View>
            </TouchableOpacity>

            {isExpanded && (
                <View style={{ marginTop: 12 }}>
                    {children}
                </View>
            )}
        </View>
    );
}


