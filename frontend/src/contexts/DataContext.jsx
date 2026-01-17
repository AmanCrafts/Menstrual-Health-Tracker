import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import * as api from '../services/api';
import { getTestUserData } from '../utils/testData';

const DEVELOPER_EMAIL = 'theamanmalikarts@gmail.com';
export const DataContext = createContext();

// Constants for local storage keys (used as fallback)
const LS_TEST_MODE = 'flowsync_test_mode';
const LS_TEST_USER = 'flowsync_test_user';

export function useData() {
    return useContext(DataContext);
}

export function DataProvider({ children }) {
    const { currentUser, isAuthenticated } = useAuth();

    // Data states
    const [periodData, setPeriodData] = useState([]);
    const [symptomsData, setSymptomsData] = useState([]);
    const [moodsData, setMoodsData] = useState([]);
    const [healthData, setHealthData] = useState([]);
    const [predictions, setPredictions] = useState(null);

    // UI states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Check if current user is developer
    const isDeveloper = currentUser && currentUser.email === DEVELOPER_EMAIL;

    // Test mode state - only available for developer
    const [testMode, setTestMode] = useState(() => {
        try {
            const saved = localStorage.getItem(LS_TEST_MODE);
            return saved === 'true';
        } catch {
            return false;
        }
    });

    const [testUser, setTestUser] = useState(() => {
        try {
            return localStorage.getItem(LS_TEST_USER) || 'user1';
        } catch {
            return 'user1';
        }
    });

    // Ensure test mode is disabled for non-developers
    useEffect(() => {
        if (!isDeveloper && testMode) {
            setTestMode(false);
        }
    }, [isDeveloper, testMode]);

    // Save test mode preferences
    useEffect(() => {
        if (isDeveloper) {
            localStorage.setItem(LS_TEST_MODE, testMode);
        }
    }, [testMode, isDeveloper]);

    // Load test data - authenticate as test user and fetch their real backend data
    const loadTestData = useCallback(async () => {
        setLoading(true);
        try {
            const userData = getTestUserData(testUser);
            const testUserEmail = userData.userProfile.email;

            console.log('Switching to test user:', testUserEmail);

            // Store the developer's tokens temporarily
            const developerAccessToken = api.getAccessToken();
            const developerRefreshToken = api.getRefreshToken();

            // Login as test user (password is 'pass123' for all test users)
            const loginResponse = await api.login(testUserEmail, 'pass123');

            if (!loginResponse.success) {
                console.error('Test user login failed:', loginResponse);
                throw new Error('Failed to authenticate as test user');
            }

            console.log('Successfully authenticated as test user');

            // Now fetch real data from backend for this test user
            const [periodsRes, symptomsRes, moodsRes, healthRes, predictionsRes] = await Promise.all([
                api.getPeriods().catch(err => {
                    console.error('Error fetching periods:', err);
                    return { success: false, error: err };
                }),
                api.getSymptoms().catch(err => {
                    console.error('Error fetching symptoms:', err);
                    return { success: false, error: err };
                }),
                api.getMoods().catch(err => {
                    console.error('Error fetching moods:', err);
                    return { success: false, error: err };
                }),
                api.getHealthLogs().catch(err => {
                    console.error('Error fetching health logs:', err);
                    return { success: false, error: err };
                }),
                api.getPeriodPredictions().catch(err => {
                    console.error('Error fetching predictions:', err);
                    return { success: false, error: err };
                }),
            ]);

            if (periodsRes.success) setPeriodData(periodsRes.data || []);
            if (symptomsRes.success) setSymptomsData(symptomsRes.data || []);
            if (moodsRes.success) setMoodsData(moodsRes.data || []);
            if (healthRes.success) setHealthData(healthRes.data || []);
            if (predictionsRes.success) setPredictions(predictionsRes.data || null);

            console.log('Loaded data:', {
                periods: periodsRes.success ? periodsRes.data?.length : 0,
                symptoms: symptomsRes.success ? symptomsRes.data?.length : 0,
                moods: moodsRes.success ? moodsRes.data?.length : 0,
                health: healthRes.success ? healthRes.data?.length : 0
            });

            setError(null);
            setIsInitialized(true);

            // Restore developer tokens so they remain logged in
            if (developerAccessToken) {
                api.setTokens(developerAccessToken, developerRefreshToken);
            }

            console.log('Restored developer token');
        } catch (err) {
            console.error('Error loading test data:', err);
            setError('Failed to load test user data from backend: ' + err.message);
        } finally {
            setLoading(false);
        }
    }, [testUser]);

    // Load real data from backend
    const loadUserData = useCallback(async () => {
        if (!isAuthenticated()) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            // Load all data in parallel
            const [periodsRes, symptomsRes, moodsRes, healthRes, predictionsRes] = await Promise.all([
                api.getPeriods().catch(err => ({ success: false, error: err })),
                api.getSymptoms().catch(err => ({ success: false, error: err })),
                api.getMoods().catch(err => ({ success: false, error: err })),
                api.getHealthLogs().catch(err => ({ success: false, error: err })),
                api.getPeriodPredictions().catch(err => ({ success: false, error: err })),
            ]);

            if (periodsRes.success) setPeriodData(periodsRes.data || []);
            if (symptomsRes.success) setSymptomsData(symptomsRes.data || []);
            if (moodsRes.success) setMoodsData(moodsRes.data || []);
            if (healthRes.success) setHealthData(healthRes.data || []);
            if (predictionsRes.success) setPredictions(predictionsRes.data || null);

            setError(null);
            setIsInitialized(true);
            console.log('User data loaded from backend');
        } catch (err) {
            console.error('Error loading user data:', err);
            setError('Failed to load your data. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    // Initialize data based on test mode status
    useEffect(() => {
        if (testMode && isDeveloper) {
            loadTestData();
        } else if (currentUser) {
            loadUserData();
        } else {
            setLoading(false);
            setIsInitialized(false);
            // Clear data when user logs out
            setPeriodData([]);
            setSymptomsData([]);
            setMoodsData([]);
            setHealthData([]);
            setPredictions(null);
        }
    }, [currentUser, testMode, isDeveloper, loadTestData, loadUserData]);

    // Reload test data when test user changes
    useEffect(() => {
        if (testMode && isDeveloper) {
            localStorage.setItem(LS_TEST_USER, testUser);
            loadTestData();
        }
    }, [testUser, testMode, isDeveloper, loadTestData]);

    // =====================
    // Period Data Functions
    // =====================

    const addPeriodLog = async (periodLog) => {
        if (testMode) {
            // In test mode, prevent modifications - it's read-only
            setError('Cannot modify data in test mode. This is read-only.');
            setTimeout(() => setError(null), 3000);
            return false;
        }

        try {
            setLoading(true);
            const response = await api.createPeriod(periodLog);
            if (response.success) {
                setPeriodData(prev => [...prev, response.data]);
                // Refresh predictions after adding period
                const predictionsRes = await api.getPeriodPredictions();
                if (predictionsRes.success) setPredictions(predictionsRes.data);
                return true;
            }
            throw new Error(response.message);
        } catch (err) {
            setError(err.message || 'Failed to save period log');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const updatePeriodLog = async (id, updates) => {
        if (testMode) {
            // In test mode, prevent modifications - it's read-only
            setError('Cannot modify data in test mode. This is read-only.');
            setTimeout(() => setError(null), 3000);
            return false;
        }

        try {
            setLoading(true);
            const response = await api.updatePeriod(id, updates);
            if (response.success) {
                setPeriodData(prev => prev.map(p => p._id === id ? response.data : p));
                return true;
            }
            throw new Error(response.message);
        } catch (err) {
            setError(err.message || 'Failed to update period log');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const deletePeriodLog = async (id) => {
        if (testMode) {
            setError('Cannot modify data in test mode. This is read-only.');
            setTimeout(() => setError(null), 3000);
            return false;
        }

        try {
            setLoading(true);
            const response = await api.deletePeriod(id);
            if (response.success) {
                setPeriodData(prev => prev.filter(p => p._id !== id));
                return true;
            }
            throw new Error(response.message);
        } catch (err) {
            setError(err.message || 'Failed to delete period log');
            return false;
        } finally {
            setLoading(false);
        }
    };

    // =====================
    // Symptom Data Functions
    // =====================

    const addSymptomLog = async (symptomLog) => {
        if (testMode) {
            setError('Cannot modify data in test mode. This is read-only.');
            setTimeout(() => setError(null), 3000);
            return false;
        }

        try {
            setLoading(true);
            const response = await api.createSymptom(symptomLog);
            if (response.success) {
                setSymptomsData(prev => [...prev, response.data]);
                return true;
            }
            throw new Error(response.message);
        } catch (err) {
            setError(err.message || 'Failed to save symptom log');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const updateSymptomLog = async (id, updates) => {
        if (testMode) {
            setError('Cannot modify data in test mode. This is read-only.');
            setTimeout(() => setError(null), 3000);
            return false;
        }

        try {
            setLoading(true);
            const response = await api.updateSymptom(id, updates);
            if (response.success) {
                setSymptomsData(prev => prev.map(s => s._id === id ? response.data : s));
                return true;
            }
            throw new Error(response.message);
        } catch (err) {
            setError(err.message || 'Failed to update symptom log');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const deleteSymptomLog = async (id) => {
        if (testMode) {
            setError('Cannot modify data in test mode. This is read-only.');
            setTimeout(() => setError(null), 3000);
            return false;
        }

        try {
            setLoading(true);
            const response = await api.deleteSymptom(id);
            if (response.success) {
                setSymptomsData(prev => prev.filter(s => s._id !== id));
                return true;
            }
            throw new Error(response.message);
        } catch (err) {
            setError(err.message || 'Failed to delete symptom log');
            return false;
        } finally {
            setLoading(false);
        }
    };

    // =====================
    // Mood Data Functions
    // =====================

    const addMoodLog = async (moodLog) => {
        if (testMode) {
            setError('Cannot modify data in test mode. This is read-only.');
            setTimeout(() => setError(null), 3000);
            return false;
        }

        try {
            setLoading(true);
            const response = await api.createMood(moodLog);
            if (response.success) {
                setMoodsData(prev => [...prev, response.data]);
                return true;
            }
            throw new Error(response.message);
        } catch (err) {
            setError(err.message || 'Failed to save mood log');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const updateMoodLog = async (id, updates) => {
        if (testMode) {
            setError('Cannot modify data in test mode. This is read-only.');
            setTimeout(() => setError(null), 3000);
            return false;
        }

        try {
            setLoading(true);
            const response = await api.updateMood(id, updates);
            if (response.success) {
                setMoodsData(prev => prev.map(m => m._id === id ? response.data : m));
                return true;
            }
            throw new Error(response.message);
        } catch (err) {
            setError(err.message || 'Failed to update mood log');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const deleteMoodLog = async (id) => {
        if (testMode) {
            setError('Cannot modify data in test mode. This is read-only.');
            setTimeout(() => setError(null), 3000);
            return false;
        }

        try {
            setLoading(true);
            const response = await api.deleteMood(id);
            if (response.success) {
                setMoodsData(prev => prev.filter(m => m._id !== id));
                return true;
            }
            throw new Error(response.message);
        } catch (err) {
            setError(err.message || 'Failed to delete mood log');
            return false;
        } finally {
            setLoading(false);
        }
    };

    // =====================
    // Health Data Functions
    // =====================

    const addHealthLog = async (healthLog) => {
        if (testMode) {
            setError('Cannot modify data in test mode. This is read-only.');
            setTimeout(() => setError(null), 3000);
            return false;
        }

        try {
            setLoading(true);
            const response = await api.createHealthLog(healthLog);
            if (response.success) {
                setHealthData(prev => [...prev, response.data]);
                return true;
            }
            throw new Error(response.message);
        } catch (err) {
            setError(err.message || 'Failed to save health log');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const updateHealthLog = async (id, updates) => {
        if (testMode) {
            setError('Cannot modify data in test mode. This is read-only.');
            setTimeout(() => setError(null), 3000);
            return false;
        }

        try {
            setLoading(true);
            const response = await api.updateHealthLog(id, updates);
            if (response.success) {
                setHealthData(prev => prev.map(h => h._id === id ? response.data : h));
                return true;
            }
            throw new Error(response.message);
        } catch (err) {
            setError(err.message || 'Failed to update health log');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const deleteHealthLog = async (id) => {
        if (testMode) {
            setError('Cannot modify data in test mode. This is read-only.');
            setTimeout(() => setError(null), 3000);
            return false;
        }

        try {
            setLoading(true);
            const response = await api.deleteHealthLog(id);
            if (response.success) {
                setHealthData(prev => prev.filter(h => h._id !== id));
                return true;
            }
            throw new Error(response.message);
        } catch (err) {
            setError(err.message || 'Failed to delete health log');
            return false;
        } finally {
            setLoading(false);
        }
    };

    // =====================
    // Export & Utility Functions
    // =====================

    const exportUserData = async () => {
        try {
            const allData = await api.exportAllData();

            const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `flowsync_export_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();

            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);

            return true;
        } catch (err) {
            console.error("Error exporting data:", err);
            setError("Failed to export data.");
            return false;
        }
    };

    const refreshData = async () => {
        if (testMode && isDeveloper) {
            loadTestData();
        } else {
            await loadUserData();
        }
    };

    const clearError = () => {
        setError(null);
    };

    // Computed values
    const lastPeriod = periodData.length > 0
        ? periodData.reduce((latest, p) => new Date(p.startDate) > new Date(latest.startDate) ? p : latest)
        : null;

    const value = {
        // State
        isInitialized,
        loading,
        error,
        clearError,

        // Test mode controls - only truly enabled for developer
        testMode: isDeveloper && testMode,
        setTestMode: isDeveloper ? setTestMode : () => { },
        testUser,
        setTestUser,

        // Period data
        periodData,
        lastPeriod,
        predictions,
        addPeriodLog,
        updatePeriodLog,
        deletePeriodLog,

        // Symptom data
        symptomsData,
        addSymptomLog,
        updateSymptomLog,
        deleteSymptomLog,

        // Mood data
        moodsData,
        addMoodLog,
        updateMoodLog,
        deleteMoodLog,

        // Health data
        healthData,
        addHealthLog,
        updateHealthLog,
        deleteHealthLog,

        // Utility functions
        exportUserData,
        refreshData,

        // Legacy compatibility (for existing components)
        userProfile: currentUser,
        updateUserProfile: async () => { }, // Handled by AuthContext now
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
}
