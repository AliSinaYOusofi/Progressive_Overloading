import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Alert,
    RefreshControl,
    ActivityIndicator
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
    User,
    Trophy,
    Tag
} from "lucide-react-native";
import AddWorkoutModal from "../components/HomeScreen/AddWorkoutModal";
import AddGoalModal from "../components/HomeScreen/AddGoalModal";
import StartWorkoutModal from "../components/HomeScreen/StartWorkoutModal";
import AddCategoryModal from "../components/HomeScreen/AddCategoryModal";
import { colors } from "../constants/ui_colors";
import { 
    getCurrentUser, 
    getProfile, 
    getWorkoutTemplates, 
    getWorkoutCategories,
    createWorkoutCategory,
    createWorkoutTemplate,
    updateWorkoutTemplate,
    deleteWorkoutTemplate,
    getWeeklyProgress,
    getCurrentStreak,
    getPersonalRecords,
    getFitnessGoals,
    createFitnessGoal,
    createWorkoutSession
} from "../lib/database";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [workoutTemplates, setWorkoutTemplates] = useState([]);
    const [workoutCategories, setWorkoutCategories] = useState([]);
    const [weeklyProgress, setWeeklyProgress] = useState([]);
    const [currentStreak, setCurrentStreak] = useState(0);
    const [personalRecords, setPersonalRecords] = useState([]);
    const [fitnessGoals, setFitnessGoals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Modal states
    const [isWorkoutModalVisible, setIsWorkoutModalVisible] = useState(false);
    const [isGoalModalVisible, setIsGoalModalVisible] = useState(false);
    const [isStartWorkoutModalVisible, setIsStartWorkoutModalVisible] = useState(false);
    const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
    const [editingWorkoutId, setEditingWorkoutId] = useState(null);
    const [selectedWorkoutTemplate, setSelectedWorkoutTemplate] = useState(null);
    
    // Form states
    const [workoutFormState, setWorkoutFormState] = useState({
        name: "",
        description: "",
        estimated_duration_minutes: "",
        category_id: null,
        exercises: []
    });

    const [goalFormState, setGoalFormState] = useState({
        title: "",
        description: "",
        target_value: "",
        unit: "",
        target_date: ""
    });

    const [categoryFormState, setCategoryFormState] = useState({
        name: "",
        description: "",
        color: "#6366f1",
        icon: "dumbbell"
    });

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            setIsLoading(true);
            const currentUser = await getCurrentUser();
            if (!currentUser) return;

            setUser(currentUser);

            // Load all data in parallel
            const [
                profileData,
                templatesData,
                categoriesData,
                progressData,
                streakData,
                recordsData,
                goalsData
            ] = await Promise.all([
                getProfile(currentUser.id),
                getWorkoutTemplates(currentUser.id),
                getWorkoutCategories(currentUser.id),
                getWeeklyProgress(currentUser.id),
                getCurrentStreak(currentUser.id),
                getPersonalRecords(currentUser.id),
                getFitnessGoals(currentUser.id)
            ]);

            setProfile(profileData);
            setWorkoutTemplates(templatesData);
            setWorkoutCategories(categoriesData);
            setWeeklyProgress(progressData);
            setCurrentStreak(streakData);
            setPersonalRecords(recordsData);
            setFitnessGoals(goalsData);
        } catch (error) {
            console.error("Error loading user data:", error);
            Alert.alert("Error", "Failed to load data. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadUserData();
        setRefreshing(false);
    };

    // Workout Modal Functions
    const openAddWorkoutModal = () => {
        setEditingWorkoutId(null);
        setWorkoutFormState({
            name: "",
            description: "",
            estimated_duration_minutes: "",
            category_id: null,
            exercises: []
        });
        setIsWorkoutModalVisible(true);
    };

    const openEditWorkoutModal = (workout) => {
        setEditingWorkoutId(workout.id);
        setWorkoutFormState({
            name: workout.name || "",
            description: workout.description || "",
            estimated_duration_minutes: workout.estimated_duration_minutes?.toString() || "",
            category_id: workout.category_id,
            exercises: workout.workout_template_exercises?.map(ex => ({
                id: ex.id,
                name: ex.exercises?.name || "",
                sets: ex.sets || 3,
                reps: ex.reps || 10,
                weight_kg: ex.weight_kg?.toString() || "",
                rest_seconds: ex.rest_seconds || 60,
                notes: ex.notes || ""
            })) || []
        });
        setIsWorkoutModalVisible(true);
    };

    const handleSaveWorkout = async (workoutData) => {
        try {
            if (!user) return;

            const workoutPayload = {
                user_id: user.id,
                name: workoutData.name,
                description: workoutData.description,
                estimated_duration_minutes: parseInt(workoutData.estimated_duration_minutes) || null,
                category_id: workoutData.category_id
            };

            let savedWorkout;
            if (editingWorkoutId) {
                savedWorkout = await updateWorkoutTemplate(editingWorkoutId, workoutPayload);
            } else {
                savedWorkout = await createWorkoutTemplate(workoutPayload);
            }

            // Refresh data
            await loadUserData();
            setIsWorkoutModalVisible(false);
            setEditingWorkoutId(null);
            
            Alert.alert(
                "Success", 
                `Workout ${editingWorkoutId ? 'updated' : 'created'} successfully!`
            );
        } catch (error) {
            console.error("Error saving workout:", error);
            Alert.alert("Error", "Failed to save workout. Please try again.");
        }
    };

    const handleDeleteWorkout = async (workoutId) => {
        Alert.alert(
            "Delete Workout",
            "Are you sure you want to delete this workout?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteWorkoutTemplate(workoutId);
                            await loadUserData();
                            Alert.alert("Success", "Workout deleted successfully!");
                        } catch (error) {
                            console.error("Error deleting workout:", error);
                            Alert.alert("Error", "Failed to delete workout. Please try again.");
                        }
                    },
                },
            ]
        );
    };

    // Goal Modal Functions
    const openAddGoalModal = () => {
        setGoalFormState({
            title: "",
            description: "",
            target_value: "",
            unit: "",
            target_date: ""
        });
        setIsGoalModalVisible(true);
    };

    const handleSaveGoal = async (goalData) => {
        try {
            if (!user) return;

            const goalPayload = {
                user_id: user.id,
                title: goalData.title,
                description: goalData.description,
                target_value: goalData.target_value,
                unit: goalData.unit,
                target_date: goalData.target_date || null
            };

            await createFitnessGoal(goalPayload);
            await loadUserData();
            setIsGoalModalVisible(false);
            
            Alert.alert("Success", "Goal created successfully!");
        } catch (error) {
            console.error("Error saving goal:", error);
            Alert.alert("Error", "Failed to save goal. Please try again.");
        }
    };

    // Start Workout Functions
    const openStartWorkoutModal = (workoutTemplate) => {
        setSelectedWorkoutTemplate(workoutTemplate);
        setIsStartWorkoutModalVisible(true);
    };

    // Category Functions
    const openAddCategoryModal = () => {
        setCategoryFormState({
            name: "",
            description: "",
            color: "#6366f1",
            icon: "dumbbell"
        });
        setIsCategoryModalVisible(true);
    };

    const handleSaveCategory = async (categoryData) => {
        try {
            if (!user) return;

            const categoryPayload = {
                user_id: user.id,
                name: categoryData.name,
                description: categoryData.description,
                color: categoryData.color,
                icon: categoryData.icon
            };

            await createWorkoutCategory(categoryPayload);
            await loadUserData();
            setIsCategoryModalVisible(false);
            
            Alert.alert("Success", "Category created successfully!");
        } catch (error) {
            console.error("Error saving category:", error);
            Alert.alert("Error", "Failed to save category. Please try again.");
        }
    };

    const handleStartWorkout = async (workoutTemplate) => {
        try {
            if (!user) return;

            const sessionData = {
                user_id: user.id,
                workout_template_id: workoutTemplate.id,
                name: workoutTemplate.name,
                started_at: new Date().toISOString()
            };

            await createWorkoutSession(sessionData);
            Alert.alert("Success", "Workout session started! Navigate to the workout screen to log your exercises.");
        } catch (error) {
            console.error("Error starting workout:", error);
            throw error;
        }
    };

    if (isLoading) {
        return (
            <View className="flex-1 bg-slate-50 justify-center items-center">
                <ActivityIndicator size="large" color={colors.primary[600]} />
                <Text className="text-gray-600 mt-4">Loading your fitness data...</Text>
            </View>
        );
    }

    const todayWorkout = workoutTemplates[0]; // Get the first workout as today's suggested workout
    const completedWorkouts = weeklyProgress.filter(day => day.completed).length;
    const weeklyProgressPercentage = Math.round((completedWorkouts / 7) * 100);

    return (
        <ScrollView
            className="flex-1 bg-slate-50"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {/* Header */}
            <View className="bg-emerald-600 pt-12 pb-6 px-6 rounded-b-3xl">
                <View className="flex-row justify-between items-center mb-4">
                    <View>
                        <Text className="text-white text-lg font-medium">
                            Good morning,
                        </Text>
                        <Text className="text-white text-2xl font-bold">
                            {profile?.full_name || user?.email?.split('@')[0] || 'Fitness Warrior'}
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
                {todayWorkout ? (
                    <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-gray-900 text-xl font-bold">
                                Today's Workout
                            </Text>
                            <View className="bg-emerald-100 px-3 py-1 rounded-full">
                                <Text className="text-emerald-700 text-sm font-medium">
                                    Suggested
                                </Text>
                            </View>
                        </View>

                        <Text className="text-gray-700 text-lg font-semibold mb-3">
                            {todayWorkout.name}
                        </Text>

                        {todayWorkout.description && (
                            <Text className="text-gray-600 mb-3">
                                {todayWorkout.description}
                            </Text>
                        )}

                        <View className="flex-row justify-between mb-4">
                            <View className="flex-row items-center">
                                <Dumbbell size={16} color={colors.text.tertiary} />
                                <Text className="text-gray-600 ml-2">
                                    {todayWorkout.workout_template_exercises?.length || 0} exercises
                                </Text>
                            </View>
                            <View className="flex-row items-center">
                                <Clock size={16} color={colors.text.tertiary} />
                                <Text className="text-gray-600 ml-2">
                                    {todayWorkout.estimated_duration_minutes || 45} min
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity 
                            className="bg-emerald-600 rounded-xl py-4 flex-row justify-center items-center"
                            onPress={() => openStartWorkoutModal(todayWorkout)}
                        >
                            <Text className="text-white font-semibold text-lg mr-2">
                                Start Workout
                            </Text>
                            <ChevronRight size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                        <View className="items-center">
                            <Dumbbell size={48} color={colors.text.tertiary} />
                            <Text className="text-gray-700 text-lg font-medium mt-3 mb-2">
                                No workouts yet
                            </Text>
                            <Text className="text-gray-500 text-center mb-4">
                                Create your first workout template to get started with progressive overloading
                            </Text>
                            <TouchableOpacity 
                                onPress={openAddWorkoutModal}
                                className="bg-emerald-600 rounded-xl py-3 px-6"
                            >
                                <Text className="text-white font-semibold">Create First Workout</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Weekly Progress */}
                <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                    <Text className="text-gray-900 text-xl font-bold mb-4">
                        This Week's Progress
                    </Text>

                    <View className="flex-row justify-between items-end mb-4">
                        {weeklyProgress.map((day, index) => (
                            <View key={index} className="items-center">
                                <View
                                    className={`w-8 rounded-lg mb-2 ${
                                        day.completed
                                            ? "bg-emerald-500"
                                            : "bg-gray-200"
                                    }`}
                                    style={{
                                        height: day.completed
                                            ? Math.max(16, (day.weight / 250) * 64)
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
                            {completedWorkouts}/7 workouts completed
                        </Text>
                        <Text className="text-emerald-600 font-semibold">
                            {weeklyProgressPercentage}% this week
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

                    <TouchableOpacity 
                        onPress={openAddGoalModal}
                        className="bg-white rounded-2xl p-4 flex-1 ml-3 shadow-sm border border-gray-100 items-center"
                    >
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

                {/* Categories Section */}
                <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-gray-900 text-xl font-bold">
                            Workout Categories
                        </Text>
                        <TouchableOpacity
                            onPress={openAddCategoryModal}
                            className="flex-row items-center bg-emerald-100 px-3 py-1 rounded-full"
                        >
                            <Plus size={18} color="#059669" />
                            <Text className="text-emerald-700 font-medium ml-1">
                                Add
                            </Text>
                        </TouchableOpacity>
                    </View>
                    
                    {workoutCategories.length > 0 ? (
                        <View className="flex-row flex-wrap">
                            {workoutCategories.map((category) => (
                                <View
                                    key={category.id}
                                    className="bg-gray-50 rounded-xl p-3 mr-3 mb-3"
                                    style={{ borderLeftWidth: 4, borderLeftColor: category.color }}
                                >
                                    <Text className="text-gray-900 font-medium text-sm">
                                        {category.name}
                                    </Text>
                                    {category.description && (
                                        <Text className="text-gray-500 text-xs mt-1">
                                            {category.description}
                                        </Text>
                                    )}
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View className="bg-gray-50 rounded-xl p-4 items-center">
                            <Tag size={32} color={colors.text.tertiary} />
                            <Text className="text-gray-500 text-center mt-2">
                                No categories yet. Create your first workout category!
                            </Text>
                        </View>
                    )}
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

                    {workoutTemplates.length === 0 ? (
                        <View className="bg-gray-50 rounded-xl p-4">
                            <Text className="text-gray-600">
                                You have no workout templates yet. Tap Add to create one.
                            </Text>
                        </View>
                    ) : (
                        <View>
                            {workoutTemplates.map((workout) => (
                                <View
                                    key={workout.id}
                                    className="flex-row items-start py-3 border-b border-gray-100 last:border-b-0"
                                >
                                    <View className="flex-1 pr-3">
                                        <Text className="text-gray-900 font-semibold mb-1">
                                            {workout.name}
                                        </Text>
                                        {workout.description && (
                                            <Text className="text-gray-600 text-sm mb-2">
                                                {workout.description}
                                            </Text>
                                        )}
                                        <View className="flex-row items-center justify-between">
                                            <View className="flex-row">
                                                <View className="flex-row items-center mr-4">
                                                    <Dumbbell
                                                        size={16}
                                                        color={colors.text.tertiary}
                                                    />
                                                    <Text className="text-gray-600 ml-1">
                                                        {workout.workout_template_exercises?.length || 0} exercises
                                                    </Text>
                                                </View>
                                                <View className="flex-row items-center mr-4">
                                                    <Clock
                                                        size={16}
                                                        color={colors.text.tertiary}
                                                    />
                                                    <Text className="text-gray-600 ml-1">
                                                        {workout.estimated_duration_minutes || 45} min
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                    <View className="flex-row items-center">
                                        <TouchableOpacity
                                            onPress={() => openEditWorkoutModal(workout)}
                                            className="bg-emerald-50 p-2 rounded-lg mr-2"
                                        >
                                            <Pencil size={18} color={colors.primary[600]} />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => handleDeleteWorkout(workout.id)}
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

                    {personalRecords.length > 0 ? (
                        personalRecords.map((record, index) => (
                            <View
                                key={record.id}
                                className="flex-row items-center py-3 border-b border-gray-100 last:border-b-0"
                            >
                                <View className="bg-amber-100 p-2 rounded-full mr-3">
                                    <Trophy size={16} color={colors.status.warning} />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-gray-900 font-semibold">
                                        {record.exercises?.name || 'Exercise'}
                                    </Text>
                                    <Text className="text-gray-600 text-sm">
                                        New PR: {record.weight_kg}kg × {record.reps} reps
                                    </Text>
                                </View>
                                <Text className="text-gray-400 text-xs">
                                    {new Date(record.achieved_at).toLocaleDateString()}
                                </Text>
                            </View>
                        ))
                    ) : (
                        <View className="bg-gray-50 rounded-xl p-4 items-center">
                            <Trophy size={32} color={colors.text.tertiary} />
                            <Text className="text-gray-500 text-center mt-2">
                                No achievements yet. Complete workouts to earn them!
                            </Text>
                        </View>
                    )}
                </View>

                {/* Fitness Goals */}
                <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-gray-900 text-xl font-bold">
                            Fitness Goals
                        </Text>
                        <TouchableOpacity
                            onPress={openAddGoalModal}
                            className="flex-row items-center bg-emerald-100 px-3 py-1 rounded-full"
                        >
                            <Plus size={18} color="#059669" />
                            <Text className="text-emerald-700 font-medium ml-1">
                                Add Goal
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {fitnessGoals.length > 0 ? (
                        fitnessGoals.map((goal, index) => (
                            <View
                                key={goal.id}
                                className="flex-row items-center py-3 border-b border-gray-100 last:border-b-0"
                            >
                                <View className="bg-emerald-100 p-2 rounded-full mr-3">
                                    <Target size={16} color={colors.primary[600]} />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-gray-900 font-semibold">
                                        {goal.title}
                                    </Text>
                                    <Text className="text-gray-600 text-sm">
                                        {goal.current_value} / {goal.target_value} {goal.unit}
                                    </Text>
                                    <View className="bg-gray-200 rounded-full h-2 mt-2">
                                        <View 
                                            className="bg-emerald-500 h-2 rounded-full"
                                            style={{ 
                                                width: `${Math.min((goal.current_value / goal.target_value) * 100, 100)}%` 
                                            }}
                                        />
                                    </View>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View className="bg-gray-50 rounded-xl p-4 items-center">
                            <Target size={32} color={colors.text.tertiary} />
                            <Text className="text-gray-500 text-center mt-2">
                                No goals set yet. Set your first fitness goal!
                            </Text>
                        </View>
                    )}
                </View>

                {/* Next Workout Preview */}
                {workoutTemplates.length > 1 && (
                    <View className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 mb-8">
                        <Text className="text-white text-lg font-bold mb-2">
                            Tomorrow's Focus
                        </Text>
                        <Text className="text-gray-300 mb-4">
                            {workoutTemplates[1]?.name || 'Rest Day'}
                        </Text>

                        <View className="flex-row items-center">
                            <Calendar size={16} color={colors.text.tertiary} />
                            <Text className="text-gray-300 ml-2">
                                {workoutTemplates[1]?.workout_template_exercises?.length || 0} exercises • {workoutTemplates[1]?.estimated_duration_minutes || 45} min
                            </Text>
                        </View>
                    </View>
                )}
            </View>

            {/* Modals */}
            <AddWorkoutModal
                visible={isWorkoutModalVisible}
                onClose={() => setIsWorkoutModalVisible(false)}
                onSubmit={handleSaveWorkout}
                initialValues={workoutFormState}
                isEditing={Boolean(editingWorkoutId)}
                categories={workoutCategories}
            />

            <AddGoalModal
                visible={isGoalModalVisible}
                onClose={() => setIsGoalModalVisible(false)}
                onSubmit={handleSaveGoal}
                initialValues={goalFormState}
                isEditing={false}
            />

            <StartWorkoutModal
                visible={isStartWorkoutModalVisible}
                onClose={() => setIsStartWorkoutModalVisible(false)}
                onStartWorkout={handleStartWorkout}
                workoutTemplate={selectedWorkoutTemplate}
            />

            <AddCategoryModal
                visible={isCategoryModalVisible}
                onClose={() => setIsCategoryModalVisible(false)}
                onSubmit={handleSaveCategory}
                initialValues={categoryFormState}
                isEditing={false}
            />
        </ScrollView>
    );
}
