import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './useAuth';
import {
    initDataService,
    getUserProfile,
    saveUserProfile,
    getPeriodData,
    savePeriodData,
    getSymptomsData,
    saveSymptomsData,
    getNotesData,
    saveNotesData,
    exportAllData,
    deleteAllData
} from '../services/dataService';

// Create the data context
export const DataContext = createContext();

// Hook to use the data context
export function useData() {
    return useContext(DataContext);
}

export function DataProvider({ children }) {
    const { currentUser } = useAuth();
    const [isInitialized, setIsInitialized] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [periodData, setPeriodData] = useState(null);
    const [symptomsData, setSymptomsData] = useState(null);
    const [notesData, setNotesData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initialize data service when user is authenticated
    useEffect(() => {
        async function initialize() {
            if (currentUser && !isInitialized) {
                try {
                    setLoading(true);
                    await initDataService();
                    setIsInitialized(true);
                } catch (err) {
                    console.error("Failed to initialize data service:", err);
                    setError("Failed to connect to Google Drive. Please try again.");
                } finally {
                    setLoading(false);
                }
            }
        }

        initialize();
    }, [currentUser, isInitialized]);

    // Load user data when initialized
    useEffect(() => {
        async function loadUserData() {
            if (isInitialized && currentUser) {
                try {
                    setLoading(true);

                    // Load user profile
                    const profile = await getUserProfile();
                    if (profile) setUserProfile(profile);

                    // Load period data
                    const periods = await getPeriodData();
                    if (periods) setPeriodData(periods);

                    // Load symptoms data
                    const symptoms = await getSymptomsData();
                    if (symptoms) setSymptomsData(symptoms);

                    // Load notes data
                    const notes = await getNotesData();
                    if (notes) setNotesData(notes);

                } catch (err) {
                    console.error("Error loading user data:", err);
                    setError("Failed to load your data from Google Drive.");
                } finally {
                    setLoading(false);
                }
            }
        }

        loadUserData();
    }, [isInitialized, currentUser]);

    // Functions to update user profile
    const updateUserProfile = async (newProfileData) => {
        try {
            setLoading(true);
            const updatedProfile = { ...userProfile, ...newProfileData };
            await saveUserProfile(updatedProfile);
            setUserProfile(updatedProfile);
            return true;
        } catch (err) {
            console.error("Error updating user profile:", err);
            setError("Failed to save profile to Google Drive.");
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Functions to update period data
    const updatePeriodData = async (newPeriodData) => {
        try {
            setLoading(true);
            const updatedPeriodData = { ...periodData, ...newPeriodData };
            await savePeriodData(updatedPeriodData);
            setPeriodData(updatedPeriodData);
            return true;
        } catch (err) {
            console.error("Error updating period data:", err);
            setError("Failed to save period data to Google Drive.");
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Functions to update symptoms data
    const updateSymptomsData = async (newSymptomsData) => {
        try {
            setLoading(true);
            const updatedSymptomsData = { ...symptomsData, ...newSymptomsData };
            await saveSymptomsData(updatedSymptomsData);
            setSymptomsData(updatedSymptomsData);
            return true;
        } catch (err) {
            console.error("Error updating symptoms data:", err);
            setError("Failed to save symptoms data to Google Drive.");
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Functions to update notes data
    const updateNotesData = async (newNotesData) => {
        try {
            setLoading(true);
            const updatedNotesData = { ...notesData, ...newNotesData };
            await saveNotesData(updatedNotesData);
            setNotesData(updatedNotesData);
            return true;
        } catch (err) {
            console.error("Error updating notes data:", err);
            setError("Failed to save notes to Google Drive.");
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Export all user data
    const exportUserData = async () => {
        try {
            setLoading(true);
            const fileId = await exportAllData();
            return fileId;
        } catch (err) {
            console.error("Error exporting user data:", err);
            setError("Failed to export data to Google Drive.");
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Delete all user data
    const deleteUserData = async () => {
        try {
            setLoading(true);
            await deleteAllData();
            setUserProfile(null);
            setPeriodData(null);
            setSymptomsData(null);
            setNotesData(null);
            return true;
        } catch (err) {
            console.error("Error deleting user data:", err);
            setError("Failed to delete data from Google Drive.");
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Clear any errors
    const clearError = () => {
        setError(null);
    };

    // Context value
    const value = {
        isInitialized,
        loading,
        error,
        clearError,

        // User profile data and functions
        userProfile,
        updateUserProfile,

        // Period tracking data and functions
        periodData,
        updatePeriodData,

        // Symptoms data and functions
        symptomsData,
        updateSymptomsData,

        // Notes data and functions
        notesData,
        updateNotesData,

        // Data management functions
        exportUserData,
        deleteUserData
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
}
