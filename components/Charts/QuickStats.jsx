import React from "react";
import { View, Text } from "react-native";
import { TrendingUp, Target, Dumbbell, Trophy } from "lucide-react-native";
import { useThemedColors } from "../../hooks/useThemedColors";
import { formatShortNumber } from "../../utils/numberUtils";

export default function QuickStats({ userStats, personalRecords }) {
    const colors = useThemedColors();
    const stats = [
        {
            icon: TrendingUp,
            value: formatShortNumber(userStats?.currentStreak || 0),
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
            value: formatShortNumber(userStats?.workoutCount || 0),
            label: "Total Sets",
            color: colors.status.info
        },
        {
            icon: Trophy,
            value: formatShortNumber(personalRecords?.length || 0),
            label: "Personal Records",
            color: colors.status.warning
        }
    ];

    return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 32 }}>
            {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                    <View
                        key={index}
                        style={{
                            width: '48%',
                            backgroundColor: colors.background.card,
                            padding: 16,
                            borderRadius: 12,
                            alignItems: 'center',
                            marginBottom: 16,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.05,
                            shadowRadius: 2,
                            elevation: 2
                        }}
                    >
                        <View style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: colors.primary[50],
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 8
                        }}>
                            <IconComponent size={24} color={stat.color} />
                        </View>
                        <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text.primary, marginBottom: 4 }}>{stat.value}</Text>
                        <Text style={{ fontSize: 12, color: colors.text.secondary, textAlign: 'center' }}>{stat.label}</Text>
                    </View>
                );
            })}
        </View>
    );
}
