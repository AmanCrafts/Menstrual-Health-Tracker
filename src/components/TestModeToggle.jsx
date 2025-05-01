import React, { useState, useEffect } from 'react';
import { getTestUsersList } from '../utils/testData';

/**
 * A component that provides a toggle for test mode and test user selection
 */
export default function TestModeToggle({ isEnabled, onToggle, currentUser, onUserChange }) {
    const [testUsers, setTestUsers] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (isEnabled) {
            setTestUsers(getTestUsersList());
        }
    }, [isEnabled]);

    const toggleTestMode = () => {
        onToggle(!isEnabled);
    };

    const handleUserChange = (userId) => {
        onUserChange(userId);
        setIsOpen(false);
    };

    return (
        <div className="test-mode-container">
            <div className="test-mode-toggle">
                <label className="toggle-switch">
                    <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={toggleTestMode}
                    />
                    <span className="toggle-slider"></span>
                </label>
                <span className="toggle-label">Test Mode</span>
            </div>

            {isEnabled && (
                <div className="test-user-selector">
                    <button
                        className="test-user-button"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <span className="current-user">
                            {testUsers.find(u => u.id === currentUser)?.name || 'Select Test User'}
                        </span>
                        <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`}></i>
                    </button>

                    {isOpen && (
                        <div className="test-user-dropdown">
                            {testUsers.map(user => (
                                <div
                                    key={user.id}
                                    className={`test-user-option ${currentUser === user.id ? 'active' : ''}`}
                                    onClick={() => handleUserChange(user.id)}
                                >
                                    <div className="user-option-name">{user.name}</div>
                                    <div className="user-option-desc">{user.description}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
