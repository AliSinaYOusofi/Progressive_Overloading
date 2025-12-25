import { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  createFitnessGoal,
  updateFitnessGoal as updateFitnessGoalInDB,
  deleteFitnessGoal,
} from '../lib/database';

/**
 * Custom hook for managing goal-related actions (create, edit, delete, toggle)
 */
export const useGoalActions = ({ 
  user, 
  fitnessGoals, 
  setFitnessGoals,
  addFitnessGoal,
  updateFitnessGoal,
  removeFitnessGoal,
}) => {
  // Use store actions if provided, otherwise fall back to setFitnessGoals
  const addGoal = addFitnessGoal || ((goal) => {
    if (setFitnessGoals) {
      setFitnessGoals((prev) => {
        const exists = prev.find(g => String(g.id) === String(goal.id));
        if (exists) {
          return prev.map(g => String(g.id) === String(goal.id) ? goal : g);
        }
        return [...prev, goal];
      });
    }
  });
  
  const updateGoal = updateFitnessGoal || ((goalId, updates) => {
    if (setFitnessGoals) {
      setFitnessGoals((prev) =>
        prev.map((g) => (String(g.id) === String(goalId) ? { ...g, ...updates } : g))
      );
    }
  });
  
  const removeGoal = removeFitnessGoal || ((goalId) => {
    if (setFitnessGoals) {
      setFitnessGoals((prev) => prev.filter((g) => String(g.id) !== String(goalId)));
    }
  });
  const router = useRouter();
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
    router.push('/add-goal');
  };

  const openEditGoalModal = (goal) => {
    router.push({
      pathname: '/edit-goal',
      params: { goalId: goal.id.toString() }
    });
  };

  const handleSaveGoal = async (goalData, goalId = null) => {
    try {
      if (!user) return;
      setIsGoalActionLoading(true);
      const goalIdToUse = goalId || editingGoalId;
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
      if (goalIdToUse) {
        savedGoal = await updateFitnessGoalInDB(goalIdToUse, payload);
        updateGoal(goalIdToUse, payload);
      } else {
        savedGoal = await createFitnessGoal(payload);
        addGoal(savedGoal);
      }

      setEditingGoalId(null);
    } catch (e) {
      console.error('Error saving goal:', e);
    } finally {
      setIsGoalActionLoading(false);
    }
  };

  const handleDeleteGoal = async (goalId, fromModal = false) => {
    if (fromModal) {
      setModalDeleteLoadingGoalId(goalId);
    } else {
      setDeleteLoadingGoalId(goalId);
    }
    
    // Optimistic update - remove from state immediately
    const deletedGoal = fitnessGoals.find((goal) => String(goal.id) === String(goalId));
    removeGoal(goalId);
    setIsGoalDetailsVisible(false);
    setSelectedGoal(null);
    
    // Then make API call
    try {
      await deleteFitnessGoal(goalId);
    } catch (e) {
      console.error('Error deleting goal:', e);
      // Revert optimistic update on error
      if (deletedGoal) {
        addGoal(deletedGoal);
      }
    } finally {
      if (fromModal) {
        setModalDeleteLoadingGoalId(null);
      } else {
        setDeleteLoadingGoalId(null);
      }
    }
  };

  const handleToggleComplete = async (goal, fromModal = false) => {
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
    
    // Optimistic update - update state immediately
    const previousGoal = goal;
    updateGoal(goal.id, updates);

    setSelectedGoal((prev) =>
      prev && prev.id === goal.id ? { ...prev, ...updates } : prev
    );
    if (editingGoalId && editingGoalId === goal.id) {
      setEditingGoalIsCompleted(Boolean(updates.is_completed));
    }
    
    // Then make API call
    try {
      await updateFitnessGoalInDB(goal.id, updates);
    } catch (e) {
      console.error('Error updating goal state:', e);
      // Revert optimistic update on error
      updateGoal(goal.id, previousGoal);
      setSelectedGoal((prev) =>
        prev && prev.id === goal.id ? { ...prev, ...previousGoal } : prev
      );
      if (editingGoalId && editingGoalId === goal.id) {
        setEditingGoalIsCompleted(Boolean(previousGoal.is_completed));
      }
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
    setEditingGoalId,
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

