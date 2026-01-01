import mongoose from 'mongoose';

/**
 * Period Log Schema
 * Stores individual period/menstrual cycle records
 * 
 * Medical Reference:
 * - Normal cycle length: 21-35 days (average 28)
 * - Normal period length: 2-8 days (average 5)
 * - Luteal phase: 10-16 days (average 14)
 */

// Constants for validation
const CYCLE_LIMITS = {
  MIN_CYCLE: 15,    // Allow some edge cases
  MAX_CYCLE: 60,
  MIN_PERIOD: 1,
  MAX_PERIOD: 15,
  DEFAULT_CYCLE: 28,
  DEFAULT_PERIOD: 5
};

const periodLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    
    // Period start and end dates
    startDate: {
      type: Date,
      required: [true, 'Period start date is required'],
      validate: {
        validator: function(value) {
          // Can't be more than 7 days in the future
          const maxFuture = new Date();
          maxFuture.setDate(maxFuture.getDate() + 7);
          return value <= maxFuture;
        },
        message: 'Start date cannot be too far in the future'
      }
    },
    endDate: {
      type: Date,
      validate: {
        validator: function(value) {
          if (!value) return true;
          // End date must be after or equal to start date
          if (value < this.startDate) return false;
          // Period can't be longer than 15 days
          const diffDays = Math.ceil((value - this.startDate) / (1000 * 60 * 60 * 24));
          return diffDays <= CYCLE_LIMITS.MAX_PERIOD;
        },
        message: 'End date must be after start date and within 15 days'
      }
    },
    
    // Flow intensity
    flowIntensity: {
      type: String,
      enum: ['light', 'medium', 'heavy', 'spotting'],
      default: 'medium'
    },
    
    // Period length (auto-calculated or manual)
    periodLength: {
      type: Number,
      min: [CYCLE_LIMITS.MIN_PERIOD, `Period must be at least ${CYCLE_LIMITS.MIN_PERIOD} day`],
      max: [CYCLE_LIMITS.MAX_PERIOD, `Period cannot exceed ${CYCLE_LIMITS.MAX_PERIOD} days`]
    },
    
    // Cycle length (calculated from previous period)
    cycleLength: {
      type: Number,
      min: [CYCLE_LIMITS.MIN_CYCLE, `Cycle must be at least ${CYCLE_LIMITS.MIN_CYCLE} days`],
      max: [CYCLE_LIMITS.MAX_CYCLE, `Cycle cannot exceed ${CYCLE_LIMITS.MAX_CYCLE} days`]
    },
    
    // Additional notes
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters']
    },
    
    // Pain level (0-10 scale)
    painLevel: {
      type: Number,
      min: 0,
      max: 10,
      default: 0
    },
    
    // Symptoms experienced
    symptoms: [{
      type: String,
      enum: [
        'cramps', 'headache', 'backache', 'fatigue', 'bloating',
        'breastTenderness', 'acne', 'cravings', 'nausea', 'diarrhea',
        'constipation', 'insomnia', 'spotting', 'dizziness', 'moodSwings',
        'heavyBleeding', 'lightBleeding', 'clotting', 'pelvicPain'
      ]
    }],
    
    // Is this a prediction or actual log
    isPredicted: {
      type: Boolean,
      default: false
    },
    
    // Confidence score for predicted periods
    confidence: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Compound index for efficient user + date queries
periodLogSchema.index({ user: 1, startDate: -1 });
periodLogSchema.index({ user: 1, createdAt: -1 });
periodLogSchema.index({ user: 1, isPredicted: 1 });

/**
 * Pre-save middleware to calculate period length and validate
 */
periodLogSchema.pre('save', async function(next) {
  // Calculate period length if both dates are provided
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    this.periodLength = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }
  
  // Calculate cycle length from previous period (if exists)
  if (!this.cycleLength && !this.isNew) {
    try {
      const previousPeriod = await this.constructor.findOne({
        user: this.user,
        startDate: { $lt: this.startDate },
        isPredicted: false
      }).sort({ startDate: -1 });
      
      if (previousPeriod) {
        const diffDays = Math.round(
          (this.startDate - previousPeriod.startDate) / (1000 * 60 * 60 * 24)
        );
        if (diffDays >= CYCLE_LIMITS.MIN_CYCLE && diffDays <= CYCLE_LIMITS.MAX_CYCLE) {
          this.cycleLength = diffDays;
        }
      }
    } catch {
      // Continue without cycle length if error
    }
  }
  
  next();
});

/**
 * Post-save middleware to update previous period's cycle length
 */
periodLogSchema.post('save', async function(doc) {
  if (doc.isPredicted) return;
  
  try {
    // Find the previous period and update its cycleLength
    const previousPeriod = await this.constructor.findOne({
      user: doc.user,
      startDate: { $lt: doc.startDate },
      isPredicted: false,
      _id: { $ne: doc._id }
    }).sort({ startDate: -1 });
    
    if (previousPeriod) {
      const diffDays = Math.round(
        (doc.startDate - previousPeriod.startDate) / (1000 * 60 * 60 * 24)
      );
      
      if (diffDays >= CYCLE_LIMITS.MIN_CYCLE && diffDays <= CYCLE_LIMITS.MAX_CYCLE) {
        await this.constructor.findByIdAndUpdate(previousPeriod._id, {
          cycleLength: diffDays
        });
      }
    }
  } catch (err) {
    console.error('Error updating cycle length:', err);
  }
});

/**
 * Virtual for period status
 */
periodLogSchema.virtual('status').get(function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const start = new Date(this.startDate);
  start.setHours(0, 0, 0, 0);
  
  if (this.endDate) {
    const end = new Date(this.endDate);
    end.setHours(0, 0, 0, 0);
    
    if (today >= start && today <= end) return 'ongoing';
    if (today > end) return 'completed';
    return 'upcoming';
  }
  
  if (today >= start) return 'ongoing';
  return 'upcoming';
});

/**
 * Virtual for days since this period
 */
periodLogSchema.virtual('daysSince').get(function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(this.startDate);
  start.setHours(0, 0, 0, 0);
  
  return Math.floor((today - start) / (1000 * 60 * 60 * 24));
});

/**
 * Static method to get user's period history
 */
periodLogSchema.statics.getUserHistory = async function(userId, limit = 12) {
  return await this.find({ user: userId, isPredicted: false })
    .sort({ startDate: -1 })
    .limit(limit)
    .lean();
};

/**
 * Static method to calculate average cycle length with weighted algorithm
 * More recent cycles have higher weight for better accuracy
 */
periodLogSchema.statics.calculateAverageCycleLength = async function(userId, options = {}) {
  const { maxCycles = 6, useWeighted = true } = options;
  
  const periods = await this.find({ user: userId, isPredicted: false })
    .sort({ startDate: -1 })
    .limit(maxCycles + 1) // Need n+1 periods to calculate n cycles
    .lean();
  
  if (periods.length < 2) {
    return CYCLE_LIMITS.DEFAULT_CYCLE;
  }
  
  // Calculate cycle lengths between consecutive periods
  const cycleLengths = [];
  for (let i = 0; i < periods.length - 1; i++) {
    const current = new Date(periods[i].startDate);
    const previous = new Date(periods[i + 1].startDate);
    const diffDays = Math.round((current - previous) / (1000 * 60 * 60 * 24));
    
    // Only include reasonable cycle lengths
    if (diffDays >= CYCLE_LIMITS.MIN_CYCLE && diffDays <= CYCLE_LIMITS.MAX_CYCLE) {
      cycleLengths.push(diffDays);
    }
  }
  
  if (cycleLengths.length === 0) {
    return CYCLE_LIMITS.DEFAULT_CYCLE;
  }
  
  if (cycleLengths.length === 1) {
    return cycleLengths[0];
  }
  
  // Remove outliers if we have enough data
  let cleanedLengths = cycleLengths;
  if (cycleLengths.length >= 4) {
    const sorted = [...cycleLengths].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    cleanedLengths = cycleLengths.filter(v => v >= lowerBound && v <= upperBound);
  }
  
  if (cleanedLengths.length === 0) {
    cleanedLengths = cycleLengths;
  }
  
  if (useWeighted) {
    // Weighted average - more recent cycles have higher weight
    const decayFactor = 0.85;
    let weightedSum = 0;
    let weightSum = 0;
    
    cleanedLengths.forEach((length, index) => {
      const weight = Math.pow(decayFactor, index);
      weightedSum += length * weight;
      weightSum += weight;
    });
    
    return Math.round(weightedSum / weightSum);
  }
  
  // Simple average
  return Math.round(cleanedLengths.reduce((a, b) => a + b, 0) / cleanedLengths.length);
};

/**
 * Static method to calculate average period length
 */
periodLogSchema.statics.calculateAveragePeriodLength = async function(userId, options = {}) {
  const { maxPeriods = 6 } = options;
  
  const periods = await this.find({ 
    user: userId, 
    isPredicted: false,
    periodLength: { $exists: true, $ne: null, $gte: 1, $lte: 15 }
  })
    .sort({ startDate: -1 })
    .limit(maxPeriods)
    .lean();
  
  if (periods.length === 0) {
    return CYCLE_LIMITS.DEFAULT_PERIOD;
  }
  
  const periodLengths = periods.map(p => p.periodLength);
  return Math.round(periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length);
};

/**
 * Static method to calculate cycle regularity
 */
periodLogSchema.statics.calculateCycleRegularity = async function(userId) {
  const periods = await this.find({ user: userId, isPredicted: false })
    .sort({ startDate: -1 })
    .limit(7)
    .lean();
  
  if (periods.length < 3) {
    return { 
      score: null, 
      category: 'insufficient_data', 
      variance: null,
      message: 'Need at least 3 periods for regularity analysis'
    };
  }
  
  // Calculate cycle lengths
  const cycleLengths = [];
  for (let i = 0; i < periods.length - 1; i++) {
    const current = new Date(periods[i].startDate);
    const previous = new Date(periods[i + 1].startDate);
    const diffDays = Math.round((current - previous) / (1000 * 60 * 60 * 24));
    
    if (diffDays >= CYCLE_LIMITS.MIN_CYCLE && diffDays <= CYCLE_LIMITS.MAX_CYCLE) {
      cycleLengths.push(diffDays);
    }
  }
  
  if (cycleLengths.length < 2) {
    return { 
      score: null, 
      category: 'insufficient_data', 
      variance: null,
      message: 'Not enough valid cycle data'
    };
  }
  
  // Calculate standard deviation
  const avg = cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length;
  const squareDiffs = cycleLengths.map(v => Math.pow(v - avg, 2));
  const stdDev = Math.sqrt(squareDiffs.reduce((a, b) => a + b, 0) / cycleLengths.length);
  const maxDiff = Math.max(...cycleLengths) - Math.min(...cycleLengths);
  
  let score, category, message;
  
  if (stdDev <= 1.5 && maxDiff <= 3) {
    score = 95;
    category = 'very_regular';
    message = 'Your cycles are very consistent';
  } else if (stdDev <= 2.5 && maxDiff <= 5) {
    score = 85;
    category = 'regular';
    message = 'Your cycles are regular';
  } else if (stdDev <= 4 && maxDiff <= 8) {
    score = 70;
    category = 'moderately_regular';
    message = 'Your cycles show some variation';
  } else if (stdDev <= 6 && maxDiff <= 12) {
    score = 50;
    category = 'somewhat_irregular';
    message = 'Your cycles show notable variation';
  } else {
    score = 30;
    category = 'irregular';
    message = 'Your cycles are irregular';
  }
  
  return {
    score,
    category,
    variance: Math.round(stdDev * 10) / 10,
    maxVariance: maxDiff,
    averageCycleLength: Math.round(avg),
    message,
    dataPoints: cycleLengths.length
  };
};

/**
 * Static method to get comprehensive cycle statistics
 */
periodLogSchema.statics.getCycleStatistics = async function(userId) {
  const [avgCycle, avgPeriod, regularity, history] = await Promise.all([
    this.calculateAverageCycleLength(userId),
    this.calculateAveragePeriodLength(userId),
    this.calculateCycleRegularity(userId),
    this.getUserHistory(userId, 12)
  ]);
  
  // Calculate trend (is cycle getting longer/shorter?)
  let trend = 'stable';
  if (history.length >= 4) {
    const recentCycles = [];
    for (let i = 0; i < Math.min(history.length - 1, 4); i++) {
      const diff = Math.round(
        (new Date(history[i].startDate) - new Date(history[i + 1].startDate)) / 
        (1000 * 60 * 60 * 24)
      );
      if (diff >= CYCLE_LIMITS.MIN_CYCLE && diff <= CYCLE_LIMITS.MAX_CYCLE) {
        recentCycles.push(diff);
      }
    }
    
    if (recentCycles.length >= 3) {
      const firstHalf = recentCycles.slice(0, Math.floor(recentCycles.length / 2));
      const secondHalf = recentCycles.slice(Math.floor(recentCycles.length / 2));
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      
      if (firstAvg - secondAvg > 2) trend = 'shortening';
      else if (secondAvg - firstAvg > 2) trend = 'lengthening';
    }
  }
  
  return {
    averageCycleLength: avgCycle,
    averagePeriodLength: avgPeriod,
    regularity,
    trend,
    totalLogged: history.length,
    lastPeriod: history[0] || null
  };
};

const PeriodLog = mongoose.model('PeriodLog', periodLogSchema);

export default PeriodLog;
