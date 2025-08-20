import { View, Text } from "react-native";
import ProgressionOnboardingCarousel from "../components/OnBoarding/OnBoardingApp";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { markOnboardingComplete } from "../utils/onboarding/skip_onboarding";
import { router } from "expo-router";
import "../assets/css/global.css"

export default function Home() {
    const [showCarousel, setShowCarousel] = useState(false);

    useEffect(() => {
        AsyncStorage.getItem("hasSeenOnboarding").then((value) => {
            if (value === "true") {
                router.replace("/signup");
            } else {
                setShowCarousel(true);
            }
        });
    }, []);

    return (
        <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
            {showCarousel ? (
                <ProgressionOnboardingCarousel
                    onSkip={() => markOnboardingComplete()}
                    onComplete={() => markOnboardingComplete()}
                />
            ) : null}
        </View>
    );
}
