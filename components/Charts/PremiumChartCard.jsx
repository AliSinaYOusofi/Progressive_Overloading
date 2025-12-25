import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { useThemedColors } from "../../hooks/useThemedColors";
import { useTheme } from "../../contexts/ThemeContext";
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withSpring, 
    withTiming,
    interpolate,
    Extrapolate
} from "react-native-reanimated";

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedView = Animated.createAnimatedComponent(View);

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
    
    // Multiple animated values for premium feel
    const pressProgress = useSharedValue(0);
    const chevronTranslateX = useSharedValue(0);
    const iconScale = useSharedValue(1);
    const shadowOpacity = useSharedValue(isDarkMode ? 0.2 : 0.04);
    const shadowRadius = useSharedValue(12);

    // Main card animation
    const cardAnimatedStyle = useAnimatedStyle(() => {
        const scale = interpolate(
            pressProgress.value,
            [0, 1],
            [1, 0.97],
            Extrapolate.CLAMP
        );
        
        const opacity = interpolate(
            pressProgress.value,
            [0, 1],
            [1, 0.92],
            Extrapolate.CLAMP
        );

        return {
            transform: [{ scale }],
            opacity,
            shadowOpacity: shadowOpacity.value,
            shadowRadius: shadowRadius.value,
        };
    });

    // Chevron animation - slides right on press
    const chevronAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: chevronTranslateX.value }],
        opacity: interpolate(
            pressProgress.value,
            [0, 1],
            [0.4, 0.8],
            Extrapolate.CLAMP
        ),
    }));

    // Icon container animation
    const iconContainerAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: iconScale.value }],
    }));

    // Background overlay animation
    const overlayAnimatedStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            pressProgress.value,
            [0, 1],
            [0, 0.08],
            Extrapolate.CLAMP
        );
        return {
            opacity,
        };
    });

    const handlePressIn = () => {
        pressProgress.value = withSpring(1, {
            damping: 15,
            stiffness: 300,
            mass: 0.8,
        });
        chevronTranslateX.value = withSpring(4, {
            damping: 12,
            stiffness: 400,
        });
        iconScale.value = withSpring(0.92, {
            damping: 15,
            stiffness: 350,
        });
        shadowOpacity.value = withTiming(isDarkMode ? 0.15 : 0.02, { duration: 150 });
        shadowRadius.value = withTiming(8, { duration: 150 });
    };

    const handlePressOut = () => {
        pressProgress.value = withSpring(0, {
            damping: 18,
            stiffness: 300,
            mass: 0.8,
        });
        chevronTranslateX.value = withSpring(0, {
            damping: 15,
            stiffness: 400,
        });
        iconScale.value = withSpring(1, {
            damping: 18,
            stiffness: 350,
        });
        shadowOpacity.value = withTiming(isDarkMode ? 0.2 : 0.04, { duration: 200 });
        shadowRadius.value = withTiming(12, { duration: 200 });
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
        if (badge === 'BETA' || badge === 'beta') {
            return {
                bg: isDarkMode ? 'rgba(251, 146, 60, 0.15)' : 'rgba(251, 146, 60, 0.1)',
                text: isDarkMode ? '#FED7AA' : '#EA580C'
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
                    borderRadius: 20,
                    marginBottom: 12,
                    overflow: 'hidden',
                    // Softer, more premium shadow
                    shadowColor: isDarkMode ? '#000' : '#64748B',
                    shadowOffset: { width: 0, height: 4 },
                    elevation: isDarkMode ? 4 : 2,
                    // Optional: very subtle border
                    borderWidth: isDarkMode ? 0.5 : 0,
                    borderColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'transparent',
                },
                cardAnimatedStyle,
            ]}
        >
            <View
                style={{
                    backgroundColor: colors.background.card,
                    padding: 20,
                    position: 'relative',
                }}
            >
                {/* Press overlay - subtle background tint */}
                <AnimatedView
                    style={[
                        {
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: isDarkMode 
                                ? colors.primary[600]
                                : colors.primary[50],
                        },
                        overlayAnimatedStyle,
                    ]}
                />

                <View style={{ flexDirection: 'row', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                    
                    {/* Icon Container */}
                    {IconComponent && (
                        <AnimatedView
                            style={[
                                {
                                    width: 52,
                                    height: 52,
                                    borderRadius: 14,
                                    backgroundColor: isDarkMode 
                                        ? `${colors.primary[600]}20`
                                        : `${colors.primary[600]}15`,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 16,
                                },
                                iconContainerAnimatedStyle,
                            ]}
                        >
                            <IconComponent 
                                size={28} 
                                color={colors.icon.primary[600]}
                            />
                        </AnimatedView>
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

                    {/* Chevron - Animated */}
                    <AnimatedView
                        style={[
                            {
                                marginLeft: 12,
                            },
                            chevronAnimatedStyle,
                        ]}
                    >
                        <ChevronRight
                            size={20}
                            color={colors.text.secondary}
                            strokeWidth={2}
                        />
                    </AnimatedView>
                </View>
            </View>
        </AnimatedTouchableOpacity>
    );
}
