import React, { useState } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Alert,
} from "react-native";
import {
    Flame,
    TrendingUp,
    Dumbbell,
    Target,
    Calendar,
    Award,
    ChevronRight,
    Plus,
    BarChart3,
    Clock,
    Pencil,
    Trash2,
} from "lucide-react-native";
import AddWorkoutModal from "../components/HomeScreen/AddWorkoutModal";
import { colors, semanticColors } from "../constants/ui_colors";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
    const [workouts, setWorkouts] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingWorkoutId, setEditingWorkoutId] = useState(null);
    const [formState, setFormState] = useState({
        name: "",
        exercises: "",
        duration: "",
        lastWeight: "",
        targetIncrease: "",
    });

    const currentStreak = 12;
    const todayWorkout = {
        name: "Push Day - Upper Body",
        exercises: 6,
        duration: "45-60 min",
        lastWeight: "225 lbs",
        targetIncrease: "+5 lbs",
    };

    const weeklyProgress = [
        { day: "Mon", completed: true, weight: 220 },
        { day: "Tue", completed: true, weight: 185 },
        { day: "Wed", completed: false, weight: 0 },
        { day: "Thu", completed: true, weight: 225 },
        { day: "Fri", completed: false, weight: 0 },
        { day: "Sat", completed: true, weight: 205 },
        { day: "Sun", completed: false, weight: 0 },
    ];

    const recentAchievements = [
        {
            exercise: "Bench Press",
            achievement: "New PR: 225 lbs",
            date: "2 days ago",
        },
        {
            exercise: "Squat",
            achievement: "+10 lbs increase",
            date: "1 week ago",
        },
    ];

    function openAddWorkoutModal() {
        setEditingWorkoutId(null);
        setFormState({
            name: "",
            exercises: "",
            duration: "",
            lastWeight: "",
            targetIncrease: "",
        });
        setIsModalVisible(true);
    }

    function openEditWorkoutModal(workout) {
        setEditingWorkoutId(workout.id);
        setFormState({
            name: workout.name ?? "",
            exercises: String(workout.exercises ?? ""),
            duration: workout.duration ?? "",
            lastWeight: workout.lastWeight ?? "",
            targetIncrease: workout.targetIncrease ?? "",
        });
        setIsModalVisible(true);
    }

    function handleDeleteWorkout(id) {
        Alert.alert(
            "Delete workout",
            "Are you sure you want to delete this workout?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () =>
                        setWorkouts((prev) => prev.filter((w) => w.id !== id)),
                },
            ]
        );
    }

    function handleSaveWorkout(payload) {
        const trimmedName = (payload?.name ?? "").trim();
        if (!trimmedName) {
            Alert.alert("Name required", "Please enter a workout name.");
            return;
        }

        const exercisesNum = Number(payload?.exercises);
        const newWorkout = {
            id: editingWorkoutId ?? Math.random().toString(36).slice(2),
            name: trimmedName,
            exercises:
                Number.isFinite(exercisesNum) && exercisesNum > 0
                    ? exercisesNum
                    : 1,
            duration: (payload?.duration ?? "").trim() || "30-45 min",
            lastWeight: (payload?.lastWeight ?? "").trim() || "-",
            targetIncrease:
                (payload?.targetIncrease ?? "").trim() || "+2.5 lbs",
        };

        setWorkouts((prev) => {
            if (editingWorkoutId) {
                return prev.map((w) =>
                    w.id === editingWorkoutId ? { ...w, ...newWorkout } : w
                );
            }
            return [newWorkout, ...prev];
        });

        setIsModalVisible(false);
        setEditingWorkoutId(null);
    }

    return (
        <ScrollView
            className="flex-1 bg-slate-50"
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <View className="bg-emerald-600 pt-12 pb-6 px-6 rounded-b-3xl">
                <View className="flex-row justify-between items-center mb-4">
                    <View>
                        <Text className="text-white text-lg font-medium">
                            Good morning,
                        </Text>
                        <Text className="text-white text-2xl font-bold">
                            Alex
                        </Text>
                    </View>
                    <View className="flex-row items-center bg-emerald-500 px-3 py-2 rounded-full">
                        <Flame size={20} color={colors.text.white} />
                        <Text className="text-white font-bold ml-1">
                            {currentStreak}
                        </Text>
                        <Text className="text-emerald-100 text-sm ml-1">
                            day streak
                        </Text>
                    </View>
                </View>

                <Text className="text-emerald-100 text-base">
                    Ready to push your limits today?
                </Text>
            </View>

            <View className="px-6 -mt-4">
                {/* Today's Workout Card */}
                <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-gray-900 text-xl font-bold">
                            Today's Workout
                        </Text>
                        <View className="bg-emerald-100 px-3 py-1 rounded-full">
                            <Text className="text-emerald-700 text-sm font-medium">
                                Scheduled
                            </Text>
                        </View>
                    </View>

                    <Text className="text-gray-700 text-lg font-semibold mb-3">
                        {todayWorkout.name}
                    </Text>

                    <View className="flex-row justify-between mb-4">
                        <View className="flex-row items-center">
                            <Dumbbell size={16} color={colors.text.tertiary} />
                            <Text className="text-gray-600 ml-2">
                                {todayWorkout.exercises} exercises
                            </Text>
                        </View>
                        <View className="flex-row items-center">
                            <Clock size={16} color={colors.text.tertiary} />
                            <Text className="text-gray-600 ml-2">
                                {todayWorkout.duration}
                            </Text>
                        </View>
                    </View>

                    <View className="bg-gray-50 rounded-xl p-4 mb-4">
                        <Text className="text-gray-600 text-sm mb-1">
                            Progressive Overload Target
                        </Text>
                        <View className="flex-row justify-between items-center">
                            <Text className="text-gray-900 font-semibold">
                                Last: {todayWorkout.lastWeight}
                            </Text>
                            <View className="flex-row items-center">
                                <TrendingUp size={16} color={colors.primary[600]} />
                                <Text className="text-emerald-600 font-bold ml-1">
                                    {todayWorkout.targetIncrease}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity className="bg-emerald-600 rounded-xl py-4 flex-row justify-center items-center">
                        <Text className="text-white font-semibold text-lg mr-2">
                            Start Workout
                        </Text>
                        <ChevronRight size={20} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Weekly Progress */}
                <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                    <Text className="text-gray-900 text-xl font-bold mb-4">
                        This Week's Progress
                    </Text>

                    <View className="flex-row justify-between items-end mb-4">
                        {weeklyProgress.map((day, index) => (
                            <View key={index} className="items-center">
                                <View
                                    className={`w-8 h-16 rounded-lg mb-2 ${
                                        day.completed
                                            ? "bg-emerald-500"
                                            : "bg-gray-200"
                                    }`}
                                    style={{
                                        height: day.completed
                                            ? Math.max(
                                                  16,
                                                  (day.weight / 250) * 64
                                              )
                                            : 16,
                                    }}
                                />
                                <Text
                                    className={`text-xs font-medium ${
                                        day.completed
                                            ? "text-emerald-600"
                                            : "text-gray-400"
                                    }`}
                                >
                                    {day.day}
                                </Text>
                            </View>
                        ))}
                    </View>

                    <View className="flex-row justify-between items-center">
                        <Text className="text-gray-600">
                            4/7 workouts completed
                        </Text>
                        <Text className="text-emerald-600 font-semibold">
                            57% this week
                        </Text>
                    </View>
                </View>

                {/* Quick Actions */}
                <View className="flex-row justify-between mb-6">
                    <TouchableOpacity className="bg-white rounded-2xl p-4 flex-1 mr-3 shadow-sm border border-gray-100 items-center">
                        <View className="bg-blue-100 p-3 rounded-full mb-2">
                            <BarChart3 size={24} color={colors.status.info} />
                        </View>
                        <Text className="text-gray-900 font-semibold text-center">
                            Progress
                        </Text>
                        <Text className="text-gray-500 text-sm text-center">
                            View Stats
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={openAddWorkoutModal}
                        className="bg-white rounded-2xl p-4 flex-1 mx-1.5 shadow-sm border border-gray-100 items-center"
                    >
                        <View className="bg-purple-100 p-3 rounded-full mb-2">
                            <Plus size={24} color={colors.status.info} />
                        </View>
                        <Text className="text-gray-900 font-semibold text-center">
                            Custom
                        </Text>
                        <Text className="text-gray-500 text-sm text-center">
                            Workout
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="bg-white rounded-2xl p-4 flex-1 ml-3 shadow-sm border border-gray-100 items-center">
                        <View className="bg-orange-100 p-3 rounded-full mb-2">
                            <Target size={24} color={colors.status.warning} />
                        </View>
                        <Text className="text-gray-900 font-semibold text-center">
                            Goals
                        </Text>
                        <Text className="text-gray-500 text-sm text-center">
                            Set Targets
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* My Workouts */}
                <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                    <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-gray-900 text-xl font-bold">
                            My Workouts
                        </Text>
                        <TouchableOpacity
                            onPress={openAddWorkoutModal}
                            className="flex-row items-center bg-emerald-100 px-3 py-1 rounded-full"
                        >
                            <Plus size={18} color="#059669" />
                            <Text className="text-emerald-700 font-medium ml-1">
                                Add
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {workouts.length === 0 ? (
                        <View className="bg-gray-50 rounded-xl p-4">
                            <Text className="text-gray-600">
                                You have no custom workouts yet. Tap Add to
                                create one.
                            </Text>
                        </View>
                    ) : (
                        <View>
                            {workouts.map((w) => (
                                <View
                                    key={w.id}
                                    className="flex-row items-start py-3 border-b border-gray-100 last:border-b-0"
                                >
                                    <View className="flex-1 pr-3">
                                        <Text className="text-gray-900 font-semibold mb-1">
                                            {w.name}
                                        </Text>
                                        <View className="flex-row items-center justify-between">
                                            <View className="flex-row">
                                                <View className="flex-row items-center mr-4">
                                                    <Dumbbell
                                                        size={16}
                                                        color={colors.text.tertiary}
                                                    />
                                                    <Text className="text-gray-600 ml-1">
                                                        {w.exercises} exercises
                                                    </Text>
                                                </View>
                                                <View className="flex-row items-center mr-4">
                                                    <Clock
                                                        size={16}
                                                        color={colors.text.tertiary}
                                                    />
                                                    <Text className="text-gray-600 ml-1">
                                                        {w.duration}
                                                    </Text>
                                                </View>
                                            </View>
                                            <View className="flex-row items-center">
                                                <Text className="text-gray-900 font-medium mr-2">
                                                    Last: {w.lastWeight}
                                                </Text>
                                                <View className="flex-row items-center">
                                                    <TrendingUp
                                                        size={16}
                                                        color={colors.primary[600]}
                                                    />
                                                    <Text className="text-emerald-600 font-bold ml-1">
                                                        {w.targetIncrease}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                    <View className="flex-row items-center">
                                        <TouchableOpacity
                                            onPress={() =>
                                                openEditWorkoutModal(w)
                                            }
                                            className="bg-emerald-50 p-2 rounded-lg mr-2"
                                        >
                                            <Pencil size={18} color={colors.primary[600]} />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() =>
                                                handleDeleteWorkout(w.id)
                                            }
                                            className="bg-rose-50 p-2 rounded-lg"
                                        >
                                            <Trash2 size={18} color={colors.status.error} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                {/* Recent Achievements */}
                <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-gray-900 text-xl font-bold">
                            Recent Achievements
                        </Text>
                        <Award size={20} color="#F59E0B" />
                    </View>

                    {recentAchievements.map((achievement, index) => (
                        <View
                            key={index}
                            className="flex-row items-center py-3 border-b border-gray-100 last:border-b-0"
                        >
                            <View className="bg-amber-100 p-2 rounded-full mr-3">
                                <TrendingUp size={16} color={colors.status.warning} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-900 font-semibold">
                                    {achievement.exercise}
                                </Text>
                                <Text className="text-gray-600 text-sm">
                                    {achievement.achievement}
                                </Text>
                            </View>
                            <Text className="text-gray-400 text-xs">
                                {achievement.date}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Next Workout Preview */}
                <View className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 mb-8">
                    <Text className="text-white text-lg font-bold mb-2">
                        Tomorrow's Focus
                    </Text>
                    <Text className="text-gray-300 mb-4">
                        Pull Day - Back & Biceps
                    </Text>

                    <View className="flex-row items-center">
                        <Calendar size={16} color={colors.text.tertiary} />
                        <Text className="text-gray-300 ml-2">
                            6 exercises • 50-65 min
                        </Text>
                    </View>
                </View>
            </View>

            <AddWorkoutModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                onSubmit={(values) => handleSaveWorkout(values)}
                initialValues={formState}
                isEditing={Boolean(editingWorkoutId)}
            />
        </ScrollView>
    );
}
