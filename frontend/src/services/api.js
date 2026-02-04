/**
 * API Service for FlowSync Backend
 * Handles all HTTP requests to the backend server
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const ACCESS_TOKEN_KEY = 'flowsync_access_token';
const REFRESH_TOKEN_KEY = 'flowsync_refresh_token';

/**
 * Get stored access token
 */
export const getAccessToken = () => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * Get stored refresh token
 */
export const getRefreshToken = () => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Store tokens in localStorage
 */
export const setTokens = (accessToken, refreshToken) => {
    if (accessToken) {
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    }
    if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
};

/**
 * Clear stored tokens
 */
export const clearTokens = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
    return !!getAccessToken();
};

/**
 * Make authenticated API request
 */
const apiRequest = async (endpoint, options = {}) => {
    const token = getAccessToken();

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers,
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401 && data.message === 'Token expired') {
                const refreshed = await refreshAccessToken();
                if (refreshed) {
                    headers['Authorization'] = `Bearer ${getAccessToken()}`;
                    const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
                        ...config,
                        headers,
                    });
                    return retryResponse.json();
                }
            }
            throw new Error(data.message || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error('API request error:', error);
        throw error;
    }
};

/**
 * Refresh access token using refresh token
 */
const refreshAccessToken = async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
        clearTokens();
        return false;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
            setTokens(data.accessToken, data.refreshToken);
            return true;
        }

        clearTokens();
        return false;
    } catch (error) {
        console.error('Token refresh failed:', error);
        clearTokens();
        return false;
    }
};

/**
 * Register a new user
 */
export const register = async (userData) => {
    const response = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
    });

    if (response.success) {
        setTokens(response.data.accessToken, response.data.refreshToken);
    }

    return response;
};

/**
 * Login user with email and password
 */
export const login = async (email, password) => {
    const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });

    if (response.success) {
        setTokens(response.data.accessToken, response.data.refreshToken);
    }

    return response;
};

/**
 * Authenticate with Google
 */
export const googleAuth = async (userData) => {
    const response = await apiRequest('/auth/google', {
        method: 'POST',
        body: JSON.stringify(userData),
    });

    if (response.success) {
        setTokens(response.data.accessToken, response.data.refreshToken);
    }

    return response;
};

/**
 * Get current user profile
 */
export const getCurrentUser = async () => {
    return apiRequest('/auth/me');
};

/**
 * Update user profile
 */
export const updateProfile = async (profileData) => {
    return apiRequest('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
    });
};

/**
 * Update user password
 */
export const updatePassword = async (currentPassword, newPassword) => {
    return apiRequest('/auth/password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
    });
};

/**
 * Logout user
 */
export const logout = async () => {
    try {
        await apiRequest('/auth/logout', { method: 'POST' });
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        clearTokens();
    }
};

// =====================
// Period Tracking API
// =====================

/**
 * Get all period logs
 */
export const getPeriods = async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/periods?${queryString}` : '/periods';
    return apiRequest(endpoint);
};

/**
 * Get period by ID
 */
export const getPeriodById = async (id) => {
    return apiRequest(`/periods/${id}`);
};

/**
 * Create a new period log
 */
export const createPeriod = async (periodData) => {
    return apiRequest('/periods', {
        method: 'POST',
        body: JSON.stringify(periodData),
    });
};

/**
 * Update a period log
 */
export const updatePeriod = async (id, periodData) => {
    return apiRequest(`/periods/${id}`, {
        method: 'PUT',
        body: JSON.stringify(periodData),
    });
};

/**
 * Delete a period log
 */
export const deletePeriod = async (id) => {
    return apiRequest(`/periods/${id}`, {
        method: 'DELETE',
    });
};

/**
 * Get period statistics
 */
export const getPeriodStats = async () => {
    return apiRequest('/periods/stats');
};

/**
 * Get period predictions
 */
export const getPeriodPredictions = async () => {
    return apiRequest('/periods/predictions');
};

// =====================
// Symptom Tracking API
// =====================

/**
 * Get all symptom logs
 */
export const getSymptoms = async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/symptoms?${queryString}` : '/symptoms';
    return apiRequest(endpoint);
};

/**
 * Get symptom by ID
 */
export const getSymptomById = async (id) => {
    return apiRequest(`/symptoms/${id}`);
};

/**
 * Create a new symptom log
 */
export const createSymptom = async (symptomData) => {
    return apiRequest('/symptoms', {
        method: 'POST',
        body: JSON.stringify(symptomData),
    });
};

/**
 * Update a symptom log
 */
export const updateSymptom = async (id, symptomData) => {
    return apiRequest(`/symptoms/${id}`, {
        method: 'PUT',
        body: JSON.stringify(symptomData),
    });
};

/**
 * Delete a symptom log
 */
export const deleteSymptom = async (id) => {
    return apiRequest(`/symptoms/${id}`, {
        method: 'DELETE',
    });
};

/**
 * Get symptom analytics
 */
export const getSymptomAnalytics = async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/symptoms/analytics?${queryString}` : '/symptoms/analytics';
    return apiRequest(endpoint);
};

// =====================
// Mood Tracking API
// =====================

/**
 * Get all mood logs
 */
export const getMoods = async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/moods?${queryString}` : '/moods';
    return apiRequest(endpoint);
};

/**
 * Get mood by ID
 */
export const getMoodById = async (id) => {
    return apiRequest(`/moods/${id}`);
};

/**
 * Create a new mood log
 */
export const createMood = async (moodData) => {
    return apiRequest('/moods', {
        method: 'POST',
        body: JSON.stringify(moodData),
    });
};

/**
 * Update a mood log
 */
export const updateMood = async (id, moodData) => {
    return apiRequest(`/moods/${id}`, {
        method: 'PUT',
        body: JSON.stringify(moodData),
    });
};

/**
 * Delete a mood log
 */
export const deleteMood = async (id) => {
    return apiRequest(`/moods/${id}`, {
        method: 'DELETE',
    });
};

/**
 * Get mood analytics
 */
export const getMoodAnalytics = async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/moods/analytics?${queryString}` : '/moods/analytics';
    return apiRequest(endpoint);
};

// =====================
// Health Tracking API
// =====================

/**
 * Get all health logs
 */
export const getHealthLogs = async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/health?${queryString}` : '/health';
    return apiRequest(endpoint);
};

/**
 * Get health log by ID
 */
export const getHealthLogById = async (id) => {
    return apiRequest(`/health/${id}`);
};

/**
 * Create a new health log
 */
export const createHealthLog = async (healthData) => {
    return apiRequest('/health', {
        method: 'POST',
        body: JSON.stringify(healthData),
    });
};

/**
 * Update a health log
 */
export const updateHealthLog = async (id, healthData) => {
    return apiRequest(`/health/${id}`, {
        method: 'PUT',
        body: JSON.stringify(healthData),
    });
};

/**
 * Delete a health log
 */
export const deleteHealthLog = async (id) => {
    return apiRequest(`/health/${id}`, {
        method: 'DELETE',
    });
};

/**
 * Get health analytics
 */
export const getHealthAnalytics = async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/health/analytics?${queryString}` : '/health/analytics';
    return apiRequest(endpoint);
};

// =====================
// Data Export API
// =====================

/**
 * Export all user data
 */
export const exportAllData = async () => {
    const [periods, symptoms, moods, health, profile] = await Promise.all([
        getPeriods(),
        getSymptoms(),
        getMoods(),
        getHealthLogs(),
        getCurrentUser(),
    ]);

    return {
        profile: profile.data,
        periods: periods.data,
        symptoms: symptoms.data,
        moods: moods.data,
        health: health.data,
        exportDate: new Date().toISOString(),
    };
};

export default {
    // Auth
    register,
    login,
    googleAuth,
    getCurrentUser,
    updateProfile,
    updatePassword,
    logout,
    isAuthenticated,
    getAccessToken,
    setTokens,
    clearTokens,

    // Periods
    getPeriods,
    getPeriodById,
    createPeriod,
    updatePeriod,
    deletePeriod,
    getPeriodStats,
    getPeriodPredictions,

    // Symptoms
    getSymptoms,
    getSymptomById,
    createSymptom,
    updateSymptom,
    deleteSymptom,
    getSymptomAnalytics,

    // Moods
    getMoods,
    getMoodById,
    createMood,
    updateMood,
    deleteMood,
    getMoodAnalytics,

    // Health
    getHealthLogs,
    getHealthLogById,
    createHealthLog,
    updateHealthLog,
    deleteHealthLog,
    getHealthAnalytics,

    // Export
    exportAllData,
};
