import React, { useCallback, useState, useEffect } from "react";
import { View, Text, ScrollView, RefreshControl, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useThemedColors } from "../../hooks/useThemedColors";
import { useAppStore } from "../../stores/useAppStore";
import { useSetActions } from "../../hooks/useSetActions";
import { useGoalActions } from "../../hooks/useGoalActions";
import AnimatedItem from "../../components/AnimatedItem";

// Components
import HomeScreenHeader from "../../components/HomeScreen/HomeScreenHeader";
import ProgressSection from "../../components/HomeScreen/ProgressSection";
import GoalsSection from "../../components/HomeScreen/GoalsSection";
import ExpiredGoalsSection from "../../components/HomeScreen/ExpiredGoalsSection";
import RecentSetsSection from "../../components/HomeScreen/RecentSetsSection";
import EditSetModal from "../../components/HomeScreen/EditSetModal";
import RMInfoModal from "../../components/HomeScreen/RMInfoModal";
import SetDetailsModal from "../../components/HomeScreen/SetDetailsModal";
import GoalDetailsModal from "../../components/HomeScreen/GoalDetailsModal";

export default function HomeScreen() {
    const colors = useThemedColors();
    
    // Zustand store
    const {
        user,
        profile,
        currentStreak,
        fitnessGoals,
        progressByExercise,
        recentSets,
        isLoading,
        isRefreshing,
        initializeUserData,
        refreshAll,
        loadProgressFromSets,
        loadRecentSets,
        addFitnessGoal,
        updateFitnessGoal,
        removeFitnessGoal,
        setFitnessGoals,
    } = useAppStore();

    // Initialize data on mount
    useEffect(() => {
        if (!user) {
            initializeUserData();
        }
    }, [user, initializeUserData]);

    // Get store actions for sets
    const { addExerciseSet, refreshRecentSets, refreshProgress } = useAppStore();
    
    // Set actions hook
    const setActions = useSetActions({ 
        user, 
        loadProgressFromSets, 
        loadRecentSets,
        addExerciseSet,
        refreshRecentSets,
        refreshProgress,
    });

    // Goal actions hook
    const goalActions = useGoalActions({ 
        user, 
        fitnessGoals, 
        setFitnessGoals,
        addFitnessGoal,
        updateFitnessGoal,
        removeFitnessGoal,
    });

    // Animation trigger
    const [focusTrigger, setFocusTrigger] = useState(0);
    useFocusEffect(useCallback(() => {
        setFocusTrigger((t) => t + 1);
    }, []));

    // UI state
    const [showRMInfoModal, setShowRMInfoModal] = useState(false);
    const [cardExpanded, setCardExpanded] = useState({
        progress: true,
        goals: true,
        expiredGoals: true,
        completedGoals: true,
        recentSets: true,
    });

    const toggleCardExpansion = (cardType) => {
        setCardExpanded(prev => ({
            ...prev,
            [cardType]: !prev[cardType]
        }));
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.background.primary, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={colors.primary[600]} />
                <Text style={{ color: colors.text.secondary, marginTop: 16 }}>
                    Loading your progress...
                </Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: colors.background.primary }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            refreshControl={
                <RefreshControl refreshing={isRefreshing} onRefresh={refreshAll} />
            }
        >
            {/* Header */}
            <AnimatedItem index={0} trigger={focusTrigger}>
                <HomeScreenHeader
                    profile={profile}
                    user={user}
                    currentStreak={currentStreak}
                />
            </AnimatedItem>

            <View style={{ paddingHorizontal: 24, marginTop: -16 }}>
                {/* Progress Section */}
                <AnimatedItem index={1} trigger={focusTrigger}>
                    <ProgressSection
                        progressByExercise={progressByExercise}
                        cardExpanded={cardExpanded}
                        toggleCardExpansion={toggleCardExpansion}
                        handleOpenLogSet={setActions.handleOpenLogSet}
                        setShowRMInfoModal={setShowRMInfoModal}
                    />
                </AnimatedItem>

                {/* Goals Section */}
                <AnimatedItem index={2} trigger={focusTrigger}>
                    <GoalsSection
                        fitnessGoals={fitnessGoals}
                        cardExpanded={cardExpanded}
                        toggleCardExpansion={toggleCardExpansion}
                        openAddGoalModal={goalActions.openAddGoalModal}
                        openGoalDetails={goalActions.openGoalDetails}
                        openEditGoalModal={goalActions.openEditGoalModal}
                        handleToggleComplete={goalActions.handleToggleComplete}
                        handleDeleteGoal={goalActions.handleDeleteGoal}
                        completeLoadingGoalId={goalActions.completeLoadingGoalId}
                        deleteLoadingGoalId={goalActions.deleteLoadingGoalId}
                        isCompleted={false}
                    />
                </AnimatedItem>

                {/* Expired Goals Section */}
                <AnimatedItem index={3} trigger={focusTrigger}>
                    <ExpiredGoalsSection
                        fitnessGoals={fitnessGoals}
                        cardExpanded={cardExpanded}
                        toggleCardExpansion={toggleCardExpansion}
                        openAddGoalModal={goalActions.openAddGoalModal}
                        openGoalDetails={goalActions.openGoalDetails}
                        openEditGoalModal={goalActions.openEditGoalModal}
                        handleToggleComplete={goalActions.handleToggleComplete}
                        handleDeleteGoal={goalActions.handleDeleteGoal}
                        completeLoadingGoalId={goalActions.completeLoadingGoalId}
                        deleteLoadingGoalId={goalActions.deleteLoadingGoalId}
                    />
                </AnimatedItem>

                {/* Completed Goals Section */}
                <AnimatedItem index={4} trigger={focusTrigger}>
                    <GoalsSection
                        fitnessGoals={fitnessGoals}
                        cardExpanded={cardExpanded}
                        toggleCardExpansion={toggleCardExpansion}
                        openAddGoalModal={goalActions.openAddGoalModal}
                        openGoalDetails={goalActions.openGoalDetails}
                        openEditGoalModal={goalActions.openEditGoalModal}
                        handleToggleComplete={goalActions.handleToggleComplete}
                        handleDeleteGoal={goalActions.handleDeleteGoal}
                        completeLoadingGoalId={goalActions.completeLoadingGoalId}
                        deleteLoadingGoalId={goalActions.deleteLoadingGoalId}
                        isCompleted={true}
                    />
                </AnimatedItem>

                {/* Recent Sets Section */}
                <AnimatedItem index={5} trigger={focusTrigger}>
                    <RecentSetsSection
                        recentSets={recentSets}
                        cardExpanded={cardExpanded}
                        toggleCardExpansion={toggleCardExpansion}
                        handleOpenLogSet={setActions.handleOpenLogSet}
                        openSetDetails={setActions.openSetDetails}
                        openEditSetModal={setActions.openEditSetModal}
                        handleDeleteSetFromList={setActions.handleDeleteSetFromList}
                        deleteLoadingSetId={setActions.deleteLoadingSetId}
                    />
                </AnimatedItem>
            </View>

            {/* Modals */}
            <GoalDetailsModal
                visible={goalActions.isGoalDetailsVisible}
                onClose={() => goalActions.setIsGoalDetailsVisible(false)}
                selectedGoal={goalActions.selectedGoal}
                onToggleComplete={(goal) => goalActions.handleToggleComplete(goal, true)}
                onEdit={(goal) => {
                    goalActions.setIsGoalDetailsVisible(false);
                    goalActions.openEditGoalModal(goal);
                }}
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

