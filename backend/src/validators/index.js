import { body, param, query, validationResult } from 'express-validator';


/**
 * Validation result handler middleware
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

/**
 * User registration validation rules
 */
export const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('displayName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Display name cannot exceed 50 characters'),
  validate
];

/**
 * User login validation rules
 */
export const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validate
];

/**
 * Google OAuth validation rules
 */
export const googleAuthValidation = [
  body('googleId')
    .notEmpty()
    .withMessage('Google ID is required'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('displayName')
    .optional()
    .trim(),
  body('photoURL')
    .optional()
    .isURL()
    .withMessage('Photo URL must be a valid URL'),
  validate
];

/**
 * Profile update validation rules
 */
export const profileUpdateValidation = [
  body('displayName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Display name cannot exceed 50 characters'),
  body('birthDate')
    .optional()
    .isISO8601()
    .withMessage('Birth date must be a valid date'),
  body('cycleSettings.averageCycleLength')
    .optional()
    .isInt({ min: 20, max: 45 })
    .withMessage('Cycle length must be between 20 and 45 days'),
  body('cycleSettings.averagePeriodLength')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Period length must be between 1 and 10 days'),
  body('cycleSettings.lastPeriodDate')
    .optional()
    .isISO8601()
    .withMessage('Last period date must be a valid date'),
  validate
];

/**
 * Period log validation rules
 */
export const periodLogValidation = [
  body('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  body('flowIntensity')
    .optional()
    .isIn(['light', 'medium', 'heavy', 'spotting'])
    .withMessage('Invalid flow intensity'),
  body('painLevel')
    .optional()
    .isInt({ min: 0, max: 10 })
    .withMessage('Pain level must be between 0 and 10'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  validate
];

/**
 * Symptom log validation rules
 */
export const symptomLogValidation = [
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Date must be a valid date'),
  body('intensity')
    .optional()
    .isIn(['mild', 'moderate', 'severe'])
    .withMessage('Invalid intensity'),
  body('painLevel')
    .optional()
    .isInt({ min: 0, max: 10 })
    .withMessage('Pain level must be between 0 and 10'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  validate
];

/**
 * Mood log validation rules
 */
export const moodLogValidation = [
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Date must be a valid date'),
  body('mood')
    .notEmpty()
    .withMessage('Mood is required')
    .isIn(['happy', 'calm', 'tired', 'anxious', 'irritable', 'sad', 'stressed', 'emotional', 'energetic', 'neutral', 'angry', 'confused', 'hopeful', 'relaxed', 'overwhelmed'])
    .withMessage('Invalid mood value'),
  body('intensity')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Intensity must be between 1 and 5'),
  body('energyLevel')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Energy level must be between 1 and 5'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  validate
];

/**
 * Health log validation rules
 */
export const healthLogValidation = [
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Date must be a valid date'),
  body('weight')
    .optional()
    .isFloat({ min: 20, max: 300 })
    .withMessage('Weight must be between 20 and 300 kg'),
  body('height')
    .optional()
    .isFloat({ min: 100, max: 250 })
    .withMessage('Height must be between 100 and 250 cm'),
  body('waterIntake')
    .optional()
    .isInt({ min: 0, max: 10000 })
    .withMessage('Water intake must be between 0 and 10000 ml'),
  body('exerciseDuration')
    .optional()
    .isInt({ min: 0, max: 1440 })
    .withMessage('Exercise duration must be between 0 and 1440 minutes'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  validate
];

/**
 * MongoDB ObjectId validation
 */
export const objectIdValidation = (paramName = 'id') => [
  param(paramName)
    .isMongoId()
    .withMessage('Invalid ID format'),
  validate
];

/**
 * Date range query validation
 */
export const dateRangeValidation = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  validate
];

export default {
  validate,
  registerValidation,
  loginValidation,
  googleAuthValidation,
  profileUpdateValidation,
  periodLogValidation,
  symptomLogValidation,
  moodLogValidation,
  healthLogValidation,
  objectIdValidation,
  dateRangeValidation
};
