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
    const { periodData, symptomsData, moodData, healthData, loading, error } = useData();
    const navigate = useNavigate();
    const [cycleInfo, setCycleInfo] = useState(null);
    const [insights, setInsights] = useState([]);

    // Calculate cycle information
    useEffect(() => {
        if (periodData && periodData.length > 0) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Sort period logs by date (most recent first)
            const sortedLogs = [...periodData].sort((a, b) =>
                new Date(b.startDate) - new Date(a.startDate)
            );

            const lastPeriodDate = new Date(sortedLogs[0].startDate);
            lastPeriodDate.setHours(0, 0, 0, 0);

            const cycleLength = currentUser?.cycleLength || 28;
            const periodLength = currentUser?.periodLength || 5;

            // Calculate next period
            const nextPeriod = calculateNextPeriod(lastPeriodDate, cycleLength, periodData);

            // Calculate days until next period
            const daysUntilPeriod = nextPeriod ? Math.ceil(
                (nextPeriod - today) / (1000 * 60 * 60 * 24)
            ) : null;

            // Calculate current cycle day
            const cycleDayInfo = calculateCycleDay(lastPeriodDate, today, cycleLength);

            // Calculate fertile window
            const fertileWindow = calculateFertileWindow(nextPeriod, cycleLength);

            // Calculate ovulation
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

            // Calculate cycle progress percentage
            const cycleDay = cycleDayInfo?.day || 1;
            const cycleProgress = Math.min(100, Math.round((cycleDay / cycleLength) * 100));

            setCycleInfo({
                nextPeriod,
                daysUntilPeriod: daysUntilPeriod > 0 ? daysUntilPeriod : 0,
                cycleDay,
                cycleDayInfo,
                fertileWindow,
                ovulationDate,
                daysUntilOvulation,
                pmsWindow,
                lastPeriodDate,
                phaseInfo,
                cycleLength,
                periodLength,
                cycleProgress
            });

            // Generate health insights
            const healthInsights = generateHealthInsights(currentUser, periodData, symptomsData);
            setInsights(healthInsights);
        } else if (currentUser?.lastPeriod) {
            // Fallback to user profile lastPeriod if no period logs
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const lastPeriodDate = new Date(currentUser.lastPeriod);
            lastPeriodDate.setHours(0, 0, 0, 0);

            const cycleLength = currentUser?.cycleLength || 28;
            const periodLength = currentUser?.periodLength || 5;

            const nextPeriod = calculateNextPeriod(lastPeriodDate, cycleLength, []);
            const daysUntilPeriod = nextPeriod ? Math.ceil((nextPeriod - today) / (1000 * 60 * 60 * 24)) : null;
            const cycleDayInfo = calculateCycleDay(lastPeriodDate, today, cycleLength);
            const fertileWindow = calculateFertileWindow(nextPeriod, cycleLength);
            const ovulationResult = calculateOvulation(nextPeriod, cycleLength);
            const ovulationDate = ovulationResult?.date || null;
            const daysUntilOvulation = ovulationDate ? Math.ceil((ovulationDate - today) / (1000 * 60 * 60 * 24)) : null;
            const pmsWindow = calculatePmsDays(nextPeriod);
            const phaseInfo = getCyclePhaseInfo(today, lastPeriodDate, cycleLength, periodLength, []);

            const cycleDay = cycleDayInfo?.day || 1;
            const cycleProgress = Math.min(100, Math.round((cycleDay / cycleLength) * 100));

            setCycleInfo({
                nextPeriod,
                daysUntilPeriod: daysUntilPeriod > 0 ? daysUntilPeriod : 0,
                cycleDay,
                cycleDayInfo,
                fertileWindow,
                ovulationDate,
                daysUntilOvulation,
                pmsWindow,
                lastPeriodDate,
                phaseInfo,
                cycleLength,
                periodLength,
                cycleProgress
            });
        }
    }, [currentUser, periodData, symptomsData]);

    if (loading) {
        return <LoadingSpinner />;
    }

    // Check if user has any period data or has set up their profile
    const hasSetup = periodData?.length > 0 || currentUser?.lastPeriod;

    if (!hasSetup) {
        return (
            <div className="dashboard-container">
                <div className="welcome-message">
                    <h1>Welcome to FlowSync!</h1>
                    <p>Start your journey to better menstrual health tracking. Log your first period or complete your profile to get personalized insights.</p>
                    <div className="welcome-buttons">
                        <button onClick={() => navigate('/trackers', { state: { openTab: 'period' } })} className="primary-button">
                            <i className="fas fa-plus"></i> Log First Period
                        </button>
                        <button onClick={() => navigate('/profile')} className="secondary-button">
                            Complete Profile
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const getPhaseIcon = (phase) => {
        const icons = {
            period: 'fa-tint',
            fertile: 'fa-heart',
            ovulation: 'fa-star',
            pms: 'fa-cloud',
            follicular: 'fa-leaf',
            luteal: 'fa-moon'
        };
        return icons[phase] || 'fa-circle';
    };

    return (
        <div className="dashboard-container">
            {error && <Alert type="error" message={error} />}

            {/* Header */}
            <div className="dashboard-header">
                <h1>Hello, {currentUser?.displayName || 'there'}!</h1>
                <p>Here's your menstrual health overview</p>
                <span className="date-today">
                    <i className="far fa-calendar"></i> {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
            </div>

            {cycleInfo && (
                <>
                    {/* Cycle Overview Banner */}
                    <div className={`cycle-overview-banner ${cycleInfo.phaseInfo?.phase || 'follicular'}`}>
                        <div className="banner-top-row">
                            <div className="banner-phase-info">
                                <div className="banner-phase-icon">
                                    <i className={`fas ${getPhaseIcon(cycleInfo.phaseInfo?.phase)}`}></i>
                                </div>
                                <div className="banner-phase-text">
                                    <span className="banner-phase-label">Current Phase</span>
                                    <h2 className="banner-phase-title">{cycleInfo.phaseInfo?.info?.name || 'Unknown'}</h2>
                                    <p className="banner-phase-desc">{cycleInfo.phaseInfo?.info?.description || ''}</p>
                                </div>
                            </div>
                        </div>

                        <div className="banner-stats-row">
                            <div className="banner-stat">
                                <span className="banner-stat-value">{cycleInfo.cycleDay}</span>
                                <span className="banner-stat-label">Cycle Day</span>
                            </div>
                            <div className="banner-stat period-stat">
                                <span className="banner-stat-value">
                                    <i className="fas fa-calendar-alt"></i>
                                    {cycleInfo.daysUntilPeriod || '—'}
                                </span>
                                <span className="banner-stat-label">Days to Period</span>
                            </div>
                            {cycleInfo.daysUntilOvulation !== null && cycleInfo.daysUntilOvulation > 0 && (
                                <div className="banner-stat ovulation-stat">
                                    <span className="banner-stat-value">
                                        <i className="fas fa-star"></i>
                                        {cycleInfo.daysUntilOvulation}
                                    </span>
                                    <span className="banner-stat-label">Days to Ovulation</span>
                                </div>
                            )}
                            <div className="banner-stat">
                                <span className="banner-stat-value">{cycleInfo.phaseInfo?.info?.energy?.split(' ')[0] || 'Moderate'}</span>
                                <span className="banner-stat-label">Energy Level</span>
                            </div>
                            {(cycleInfo.phaseInfo?.isFertile || cycleInfo.phaseInfo?.isOvulation) && (
                                <div className="banner-stat fertile-stat">
                                    <span className="banner-stat-value">
                                        <i className="fas fa-heart"></i>
                                        {cycleInfo.phaseInfo?.isOvulation ? 'Peak' : 'High'}
                                    </span>
                                    <span className="banner-stat-label">Fertility</span>
                                </div>
                            )}
                        </div>

                        {/* Progress Bar */}
                        <div className="banner-progress">
                            <div className="progress-labels">
                                <span>Day 1</span>
                                <span>Day {cycleInfo.cycleDay} of {cycleInfo.cycleLength}</span>
                                <span>Day {cycleInfo.cycleLength}</span>
                            </div>
                            <div className="progress-bar-track">
                                <div
                                    className="progress-bar-fill"
                                    style={{ width: `${cycleInfo.cycleProgress}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="quick-actions">
                        <Link to="/trackers" state={{ openTab: 'period' }} className="quick-action-btn period-action">
                            <i className="fas fa-tint"></i>
                            <span>Log Period</span>
                        </Link>
                        <Link to="/trackers" state={{ openTab: 'symptom' }} className="quick-action-btn symptom-action">
                            <i className="fas fa-notes-medical"></i>
                            <span>Symptoms</span>
                        </Link>
                        <Link to="/trackers" state={{ openTab: 'mood' }} className="quick-action-btn mood-action">
                            <i className="fas fa-smile"></i>
                            <span>Mood</span>
                        </Link>
                        <Link to="/trackers" state={{ openTab: 'health' }} className="quick-action-btn health-action">
                            <i className="fas fa-heartbeat"></i>
                            <span>Health</span>
                        </Link>
                    </div>

                    {/* Dashboard Grid */}
                    <div className="dashboard-grid">
                        {/* Next Period Card */}
                        <div className="dashboard-card prediction-card next-period">
                            <div className="card-header">
                                <h2>Next Period</h2>
                                <div className="card-header-icon">
                                    <i className="fas fa-calendar-alt"></i>
                                </div>
                            </div>
                            <div className="card-content">
                                <div className="prediction-main-value">
                                    {formatDate(cycleInfo.nextPeriod, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>
                                <div className="prediction-secondary">
                                    {cycleInfo.daysUntilPeriod === 0 ? (
                                        <span>Expected <span className="highlight">today</span></span>
                                    ) : cycleInfo.daysUntilPeriod > 0 ? (
                                        <span>In <span className="highlight">{cycleInfo.daysUntilPeriod}</span> day{cycleInfo.daysUntilPeriod !== 1 ? 's' : ''}</span>
                                    ) : (
                                        <span>Calculating...</span>
                                    )}
                                </div>
                            </div>
                            <div className="card-footer">
                                <Link to="/trackers" className="card-link">View Calendar</Link>
                            </div>
                        </div>

                        {/* Fertility Window Card */}
                        <div className="dashboard-card prediction-card fertility">
                            <div className="card-header">
                                <h2>Fertility Window</h2>
                                <div className="card-header-icon">
                                    <i className="fas fa-heart"></i>
                                </div>
                            </div>
                            <div className="card-content">
                                <div className="prediction-main-value">
                                    {cycleInfo.fertileWindow ? (
                                        `${formatDate(cycleInfo.fertileWindow.start)} - ${formatDate(cycleInfo.fertileWindow.end)}`
                                    ) : 'Calculating...'}
                                </div>
                                <div className="prediction-secondary">
                                    <span>Ovulation: <span className="highlight">{formatDate(cycleInfo.ovulationDate)}</span></span>
                                </div>
                            </div>
                            <div className="card-footer">
                                <Link to="/education/understanding-cycle" className="card-link">Learn More</Link>
                            </div>
                        </div>

                        {/* Cycle Stats Card */}
                        <div className="dashboard-card">
                            <div className="card-header">
                                <h2>Cycle Statistics</h2>
                                <div className="card-header-icon">
                                    <i className="fas fa-chart-pie"></i>
                                </div>
                            </div>
                            <div className="card-content">
                                <div className="stat-row">
                                    <span className="stat-label">Cycle Length</span>
                                    <span className="stat-value">{cycleInfo.cycleLength} days</span>
                                </div>
                                <div className="stat-row">
                                    <span className="stat-label">Period Length</span>
                                    <span className="stat-value">{cycleInfo.periodLength} days</span>
                                </div>
                                <div className="stat-row">
                                    <span className="stat-label">Last Period</span>
                                    <span className="stat-value">{formatDate(cycleInfo.lastPeriodDate)}</span>
                                </div>
                                <div className="stat-row">
                                    <span className="stat-label">Cycles Logged</span>
                                    <span className="stat-value">{periodData?.length || 0}</span>
                                </div>
                            </div>
                            <div className="card-footer">
                                <Link to="/analytics" className="card-link">View Analytics</Link>
                            </div>
                        </div>

                        {/* Phase Tips Card */}
                        <div className="dashboard-card">
                            <div className="card-header">
                                <h2>Tips for {cycleInfo.phaseInfo?.info?.name || 'Today'}</h2>
                                <div className="card-header-icon">
                                    <i className="fas fa-lightbulb"></i>
                                </div>
                            </div>
                            <div className="card-content">
                                <div className="tips-list">
                                    {cycleInfo.phaseInfo?.info?.tips?.slice(0, 3).map((tip, index) => (
                                        <div key={index} className="tip-item">
                                            <i className="fas fa-check-circle"></i>
                                            <span>{tip}</span>
                                        </div>
                                    )) || (
                                            <p>No tips available for this phase.</p>
                                        )}
                                </div>
                            </div>
                            <div className="card-footer">
                                <Link to="/education" className="card-link">More Health Tips</Link>
                            </div>
                        </div>

                        {/* Hormone Info Card */}
                        <div className="dashboard-card">
                            <div className="card-header">
                                <h2>Hormone Status</h2>
                                <div className="card-header-icon">
                                    <i className="fas fa-flask"></i>
                                </div>
                            </div>
                            <div className="card-content">
                                <div className="stat-row">
                                    <span className="stat-label">Hormones</span>
                                    <span className="stat-value">{cycleInfo.phaseInfo?.info?.hormones || 'N/A'}</span>
                                </div>
                                <div className="stat-row">
                                    <span className="stat-label">Energy</span>
                                    <span className="stat-value">{cycleInfo.phaseInfo?.info?.energy || 'Moderate'}</span>
                                </div>
                                <div className="stat-row">
                                    <span className="stat-label">Phase Duration</span>
                                    <span className="stat-value">
                                        {cycleInfo.phaseInfo?.phase === 'period' ? `${cycleInfo.periodLength} days` :
                                            cycleInfo.phaseInfo?.phase === 'fertile' ? '6-7 days' :
                                                cycleInfo.phaseInfo?.phase === 'ovulation' ? '1 day' :
                                                    cycleInfo.phaseInfo?.phase === 'pms' ? '7-10 days' : '7-10 days'}
                                    </span>
                                </div>
                            </div>
                            <div className="card-footer">
                                <Link to="/education/understanding-cycle" className="card-link">Learn About Hormones</Link>
                            </div>
                        </div>

                        {/* Health Insights Card */}
                        <div className="dashboard-card">
                            <div className="card-header">
                                <h2>Health Insights</h2>
                                <div className="card-header-icon">
                                    <i className="fas fa-brain"></i>
                                </div>
                            </div>
                            <div className="card-content">
                                <div className="insights-list">
                                    {insights.length > 0 ? (
                                        insights.slice(0, 2).map((insight, index) => (
                                            <div key={index} className={`insight-item ${insight.type}`}>
                                                <div className="insight-icon">
                                                    <i className={`fas fa-${insight.icon}`}></i>
                                                </div>
                                                <div className="insight-content">
                                                    <h4>{insight.title}</h4>
                                                    <p>{insight.description}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="insight-item tip">
                                            <div className="insight-icon">
                                                <i className="fas fa-info-circle"></i>
                                            </div>
                                            <div className="insight-content">
                                                <h4>Track More Data</h4>
                                                <p>Log symptoms and moods regularly for personalized insights.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="card-footer">
                                <Link to="/analytics" className="card-link">See All Insights</Link>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
