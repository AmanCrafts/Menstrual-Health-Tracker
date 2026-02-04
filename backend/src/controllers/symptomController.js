import SymptomLog from '../models/SymptomLog.js';
import logger from '../utils/logger.js';

/**
 * @desc    Create or update symptom log for a date
 * @route   POST /api/symptoms
 * @access  Private
 */
export const createSymptomLog = async (req, res) => {
    try {
        const { date, symptoms, intensity, painLevel, notes } = req.body;

        // Normalize date to start of day
        const logDate = new Date(date);
        logDate.setHours(0, 0, 0, 0);

        // Try to find existing log for this date
        let symptomLog = await SymptomLog.findOne({
            user: req.user._id,
            date: logDate,
        });

        if (symptomLog) {
            // Update existing log
            symptomLog.symptoms = { ...symptomLog.symptoms, ...symptoms };
            symptomLog.intensity = intensity || symptomLog.intensity;
            symptomLog.painLevel = painLevel !== undefined ? painLevel : symptomLog.painLevel;
            symptomLog.notes = notes !== undefined ? notes : symptomLog.notes;
            await symptomLog.save();

            logger.info(`Symptom log updated for user: ${req.user.email}`);

            return res.status(200).json({
                success: true,
                message: 'Symptom log updated successfully',
                data: symptomLog,
            });
        }

        // Create new log
        symptomLog = await SymptomLog.create({
            user: req.user._id,
            date: logDate,
            symptoms,
            intensity,
            painLevel,
            notes,
        });

        logger.info(`Symptom log created for user: ${req.user.email}`);

        res.status(201).json({
            success: true,
            message: 'Symptom log created successfully',
            data: symptomLog,
        });
    } catch (error) {
        logger.error(`Create symptom log error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error creating symptom log',
        });
    }
};

/**
 * @desc    Get all symptom logs for user
 * @route   GET /api/symptoms
 * @access  Private
 */
export const getSymptomLogs = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const logs = await SymptomLog.getUserHistory(req.user._id, startDate, endDate);

        res.status(200).json({
            success: true,
            count: logs.length,
            data: logs,
        });
    } catch (error) {
        logger.error(`Get symptom logs error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error fetching symptom logs',
        });
    }
};

/**
 * @desc    Get symptom log by date
 * @route   GET /api/symptoms/date/:date
 * @access  Private
 */
export const getSymptomLogByDate = async (req, res) => {
    try {
        const logDate = new Date(req.params.date);
        logDate.setHours(0, 0, 0, 0);

        const symptomLog = await SymptomLog.findOne({
            user: req.user._id,
            date: logDate,
        });

        if (!symptomLog) {
            return res.status(404).json({
                success: false,
                message: 'No symptom log found for this date',
            });
        }

        res.status(200).json({
            success: true,
            data: symptomLog,
        });
    } catch (error) {
        logger.error(`Get symptom log by date error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error fetching symptom log',
        });
    }
};

/**
 * @desc    Get single symptom log by ID
 * @route   GET /api/symptoms/:id
 * @access  Private
 */
export const getSymptomLog = async (req, res) => {
    try {
        const symptomLog = await SymptomLog.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!symptomLog) {
            return res.status(404).json({
                success: false,
                message: 'Symptom log not found',
            });
        }

        res.status(200).json({
            success: true,
            data: symptomLog,
        });
    } catch (error) {
        logger.error(`Get symptom log error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error fetching symptom log',
        });
    }
};

/**
 * @desc    Update symptom log
 * @route   PUT /api/symptoms/:id
 * @access  Private
 */
export const updateSymptomLog = async (req, res) => {
    try {
        const { symptoms, intensity, painLevel, notes } = req.body;

        let symptomLog = await SymptomLog.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!symptomLog) {
            return res.status(404).json({
                success: false,
                message: 'Symptom log not found',
            });
        }

        if (symptoms) symptomLog.symptoms = { ...symptomLog.symptoms, ...symptoms };
        if (intensity) symptomLog.intensity = intensity;
        if (painLevel !== undefined) symptomLog.painLevel = painLevel;
        if (notes !== undefined) symptomLog.notes = notes;

        await symptomLog.save();

        logger.info(`Symptom log updated for user: ${req.user.email}`);

        res.status(200).json({
            success: true,
            message: 'Symptom log updated successfully',
            data: symptomLog,
        });
    } catch (error) {
        logger.error(`Update symptom log error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error updating symptom log',
        });
    }
};

/**
 * @desc    Delete symptom log
 * @route   DELETE /api/symptoms/:id
 * @access  Private
 */
export const deleteSymptomLog = async (req, res) => {
    try {
        const symptomLog = await SymptomLog.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!symptomLog) {
            return res.status(404).json({
                success: false,
                message: 'Symptom log not found',
            });
        }

        logger.info(`Symptom log deleted for user: ${req.user.email}`);

        res.status(200).json({
            success: true,
            message: 'Symptom log deleted successfully',
        });
    } catch (error) {
        logger.error(`Delete symptom log error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error deleting symptom log',
        });
    }
};

/**
 * @desc    Get comprehensive symptom analytics and pattern analysis
 * @route   GET /api/symptoms/analytics
 * @access  Private
 */
export const getSymptomAnalytics = async (req, res) => {
    try {
        const { months = 6 } = req.query;

        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - parseInt(months));

        // Get symptom logs in date range
        const logs = await SymptomLog.find({
            user: req.user._id,
            date: { $gte: startDate, $lte: endDate },
        })
            .sort({ date: -1 })
            .lean();

        if (logs.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    message: 'No symptom data available for analysis',
                    hasData: false,
                    mostCommonSymptoms: [],
                    insights: [],
                },
            });
        }

        // Count symptom occurrences
        const symptomCounts = {};
        const symptomIntensities = {};
        const symptomDates = {};

        logs.forEach((log) => {
            if (!log.symptoms) return;

            Object.entries(log.symptoms).forEach(([symptom, present]) => {
                if (present) {
                    symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;

                    // Track intensity
                    if (!symptomIntensities[symptom]) {
                        symptomIntensities[symptom] = [];
                    }
                    symptomIntensities[symptom].push(log.intensity || 'moderate');

                    // Track dates for pattern analysis
                    if (!symptomDates[symptom]) {
                        symptomDates[symptom] = [];
                    }
                    symptomDates[symptom].push(new Date(log.date));
                }
            });
        });

        // Get most common symptoms with statistics
        const mostCommon = Object.entries(symptomCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([symptom, count]) => {
                // Calculate average intensity
                const intensities = symptomIntensities[symptom] || [];
                const intensityMap = { mild: 1, moderate: 2, severe: 3 };
                const avgIntensity =
                    intensities.length > 0
                        ? intensities.reduce((sum, i) => sum + (intensityMap[i] || 2), 0) /
                          intensities.length
                        : 2;

                let intensityLabel = 'moderate';
                if (avgIntensity < 1.5) intensityLabel = 'mild';
                else if (avgIntensity > 2.5) intensityLabel = 'severe';

                // Calculate frequency (percentage of logged days)
                const frequency = Math.round((count / logs.length) * 100);

                return {
                    symptom,
                    count,
                    frequency,
                    averageIntensity: intensityLabel,
                    percentageOfLogs: `${frequency}%`,
                };
            });

        // Generate insights based on patterns
        const insights = [];

        // High frequency symptoms
        const highFrequencySymptoms = mostCommon.filter((s) => s.frequency > 50);
        if (highFrequencySymptoms.length > 0) {
            insights.push({
                type: 'pattern',
                title: 'Frequent Symptoms',
                description: `${highFrequencySymptoms.map((s) => s.symptom).join(', ')} occur in more than half of your logged days.`,
                symptoms: highFrequencySymptoms.map((s) => s.symptom),
                icon: 'chart-bar',
            });
        }

        // Pain pattern
        const painLogs = logs.filter((l) => l.painLevel && l.painLevel > 0);
        if (painLogs.length > 0) {
            const avgPain = painLogs.reduce((sum, l) => sum + l.painLevel, 0) / painLogs.length;
            const highPainDays = painLogs.filter((l) => l.painLevel >= 7).length;

            if (highPainDays > 3) {
                insights.push({
                    type: 'warning',
                    title: 'High Pain Days',
                    description: `You've logged ${highPainDays} days with pain level 7 or higher.`,
                    recommendation:
                        'Consider discussing pain management options with a healthcare provider.',
                    icon: 'exclamation-triangle',
                });
            }

            insights.push({
                type: 'info',
                title: 'Pain Statistics',
                description: `Average pain level: ${avgPain.toFixed(1)}/10 across ${painLogs.length} logged days.`,
                icon: 'chart-line',
            });
        }

        // Symptom combinations (common co-occurring symptoms)
        const combinations = {};
        logs.forEach((log) => {
            if (!log.symptoms) return;
            const activeSymptoms = Object.entries(log.symptoms)
                .filter(([, present]) => present)
                .map(([symptom]) => symptom)
                .sort();

            // Check pairs
            for (let i = 0; i < activeSymptoms.length; i++) {
                for (let j = i + 1; j < activeSymptoms.length; j++) {
                    const pair = `${activeSymptoms[i]}+${activeSymptoms[j]}`;
                    combinations[pair] = (combinations[pair] || 0) + 1;
                }
            }
        });

        const topCombinations = Object.entries(combinations)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .filter(([, count]) => count >= 3);

        if (topCombinations.length > 0) {
            const comboDescriptions = topCombinations.map(([pair, count]) => {
                const [s1, s2] = pair.split('+');
                return `${s1} and ${s2} (${count} times)`;
            });

            insights.push({
                type: 'pattern',
                title: 'Symptom Combinations',
                description: `These symptoms often occur together: ${comboDescriptions.join('; ')}`,
                icon: 'link',
            });
        }

        // Recommendations based on top symptoms
        const recommendations = [];
        const symptomTips = {
            cramps: {
                tip: 'Heat therapy, light exercise, and anti-inflammatory foods may help reduce cramping.',
                icon: 'fire',
            },
            headache: {
                tip: 'Stay hydrated, maintain consistent sleep, and track potential triggers.',
                icon: 'brain',
            },
            fatigue: {
                tip: 'Iron-rich foods, regular exercise, and adequate sleep can help combat fatigue.',
                icon: 'battery-half',
            },
            bloating: {
                tip: 'Reduce sodium, drink more water, and eat potassium-rich foods.',
                icon: 'water',
            },
            moodSwings: {
                tip: 'Regular exercise, stress management, and consistent sleep schedules can help stabilize mood.',
                icon: 'heart',
            },
            backache: {
                tip: 'Gentle stretching, heat therapy, and maintaining good posture may provide relief.',
                icon: 'user',
            },
        };

        mostCommon.slice(0, 3).forEach(({ symptom }) => {
            if (symptomTips[symptom]) {
                recommendations.push({
                    symptom,
                    ...symptomTips[symptom],
                });
            }
        });

        res.status(200).json({
            success: true,
            data: {
                hasData: true,
                dateRange: { start: startDate, end: endDate },
                totalLogs: logs.length,
                mostCommonSymptoms: mostCommon,
                insights,
                recommendations,
                summary: {
                    uniqueSymptoms: Object.keys(symptomCounts).length,
                    averageSymptomPerDay:
                        logs.length > 0
                            ? (
                                  Object.values(symptomCounts).reduce((a, b) => a + b, 0) /
                                  logs.length
                              ).toFixed(1)
                            : 0,
                },
            },
        });
    } catch (error) {
        logger.error(`Get symptom analytics error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error fetching symptom analytics',
        });
    }
};

export default {
    createSymptomLog,
    getSymptomLogs,
    getSymptomLogByDate,
    getSymptomLog,
    updateSymptomLog,
    deleteSymptomLog,
    getSymptomAnalytics,
};
