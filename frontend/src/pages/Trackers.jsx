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
    const [selectedDate, setSelectedDate] = useState(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
    });
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
        if (!selectedDate) {
            setPhaseInfo(null);
            return;
        }

        // Normalize the check date
        const checkDate = new Date(selectedDate);
        checkDate.setHours(0, 0, 0, 0);

        if (periodData && periodData.length > 0) {
            // Sort to get the most recent period
            const sortedPeriods = [...periodData].sort((a, b) =>
                new Date(b.startDate) - new Date(a.startDate)
            );
            const lastPeriodDate = new Date(sortedPeriods[0].startDate);
            lastPeriodDate.setHours(0, 0, 0, 0);

            const info = getCyclePhaseInfo(
                checkDate,
                lastPeriodDate,
                currentUser?.cycleLength || 28,
                currentUser?.periodLength || 5,
                periodData
            );
            setPhaseInfo(info);
        } else if (currentUser?.lastPeriod) {
            const lastPeriodDate = new Date(currentUser.lastPeriod);
            lastPeriodDate.setHours(0, 0, 0, 0);

            const info = getCyclePhaseInfo(
                checkDate,
                lastPeriodDate,
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
        // Normalize the selected date to remove time component
        const normalizedDate = new Date(date);
        normalizedDate.setHours(0, 0, 0, 0);
        setSelectedDate(normalizedDate);
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
                <p className="trackers-subtitle">Monitor your cycle, symptoms, mood, and overall wellness</p>
            </div>

            {/* Phase Status Banner - Horizontal */}
            {phaseInfo && (
                <div className={`phase-banner ${phaseInfo.phase}`}>
                    <div className="phase-banner-main">
                        <div className="phase-banner-icon">
                            <i className={`fas ${phaseInfo.phase === 'period' ? 'fa-tint' :
                                phaseInfo.phase === 'ovulation' ? 'fa-star' :
                                    phaseInfo.phase === 'fertile' ? 'fa-heart' :
                                        phaseInfo.phase === 'pms' ? 'fa-cloud' : 'fa-leaf'
                                }`}></i>
                        </div>
                        <div className="phase-banner-info">
                            <span className="phase-banner-label">Current Phase</span>
                            <h2 className="phase-banner-title">{phaseInfo.info.name}</h2>
                            <p className="phase-banner-desc">{phaseInfo.info.description}</p>
                        </div>
                    </div>

                    <div className="phase-banner-stats">
                        <div className="phase-stat">
                            <span className="phase-stat-value">{phaseInfo.cycleDay}</span>
                            <span className="phase-stat-label">Cycle Day</span>
                        </div>
                        <div className="phase-stat-divider"></div>
                        <div className="phase-stat">
                            <span className="phase-stat-value">{phaseInfo.daysUntilPeriod > 0 ? phaseInfo.daysUntilPeriod : '—'}</span>
                            <span className="phase-stat-label">Days to Period</span>
                        </div>
                        <div className="phase-stat-divider"></div>
                        <div className="phase-stat">
                            <span className="phase-stat-value">{phaseInfo.info.energy?.split(' ')[0] || 'Moderate'}</span>
                            <span className="phase-stat-label">Energy</span>
                        </div>
                        {(phaseInfo.isFertile || phaseInfo.isOvulation) && (
                            <>
                                <div className="phase-stat-divider"></div>
                                <div className="phase-stat fertility-stat">
                                    <span className="phase-stat-value">
                                        <i className="fas fa-heart"></i> {phaseInfo.isOvulation ? 'Peak' : 'High'}
                                    </span>
                                    <span className="phase-stat-label">Fertility</span>
                                </div>
                            </>
                        )}
                        {/* Ovulation-specific: Days until ovulation */}
                        {!phaseInfo.isOvulation && !phaseInfo.isPeriod && phaseInfo.ovulationDate && (
                            <>
                                <div className="phase-stat-divider"></div>
                                <div className="phase-stat ovulation-stat">
                                    <span className="phase-stat-value">
                                        <i className="fas fa-star"></i>
                                        {(() => {
                                            const checkDate = new Date(selectedDate);
                                            checkDate.setHours(0, 0, 0, 0);
                                            const ovDate = new Date(phaseInfo.ovulationDate);
                                            ovDate.setHours(0, 0, 0, 0);
                                            const diff = Math.round((ovDate - checkDate) / (1000 * 60 * 60 * 24));
                                            return diff > 0 ? diff : '—';
                                        })()}
                                    </span>
                                    <span className="phase-stat-label">Days to Ovulation</span>
                                </div>
                            </>
                        )}
                        {/* Fertile window: Days remaining */}
                        {phaseInfo.isFertile && phaseInfo.fertileWindow && (
                            <>
                                <div className="phase-stat-divider"></div>
                                <div className="phase-stat fertile-window-stat">
                                    <span className="phase-stat-value">
                                        {(() => {
                                            const checkDate = new Date(selectedDate);
                                            checkDate.setHours(0, 0, 0, 0);
                                            const endDate = new Date(phaseInfo.fertileWindow.end);
                                            endDate.setHours(0, 0, 0, 0);
                                            const diff = Math.round((endDate - checkDate) / (1000 * 60 * 60 * 24));
                                            return diff >= 0 ? diff + 1 : 0;
                                        })()}
                                    </span>
                                    <span className="phase-stat-label">Fertile Days Left</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Fertility Predictions Card - Always show fertile window & ovulation info */}
            {phaseInfo && (phaseInfo.fertileWindow || phaseInfo.ovulationDate) && (
                <div className="fertility-predictions-card">
                    <h3 className="fertility-predictions-title">
                        <i className="fas fa-seedling" aria-hidden="true"></i>
                        Fertility Predictions
                    </h3>
                    <div className="fertility-predictions-grid">
                        {phaseInfo.ovulationDate && (
                            <div className={`prediction-item ovulation-prediction ${phaseInfo.isOvulation ? 'active' : ''}`}>
                                <div className="prediction-icon">
                                    <i className="fas fa-star"></i>
                                </div>
                                <div className="prediction-info">
                                    <span className="prediction-label">Ovulation Day</span>
                                    <span className="prediction-value">
                                        {phaseInfo.isOvulation ? (
                                            <span className="prediction-active">Today!</span>
                                        ) : (
                                            phaseInfo.ovulationDate.toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric'
                                            })
                                        )}
                                    </span>
                                    <span className="prediction-desc">Peak fertility - egg release</span>
                                </div>
                            </div>
                        )}
                        {phaseInfo.fertileWindow && (
                            <div className={`prediction-item fertile-prediction ${phaseInfo.isFertile ? 'active' : ''}`}>
                                <div className="prediction-icon">
                                    <i className="fas fa-heart"></i>
                                </div>
                                <div className="prediction-info">
                                    <span className="prediction-label">Fertile Window</span>
                                    <span className="prediction-value">
                                        {phaseInfo.isFertile ? (
                                            <span className="prediction-active">Now</span>
                                        ) : (
                                            <>
                                                {phaseInfo.fertileWindow.start.toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                                {' - '}
                                                {phaseInfo.fertileWindow.end.toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </>
                                        )}
                                    </span>
                                    <span className="prediction-desc">
                                        {phaseInfo.isFertile
                                            ? 'You are currently in your fertile window'
                                            : '~6 days of higher fertility'
                                        }
                                    </span>
                                </div>
                            </div>
                        )}
                        {phaseInfo.nextPeriod && (
                            <div className={`prediction-item period-prediction ${phaseInfo.isPeriod ? 'active' : ''}`}>
                                <div className="prediction-icon">
                                    <i className="fas fa-calendar-alt"></i>
                                </div>
                                <div className="prediction-info">
                                    <span className="prediction-label">Next Period</span>
                                    <span className="prediction-value">
                                        {phaseInfo.isPeriod ? (
                                            <span className="prediction-active">Current</span>
                                        ) : (
                                            phaseInfo.nextPeriod.toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric'
                                            })
                                        )}
                                    </span>
                                    <span className="prediction-desc">
                                        {phaseInfo.isPeriod
                                            ? 'You are on your period'
                                            : `In ${phaseInfo.daysUntilPeriod} days`
                                        }
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Main Content - Calendar & Trackers Side by Side */}
            <div className="trackers-main-layout">
                {/* Calendar Section */}
                <div className="calendar-section">
                    <Calendar
                        selectedDate={selectedDate}
                        onDateSelect={handleDateSelect}
                        cycleLogs={periodData}
                        symptomLogs={symptomsData}
                        moodLogs={moodsData}
                        userProfile={currentUser}
                    />

                    <div className="selected-date-info">
                        <span className="selected-date-label">Selected Date</span>
                        <span className="selected-date-value">
                            {selectedDate.toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </span>
                    </div>
                </div>

                {/* Trackers Section */}
                <div className="trackers-section">
                    <div className="tracker-tabs" role="tablist" aria-label="Health tracking categories">
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'period'}
                            className={`tab-button ${activeTab === 'period' ? 'active' : ''}`}
                            onClick={() => handleTabChange('period')}
                        >
                            <i className="fas fa-calendar-alt" aria-hidden="true"></i>
                            <span>Period</span>
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'symptom'}
                            className={`tab-button ${activeTab === 'symptom' ? 'active' : ''}`}
                            onClick={() => handleTabChange('symptom')}
                        >
                            <i className="fas fa-notes-medical" aria-hidden="true"></i>
                            <span>Symptoms</span>
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'mood'}
                            className={`tab-button ${activeTab === 'mood' ? 'active' : ''}`}
                            onClick={() => handleTabChange('mood')}
                        >
                            <i className="fas fa-smile" aria-hidden="true"></i>
                            <span>Mood</span>
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'health'}
                            className={`tab-button ${activeTab === 'health' ? 'active' : ''}`}
                            onClick={() => handleTabChange('health')}
                        >
                            <i className="fas fa-heartbeat" aria-hidden="true"></i>
                            <span>Health</span>
                        </button>
                    </div>

                    <div className="tracker-content" role="tabpanel">
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

            {/* Tips Section - Horizontal Cards */}
            {phaseInfo && (
                <div className="phase-tips-section">
                    <h3 className="tips-section-title">
                        <i className="fas fa-lightbulb" aria-hidden="true"></i>
                        Tips for {phaseInfo.info.name}
                    </h3>
                    <div className="tips-horizontal-grid">
                        {phaseInfo.info.tips.map((tip, index) => (
                            <div key={`tip-${index}`} className="tip-card">
                                <div className="tip-number">{index + 1}</div>
                                <p className="tip-text">{tip}</p>
                            </div>
                        ))}
                    </div>

                    <div className="hormone-info-bar">
                        <div className="hormone-item">
                            <i className="fas fa-dna" aria-hidden="true"></i>
                            <span className="hormone-label">Hormones:</span>
                            <span className="hormone-value">{phaseInfo.info.hormones}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
