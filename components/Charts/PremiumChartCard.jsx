import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { useThemedColors } from "../../hooks/useThemedColors";
import { useTheme } from "../../contexts/ThemeContext";
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withSpring, 
    withTiming 
} from "react-native-reanimated";

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function PremiumChartCard({ 
    icon: IconComponent, 
    title, 
    subtitle, 
    onPress, 
    badge,
    disabled = false 
}) {
    const colors = useThemedColors();
    const { isDarkMode } = useTheme();
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.985, { damping: 20, stiffness: 400 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 20, stiffness: 400 });
    };

    // Premium badge colors - soft tinted style
    const getBadgeColors = () => {
        if (badge === 'PRO' || badge === 'PREMIUM') {
            return {
                bg: isDarkMode ? 'rgba(168, 85, 247, 0.15)' : 'rgba(168, 85, 247, 0.1)',
                text: isDarkMode ? '#C4B5FD' : '#7C3AED'
            };
        }
        if (badge === 'NEW') {
            return {
                bg: isDarkMode ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.1)',
                text: isDarkMode ? '#86EFAC' : '#16A34A'
            };
        }
        return {
            bg: isDarkMode ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)',
            text: isDarkMode ? '#A5B4FC' : '#4F46E5'
        };
    };

    const badgeColors = getBadgeColors();

    return (
        <AnimatedTouchableOpacity
            activeOpacity={1}
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled}
            style={[
                {
                    backgroundColor: colors.background.card,
                    borderRadius: 20,
                    marginBottom: 12,
                    padding: 20,
                    // Softer, more premium shadow
                    shadowColor: isDarkMode ? '#000' : '#64748B',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: isDarkMode ? 0.2 : 0.04,
                    shadowRadius: 12,
                    elevation: isDarkMode ? 4 : 2,
                    // Optional: very subtle border
                    borderWidth: isDarkMode ? 0.5 : 0,
                    borderColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'transparent',
                },
                animatedStyle,
            ]}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                
                {/* Icon Container */}
                {IconComponent && (
                    <View
                        style={{
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            backgroundColor: isDarkMode 
                                ? colors.neutral[200]
                                : colors.neutral[100],
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 14,
                        }}
                    >
                        <IconComponent 
                            size={22} 
                            color={colors.text.secondary}
                            strokeWidth={1.8}
                        />
                    </View>
                )}

                {/* Content */}
                <View style={{ flex: 1 }}>
                    {/* Title Row with Badge */}
                    <View style={{ 
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        gap: 8,
                        marginBottom: subtitle ? 4 : 0,
                    }}>
                        <Text
                            style={{
                                fontSize: 17,
                                fontWeight: "600",
                                letterSpacing: -0.3,
                                color: colors.text.primary,
                            }}
                            numberOfLines={1}
                        >
                            {title}
                        </Text>
                        
                        {badge && (
                            <View
                                style={{
                                    paddingHorizontal: 8,
                                    paddingVertical: 3,
                                    borderRadius: 6,
                                    backgroundColor: badgeColors.bg,
                                }}
                            >
                                <Text style={{ 
                                    fontSize: 10, 
                                    fontWeight: "700", 
                                    color: badgeColors.text, 
                                    letterSpacing: 0.5,
                                }}>
                                    {badge}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Subtitle */}
                    {subtitle && (
                        <Text
                            style={{
                                fontSize: 14,
                                fontWeight: "400",
                                lineHeight: 20,
                                color: colors.text.secondary,
                                letterSpacing: -0.1,
                            }}
                            numberOfLines={2}
                        >
                            {subtitle}
                        </Text>
                    )}
                </View>

                {/* Chevron - Inline */}
                <View
                    style={{
                        marginLeft: 12,
                        opacity: 0.4,
                    }}
                >
                    <ChevronRight
                        size={20}
                        color={colors.text.secondary}
                        strokeWidth={2}
                    />
                </View>
            </View>
        </AnimatedTouchableOpacity>
    );
}
