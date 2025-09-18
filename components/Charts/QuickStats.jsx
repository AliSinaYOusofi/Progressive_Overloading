import React from "react";
import { View, Text } from "react-native";
import { TrendingUp, Target, Dumbbell, Trophy } from "lucide-react-native";
import { colors } from "../../constants/ui_colors";

export default function QuickStats({ userStats, personalRecords }) {
    const stats = [
        {
            icon: TrendingUp,
            value: userStats?.currentStreak || 0,
            label: "Day Streak",
            color: colors.status.success
        },
        {
            icon: Target,
            value: `${userStats?.goalProgress || 0}%`,
            label: "Goal Progress",
            color: colors.primary[600]
        },
        {
            icon: Dumbbell,
            value: userStats?.workoutCount || 0,
            label: "Total Sets",
            color: colors.status.info
        },
        {
            icon: Trophy,
            value: personalRecords?.length || 0,
            label: "Personal Records",
            color: colors.status.warning
        }
    ];

    return (
        <View className="flex-row flex-wrap justify-between mb-8">
            {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                    <View key={index} className="w-[48%] bg-white p-4 rounded-xl items-center mb-4 shadow-sm">
                        <View className="w-10 h-10 rounded-full bg-emerald-50 items-center justify-center mb-2">
                            <IconComponent size={24} color={stat.color} />
                        </View>
                        <Text className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</Text>
                        <Text className="text-xs text-slate-600 text-center">{stat.label}</Text>
                    </View>
                );
            })}
        </View>
    );
}
