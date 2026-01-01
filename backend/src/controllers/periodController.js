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

    let periodLog = await PeriodLog.findOne({
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
 * @desc    Get cycle statistics
 * @route   GET /api/periods/stats
 * @access  Private
 */
export const getCycleStats = async (req, res) => {
  try {
    const [avgCycleLength, avgPeriodLength] = await Promise.all([
      PeriodLog.calculateAverageCycleLength(req.user._id),
      PeriodLog.calculateAveragePeriodLength(req.user._id)
    ]);

    const recentPeriods = await PeriodLog.getUserHistory(req.user._id, 6);

    res.status(200).json({
      success: true,
      data: {
        averageCycleLength: avgCycleLength,
        averagePeriodLength: avgPeriodLength,
        totalLogged: recentPeriods.length,
        recentPeriods
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
 * @desc    Get cycle predictions
 * @route   GET /api/periods/predictions
 * @access  Private
 */
export const getCyclePredictions = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const avgCycleLength = await PeriodLog.calculateAverageCycleLength(req.user._id);
    const avgPeriodLength = await PeriodLog.calculateAveragePeriodLength(req.user._id);

    // Get most recent period
    const recentPeriods = await PeriodLog.getUserHistory(req.user._id, 1);
    
    let lastPeriodDate = user.cycleSettings?.lastPeriodDate;
    if (recentPeriods.length > 0) {
      const recentDate = new Date(recentPeriods[0].startDate);
      if (!lastPeriodDate || recentDate > new Date(lastPeriodDate)) {
        lastPeriodDate = recentDate;
      }
    }

    if (!lastPeriodDate) {
      return res.status(200).json({
        success: true,
        data: {
          message: 'Not enough data for predictions. Please log your first period.',
          predictions: []
        }
      });
    }

    // Calculate predictions
    const predictions = [];
    let nextPeriod = new Date(lastPeriodDate);
    const today = new Date();

    // Get next 3 predicted periods
    for (let i = 0; i < 3; i++) {
      nextPeriod = new Date(nextPeriod);
      nextPeriod.setDate(nextPeriod.getDate() + avgCycleLength);

      // Skip if in the past
      if (nextPeriod < today && i === 0) {
        continue;
      }

      const endDate = new Date(nextPeriod);
      endDate.setDate(endDate.getDate() + avgPeriodLength - 1);

      // Calculate ovulation (14 days before period)
      const ovulationDate = new Date(nextPeriod);
      ovulationDate.setDate(ovulationDate.getDate() - 14);

      // Calculate fertile window (5 days before ovulation to 1 day after)
      const fertileStart = new Date(ovulationDate);
      fertileStart.setDate(fertileStart.getDate() - 5);
      const fertileEnd = new Date(ovulationDate);
      fertileEnd.setDate(fertileEnd.getDate() + 1);

      predictions.push({
        periodStart: nextPeriod.toISOString(),
        periodEnd: endDate.toISOString(),
        ovulationDate: ovulationDate.toISOString(),
        fertileWindow: {
          start: fertileStart.toISOString(),
          end: fertileEnd.toISOString()
        }
      });
    }

    // Calculate current cycle day
    const daysSinceLastPeriod = Math.floor((today - new Date(lastPeriodDate)) / (1000 * 60 * 60 * 24));
    const currentCycleDay = (daysSinceLastPeriod % avgCycleLength) + 1;

    res.status(200).json({
      success: true,
      data: {
        lastPeriodDate,
        averageCycleLength: avgCycleLength,
        averagePeriodLength: avgPeriodLength,
        currentCycleDay,
        predictions
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
