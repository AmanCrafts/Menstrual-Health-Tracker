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
      date: logDate
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
        data: symptomLog
      });
    }

    // Create new log
    symptomLog = await SymptomLog.create({
      user: req.user._id,
      date: logDate,
      symptoms,
      intensity,
      painLevel,
      notes
    });

    logger.info(`Symptom log created for user: ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Symptom log created successfully',
      data: symptomLog
    });
  } catch (error) {
    logger.error(`Create symptom log error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error creating symptom log'
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

    const logs = await SymptomLog.getUserHistory(
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
    logger.error(`Get symptom logs error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error fetching symptom logs'
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
      date: logDate
    });

    if (!symptomLog) {
      return res.status(404).json({
        success: false,
        message: 'No symptom log found for this date'
      });
    }

    res.status(200).json({
      success: true,
      data: symptomLog
    });
  } catch (error) {
    logger.error(`Get symptom log by date error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error fetching symptom log'
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
      user: req.user._id
    });

    if (!symptomLog) {
      return res.status(404).json({
        success: false,
        message: 'Symptom log not found'
      });
    }

    res.status(200).json({
      success: true,
      data: symptomLog
    });
  } catch (error) {
    logger.error(`Get symptom log error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error fetching symptom log'
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
      user: req.user._id
    });

    if (!symptomLog) {
      return res.status(404).json({
        success: false,
        message: 'Symptom log not found'
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
      data: symptomLog
    });
  } catch (error) {
    logger.error(`Update symptom log error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error updating symptom log'
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
      user: req.user._id
    });

    if (!symptomLog) {
      return res.status(404).json({
        success: false,
        message: 'Symptom log not found'
      });
    }

    logger.info(`Symptom log deleted for user: ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Symptom log deleted successfully'
    });
  } catch (error) {
    logger.error(`Delete symptom log error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error deleting symptom log'
    });
  }
};

/**
 * @desc    Get symptom analytics
 * @route   GET /api/symptoms/analytics
 * @access  Private
 */
export const getSymptomAnalytics = async (req, res) => {
  try {
    const mostCommon = await SymptomLog.getMostCommonSymptoms(req.user._id, 10);

    res.status(200).json({
      success: true,
      data: {
        mostCommonSymptoms: mostCommon
      }
    });
  } catch (error) {
    logger.error(`Get symptom analytics error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error fetching symptom analytics'
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
  getSymptomAnalytics
};
