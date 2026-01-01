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
        periodData,
        symptomsData,
        moodsData,
        healthData,
        addPeriodLog,
        updatePeriodLog,
        deletePeriodLog,
        addSymptomLog,
        updateSymptomLog,
        deleteSymptomLog,
        addMoodLog,
        updateMoodLog,
        deleteMoodLog,
        addHealthLog,
        updateHealthLog,
        deleteHealthLog,
        loading,
        error
    } = useData();

    const [activeTab, setActiveTab] = useState('period');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [successMessage, setSuccessMessage] = useState('');
    const [phaseInfo, setPhaseInfo] = useState(null);

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

    // Update phase info when selected date changes
    useEffect(() => {
        if (periodData && periodData.length > 0 && selectedDate) {
            // Sort to get the most recent period
            const sortedPeriods = [...periodData].sort((a, b) =>
                new Date(b.startDate) - new Date(a.startDate)
            );
            const lastPeriodDate = new Date(sortedPeriods[0].startDate);

            const info = getCyclePhaseInfo(
                selectedDate,
                lastPeriodDate,
                currentUser?.cycleLength || 28,
                currentUser?.periodLength || 5,
                periodData
            );
            setPhaseInfo(info);
        } else if (currentUser?.lastPeriod && selectedDate) {
            const info = getCyclePhaseInfo(
                selectedDate,
                new Date(currentUser.lastPeriod),
                currentUser?.cycleLength || 28,
                currentUser?.periodLength || 5,
                []
            );
            setPhaseInfo(info);
        } else {
            setPhaseInfo(null);
        }
    }, [selectedDate, currentUser, periodData]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const handleDateSelect = (date) => {
        setSelectedDate(date);
    };

    // Handle period tracking form submission
    const handlePeriodSubmit = async (formData) => {
        try {
            // Check if a period log already exists for this start date
            const existingLog = periodData.find(log =>
                new Date(log.startDate).toDateString() === new Date(formData.startDate).toDateString()
            );

            if (existingLog) {
                // Update existing log
                await updatePeriodLog(existingLog._id, formData);
            } else {
                // Add new log
                await addPeriodLog(formData);
            }

            setSuccessMessage('Period data saved successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Error saving period data:', err);
        }
    };

    // Handle symptom tracking form submission
    const handleSymptomSubmit = async (formData) => {
        try {
            // Check if a symptom log already exists for this date
            const existingLog = symptomsData.find(log =>
                new Date(log.date).toDateString() === new Date(formData.date).toDateString()
            );

            if (existingLog) {
                // Update existing log
                await updateSymptomLog(existingLog._id, formData);
            } else {
                // Add new log
                await addSymptomLog(formData);
            }

            setSuccessMessage('Symptom data saved successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Error saving symptom data:', err);
        }
    };

    // Handle mood tracking form submission
    const handleMoodSubmit = async (formData) => {
        try {
            // Check if a mood log already exists for this date
            const existingLog = moodsData.find(log =>
                new Date(log.date).toDateString() === new Date(formData.date).toDateString()
            );

            if (existingLog) {
                // Update existing log
                await updateMoodLog(existingLog._id, formData);
            } else {
                // Add new log
                await addMoodLog(formData);
            }

            setSuccessMessage('Mood data saved successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Error saving mood data:', err);
        }
    };

    // Handle health tracking form submission
    const handleHealthSubmit = async (formData) => {
        try {
            // Check if a health log already exists for this date
            const existingLog = healthData.find(log =>
                new Date(log.date).toDateString() === new Date(formData.date).toDateString()
            );

            if (existingLog) {
                // Update existing log
                await updateHealthLog(existingLog._id, formData);
            } else {
                // Add new log
                await addHealthLog(formData);
            }

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
                    await deletePeriodLog(logId);
                    break;
                case 'symptom':
                    await deleteSymptomLog(logId);
                    break;
                case 'mood':
                    await deleteMoodLog(logId);
                    break;
                case 'health':
                    await deleteHealthLog(logId);
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
                        cycleLogs={periodData}
                        symptomLogs={symptomsData}
                        moodLogs={moodsData}
                        userProfile={currentUser}
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
                                cycleLogs={periodData}
                                onSubmit={handlePeriodSubmit}
                                onDelete={handleDeleteLog}
                            />
                        )}

                        {activeTab === 'symptom' && (
                            <SymptomTracker
                                selectedDate={selectedDate}
                                symptomLogs={symptomsData}
                                onSubmit={handleSymptomSubmit}
                                onDelete={handleDeleteLog}
                            />
                        )}

                        {activeTab === 'mood' && (
                            <MoodTracker
                                selectedDate={selectedDate}
                                moodLogs={moodsData}
                                onSubmit={handleMoodSubmit}
                                onDelete={handleDeleteLog}
                            />
                        )}

                        {activeTab === 'health' && (
                            <HealthTracker
                                selectedDate={selectedDate}
                                healthLogs={healthData}
                                userProfile={currentUser}
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
