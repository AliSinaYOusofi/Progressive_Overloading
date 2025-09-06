import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    TouchableOpacity,
} from "react-native";
import {
    Flame,
    TrendingUp,
    Target,
    Plus,
    Pencil,
    Trash2,
    CheckCircle2,
    RotateCcw,
    Dumbbell,
    Repeat,
    Layers,
    ChevronDown,
    ChevronUp,
    Info,
} from "lucide-react-native";
import { colors } from "../constants/ui_colors";
import {
    getCurrentUser,
    getProfile,
    getCurrentStreak,
    getFitnessGoals,
    createFitnessGoal,
    updateFitnessGoal,
    deleteFitnessGoal,
    getExerciseProgressRows,
} from "../lib/database";
import AddGoalModal from "../components/HomeScreen/AddGoalModal";
import LogSetModal from "../components/HomeScreen/LogSetModal";
import EditSetModal from "../components/HomeScreen/EditSetModal";
import RMInfoModal from "../components/HomeScreen/RMInfoModal";
import SetDetailsModal from "../components/HomeScreen/SetDetailsModal";
import GoalDetailsModal from "../components/HomeScreen/GoalDetailsModal";

export default function HomeScreen() {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [currentStreak, setCurrentStreak] = useState(0);
    const [personalRecords, setPersonalRecords] = useState([]);
    const [fitnessGoals, setFitnessGoals] = useState([]);
    const [progressByExercise, setProgressByExercise] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isLogSetVisible, setIsLogSetVisible] = useState(false);
    const [isLogSubmitting, setIsLogSubmitting] = useState(false);
    const [showRMInfoModal, setShowRMInfoModal] = useState(false);
    const [recentSets, setRecentSets] = useState([]);
    const [isEditSetVisible, setIsEditSetVisible] = useState(false);
    const [editingSet, setEditingSet] = useState(null);
    const [isEditSubmitting, setIsEditSubmitting] = useState(false);
    const [isEditDeleting, setIsEditDeleting] = useState(false);
    const [isSetDetailsVisible, setIsSetDetailsVisible] = useState(false);
    const [selectedSet, setSelectedSet] = useState(null);
    const [deleteLoadingSetId, setDeleteLoadingSetId] = useState(null);
    const [modalDeleteLoadingSetId, setModalDeleteLoadingSetId] = useState(null);

    // Goals modal
    const [isGoalModalVisible, setIsGoalModalVisible] = useState(false);
    const [goalFormState, setGoalFormState] = useState({
        title: "",
        description: "",
        target_value: "",
        current_value: "",
        unit: "",
        target_date: "",
    });
    const [editingGoalId, setEditingGoalId] = useState(null);
    const [editingGoalIsCompleted, setEditingGoalIsCompleted] = useState(false);

    // Goal details bottom sheet
    const [isGoalDetailsVisible, setIsGoalDetailsVisible] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState(null);

    // Loading states for goal actions
    const [isGoalActionLoading, setIsGoalActionLoading] = useState(false);
    const [modalCompleteLoadingGoalId, setModalCompleteLoadingGoalId] = useState(null);
    const [modalDeleteLoadingGoalId, setModalDeleteLoadingGoalId] = useState(null);
    const [completeLoadingGoalId, setCompleteLoadingGoalId] = useState(null);
    const [deleteLoadingGoalId, setDeleteLoadingGoalId] = useState(null);

    // Card expansion states
    const [cardExpanded, setCardExpanded] = useState({
        progress: true,
        goals: true,
        completedGoals: true,
        recentSets: true,
    });

    useEffect(() => {
        loadUserData();
    }, []);

    const computeOneRM = (weight, reps) => {
        const w = Number(weight) || 0;
        const r = Number(reps) || 1;
        return w * (1 + r / 30);
    };

    const loadProgressFromSets = async (userId) => {
        const rows = await getExerciseProgressRows(userId, 1000);
        setProgressByExercise(rows);
    };

    const loadRecentSets = async (userId) => {
        const { getExerciseSetsByUser } = await import("../lib/database");
        const sets = await getExerciseSetsByUser(userId, 25);
        setRecentSets(sets);
    };

    const loadUserData = async () => {
        try {
            setIsLoading(true);
            const currentUser = await getCurrentUser();
            if (!currentUser) return;
            setUser(currentUser);

            const [profileData, streakData, goalsData, progressRows] =
                await Promise.all([
                    getProfile(currentUser.id),
                    getCurrentStreak(currentUser.id),
                    getFitnessGoals(currentUser.id),
                    getExerciseProgressRows(currentUser.id, 1000),
                ]);

            setProfile(profileData || null);
            setCurrentStreak(streakData || 0);
            setFitnessGoals(goalsData || []);
            setProgressByExercise(progressRows || []);
            await loadRecentSets(currentUser.id);
        } catch (error) {
            console.error("Error loading user data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenLogSet = () => setIsLogSetVisible(true);
    const handleCloseLogSet = () => setIsLogSetVisible(false);

    const handleSubmitLogSet = async ({ exerciseName, weight, reps, sets, unit }) => {
        try {
            setIsLogSubmitting(true);
            const currentUser = user || (await getCurrentUser());
            if (!currentUser) return;
            // Find or create exercise, then create set
            const { findOrCreateExercise, createExerciseSet } = await import("../lib/database");
            const exercise = await findOrCreateExercise(currentUser.id, exerciseName);
            await createExerciseSet({
                user_id: currentUser.id,
                exercise_id: exercise.id,
                weight,
                reps,
                sets,
                unit,
                performed_at: new Date().toISOString(),
            });
            // Refresh progress
            await loadProgressFromSets(currentUser.id);
            await loadRecentSets(currentUser.id);
            handleCloseLogSet();
        } catch (e) {
            console.error("Error logging set:", e);
        } finally {
            setIsLogSubmitting(false);
        }
    };

    const openEditSetModal = (set) => {
        setEditingSet(set);
        setIsEditSetVisible(true);
    };

    const closeEditSetModal = () => {
        setIsEditSetVisible(false);
        setEditingSet(null);
    };

    const openSetDetails = (set) => {
        setSelectedSet(set);
        setIsSetDetailsVisible(true);
    };

    const closeSetDetails = () => {
        setIsSetDetailsVisible(false);
        setSelectedSet(null);
    };

    const handleSaveEditedSet = async ({ exerciseName, weight, reps, sets, unit }) => {
        try {
            setIsEditSubmitting(true);
            const currentUser = user || (await getCurrentUser());
            if (!currentUser || !editingSet) return;
            const { findOrCreateExercise, updateExerciseSet } = await import("../lib/database");
            const exercise = await findOrCreateExercise(currentUser.id, exerciseName);
            await updateExerciseSet(editingSet.id, {
                exercise_id: exercise.id,
                weight,
                reps,
                sets,
                unit,
            });
            await loadProgressFromSets(currentUser.id);
            await loadRecentSets(currentUser.id);
            closeEditSetModal();
        } catch (e) {
            console.error("Error updating set:", e);
        } finally {
            setIsEditSubmitting(false);
        }
    };

    const handleDeleteSet = async () => {
        try {
            setIsEditDeleting(true);
            const currentUser = user || (await getCurrentUser());
            if (!currentUser || !editingSet) return;
            const { deleteExerciseSet } = await import("../lib/database");
            await deleteExerciseSet(editingSet.id);
            await loadProgressFromSets(currentUser.id);
            await loadRecentSets(currentUser.id);
            closeEditSetModal();
        } catch (e) {
            console.error("Error deleting set:", e);
        } finally {
            setIsEditDeleting(false);
        }
    };

    const handleDeleteSetFromList = async (setItem) => {
        try {
            setDeleteLoadingSetId(setItem.id);
            const currentUser = user || (await getCurrentUser());
            if (!currentUser) return;
            const { deleteExerciseSet } = await import("../lib/database");
            await deleteExerciseSet(setItem.id);
            await loadProgressFromSets(currentUser.id);
            await loadRecentSets(currentUser.id);
        } catch (e) {
            console.error("Error deleting set:", e);
        } finally {
            setDeleteLoadingSetId(null);
        }
    };

    const handleDeleteSetFromModal = async () => {
        if (!selectedSet) return;
        try {
            setModalDeleteLoadingSetId(selectedSet.id);
            const currentUser = user || (await getCurrentUser());
            if (!currentUser) return;
            const { deleteExerciseSet } = await import("../lib/database");
            await deleteExerciseSet(selectedSet.id);
            await loadProgressFromSets(currentUser.id);
            await loadRecentSets(currentUser.id);
            closeSetDetails();
        } catch (e) {
            console.error("Error deleting set:", e);
        } finally {
            setModalDeleteLoadingSetId(null);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadUserData();
        setRefreshing(false);
    };

    const openAddGoalModal = () => {
        setEditingGoalId(null);
        setEditingGoalIsCompleted(false);
        setGoalFormState({
            title: "",
            description: "",
            target_value: "",
            current_value: "",
            unit: "",
            target_date: "",
        });
        setIsGoalModalVisible(true);
    };

    const openEditGoalModal = (goal) => {
        setEditingGoalId(goal.id);
        setEditingGoalIsCompleted(Boolean(goal.is_completed));
        setGoalFormState({
            title: goal.title || "",
            description: goal.description || "",
            target_value: goal.target_value?.toString() || "",
            current_value: goal.current_value?.toString() || "",
            unit: goal.unit || "",
            target_date: goal.target_date || "",
        });
        setIsGoalModalVisible(true);
    };

    const handleSaveGoal = async (goalData) => {
        try {
            if (!user) return;
            setIsGoalActionLoading(true);
            const payload = {
                user_id: user.id,
                title: goalData.title,
                description: goalData.description,
                target_value: goalData.target_value,
                current_value: goalData.current_value ?? 0,
                unit: goalData.unit,
                target_date: goalData.target_date || null,
            };
            
            let savedGoal;
            if (editingGoalId) {
                savedGoal = await updateFitnessGoal(editingGoalId, payload);
                // Update existing goal in local state
                setFitnessGoals(prev => 
                    prev.map(g => g.id === editingGoalId ? { ...g, ...payload } : g)
                );
            } else {
                savedGoal = await createFitnessGoal(payload);
                // Add new goal to local state
                setFitnessGoals(prev => [...prev, savedGoal]);
            }
            
            setIsGoalModalVisible(false);
            setEditingGoalId(null);
        } catch (e) {
            console.error("Error saving goal:", e);
        } finally {
            setIsGoalActionLoading(false);
        }
    };

    const handleDeleteGoal = async (goalId, fromModal = false) => {
        try {
            if (fromModal) {
                setModalDeleteLoadingGoalId(goalId);
            } else {
                setDeleteLoadingGoalId(goalId);
            }
            await deleteFitnessGoal(goalId);
            
            // Update goals list locally instead of refreshing entire page
            setFitnessGoals(prev => prev.filter(goal => goal.id !== goalId));
            
            setIsGoalDetailsVisible(false);
            setSelectedGoal(null);
        } catch (e) {
            console.error("Error deleting goal:", e);
        } finally {
            if (fromModal) {
                setModalDeleteLoadingGoalId(null);
            } else {
                setDeleteLoadingGoalId(null);
            }
        }
    };

    const handleToggleComplete = async (goal, fromModal = false) => {
        try {
            if (fromModal) {
                setModalCompleteLoadingGoalId(goal.id);
            } else {
                setCompleteLoadingGoalId(goal.id);
            }
            const updates = goal.is_completed
                ? { is_completed: false, completed_at: null }
                : {
                      is_completed: true,
                      completed_at: new Date().toISOString(),
                  };
            await updateFitnessGoal(goal.id, updates);
            
            // Update goals list locally instead of refreshing entire page
            setFitnessGoals(prev => 
                prev.map(g => g.id === goal.id ? { ...g, ...updates } : g)
            );
            
            setSelectedGoal((prev) =>
                prev && prev.id === goal.id ? { ...prev, ...updates } : prev
            );
            if (editingGoalId && editingGoalId === goal.id) {
                setEditingGoalIsCompleted(Boolean(updates.is_completed));
            }
        } catch (e) {
            console.error("Error updating goal state:", e);
        } finally {
            if (fromModal) {
                setModalCompleteLoadingGoalId(null);
            } else {
                setCompleteLoadingGoalId(null);
            }
        }
    };

    const openGoalDetails = (goal) => {
        setSelectedGoal(goal);
        setIsGoalDetailsVisible(true);
    };

    const toggleCardExpansion = (cardType) => {
        setCardExpanded(prev => ({
            ...prev,
            [cardType]: !prev[cardType]
        }));
    };

    if (isLoading) {
        return (
            <View className="flex-1 bg-slate-50 justify-center items-center">
                <ActivityIndicator size="large" color={colors.primary[600]} />
                <Text className="text-gray-600 mt-4">
                    Loading your progress...
                </Text>
            </View>
        );
    }

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
                            Welcome,
                        </Text>
                        <Text className="text-white text-2xl font-bold">
                            {profile?.full_name ||
                                user?.email?.split("@")[0] ||
                                "Athlete"}
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
                    Progressive Overload Tracker
                </Text>
            </View>

            <View className="px-6 -mt-4">
                {/* Progressive Overload Section */}
                <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                    <TouchableOpacity 
                        onPress={() => toggleCardExpansion('progress')}
                        className="flex-row items-center justify-between mb-4"
                    >
                        <Text className="text-gray-900 text-xl font-bold">
                            Your Progress
                        </Text>

                        <View className="flex-row justify-end ">
                        <TouchableOpacity onPress={handleOpenLogSet} className="flex-row items-center bg-emerald-100 px-3 py-1 rounded-full">
                            <Plus size={18} color={colors.primary[600]} />
                            <Text className="text-emerald-700 font-medium ml-1">Log Set</Text>
                        </TouchableOpacity>
                    </View>
                        <View className="flex-row items-center">
                            <TouchableOpacity onPress={() => setShowRMInfoModal(true)} className="bg-emerald-50 p-2 rounded-full mr-2">
                                <Info size={18} color={colors.primary[600]} />
                            </TouchableOpacity>
                            <View className="bg-emerald-50 p-2 rounded-full mr-2">
                                {cardExpanded.progress ? (
                                    <ChevronUp size={18} color={colors.primary[600]} />
                                ) : (
                                    <ChevronDown size={18} color={colors.primary[600]} />
                                )}
                            </View>
                        </View>
                    </TouchableOpacity>
                    
                    {cardExpanded.progress && (
                        <>
                            
                    {progressByExercise.length === 0 ? (
                        <View className="bg-gray-50 rounded-xl p-4 items-center">
                            <TrendingUp
                                size={32}
                                color={colors.text.tertiary}
                            />
                            <Text className="text-gray-500 text-center mt-2">
                                No progress yet. Log sets to begin tracking your
                                improvements.
                            </Text>
                        </View>
                    ) : (
                        progressByExercise.map((row, idx) => (
                            <View
                                key={idx}
                                className="flex-row items-center py-3 border-b border-gray-100 last:border-b-0"
                            >
                                <View className="flex-1">
                                    <Text className="text-gray-900 font-semibold">
                                        {row.exerciseName}
                                    </Text>
                                    <Text className="text-gray-600 text-sm">
                                        First 1RM: {row.first1RM.toFixed(1)} kg
                                    </Text>
                                </View>
                                <View className="items-end">
                                    <Text className="text-emerald-600 font-semibold">
                                        +{row.delta.toFixed(1)} kg
                                    </Text>
                                    <Text className="text-gray-400 text-xs">
                                        Best: {row.best1RM.toFixed(1)} kg
                                    </Text>
                                </View>
                            </View>
                        ))
                            )}
                        </>
                    )}
                </View>

                {/* Goals Section */}
                <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                    <TouchableOpacity 
                        onPress={() => toggleCardExpansion('goals')}
                        className="flex-row items-center justify-between mb-4"
                    >
                        <Text className="text-gray-900 text-xl font-bold">
                            Goals
                        </Text>
                        <View className="flex-row items-center">
                        <TouchableOpacity
                            onPress={openAddGoalModal}
                                className="flex-row items-center bg-emerald-100 px-3 py-1 rounded-full mr-2"
                        >
                            <Plus size={18} color={colors.primary[600]} />
                            <Text className="text-emerald-700 font-medium ml-1">
                                Add Goal
                            </Text>
                        </TouchableOpacity>
                            <View className="bg-emerald-50 p-2 rounded-full">
                                {cardExpanded.goals ? (
                                    <ChevronUp size={18} color={colors.primary[600]} />
                                ) : (
                                    <ChevronDown size={18} color={colors.primary[600]} />
                                )}
                    </View>
                        </View>
                    </TouchableOpacity>
                    
                    {cardExpanded.goals && (
                        <>
                    {fitnessGoals?.filter(g => !g.is_completed)?.length > 0 ? (
                        fitnessGoals.filter(g => !g.is_completed).map((goal) => (
                            <View
                                key={goal.id}
                                className="flex-row items-center py-3 border-b border-gray-100 last:border-b-0"
                            >
                                <TouchableOpacity
                                    onPress={() => openGoalDetails(goal)}
                                    style={{
                                        flex: 1,
                                        flexDirection: "row",
                                        alignItems: "center",
                                    }}
                                >
                                    <View className="bg-emerald-100 p-2 rounded-full mr-3">
                                        <Target
                                            size={16}
                                            color={colors.primary[600]}
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text className="text-gray-900 font-semibold">
                                            {goal.title}
                                        </Text>
                                        <Text className="text-gray-600 text-sm">
                                            {goal.current_value} /{" "}
                                            {goal.target_value} {goal.unit}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                                <View
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                    }}
                                >
                                    <TouchableOpacity
                                        onPress={() =>
                                            handleToggleComplete(goal)
                                        }
                                        disabled={completeLoadingGoalId === goal.id}
                                        style={{
                                            paddingHorizontal: 8,
                                            paddingVertical: 6,
                                        }}
                                    >
                                        {completeLoadingGoalId === goal.id ? (
                                            <ActivityIndicator
                                                size="small"
                                                color={colors.primary[600]}
                                            />
                                        ) : goal.is_completed ? (
                                            <RotateCcw
                                                size={18}
                                                color={colors.primary[600]}
                                            />
                                        ) : (
                                            <CheckCircle2
                                                size={18}
                                                color={colors.primary[600]}
                                            />
                                        )}
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => openEditGoalModal(goal)}
                                        disabled={completeLoadingGoalId === goal.id || deleteLoadingGoalId === goal.id}
                                        style={{
                                            paddingHorizontal: 8,
                                            paddingVertical: 6,
                                        }}
                                    >
                                        <Pencil
                                            size={18}
                                            color={(completeLoadingGoalId === goal.id || deleteLoadingGoalId === goal.id) ? colors.text.tertiary : colors.text.secondary}
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() =>
                                            handleDeleteGoal(goal.id)
                                        }
                                        disabled={deleteLoadingGoalId === goal.id}
                                        style={{
                                            paddingHorizontal: 8,
                                            paddingVertical: 6,
                                        }}
                                    >
                                        {deleteLoadingGoalId === goal.id ? (
                                            <ActivityIndicator
                                                size="small"
                                                color={colors.status.error}
                                            />
                                        ) : (
                                            <Trash2
                                                size={18}
                                                color={colors.status.error}
                                            />
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View className="bg-gray-50 rounded-xl p-4 items-center">
                            <Target size={32} color={colors.text.tertiary} />
                            <Text className="text-gray-500 text-center mt-2">
                                No goals set yet. Add your first goal!
                            </Text>
                        </View>
                            )}
                        </>
                    )}
                </View>

                {/* Completed Goals Section */}
                <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                    <TouchableOpacity 
                        onPress={() => toggleCardExpansion('completedGoals')}
                        className="flex-row items-center justify-between mb-4"
                    >
                        <Text className="text-gray-900 text-xl font-bold">
                            Completed Goals
                        </Text>
                        <View className="bg-emerald-50 p-2 rounded-full">
                            {cardExpanded.completedGoals ? (
                                <ChevronUp size={18} color={colors.primary[600]} />
                            ) : (
                                <ChevronDown size={18} color={colors.primary[600]} />
                            )}
                    </View>
                    </TouchableOpacity>
                    
                    {cardExpanded.completedGoals && (
                        <>
                    {fitnessGoals?.filter(g => g.is_completed)?.length > 0 ? (
                        fitnessGoals.filter(g => g.is_completed).map((goal) => (
                            <View
                                key={goal.id}
                                className="flex-row items-center py-3 border-b border-gray-100 last:border-b-0"
                            >
                                <TouchableOpacity
                                    onPress={() => openGoalDetails(goal)}
                                    style={{
                                        flex: 1,
                                        flexDirection: "row",
                                        alignItems: "center",
                                    }}
                                >
                                    <View className="bg-emerald-100 p-2 rounded-full mr-3">
                                        <Target
                                            size={16}
                                            color={colors.primary[600]}
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text className="text-gray-900 font-semibold">
                                            {goal.title}
                                        </Text>
                                        <Text className="text-gray-600 text-sm">
                                            {goal.current_value} / {goal.target_value} {goal.unit}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                    <TouchableOpacity
                                        onPress={() =>
                                            handleToggleComplete(goal)
                                        }
                                        disabled={completeLoadingGoalId === goal.id}
                                        style={{ paddingHorizontal: 8, paddingVertical: 6 }}
                                    >
                                        {completeLoadingGoalId === goal.id ? (
                                            <ActivityIndicator size="small" color={colors.primary[600]} />
                                        ) : (
                                            <RotateCcw size={18} color={colors.primary[600]} />
                                        )}
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => openEditGoalModal(goal)}
                                        disabled={completeLoadingGoalId === goal.id || deleteLoadingGoalId === goal.id}
                                        style={{ paddingHorizontal: 8, paddingVertical: 6 }}
                                    >
                                        <Pencil size={18} color={(completeLoadingGoalId === goal.id || deleteLoadingGoalId === goal.id) ? colors.text.tertiary : colors.text.secondary} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => handleDeleteGoal(goal.id)}
                                        disabled={deleteLoadingGoalId === goal.id}
                                        style={{ paddingHorizontal: 8, paddingVertical: 6 }}
                                    >
                                        {deleteLoadingGoalId === goal.id ? (
                                            <ActivityIndicator size="small" color={colors.status.error} />
                                        ) : (
                                            <Trash2 size={18} color={colors.status.error} />
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View className="bg-gray-50 rounded-xl p-4 items-center">
                            <Target size={32} color={colors.text.tertiary} />
                            <Text className="text-gray-500 text-center mt-2">
                                No completed goals yet.
                            </Text>
                        </View>
                            )}
                        </>
                    )}
                </View>

                {/* Recent Sets Section */}
                <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                    <TouchableOpacity 
                        onPress={() => toggleCardExpansion('recentSets')}
                        className="flex-row items-center justify-between mb-4"
                    >
                        <Text className="text-gray-900 text-xl font-bold">Recent Sets</Text>
                        <View className="flex-row items-center">
                            <TouchableOpacity onPress={handleOpenLogSet} className="flex-row items-center bg-emerald-100 px-3 py-1 rounded-full mr-2">
                            <Plus size={18} color={colors.primary[600]} />
                            <Text className="text-emerald-700 font-medium ml-1">Log Set</Text>
                        </TouchableOpacity>
                            <View className="bg-emerald-50 p-2 rounded-full">
                                {cardExpanded.recentSets ? (
                                    <ChevronUp size={18} color={colors.primary[600]} />
                                ) : (
                                    <ChevronDown size={18} color={colors.primary[600]} />
                                )}
                    </View>
                        </View>
                    </TouchableOpacity>
                    
                    {cardExpanded.recentSets && (
                        <>
                    {recentSets?.length > 0 ? (
                        recentSets.map((s) => (
                            <TouchableOpacity key={s.id} onPress={() => openSetDetails(s)} className="py-3 border-b border-gray-100 last:border-b-0">
                                <View className="flex-row items-center">
                                    <View className="bg-emerald-100 p-2 rounded-full mr-3">
                                        <Dumbbell size={16} color={colors.primary[600]} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text className="text-gray-900 font-semibold">{s.exercises?.name || "Exercise"}</Text>
                                        <View className="flex-row mt-1">
                                                    <View className="flex-row items-center bg-emerald-50 px-2 py-1 rounded-full mr-2">
                                                <Dumbbell size={14} color={colors.icon.accent} />
                                                <Text className="text-gray-700 text-xs ml-1">{s.weight} {s.unit}</Text>
                                            </View>
                                                    <View className="flex-row items-center bg-emerald-50 px-2 py-1 rounded-full mr-2">
                                                <Repeat size={14} color={colors.icon.accent} />
                                                <Text className="text-gray-700 text-xs ml-1">{s.reps} reps</Text>
                                            </View>
                                                    <View className="flex-row items-center bg-emerald-50 px-2 py-1 rounded-full">
                                                <Layers size={14} color={colors.icon.accent} />
                                                <Text className="text-gray-700 text-xs ml-1">{s.sets} sets</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <View className="flex-row items-center ml-3">
                                        <TouchableOpacity
                                            onPress={() => openEditSetModal(s)}
                                            style={{ paddingHorizontal: 8, paddingVertical: 6 }}
                                        >
                                                    <Pencil size={18} color={colors.text.tertiary} />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => handleDeleteSetFromList(s)}
                                            disabled={deleteLoadingSetId === s.id}
                                            style={{ paddingHorizontal: 8, paddingVertical: 6 }}
                                        >
                                            {deleteLoadingSetId === s.id ? (
                                                <ActivityIndicator size="small" color={colors.status.error} />
                                            ) : (
                                                <Trash2 size={18} color={colors.status.error} />
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View className="bg-gray-50 rounded-xl p-4 items-center">
                            <TrendingUp size={32} color={colors.text.tertiary} />
                            <Text className="text-gray-500 text-center mt-2">No sets logged yet. Log your first set!</Text>
                        </View>
                            )}
                        </>
                    )}
                </View>
            </View>

            {/* Goal Details Modal */}
            <GoalDetailsModal
                visible={isGoalDetailsVisible}
                onClose={() => setIsGoalDetailsVisible(false)}
                selectedGoal={selectedGoal}
                onToggleComplete={(goal) => handleToggleComplete(goal, true)}
                onEdit={(goal) => {
                                            setIsGoalDetailsVisible(false);
                    openEditGoalModal(goal);
                }}
                onDelete={(goalId) => handleDeleteGoal(goalId, true)}
                isCompleteLoading={modalCompleteLoadingGoalId !== null}
                isDeleteLoading={modalDeleteLoadingGoalId !== null}
                completeLoadingId={modalCompleteLoadingGoalId}
                deleteLoadingId={modalDeleteLoadingGoalId}
            />

            {/* Log Set Modal */}
            <LogSetModal
                visible={isLogSetVisible}
                onClose={handleCloseLogSet}
                onSubmit={handleSubmitLogSet}
                isSubmitting={isLogSubmitting}
            />

            {/* Set Details Modal */}
            <SetDetailsModal
                visible={isSetDetailsVisible}
                onClose={closeSetDetails}
                selectedSet={selectedSet}
                onEdit={() => {
                                            closeSetDetails();
                                            openEditSetModal(selectedSet);
                                        }}
                onDelete={handleDeleteSetFromModal}
                isDeleting={modalDeleteLoadingSetId !== null}
                deleteLoadingId={modalDeleteLoadingSetId}
            />

            <RMInfoModal visible={showRMInfoModal} onClose={() => setShowRMInfoModal(false)} />

            {/* Edit Set Modal */}
            <EditSetModal
                visible={isEditSetVisible}
                onClose={closeEditSetModal}
                onSubmit={handleSaveEditedSet}
                onDelete={handleDeleteSet}
                isSubmitting={isEditSubmitting}
                isDeleting={isEditDeleting}
                initialValues={editingSet ? {
                    exerciseName: editingSet?.exercises?.name || "",
                    weight: editingSet?.weight,
                    reps: editingSet?.reps,
                    sets: editingSet?.sets,
                    unit: editingSet?.unit,
                } : null}
            />

            {/* Goal Modal */}
            <AddGoalModal
                visible={isGoalModalVisible}
                onClose={() => setIsGoalModalVisible(false)}
                onSubmit={handleSaveGoal}
                initialValues={goalFormState}
                isEditing={Boolean(editingGoalId)}
                isLoading={isGoalActionLoading}
            />
        </ScrollView>
    );
}
