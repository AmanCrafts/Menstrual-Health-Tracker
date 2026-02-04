import { useState, useEffect, createContext, useCallback } from 'react';
import * as api from '../services/api';

export const AuthContext = createContext();

// Google OAuth Configuration
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);

    /**
     * Load Google OAuth script
     */
    useEffect(() => {
        // Check if script already exists
        if (document.getElementById('google-oauth-script')) {
            setGoogleScriptLoaded(true);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.id = 'google-oauth-script';
        script.async = true;
        script.defer = true;
        script.onload = () => {
            setGoogleScriptLoaded(true);
            console.log('Google OAuth script loaded');
        };
        script.onerror = () => {
            console.error('Failed to load Google OAuth script');
        };
        document.body.appendChild(script);

        return () => {
            // Cleanup is optional - script can persist
        };
    }, []);

    /**
     * Register a new user with email and password
     */
    const signup = async (email, password, displayName) => {
        try {
            setError(null);
            const response = await api.register({ email, password, displayName });

            if (response.success) {
                setCurrentUser(response.data.user);
                return response;
            } else {
                throw new Error(response.message || 'Registration failed');
            }
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    /**
     * Login with email and password
     */
    const login = async (email, password) => {
        try {
            setError(null);
            const response = await api.login(email, password);

            if (response.success) {
                setCurrentUser(response.data.user);
                return response;
            } else {
                throw new Error(response.message || 'Login failed');
            }
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    /**
     * Sign in with Google OAuth (without Firebase)
     * Uses Google Identity Services (GIS) library
     */
    const signInWithGoogle = () => {
        return new Promise((resolve, reject) => {
            if (!googleScriptLoaded || !window.google) {
                reject(new Error('Google OAuth not loaded. Please try again.'));
                return;
            }

            if (!GOOGLE_CLIENT_ID) {
                reject(new Error('Google Client ID not configured'));
                return;
            }

            setError(null);

            try {
                const client = window.google.accounts.oauth2.initTokenClient({
                    client_id: GOOGLE_CLIENT_ID,
                    scope: 'email profile openid',
                    callback: async (tokenResponse) => {
                        if (tokenResponse.error) {
                            setError(tokenResponse.error);
                            reject(new Error(tokenResponse.error));
                            return;
                        }

                        try {
                            // Get user info from Google using the access token
                            const userInfoResponse = await fetch(
                                'https://www.googleapis.com/oauth2/v3/userinfo',
                                {
                                    headers: {
                                        Authorization: `Bearer ${tokenResponse.access_token}`,
                                    },
                                }
                            );

                            if (!userInfoResponse.ok) {
                                throw new Error('Failed to get user info from Google');
                            }

                            const userInfo = await userInfoResponse.json();
                            console.log('Google user info:', userInfo);

                            // Authenticate with our backend
                            const response = await api.googleAuth({
                                googleId: userInfo.sub,
                                email: userInfo.email,
                                displayName: userInfo.name,
                                photoURL: userInfo.picture,
                                accessToken: tokenResponse.access_token,
                            });

                            if (response.success) {
                                setCurrentUser(response.data.user);
                                console.log('Backend authentication successful');
                                resolve(response);
                            } else {
                                throw new Error(
                                    response.message || 'Backend authentication failed'
                                );
                            }
                        } catch (err) {
                            console.error('Google auth error:', err);
                            setError(err.message);
                            reject(err);
                        }
                    },
                });

                // Request access token
                client.requestAccessToken();
            } catch (err) {
                console.error('Google OAuth initialization error:', err);
                setError(err.message);
                reject(err);
            }
        });
    };

    /**
     * Logout user
     */
    const logout = async () => {
        try {
            setError(null);
            await api.logout();
            setCurrentUser(null);

            // Revoke Google token if available
            if (window.google?.accounts) {
                try {
                    window.google.accounts.id.disableAutoSelect();
                } catch (e) {
                    console.log('Google logout (non-critical):', e);
                }
            }
        } catch (err) {
            console.error('Logout error:', err);
            // Still clear local state even if API call fails
            setCurrentUser(null);
            api.clearTokens();
        }
    };

    /**
     * Update user profile
     */
    const updateUserProfile = async (profileData) => {
        try {
            setError(null);
            const response = await api.updateProfile(profileData);

            if (response.success) {
                setCurrentUser(response.data);
                return response;
            } else {
                throw new Error(response.message || 'Profile update failed');
            }
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    /**
     * Update user password
     */
    const updatePassword = async (currentPassword, newPassword) => {
        try {
            setError(null);
            const response = await api.updatePassword(currentPassword, newPassword);

            if (response.success) {
                return response;
            } else {
                throw new Error(response.message || 'Password update failed');
            }
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    /**
     * Fetch current user from backend using stored token
     */
    const fetchCurrentUser = useCallback(async () => {
        if (!api.isAuthenticated()) {
            setCurrentUser(null);
            setLoading(false);
            return;
        }

        try {
            const response = await api.getCurrentUser();
            if (response.success) {
                setCurrentUser(response.data);
            } else {
                // Token might be invalid, clear it
                api.clearTokens();
                setCurrentUser(null);
            }
        } catch (err) {
            console.error('Failed to fetch current user:', err);
            api.clearTokens();
            setCurrentUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Clear any authentication errors
     */
    const clearError = () => {
        setError(null);
    };

    // Check for existing session on mount
    useEffect(() => {
        fetchCurrentUser();
    }, [fetchCurrentUser]);

    const value = {
        currentUser,
        loading,
        error,
        clearError,
        login,
        signup,
        signInWithGoogle,
        logout,
        updateUserProfile,
        updatePassword,
        isAuthenticated: api.isAuthenticated,
        refreshUser: fetchCurrentUser,
        googleScriptLoaded,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
