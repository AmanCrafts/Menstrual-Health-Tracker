import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import { useData } from '../contexts/DataContext';
import Calendar from '../components/trackers/Calendar';
import PeriodTracker from '../components/trackers/PeriodTracker';
import SymptomTracker from '../components/trackers/SymptomTracker';
import MoodTracker from '../components/trackers/MoodTracker';
import HealthTracker from '../components/trackers/HealthTracker';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import { getCyclePhaseInfo } from '../utils/cycleCalculations';
import '../styles/trackers.css';

export default function Trackers() {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser } = useAuth();
    const {
        userProfile,
        periodData,
        symptomsData,
        notesData,
        updatePeriodData,
        updateSymptomsData,
        updateNotesData,
        loading,
        error
    } = useData();

    const [activeTab, setActiveTab] = useState('period');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [successMessage, setSuccessMessage] = useState('');
    const [phaseInfo, setPhaseInfo] = useState(null);

    // Derived state for logs
    const [cycleLogs, setCycleLogs] = useState([]);
    const [symptomLogs, setSymptomLogs] = useState([]);
    const [moodLogs, setMoodLogs] = useState([]);
    const [healthLogs, setHealthLogs] = useState([]);

    // Effect for handling route state (when redirected from dashboard with a specific tab to open)
    useEffect(() => {
        if (location.state && location.state.openTab) {
            setActiveTab(location.state.openTab);
            // Clear the state to avoid persisting between navigation
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    useEffect(() => {
        if (!currentUser) {
            navigate('/signin');
        }
    }, [currentUser, navigate]);

    // Extract logs from periodData
    useEffect(() => {
        if (periodData && periodData.logs) {
            setCycleLogs(periodData.logs);
        } else {
            setCycleLogs([]);
        }

        if (symptomsData && symptomsData.logs) {
            setSymptomLogs(symptomsData.logs);
        } else {
            setSymptomLogs([]);
        }

        if (notesData) {
            // Extract mood logs from notesData
            const moodData = notesData.moodLogs || [];
            setMoodLogs(moodData);

            // Extract health logs from notesData
            const healthData = notesData.healthLogs || [];
            setHealthLogs(healthData);
        } else {
            setMoodLogs([]);
            setHealthLogs([]);
        }
    }, [periodData, symptomsData, notesData]);

    // Update phase info when selected date changes
    useEffect(() => {
        if (userProfile && userProfile.lastPeriod && selectedDate) {
            const info = getCyclePhaseInfo(
                selectedDate,
                new Date(userProfile.lastPeriod),
                userProfile.cycleLength || 28,
                userProfile.periodLength || 5,
                cycleLogs
            );
            setPhaseInfo(info);
        } else {
            setPhaseInfo(null);
        }
    }, [selectedDate, userProfile, cycleLogs]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const handleDateSelect = (date) => {
        setSelectedDate(date);
    };

    // Function to generate a unique ID
    const generateId = () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    };

    // Handle period tracking form submission
    const handlePeriodSubmit = async (periodData) => {
        try {
            // Check if a cycle log already exists for this start date
            const existingLogIndex = cycleLogs.findIndex(log =>
                new Date(log.startDate).toDateString() === new Date(periodData.startDate).toDateString()
            );

            let updatedLogs = [...cycleLogs];

            if (existingLogIndex !== -1) {
                // Update existing log
                updatedLogs[existingLogIndex] = {
                    ...updatedLogs[existingLogIndex],
                    ...periodData
                };
            } else {
                // Add new log with ID
                updatedLogs.push({
                    id: generateId(),
                    ...periodData
                });
            }

            // Sort logs by start date (descending)
            updatedLogs.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

            // Update period data with new logs
            await updatePeriodData({ logs: updatedLogs });
            setCycleLogs(updatedLogs);

            setSuccessMessage('Period data saved successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Error saving period data:', err);
        }
    };

    // Handle symptom tracking form submission
    const handleSymptomSubmit = async (symptomData) => {
        try {
            // Check if a symptom log already exists for this date
            const existingLogIndex = symptomLogs.findIndex(log =>
                new Date(log.date).toDateString() === new Date(symptomData.date).toDateString()
            );

            let updatedLogs = [...symptomLogs];

            if (existingLogIndex !== -1) {
                // Update existing log
                updatedLogs[existingLogIndex] = {
                    ...updatedLogs[existingLogIndex],
                    ...symptomData
                };
            } else {
                // Add new log with ID
                updatedLogs.push({
                    id: generateId(),
                    ...symptomData
                });
            }

            // Sort logs by date (descending)
            updatedLogs.sort((a, b) => new Date(b.date) - new Date(a.date));

            // Update symptoms data with new logs
            await updateSymptomsData({ logs: updatedLogs });
            setSymptomLogs(updatedLogs);

            setSuccessMessage('Symptom data saved successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Error saving symptom data:', err);
        }
    };

    // Handle mood tracking form submission
    const handleMoodSubmit = async (moodData) => {
        try {
            // Check if a mood log already exists for this date
            const existingLogIndex = moodLogs.findIndex(log =>
                new Date(log.date).toDateString() === new Date(moodData.date).toDateString()
            );

            let updatedLogs = [...moodLogs];

            if (existingLogIndex !== -1) {
                // Update existing log
                updatedLogs[existingLogIndex] = {
                    ...updatedLogs[existingLogIndex],
                    ...moodData
                };
            } else {
                // Add new log with ID
                updatedLogs.push({
                    id: generateId(),
                    ...moodData
                });
            }

            // Sort logs by date (descending)
            updatedLogs.sort((a, b) => new Date(b.date) - new Date(a.date));

            // Update notes data with new mood logs
            await updateNotesData({ ...notesData, moodLogs: updatedLogs });
            setMoodLogs(updatedLogs);

            setSuccessMessage('Mood data saved successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Error saving mood data:', err);
        }
    };

    // Handle health tracking form submission
    const handleHealthSubmit = async (healthData) => {
        try {
            // Check if a health log already exists for this date
            const existingLogIndex = healthLogs.findIndex(log =>
                new Date(log.date).toDateString() === new Date(healthData.date).toDateString()
            );

            let updatedLogs = [...healthLogs];

            if (existingLogIndex !== -1) {
                // Update existing log
                updatedLogs[existingLogIndex] = {
                    ...updatedLogs[existingLogIndex],
                    ...healthData
                };
            } else {
                // Add new log with ID
                updatedLogs.push({
                    id: generateId(),
                    ...healthData
                });
            }

            // Sort logs by date (descending)
            updatedLogs.sort((a, b) => new Date(b.date) - new Date(a.date));

            // Update notes data with new health logs
            await updateNotesData({ ...notesData, healthLogs: updatedLogs });
            setHealthLogs(updatedLogs);

            setSuccessMessage('Health data saved successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Error saving health data:', err);
        }
    };

    // Handle deleting logs
    const handleDeleteLog = async (type, logId) => {
        try {
            switch (type) {
                case 'period':
                    {
                        const updatedLogs = cycleLogs.filter(log => log.id !== logId);
                        await updatePeriodData({ logs: updatedLogs });
                        setCycleLogs(updatedLogs);
                    }
                    break;
                case 'symptom':
                    {
                        const updatedLogs = symptomLogs.filter(log => log.id !== logId);
                        await updateSymptomsData({ logs: updatedLogs });
                        setSymptomLogs(updatedLogs);
                    }
                    break;
                case 'mood':
                    {
                        const updatedLogs = moodLogs.filter(log => log.id !== logId);
                        await updateNotesData({ ...notesData, moodLogs: updatedLogs });
                        setMoodLogs(updatedLogs);
                    }
                    break;
                case 'health':
                    {
                        const updatedLogs = healthLogs.filter(log => log.id !== logId);
                        await updateNotesData({ ...notesData, healthLogs: updatedLogs });
                        setHealthLogs(updatedLogs);
                    }
                    break;
                default:
                    break;
            }

            setSuccessMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} log deleted successfully!`);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error(`Error deleting ${type} log:`, err);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!userProfile) {
        return (
            <div className="trackers-container">
                <div className="welcome-message">
                    <h1>Trackers</h1>
                    <p>Please complete your profile to start tracking</p>
                    <button onClick={() => navigate('/profile')} className="primary-button">
                        Complete Profile
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="trackers-container">
            {error && <Alert type="error" message={error} />}
            {successMessage && <Alert type="success" message={successMessage} />}

            <div className="trackers-header">
                <h1>Track Your Health</h1>
            </div>

            <div className="trackers-layout">
                <div className="calendar-section">
                    <Calendar
                        selectedDate={selectedDate}
                        onDateSelect={handleDateSelect}
                        cycleLogs={cycleLogs}
                        symptomLogs={symptomLogs}
                        moodLogs={moodLogs}
                        userProfile={userProfile}
                    />

                    {phaseInfo && (
                        <div className={`phase-info-card ${phaseInfo.phase}`}>
                            <div className="phase-info-header">
                                <h3>{phaseInfo.info.name}</h3>
                                <span className="phase-date">
                                    Cycle Day {phaseInfo.cycleDay}
                                </span>
                            </div>
                            <p className="phase-info-description">
                                {phaseInfo.info.description}
                            </p>
                            <div className="phase-info-tips">
                                <h4>Tips for this phase:</h4>
                                <ul>
                                    {phaseInfo.info.tips.map((tip, index) => (
                                        <li key={index}>{tip}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>

                <div className="trackers-section">
                    <div className="tracker-tabs">
                        <button
                            className={`tab-button ${activeTab === 'period' ? 'active' : ''}`}
                            onClick={() => handleTabChange('period')}
                        >
                            <i className="fas fa-calendar-alt"></i> Period
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'symptom' ? 'active' : ''}`}
                            onClick={() => handleTabChange('symptom')}
                        >
                            <i className="fas fa-notes-medical"></i> Symptoms
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'mood' ? 'active' : ''}`}
                            onClick={() => handleTabChange('mood')}
                        >
                            <i className="fas fa-smile"></i> Mood
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'health' ? 'active' : ''}`}
                            onClick={() => handleTabChange('health')}
                        >
                            <i className="fas fa-heartbeat"></i> Health
                        </button>
                    </div>

                    <div className="tracker-content">
                        {activeTab === 'period' && (
                            <PeriodTracker
                                selectedDate={selectedDate}
                                cycleLogs={cycleLogs}
                                onSubmit={handlePeriodSubmit}
                                onDelete={handleDeleteLog}
                            />
                        )}

                        {activeTab === 'symptom' && (
                            <SymptomTracker
                                selectedDate={selectedDate}
                                symptomLogs={symptomLogs}
                                onSubmit={handleSymptomSubmit}
                                onDelete={handleDeleteLog}
                            />
                        )}

                        {activeTab === 'mood' && (
                            <MoodTracker
                                selectedDate={selectedDate}
                                moodLogs={moodLogs}
                                onSubmit={handleMoodSubmit}
                                onDelete={handleDeleteLog}
                            />
                        )}

                        {activeTab === 'health' && (
                            <HealthTracker
                                selectedDate={selectedDate}
                                healthLogs={healthLogs}
                                userProfile={userProfile}
                                onSubmit={handleHealthSubmit}
                                onDelete={handleDeleteLog}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
