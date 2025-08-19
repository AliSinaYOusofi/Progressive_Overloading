import React, { useRef, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ImageBackground,
    TouchableOpacity,
    Dimensions,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
    FadeIn,
    FadeOut,
    SlideInDown,
    SlideInUp,
    SlideInLeft,
    SlideInRight,
    SlideOutDown,
    withSpring,
    useAnimatedStyle,
    useSharedValue,
    interpolate,
    Extrapolate,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");
const PADDING = 20;
const SLIDE_WIDTH = width - PADDING * 2;
const SLIDE_HEIGHT = height * 0.75;

const AnimatedImageBackground = Animated.createAnimatedComponent(ImageBackground);
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const slides = [
    {
        key: "one",
        title: "Track Your Progress",
        background: require("../../assets/onboarding_images/5c97b65b-fa87-45ff-abe2-bbcc7c26019e.png"),
    },
    {
        key: "two",
        title: "Set Your Goals",
        background: require("../../assets/onboarding_images/5c97b65b-fa87-45ff-abe2-bbcc7c26019e.png"),
    },
    {
        key: "three",
        title: "Crush Your Workouts",
        background: require("../../assets/onboarding_images/5c97b65b-fa87-45ff-abe2-bbcc7c26019e.png"),
    },
];

const OnboardingCarousel = () => {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const carouselRef = useRef(null);
    const progressValue = useSharedValue(0);
    const buttonScale = useSharedValue(1);

    const onDoneOrSkip = async () => {
        try {
            await AsyncStorage.setItem("hasSeenOnboarding", "true");
        } catch (err) {
            // Optionally handle error
        }
        router.replace("/");
    };

    const buttonAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: withSpring(buttonScale.value) }],
        };
    });

    const handlePressIn = () => {
        buttonScale.value = 0.95;
    };

    const handlePressOut = () => {
        buttonScale.value = 1;
    };

    return (
        <View style={styles.container}>
            <AnimatedTouchableOpacity
                style={styles.skipButton}
                onPress={onDoneOrSkip}
                hitSlop={16}
                accessibilityLabel="Skip onboarding"
                entering={FadeIn.delay(200)}
            >
                <Ionicons name="close" size={36} color="#444" />
            </AnimatedTouchableOpacity>

            <Carousel
                ref={carouselRef}
                loop={false}
                width={width}
                height={SLIDE_HEIGHT + 120}
                data={slides}
                style={styles.carousel}
                pagingEnabled
                onSnapToItem={(index) => {
                    setCurrentIndex(index);
                    progressValue.value = withSpring(index);
                }}
                onProgressChange={(_, absoluteProgress) => {
                    progressValue.value = absoluteProgress;
                }}
                renderItem={({ item, index }) => {
                    // Create animation style based on carousel progress
                    const animatedStyle = useAnimatedStyle(() => {
                        const progress = progressValue.value - index;
                        
                        const opacity = interpolate(
                            Math.abs(progress),
                            [0, 0.5, 1],
                            [1, 0.5, 0],
                        );
                        
                        const scale = interpolate(
                            Math.abs(progress),
                            [0, 0.5, 1],
                            [1, 0.8, 0.7],
                        );
                        
                        return {
                            opacity,
                            transform: [{ scale }],
                        };
                    });
                    
                    return (
                        <View style={styles.slide}>
                            <AnimatedImageBackground
                                source={item.background}
                                style={[styles.backgroundImage, animatedStyle]}
                                imageStyle={styles.imageStyle}
                            >
                                <Animated.View 
                                    style={styles.textOverlay}
                                    entering={SlideInUp.duration(800).delay(300)}
                                >
                                    <Animated.Text 
                                        style={styles.title}
                                        entering={FadeIn.duration(800).delay(400)}
                                    >
                                        {item.title}
                                    </Animated.Text>
                                </Animated.View>
                            </AnimatedImageBackground>
                            
                            <Animated.View 
                                style={styles.bottomContainer}
                                entering={SlideInDown.duration(800).delay(500)}
                            >
                                {currentIndex === slides.length - 1 && (
                                    <AnimatedTouchableOpacity
                                        style={[styles.button, buttonAnimatedStyle]}
                                        onPress={onDoneOrSkip}
                                        onPressIn={handlePressIn}
                                        onPressOut={handlePressOut}
                                        accessibilityLabel="Get Started"
                                        entering={FadeIn.duration(800).delay(700)}
                                        exiting={FadeOut.duration(300)}
                                    >
                                        <Text style={styles.buttonText}>
                                            Get Started
                                        </Text>
                                        <Ionicons
                                            name="arrow-forward"
                                            size={20}
                                            style={{ marginLeft: 8 }}
                                        />
                                    </AnimatedTouchableOpacity>
                                )}
                            </Animated.View>
                        </View>
                    );
                }}
            />

            {/* Pagination Dots */}
            <Animated.View 
                style={styles.pagination}
                entering={FadeIn.duration(800).delay(600)}
            >
                {slides.map((_, i) => {
                    const dotAnimatedStyle = useAnimatedStyle(() => {
                        const progress = progressValue.value - i;
                        const scale = interpolate(
                            Math.abs(progress),
                            [0, 0.5, 1],
                            [1, 0.8, 0.6],
                        );
                        
                        const opacity = interpolate(
                            Math.abs(progress),
                            [0, 0.5, 1],
                            [1, 0.5, 0.3],
                        );
                        
                        const width = interpolate(
                            Math.abs(progress),
                            [0, 0.5, 1],
                            [currentIndex === i ? 15 : 9, 11, 9],
                            
                        );
                        
                        return {
                            width,
                            opacity,
                            transform: [{ scale }],
                            backgroundColor: currentIndex === i ? "#fff" : "#bbb",
                        };
                    });
                    
                    return (
                        <Animated.View
                            key={i}
                            style={[styles.dot, dotAnimatedStyle]}
                        />
                    );
                })}
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
        paddingTop: 50,
        alignItems: "center",
    },
    skipButton: {
        position: "absolute",
        top: 60,
        right: 30,
        zIndex: 10,
        backgroundColor: "#fff",
        borderRadius: 16,
        width: 36,
        height: 36,
        alignItems: "center",
        justifyContent: "center",
        elevation: 2,
    },
    carousel: {},
    slide: {
        width: width,
        alignItems: "center",
    },
    backgroundImage: {
        width: SLIDE_WIDTH,
        height: SLIDE_HEIGHT,
        borderRadius: 20,
        overflow: "hidden",
        justifyContent: "flex-end",
    },
    imageStyle: {
        borderRadius: 20,
        resizeMode: "cover",
        opacity: 0.9,
    },
    textOverlay: {
        padding: 20,
        backgroundColor: "rgba(0,0,0,0.4)",
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    title: {
        fontSize: 26,
        fontWeight: "bold",
        color: "#fff",
        textShadowColor: "#0009",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 6,
        textAlign: "center",
    },
    bottomContainer: {
        width: SLIDE_WIDTH,
        paddingVertical: 20,
        paddingHorizontal: 10,
        alignItems: "center",
    },
    button: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.93)",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 14,
    },
    buttonText: {
        fontSize: 17,
        fontWeight: "600",
        color: "#222",
    },
    pagination: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 20,
    },
    dot: {
        height: 9,
        borderRadius: 5,
        marginHorizontal: 5,
    },
});

export default OnboardingCarousel;