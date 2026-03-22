import { NativeTabs } from "expo-router/unstable-native-tabs";
import { ThemeProvider, DarkTheme, DefaultTheme } from "@react-navigation/native";
import { useTheme } from "../../contexts/ThemeContext";

export default function AuthLayout() {
    const { isDarkMode } = useTheme();

    return (
        <ThemeProvider value={isDarkMode ? DarkTheme : DefaultTheme}>
            <NativeTabs>
                <NativeTabs.Trigger name="signin">
                    <NativeTabs.Trigger.Icon sf={{ default: "arrow.right.to.line", selected: "arrow.right.to.line" }} />
                    <NativeTabs.Trigger.Label>Sign In</NativeTabs.Trigger.Label>
                </NativeTabs.Trigger>
                <NativeTabs.Trigger name="signup">
                    <NativeTabs.Trigger.Icon sf={{ default: "person.badge.plus", selected: "person.badge.plus.fill" }} />
                    <NativeTabs.Trigger.Label>Sign Up</NativeTabs.Trigger.Label>
                </NativeTabs.Trigger>
                <NativeTabs.Trigger name="forgot-password">
                    <NativeTabs.Trigger.Icon sf={{ default: "key", selected: "key.fill" }} />
                    <NativeTabs.Trigger.Label>Forgot Password</NativeTabs.Trigger.Label>
                </NativeTabs.Trigger>
            </NativeTabs>
        </ThemeProvider>
    );
}
