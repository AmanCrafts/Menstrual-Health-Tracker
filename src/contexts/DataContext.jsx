import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './useAuth';
import {
    initGoogleDriveApi,
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

// this is the context thingy that makes data available everywhere
export const DataContext = createContext();

// these are for saving stuff if google drive doesn't work
// they store things in the browser I think
const LS_USER_PROFILE = 'flowsync_user_profile';
const LS_PERIOD_DATA = 'flowsync_period_data';
const LS_SYMPTOMS_DATA = 'flowsync_symptoms_data';
const LS_NOTES_DATA = 'flowsync_notes_data';

// these help with reading and writing to browser storage
// i got these from a tutorial!!
const getFromLocalStorage = (key) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error(`Error reading ${key} from local storage:`, error);
        return null;
    }
};

const saveToLocalStorage = (key, data) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error(`Error saving ${key} to local storage:`, error);
        return false;
    }
};

// this is a hook to use our data context
// i'm still learning about hooks lol
export function useData() {
    return useContext(DataContext);
}

export function DataProvider({ children }) {
    const { currentUser, googleAuthToken } = useAuth();
    const [isInitialized, setIsInitialized] = useState(false);
    const [usingLocalStorage, setUsingLocalStorage] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [periodData, setPeriodData] = useState(null);
    const [symptomsData, setSymptomsData] = useState(null);
    const [notesData, setNotesData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // this runs when the component first loads
    // it starts the google drive connection
    useEffect(() => {
        async function initialize() {
            if (currentUser) {
                // Check if user authenticated with Google
                const isGoogleUser = currentUser.providerData.some(provider => provider.providerId === 'google.com');

                if (isGoogleUser && !googleAuthToken) {
                    setError("Google Drive access requires re-authentication. Using local storage for now.");
                    setUsingLocalStorage(true);
                    setLoading(false);
                    loadFromLocalStorage();
                    return;
                }

                if (!isInitialized && (googleAuthToken || !isGoogleUser)) {
                    try {
                        setLoading(true);

                        if (isGoogleUser) {
                            const success = await initGoogleDriveApi();
                            if (success) {
                                setIsInitialized(true);
                                setUsingLocalStorage(false);
                                setError(null);
                            } else {
                                setError("Could not initialize Google Drive. Using local storage instead.");
                                setUsingLocalStorage(true);
                                loadFromLocalStorage();
                            }
                        } else {
                            // Not a Google user, just use local storage
                            setUsingLocalStorage(true);
                            loadFromLocalStorage();
                        }
                    } catch (err) {
                        console.error("Failed to initialize data service:", err);
                        setError("Failed to connect to Google Drive. Using local storage instead.");
                        setUsingLocalStorage(true);
                        loadFromLocalStorage();
                    } finally {
                        setLoading(false);
                    }
                }
            }
        }

        initialize();
    }, [currentUser, googleAuthToken, isInitialized]);

    // Helper function to check if user is signed in with Google
    const isGoogleUser = () => {
        return currentUser &&
            currentUser.providerData &&
            currentUser.providerData.some(provider => provider.providerId === 'google.com');
    };

    // Initialize Google Drive when token is available
    useEffect(() => {
        async function connectGoogleDrive() {
            if (currentUser && googleAuthToken && !isInitialized) {
                try {
                    setLoading(true);
                    console.log('Attempting to initialize Google Drive with stored token:',
                        googleAuthToken.substring(0, 10) + '...');

                    // Wait a bit longer for GAPI to be ready
                    await new Promise(resolve => setTimeout(resolve, 1500));

                    const success = await initGoogleDriveApi();

                    if (success) {
                        console.log('Successfully reconnected to Google Drive');
                        setIsInitialized(true);
                        setUsingLocalStorage(false);
                        setError(null);
                    } else {
                        console.log('Token available but Drive initialization failed');
                        setError("Saved Google Drive token appears to be invalid. Using local storage instead.");
                        setUsingLocalStorage(true);
                        loadFromLocalStorage();
                    }
                } catch (err) {
                    console.error("Failed to initialize with stored token:", err);
                    setError("Could not reconnect to Google Drive. Using local storage instead.");
                    setUsingLocalStorage(true);
                    loadFromLocalStorage();
                } finally {
                    setLoading(false);
                }
            }
        }

        if (currentUser && googleAuthToken) {
            connectGoogleDrive();
        }
    }, [currentUser, googleAuthToken, isInitialized]);

    // this loads stuff from browser storage
    // if google drive doesn't work
    const loadFromLocalStorage = () => {
        const storedProfile = getFromLocalStorage(LS_USER_PROFILE);
        if (storedProfile) setUserProfile(storedProfile);

        const storedPeriodData = getFromLocalStorage(LS_PERIOD_DATA);
        if (storedPeriodData) setPeriodData(storedPeriodData);

        const storedSymptomsData = getFromLocalStorage(LS_SYMPTOMS_DATA);
        if (storedSymptomsData) setSymptomsData(storedSymptomsData);

        const storedNotesData = getFromLocalStorage(LS_NOTES_DATA);
        if (storedNotesData) setNotesData(storedNotesData);
    };

    // this loads user data from google when ready
    // it runs when isInitialized changes
    useEffect(() => {
        async function loadUserData() {
            if (isInitialized && currentUser && !usingLocalStorage) {
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
                    setError("Failed to load your data from Google Drive. Using local storage as fallback.");
                    setUsingLocalStorage(true);
                    loadFromLocalStorage();
                } finally {
                    setLoading(false);
                }
            }
        }

        loadUserData();
    }, [isInitialized, currentUser, usingLocalStorage]);

    // this updates the user profile - calls the drive API
    // and has a fallback to localStorage if that fails
    const updateUserProfile = async (newProfileData) => {
        try {
            setLoading(true);
            const updatedProfile = { ...userProfile, ...newProfileData };

            if (usingLocalStorage) {
                // Save to local storage
                const success = saveToLocalStorage(LS_USER_PROFILE, updatedProfile);
                if (success) {
                    setUserProfile(updatedProfile);
                    return true;
                } else {
                    setError("Failed to save profile to local storage.");
                    return false;
                }
            } else {
                // Save to Google Drive
                await saveUserProfile(updatedProfile);
                setUserProfile(updatedProfile);
                return true;
            }
        } catch (err) {
            console.error("Error updating user profile:", err);
            setError("Failed to save profile. Trying local storage...");

            // Fallback to local storage
            const success = saveToLocalStorage(LS_USER_PROFILE, { ...userProfile, ...newProfileData });
            if (success) {
                setUserProfile({ ...userProfile, ...newProfileData });
                setUsingLocalStorage(true);
                return true;
            } else {
                setError("Failed to save profile to local storage.");
                return false;
            }
        } finally {
            setLoading(false);
        }
    };

    // this updates period data - works like updateUserProfile
    // with the same fallback system
    const updatePeriodData = async (newPeriodData) => {
        try {
            setLoading(true);
            const updatedPeriodData = { ...periodData, ...newPeriodData };

            if (usingLocalStorage) {
                const success = saveToLocalStorage(LS_PERIOD_DATA, updatedPeriodData);
                if (success) {
                    setPeriodData(updatedPeriodData);
                    return true;
                } else {
                    setError("Failed to save period data to local storage.");
                    return false;
                }
            } else {
                await savePeriodData(updatedPeriodData);
                setPeriodData(updatedPeriodData);
                return true;
            }
        } catch (err) {
            console.error("Error updating period data:", err);
            setError("Failed to save period data. Using local storage.");

            // Fallback to local storage
            const success = saveToLocalStorage(LS_PERIOD_DATA, { ...periodData, ...newPeriodData });
            if (success) {
                setPeriodData({ ...periodData, ...newPeriodData });
                setUsingLocalStorage(true);
                return true;
            } else {
                setError("Failed to save period data to local storage.");
                return false;
            }
        } finally {
            setLoading(false);
        }
    };

    // this updates symptoms data
    // basically same as the other update functions
    const updateSymptomsData = async (newSymptomsData) => {
        try {
            setLoading(true);
            const updatedSymptomsData = { ...symptomsData, ...newSymptomsData };

            if (usingLocalStorage) {
                const success = saveToLocalStorage(LS_SYMPTOMS_DATA, updatedSymptomsData);
                if (success) {
                    setSymptomsData(updatedSymptomsData);
                    return true;
                } else {
                    setError("Failed to save symptoms data to local storage.");
                    return false;
                }
            } else {
                await saveSymptomsData(updatedSymptomsData);
                setSymptomsData(updatedSymptomsData);
                return true;
            }
        } catch (err) {
            console.error("Error updating symptoms data:", err);
            setError("Failed to save symptoms data. Using local storage.");

            // Fallback to local storage
            const success = saveToLocalStorage(LS_SYMPTOMS_DATA, { ...symptomsData, ...newSymptomsData });
            if (success) {
                setSymptomsData({ ...symptomsData, ...newSymptomsData });
                setUsingLocalStorage(true);
                return true;
            } else {
                setError("Failed to save symptoms data to local storage.");
                return false;
            }
        } finally {
            setLoading(false);
        }
    };

    // this updates notes data
    // also same as the other update functions
    const updateNotesData = async (newNotesData) => {
        try {
            setLoading(true);
            const updatedNotesData = { ...notesData, ...newNotesData };

            if (usingLocalStorage) {
                const success = saveToLocalStorage(LS_NOTES_DATA, updatedNotesData);
                if (success) {
                    setNotesData(updatedNotesData);
                    return true;
                } else {
                    setError("Failed to save notes data to local storage.");
                    return false;
                }
            } else {
                await saveNotesData(updatedNotesData);
                setNotesData(updatedNotesData);
                return true;
            }
        } catch (err) {
            console.error("Error updating notes data:", err);
            setError("Failed to save notes data. Using local storage.");

            // Fallback to local storage
            const success = saveToLocalStorage(LS_NOTES_DATA, { ...notesData, ...newNotesData });
            if (success) {
                setNotesData({ ...notesData, ...newNotesData });
                setUsingLocalStorage(true);
                return true;
            } else {
                setError("Failed to save notes data to local storage.");
                return false;
            }
        } finally {
            setLoading(false);
        }
    };

    // this exports all user data in one big file
    // either from google drive or locally
    const exportUserData = async () => {
        if (usingLocalStorage) {
            try {
                const allData = {
                    profile: userProfile || {},
                    periodData: periodData || {},
                    symptomsData: symptomsData || {},
                    notesData: notesData || {},
                    exportDate: new Date().toISOString()
                };

                // Create a downloadable file
                const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);

                // Create and click a download link
                const a = document.createElement('a');
                a.href = url;
                a.download = `flowsync_export_${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();

                // Clean up
                setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 100);

                return true;
            } catch (err) {
                console.error("Error exporting data locally:", err);
                setError("Failed to export data.");
                return false;
            }
        } else {
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
        }
    };

    // this deletes all user data 
    // be super careful with this one!!
    const deleteUserData = async () => {
        try {
            setLoading(true);

            if (usingLocalStorage) {
                localStorage.removeItem(LS_USER_PROFILE);
                localStorage.removeItem(LS_PERIOD_DATA);
                localStorage.removeItem(LS_SYMPTOMS_DATA);
                localStorage.removeItem(LS_NOTES_DATA);
            } else {
                await deleteAllData();
            }

            // Clear state
            setUserProfile(null);
            setPeriodData(null);
            setSymptomsData(null);
            setNotesData(null);
            return true;
        } catch (err) {
            console.error("Error deleting user data:", err);
            setError("Failed to delete all data.");
            return false;
        } finally {
            setLoading(false);
        }
    };

    // this clears any error messages
    // simple but useful!!
    const clearError = () => {
        setError(null);
    };

    // this is the value we provide to components
    // it has all the data and functions they need
    const value = {
        isInitialized,
        usingLocalStorage,
        loading,
        error,
        clearError,
        isGoogleUser,

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
