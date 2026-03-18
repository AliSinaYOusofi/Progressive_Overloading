import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { getCurrentUser, getProfile } from '../lib/database';

/**
 * Custom hook for managing set-related actions (log, edit, delete)
 */
export const useSetActions = ({ 
  user, 
  loadProgressFromSets, 
  loadRecentSets,
  addExerciseSet,
  refreshRecentSets,
  refreshProgress,
}) => {
  // Use store actions if provided, otherwise fall back to passed functions
  const addSet = addExerciseSet || ((set) => {
    // Fallback: if store actions not provided, just call refresh functions
    if (loadRecentSets && user) {
      loadRecentSets(user.id);
    }
  });
  
  const refreshSets = refreshRecentSets || (async () => {
    if (loadRecentSets && user) {
      await loadRecentSets(user.id);
    }
  });
  
  const refreshProg = refreshProgress || (async () => {
    if (loadProgressFromSets && user) {
      await loadProgressFromSets(user.id);
    }
  });
  const router = useRouter();
  const [isLogSubmitting, setIsLogSubmitting] = useState(false);
  const [isEditSetVisible, setIsEditSetVisible] = useState(false);
  const [editingSet, setEditingSet] = useState(null);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [isEditDeleting, setIsEditDeleting] = useState(false);
  const [isSetDetailsVisible, setIsSetDetailsVisible] = useState(false);
  const [selectedSet, setSelectedSet] = useState(null);
  const [deleteLoadingSetId, setDeleteLoadingSetId] = useState(null);
  const [modalDeleteLoadingSetId, setModalDeleteLoadingSetId] = useState(null);
  const [userDefaults, setUserDefaults] = useState(null);

  // Fetch user defaults when hook initializes
  useEffect(() => {
    const fetchDefaults = async () => {
      try {
        const currentUser = user || (await getCurrentUser());
        if (currentUser) {
          const profile = await getProfile(currentUser.id);
          if (profile) {
            setUserDefaults({
              default_sets: profile.default_sets,
              default_reps: profile.default_reps,
              default_weight_unit: profile.default_weight_unit,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching user defaults:', error);
      }
    };
    fetchDefaults();
  }, [user]);

  const handleOpenLogSet = async () => {
    // Navigate to log-set screen (homescreen stack so it works with NativeTabs on iOS)
    router.push('/homescreen/log-set');
  };

  const handleSubmitLogSet = async ({ exerciseName, weight, reps, sets, unit }) => {
    setIsLogSubmitting(true);
    const currentUser = user || (await getCurrentUser());
    if (!currentUser) {
      setIsLogSubmitting(false);
      return;
    }
    
    let wasSuccessful = false;
    
    try {
      const { findOrCreateExercise, createExerciseSet } = await import('../lib/database');
      const exercise = await findOrCreateExercise(currentUser.id, exerciseName);
      const newSet = await createExerciseSet({
        user_id: currentUser.id,
        exercise_id: exercise.id,
        weight,
        reps,
        sets,
        unit,
        performed_at: new Date().toISOString(),
      });
      
      wasSuccessful = true;
      
      // Add set to store with exercise relation for display
      const setWithExercise = {
        ...newSet,
        exercises: { name: exerciseName }
      };
      if (addSet) {
        addSet(setWithExercise);
      }
      
      // Refresh data in background
      if (refreshSets) {
        await refreshSets();
      }
      if (refreshProg) {
        await refreshProg();
      }
      
      // Fallback: use old functions if store actions not available
      if (!refreshSets && loadProgressFromSets) {
        await loadProgressFromSets(currentUser.id);
      }
      if (!refreshSets && loadRecentSets) {
        await loadRecentSets(currentUser.id);
      }
    } catch (e) {
      console.error('Error logging set:', e);
    } finally {
      setIsLogSubmitting(false);
    }
  };

  const openEditSetModal = (set) => {
    // Navigate to edit-set screen with set ID
    router.push({
      pathname: '/edit-set',
      params: { setId: set.id }
    });
  };

  const closeEditSetModal = () => {
    // No longer needed - navigation handles this
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
      
      // Refresh data using store actions or fallback
      if (refreshSets) {
        await refreshSets();
      }
      if (refreshProg) {
        await refreshProg();
      }
      
      // Fallback: use old functions if store actions not available
      if (!refreshSets && loadProgressFromSets) {
        await loadProgressFromSets(currentUser.id);
      }
      if (!refreshSets && loadRecentSets) {
        await loadRecentSets(currentUser.id);
      }
    } catch (e) {
      console.error('Error updating set:', e);
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
    
    // Then make API call
    try {
      const { deleteExerciseSet } = await import('../lib/database');
      await deleteExerciseSet(setToDelete.id);
      await loadProgressFromSets(currentUser.id);
      await loadRecentSets(currentUser.id);
    } catch (e) {
      console.error('Error deleting set:', e);
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
    
    // Then make API call
    try {
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
    isLogSubmitting,
    isEditSetVisible,
    editingSet,
    isEditSubmitting,
    isEditDeleting,
    isSetDetailsVisible,
    selectedSet,
    deleteLoadingSetId,
    modalDeleteLoadingSetId,
    userDefaults,
    handleOpenLogSet,
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

