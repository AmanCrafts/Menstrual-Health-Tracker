import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import { useData } from '../contexts/DataContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import '../styles/analytics.css';

export default function Analytics() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { userProfile, periodData, symptomsData, notesData, loading, error } = useData();

    const [cycleStats, setCycleStats] = useState(null);
    const [timeRange, setTimeRange] = useState('6months'); // '3months', '6months', '1year', 'all'
    const [symptomStats, setSymptomStats] = useState({});
    const [moodStats, setMoodStats] = useState({});
    const [hasEnoughData, setHasEnoughData] = useState(false);

    useEffect(() => {
        if (!currentUser) {
            navigate('/signin');
            return;
        }

        // Check if we have enough data to show analytics
        if (periodData && periodData.logs && periodData.logs.length >= 2) {
            setHasEnoughData(true);
            calculateStatistics();
        } else {
            setHasEnoughData(false);
        }
    }, [currentUser, periodData, symptomsData, notesData, timeRange, navigate]);

    // Calculate all statistics
    const calculateStatistics = () => {
        calculateCycleStatistics();
        calculateSymptomStatistics();
        calculateMoodStatistics();
    };

    // Calculate statistics based on cycle logs
    const calculateCycleStatistics = () => {
        if (!periodData || !periodData.logs || periodData.logs.length < 2) return;

        const sortedLogs = [...periodData.logs].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

        // Filter logs based on selected time range
        const filteredLogs = filterLogsByTimeRange(sortedLogs);

        if (filteredLogs.length < 2) {
            setCycleStats({
                avgCycleLength: userProfile?.cycleLength || 28,
                minCycleLength: userProfile?.cycleLength || 28,
                maxCycleLength: userProfile?.cycleLength || 28,
                avgPeriodLength: userProfile?.periodLength || 5,
                cycleRegularity: 'Not enough data',
                cycleLengths: [],
                periodLengths: []
            });
            return;
        }

        // Calculate cycle lengths between consecutive period start dates
        const cycleLengths = [];
        const periodLengths = [];

        for (let i = 0; i < filteredLogs.length; i++) {
            // Calculate period length
            if (filteredLogs[i].endDate) {
                const startDate = new Date(filteredLogs[i].startDate);
                const endDate = new Date(filteredLogs[i].endDate);
                const lengthInDays = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
                periodLengths.push({
                    date: startDate,
                    length: lengthInDays
                });
            }

            // Calculate cycle length (distance to next period)
            if (i < filteredLogs.length - 1) {
                const currentStart = new Date(filteredLogs[i].startDate);
                const nextStart = new Date(filteredLogs[i + 1].startDate);
                const cycleLength = Math.round((nextStart - currentStart) / (1000 * 60 * 60 * 24));

                if (cycleLength > 10 && cycleLength < 45) { // Filter out likely incorrect data
                    cycleLengths.push({
                        date: currentStart,
                        length: cycleLength
                    });
                }
            }
        }

        // Calculate statistics
        const cycleValues = cycleLengths.map(c => c.length);
        const periodValues = periodLengths.map(p => p.length);

        const avgCycleLength = cycleValues.length > 0
            ? Math.round(cycleValues.reduce((sum, val) => sum + val, 0) / cycleValues.length)
            : userProfile?.cycleLength || 28;

        const avgPeriodLength = periodValues.length > 0
            ? Math.round(periodValues.reduce((sum, val) => sum + val, 0) / periodValues.length * 10) / 10
            : userProfile?.periodLength || 5;

        const minCycleLength = cycleValues.length > 0 ? Math.min(...cycleValues) : avgCycleLength;
        const maxCycleLength = cycleValues.length > 0 ? Math.max(...cycleValues) : avgCycleLength;

        // Calculate regularity
        const cycleVariance = calculateVariance(cycleValues);
        let cycleRegularity = "Regular";

        if (cycleVariance > 20) {
            cycleRegularity = "Highly Irregular";
        } else if (cycleVariance > 10) {
            cycleRegularity = "Somewhat Irregular";
        } else if (cycleVariance > 5) {
            cycleRegularity = "Slightly Irregular";
        }

        setCycleStats({
            avgCycleLength,
            minCycleLength,
            maxCycleLength,
            avgPeriodLength,
            cycleRegularity,
            cycleLengths,
            periodLengths
        });
    };

    // Calculate symptom statistics
    const calculateSymptomStatistics = () => {
        if (!symptomsData || !symptomsData.logs) return;

        const filteredLogs = filterLogsByTimeRange(symptomsData.logs);

        // Count occurrences of each symptom
        const symptomCounts = {};

        filteredLogs.forEach(log => {
            if (!log.symptoms) return;

            Object.entries(log.symptoms).forEach(([symptom, present]) => {
                if (present) {
                    symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
                }
            });
        });

        setSymptomStats(symptomCounts);
    };

    // Calculate mood statistics
    const calculateMoodStatistics = () => {
        if (!notesData || !notesData.moodLogs) return;

        const filteredLogs = filterLogsByTimeRange(notesData.moodLogs);

        // Count occurrences of each mood
        const moodCounts = {};

        filteredLogs.forEach(log => {
            if (log.mood) {
                moodCounts[log.mood] = (moodCounts[log.mood] || 0) + 1;
            }
        });

        setMoodStats(moodCounts);
    };

    // Helper function to calculate variance
    const calculateVariance = (values) => {
        if (values.length <= 1) return 0;

        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const squareDiffs = values.map(value => {
            const diff = value - mean;
            return diff * diff;
        });
        const variance = squareDiffs.reduce((sum, val) => sum + val, 0) / values.length;
        return Math.sqrt(variance);
    };

    // Filter logs based on time range
    const filterLogsByTimeRange = (logs) => {
        if (!logs) return [];
        if (timeRange === 'all') return logs;

        const now = new Date();
        let cutoffDate = new Date();

        switch (timeRange) {
            case '3months':
                cutoffDate.setMonth(now.getMonth() - 3);
                break;
            case '6months':
                cutoffDate.setMonth(now.getMonth() - 6);
                break;
            case '1year':
                cutoffDate.setFullYear(now.getFullYear() - 1);
                break;
            default:
                cutoffDate.setMonth(now.getMonth() - 6);
        }

        return logs.filter(log => {
            const logDate = new Date(log.date || log.startDate);
            return logDate >= cutoffDate;
        });
    };

    // Handle time range change
    const handleTimeRangeChange = (event) => {
        setTimeRange(event.target.value);
    };

    // Format symptom name for display
    const formatSymptomName = (symptomKey) => {
        // Convert camelCase to words with spaces and capitalize first letter
        return symptomKey
            .replace(/([A-Z])/g, ' $1') // Insert space before capital letters
            .replace(/^./, str => str.toUpperCase()); // Capitalize first letter
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!userProfile || !userProfile.lastPeriod) {
        return (
            <div className="analytics-container">
                <div className="welcome-message">
                    <h1>Analytics</h1>
                    <p>Please complete your profile to view cycle analytics</p>
                    <button onClick={() => navigate('/profile')} className="primary-button">
                        Complete Profile
                    </button>
                </div>
            </div>
        );
    }

    if (!hasEnoughData) {
        return (
            <div className="analytics-container">
                <div className="analytics-header">
                    <h1>Analytics</h1>
                    <p>Log at least two periods to see detailed analytics</p>
                </div>
                <div className="data-needed-card">
                    <div className="icon-container">
                        <i className="fas fa-chart-line"></i>
                    </div>
                    <h2>More Data Needed</h2>
                    <p>Analytics will become available after you log at least two menstrual periods.</p>
                    <button onClick={() => navigate('/trackers', { state: { openTab: 'period' } })} className="primary-button">
                        Log My Period
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="analytics-container">
            {error && <Alert type="error" message={error} />}

            <div className="analytics-header">
                <h1>Analytics</h1>
                <div className="time-range-selector">
                    <label htmlFor="time-range">Time Range: </label>
                    <select
                        id="time-range"
                        value={timeRange}
                        onChange={handleTimeRangeChange}
                        className="time-range-select"
                    >
                        <option value="3months">3 Months</option>
                        <option value="6months">6 Months</option>
                        <option value="1year">1 Year</option>
                        <option value="all">All Time</option>
                    </select>
                </div>
            </div>

            <div className="analytics-grid">
                {cycleStats && (
                    <div className="statistics-card">
                        <h2>Cycle Statistics</h2>
                        <div className="statistics-grid">
                            <div className="statistic-item">
                                <div className="statistic-value">{cycleStats.avgCycleLength}</div>
                                <div className="statistic-label">Avg. Cycle Length (days)</div>
                            </div>
                            <div className="statistic-item">
                                <div className="statistic-value">{cycleStats.minCycleLength}-{cycleStats.maxCycleLength}</div>
                                <div className="statistic-label">Cycle Length Range</div>
                            </div>
                            <div className="statistic-item">
                                <div className="statistic-value">{cycleStats.avgPeriodLength}</div>
                                <div className="statistic-label">Avg. Period Length (days)</div>
                            </div>

                            <div className="cycle-regularity">
                                <div className="regularity-value">{cycleStats.cycleRegularity}</div>
                                <div className="regularity-label">Cycle Regularity</div>
                            </div>
                        </div>
                    </div>
                )}

                {cycleStats && cycleStats.cycleLengths.length > 0 && (
                    <div className="chart-card">
                        <h2>Cycle Length Trends</h2>
                        <div className="chart-container cycle-chart">
                            {cycleStats.cycleLengths.map((cycle, index) => (
                                <div key={index} className="bar-container">
                                    <div
                                        className="bar"
                                        style={{
                                            height: `${(cycle.length / 40) * 100}%`,
                                            backgroundColor: '#6C63FF'
                                        }}
                                        title={`Cycle starting ${new Date(cycle.date).toLocaleDateString()}: ${cycle.length} days`}
                                    ></div>
                                    <div className="bar-label">{cycle.length}</div>
                                </div>
                            ))}
                        </div>
                        <div className="chart-legend">
                            <div className="legend-item">
                                <div className="legend-color" style={{ backgroundColor: '#6C63FF' }}></div>
                                <span>Cycle Length (days)</span>
                            </div>
                        </div>
                    </div>
                )}

                {Object.keys(symptomStats).length > 0 && (
                    <div className="chart-card">
                        <h2>Most Common Symptoms</h2>
                        <div className="chart-container">
                            <div className="symptom-chart">
                                {Object.entries(symptomStats)
                                    .sort((a, b) => b[1] - a[1])
                                    .slice(0, 5)
                                    .map(([symptom, count], index) => (
                                        <div key={symptom} className="horizontal-bar-container">
                                            <div className="horizontal-bar-label">
                                                {formatSymptomName(symptom)}
                                            </div>
                                            <div className="horizontal-bar-wrapper">
                                                <div
                                                    className="horizontal-bar"
                                                    style={{
                                                        width: `${(count / 30) * 100}%`,
                                                        backgroundColor: '#FF6B6B'
                                                    }}
                                                    title={`${count} occurrences`}
                                                ></div>
                                                <span className="horizontal-bar-value">{count}</span>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                )}

                {Object.keys(moodStats).length > 0 && (
                    <div className="chart-card">
                        <h2>Mood Patterns</h2>
                        <div className="chart-container">
                            <div className="mood-chart">
                                {Object.entries(moodStats)
                                    .sort((a, b) => b[1] - a[1])
                                    .map(([mood, count], index) => (
                                        <div key={mood} className="mood-item">
                                            <div className="mood-icon">
                                                <i className={`fas fa-${getMoodIcon(mood)}`}></i>
                                            </div>
                                            <div className="mood-name">{mood}</div>
                                            <div className="mood-count">{count}</div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    // Helper function to get icon for mood
    function getMoodIcon(mood) {
        const moodIcons = {
            happy: 'smile-beam',
            calm: 'smile',
            tired: 'tired',
            anxious: 'flushed',
            irritable: 'angry',
            sad: 'sad-tear',
            stressed: 'grimace',
            emotional: 'sad-cry',
        };

        return moodIcons[mood.toLowerCase()] || 'meh';
    }
}
