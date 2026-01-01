/**
 * FlowSync Menstrual Cycle Prediction Engine
 * 
 * Comprehensive algorithm based on medical research for accurate cycle predictions.
 * References:
 * - Standard luteal phase: 12-16 days (average 14 days)
 * - Normal cycle range: 21-35 days
 * - Fertile window: 5 days before ovulation + ovulation day + 1 day after
 * - Sperm viability: up to 5 days
 * - Egg viability: 12-24 hours after ovulation
 */

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

export const CYCLE_CONSTANTS = {
  // Normal cycle parameters
  MIN_CYCLE_LENGTH: 21,
  MAX_CYCLE_LENGTH: 35,
  DEFAULT_CYCLE_LENGTH: 28,
  
  // Luteal phase (days from ovulation to next period)
  MIN_LUTEAL_PHASE: 10,
  MAX_LUTEAL_PHASE: 16,
  DEFAULT_LUTEAL_PHASE: 14,
  
  // Period length
  MIN_PERIOD_LENGTH: 2,
  MAX_PERIOD_LENGTH: 8,
  DEFAULT_PERIOD_LENGTH: 5,
  
  // Fertile window
  FERTILE_DAYS_BEFORE_OVULATION: 5,
  FERTILE_DAYS_AFTER_OVULATION: 1,
  
  // PMS window
  PMS_START_DAYS_BEFORE_PERIOD: 10,
  PMS_END_DAYS_BEFORE_PERIOD: 1,
  
  // Minimum data requirements
  MIN_CYCLES_FOR_PREDICTION: 1,
  IDEAL_CYCLES_FOR_PREDICTION: 3,
  MAX_CYCLES_FOR_AVERAGE: 6,
  
  // Irregularity thresholds
  REGULAR_CYCLE_VARIANCE: 3,
  MODERATE_VARIANCE: 7,
  HIGH_VARIANCE: 14,
};

// ============================================================================
// DATA VALIDATION & SANITIZATION
// ============================================================================

/**
 * Validate and normalize a date input
 * @param {Date|string|number} date - Date to normalize
 * @returns {Date|null} - Normalized Date object or null if invalid
 */
export function normalizeDate(date) {
  if (!date) return null;
  
  const normalized = new Date(date);
  
  // Check if valid date
  if (Number.isNaN(normalized.getTime())) return null;
  
  // Normalize to start of day in local timezone
  normalized.setHours(0, 0, 0, 0);
  
  return normalized;
}

/**
 * Validate cycle length is within reasonable bounds
 * @param {number} length - Cycle length to validate
 * @returns {number} - Validated and bounded cycle length
 */
export function validateCycleLength(length) {
  if (!length || Number.isNaN(length)) return CYCLE_CONSTANTS.DEFAULT_CYCLE_LENGTH;
  
  return Math.max(
    CYCLE_CONSTANTS.MIN_CYCLE_LENGTH,
    Math.min(60, Math.round(length))
  );
}

/**
 * Validate period length is within reasonable bounds
 * @param {number} length - Period length to validate
 * @returns {number} - Validated and bounded period length
 */
export function validatePeriodLength(length) {
  if (!length || Number.isNaN(length)) return CYCLE_CONSTANTS.DEFAULT_PERIOD_LENGTH;
  
  return Math.max(
    CYCLE_CONSTANTS.MIN_PERIOD_LENGTH,
    Math.min(15, Math.round(length))
  );
}

/**
 * Clean and sort period logs, removing invalid entries
 * @param {Array} logs - Array of period log objects
 * @returns {Array} - Cleaned and sorted logs (newest first)
 */
export function sanitizePeriodLogs(logs) {
  if (!Array.isArray(logs) || logs.length === 0) return [];
  
  return logs
    .filter(log => {
      // Must have a valid start date
      const startDate = normalizeDate(log.startDate);
      if (!startDate) return false;
      
      // Start date can't be too far in the future
      const maxFuture = new Date();
      maxFuture.setDate(maxFuture.getDate() + 7);
      if (startDate > maxFuture) return false;
      
      // Skip predicted entries
      if (log.isPredicted) return false;
      
      return true;
    })
    .map(log => ({
      ...log,
      startDate: normalizeDate(log.startDate),
      endDate: log.endDate ? normalizeDate(log.endDate) : null
    }))
    .sort((a, b) => b.startDate - a.startDate);
}

// ============================================================================
// STATISTICAL ANALYSIS
// ============================================================================

/**
 * Calculate cycle lengths from period history
 * @param {Array} sortedLogs - Sorted period logs (newest first)
 * @returns {Array} - Array of cycle lengths in days
 */
export function calculateCycleLengths(sortedLogs) {
  if (!sortedLogs || sortedLogs.length < 2) return [];
  
  const cycleLengths = [];
  
  for (let i = 0; i < sortedLogs.length - 1; i++) {
    const currentStart = normalizeDate(sortedLogs[i].startDate);
    const previousStart = normalizeDate(sortedLogs[i + 1].startDate);
    
    if (currentStart && previousStart) {
      const diffDays = Math.round((currentStart - previousStart) / (1000 * 60 * 60 * 24));
      
      // Only include reasonable cycle lengths
      if (diffDays >= CYCLE_CONSTANTS.MIN_CYCLE_LENGTH && diffDays <= 60) {
        cycleLengths.push(diffDays);
      }
    }
  }
  
  return cycleLengths;
}

/**
 * Calculate period lengths from history
 * @param {Array} sortedLogs - Sorted period logs (newest first)
 * @returns {Array} - Array of period lengths in days
 */
export function calculatePeriodLengths(sortedLogs) {
  if (!sortedLogs || sortedLogs.length === 0) return [];
  
  return sortedLogs
    .filter(log => log.startDate && log.endDate)
    .map(log => {
      const start = normalizeDate(log.startDate);
      const end = normalizeDate(log.endDate);
      if (!start || !end) return null;
      
      const days = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
      return days >= 1 && days <= 15 ? days : null;
    })
    .filter(length => length !== null);
}

/**
 * Calculate weighted average (more recent cycles have higher weight)
 * @param {Array} values - Array of numeric values
 * @param {number} decayFactor - Weight decay factor (0.7-0.9 recommended)
 * @returns {number} - Weighted average
 */
export function calculateWeightedAverage(values, decayFactor = 0.85) {
  if (!values || values.length === 0) return null;
  if (values.length === 1) return values[0];
  
  let weightedSum = 0;
  let weightSum = 0;
  
  values.forEach((value, index) => {
    const weight = Math.pow(decayFactor, index);
    weightedSum += value * weight;
    weightSum += weight;
  });
  
  return Math.round(weightedSum / weightSum);
}

/**
 * Calculate standard deviation
 * @param {Array} values - Array of numeric values
 * @returns {number} - Standard deviation
 */
export function calculateStandardDeviation(values) {
  if (!values || values.length < 2) return 0;
  
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const squareDiffs = values.map(value => Math.pow(value - avg, 2));
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length;
  
  return Math.sqrt(avgSquareDiff);
}

/**
 * Remove outliers using IQR method
 * @param {Array} values - Array of numeric values
 * @returns {Array} - Array with outliers removed
 */
export function removeOutliers(values) {
  if (!values || values.length < 4) return values;
  
  const sorted = [...values].sort((a, b) => a - b);
  const q1Index = Math.floor(sorted.length * 0.25);
  const q3Index = Math.floor(sorted.length * 0.75);
  const q1 = sorted[q1Index];
  const q3 = sorted[q3Index];
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  
  return values.filter(v => v >= lowerBound && v <= upperBound);
}

/**
 * Calculate cycle regularity score (0-100)
 * @param {Array} cycleLengths - Array of cycle lengths
 * @returns {Object} - Regularity score and category
 */
export function calculateCycleRegularity(cycleLengths) {
  if (!cycleLengths || cycleLengths.length < 2) {
    return { score: null, category: 'insufficient_data', variance: null };
  }
  
  const stdDev = calculateStandardDeviation(cycleLengths);
  const maxDiff = Math.max(...cycleLengths) - Math.min(...cycleLengths);
  
  let score, category;
  
  if (stdDev <= 1.5 && maxDiff <= 3) {
    score = 95;
    category = 'very_regular';
  } else if (stdDev <= 2.5 && maxDiff <= 5) {
    score = 85;
    category = 'regular';
  } else if (stdDev <= 4 && maxDiff <= 8) {
    score = 70;
    category = 'moderately_regular';
  } else if (stdDev <= 6 && maxDiff <= 12) {
    score = 50;
    category = 'somewhat_irregular';
  } else {
    score = 30;
    category = 'irregular';
  }
  
  return { score, category, variance: Math.round(stdDev * 10) / 10 };
}

// ============================================================================
// CORE PREDICTION ALGORITHMS
// ============================================================================

/**
 * Calculate the next period start date using advanced prediction
 * @param {Date|string} lastPeriodDate - Last known period start date
 * @param {number} cycleLength - Base cycle length from user profile
 * @param {Array} cycleLogs - Array of period log objects
 * @returns {Date} - Predicted next period start date
 */
export function calculateNextPeriod(lastPeriodDate, cycleLength, cycleLogs = []) {
  // Sanitize and validate inputs
  const sanitizedLogs = sanitizePeriodLogs(cycleLogs);
  let referenceDate = normalizeDate(lastPeriodDate);
  let predictedCycleLength = validateCycleLength(cycleLength);
  
  // Use most recent logged period if available and more recent
  if (sanitizedLogs.length > 0) {
    const mostRecentLog = sanitizedLogs[0];
    const mostRecentDate = normalizeDate(mostRecentLog.startDate);
    
    if (mostRecentDate && (!referenceDate || mostRecentDate > referenceDate)) {
      referenceDate = mostRecentDate;
    }
    
    // Calculate cycle length from history if we have enough data
    const cycleLengths = calculateCycleLengths(sanitizedLogs);
    if (cycleLengths.length >= 1) {
      const cleanedLengths = cycleLengths.length >= 4 
        ? removeOutliers(cycleLengths) 
        : cycleLengths;
      
      if (cleanedLengths.length > 0) {
        predictedCycleLength = calculateWeightedAverage(cleanedLengths);
      }
    }
  }
  
  if (!referenceDate) {
    return null;
  }
  
  const nextPeriod = new Date(referenceDate);
  nextPeriod.setDate(nextPeriod.getDate() + predictedCycleLength);
  
  const today = normalizeDate(new Date());
  
  while (nextPeriod < today) {
    nextPeriod.setDate(nextPeriod.getDate() + predictedCycleLength);
  }
  
  return nextPeriod;
}

/**
 * Calculate multiple future period predictions with confidence ranges
 * @param {Date|string} lastPeriodDate - Last known period start date
 * @param {number} cycleLength - Base cycle length
 * @param {Array} cycleLogs - Period log history
 * @param {number} count - Number of predictions to generate
 * @returns {Array} - Array of prediction objects with dates and confidence
 */
export function calculateFuturePeriods(lastPeriodDate, cycleLength, cycleLogs = [], count = 3) {
  const predictions = [];
  const sanitizedLogs = sanitizePeriodLogs(cycleLogs);
  
  const cycleLengths = calculateCycleLengths(sanitizedLogs);
  const cleanedLengths = cycleLengths.length >= 4 
    ? removeOutliers(cycleLengths) 
    : cycleLengths;
  
  const avgCycleLength = cleanedLengths.length > 0 
    ? calculateWeightedAverage(cleanedLengths) 
    : validateCycleLength(cycleLength);
  
  const stdDev = calculateStandardDeviation(cleanedLengths);
  const regularity = calculateCycleRegularity(cycleLengths);
  
  let referenceDate = normalizeDate(lastPeriodDate);
  if (sanitizedLogs.length > 0) {
    const mostRecent = normalizeDate(sanitizedLogs[0].startDate);
    if (mostRecent && (!referenceDate || mostRecent > referenceDate)) {
      referenceDate = mostRecent;
    }
  }
  
  if (!referenceDate) {
    return predictions;
  }
  
  let currentDate = new Date(referenceDate);
  const today = normalizeDate(new Date());
  
  for (let i = 0; i < count + 5; i++) {
    currentDate = new Date(currentDate);
    currentDate.setDate(currentDate.getDate() + avgCycleLength);
    
    if (currentDate <= today) continue;
    
    const monthsAhead = Math.floor((currentDate - today) / (30 * 24 * 60 * 60 * 1000));
    let confidence = regularity.score || 70;
    confidence -= (monthsAhead * 5);
    confidence = Math.max(30, Math.min(95, confidence));
    
    const rangeMargin = Math.ceil(stdDev) || 2;
    
    predictions.push({
      predictedDate: new Date(currentDate),
      confidence: confidence,
      rangeStart: new Date(currentDate.getTime() - rangeMargin * 24 * 60 * 60 * 1000),
      rangeEnd: new Date(currentDate.getTime() + rangeMargin * 24 * 60 * 60 * 1000),
      cycleNumber: predictions.length + 1
    });
    
    if (predictions.length >= count) break;
  }
  
  return predictions;
}

/**
 * Calculate ovulation date based on luteal phase
 * @param {Date|string} nextPeriodDate - Expected next period date
 * @param {number} cycleLength - Cycle length
 * @returns {Object|Date} - Ovulation date and range
 */
export function calculateOvulation(nextPeriodDate, cycleLength = 28) {
  const periodDate = normalizeDate(nextPeriodDate);
  if (!periodDate) return null;
  
  let lutealPhase = CYCLE_CONSTANTS.DEFAULT_LUTEAL_PHASE;
  
  if (cycleLength < 26) {
    lutealPhase = 12;
  } else if (cycleLength > 32) {
    lutealPhase = 14;
  }
  
  const ovulationDate = new Date(periodDate);
  ovulationDate.setDate(periodDate.getDate() - lutealPhase);
  ovulationDate.setHours(0, 0, 0, 0);
  
  const ovulationEarliest = new Date(periodDate);
  ovulationEarliest.setDate(periodDate.getDate() - (lutealPhase + 2));
  ovulationEarliest.setHours(0, 0, 0, 0);
  
  const ovulationLatest = new Date(periodDate);
  ovulationLatest.setDate(periodDate.getDate() - (lutealPhase - 2));
  ovulationLatest.setHours(0, 0, 0, 0);
  
  return {
    date: ovulationDate,
    earliest: ovulationEarliest,
    latest: ovulationLatest,
    lutealPhase
  };
}

/**
 * Calculate the fertile window
 * @param {Date|string} nextPeriodDate - Expected next period date
 * @param {number} cycleLength - Cycle length
 * @returns {Object} - Fertile window with peak days
 */
export function calculateFertileWindow(nextPeriodDate, cycleLength = 28) {
  const ovulation = calculateOvulation(nextPeriodDate, cycleLength);
  if (!ovulation) return null;
  
  const fertileStart = new Date(ovulation.date);
  fertileStart.setDate(ovulation.date.getDate() - CYCLE_CONSTANTS.FERTILE_DAYS_BEFORE_OVULATION);
  fertileStart.setHours(0, 0, 0, 0);
  
  const fertileEnd = new Date(ovulation.date);
  fertileEnd.setDate(ovulation.date.getDate() + CYCLE_CONSTANTS.FERTILE_DAYS_AFTER_OVULATION);
  fertileEnd.setHours(0, 0, 0, 0);
  
  const peakStart = new Date(ovulation.date);
  peakStart.setDate(ovulation.date.getDate() - 2);
  peakStart.setHours(0, 0, 0, 0);
  
  return {
    start: fertileStart,
    end: fertileEnd,
    peakStart: peakStart,
    peakEnd: ovulation.date,
    ovulationDate: ovulation.date,
    totalDays: CYCLE_CONSTANTS.FERTILE_DAYS_BEFORE_OVULATION + CYCLE_CONSTANTS.FERTILE_DAYS_AFTER_OVULATION + 1
  };
}

/**
 * Calculate PMS window
 * @param {Date|string} nextPeriodDate - Expected next period date
 * @returns {Object} - PMS window dates
 */
export function calculatePmsDays(nextPeriodDate) {
  const periodDate = normalizeDate(nextPeriodDate);
  if (!periodDate) return null;
  
  const pmsStart = new Date(periodDate);
  pmsStart.setDate(periodDate.getDate() - CYCLE_CONSTANTS.PMS_START_DAYS_BEFORE_PERIOD);
  pmsStart.setHours(0, 0, 0, 0);
  
  const pmsEnd = new Date(periodDate);
  pmsEnd.setDate(periodDate.getDate() - CYCLE_CONSTANTS.PMS_END_DAYS_BEFORE_PERIOD);
  pmsEnd.setHours(0, 0, 0, 0);
  
  const peakStart = new Date(periodDate);
  peakStart.setDate(periodDate.getDate() - 5);
  peakStart.setHours(0, 0, 0, 0);
  
  return {
    start: pmsStart,
    end: pmsEnd,
    peakStart,
    peakEnd: pmsEnd
  };
}

/**
 * Calculate current day in cycle
 * @param {Date|string} lastPeriodDate - Last period start date
 * @param {Date|string} currentDate - Date to check
 * @param {number} cycleLength - Expected cycle length
 * @returns {Object} - Cycle day info
 */
export function calculateCycleDay(lastPeriodDate, currentDate = new Date(), cycleLength = 28) {
  const lastPeriod = normalizeDate(lastPeriodDate);
  const current = normalizeDate(currentDate);
  
  if (!lastPeriod || !current) {
    return { day: null, phase: 'unknown', daysUntilPeriod: null };
  }
  
  const diffTime = current - lastPeriod;
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (totalDays < 0) {
    return { day: null, phase: 'unknown', daysUntilPeriod: Math.abs(totalDays) };
  }
  
  const cycleDay = (totalDays % cycleLength) + 1;
  const daysUntilPeriod = cycleLength - cycleDay + 1;
  
  return {
    day: cycleDay,
    totalDaysSinceLastPeriod: totalDays,
    daysUntilPeriod: daysUntilPeriod > 0 ? daysUntilPeriod : cycleLength,
    cycleNumber: Math.floor(totalDays / cycleLength) + 1
  };
}

// ============================================================================
// CYCLE PHASE DETECTION
// ============================================================================

/**
 * Comprehensive cycle phase detection
 */
export function getCyclePhaseInfo(date, lastPeriodDate, cycleLength, periodLength, cycleLogs = []) {
  const checkDate = normalizeDate(date);
  const sanitizedLogs = sanitizePeriodLogs(cycleLogs);
  
  if (!checkDate) {
    return { phase: 'unknown', cycleDay: null, info: {} };
  }
  
  const validatedCycleLength = validateCycleLength(cycleLength);
  const validatedPeriodLength = validatePeriodLength(periodLength);
  
  const cycleLengths = calculateCycleLengths(sanitizedLogs);
  const actualCycleLength = cycleLengths.length > 0 
    ? calculateWeightedAverage(cycleLengths) 
    : validatedCycleLength;
  
  let referencePeriod = normalizeDate(lastPeriodDate);
  
  if (sanitizedLogs.length > 0) {
    for (const log of sanitizedLogs) {
      const logStart = normalizeDate(log.startDate);
      if (logStart && logStart <= checkDate) {
        referencePeriod = logStart;
        break;
      }
    }
    
    if (!referencePeriod || referencePeriod > checkDate) {
      const oldest = sanitizedLogs[sanitizedLogs.length - 1];
      referencePeriod = normalizeDate(oldest.startDate);
    }
  }
  
  if (!referencePeriod) {
    return { phase: 'unknown', cycleDay: null, info: {} };
  }
  
  const dayInfo = calculateCycleDay(referencePeriod, checkDate, actualCycleLength);
  const cycleDay = dayInfo.day || 1;
  
  // Calculate which cycle number the checkDate falls into
  const daysSinceReference = Math.floor((checkDate - referencePeriod) / (1000 * 60 * 60 * 24));
  const cycleNumber = Math.floor(daysSinceReference / actualCycleLength);
  
  // Calculate the start of the current cycle (the period start for the cycle containing checkDate)
  const currentCycleStart = new Date(referencePeriod);
  currentCycleStart.setDate(referencePeriod.getDate() + (cycleNumber * actualCycleLength));
  currentCycleStart.setHours(0, 0, 0, 0);
  
  // Next period is at the end of the current cycle
  const nextPeriodFromRef = new Date(currentCycleStart);
  nextPeriodFromRef.setDate(currentCycleStart.getDate() + actualCycleLength);
  nextPeriodFromRef.setHours(0, 0, 0, 0);
  
  // Calculate ovulation/fertile/pms for the CURRENT cycle (not the first cycle)
  const ovulation = calculateOvulation(nextPeriodFromRef, actualCycleLength);
  const fertileWindow = calculateFertileWindow(nextPeriodFromRef, actualCycleLength);
  const pmsDays = calculatePmsDays(nextPeriodFromRef);
  
  const periodEnd = new Date(currentCycleStart);
  periodEnd.setDate(currentCycleStart.getDate() + validatedPeriodLength - 1);
  
  const isLoggedPeriod = sanitizedLogs.some(log => {
    const start = normalizeDate(log.startDate);
    const end = log.endDate ? normalizeDate(log.endDate) : new Date(start);
    if (!log.endDate) end.setDate(start.getDate() + validatedPeriodLength - 1);
    return checkDate >= start && checkDate <= end;
  });
  
  let phase, phaseInfo;
  
  const isPeriod = isLoggedPeriod || (cycleDay >= 1 && cycleDay <= validatedPeriodLength);
  
  // Use direct date component comparison (more reliable than getTime or toDateString)
  const isSameDay = (d1, d2) => {
    if (!d1 || !d2) return false;
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };
  
  const isDateInRange = (date, start, end) => {
    if (!date || !start || !end) return false;
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    return d >= s && d <= e;
  };
  
  const isOvulation = ovulation && ovulation.date && isSameDay(checkDate, ovulation.date);
  const isFertile = fertileWindow && isDateInRange(checkDate, fertileWindow.start, fertileWindow.end);
  const isPMS = pmsDays && isDateInRange(checkDate, pmsDays.start, pmsDays.end);
  
  // Debug logging (remove in production)
  console.log('Phase Detection:', {
    checkDate: checkDate.toLocaleDateString(),
    referencePeriod: referencePeriod.toLocaleDateString(),
    currentCycleStart: currentCycleStart.toLocaleDateString(),
    nextPeriod: nextPeriodFromRef.toLocaleDateString(),
    cycleDay,
    cycleNumber,
    ovulationDate: ovulation?.date?.toLocaleDateString(),
    fertileStart: fertileWindow?.start?.toLocaleDateString(),
    fertileEnd: fertileWindow?.end?.toLocaleDateString(),
    isPeriod, isOvulation, isFertile, isPMS
  });
  
  if (isPeriod) {
    phase = 'period';
    phaseInfo = {
      name: 'Menstruation',
      description: 'Your uterine lining is shedding. This phase typically lasts 3-7 days.',
      tips: [
        'Stay hydrated - aim for 8+ glasses of water',
        'Use heat therapy for cramps',
        'Eat iron-rich foods',
        'Light exercise can help relieve cramps',
        'Get adequate rest'
      ],
      hormones: 'Low estrogen and progesterone',
      energy: 'Low to moderate',
      color: '#F43F5E'
    };
  } else if (isOvulation) {
    phase = 'ovulation';
    phaseInfo = {
      name: 'Ovulation',
      description: 'Your ovary is releasing an egg. This is your most fertile day.',
      tips: [
        'Peak fertility - important if trying to conceive',
        'Track basal body temperature',
        'Notice cervical mucus changes',
        'Energy and libido typically highest',
        'Great time for high-intensity workouts'
      ],
      hormones: 'LH surge, peak estrogen',
      energy: 'High',
      color: '#EC4899'
    };
  } else if (isFertile) {
    phase = 'fertile';
    phaseInfo = {
      name: 'Fertile Window',
      description: 'Sperm can survive up to 5 days, making these days your fertile window.',
      tips: [
        'High fertility - use protection if not trying to conceive',
        'Monitor cervical mucus',
        'Increased energy common',
        'Good time for challenging activities',
        'Skin often clearer'
      ],
      hormones: 'Rising estrogen',
      energy: 'High',
      color: '#14B8A6'
    };
  } else if (isPMS) {
    phase = 'pms';
    phaseInfo = {
      name: 'Premenstrual (Luteal Phase)',
      description: 'Progesterone rises then falls as your body prepares for menstruation.',
      tips: [
        'Reduce salt and caffeine',
        'Increase calcium and magnesium',
        'Practice stress-management',
        'Maintain regular sleep',
        'Gentle exercise helps'
      ],
      hormones: 'Progesterone dominant, then falling',
      energy: 'Decreasing',
      color: '#F97316'
    };
  } else {
    phase = 'follicular';
    phaseInfo = {
      name: 'Follicular Phase',
      description: 'Your body is preparing to release an egg. Energy and mood typically improve.',
      tips: [
        'Great time for new projects',
        'Energy levels rising',
        'Good for high-intensity exercise',
        'Focus and concentration improved',
        'Metabolism slightly faster'
      ],
      hormones: 'Rising estrogen, FSH stimulating follicles',
      energy: 'Increasing',
      color: '#3B82F6'
    };
  }
  
  const nextPeriod = calculateNextPeriod(lastPeriodDate, actualCycleLength, cycleLogs);
  
  return {
    phase,
    cycleDay,
    totalCycleLength: actualCycleLength,
    info: phaseInfo,
    nextPeriod,
    ovulationDate: ovulation?.date || null,
    fertileWindow: fertileWindow || null,
    pmsDays: pmsDays || null,
    isPeriod,
    isOvulation,
    isFertile,
    isPMS,
    daysUntilPeriod: dayInfo.daysUntilPeriod
  };
}

// ============================================================================
// HEALTH CALCULATIONS
// ============================================================================

/**
 * Calculate BMI with validation
 */
export function calculateBMI(height, weight) {
  if (!height || !weight || height <= 0 || weight <= 0) {
    return null;
  }
  
  if (height < 100 || height > 250 || weight < 25 || weight > 300) {
    return null;
  }
  
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  const roundedBmi = Math.round(bmi * 10) / 10;
  
  let category, color, healthInfo;
  
  if (bmi < 16) {
    category = 'Severely underweight';
    color = '#EF4444';
    healthInfo = 'Very low BMI can affect menstrual regularity.';
  } else if (bmi < 18.5) {
    category = 'Underweight';
    color = '#F97316';
    healthInfo = 'Being underweight may affect hormone production.';
  } else if (bmi < 25) {
    category = 'Normal weight';
    color = '#22C55E';
    healthInfo = 'Healthy BMI range.';
  } else if (bmi < 30) {
    category = 'Overweight';
    color = '#F97316';
    healthInfo = 'Higher BMI may affect hormone balance.';
  } else {
    category = 'Obese';
    color = '#EF4444';
    healthInfo = 'Obesity can affect menstrual health.';
  }
  
  return {
    value: roundedBmi,
    category,
    color,
    healthInfo,
    isHealthy: bmi >= 18.5 && bmi < 25
  };
}

/**
 * Get BMI category
 */
export function getBmiCategory(bmi) {
  if (!bmi || Number.isNaN(bmi)) return 'Unknown';
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

/**
 * Adjust cycle prediction based on lifestyle factors
 */
export function adjustCyclePrediction(baseLength, age, bmi, stressLevel, activityLevel) {
  let adjustedLength = validateCycleLength(baseLength);
  const adjustments = [];
  
  if (age) {
    if (age < 18) {
      adjustedLength += 2;
      adjustments.push('Young age: cycles may be longer (+2 days)');
    } else if (age > 40 && age <= 45) {
      adjustedLength -= 1;
      adjustments.push('Perimenopause: cycles may shorten (-1 day)');
    } else if (age > 45) {
      adjustedLength += 3;
      adjustments.push('Perimenopause: cycles may become irregular');
    }
  }
  
  if (bmi) {
    if (bmi < 18.5) {
      adjustedLength += 2;
      adjustments.push('Low BMI: may cause longer cycles (+2 days)');
    } else if (bmi > 30) {
      adjustedLength += 2;
      adjustments.push('High BMI: may affect regularity (+2 days)');
    }
  }
  
  if (stressLevel === 'high' || stressLevel === 'very_high') {
    adjustedLength += 3;
    adjustments.push('High stress: can delay ovulation (+3 days)');
  }
  
  if (activityLevel === 'very_high' || activityLevel === 'extreme') {
    adjustedLength += 2;
    adjustments.push('Intense exercise: can affect hormones (+2 days)');
  }
  
  const finalLength = Math.max(21, Math.min(45, Math.round(adjustedLength)));
  
  return {
    originalLength: baseLength,
    adjustedLength: finalLength,
    adjustments,
    confidence: adjustments.length > 3 ? 'low' : adjustments.length > 1 ? 'moderate' : 'high'
  };
}

// ============================================================================
// HEALTH INSIGHTS GENERATION
// ============================================================================

/**
 * Generate comprehensive health insights
 */
export function generateHealthInsights(userProfile, periodData, symptomLogs = [], moodLogs = []) {
  const insights = [];
  const periodLogs = periodData?.logs || periodData || [];
  const sanitizedLogs = sanitizePeriodLogs(periodLogs);
  
  if (sanitizedLogs.length < 2) {
    insights.push({
      type: 'info',
      priority: 1,
      title: 'Track More Cycles',
      description: 'Log at least 2-3 complete cycles for personalized insights.',
      icon: 'info-circle',
      category: 'data'
    });
    return insights;
  }
  
  const cycleLengths = calculateCycleLengths(sanitizedLogs);
  const regularity = calculateCycleRegularity(cycleLengths);
  
  if (regularity.category === 'very_regular' || regularity.category === 'regular') {
    insights.push({
      type: 'positive',
      priority: 2,
      title: 'Regular Cycles',
      description: `Your cycles are consistent with only ${regularity.variance} day variance.`,
      icon: 'check-circle',
      category: 'cycle'
    });
  } else if (regularity.category === 'somewhat_irregular' || regularity.category === 'irregular') {
    insights.push({
      type: 'warning',
      priority: 1,
      title: 'Irregular Cycles Detected',
      description: `Your cycle length varies significantly. Stress, weight, or hormonal factors may be involved.`,
      icon: 'exclamation-triangle',
      category: 'cycle'
    });
  }
  
  const avgCycleLength = cycleLengths.length > 0 
    ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length)
    : 28;
  
  if (avgCycleLength < 21) {
    insights.push({
      type: 'alert',
      priority: 1,
      title: 'Short Cycles',
      description: 'Your average cycle is less than 21 days.',
      icon: 'exclamation-circle',
      category: 'cycle'
    });
  } else if (avgCycleLength > 35) {
    insights.push({
      type: 'warning',
      priority: 1,
      title: 'Long Cycles',
      description: 'Your average cycle is over 35 days.',
      icon: 'clock',
      category: 'cycle'
    });
  }
  
  const periodLengths = calculatePeriodLengths(sanitizedLogs);
  if (periodLengths.length >= 2) {
    const avgPeriodLength = Math.round(
      periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length
    );
    
    if (avgPeriodLength > 7) {
      insights.push({
        type: 'warning',
        priority: 2,
        title: 'Extended Periods',
        description: `Your periods last ${avgPeriodLength} days on average.`,
        icon: 'clock',
        category: 'period'
      });
    }
  }
  
  if (symptomLogs && symptomLogs.length > 0) {
    const symptomCounts = {};
    
    symptomLogs.forEach(log => {
      if (!log.symptoms) return;
      Object.entries(log.symptoms).forEach(([symptom, present]) => {
        if (present) symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
      });
    });
    
    const topSymptoms = Object.entries(symptomCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([symptom]) => symptom);
    
    if (topSymptoms.includes('headache') && topSymptoms.includes('fatigue')) {
      insights.push({
        type: 'tip',
        priority: 3,
        title: 'Frequent Headaches & Fatigue',
        description: 'Track water intake and sleep patterns.',
        icon: 'lightbulb',
        category: 'symptom'
      });
    }
    
    if (topSymptoms.includes('cramps')) {
      insights.push({
        type: 'tip',
        priority: 3,
        title: 'Menstrual Cramps Relief',
        description: 'Exercise, heat therapy, and anti-inflammatory foods may help.',
        icon: 'heart',
        category: 'symptom'
      });
    }
  }
  
  // Mood pattern analysis
  if (moodLogs && moodLogs.length > 0) {
    const moodCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    moodLogs.forEach(log => {
      if (log.mood >= 1 && log.mood <= 5) {
        moodCounts[log.mood]++;
      }
    });
    
    const totalMoods = Object.values(moodCounts).reduce((a, b) => a + b, 0);
    const lowMoodPercentage = totalMoods > 0 
      ? ((moodCounts[1] + moodCounts[2]) / totalMoods) * 100 
      : 0;
    
    if (lowMoodPercentage > 50) {
      insights.push({
        type: 'warning',
        priority: 2,
        title: 'Low Mood Pattern',
        description: 'You\'ve been experiencing low moods frequently. Consider relaxation techniques or speaking with a healthcare provider.',
        icon: 'heart',
        category: 'mood'
      });
    } else if (lowMoodPercentage > 30) {
      insights.push({
        type: 'tip',
        priority: 3,
        title: 'Mood Fluctuations',
        description: 'Some mood changes are normal during your cycle. Regular exercise and sleep can help.',
        icon: 'lightbulb',
        category: 'mood'
      });
    }
  }
  
  return insights.sort((a, b) => a.priority - b.priority);
}

/**
 * Calculate prediction confidence
 */
export function calculatePredictionConfidence(cycleLogs = []) {
  const sanitizedLogs = sanitizePeriodLogs(cycleLogs);
  const cycleLengths = calculateCycleLengths(sanitizedLogs);
  
  let confidence = 50;
  const factors = [];
  
  if (sanitizedLogs.length >= 6) {
    confidence += 20;
    factors.push({ name: 'Sufficient history', impact: '+20%' });
  } else if (sanitizedLogs.length >= 3) {
    confidence += 10;
    factors.push({ name: 'Moderate history', impact: '+10%' });
  } else if (sanitizedLogs.length < 1) {
    confidence -= 20;
    factors.push({ name: 'No history', impact: '-20%' });
  }
  
  const regularity = calculateCycleRegularity(cycleLengths);
  if (regularity.category === 'very_regular') {
    confidence += 25;
    factors.push({ name: 'Very regular cycles', impact: '+25%' });
  } else if (regularity.category === 'regular') {
    confidence += 15;
    factors.push({ name: 'Regular cycles', impact: '+15%' });
  } else if (regularity.category === 'irregular') {
    confidence -= 10;
    factors.push({ name: 'Irregular cycles', impact: '-10%' });
  }
  
  if (sanitizedLogs.length > 0) {
    const mostRecent = sanitizedLogs[0].startDate;
    const daysSinceLastLog = Math.floor((Date.now() - new Date(mostRecent)) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastLog < 35) {
      confidence += 5;
      factors.push({ name: 'Recent data', impact: '+5%' });
    } else if (daysSinceLastLog > 90) {
      confidence -= 10;
      factors.push({ name: 'Outdated data', impact: '-10%' });
    }
  }
  
  confidence = Math.max(20, Math.min(95, confidence));
  
  return {
    score: confidence,
    level: confidence >= 80 ? 'high' : confidence >= 60 ? 'moderate' : 'low',
    factors,
    recommendation: confidence < 60 
      ? 'Continue logging periods to improve accuracy.'
      : 'Predictions are reasonably accurate.'
  };
}

export default {
  CYCLE_CONSTANTS,
  normalizeDate,
  validateCycleLength,
  validatePeriodLength,
  sanitizePeriodLogs,
  calculateCycleLengths,
  calculatePeriodLengths,
  calculateWeightedAverage,
  calculateStandardDeviation,
  removeOutliers,
  calculateCycleRegularity,
  calculateNextPeriod,
  calculateFuturePeriods,
  calculateOvulation,
  calculateFertileWindow,
  calculatePmsDays,
  calculateCycleDay,
  getCyclePhaseInfo,
  calculateBMI,
  getBmiCategory,
  adjustCyclePrediction,
  generateHealthInsights,
  calculatePredictionConfidence
};
