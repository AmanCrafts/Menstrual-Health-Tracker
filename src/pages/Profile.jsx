import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/useAuth.jsx';
import { useData } from '../contexts/DataContext.jsx';
import { useNavigate } from 'react-router-dom';
import Alert from '../components/Alert.jsx';
import '../styles/profile.css';

export default function Profile() {
    const { currentUser, logout } = useAuth();
    const {
        userProfile,
        updateUserProfile,
        loading,
        error,
        clearError
    } = useData();

    const [displayName, setDisplayName] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [cycleLength, setCycleLength] = useState('28');
    const [periodLength, setPeriodLength] = useState('5');
    const [lastPeriod, setLastPeriod] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();

    // Load user profile data when component mounts
    useEffect(() => {
        if (!currentUser) {
            navigate('/signin');
            return;
        }

        if (userProfile) {
            setDisplayName(userProfile.displayName || '');
            setBirthDate(userProfile.birthDate || '');
            setCycleLength(userProfile.cycleLength || '28');
            setPeriodLength(userProfile.periodLength || '5');
            setLastPeriod(userProfile.lastPeriod || '');
        } else {
            // If no profile exists, use Firebase display name
            setDisplayName(currentUser.displayName || '');
        }
    }, [currentUser, userProfile, navigate]);

    // Handle form submission
    const handleSaveProfile = async (e) => {
        e.preventDefault();

        const updatedProfile = {
            displayName,
            birthDate,
            cycleLength: parseInt(cycleLength, 10),
            periodLength: parseInt(periodLength, 10),
            lastPeriod,
            email: currentUser.email
        };

        try {
            const success = await updateUserProfile(updatedProfile);
            if (success) {
                setSuccessMessage('Profile updated successfully!');
                setIsEditing(false);
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (err) {
            console.error("Failed to update profile:", err);
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

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1>My Profile</h1>
                <button className="logout-button" onClick={handleLogout}>Logout</button>
            </div>

            {error && <Alert type="error" message={error} onClose={clearError} />}
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

                            {userProfile && (
                                <div className="profile-info">
                                    {birthDate && <p><strong>Birth Date:</strong> {birthDate}</p>}
                                    {cycleLength && <p><strong>Average Cycle Length:</strong> {cycleLength} days</p>}
                                    {periodLength && <p><strong>Average Period Length:</strong> {periodLength} days</p>}
                                    {lastPeriod && <p><strong>Last Period Start Date:</strong> {lastPeriod}</p>}
                                </div>
                            )}

                            <button className="edit-button" onClick={() => setIsEditing(true)}>
                                Edit Profile
                            </button>
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

                            <div className="button-group">
                                <button type="submit" disabled={loading}>
                                    {loading ? "Saving..." : "Save Profile"}
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
        </div>
    );
}
