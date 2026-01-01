import express from 'express';
import {
  createSymptomLog,
  getSymptomLogs,
  getSymptomLogByDate,
  getSymptomLog,
  updateSymptomLog,
  deleteSymptomLog,
  getSymptomAnalytics
} from '../controllers/symptomController.js';
import { protect } from '../middleware/auth.js';
import { symptomLogValidation, objectIdValidation, dateRangeValidation } from '../validators/index.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Analytics route (must be before :id route)
router.get('/analytics', getSymptomAnalytics);

// Get by date route
router.get('/date/:date', getSymptomLogByDate);

// CRUD routes
router.route('/')
  .get(dateRangeValidation, getSymptomLogs)
  .post(symptomLogValidation, createSymptomLog);

router.route('/:id')
  .get(objectIdValidation('id'), getSymptomLog)
  .put(objectIdValidation('id'), updateSymptomLog)
  .delete(objectIdValidation('id'), deleteSymptomLog);

export default router;
