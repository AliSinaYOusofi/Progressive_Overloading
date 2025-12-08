import { useState } from 'react';
import { getCurrentUser } from '../lib/database';

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
    try {
      setIsLogSubmitting(true);
      const currentUser = user || (await getCurrentUser());
      if (!currentUser) return;
      
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
      
      await loadProgressFromSets(currentUser.id);
      await loadRecentSets(currentUser.id);
      handleCloseLogSet();
    } catch (e) {
      console.error('Error logging set:', e);
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
      
      const { findOrCreateExercise, updateExerciseSet } = await import('../lib/database');
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
      console.error('Error updating set:', e);
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleDeleteSet = async () => {
    try {
      setIsEditDeleting(true);
      const currentUser = user || (await getCurrentUser());
      if (!currentUser || !editingSet) return;
      
      const { deleteExerciseSet } = await import('../lib/database');
      await deleteExerciseSet(editingSet.id);
      await loadProgressFromSets(currentUser.id);
      await loadRecentSets(currentUser.id);
      closeEditSetModal();
    } catch (e) {
      console.error('Error deleting set:', e);
    } finally {
      setIsEditDeleting(false);
    }
  };

  const handleDeleteSetFromList = async (setItem) => {
    try {
      setDeleteLoadingSetId(setItem.id);
      const currentUser = user || (await getCurrentUser());
      if (!currentUser) return;
      
      const { deleteExerciseSet } = await import('../lib/database');
      await deleteExerciseSet(setItem.id);
      await loadProgressFromSets(currentUser.id);
      await loadRecentSets(currentUser.id);
    } catch (e) {
      console.error('Error deleting set:', e);
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
    } catch (e) {
      console.error('Error deleting set:', e);
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

