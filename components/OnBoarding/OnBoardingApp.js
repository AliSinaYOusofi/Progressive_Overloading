import React, { useState, useEffect, useRef } from "react";
import { View, Text, Dimensions, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Carousel from "react-native-reanimated-carousel";
import { Feather } from "@expo/vector-icons";

const { width: screenWidth } = Dimensions.get("window");
const SLIDE_WIDTH = screenWidth * 0.8;

const ProgressionOnboardingCarousel = ({ data, onDone }) => {
    const [activeSlide, setActiveSlide] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const carouselRef = useRef(null);

    useEffect(() => {
        checkIntroFlag();
    }, []);

    const checkIntroFlag = async () => {
        try {
            const hasSeenIntro = await AsyncStorage.getItem(
                "hasSeenProgressionIntro"
            );
            if (hasSeenIntro === "true") {
                onDone();
                return;
            }
        } catch (error) {
            console.error("Error checking intro flag:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGetStarted = async () => {
        try {
            await AsyncStorage.setItem("hasSeenProgressionIntro", "true");
            onDone();
        } catch (error) {
            console.error("Error setting intro flag:", error);
            onDone(); // Still proceed even if AsyncStorage fails
        }
    };

    const handleNext = () => {
        if (activeSlide < data.length - 1) {
            carouselRef.current?.scrollTo({
                index: activeSlide + 1,
                animated: true,
            });
        }
    };

    const renderWorkoutCard = ({ item }) => {
        return (
            <View className="bg-white rounded-2xl mx-2 p-6 shadow-lg shadow-black/10 h-80">
                {/* Barbell Icon */}
                <View className="mb-4">
                    <Feather name="activity" size={24} color="#6B7280" />
                </View>

                {/* Exercise Name */}
                <Text className="text-2xl font-bold text-gray-900 mb-6">
                    {item.exerciseName}
                </Text>

                {/* Weight Information */}
                <View className="mb-8">
                    <Text className="text-3xl font-semibold text-green-600 mb-1">
                        {item.weight}
                    </Text>
                    <Text className="text-sm text-gray-500">{item.delta}</Text>
                </View>

                {/* Last Session Date */}
                <View className="mt-auto">
                    <Text className="text-xs text-gray-400">
                        Last session: {item.lastDate}
                    </Text>
                </View>
            </View>
        );
    };

    const renderPagination = () => {
        return (
            <View className="flex-row justify-center items-center py-5">
                {data.map((_, index) => (
                    <View
                        key={index}
                        className={`w-2 h-2 rounded-full mx-1 ${
                            index === activeSlide
                                ? "bg-green-600"
                                : "bg-gray-300"
                        }`}
                    />
                ))}
            </View>
        );
    };

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50">
                <Text className="text-gray-600">Loading...</Text>
            </View>
        );
    }

    const isLastSlide = activeSlide === data.length - 1;

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="pt-16 pb-8 px-6">
                <Text className="text-3xl font-bold text-gray-900 text-center mb-2">
                    Track Your Progress
                </Text>
                <Text className="text-gray-600 text-center">
                    See how your lifts improve over time
                </Text>
            </View>

            {/* Carousel */}
            <View className="flex-1 justify-center">
                <Carousel
                    ref={carouselRef}
                    width={screenWidth}
                    height={320}
                    data={data}
                    renderItem={renderWorkoutCard}
                    onSnapToItem={setActiveSlide}
                    mode="parallax"
                    modeConfig={{
                        parallaxScrollingScale: 0.9,
                        parallaxScrollingOffset: 50,
                    }}
                    style={{
                        width: screenWidth,
                        justifyContent: "center",
                    }}
                />

                {/* Custom Pagination */}
                {renderPagination()}
            </View>

            {/* Bottom Navigation */}
            <View className="px-6 pb-8">
                <TouchableOpacity
                    onPress={isLastSlide ? handleGetStarted : handleNext}
                    className="bg-green-600 rounded-xl py-4 px-8 shadow-lg shadow-green-600/25"
                    activeOpacity={0.8}
                >
                    <Text className="text-white text-lg font-semibold text-center">
                        {isLastSlide ? "Get Started" : "Next"}
                    </Text>
                </TouchableOpacity>

                {/* Skip Button */}
                {!isLastSlide && (
                    <TouchableOpacity
                        onPress={handleGetStarted}
                        className="mt-4 py-2"
                        activeOpacity={0.6}
                    >
                        <Text className="text-gray-500 text-center">Skip</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

export default ProgressionOnboardingCarousel;
