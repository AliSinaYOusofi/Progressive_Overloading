import { useState } from 'react';
import {
  createFitnessGoal,
  updateFitnessGoal,
  deleteFitnessGoal,
} from '../lib/database';

/**
 * Custom hook for managing goal-related actions (create, edit, delete, toggle)
 */
export const useGoalActions = ({ user, fitnessGoals, setFitnessGoals }) => {
  const [isGoalModalVisible, setIsGoalModalVisible] = useState(false);
  const [goalFormState, setGoalFormState] = useState({
    title: '',
    description: '',
    target_value: '',
    current_value: '',
    unit: '',
    target_date: '',
  });
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [editingGoalIsCompleted, setEditingGoalIsCompleted] = useState(false);
  const [isGoalDetailsVisible, setIsGoalDetailsVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [isGoalActionLoading, setIsGoalActionLoading] = useState(false);
  const [modalCompleteLoadingGoalId, setModalCompleteLoadingGoalId] = useState(null);
  const [modalDeleteLoadingGoalId, setModalDeleteLoadingGoalId] = useState(null);
  const [completeLoadingGoalId, setCompleteLoadingGoalId] = useState(null);
  const [deleteLoadingGoalId, setDeleteLoadingGoalId] = useState(null);

  const openAddGoalModal = () => {
    setEditingGoalId(null);
    setEditingGoalIsCompleted(false);
    setGoalFormState({
      title: '',
      description: '',
      target_value: '',
      current_value: '',
      unit: '',
      target_date: '',
    });
    setIsGoalModalVisible(true);
  };

  const openEditGoalModal = (goal) => {
    setEditingGoalId(goal.id);
    setEditingGoalIsCompleted(Boolean(goal.is_completed));
    setGoalFormState({
      title: goal.title || '',
      description: goal.description || '',
      target_value: goal.target_value?.toString() || '',
      current_value: goal.current_value?.toString() || '',
      unit: goal.unit || '',
      target_date: goal.target_date || '',
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
        setFitnessGoals((prev) =>
          prev.map((g) => (g.id === editingGoalId ? { ...g, ...payload } : g))
        );
      } else {
        savedGoal = await createFitnessGoal(payload);
        setFitnessGoals((prev) => [...prev, savedGoal]);
      }

      setIsGoalModalVisible(false);
      setEditingGoalId(null);
    } catch (e) {
      console.error('Error saving goal:', e);
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

      setFitnessGoals((prev) => prev.filter((goal) => goal.id !== goalId));

      setIsGoalDetailsVisible(false);
      setSelectedGoal(null);
    } catch (e) {
      console.error('Error deleting goal:', e);
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

      setFitnessGoals((prev) =>
        prev.map((g) => (g.id === goal.id ? { ...g, ...updates } : g))
      );

      setSelectedGoal((prev) =>
        prev && prev.id === goal.id ? { ...prev, ...updates } : prev
      );
      if (editingGoalId && editingGoalId === goal.id) {
        setEditingGoalIsCompleted(Boolean(updates.is_completed));
      }
    } catch (e) {
      console.error('Error updating goal state:', e);
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

  return {
    isGoalModalVisible,
    setIsGoalModalVisible,
    goalFormState,
    editingGoalId,
    editingGoalIsCompleted,
    isGoalDetailsVisible,
    selectedGoal,
    isGoalActionLoading,
    modalCompleteLoadingGoalId,
    modalDeleteLoadingGoalId,
    completeLoadingGoalId,
    deleteLoadingGoalId,
    openAddGoalModal,
    openEditGoalModal,
    handleSaveGoal,
    handleDeleteGoal,
    handleToggleComplete,
    openGoalDetails,
    setIsGoalDetailsVisible,
  };
};

