import express from 'express';
import {
    createPeriodLog,
    getPeriodLogs,
    getPeriodLog,
    updatePeriodLog,
    deletePeriodLog,
    getCycleStats,
    getCyclePredictions,
} from '../controllers/periodController.js';
import { protect } from '../middleware/auth.js';
import {
    periodLogValidation,
    objectIdValidation,
    dateRangeValidation,
} from '../validators/index.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Stats and predictions routes (must be before :id route)
router.get('/stats', getCycleStats);
router.get('/predictions', getCyclePredictions);

// CRUD routes
router
    .route('/')
    .get(dateRangeValidation, getPeriodLogs)
    .post(periodLogValidation, createPeriodLog);

router
    .route('/:id')
    .get(objectIdValidation('id'), getPeriodLog)
    .put(objectIdValidation('id'), updatePeriodLog)
    .delete(objectIdValidation('id'), deletePeriodLog);

export default router;
