import { useState } from 'react';
import { getCurrentUser } from '../lib/database';
import Toast from 'react-native-toast-message';

/**
 * Custom hook for managing set-related actions (log, edit, delete)
 */
export const useSetActions = ({ user, loadProgressFromSets, loadRecentSets }) => {
  const [isLogSetVisible, setIsLogSetVisible] = useState(false);
  const [isLogSubmitting, setIsLogSubmitting] = useState(false);
  const [isEditSetVisible, setIsEditSetVisible] = useState(false);
  const [editingSet, setEditingSet] = useState(null);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [isEditDeleting, setIsEditDeleting] = useState(false);
  const [isSetDetailsVisible, setIsSetDetailsVisible] = useState(false);
  const [selectedSet, setSelectedSet] = useState(null);
  const [deleteLoadingSetId, setDeleteLoadingSetId] = useState(null);
  const [modalDeleteLoadingSetId, setModalDeleteLoadingSetId] = useState(null);

  const handleOpenLogSet = () => setIsLogSetVisible(true);
  const handleCloseLogSet = () => setIsLogSetVisible(false);

  const handleSubmitLogSet = async ({ exerciseName, weight, reps, sets, unit }) => {
    setIsLogSubmitting(true);
    const currentUser = user || (await getCurrentUser());
    if (!currentUser) {
      setIsLogSubmitting(false);
      return;
    }
    
    try {
      const { findOrCreateExercise, createExerciseSet } = await import('../lib/database');
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
      
      handleCloseLogSet();
      
      // Show toast immediately after closing modal
      Toast.show({
        type: 'success',
        text1: 'Set logged',
        text2: 'Your workout set has been logged successfully',
      });
      
      // Load data in background
      await loadProgressFromSets(currentUser.id);
      await loadRecentSets(currentUser.id);
    } catch (e) {
      console.error('Error logging set:', e);
      Toast.show({
        type: 'error',
        text1: 'Failed to log set',
        text2: e.message || 'Please try again',
      });
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
    setIsEditSubmitting(true);
    const currentUser = user || (await getCurrentUser());
    if (!currentUser || !editingSet) {
      setIsEditSubmitting(false);
      return;
    }
    
    try {
      const { findOrCreateExercise, updateExerciseSet } = await import('../lib/database');
      const exercise = await findOrCreateExercise(currentUser.id, exerciseName);
      await updateExerciseSet(editingSet.id, {
        exercise_id: exercise.id,
        weight,
        reps,
        sets,
        unit,
      });
      
      closeEditSetModal();
      
      // Show toast immediately after closing modal
      Toast.show({
        type: 'success',
        text1: 'Set updated',
        text2: 'Your workout set has been updated successfully',
      });
      
      // Load data in background
      await loadProgressFromSets(currentUser.id);
      await loadRecentSets(currentUser.id);
    } catch (e) {
      console.error('Error updating set:', e);
      Toast.show({
        type: 'error',
        text1: 'Failed to update set',
        text2: e.message || 'Please try again',
      });
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleDeleteSet = async () => {
    setIsEditDeleting(true);
    const currentUser = user || (await getCurrentUser());
    if (!currentUser || !editingSet) {
      setIsEditDeleting(false);
      return;
    }
    
    const setToDelete = editingSet;
    closeEditSetModal();
    
    // Show toast immediately
    Toast.show({
      type: 'success',
      text1: 'Set deleted',
      text2: 'Your workout set has been deleted successfully',
    });
    
    // Then make API call
    try {
      const { deleteExerciseSet } = await import('../lib/database');
      await deleteExerciseSet(setToDelete.id);
      await loadProgressFromSets(currentUser.id);
      await loadRecentSets(currentUser.id);
    } catch (e) {
      console.error('Error deleting set:', e);
      Toast.show({
        type: 'error',
        text1: 'Failed to delete set',
        text2: e.message || 'Please try again',
      });
    } finally {
      setIsEditDeleting(false);
    }
  };

  const handleDeleteSetFromList = async (setItem) => {
    setDeleteLoadingSetId(setItem.id);
    const currentUser = user || (await getCurrentUser());
    if (!currentUser) {
      setDeleteLoadingSetId(null);
      return;
    }
    
    // Show toast immediately
    Toast.show({
      type: 'success',
      text1: 'Set deleted',
      text2: 'Your workout set has been deleted successfully',
    });
    
    // Then make API call
    try {
      const { deleteExerciseSet } = await import('../lib/database');
      await deleteExerciseSet(setItem.id);
      await loadProgressFromSets(currentUser.id);
      await loadRecentSets(currentUser.id);
    } catch (e) {
      console.error('Error deleting set:', e);
      Toast.show({
        type: 'error',
        text1: 'Failed to delete set',
        text2: e.message || 'Please try again',
      });
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
      
      const { deleteExerciseSet } = await import('../lib/database');
      await deleteExerciseSet(selectedSet.id);
      await loadProgressFromSets(currentUser.id);
      await loadRecentSets(currentUser.id);
      closeSetDetails();
      
      Toast.show({
        type: 'success',
        text1: 'Set deleted',
        text2: 'Your workout set has been deleted successfully',
      });
    } catch (e) {
      console.error('Error deleting set:', e);
      Toast.show({
        type: 'error',
        text1: 'Failed to delete set',
        text2: e.message || 'Please try again',
      });
    } finally {
      setModalDeleteLoadingSetId(null);
    }
  };

  return {
    isLogSetVisible,
    isLogSubmitting,
    isEditSetVisible,
    editingSet,
    isEditSubmitting,
    isEditDeleting,
    isSetDetailsVisible,
    selectedSet,
    deleteLoadingSetId,
    modalDeleteLoadingSetId,
    handleOpenLogSet,
    handleCloseLogSet,
    handleSubmitLogSet,
    openEditSetModal,
    closeEditSetModal,
    openSetDetails,
    closeSetDetails,
    handleSaveEditedSet,
    handleDeleteSet,
    handleDeleteSetFromList,
    handleDeleteSetFromModal,
  };
};

