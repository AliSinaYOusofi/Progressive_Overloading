import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    TouchableOpacity,
    Modal,
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
} from "lucide-react-native";
import { colors } from "../constants/ui_colors";
import {
    getCurrentUser,
    getProfile,
    getCurrentStreak,
    getPersonalRecords,
    getFitnessGoals,
    createFitnessGoal,
    updateFitnessGoal,
    deleteFitnessGoal,
} from "../lib/database";
import AddGoalModal from "../components/HomeScreen/AddGoalModal";

export default function HomeScreen() {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [currentStreak, setCurrentStreak] = useState(0);
    const [personalRecords, setPersonalRecords] = useState([]);
    const [fitnessGoals, setFitnessGoals] = useState([]);
    const [progressByExercise, setProgressByExercise] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

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
    const [loadingGoalId, setLoadingGoalId] = useState(null);
    const [modalLoadingGoalId, setModalLoadingGoalId] = useState(null);
    const [modalCompleteLoadingGoalId, setModalCompleteLoadingGoalId] = useState(null);
    const [modalDeleteLoadingGoalId, setModalDeleteLoadingGoalId] = useState(null);
    const [completeLoadingGoalId, setCompleteLoadingGoalId] = useState(null);
    const [deleteLoadingGoalId, setDeleteLoadingGoalId] = useState(null);

    useEffect(() => {
        loadUserData();
    }, []);

    const computeOneRM = (weight, reps) => {
        const w = Number(weight) || 0;
        const r = Number(reps) || 1;
        return w * (1 + r / 30);
    };

    const buildProgressFromPRs = (prs) => {
        const byExercise = prs.reduce((acc, pr) => {
            const key =
                pr.exercise_id ||
                pr.exercises?.id ||
                pr.exercises?.name ||
                "unknown";
            if (!acc[key]) acc[key] = [];
            acc[key].push(pr);
            return acc;
        }, {});

        const rows = Object.values(byExercise).map((list) => {
            list.sort(
                (a, b) => new Date(a.achieved_at) - new Date(b.achieved_at)
            );
            const first = list[0];
            const best = list.reduce((m, x) => {
                const m1 = computeOneRM(m.weight_kg, m.reps);
                const x1 = computeOneRM(x.weight_kg, x.reps);
                return x1 > m1 ? x : m;
            }, list[0]);
            const first1RM = computeOneRM(first.weight_kg, first.reps);
            const best1RM = computeOneRM(best.weight_kg, best.reps);
            return {
                exerciseName: best.exercises?.name || "Exercise",
                first1RM,
                best1RM,
                delta: best1RM - first1RM,
                bestAt: best.achieved_at,
            };
        });
        rows.sort((a, b) => b.delta - a.delta);
        setProgressByExercise(rows);
    };

    const loadUserData = async () => {
        try {
            setIsLoading(true);
            const currentUser = await getCurrentUser();
            if (!currentUser) return;
            setUser(currentUser);

            const [profileData, streakData, prsData, goalsData] =
                await Promise.all([
                    getProfile(currentUser.id),
                    getCurrentStreak(currentUser.id),
                    getPersonalRecords(currentUser.id, 200),
                    getFitnessGoals(currentUser.id),
                ]);

            setProfile(profileData || null);
            setCurrentStreak(streakData || 0);
            setPersonalRecords(prsData || []);
            setFitnessGoals(goalsData || []);
            buildProgressFromPRs(prsData || []);
        } catch (error) {
            console.error("Error loading user data:", error);
        } finally {
            setIsLoading(false);
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
            if (editingGoalId) {
                await updateFitnessGoal(editingGoalId, payload);
            } else {
                await createFitnessGoal(payload);
            }
            await loadUserData();
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
            await loadUserData();
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
            await loadUserData();
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
                    <Text className="text-gray-900 text-xl font-bold mb-4">
                        Your Progress
                    </Text>
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
                </View>

                {/* Goals Section */}
                <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-gray-900 text-xl font-bold">
                            Goals
                        </Text>
                        <TouchableOpacity
                            onPress={openAddGoalModal}
                            className="flex-row items-center bg-emerald-100 px-3 py-1 rounded-full"
                        >
                            <Plus size={18} color={colors.primary[600]} />
                            <Text className="text-emerald-700 font-medium ml-1">
                                Add Goal
                            </Text>
                        </TouchableOpacity>
                    </View>
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
                </View>

                {/* Completed Goals Section */}
                <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-gray-900 text-xl font-bold">
                            Completed Goals
                        </Text>
                    </View>
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
                </View>
            </View>

            {/* Goal Details Bottom Sheet */}
            <Modal
                transparent
                visible={isGoalDetailsVisible}
                animationType="slide"
                onRequestClose={() => setIsGoalDetailsVisible(false)}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => setIsGoalDetailsVisible(false)}
                    style={{
                        flex: 1,
                        backgroundColor: "rgba(0,0,0,0.4)",
                        justifyContent: "flex-end",
                    }}
                >
                    <View
                        style={{
                            backgroundColor: colors.background.primary,
                            borderTopLeftRadius: 20,
                            borderTopRightRadius: 20,
                            padding: 20,
                        }}
                    >
                        {selectedGoal && (
                            <View>
                                <Text
                                    style={{
                                        fontSize: 18,
                                        fontWeight: "700",
                                        color: colors.text.primary,
                                        marginBottom: 8,
                                    }}
                                >
                                    {selectedGoal.title}
                                </Text>
                                {selectedGoal.description ? (
                                    <Text
                                        style={{
                                            color: colors.text.secondary,
                                            marginBottom: 8,
                                        }}
                                    >
                                        {selectedGoal.description}
                                    </Text>
                                ) : null}
                                <Text
                                    style={{
                                        color: colors.text.secondary,
                                        marginBottom: 4,
                                    }}
                                >
                                    Progress: {selectedGoal.current_value} /{" "}
                                    {selectedGoal.target_value}{" "}
                                    {selectedGoal.unit}
                                </Text>
                                {selectedGoal.target_date ? (
                                    <Text
                                        style={{
                                            color: colors.text.tertiary,
                                            marginBottom: 4,
                                        }}
                                    >
                                        Target date: {selectedGoal.target_date}
                                    </Text>
                                ) : null}
                                
                                <Text
                                    style={{
                                        color: colors.text.tertiary,
                                        marginBottom: 4,
                                        fontSize: 12,
                                    }}
                                >
                                    Created: {new Date(selectedGoal.created_at).toLocaleDateString()}
                                </Text>
                                
                                {selectedGoal.updated_at && selectedGoal.updated_at !== selectedGoal.created_at ? (
                                    <Text
                                        style={{
                                            color: colors.text.tertiary,
                                            marginBottom: 4,
                                            fontSize: 12,
                                        }}
                                    >
                                        Last updated: {new Date(selectedGoal.updated_at).toLocaleDateString()}
                                    </Text>
                                ) : null}
                                
                                {selectedGoal.completed_at ? (
                                    <Text
                                        style={{
                                            color: colors.status.success,
                                            marginBottom: 12,
                                            fontSize: 12,
                                            fontWeight: '600',
                                        }}
                                    >
                                        Completed: {new Date(selectedGoal.completed_at).toLocaleDateString()}
                                    </Text>
                                ) : null}

                                <View
                                    style={{
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                        marginTop: 12,
                                    }}
                                >
                                    <TouchableOpacity
                                        onPress={() =>
                                            handleToggleComplete(selectedGoal, true)
                                        }
                                        disabled={modalCompleteLoadingGoalId === selectedGoal.id}
                                        style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            padding: 12,
                                            backgroundColor:
                                                colors.background.card,
                                            borderRadius: 12,
                                        }}
                                    >
                                        {modalCompleteLoadingGoalId === selectedGoal.id ? (
                                            <ActivityIndicator
                                                size="small"
                                                color={colors.primary[600]}
                                            />
                                        ) : selectedGoal.is_completed ? (
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
                                        <Text
                                            style={{
                                                marginLeft: 8,
                                                color: colors.primary[600],
                                                fontWeight: "600",
                                            }}
                                        >
                                            {selectedGoal.is_completed
                                                ? "Reopen"
                                                : "Complete"}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setIsGoalDetailsVisible(false);
                                            openEditGoalModal(selectedGoal);
                                        }}
                                        disabled={modalCompleteLoadingGoalId === selectedGoal.id || modalDeleteLoadingGoalId === selectedGoal.id}
                                        style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            padding: 12,
                                            backgroundColor:
                                                colors.background.card,
                                            borderRadius: 12,
                                        }}
                                    >
                                        <Pencil
                                            size={18}
                                            color={(modalCompleteLoadingGoalId === selectedGoal.id || modalDeleteLoadingGoalId === selectedGoal.id) ? colors.text.tertiary : colors.text.secondary}
                                        />
                                        <Text
                                            style={{
                                                marginLeft: 8,
                                                color: (modalCompleteLoadingGoalId === selectedGoal.id || modalDeleteLoadingGoalId === selectedGoal.id) ? colors.text.tertiary : colors.text.secondary,
                                                fontWeight: "600",
                                            }}
                                        >
                                            Edit
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() =>
                                            handleDeleteGoal(selectedGoal.id, true)
                                        }
                                        disabled={modalDeleteLoadingGoalId === selectedGoal.id}
                                        style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            padding: 12,
                                            backgroundColor:
                                                colors.background.card,
                                            borderRadius: 12,
                                        }}
                                    >
                                        {modalDeleteLoadingGoalId === selectedGoal.id ? (
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
                                        <Text
                                            style={{
                                                marginLeft: 8,
                                                color: colors.status.error,
                                                fontWeight: "600",
                                            }}
                                        >
                                            Delete
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            </Modal>

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
