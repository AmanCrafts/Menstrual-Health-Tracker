import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import { useData } from '../contexts/DataContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import '../styles/analytics.css';

export default function Analytics() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { periodData, symptomsData, moodsData, loading, error } = useData();

    const [cycleStats, setCycleStats] = useState(null);
    const [timeRange, setTimeRange] = useState('6months');
    const [symptomStats, setSymptomStats] = useState({});
    const [moodStats, setMoodStats] = useState({});
    const [hasEnoughData, setHasEnoughData] = useState(false);
    const [wellnessScore, setWellnessScore] = useState(0);
    const [wellnessLevel, setWellnessLevel] = useState({ level: 'Limited', color: '#EF4444' });
    const [healthMetrics, setHealthMetrics] = useState({
        avgSymptomsPerLog: 0,
        mostCommonSymptom: null,
        mostCommonMood: null,
        negativeEmotionPercentage: 0,
    });

    const filterLogsByTimeRange = useCallback(
        (logs) => {
            if (!logs) return [];
            if (timeRange === 'all') return logs;

            const now = new Date();
            const cutoffDate = new Date();

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

            return logs.filter((log) => {
                const logDate = new Date(log.date || log.startDate);
                return logDate >= cutoffDate;
            });
        },
        [timeRange]
    );

    const calculateVariance = useCallback((values) => {
        if (values.length <= 1) return 0;

        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const squareDiffs = values.map((value) => {
            const diff = value - mean;
            return diff * diff;
        });
        const variance = squareDiffs.reduce((sum, val) => sum + val, 0) / values.length;
        return Math.sqrt(variance);
    }, []);

    const calculateCycleStatistics = useCallback(() => {
        if (!periodData || periodData.length < 2) return;

        const sortedLogs = [...periodData].sort(
            (a, b) => new Date(a.startDate) - new Date(b.startDate)
        );

        const filteredLogs = filterLogsByTimeRange(sortedLogs);

        if (filteredLogs.length < 2) {
            setCycleStats({
                avgCycleLength: currentUser?.cycleLength || 28,
                minCycleLength: currentUser?.cycleLength || 28,
                maxCycleLength: currentUser?.cycleLength || 28,
                avgPeriodLength: currentUser?.periodLength || 5,
                cycleRegularity: 'Not enough data',
                cycleLengths: [],
                periodLengths: [],
            });
            return;
        }

        const cycleLengths = [];
        const periodLengths = [];

        for (let i = 0; i < filteredLogs.length; i++) {
            if (filteredLogs[i].endDate) {
                const startDate = new Date(filteredLogs[i].startDate);
                const endDate = new Date(filteredLogs[i].endDate);
                const lengthInDays = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
                periodLengths.push({
                    date: startDate,
                    length: lengthInDays,
                });
            }

            if (i < filteredLogs.length - 1) {
                const currentStart = new Date(filteredLogs[i].startDate);
                const nextStart = new Date(filteredLogs[i + 1].startDate);
                const cycleLength = Math.round((nextStart - currentStart) / (1000 * 60 * 60 * 24));

                if (cycleLength > 10 && cycleLength < 45) {
                    cycleLengths.push({
                        date: currentStart,
                        length: cycleLength,
                    });
                }
            }
        }

        const cycleValues = cycleLengths.map((c) => c.length);
        const periodValues = periodLengths.map((p) => p.length);

        const avgCycleLength =
            cycleValues.length > 0
                ? Math.round(cycleValues.reduce((sum, val) => sum + val, 0) / cycleValues.length)
                : currentUser?.cycleLength || 28;

        const avgPeriodLength =
            periodValues.length > 0
                ? Math.round(
                      (periodValues.reduce((sum, val) => sum + val, 0) / periodValues.length) * 10
                  ) / 10
                : currentUser?.periodLength || 5;

        const minCycleLength = cycleValues.length > 0 ? Math.min(...cycleValues) : avgCycleLength;
        const maxCycleLength = cycleValues.length > 0 ? Math.max(...cycleValues) : avgCycleLength;

        const cycleVariance = calculateVariance(cycleValues);
        let cycleRegularity = 'Regular';

        if (cycleVariance > 20) {
            cycleRegularity = 'Highly Irregular';
        } else if (cycleVariance > 10) {
            cycleRegularity = 'Somewhat Irregular';
        } else if (cycleVariance > 5) {
            cycleRegularity = 'Slightly Irregular';
        }

        setCycleStats({
            avgCycleLength,
            minCycleLength,
            maxCycleLength,
            avgPeriodLength,
            cycleRegularity,
            cycleLengths,
            periodLengths,
        });
    }, [periodData, currentUser, filterLogsByTimeRange, calculateVariance]);

    const calculateSymptomStatistics = useCallback(() => {
        if (!symptomsData || symptomsData.length === 0) return;

        const filteredLogs = filterLogsByTimeRange(symptomsData);

        const symptomCounts = {};

        filteredLogs.forEach((log) => {
            if (!log.symptoms) return;

            Object.entries(log.symptoms).forEach(([symptom, present]) => {
                if (present) {
                    symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
                }
            });
        });

        setSymptomStats(symptomCounts);
    }, [symptomsData, filterLogsByTimeRange]);

    const calculateMoodStatistics = useCallback(() => {
        if (!moodsData || moodsData.length === 0) return;

        const filteredLogs = filterLogsByTimeRange(moodsData);

        const moodCounts = {};

        filteredLogs.forEach((log) => {
            if (log.mood) {
                moodCounts[log.mood] = (moodCounts[log.mood] || 0) + 1;
            }
        });

        setMoodStats(moodCounts);
    }, [moodsData, filterLogsByTimeRange]);

    const calculateStatistics = useCallback(() => {
        calculateCycleStatistics();
        calculateSymptomStatistics();
        calculateMoodStatistics();
    }, [calculateCycleStatistics, calculateSymptomStatistics, calculateMoodStatistics]);

    useEffect(() => {
        if (periodData && periodData.length >= 2) {
            setHasEnoughData(true);
            calculateStatistics();
        } else {
            setHasEnoughData(false);
        }
    }, [periodData, calculateStatistics]);

    /**
     * Calculate wellness score based on health metrics
     * Scoring: Start at 100, deduct points for health concerns
     */
    const calculateWellnessScore = useCallback(() => {
        let score = 100;
        const filteredPeriodData = filterLogsByTimeRange(periodData || []);
        const filteredSymptomData = filterLogsByTimeRange(symptomsData || []);
        const filteredMoodData = filterLogsByTimeRange(moodsData || []);

        if (filteredPeriodData.length < 2) {
            return 50;
        }

        // Cycle Regularity (30 points impact)
        if (cycleStats) {
            if (cycleStats.cycleRegularity === 'Regular') {
                // No deduction
            } else if (cycleStats.cycleRegularity === 'Slightly Irregular') {
                score -= 8;
            } else if (cycleStats.cycleRegularity === 'Somewhat Irregular') {
                score -= 18;
            } else if (cycleStats.cycleRegularity === 'Highly Irregular') {
                score -= 30;
            }

            // Cycle Length: Normal 21-35 days, ideal 26-32 days (15 points impact)
            const avgCycle = cycleStats.avgCycleLength;
            if (avgCycle >= 26 && avgCycle <= 32) {
                // No deduction
            } else if (avgCycle >= 21 && avgCycle <= 35) {
                score -= 5;
            } else if (avgCycle < 21) {
                score -= 15;
            } else if (avgCycle > 35) {
                score -= 12;
            }

            // Period Length: Normal 3-7 days, ideal 4-5 days (10 points impact)
            const avgPeriod = cycleStats.avgPeriodLength;
            if (avgPeriod >= 4 && avgPeriod <= 5) {
                // No deduction
            } else if (avgPeriod >= 3 && avgPeriod <= 7) {
                score -= 3;
            } else if (avgPeriod < 3) {
                score -= 8;
            } else if (avgPeriod > 7) {
                score -= 10;
            }
        }

        // Symptom Severity (25 points impact)
        if (filteredSymptomData.length > 0) {
            const totalSymptomOccurrences = Object.values(symptomStats).reduce(
                (sum, count) => sum + count,
                0
            );
            const avgSymptomsPerLog = totalSymptomOccurrences / filteredSymptomData.length;
            const symptomTypes = Object.keys(symptomStats).length;

            if (avgSymptomsPerLog >= 6 || symptomTypes >= 8) {
                score -= 25;
            } else if (avgSymptomsPerLog >= 4 || symptomTypes >= 6) {
                score -= 18;
            } else if (avgSymptomsPerLog >= 2 || symptomTypes >= 4) {
                score -= 10;
            } else if (avgSymptomsPerLog >= 1 || symptomTypes >= 2) {
                score -= 5;
            }
        }

        // Emotional Health (20 points impact)
        if (filteredMoodData.length > 0) {
            const moodScores = {
                happy: 0,
                calm: 0,
                energetic: 0,
                content: 0,
                tired: -5,
                stressed: -8,
                anxious: -10,
                irritable: -12,
                sad: -12,
                angry: -10,
                emotional: -8,
                depressed: -15,
            };

            let moodImpact = 0;
            let totalMoodLogs = 0;

            Object.entries(moodStats).forEach(([mood, count]) => {
                const moodScore = moodScores[mood.toLowerCase()] || -5;
                moodImpact += moodScore * count;
                totalMoodLogs += count;
            });

            const avgMoodImpact = totalMoodLogs > 0 ? moodImpact / totalMoodLogs : 0;

            if (avgMoodImpact < -10) {
                score -= 20;
            } else if (avgMoodImpact < -7) {
                score -= 15;
            } else if (avgMoodImpact < -4) {
                score -= 10;
            } else if (avgMoodImpact < -2) {
                score -= 5;
            }
        }

        return Math.max(0, Math.min(100, score));
    }, [
        cycleStats,
        periodData,
        symptomsData,
        moodsData,
        symptomStats,
        moodStats,
        filterLogsByTimeRange,
    ]);

    const getWellnessLevel = useCallback((score) => {
        if (score >= 85)
            return {
                level: 'Excellent',
                color: '#10B981',
                description: 'Optimal menstrual health',
            };
        if (score >= 70)
            return {
                level: 'Good',
                color: '#3B82F6',
                description: 'Healthy cycle with minor variations',
            };
        if (score >= 55)
            return { level: 'Fair', color: '#F59E0B', description: 'Some health concerns noted' };
        if (score >= 40)
            return {
                level: 'Needs Attention',
                color: '#F97316',
                description: 'Multiple health indicators flagged',
            };
        return {
            level: 'Concerning',
            color: '#EF4444',
            description: 'Significant health concerns detected',
        };
    }, []);

    useEffect(() => {
        if (hasEnoughData) {
            const score = calculateWellnessScore();
            setWellnessScore(score);
            setWellnessLevel(getWellnessLevel(score));

            // Calculate additional metrics
            const filteredSymptoms = filterLogsByTimeRange(symptomsData || []);
            // const filteredMoods = filterLogsByTimeRange(moodsData || []);

            const totalSymptomOccurrences = Object.values(symptomStats).reduce(
                (sum, count) => sum + count,
                0
            );
            const avgSymptomsPerLog =
                filteredSymptoms.length > 0
                    ? (totalSymptomOccurrences / filteredSymptoms.length).toFixed(1)
                    : 0;

            const mostCommonSymptom =
                Object.keys(symptomStats).length > 0
                    ? Object.entries(symptomStats).sort((a, b) => b[1] - a[1])[0]
                    : null;

            const mostCommonMood =
                Object.keys(moodStats).length > 0
                    ? Object.entries(moodStats).sort((a, b) => b[1] - a[1])[0]
                    : null;

            const negativeMoods = [
                'sad',
                'anxious',
                'irritable',
                'stressed',
                'depressed',
                'angry',
                'emotional',
            ];
            const negativeCount = Object.entries(moodStats)
                .filter(([mood]) => negativeMoods.includes(mood.toLowerCase()))
                .reduce((sum, [, count]) => sum + count, 0);
            const totalMoods = Object.values(moodStats).reduce((sum, count) => sum + count, 0);
            const negativePercent =
                totalMoods > 0 ? ((negativeCount / totalMoods) * 100).toFixed(1) : 0;

            setHealthMetrics({
                avgSymptomsPerLog,
                mostCommonSymptom,
                mostCommonMood,
                negativeEmotionPercentage: negativePercent,
            });
        }
    }, [
        hasEnoughData,
        calculateWellnessScore,
        getWellnessLevel,
        symptomStats,
        moodStats,
        symptomsData,
        moodsData,
        filterLogsByTimeRange,
    ]);

    const handleTimeRangeChange = (event) => {
        setTimeRange(event.target.value);
    };

    const formatSymptomName = (symptomKey) => {
        return symptomKey.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
    };

    if (loading) {
        return <LoadingSpinner />;
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
                    <p>
                        Analytics will become available after you log at least two menstrual
                        periods.
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate('/trackers', { state: { openTab: 'period' } })}
                        className="primary-button"
                    >
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
                <div className="header-content">
                    <h1>Analytics</h1>
                    <p className="header-subtitle">
                        Track your menstrual health patterns and insights
                    </p>
                </div>
                <div className="time-range-selector">
                    <label htmlFor="time-range">
                        <i className="fas fa-calendar"></i> Time Range:{' '}
                    </label>
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

            <div className="wellness-banner">
                <div className="wellness-content">
                    <div className="wellness-score-container">
                        <div
                            className="wellness-circle"
                            style={{ borderColor: wellnessLevel.color }}
                        >
                            <div className="wellness-score-value">{wellnessScore}</div>
                            <div className="wellness-score-label">Score</div>
                        </div>
                    </div>
                    <div className="wellness-info">
                        <h2>Menstrual Health Score</h2>
                        <div className="wellness-status" style={{ color: wellnessLevel.color }}>
                            <i className="fas fa-heart"></i>
                            {wellnessLevel.level}
                        </div>
                        <p>{wellnessLevel.description}</p>
                    </div>
                </div>
            </div>

            <div className="analytics-grid">
                {/* Key Metrics Overview */}
                <div className="metrics-overview">
                    <div className="metric-card">
                        <div
                            className="metric-icon"
                            style={{ background: 'linear-gradient(135deg, #EC4899, #F43F5E)' }}
                        >
                            <i className="fas fa-calendar-alt"></i>
                        </div>
                        <div className="metric-content">
                            <div className="metric-value">{cycleStats?.avgCycleLength || 28}</div>
                            <div className="metric-label">Avg Cycle</div>
                            <div className="metric-unit">days</div>
                        </div>
                    </div>
                    <div className="metric-card">
                        <div
                            className="metric-icon"
                            style={{ background: 'linear-gradient(135deg, #8B5CF6, #A78BFA)' }}
                        >
                            <i className="fas fa-droplet"></i>
                        </div>
                        <div className="metric-content">
                            <div className="metric-value">{cycleStats?.avgPeriodLength || 5}</div>
                            <div className="metric-label">Avg Period</div>
                            <div className="metric-unit">days</div>
                        </div>
                    </div>
                    <div className="metric-card">
                        <div
                            className="metric-icon"
                            style={{ background: 'linear-gradient(135deg, #F59E0B, #FBBF24)' }}
                        >
                            <i className="fas fa-notes-medical"></i>
                        </div>
                        <div className="metric-content">
                            <div className="metric-value">{healthMetrics.avgSymptomsPerLog}</div>
                            <div className="metric-label">Symptoms</div>
                            <div className="metric-unit">per log</div>
                        </div>
                    </div>
                    <div className="metric-card">
                        <div
                            className="metric-icon"
                            style={{ background: 'linear-gradient(135deg, #10B981, #34D399)' }}
                        >
                            <i className="fas fa-check-circle"></i>
                        </div>
                        <div className="metric-content">
                            <div className="metric-value">
                                {cycleStats?.cycleRegularity || 'N/A'}
                            </div>
                            <div className="metric-label">Regularity</div>
                            <div className="metric-unit">&nbsp;</div>
                        </div>
                    </div>
                </div>

                {cycleStats && (
                    <div className="statistics-card">
                        <div className="card-header">
                            <h2>
                                <i className="fas fa-heartbeat"></i> Cycle Statistics
                            </h2>
                        </div>
                        <div className="statistics-grid">
                            <div className="statistic-item">
                                <div className="statistic-icon">
                                    <i className="fas fa-sync-alt"></i>
                                </div>
                                <div className="statistic-value">{cycleStats.avgCycleLength}</div>
                                <div className="statistic-label">
                                    Avg. Cycle
                                    <br />
                                    Length (days)
                                </div>
                            </div>
                            <div className="statistic-item">
                                <div className="statistic-icon">
                                    <i className="fas fa-arrows-alt-h"></i>
                                </div>
                                <div className="statistic-value">
                                    {cycleStats.minCycleLength}-{cycleStats.maxCycleLength}
                                </div>
                                <div className="statistic-label">
                                    Cycle Length
                                    <br />
                                    Range
                                </div>
                            </div>
                            <div className="statistic-item">
                                <div className="statistic-icon">
                                    <i className="fas fa-droplet"></i>
                                </div>
                                <div className="statistic-value">{cycleStats.avgPeriodLength}</div>
                                <div className="statistic-label">
                                    Avg. Period
                                    <br />
                                    Length (days)
                                </div>
                            </div>

                            <div className="cycle-regularity">
                                <div className="regularity-icon">
                                    <i className="fas fa-check-circle"></i>
                                </div>
                                <div className="regularity-value">{cycleStats.cycleRegularity}</div>
                                <div className="regularity-label">Cycle Regularity</div>
                            </div>
                        </div>
                    </div>
                )}

                {cycleStats && cycleStats.periodLengths.length > 0 && (
                    <div className="chart-card">
                        <div className="card-header">
                            <h2>
                                <i className="fas fa-chart-line"></i> Period Length Trends
                            </h2>
                        </div>
                        {cycleStats.periodLengths.length > 10 ? (
                            <p className="chart-info">Showing last 10 periods</p>
                        ) : null}
                        <div className="chart-container cycle-chart">
                            {cycleStats.periodLengths.slice(-10).map((period, index) => (
                                <div key={index} className="bar-container">
                                    <div
                                        className="bar"
                                        style={{
                                            height: `${(period.length / 10) * 100}%`,
                                            backgroundColor: '#EC4899',
                                        }}
                                        title={`Period starting ${new Date(period.date).toLocaleDateString()}: ${period.length} days`}
                                    ></div>
                                    <div className="bar-label">{period.length}</div>
                                </div>
                            ))}
                        </div>
                        <div className="chart-legend">
                            <div className="legend-item">
                                <div
                                    className="legend-color"
                                    style={{ backgroundColor: '#EC4899' }}
                                ></div>
                                <span>Period Length (days)</span>
                            </div>
                        </div>
                    </div>
                )}

                {cycleStats && cycleStats.cycleLengths.length > 0 && (
                    <div className="chart-card">
                        <div className="card-header">
                            <h2>
                                <i className="fas fa-chart-bar"></i> Cycle Length Trends
                            </h2>
                        </div>
                        {cycleStats.cycleLengths.length > 10 ? (
                            <p className="chart-info">Showing last 10 cycles</p>
                        ) : null}
                        <div className="chart-container cycle-chart">
                            {cycleStats.cycleLengths.slice(-10).map((cycle, index) => (
                                <div key={index} className="bar-container">
                                    <div
                                        className="bar"
                                        style={{
                                            height: `${(cycle.length / 40) * 100}%`,
                                            backgroundColor: '#6C63FF',
                                        }}
                                        title={`Cycle starting ${new Date(cycle.date).toLocaleDateString()}: ${cycle.length} days`}
                                    ></div>
                                    <div className="bar-label">{cycle.length}</div>
                                </div>
                            ))}
                        </div>
                        <div className="chart-legend">
                            <div className="legend-item">
                                <div
                                    className="legend-color"
                                    style={{ backgroundColor: '#6C63FF' }}
                                ></div>
                                <span>Cycle Length (days)</span>
                            </div>
                        </div>
                    </div>
                )}

                {Object.keys(symptomStats).length > 0 && (
                    <div className="chart-card">
                        <div className="card-header">
                            <h2>
                                <i className="fas fa-exclamation-circle"></i> Most Common Symptoms
                            </h2>
                        </div>
                        <div className="chart-container">
                            <div className="symptom-chart">
                                {Object.entries(symptomStats)
                                    .sort((a, b) => b[1] - a[1])
                                    .slice(0, 5)
                                    .map(([symptom, count]) => (
                                        <div key={symptom} className="horizontal-bar-container">
                                            <div className="horizontal-bar-label">
                                                {formatSymptomName(symptom)}
                                            </div>
                                            <div className="horizontal-bar-wrapper">
                                                <div
                                                    className="horizontal-bar"
                                                    style={{
                                                        width: `${(count / 30) * 100}%`,
                                                        backgroundColor: '#FF6B6B',
                                                    }}
                                                    title={`${count} occurrences`}
                                                ></div>
                                                <span className="horizontal-bar-value">
                                                    {count}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                )}

                {Object.keys(moodStats).length > 0 && (
                    <div className="chart-card mood-distribution-card">
                        <div className="card-header">
                            <h2>
                                <i className="fas fa-laugh"></i> Mood Patterns
                            </h2>
                        </div>
                        <div className="chart-container mood-chart-container">
                            <div className="mood-chart">
                                {Object.entries(moodStats)
                                    .sort((a, b) => b[1] - a[1])
                                    .map(([mood, count]) => (
                                        <div key={mood} className="mood-item">
                                            <div className="mood-icon">
                                                <i className={`fas fa-${getMoodIcon(mood)}`}></i>
                                            </div>
                                            <div className="mood-name">{mood}</div>
                                            <div className="mood-count">{count}</div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Comparison Cards */}
                <div className="comparison-card">
                    <div className="card-header">
                        <h2>
                            <i className="fas fa-balance-scale"></i> Quick Comparisons
                        </h2>
                    </div>
                    <div className="comparison-grid">
                        <div className="comparison-item">
                            <div className="comparison-label">Most Common Mood</div>
                            <div className="comparison-value">
                                {healthMetrics.mostCommonMood ? (
                                    <>
                                        <i
                                            className={`fas fa-${getMoodIcon(healthMetrics.mostCommonMood[0])}`}
                                        ></i>
                                        <span>{healthMetrics.mostCommonMood[0]}</span>
                                        <span className="comparison-count">
                                            ({healthMetrics.mostCommonMood[1]}x)
                                        </span>
                                    </>
                                ) : (
                                    'N/A'
                                )}
                            </div>
                        </div>
                        <div className="comparison-item">
                            <div className="comparison-label">Most Common Symptom</div>
                            <div className="comparison-value">
                                {healthMetrics.mostCommonSymptom ? (
                                    <>
                                        <span>
                                            {formatSymptomName(healthMetrics.mostCommonSymptom[0])}
                                        </span>
                                        <span className="comparison-count">
                                            ({healthMetrics.mostCommonSymptom[1]}x)
                                        </span>
                                    </>
                                ) : (
                                    'N/A'
                                )}
                            </div>
                        </div>
                        <div className="comparison-item">
                            <div className="comparison-label">Cycle Range</div>
                            <div className="comparison-value">
                                {cycleStats ? (
                                    <>
                                        <span>
                                            {cycleStats.minCycleLength}-{cycleStats.maxCycleLength}{' '}
                                            days
                                        </span>
                                        <span className="comparison-count">
                                            ({cycleStats.maxCycleLength - cycleStats.minCycleLength}{' '}
                                            variation)
                                        </span>
                                    </>
                                ) : (
                                    'N/A'
                                )}
                            </div>
                        </div>
                        <div className="comparison-item">
                            <div className="comparison-label">Negative Emotions</div>
                            <div
                                className="comparison-value"
                                style={{
                                    color:
                                        healthMetrics.negativeEmotionPercentage > 50
                                            ? '#EF4444'
                                            : '#10B981',
                                }}
                            >
                                <span>{healthMetrics.negativeEmotionPercentage}%</span>
                                <span className="comparison-count">of moods</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Activity Summary */}
                <div className="activity-summary">
                    <div className="activity-item">
                        <div className="activity-number">
                            {filterLogsByTimeRange(periodData).length}
                        </div>
                        <div className="activity-label">Period Logs</div>
                        <div className="activity-icon" style={{ color: '#EC4899' }}>
                            <i className="fas fa-calendar-days"></i>
                        </div>
                    </div>
                    <div className="activity-item">
                        <div className="activity-number">
                            {filterLogsByTimeRange(symptomsData).length}
                        </div>
                        <div className="activity-label">Symptom Logs</div>
                        <div className="activity-icon" style={{ color: '#F59E0B' }}>
                            <i className="fas fa-notes-medical"></i>
                        </div>
                    </div>
                    <div className="activity-item">
                        <div className="activity-number">
                            {filterLogsByTimeRange(moodsData).length}
                        </div>
                        <div className="activity-label">Mood Logs</div>
                        <div className="activity-icon" style={{ color: '#8B5CF6' }}>
                            <i className="fas fa-smile"></i>
                        </div>
                    </div>
                    <div className="activity-item">
                        <div className="activity-number">{Object.keys(symptomStats).length}</div>
                        <div className="activity-label">Unique Symptoms</div>
                        <div className="activity-icon" style={{ color: '#EF4444' }}>
                            <i className="fas fa-vials"></i>
                        </div>
                    </div>
                </div>

                <div className="insights-card">
                    <h2>
                        <i className="fas fa-lightbulb"></i> Health Insights
                    </h2>
                    <div className="insights-list">
                        {(() => {
                            const insights = [];
                            const addedInsightTypes = new Set();

                            // Only show ONE regularity insight
                            if (cycleStats && !addedInsightTypes.has('regularity')) {
                                if (cycleStats.cycleRegularity === 'Regular') {
                                    insights.push(
                                        <div key="regular" className="insight-item success">
                                            <i className="fas fa-check-circle"></i>
                                            <div>
                                                <div className="insight-title">
                                                    Healthy Cycle Regularity
                                                </div>
                                                <div className="insight-text">
                                                    Your consistent cycle pattern indicates good
                                                    hormonal balance.
                                                </div>
                                            </div>
                                        </div>
                                    );
                                } else if (cycleStats.cycleRegularity === 'Highly Irregular') {
                                    insights.push(
                                        <div key="irregular" className="insight-item warning">
                                            <i className="fas fa-exclamation-triangle"></i>
                                            <div>
                                                <div className="insight-title">
                                                    Irregular Cycle Detected
                                                </div>
                                                <div className="insight-text">
                                                    Highly irregular cycles may indicate hormonal
                                                    imbalance. Consider consulting a healthcare
                                                    provider.
                                                </div>
                                            </div>
                                        </div>
                                    );
                                } else if (cycleStats.cycleRegularity === 'Somewhat Irregular') {
                                    insights.push(
                                        <div key="moderate" className="insight-item info">
                                            <i className="fas fa-info-circle"></i>
                                            <div>
                                                <div className="insight-title">
                                                    Moderate Cycle Variability
                                                </div>
                                                <div className="insight-text">
                                                    Your cycle shows some irregularity. Monitor for
                                                    patterns and consider lifestyle factors.
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                                addedInsightTypes.add('regularity');
                            }

                            // Cycle length insight
                            if (
                                cycleStats &&
                                (cycleStats.avgCycleLength < 21 ||
                                    cycleStats.avgCycleLength > 35) &&
                                !addedInsightTypes.has('cycle-length')
                            ) {
                                insights.push(
                                    <div key="cycle-length" className="insight-item warning">
                                        <i className="fas fa-exclamation-circle"></i>
                                        <div>
                                            <div className="insight-title">
                                                Cycle Length Outside Normal Range
                                            </div>
                                            <div className="insight-text">
                                                Your average cycle length (
                                                {cycleStats.avgCycleLength} days) is outside the
                                                typical 21-35 day range.
                                            </div>
                                        </div>
                                    </div>
                                );
                                addedInsightTypes.add('cycle-length');
                            }

                            // Period duration insight
                            if (
                                cycleStats &&
                                (cycleStats.avgPeriodLength < 3 ||
                                    cycleStats.avgPeriodLength > 7) &&
                                !addedInsightTypes.has('period-length')
                            ) {
                                insights.push(
                                    <div key="period-length" className="insight-item info">
                                        <i className="fas fa-info-circle"></i>
                                        <div>
                                            <div className="insight-title">
                                                Period Duration Note
                                            </div>
                                            <div className="insight-text">
                                                Your average period length (
                                                {cycleStats.avgPeriodLength.toFixed(1)} days) is{' '}
                                                {cycleStats.avgPeriodLength < 3
                                                    ? 'shorter'
                                                    : 'longer'}{' '}
                                                than typical.
                                            </div>
                                        </div>
                                    </div>
                                );
                                addedInsightTypes.add('period-length');
                            }

                            // Only show ONE symptom insight
                            if (!addedInsightTypes.has('symptoms')) {
                                if (Object.keys(symptomStats).length >= 6) {
                                    insights.push(
                                        <div key="high-symptoms" className="insight-item warning">
                                            <i className="fas fa-notes-medical"></i>
                                            <div>
                                                <div className="insight-title">
                                                    High Symptom Burden
                                                </div>
                                                <div className="insight-text">
                                                    You're experiencing{' '}
                                                    {Object.keys(symptomStats).length} different
                                                    types of symptoms regularly.
                                                </div>
                                            </div>
                                        </div>
                                    );
                                } else if (
                                    Object.keys(symptomStats).length > 0 &&
                                    Object.keys(symptomStats).length < 3
                                ) {
                                    insights.push(
                                        <div
                                            key="minimal-symptoms"
                                            className="insight-item success"
                                        >
                                            <i className="fas fa-check-circle"></i>
                                            <div>
                                                <div className="insight-title">
                                                    Minimal Symptoms
                                                </div>
                                                <div className="insight-text">
                                                    You're experiencing relatively few symptoms,
                                                    which is a positive health indicator.
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                                addedInsightTypes.add('symptoms');
                            }

                            // Only show ONE emotional health insight
                            if (!addedInsightTypes.has('emotions')) {
                                const negativePercent = parseFloat(
                                    healthMetrics.negativeEmotionPercentage
                                );

                                if (negativePercent > 60) {
                                    insights.push(
                                        <div
                                            key="negative-emotions"
                                            className="insight-item warning"
                                        >
                                            <i className="fas fa-brain"></i>
                                            <div>
                                                <div className="insight-title">
                                                    Emotional Health Concern
                                                </div>
                                                <div className="insight-text">
                                                    You're frequently experiencing negative moods (
                                                    {negativePercent.toFixed(0)}% of logs).
                                                </div>
                                            </div>
                                        </div>
                                    );
                                } else if (
                                    negativePercent < 30 &&
                                    Object.values(moodStats).length > 0
                                ) {
                                    insights.push(
                                        <div
                                            key="positive-emotions"
                                            className="insight-item success"
                                        >
                                            <i className="fas fa-smile"></i>
                                            <div>
                                                <div className="insight-title">
                                                    Positive Emotional Health
                                                </div>
                                                <div className="insight-text">
                                                    Your mood logs show predominantly positive
                                                    emotions, indicating good emotional well-being.
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                                addedInsightTypes.add('emotions');
                            }

                            // Wellness score insight
                            if (wellnessScore >= 85 && !addedInsightTypes.has('wellness')) {
                                insights.push(
                                    <div key="wellness" className="insight-item success">
                                        <i className="fas fa-trophy"></i>
                                        <div>
                                            <div className="insight-title">
                                                Excellent Health Status
                                            </div>
                                            <div className="insight-text">
                                                Your menstrual health metrics indicate optimal
                                                wellness. Keep it up!
                                            </div>
                                        </div>
                                    </div>
                                );
                                addedInsightTypes.add('wellness');
                            }

                            return insights;
                        })()}
                    </div>
                </div>
            </div>
        </div>
    );

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
