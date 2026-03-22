import React, { useCallback, useState, useEffect, useMemo } from "react";
import { View, Text, ScrollView, RefreshControl, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useThemedColors } from "../../hooks/useThemedColors";
import { useAppStore } from "../../stores/useAppStore";
import { useSetActions } from "../../hooks/useSetActions";
import { useGoalActions } from "../../hooks/useGoalActions";
import AnimatedItem from "../../components/AnimatedItem";

import DashboardHeader from "../../components/HomeScreen/DashboardHeader";
import QuickStatsGrid from "../../components/HomeScreen/QuickStatsGrid";
import WeeklyActivityCard from "../../components/HomeScreen/WeeklyActivityCard";
import MonthlyActivityCard from "../../components/HomeScreen/MonthlyActivityCard";
import ConsistencyRingCard from "../../components/HomeScreen/ConsistencyRingCard";
import TodayWorkoutCard from "../../components/HomeScreen/TodayWorkoutCard";
import VolumeTrendCard from "../../components/HomeScreen/VolumeTrendCard";
import MuscleBalanceCard from "../../components/HomeScreen/MuscleBalanceCard";
import OverloadSpotlightCard from "../../components/HomeScreen/OverloadSpotlightCard";
import ActiveGoalsCard from "../../components/HomeScreen/ActiveGoalsCard";
import RecentPRsCard from "../../components/HomeScreen/RecentPRsCard";
import WeeklySummaryCard from "../../components/HomeScreen/WeeklySummaryCard";
import WorkoutFrequencyCard from "../../components/HomeScreen/WorkoutFrequencyCard";
import VolumeComparisonCard from "../../components/HomeScreen/VolumeComparisonCard";

import EditSetModal from "../../components/HomeScreen/EditSetModal";
import RMInfoModal from "../../components/HomeScreen/RMInfoModal";
import SetDetailsModal from "../../components/HomeScreen/SetDetailsModal";
import GoalDetailsModal from "../../components/HomeScreen/GoalDetailsModal";
import WeeklyDayDetailModal from "../../components/Charts/WeeklyDayDetailModal";
import ExerciseDetailModal from "../../components/Charts/ExerciseDetailModal";

export default function HomeScreen() {
    const colors = useThemedColors();

    // Use individual selectors to avoid re-rendering on every store change
    const user = useAppStore(state => state.user);
    const profile = useAppStore(state => state.profile);
    const currentStreak = useAppStore(state => state.currentStreak);
    const fitnessGoals = useAppStore(state => state.fitnessGoals);
    const progressByExercise = useAppStore(state => state.progressByExercise);
    const recentSets = useAppStore(state => state.recentSets);
    const isLoading = useAppStore(state => state.isLoading);
    const isRefreshing = useAppStore(state => state.isRefreshing);
    const initializeUserData = useAppStore(state => state.initializeUserData);
    const refreshAll = useAppStore(state => state.refreshAll);
    const loadProgressFromSets = useAppStore(state => state.loadProgressFromSets);
    const loadRecentSets = useAppStore(state => state.loadRecentSets);
    const addFitnessGoal = useAppStore(state => state.addFitnessGoal);
    const updateFitnessGoal = useAppStore(state => state.updateFitnessGoal);
    const removeFitnessGoal = useAppStore(state => state.removeFitnessGoal);
    const setFitnessGoals = useAppStore(state => state.setFitnessGoals);
    const addExerciseSet = useAppStore(state => state.addExerciseSet);
    const refreshRecentSets = useAppStore(state => state.refreshRecentSets);
    const refreshProgress = useAppStore(state => state.refreshProgress);

    const volumeProgressionData = useAppStore(state => state.chartsData.volumeProgression);
    const loadVolumeProgression = useAppStore(state => state.loadVolumeProgression);

    const muscleGroupHeatmapData = useAppStore(state => state.chartsData.muscleGroupHeatmap);
    const loadMuscleGroupHeatmap = useAppStore(state => state.loadMuscleGroupHeatmap);

    const overloadInsightsData = useAppStore(state => state.chartsData.progressiveOverloadInsights);
    const loadProgressiveOverloadInsights = useAppStore(state => state.loadProgressiveOverloadInsights);

    const volumeProgression = useMemo(() => {
        return volumeProgressionData[30] || [];
    }, [volumeProgressionData]);

    const muscleHeatmap = useMemo(() => {
        return muscleGroupHeatmapData[30] || [];
    }, [muscleGroupHeatmapData]);

    const overloadInsights = useMemo(() => {
        return overloadInsightsData[30] || [];
    }, [overloadInsightsData]);

    useEffect(() => {
        if (!user) {
            initializeUserData();
        }
    }, []);

    useEffect(() => {
        if (user) {
            loadVolumeProgression(30);
            loadMuscleGroupHeatmap(30);
            loadProgressiveOverloadInsights(30);
        }
    }, [user]);

    const setActions = useSetActions({
        user,
        loadProgressFromSets,
        loadRecentSets,
        addExerciseSet,
        refreshRecentSets,
        refreshProgress,
    });

    const goalActions = useGoalActions({
        user,
        fitnessGoals,
        setFitnessGoals,
        addFitnessGoal,
        updateFitnessGoal,
        removeFitnessGoal,
    });

    const [focusTrigger, setFocusTrigger] = useState(0);
    useFocusEffect(useCallback(() => {
        setFocusTrigger((t) => t + 1);
    }, []));

    const [showRMInfoModal, setShowRMInfoModal] = useState(false);
    const [showDayDetailModal, setShowDayDetailModal] = useState(false);
    const [selectedDayDate, setSelectedDayDate] = useState(null);
    const [showExerciseDetailModal, setShowExerciseDetailModal] = useState(false);
    const [selectedExerciseName, setSelectedExerciseName] = useState(null);

    const handleDayPress = useCallback((date) => {
        setSelectedDayDate(date);
        setShowDayDetailModal(true);
    }, []);

    const handleExercisePress = useCallback((exerciseName) => {
        setSelectedExerciseName(exerciseName);
        setShowExerciseDetailModal(true);
    }, []);

    const handleRefresh = useCallback(() => {
        refreshAll();
        loadVolumeProgression(30, true);
        loadMuscleGroupHeatmap(30, true);
        loadProgressiveOverloadInsights(30, true);
    }, []);

    if (isLoading || !user) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.background.primary, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color={colors.primary[600]} />
                <Text style={{ color: colors.text.secondary, marginTop: 16 }}>
                    Loading your dashboard...
                </Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: colors.background.primary }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120 }}
            refreshControl={
                <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
            }
        >
            <AnimatedItem index={0} trigger={focusTrigger}>
                <DashboardHeader
                    profile={profile}
                    user={user}
                    currentStreak={currentStreak}
                />
            </AnimatedItem>

            <View style={{ paddingHorizontal: 20, gap: 16, marginTop: 16 }}>
                <AnimatedItem index={1} trigger={focusTrigger}>
                    <QuickStatsGrid
                        recentSets={recentSets}
                        progressByExercise={progressByExercise}
                        fitnessGoals={fitnessGoals}
                        currentStreak={currentStreak}
                    />
                </AnimatedItem>

                <AnimatedItem index={2} trigger={focusTrigger}>
                    <WeeklyActivityCard
                        recentSets={recentSets}
                        onDayPress={handleDayPress}
                    />
                </AnimatedItem>

                <AnimatedItem index={3} trigger={focusTrigger}>
                    <ConsistencyRingCard
                        recentSets={recentSets}
                        currentStreak={currentStreak}
                    />
                </AnimatedItem>

                <AnimatedItem index={4} trigger={focusTrigger}>
                    <WeeklySummaryCard recentSets={recentSets} />
                </AnimatedItem>

                <AnimatedItem index={5} trigger={focusTrigger}>
                    <WorkoutFrequencyCard recentSets={recentSets} />
                </AnimatedItem>

                <AnimatedItem index={6} trigger={focusTrigger}>
                    <TodayWorkoutCard
                        recentSets={recentSets}
                        onLogExercise={setActions.handleOpenLogSet}
                        onExercisePress={handleExercisePress}
                    />
                </AnimatedItem>

                <AnimatedItem index={7} trigger={focusTrigger}>
                    <VolumeTrendCard volumeProgression={volumeProgression} />
                </AnimatedItem>

                <AnimatedItem index={8} trigger={focusTrigger}>
                    <VolumeComparisonCard recentSets={recentSets} />
                </AnimatedItem>

                <AnimatedItem index={9} trigger={focusTrigger}>
                    <MuscleBalanceCard heatmapData={muscleHeatmap} />
                </AnimatedItem>

                <AnimatedItem index={10} trigger={focusTrigger}>
                    <MonthlyActivityCard
                        recentSets={recentSets}
                        onDayPress={handleDayPress}
                    />
                </AnimatedItem>

                <AnimatedItem index={11} trigger={focusTrigger}>
                    <OverloadSpotlightCard overloadInsights={overloadInsights} />
                </AnimatedItem>

                <AnimatedItem index={12} trigger={focusTrigger}>
                    <ActiveGoalsCard
                        fitnessGoals={fitnessGoals}
                        onGoalPress={goalActions.openGoalDetails}
                        onAddGoal={goalActions.openAddGoalModal}
                    />
                </AnimatedItem>

                <AnimatedItem index={13} trigger={focusTrigger}>
                    <RecentPRsCard progressByExercise={progressByExercise} />
                </AnimatedItem>
            </View>

            <GoalDetailsModal
                visible={goalActions.isGoalDetailsVisible}
                onClose={() => goalActions.setIsGoalDetailsVisible(false)}
                selectedGoal={goalActions.selectedGoal}
                onToggleComplete={(goal) => goalActions.handleToggleComplete(goal, true)}
                onEdit={(goal) => goalActions.openEditGoalModal(goal)}
                onDelete={(goalId) => goalActions.handleDeleteGoal(goalId, true)}
                isCompleteLoading={goalActions.modalCompleteLoadingGoalId !== null}
                isDeleteLoading={goalActions.modalDeleteLoadingGoalId !== null}
                completeLoadingId={goalActions.modalCompleteLoadingGoalId}
                deleteLoadingId={goalActions.modalDeleteLoadingGoalId}
            />

            <SetDetailsModal
                visible={setActions.isSetDetailsVisible}
                onClose={setActions.closeSetDetails}
                selectedSet={setActions.selectedSet}
                onEdit={() => {
                    setActions.closeSetDetails();
                    setActions.openEditSetModal(setActions.selectedSet);
                }}
                onDelete={setActions.handleDeleteSetFromModal}
                isDeleting={setActions.modalDeleteLoadingSetId !== null}
                deleteLoadingId={setActions.modalDeleteLoadingSetId}
            />

            <RMInfoModal
                visible={showRMInfoModal}
                onClose={() => setShowRMInfoModal(false)}
            />

            <WeeklyDayDetailModal
                visible={showDayDetailModal}
                onClose={() => setShowDayDetailModal(false)}
                dayDate={selectedDayDate}
                userId={user?.id}
            />

            <ExerciseDetailModal
                visible={showExerciseDetailModal}
                onClose={() => setShowExerciseDetailModal(false)}
                exerciseName={selectedExerciseName}
                userId={user?.id}
            />

            <EditSetModal
                visible={setActions.isEditSetVisible}
                onClose={setActions.closeEditSetModal}
                onSubmit={setActions.handleSaveEditedSet}
                onDelete={setActions.handleDeleteSet}
                isSubmitting={setActions.isEditSubmitting}
                isDeleting={setActions.isEditDeleting}
                initialValues={setActions.editingSet ? {
                    exerciseName: setActions.editingSet?.exercises?.name || "",
                    weight: setActions.editingSet?.weight,
                    reps: setActions.editingSet?.reps,
                    sets: setActions.editingSet?.sets,
                    unit: setActions.editingSet?.unit,
                } : null}
            />
        </ScrollView>
    );
}
