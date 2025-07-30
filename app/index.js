import { View, Text } from "react-native";
import ProgressionOnboardingCarousel from "../components/OnBoarding/OnBoardingApp";

export default function Home() {
    return (
        <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
            <Text>Welcome to Progressive Overloading!</Text>
        </View>
    );
}
