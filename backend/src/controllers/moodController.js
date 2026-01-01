import MoodLog from '../models/MoodLog.js';
import logger from '../utils/logger.js';

/**
 * @desc    Create or update mood log for a date
 * @route   POST /api/moods
 * @access  Private
 */
export const createMoodLog = async (req, res) => {
  try {
    const { date, mood, intensity, energyLevel, sleepQuality, sleepHours, stressLevel, notes } = req.body;

    // Normalize date to start of day
    const logDate = new Date(date);
    logDate.setHours(0, 0, 0, 0);

    // Try to find existing log for this date
    let moodLog = await MoodLog.findOne({
      user: req.user._id,
      date: logDate
    });

    if (moodLog) {
      // Update existing log
      moodLog.mood = mood;
      moodLog.intensity = intensity || moodLog.intensity;
      moodLog.energyLevel = energyLevel || moodLog.energyLevel;
      moodLog.sleepQuality = sleepQuality !== undefined ? sleepQuality : moodLog.sleepQuality;
      moodLog.sleepHours = sleepHours !== undefined ? sleepHours : moodLog.sleepHours;
      moodLog.stressLevel = stressLevel !== undefined ? stressLevel : moodLog.stressLevel;
      moodLog.notes = notes !== undefined ? notes : moodLog.notes;
      await moodLog.save();

      logger.info(`Mood log updated for user: ${req.user.email}`);

      return res.status(200).json({
        success: true,
        message: 'Mood log updated successfully',
        data: moodLog
      });
    }

    // Create new log
    moodLog = await MoodLog.create({
      user: req.user._id,
      date: logDate,
      mood,
      intensity,
      energyLevel,
      sleepQuality,
      sleepHours,
      stressLevel,
      notes
    });

    logger.info(`Mood log created for user: ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Mood log created successfully',
      data: moodLog
    });
  } catch (error) {
    logger.error(`Create mood log error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error creating mood log'
    });
  }
};

/**
 * @desc    Get all mood logs for user
 * @route   GET /api/moods
 * @access  Private
 */
export const getMoodLogs = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const logs = await MoodLog.getUserHistory(
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
    logger.error(`Get mood logs error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error fetching mood logs'
    });
  }
};

/**
 * @desc    Get mood log by date
 * @route   GET /api/moods/date/:date
 * @access  Private
 */
export const getMoodLogByDate = async (req, res) => {
  try {
    const logDate = new Date(req.params.date);
    logDate.setHours(0, 0, 0, 0);

    const moodLog = await MoodLog.findOne({
      user: req.user._id,
      date: logDate
    });

    if (!moodLog) {
      return res.status(404).json({
        success: false,
        message: 'No mood log found for this date'
      });
    }

    res.status(200).json({
      success: true,
      data: moodLog
    });
  } catch (error) {
    logger.error(`Get mood log by date error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error fetching mood log'
    });
  }
};

/**
 * @desc    Get single mood log by ID
 * @route   GET /api/moods/:id
 * @access  Private
 */
export const getMoodLog = async (req, res) => {
  try {
    const moodLog = await MoodLog.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!moodLog) {
      return res.status(404).json({
        success: false,
        message: 'Mood log not found'
      });
    }

    res.status(200).json({
      success: true,
      data: moodLog
    });
  } catch (error) {
    logger.error(`Get mood log error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error fetching mood log'
    });
  }
};

/**
 * @desc    Update mood log
 * @route   PUT /api/moods/:id
 * @access  Private
 */
export const updateMoodLog = async (req, res) => {
  try {
    const { mood, intensity, energyLevel, sleepQuality, sleepHours, stressLevel, notes } = req.body;

    let moodLog = await MoodLog.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!moodLog) {
      return res.status(404).json({
        success: false,
        message: 'Mood log not found'
      });
    }

    if (mood) moodLog.mood = mood;
    if (intensity) moodLog.intensity = intensity;
    if (energyLevel) moodLog.energyLevel = energyLevel;
    if (sleepQuality !== undefined) moodLog.sleepQuality = sleepQuality;
    if (sleepHours !== undefined) moodLog.sleepHours = sleepHours;
    if (stressLevel !== undefined) moodLog.stressLevel = stressLevel;
    if (notes !== undefined) moodLog.notes = notes;

    await moodLog.save();

    logger.info(`Mood log updated for user: ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Mood log updated successfully',
      data: moodLog
    });
  } catch (error) {
    logger.error(`Update mood log error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error updating mood log'
    });
  }
};

/**
 * @desc    Delete mood log
 * @route   DELETE /api/moods/:id
 * @access  Private
 */
export const deleteMoodLog = async (req, res) => {
  try {
    const moodLog = await MoodLog.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!moodLog) {
      return res.status(404).json({
        success: false,
        message: 'Mood log not found'
      });
    }

    logger.info(`Mood log deleted for user: ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Mood log deleted successfully'
    });
  } catch (error) {
    logger.error(`Delete mood log error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error deleting mood log'
    });
  }
};

/**
 * @desc    Get mood analytics
 * @route   GET /api/moods/analytics
 * @access  Private
 */
export const getMoodAnalytics = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const analytics = await MoodLog.getMoodAnalytics(req.user._id, parseInt(days));

    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    logger.error(`Get mood analytics error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error fetching mood analytics'
    });
  }
};

export default {
  createMoodLog,
  getMoodLogs,
  getMoodLogByDate,
  getMoodLog,
  updateMoodLog,
  deleteMoodLog,
  getMoodAnalytics
};
