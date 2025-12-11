import React, { useState } from "react";
import { View, Text, ScrollView, RefreshControl, ActivityIndicator } from "react-native";
import { useThemedColors } from "../hooks/useThemedColors";
import { useHomeScreenData } from "../hooks/useHomeScreenData";
import { useSetActions } from "../hooks/useSetActions";
import { useGoalActions } from "../hooks/useGoalActions";

// Components
import HomeScreenHeader from "../components/HomeScreen/HomeScreenHeader";
import ProgressSection from "../components/HomeScreen/ProgressSection";
import GoalsSection from "../components/HomeScreen/GoalsSection";
import ExpiredGoalsSection from "../components/HomeScreen/ExpiredGoalsSection";
import RecentSetsSection from "../components/HomeScreen/RecentSetsSection";
import AddGoalModal from "../components/HomeScreen/AddGoalModal";
import LogSetModal from "../components/HomeScreen/LogSetModal";
import EditSetModal from "../components/HomeScreen/EditSetModal";
import RMInfoModal from "../components/HomeScreen/RMInfoModal";
import SetDetailsModal from "../components/HomeScreen/SetDetailsModal";
import GoalDetailsModal from "../components/HomeScreen/GoalDetailsModal";
import StreakInfoModal from "../components/HomeScreen/StreakInfoModal";

export default function HomeScreen() {
    const colors = useThemedColors();
    
    // Data hook
    const {
        user,
        profile,
        currentStreak,
        fitnessGoals,
        setFitnessGoals,
        progressByExercise,
        recentSets,
        isLoading,
        refreshing,
        onRefresh,
        loadProgressFromSets,
        loadRecentSets,
    } = useHomeScreenData();

    // Set actions hook
    const setActions = useSetActions({ user, loadProgressFromSets, loadRecentSets });

    // Goal actions hook
    const goalActions = useGoalActions({ user, fitnessGoals, setFitnessGoals });

    // UI state
    const [showRMInfoModal, setShowRMInfoModal] = useState(false);
    const [showStreakModal, setShowStreakModal] = useState(false);
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
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {/* Header */}
            <HomeScreenHeader
                profile={profile}
                user={user}
                currentStreak={currentStreak}
                setShowStreakModal={setShowStreakModal}
            />

            <View style={{ paddingHorizontal: 24, marginTop: -16 }}>
                {/* Progress Section */}
                <ProgressSection
                    progressByExercise={progressByExercise}
                    cardExpanded={cardExpanded}
                    toggleCardExpansion={toggleCardExpansion}
                    handleOpenLogSet={setActions.handleOpenLogSet}
                    setShowRMInfoModal={setShowRMInfoModal}
                />

                {/* Goals Section */}
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

                {/* Expired Goals Section */}
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

                {/* Completed Goals Section */}
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

                {/* Recent Sets Section */}
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

            <LogSetModal
                visible={setActions.isLogSetVisible}
                onClose={setActions.handleCloseLogSet}
                onSubmit={setActions.handleSubmitLogSet}
                isSubmitting={setActions.isLogSubmitting}
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

            <StreakInfoModal 
                visible={showStreakModal} 
                onClose={() => setShowStreakModal(false)}
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

            <AddGoalModal
                visible={goalActions.isGoalModalVisible}
                onClose={() => goalActions.setIsGoalModalVisible(false)}
                onSubmit={goalActions.handleSaveGoal}
                initialValues={goalActions.goalFormState}
                isEditing={Boolean(goalActions.editingGoalId)}
                isLoading={goalActions.isGoalActionLoading}
            />
        </ScrollView>
    );
}
