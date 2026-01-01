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

// Helper function to safely format dates
const formatDate = (date, options = { month: 'short', day: 'numeric' }) => {
    if (!date) return 'N/A';
    const dateObj = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(dateObj.getTime())) return 'N/A';
    return dateObj.toLocaleDateString('en-US', options);
};

export default function Dashboard() {
    const { currentUser } = useAuth();
    const { periodData, symptomsData, predictions, loading, error } = useData();
    const navigate = useNavigate();
    const [cycleInfo, setCycleInfo] = useState(null);
    const [insights, setInsights] = useState([]);

    useEffect(() => {
        if (!currentUser) {
            navigate('/signin');
        }
    }, [currentUser, navigate]);

    // Calculate cycle information
    useEffect(() => {
        // Get last period from period logs
        if (periodData && periodData.length > 0) {
            const today = new Date();

            // Sort period logs by date (most recent first)
            const sortedLogs = [...periodData].sort((a, b) =>
                new Date(b.startDate) - new Date(a.startDate)
            );

            const lastPeriodDate = new Date(sortedLogs[0].startDate);
            const cycleLength = currentUser?.cycleLength || 28;
            const periodLength = currentUser?.periodLength || 5;

            // Calculate next period
            const nextPeriod = calculateNextPeriod(lastPeriodDate, cycleLength, periodData);

            // Calculate days until next period
            const daysUntilPeriod = nextPeriod ? Math.ceil(
                (nextPeriod - today) / (1000 * 60 * 60 * 24)
            ) : null;

            // Calculate current cycle day
            const cycleDay = calculateCycleDay(lastPeriodDate, today, cycleLength);

            // Calculate fertile window
            const fertileWindow = calculateFertileWindow(nextPeriod, cycleLength);

            // Calculate ovulation (now returns an object with date property)
            const ovulationResult = calculateOvulation(nextPeriod, cycleLength);
            const ovulationDate = ovulationResult?.date || null;

            // Calculate days until ovulation
            const daysUntilOvulation = ovulationDate ? Math.ceil(
                (ovulationDate - today) / (1000 * 60 * 60 * 24)
            ) : null;

            // Calculate PMS window
            const pmsWindow = calculatePmsDays(nextPeriod);

            // Get the current phase
            const phaseInfo = getCyclePhaseInfo(
                today,
                lastPeriodDate,
                cycleLength,
                periodLength,
                periodData
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
                phaseInfo,
                cycleLength,
                periodLength
            });

            // Generate health insights
            const healthInsights = generateHealthInsights(currentUser, periodData, symptomsData);
            setInsights(healthInsights);
        } else if (currentUser?.lastPeriod) {
            // Fallback to user profile lastPeriod if no period logs
            const today = new Date();
            const lastPeriodDate = new Date(currentUser.lastPeriod);
            const cycleLength = currentUser?.cycleLength || 28;
            const periodLength = currentUser?.periodLength || 5;

            const nextPeriod = calculateNextPeriod(lastPeriodDate, cycleLength, []);
            const daysUntilPeriod = nextPeriod ? Math.ceil((nextPeriod - today) / (1000 * 60 * 60 * 24)) : null;
            const cycleDay = calculateCycleDay(lastPeriodDate, today, cycleLength);
            const fertileWindow = calculateFertileWindow(nextPeriod, cycleLength);
            const ovulationResult = calculateOvulation(nextPeriod, cycleLength);
            const ovulationDate = ovulationResult?.date || null;
            const daysUntilOvulation = ovulationDate ? Math.ceil((ovulationDate - today) / (1000 * 60 * 60 * 24)) : null;
            const pmsWindow = calculatePmsDays(nextPeriod);
            const phaseInfo = getCyclePhaseInfo(today, lastPeriodDate, cycleLength, periodLength, []);

            setCycleInfo({
                nextPeriod,
                daysUntilPeriod,
                cycleDay,
                fertileWindow,
                ovulationDate,
                daysUntilOvulation,
                pmsWindow,
                lastPeriodDate,
                phaseInfo,
                cycleLength,
                periodLength
            });
        }
    }, [currentUser, periodData, symptomsData]);

    if (loading) {
        return <LoadingSpinner />;
    }

    // Check if user has any period data or has set up their profile
    const hasSetup = periodData.length > 0 || currentUser?.lastPeriod;

    if (!hasSetup) {
        return (
            <div className="dashboard-container">
                <div className="welcome-message">
                    <h1>Welcome to FlowSync!</h1>
                    <p>Please complete your profile or log your first period to start tracking</p>
                    <div className="quick-buttons">
                        <button onClick={() => navigate('/profile')} className="primary-button">
                            Complete Profile
                        </button>
                        <button onClick={() => navigate('/trackers', { state: { openTab: 'period' } })} className="primary-button">
                            Log First Period
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {error && <Alert type="error" message={error} />}

            <div className="dashboard-header">
                <h1>Hello, {currentUser?.displayName || `there`}!</h1>
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
                            <p>Cycle Day {cycleInfo.cycleDay?.day || cycleInfo.cycleDay || 'N/A'}</p>
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
                                {formatDate(cycleInfo.nextPeriod, {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </div>
                            <div className="days-until">
                                {cycleInfo.daysUntilPeriod === 0 ? 'Expected today' :
                                    cycleInfo.daysUntilPeriod > 0 ?
                                        `${cycleInfo.daysUntilPeriod} day${cycleInfo.daysUntilPeriod !== 1 ? 's' : ''} from now` :
                                        'Calculating...'}
                            </div>
                        </div>
                        <div className="card-footer">
                            <Link to="/trackers" state={{ openTab: 'period' }} className="dashboard-link">Track Period</Link>
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
                                <strong>Fertile days:</strong> {cycleInfo.fertileWindow ? (
                                    `${formatDate(cycleInfo.fertileWindow.start)} - ${formatDate(cycleInfo.fertileWindow.end)}`
                                ) : 'Calculating...'}
                            </p>
                            <p>
                                <strong>Ovulation day:</strong> {formatDate(cycleInfo.ovulationDate)}
                                {cycleInfo.daysUntilOvulation !== null && (
                                    cycleInfo.daysUntilOvulation > 0 ?
                                        ` (in ${cycleInfo.daysUntilOvulation} days)` :
                                        cycleInfo.daysUntilOvulation === 0 ?
                                            ' (today)' : ' (passed)'
                                )}
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
                                <span className="stat-value">{cycleInfo.cycleLength || 28} days</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Average Period Length:</span>
                                <span className="stat-value">{cycleInfo.periodLength || 5} days</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Last Period:</span>
                                <span className="stat-value">
                                    {formatDate(cycleInfo.lastPeriodDate)}
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
