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
import { getTestUserData } from '../utils/testData';

// Add this constant at the top of the file, after the imports
const DEVELOPER_EMAIL = 'theamanmalikarts@gmail.com';

// this is the context thingy that makes data available everywhere
export const DataContext = createContext();

// these are for saving stuff if google drive doesn't work
// they store things in the browser I think
const LS_USER_PROFILE = 'flowsync_user_profile';
const LS_PERIOD_DATA = 'flowsync_period_data';
const LS_SYMPTOMS_DATA = 'flowsync_symptoms_data';
const LS_NOTES_DATA = 'flowsync_notes_data';
const LS_TEST_MODE = 'flowsync_test_mode';
const LS_TEST_USER = 'flowsync_test_user';

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

    // Check if current user is developer
    const isDeveloper = currentUser && currentUser.email === DEVELOPER_EMAIL;

    // Test mode state - only available for developer
    const [testMode, setTestMode] = useState(() => {
        // Only load test mode preference for developer
        return isDeveloper && getFromLocalStorage(LS_TEST_MODE) || false;
    });

    const [testUser, setTestUser] = useState(() => getFromLocalStorage(LS_TEST_USER) || 'user1');

    // Ensure test mode is disabled for non-developers
    useEffect(() => {
        if (!isDeveloper && testMode) {
            setTestMode(false);
        }
    }, [isDeveloper, testMode]);

    // Save test mode preferences - only for developer
    useEffect(() => {
        if (isDeveloper) {
            saveToLocalStorage(LS_TEST_MODE, testMode);
        }
    }, [testMode, isDeveloper]);

    // this runs when the component first loads or test mode changes
    // it starts the google drive connection
    useEffect(() => {
        if (testMode) {
            // Load test data instead of real data
            loadTestData();
        } else {
            initializeWithRealData();
        }
    }, [currentUser, googleAuthToken, testMode]);

    // When test user changes, reload test data
    useEffect(() => {
        if (testMode) {
            loadTestData();
        }
    }, [testUser, testMode]);

    // Load test data for the selected test user
    const loadTestData = () => {
        setLoading(true);
        try {
            const userData = getTestUserData(testUser);

            setUserProfile(userData.userProfile);
            setPeriodData(userData.periodData);
            setSymptomsData(userData.symptomsData);
            setNotesData(userData.notesData);

            setError(null);
            setLoading(false);
            console.log('Test data loaded for user:', testUser);
        } catch (err) {
            console.error('Error loading test data:', err);
            setError('Failed to load test data');
            setLoading(false);
        }
    };

    // Initialize with real user data (Google Drive or local storage)
    const initializeWithRealData = async () => {
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
        } else {
            setLoading(false);
        }
    };

    // ... [Existing code for initializing Google Drive, loading data, etc.]
    // Helper function to check if user is signed in with Google
    const isGoogleUser = () => {
        return currentUser &&
            currentUser.providerData &&
            currentUser.providerData.some(provider => provider.providerId === 'google.com');
    };

    // Initialize Google Drive when token is available
    useEffect(() => {
        async function connectGoogleDrive() {
            if (currentUser && googleAuthToken && !isInitialized && !testMode) {
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

        if (currentUser && googleAuthToken && !testMode) {
            connectGoogleDrive();
        }
    }, [currentUser, googleAuthToken, isInitialized, testMode]);

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
            if (isInitialized && currentUser && !usingLocalStorage && !testMode) {
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

        if (!testMode) {
            loadUserData();
        }
    }, [isInitialized, currentUser, usingLocalStorage, testMode]);

    // ... existing data update functions (updateUserProfile, updatePeriodData, etc.) ...

    // Modify the updateUserProfile to handle test mode
    const updateUserProfile = async (newProfileData) => {
        try {
            setLoading(true);
            const updatedProfile = { ...userProfile, ...newProfileData };

            if (testMode) {
                // In test mode, just update the state without persistence
                setUserProfile(updatedProfile);
                return true;
            } else if (usingLocalStorage) {
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

    // Modify the updatePeriodData to handle test mode
    const updatePeriodData = async (newPeriodData) => {
        try {
            setLoading(true);
            const updatedPeriodData = { ...periodData, ...newPeriodData };

            if (testMode) {
                // In test mode, just update the state without persistence
                setPeriodData(updatedPeriodData);
                return true;
            } else if (usingLocalStorage) {
                // ...existing localStorage code...
                const success = saveToLocalStorage(LS_PERIOD_DATA, updatedPeriodData);
                if (success) {
                    setPeriodData(updatedPeriodData);
                    return true;
                } else {
                    setError("Failed to save period data to local storage.");
                    return false;
                }
            } else {
                // ...existing Google Drive code...
                await savePeriodData(updatedPeriodData);
                setPeriodData(updatedPeriodData);
                return true;
            }
        } catch (err) {
            // ...existing error handling...
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

    // Modify the updateSymptomsData to handle test mode
    const updateSymptomsData = async (newSymptomsData) => {
        try {
            setLoading(true);
            const updatedSymptomsData = { ...symptomsData, ...newSymptomsData };

            if (testMode) {
                // In test mode, just update the state without persistence
                setSymptomsData(updatedSymptomsData);
                return true;
            } else if (usingLocalStorage) {
                // ...existing localStorage code...
                const success = saveToLocalStorage(LS_SYMPTOMS_DATA, updatedSymptomsData);
                if (success) {
                    setSymptomsData(updatedSymptomsData);
                    return true;
                } else {
                    setError("Failed to save symptoms data to local storage.");
                    return false;
                }
            } else {
                // ...existing Google Drive code...
                await saveSymptomsData(updatedSymptomsData);
                setSymptomsData(updatedSymptomsData);
                return true;
            }
        } catch (err) {
            // ...existing error handling...
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

    // Modify the updateNotesData to handle test mode
    const updateNotesData = async (newNotesData) => {
        try {
            setLoading(true);
            const updatedNotesData = { ...notesData, ...newNotesData };

            if (testMode) {
                // In test mode, just update the state without persistence
                setNotesData(updatedNotesData);
                return true;
            } else if (usingLocalStorage) {
                // ...existing localStorage code...
                const success = saveToLocalStorage(LS_NOTES_DATA, updatedNotesData);
                if (success) {
                    setNotesData(updatedNotesData);
                    return true;
                } else {
                    setError("Failed to save notes data to local storage.");
                    return false;
                }
            } else {
                // ...existing Google Drive code...
                await saveNotesData(updatedNotesData);
                setNotesData(updatedNotesData);
                return true;
            }
        } catch (err) {
            // ...existing error handling...
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

    // ...existing exportUserData and deleteUserData functions...

    // this exports all user data in one big file
    // either from google drive or locally
    const exportUserData = async () => {
        if (testMode) {
            // In test mode, just return the current data without exporting
            const allData = {
                profile: userProfile || {},
                periodData: periodData || {},
                symptomsData: symptomsData || {},
                notesData: notesData || {},
                exportDate: new Date().toISOString(),
                isTestData: true,
                testUser: testUser
            };

            // Create a downloadable file
            const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            // Create and click a download link
            const a = document.createElement('a');
            a.href = url;
            a.download = `flowsync_test_export_${testUser}_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();

            // Clean up
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);

            return true;
        } else if (usingLocalStorage) {
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
    const deleteUserData = async () => {
        if (testMode) {
            // In test mode, just reset to the original test data
            loadTestData();
            return true;
        }

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
    const clearError = () => {
        setError(null);
    };

    // this is the value we provide to components
    const value = {
        isInitialized,
        usingLocalStorage,
        loading,
        error,
        clearError,
        isGoogleUser,

        // Test mode controls - only truly enabled for developer
        testMode: isDeveloper && testMode,
        setTestMode: isDeveloper ? setTestMode : () => { },
        testUser,
        setTestUser,

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
