import HealthLog from '../models/HealthLog.js';
import logger from '../utils/logger.js';

/**
 * @desc    Create or update health log for a date
 * @route   POST /api/health
 * @access  Private
 */
export const createHealthLog = async (req, res) => {
  try {
    const { 
      date, weight, height, waterIntake, exerciseDuration, 
      exerciseType, medicationsTaken, supplements, 
      sexualActivity, protectionUsed, notes 
    } = req.body;

    // Normalize date to start of day
    const logDate = new Date(date);
    logDate.setHours(0, 0, 0, 0);

    // Try to find existing log for this date
    let healthLog = await HealthLog.findOne({
      user: req.user._id,
      date: logDate
    });

    if (healthLog) {
      // Update existing log
      if (weight !== undefined) healthLog.weight = weight;
      if (height !== undefined) healthLog.height = height;
      if (waterIntake !== undefined) healthLog.waterIntake = waterIntake;
      if (exerciseDuration !== undefined) healthLog.exerciseDuration = exerciseDuration;
      if (exerciseType !== undefined) healthLog.exerciseType = exerciseType;
      if (medicationsTaken !== undefined) healthLog.medicationsTaken = medicationsTaken;
      if (supplements !== undefined) healthLog.supplements = supplements;
      if (sexualActivity !== undefined) healthLog.sexualActivity = sexualActivity;
      if (protectionUsed !== undefined) healthLog.protectionUsed = protectionUsed;
      if (notes !== undefined) healthLog.notes = notes;
      
      await healthLog.save();

      logger.info(`Health log updated for user: ${req.user.email}`);

      return res.status(200).json({
        success: true,
        message: 'Health log updated successfully',
        data: healthLog
      });
    }

    // Create new log
    healthLog = await HealthLog.create({
      user: req.user._id,
      date: logDate,
      weight,
      height,
      waterIntake,
      exerciseDuration,
      exerciseType,
      medicationsTaken,
      supplements,
      sexualActivity,
      protectionUsed,
      notes
    });

    logger.info(`Health log created for user: ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Health log created successfully',
      data: healthLog
    });
  } catch (error) {
    logger.error(`Create health log error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error creating health log'
    });
  }
};

/**
 * @desc    Get all health logs for user
 * @route   GET /api/health
 * @access  Private
 */
export const getHealthLogs = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const logs = await HealthLog.getUserHistory(
      req.user._id,
      startDate,
      endDate
    );

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    logger.error(`Get health logs error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error fetching health logs'
    });
  }
};

/**
 * @desc    Get health log by date
 * @route   GET /api/health/date/:date
 * @access  Private
 */
export const getHealthLogByDate = async (req, res) => {
  try {
    const logDate = new Date(req.params.date);
    logDate.setHours(0, 0, 0, 0);

    const healthLog = await HealthLog.findOne({
      user: req.user._id,
      date: logDate
    });

    if (!healthLog) {
      return res.status(404).json({
        success: false,
        message: 'No health log found for this date'
      });
    }

    res.status(200).json({
      success: true,
      data: healthLog
    });
  } catch (error) {
    logger.error(`Get health log by date error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error fetching health log'
    });
  }
};

/**
 * @desc    Get single health log by ID
 * @route   GET /api/health/:id
 * @access  Private
 */
export const getHealthLog = async (req, res) => {
  try {
    const healthLog = await HealthLog.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!healthLog) {
      return res.status(404).json({
        success: false,
        message: 'Health log not found'
      });
    }

    res.status(200).json({
      success: true,
      data: healthLog
    });
  } catch (error) {
    logger.error(`Get health log error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error fetching health log'
    });
  }
};

/**
 * @desc    Update health log
 * @route   PUT /api/health/:id
 * @access  Private
 */
export const updateHealthLog = async (req, res) => {
  try {
    const { 
      weight, height, waterIntake, exerciseDuration, 
      exerciseType, medicationsTaken, supplements, 
      sexualActivity, protectionUsed, notes 
    } = req.body;

    let healthLog = await HealthLog.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!healthLog) {
      return res.status(404).json({
        success: false,
        message: 'Health log not found'
      });
    }

    if (weight !== undefined) healthLog.weight = weight;
    if (height !== undefined) healthLog.height = height;
    if (waterIntake !== undefined) healthLog.waterIntake = waterIntake;
    if (exerciseDuration !== undefined) healthLog.exerciseDuration = exerciseDuration;
    if (exerciseType !== undefined) healthLog.exerciseType = exerciseType;
    if (medicationsTaken !== undefined) healthLog.medicationsTaken = medicationsTaken;
    if (supplements !== undefined) healthLog.supplements = supplements;
    if (sexualActivity !== undefined) healthLog.sexualActivity = sexualActivity;
    if (protectionUsed !== undefined) healthLog.protectionUsed = protectionUsed;
    if (notes !== undefined) healthLog.notes = notes;

    await healthLog.save();

    logger.info(`Health log updated for user: ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Health log updated successfully',
      data: healthLog
    });
  } catch (error) {
    logger.error(`Update health log error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error updating health log'
    });
  }
};

/**
 * @desc    Delete health log
 * @route   DELETE /api/health/:id
 * @access  Private
 */
export const deleteHealthLog = async (req, res) => {
  try {
    const healthLog = await HealthLog.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!healthLog) {
      return res.status(404).json({
        success: false,
        message: 'Health log not found'
      });
    }

    logger.info(`Health log deleted for user: ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Health log deleted successfully'
    });
  } catch (error) {
    logger.error(`Delete health log error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error deleting health log'
    });
  }
};

/**
 * @desc    Get health analytics
 * @route   GET /api/health/analytics
 * @access  Private
 */
export const getHealthAnalytics = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const analytics = await HealthLog.getHealthAnalytics(req.user._id, parseInt(days));

    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    logger.error(`Get health analytics error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error fetching health analytics'
    });
  }
};

export default {
  createHealthLog,
  getHealthLogs,
  getHealthLogByDate,
  getHealthLog,
  updateHealthLog,
  deleteHealthLog,
  getHealthAnalytics
};
