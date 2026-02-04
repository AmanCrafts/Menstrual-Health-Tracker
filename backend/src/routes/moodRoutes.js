import express from 'express';
import {
    createMoodLog,
    getMoodLogs,
    getMoodLogByDate,
    getMoodLog,
    updateMoodLog,
    deleteMoodLog,
    getMoodAnalytics,
} from '../controllers/moodController.js';
import { protect } from '../middleware/auth.js';
import { moodLogValidation, objectIdValidation, dateRangeValidation } from '../validators/index.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Analytics route (must be before :id route)
router.get('/analytics', getMoodAnalytics);

// Get by date route
router.get('/date/:date', getMoodLogByDate);

// CRUD routes
router.route('/').get(dateRangeValidation, getMoodLogs).post(moodLogValidation, createMoodLog);

router
    .route('/:id')
    .get(objectIdValidation('id'), getMoodLog)
    .put(objectIdValidation('id'), updateMoodLog)
    .delete(objectIdValidation('id'), deleteMoodLog);

export default router;
