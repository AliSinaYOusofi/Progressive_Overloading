import { View, Text } from "react-native";
import ProgressionOnboardingCarousel from "../components/OnBoarding/OnBoardingApp";
import OnboardingCarousel from "../components/OnBoarding/OnBoardingApp";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Home() {

    const [showCarousel, setShowCarousel] = useState(false);

    useEffect(() => {
        AsyncStorage.getItem("hasSeenOnboarding").then((value) => {
            if (value === "true") {
                router.replace("/");
            } else {
                setShowCarousel(true);
            }
        });
    }, []);

    return (
        <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
            {showCarousel ? <ProgressionOnboardingCarousel /> : null}
            
        </View>
    );
}
