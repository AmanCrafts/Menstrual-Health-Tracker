import PeriodLog from '../models/PeriodLog.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';

/**
 * @desc    Create a new period log
 * @route   POST /api/periods
 * @access  Private
 */
export const createPeriodLog = async (req, res) => {
  try {
    const { startDate, endDate, flowIntensity, painLevel, symptoms, notes } = req.body;

    // Check for existing log on same start date
    const existingLog = await PeriodLog.findOne({
      user: req.user._id,
      startDate: new Date(startDate)
    });

    if (existingLog) {
      return res.status(400).json({
        success: false,
        message: 'A period log already exists for this date. Use update instead.'
      });
    }

    const periodLog = await PeriodLog.create({
      user: req.user._id,
      startDate,
      endDate,
      flowIntensity,
      painLevel,
      symptoms,
      notes
    });

    // Update user's last period date if this is more recent
    const user = await User.findById(req.user._id);
    const logDate = new Date(startDate);
    const userLastPeriod = user.cycleSettings?.lastPeriodDate 
      ? new Date(user.cycleSettings.lastPeriodDate) 
      : null;

    if (!userLastPeriod || logDate > userLastPeriod) {
      await User.findByIdAndUpdate(req.user._id, {
        'cycleSettings.lastPeriodDate': startDate
      });
    }

    logger.info(`Period log created for user: ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Period log created successfully',
      data: periodLog
    });
  } catch (error) {
    logger.error(`Create period log error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error creating period log'
    });
  }
};

/**
 * @desc    Get all period logs for user
 * @route   GET /api/periods
 * @access  Private
 */
export const getPeriodLogs = async (req, res) => {
  try {
    const { startDate, endDate, limit = 12 } = req.query;

    const query = { user: req.user._id, isPredicted: false };

    if (startDate && endDate) {
      query.startDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const periodLogs = await PeriodLog.find(query)
      .sort({ startDate: -1 })
      .limit(parseInt(limit))
      .lean();

    res.status(200).json({
      success: true,
      count: periodLogs.length,
      data: periodLogs
    });
  } catch (error) {
    logger.error(`Get period logs error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error fetching period logs'
    });
  }
};

/**
 * @desc    Get single period log
 * @route   GET /api/periods/:id
 * @access  Private
 */
export const getPeriodLog = async (req, res) => {
  try {
    const periodLog = await PeriodLog.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!periodLog) {
      return res.status(404).json({
        success: false,
        message: 'Period log not found'
      });
    }

    res.status(200).json({
      success: true,
      data: periodLog
    });
  } catch (error) {
    logger.error(`Get period log error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error fetching period log'
    });
  }
};

/**
 * @desc    Update period log
 * @route   PUT /api/periods/:id
 * @access  Private
 */
export const updatePeriodLog = async (req, res) => {
  try {
    const { startDate, endDate, flowIntensity, painLevel, symptoms, notes } = req.body;

    const periodLog = await PeriodLog.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!periodLog) {
      return res.status(404).json({
        success: false,
        message: 'Period log not found'
      });
    }

    // Update fields
    if (startDate) periodLog.startDate = startDate;
    if (endDate) periodLog.endDate = endDate;
    if (flowIntensity) periodLog.flowIntensity = flowIntensity;
    if (painLevel !== undefined) periodLog.painLevel = painLevel;
    if (symptoms) periodLog.symptoms = symptoms;
    if (notes !== undefined) periodLog.notes = notes;

    await periodLog.save();

    logger.info(`Period log updated for user: ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Period log updated successfully',
      data: periodLog
    });
  } catch (error) {
    logger.error(`Update period log error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error updating period log'
    });
  }
};

/**
 * @desc    Delete period log
 * @route   DELETE /api/periods/:id
 * @access  Private
 */
export const deletePeriodLog = async (req, res) => {
  try {
    const periodLog = await PeriodLog.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!periodLog) {
      return res.status(404).json({
        success: false,
        message: 'Period log not found'
      });
    }

    logger.info(`Period log deleted for user: ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Period log deleted successfully'
    });
  } catch (error) {
    logger.error(`Delete period log error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error deleting period log'
    });
  }
};

/**
 * @desc    Get comprehensive cycle statistics
 * @route   GET /api/periods/stats
 * @access  Private
 */
export const getCycleStats = async (req, res) => {
  try {
    // Get comprehensive statistics using the improved model method
    const stats = await PeriodLog.getCycleStatistics(req.user._id);
    
    // Get recent periods with full data
    const recentPeriods = await PeriodLog.getUserHistory(req.user._id, 12);
    
    // Calculate additional insights
    const insights = [];
    
    // Cycle regularity insight
    if (stats.regularity.category === 'very_regular' || stats.regularity.category === 'regular') {
      insights.push({
        type: 'positive',
        title: 'Regular Cycles',
        description: `Your cycles are ${stats.regularity.category.replace('_', ' ')} with ${stats.regularity.variance || 0} day variance.`,
        icon: 'check-circle'
      });
    } else if (stats.regularity.category === 'irregular') {
      insights.push({
        type: 'warning',
        title: 'Irregular Cycles',
        description: 'Your cycle length varies significantly. Factors like stress, weight, or hormonal changes may be involved.',
        icon: 'exclamation-triangle'
      });
    }
    
    // Cycle length insight
    if (stats.averageCycleLength < 21) {
      insights.push({
        type: 'alert',
        title: 'Short Cycles',
        description: 'Your average cycle is less than 21 days, which may warrant attention.',
        icon: 'exclamation-circle'
      });
    } else if (stats.averageCycleLength > 35) {
      insights.push({
        type: 'warning',
        title: 'Long Cycles',
        description: 'Your average cycle is over 35 days. This can be normal but worth monitoring.',
        icon: 'clock'
      });
    }
    
    // Period length insight
    if (stats.averagePeriodLength > 7) {
      insights.push({
        type: 'warning',
        title: 'Extended Periods',
        description: `Your periods last ${stats.averagePeriodLength} days on average, which is longer than typical.`,
        icon: 'clock'
      });
    }
    
    // Trend insight
    if (stats.trend === 'shortening') {
      insights.push({
        type: 'info',
        title: 'Cycles Shortening',
        description: 'Your recent cycles appear to be getting shorter.',
        icon: 'arrow-down'
      });
    } else if (stats.trend === 'lengthening') {
      insights.push({
        type: 'info',
        title: 'Cycles Lengthening',
        description: 'Your recent cycles appear to be getting longer.',
        icon: 'arrow-up'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        averageCycleLength: stats.averageCycleLength,
        averagePeriodLength: stats.averagePeriodLength,
        regularity: stats.regularity,
        trend: stats.trend,
        totalLogged: stats.totalLogged,
        lastPeriod: stats.lastPeriod,
        recentPeriods,
        insights
      }
    });
  } catch (error) {
    logger.error(`Get cycle stats error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error fetching cycle statistics'
    });
  }
};

/**
 * @desc    Get cycle predictions with improved algorithm
 * @route   GET /api/periods/predictions
 * @access  Private
 */
export const getCyclePredictions = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Get comprehensive statistics
    const stats = await PeriodLog.getCycleStatistics(req.user._id);
    const { 
      averageCycleLength, 
      averagePeriodLength, 
      regularity, 
      trend, 
      lastPeriod 
    } = stats;
    
    // Get most recent period date
    let lastPeriodDate = user.cycleSettings?.lastPeriodDate;
    if (lastPeriod) {
      const recentDate = new Date(lastPeriod.startDate);
      if (!lastPeriodDate || recentDate > new Date(lastPeriodDate)) {
        lastPeriodDate = recentDate;
      }
    }

    if (!lastPeriodDate) {
      return res.status(200).json({
        success: true,
        data: {
          message: 'Not enough data for predictions. Please log your first period.',
          hasData: false,
          predictions: [],
          confidence: { score: 0, level: 'none' }
        }
      });
    }

    // Calculate predictions using improved algorithm
    const predictions = [];
    let nextPeriod = new Date(lastPeriodDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Calculate base confidence from regularity
    const baseConfidence = regularity.score || 50;
    
    // Calculate variance for prediction ranges
    const variance = regularity.variance || 2;

    // Generate predictions for next 6 cycles
    for (let i = 0; i < 6; i++) {
      nextPeriod = new Date(nextPeriod);
      nextPeriod.setDate(nextPeriod.getDate() + averageCycleLength);

      // Skip if in the past
      if (nextPeriod < today && i === 0) {
        // If first prediction is in past, recalculate
        while (nextPeriod < today) {
          nextPeriod.setDate(nextPeriod.getDate() + averageCycleLength);
        }
      }
      
      // Skip past dates
      if (nextPeriod < today) continue;

      // Calculate period end date
      const periodEndDate = new Date(nextPeriod);
      periodEndDate.setDate(periodEndDate.getDate() + averagePeriodLength - 1);

      // Calculate ovulation (14 days before next period, adjusted for cycle length)
      const lutealPhase = averageCycleLength < 26 ? 12 : averageCycleLength > 32 ? 14 : 14;
      const ovulationDate = new Date(nextPeriod);
      ovulationDate.setDate(ovulationDate.getDate() - lutealPhase);

      // Calculate fertile window (5 days before ovulation to 1 day after)
      const fertileStart = new Date(ovulationDate);
      fertileStart.setDate(fertileStart.getDate() - 5);
      const fertileEnd = new Date(ovulationDate);
      fertileEnd.setDate(fertileEnd.getDate() + 1);
      
      // Calculate peak fertility (2 days before to ovulation day)
      const peakFertileStart = new Date(ovulationDate);
      peakFertileStart.setDate(peakFertileStart.getDate() - 2);
      
      // Calculate PMS window (10 days to 1 day before period)
      const pmsStart = new Date(nextPeriod);
      pmsStart.setDate(pmsStart.getDate() - 10);
      const pmsEnd = new Date(nextPeriod);
      pmsEnd.setDate(pmsEnd.getDate() - 1);

      // Calculate prediction range based on variance
      const rangeMargin = Math.max(1, Math.ceil(variance));
      const predictedRangeStart = new Date(nextPeriod);
      predictedRangeStart.setDate(predictedRangeStart.getDate() - rangeMargin);
      const predictedRangeEnd = new Date(nextPeriod);
      predictedRangeEnd.setDate(predictedRangeEnd.getDate() + rangeMargin);

      // Calculate confidence (decreases for predictions further in future)
      const monthsAhead = Math.floor(
        (nextPeriod - today) / (30 * 24 * 60 * 60 * 1000)
      );
      const confidence = Math.max(30, Math.min(95, baseConfidence - (monthsAhead * 5)));

      predictions.push({
        cycleNumber: predictions.length + 1,
        periodStart: nextPeriod.toISOString(),
        periodEnd: periodEndDate.toISOString(),
        predictedRange: {
          start: predictedRangeStart.toISOString(),
          end: predictedRangeEnd.toISOString()
        },
        ovulationDate: ovulationDate.toISOString(),
        fertileWindow: {
          start: fertileStart.toISOString(),
          end: fertileEnd.toISOString(),
          peakStart: peakFertileStart.toISOString(),
          peakEnd: ovulationDate.toISOString()
        },
        pmsWindow: {
          start: pmsStart.toISOString(),
          end: pmsEnd.toISOString()
        },
        confidence
      });
      
      if (predictions.length >= 3) break;
    }

    // Calculate current cycle day
    const daysSinceLastPeriod = Math.floor(
      (today - new Date(lastPeriodDate)) / (1000 * 60 * 60 * 24)
    );
    const currentCycleDay = (daysSinceLastPeriod % averageCycleLength) + 1;
    const daysUntilNextPeriod = averageCycleLength - daysSinceLastPeriod;

    // Determine current phase
    let currentPhase = 'follicular';
    if (currentCycleDay <= averagePeriodLength) {
      currentPhase = 'period';
    } else if (predictions.length > 0) {
      const nextOvulation = new Date(predictions[0].ovulationDate);
      const daysUntilOvulation = Math.floor((nextOvulation - today) / (1000 * 60 * 60 * 24));
      
      if (daysUntilOvulation <= 0 && daysUntilOvulation >= -1) {
        currentPhase = 'ovulation';
      } else if (daysUntilOvulation > 0 && daysUntilOvulation <= 6) {
        currentPhase = 'fertile';
      } else if (daysUntilNextPeriod <= 10 && daysUntilNextPeriod > 0) {
        currentPhase = 'pms';
      }
    }

    res.status(200).json({
      success: true,
      data: {
        hasData: true,
        lastPeriodDate,
        averageCycleLength,
        averagePeriodLength,
        currentCycleDay,
        daysUntilNextPeriod: daysUntilNextPeriod > 0 ? daysUntilNextPeriod : averageCycleLength,
        currentPhase,
        regularity: {
          score: regularity.score,
          category: regularity.category,
          variance: regularity.variance,
          message: regularity.message
        },
        trend,
        predictions,
        confidence: {
          score: baseConfidence,
          level: baseConfidence >= 80 ? 'high' : baseConfidence >= 60 ? 'moderate' : 'low',
          factors: [
            regularity.dataPoints >= 6 ? 'Sufficient history' : 'Limited history',
            regularity.category === 'regular' || regularity.category === 'very_regular' 
              ? 'Regular cycles' 
              : 'Irregular cycles'
          ]
        }
      }
    });
  } catch (error) {
    logger.error(`Get predictions error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error calculating predictions'
    });
  }
};

export default {
  createPeriodLog,
  getPeriodLogs,
  getPeriodLog,
  updatePeriodLog,
  deletePeriodLog,
  getCycleStats,
  getCyclePredictions
};
