import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { Dumbbell, Trophy, Target, Flame } from "lucide-react-native";
import { useThemedColors } from "../../hooks/useThemedColors";

export default function QuickStatsGrid({ recentSets, progressByExercise, fitnessGoals, currentStreak }) {
    const colors = useThemedColors();

    const stats = useMemo(() => {
        const uniqueDates = new Set(
            (recentSets || []).map(s => {
                const d = new Date(s.performed_at);
                return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            })
        );

        const prCount = (progressByExercise || []).length;

        const activeGoals = (fitnessGoals || []).filter(g => !g.is_completed && new Date(g.target_date) >= new Date());
        const goalProgress = activeGoals.length > 0
            ? Math.round(activeGoals.reduce((sum, g) => {
                const pct = g.target_value > 0 ? Math.min((g.current_value / g.target_value) * 100, 100) : 0;
                return sum + pct;
            }, 0) / activeGoals.length)
            : 0;

        return [
            { icon: Dumbbell, value: uniqueDates.size, label: "Workouts", color: colors.status.info },
            { icon: Trophy, value: prCount, label: "Exercises", color: colors.status.warning },
            { icon: Target, value: `${goalProgress}%`, label: "Goal Progress", color: colors.primary[600] },
            { icon: Flame, value: currentStreak || 0, label: "Day Streak", color: colors.status.error },
        ];
    }, [recentSets, progressByExercise, fitnessGoals, currentStreak, colors]);

    return (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                    <View
                        key={index}
                        style={{
                            flex: 1,
                            minWidth: "46%",
                            backgroundColor: colors.background.card,
                            borderRadius: 16,
                            padding: 16,
                            borderWidth: 1,
                            borderColor: colors.border.light,
                        }}
                    >
                        <View style={{
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            backgroundColor: stat.color + "15",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: 12,
                        }}>
                            <IconComponent size={20} color={stat.color} />
                        </View>
                        <Text style={{
                            fontSize: 28,
                            fontWeight: "800",
                            color: colors.text.primary,
                            letterSpacing: -0.5,
                        }}>
                            {stat.value}
                        </Text>
                        <Text style={{
                            fontSize: 13,
                            fontWeight: "500",
                            color: colors.text.tertiary,
                            marginTop: 2,
                        }}>
                            {stat.label}
                        </Text>
                    </View>
                );
            })}
        </View>
    );
}
