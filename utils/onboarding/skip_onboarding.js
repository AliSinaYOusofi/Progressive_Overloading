import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

/**
 * Saves the onboarding completion status to AsyncStorage
 * @param {boolean} hasSeenOnboarding - Whether the user has seen the onboarding
 * @returns {Promise<void>}
 */
export const saveOnboardingStatus = async (hasSeenOnboarding) => {
    try {
        await AsyncStorage.setItem("hasSeenOnboarding", hasSeenOnboarding.toString());
    } catch (error) {
        console.error('Error saving onboarding status:', error);
    }
};

/**
 * Marks onboarding as completed by setting hasSeenOnboarding to true
 * @returns {Promise<void>}
 */
export const markOnboardingComplete = async () => {
    await saveOnboardingStatus(true);
};

/**
 * Marks onboarding as not completed by setting hasSeenOnboarding to false
 * @returns {Promise<void>}
 */
export const markOnboardingIncomplete = async () => {
    await saveOnboardingStatus(false);
    router.replace("/");
}; 
