import express from 'express';
import {
  createHealthLog,
  getHealthLogs,
  getHealthLogByDate,
  getHealthLog,
  updateHealthLog,
  deleteHealthLog,
  getHealthAnalytics
} from '../controllers/healthController.js';
import { protect } from '../middleware/auth.js';
import { healthLogValidation, objectIdValidation, dateRangeValidation } from '../validators/index.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Analytics route (must be before :id route)
router.get('/analytics', getHealthAnalytics);

// Get by date route
router.get('/date/:date', getHealthLogByDate);

// CRUD routes
router.route('/')
  .get(dateRangeValidation, getHealthLogs)
  .post(healthLogValidation, createHealthLog);

router.route('/:id')
  .get(objectIdValidation('id'), getHealthLog)
  .put(objectIdValidation('id'), updateHealthLog)
  .delete(objectIdValidation('id'), deleteHealthLog);

export default router;
