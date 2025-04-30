import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import { useData } from '../contexts/DataContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import {
    calculateNextPeriod,
    calculateCycleDay,
    calculateFertileWindow,
    calculateOvulation,
    calculatePmsDays,
    getCyclePhaseInfo,
    generateHealthInsights
} from '../utils/cycleCalculations';
import '../styles/dashboard.css';

export default function Dashboard() {
    const { currentUser } = useAuth();
    const { userProfile, periodData, symptomsData, notesData, loading, error } = useData();
    const navigate = useNavigate();
    const [cycleLogs, setCycleLogs] = useState([]);
    const [symptomLogs, setSymptomLogs] = useState([]);
    const [cycleInfo, setCycleInfo] = useState(null);
    const [insights, setInsights] = useState([]);

    useEffect(() => {
        if (!currentUser) {
            navigate('/signin');
        }
    }, [currentUser, navigate]);

    // Extract data from contexts
    useEffect(() => {
        if (periodData && periodData.logs) {
            setCycleLogs(periodData.logs);
        }

        if (symptomsData && symptomsData.logs) {
            setSymptomLogs(symptomsData.logs);
        }
    }, [periodData, symptomsData]);

    // Calculate cycle information
    useEffect(() => {
        if (userProfile && userProfile.lastPeriod) {
            const today = new Date();

            // Get last period date from profile or logs
            let lastPeriodDate = new Date(userProfile.lastPeriod);
            if (cycleLogs && cycleLogs.length > 0) {
                const sortedLogs = [...cycleLogs].sort((a, b) =>
                    new Date(b.startDate) - new Date(a.startDate)
                );

                if (new Date(sortedLogs[0].startDate) > lastPeriodDate) {
                    lastPeriodDate = new Date(sortedLogs[0].startDate);
                }
            }

            const cycleLength = userProfile.cycleLength || 28;
            const periodLength = userProfile.periodLength || 5;

            // Calculate next period
            const nextPeriod = calculateNextPeriod(lastPeriodDate, cycleLength, cycleLogs);

            // Calculate days until next period
            const daysUntilPeriod = Math.ceil(
                (nextPeriod - today) / (1000 * 60 * 60 * 24)
            );

            // Calculate current cycle day
            const cycleDay = calculateCycleDay(lastPeriodDate, today, cycleLength);

            // Calculate fertile window
            const fertileWindow = calculateFertileWindow(nextPeriod, cycleLength);

            // Calculate ovulation
            const ovulationDate = calculateOvulation(nextPeriod, cycleLength);

            // Calculate days until ovulation
            const daysUntilOvulation = Math.ceil(
                (ovulationDate - today) / (1000 * 60 * 60 * 24)
            );

            // Calculate PMS window
            const pmsWindow = calculatePmsDays(nextPeriod);

            // Get the current phase
            const phaseInfo = getCyclePhaseInfo(
                today,
                lastPeriodDate,
                cycleLength,
                periodLength,
                cycleLogs
            );

            setCycleInfo({
                nextPeriod,
                daysUntilPeriod,
                cycleDay,
                fertileWindow,
                ovulationDate,
                daysUntilOvulation,
                pmsWindow,
                lastPeriodDate,
                phaseInfo
            });

            // Generate health insights
            const healthInsights = generateHealthInsights(userProfile, periodData, symptomLogs);
            setInsights(healthInsights);
        }
    }, [userProfile, cycleLogs, symptomLogs]);

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!userProfile || !userProfile.lastPeriod) {
        return (
            <div className="dashboard-container">
                <div className="welcome-message">
                    <h1>Welcome to FlowSync!</h1>
                    <p>Please complete your profile to start tracking</p>
                    <button onClick={() => navigate('/profile')} className="primary-button">
                        Complete Profile
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {error && <Alert type="error" message={error} />}

            <div className="dashboard-header">
                <h1>Hello, {userProfile.displayName || `there`}!</h1>
                <p>Here's your menstrual health overview</p>
            </div>

            {cycleInfo && (
                <div className="dashboard-grid">
                    {/* Current Phase Card */}
                    <div className="dashboard-card current-phase">
                        <div className="card-header">
                            <h2>Current Phase</h2>
                            <i className={`phase-icon fas fa-circle`} style={{ color: cycleInfo.phaseInfo.info.color }}></i>
                        </div>
                        <div className="card-content">
                            <h3>{cycleInfo.phaseInfo.info.name}</h3>
                            <p>Cycle Day {cycleInfo.cycleDay}</p>
                            <p className="phase-description">{cycleInfo.phaseInfo.info.description}</p>
                        </div>
                        <div className="card-footer">
                            <Link to="/trackers" className="dashboard-link">View Calendar</Link>
                        </div>
                    </div>

                    {/* Next Period Card */}
                    <div className="dashboard-card next-period">
                        <div className="card-header">
                            <h2>Next Period</h2>
                            <i className="fas fa-calendar-alt"></i>
                        </div>
                        <div className="card-content">
                            <div className="next-date">
                                {cycleInfo.nextPeriod.toLocaleDateString(`en-US`, {
                                    month: `short`,
                                    day: `numeric`,
                                    year: `numeric`
                                })}
                            </div>
                            <div className="days-until">
                                {cycleInfo.daysUntilPeriod === 0 ? `Expected today` :
                                    `${cycleInfo.daysUntilPeriod} day${cycleInfo.daysUntilPeriod !== 1 ? `s` : ``} from now`}
                            </div>
                        </div>
                        <div className="card-footer">
                            <Link to="/trackers" state={{ openTab: `period` }} className="dashboard-link">Track Period</Link>
                        </div>
                    </div>

                    {/* Fertility Window Card */}
                    <div className="dashboard-card fertility">
                        <div className="card-header">
                            <h2>Fertility Window</h2>
                            <i className="fas fa-venus"></i>
                        </div>
                        <div className="card-content">
                            <p>
                                <strong>Fertile days:</strong> {cycleInfo.fertileWindow.start.toLocaleDateString(`en-US`, {
                                    month: `short`,
                                    day: `numeric`
                                })} - {cycleInfo.fertileWindow.end.toLocaleDateString(`en-US`, {
                                    month: `short`,
                                    day: `numeric`
                                })}
                            </p>
                            <p>
                                <strong>Ovulation day:</strong> {cycleInfo.ovulationDate.toLocaleDateString(`en-US`, {
                                    month: `short`,
                                    day: `numeric`
                                })}
                                {cycleInfo.daysUntilOvulation > 0 ?
                                    ` (in ${cycleInfo.daysUntilOvulation} days)` :
                                    cycleInfo.daysUntilOvulation === 0 ?
                                        ` (today)` : ` (passed)`}
                            </p>
                        </div>
                        <div className="card-footer">
                            <Link to="/education" className="dashboard-link">Learn More</Link>
                        </div>
                    </div>

                    {/* Symptoms and Mood Tracking Quick Card */}
                    <div className="dashboard-card quick-track">
                        <div className="card-header">
                            <h2>Quick Track</h2>
                            <i className="fas fa-clipboard-list"></i>
                        </div>
                        <div className="card-content">
                            <p>Record your symptoms and mood for today:</p>
                            <div className="quick-buttons">
                                <Link to="/trackers" state={{ openTab: `symptom` }} className="quick-button">
                                    <i className="fas fa-notes-medical"></i> Symptoms
                                </Link>
                                <Link to="/trackers" state={{ openTab: `mood` }} className="quick-button">
                                    <i className="fas fa-smile"></i> Mood
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Cycle Stats Card */}
                    <div className="dashboard-card cycle-stats">
                        <div className="card-header">
                            <h2>Cycle Stats</h2>
                            <i className="fas fa-chart-pie"></i>
                        </div>
                        <div className="card-content">
                            <div className="stat-item">
                                <span className="stat-label">Average Cycle Length:</span>
                                <span className="stat-value">{userProfile.cycleLength || 28} days</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Average Period Length:</span>
                                <span className="stat-value">{userProfile.periodLength || 5} days</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Last Period:</span>
                                <span className="stat-value">
                                    {cycleInfo.lastPeriodDate.toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                        </div>
                        <div className="card-footer">
                            <Link to="/analytics" className="dashboard-link">View Analytics</Link>
                        </div>
                    </div>

                    {/* Health Insights Card */}
                    <div className="dashboard-card insights">
                        <div className="card-header">
                            <h2>Health Insights</h2>
                            <i className="fas fa-lightbulb"></i>
                        </div>
                        <div className="card-content insights-content">
                            {insights.length > 0 ? (
                                insights.slice(0, 2).map((insight, index) => (
                                    <div key={index} className={`insight-item ${insight.type}`}>
                                        <i className={`fas fa-${insight.icon}`}></i>
                                        <div className="insight-text">
                                            <h4>{insight.title}</h4>
                                            <p>{insight.description}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p>Track more cycles to receive personalized insights.</p>
                            )}
                        </div>
                        <div className="card-footer">
                            <Link to="/analytics" className="dashboard-link">See All Insights</Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
