import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/useAuth.jsx';
import { useData } from '../contexts/DataContext.jsx';
import { useNavigate } from 'react-router-dom';
import Alert from '../components/Alert.jsx';
import '../styles/profile.css';

export default function Profile() {
    // Auth context for user info and profile updates
    const { currentUser, logout, updateUserProfile, updatePassword } = useAuth();
    const { loading: dataLoading, error: dataError, exportUserData, clearError } = useData();

    // Form state variables
    const [displayName, setDisplayName] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [cycleLength, setCycleLength] = useState('28');
    const [periodLength, setPeriodLength] = useState('5');
    const [lastPeriod, setLastPeriod] = useState('');
    const [height, setHeight] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Password change state
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const navigate = useNavigate();

    // Redirect if not logged in
    useEffect(() => {
        if (!currentUser) {
            navigate('/signin');
            return;
        }

        // Fill form with existing profile data
        setDisplayName(currentUser.displayName || '');
        setBirthDate(currentUser.birthDate || '');
        setCycleLength(currentUser.cycleLength?.toString() || '28');
        setPeriodLength(currentUser.periodLength?.toString() || '5');
        setLastPeriod(currentUser.lastPeriod || '');
        setHeight(currentUser.height?.toString() || '');
    }, [currentUser, navigate]);

    // Handle profile save
    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setErrorMessage('');

        const updatedProfile = {
            displayName,
            birthDate: birthDate || undefined,
            cycleLength: parseInt(cycleLength, 10),
            periodLength: parseInt(periodLength, 10),
            lastPeriod: lastPeriod || undefined,
            height: height ? parseFloat(height) : undefined
        };

        try {
            await updateUserProfile(updatedProfile);
            setSuccessMessage('Profile updated successfully!');
            setIsEditing(false);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setErrorMessage(err.message || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    // Handle password change
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (newPassword !== confirmPassword) {
            setErrorMessage('New passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setErrorMessage('Password must be at least 6 characters');
            return;
        }

        setIsSaving(true);

        try {
            await updatePassword(currentPassword, newPassword);
            setSuccessMessage('Password changed successfully!');
            setShowPasswordChange(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setErrorMessage(err.message || 'Failed to change password');
        } finally {
            setIsSaving(false);
        }
    };

    // Handle data export
    const handleExportData = async () => {
        try {
            setIsSaving(true);
            await exportUserData();
            setSuccessMessage('Data exported successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setErrorMessage('Failed to export data');
        } finally {
            setIsSaving(false);
        }
    };

    // Handle logout
    const handleLogout = async () => {
        try {
            await logout();
            navigate('/signin');
        } catch (error) {
            console.error("Failed to log out:", error);
        }
    };

    // Check if user is using Google auth (no password)
    const isGoogleUser = currentUser?.googleId && !currentUser?.password;

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1>My Profile</h1>
                <button className="logout-button" onClick={handleLogout}>Logout</button>
            </div>

            {(dataError || errorMessage) && (
                <div className="error-card">
                    <Alert type="error" message={dataError || errorMessage} onClose={() => {
                        clearError();
                        setErrorMessage('');
                    }} />
                </div>
            )}
            {successMessage && <Alert type="success" message={successMessage} />}

            <div className="profile-card">
                <div className="profile-image">
                    {currentUser?.photoURL ? (
                        <img src={currentUser.photoURL} alt="Profile" />
                    ) : (
                        <div className="profile-avatar">
                            {displayName ? displayName[0]?.toUpperCase() : currentUser?.email?.[0]?.toUpperCase()}
                        </div>
                    )}
                </div>

                <div className="profile-details">
                    {!isEditing ? (
                        // View mode
                        <>
                            <h2>{displayName || 'User'}</h2>
                            <p className="email">{currentUser?.email}</p>
                            {isGoogleUser && (
                                <p className="auth-badge google">
                                    <i className="fab fa-google"></i> Signed in with Google
                                </p>
                            )}

                            <div className="profile-info">
                                {birthDate && <p><strong>Birth Date:</strong> {birthDate}</p>}
                                {cycleLength && <p><strong>Average Cycle Length:</strong> {cycleLength} days</p>}
                                {periodLength && <p><strong>Average Period Length:</strong> {periodLength} days</p>}
                                {lastPeriod && <p><strong>Last Period Start Date:</strong> {lastPeriod}</p>}
                                {height && <p><strong>Height:</strong> {height} cm</p>}
                            </div>

                            <div className="button-group">
                                <button className="edit-button" onClick={() => setIsEditing(true)}>
                                    Edit Profile
                                </button>
                                {!isGoogleUser && (
                                    <button
                                        className="secondary-button"
                                        onClick={() => setShowPasswordChange(!showPasswordChange)}
                                    >
                                        Change Password
                                    </button>
                                )}
                            </div>
                        </>
                    ) : (
                        // Edit mode
                        <form onSubmit={handleSaveProfile}>
                            <div className="form-group">
                                <label htmlFor="displayName">Display Name</label>
                                <input
                                    id="displayName"
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="Your name"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="birthDate">Birth Date</label>
                                <input
                                    id="birthDate"
                                    type="date"
                                    value={birthDate}
                                    onChange={(e) => setBirthDate(e.target.value)}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="cycleLength">Cycle Length (days)</label>
                                    <input
                                        id="cycleLength"
                                        type="number"
                                        min="20"
                                        max="40"
                                        value={cycleLength}
                                        onChange={(e) => setCycleLength(e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="periodLength">Period Length (days)</label>
                                    <input
                                        id="periodLength"
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={periodLength}
                                        onChange={(e) => setPeriodLength(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="lastPeriod">Last Period Start Date</label>
                                <input
                                    id="lastPeriod"
                                    type="date"
                                    value={lastPeriod}
                                    onChange={(e) => setLastPeriod(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="height">Height (cm)</label>
                                <input
                                    id="height"
                                    type="number"
                                    min="100"
                                    max="250"
                                    value={height}
                                    onChange={(e) => setHeight(e.target.value)}
                                    placeholder="Enter your height"
                                />
                            </div>

                            <div className="button-group">
                                <button type="submit" disabled={isSaving}>
                                    {isSaving ? "Saving..." : "Save Profile"}
                                </button>
                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={() => setIsEditing(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* Password Change Section */}
            {showPasswordChange && !isGoogleUser && (
                <div className="profile-card password-card">
                    <h3>Change Password</h3>
                    <form onSubmit={handlePasswordChange}>
                        <div className="form-group">
                            <label htmlFor="currentPassword">Current Password</label>
                            <input
                                id="currentPassword"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="newPassword">New Password</label>
                            <input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                minLength="6"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm New Password</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                minLength="6"
                                required
                            />
                        </div>
                        <div className="button-group">
                            <button type="submit" disabled={isSaving}>
                                {isSaving ? "Changing..." : "Change Password"}
                            </button>
                            <button
                                type="button"
                                className="cancel-button"
                                onClick={() => {
                                    setShowPasswordChange(false);
                                    setCurrentPassword('');
                                    setNewPassword('');
                                    setConfirmPassword('');
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Data Management Section */}
            <div className="storage-status">
                <h3>Data Management</h3>
                <p>
                    <span className="status-cloud">●</span>
                    Your data is securely stored in our database
                </p>
                <button
                    className="export-button"
                    onClick={handleExportData}
                    disabled={isSaving}
                >
                    <i className="fas fa-download"></i> Export My Data
                </button>
            </div>
        </div>
    );
}
