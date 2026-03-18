import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Flame } from "lucide-react-native";
import { useThemedColors } from "../../hooks/useThemedColors";

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
}

function getFormattedDate() {
    return new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
    });
}

export default function DashboardHeader({ profile, user, currentStreak }) {
    const colors = useThemedColors();
    const router = useRouter();
    const firstName = profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Athlete";

    return (
        <View style={{ paddingTop: 60, paddingBottom: 8, paddingHorizontal: 20 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <View style={{ flex: 1 }}>
                    <Text style={{
                        fontSize: 15,
                        fontWeight: "500",
                        color: colors.text.tertiary,
                        marginBottom: 4,
                    }}>
                        {getGreeting()}
                    </Text>
                    <Text style={{
                        fontSize: 28,
                        fontWeight: "800",
                        color: colors.text.primary,
                        letterSpacing: -0.5,
                    }}>
                        {firstName}
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 }}>
                        <Text style={{
                            fontSize: 13,
                            fontWeight: "500",
                            color: colors.text.tertiary,
                        }}>
                            {getFormattedDate()}
                        </Text>
                        <View style={{
                            backgroundColor: colors.primary[600] + "15",
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            borderRadius: 6,
                        }}>
                            <Text style={{
                                fontSize: 11,
                                fontWeight: "600",
                                color: colors.primary[600],
                            }}>
                                Last 30 days
                            </Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={() => router.push("/homescreen/streak-info")}
                    activeOpacity={0.7}
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: colors.status.warning + "15",
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: colors.status.warning + "30",
                        marginTop: 4,
                    }}
                >
                    <Flame size={18} color={colors.status.warning} />
                    <Text style={{
                        fontSize: 16,
                        fontWeight: "800",
                        color: colors.status.warning,
                        marginLeft: 6,
                    }}>
                        {currentStreak || 0}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
