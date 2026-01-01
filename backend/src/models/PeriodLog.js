import mongoose from 'mongoose';

/**
 * Period Log Schema
 * Stores individual period/menstrual cycle records
 */
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
      required: [true, 'Period start date is required']
    },
    endDate: {
      type: Date,
      validate: {
        validator: function(value) {
          return !value || value >= this.startDate;
        },
        message: 'End date must be after or equal to start date'
      }
    },
    
    // Flow intensity for each day (optional)
    flowIntensity: {
      type: String,
      enum: ['light', 'medium', 'heavy', 'spotting'],
      default: 'medium'
    },
    
    // Period length (calculated or manual)
    periodLength: {
      type: Number,
      min: [1, 'Period length must be at least 1 day'],
      max: [15, 'Period length cannot exceed 15 days']
    },
    
    // Cycle length (days from this period start to next period start)
    cycleLength: {
      type: Number,
      min: [15, 'Cycle length must be at least 15 days'],
      max: [60, 'Cycle length cannot exceed 60 days']
    },
    
    // Additional notes
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    
    // Pain level during this period
    painLevel: {
      type: Number,
      min: 0,
      max: 10
    },
    
    // Symptoms experienced during period
    symptoms: [{
      type: String,
      enum: [
        'cramps', 'headache', 'backache', 'fatigue', 'bloating',
        'breastTenderness', 'acne', 'cravings', 'nausea', 'diarrhea',
        'constipation', 'insomnia', 'spotting', 'dizziness', 'moodSwings'
      ]
    }],
    
    // Is this a predicted period or actual logged period
    isPredicted: {
      type: Boolean,
      default: false
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

/**
 * Pre-save middleware to calculate period length
 */
periodLogSchema.pre('save', function(next) {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    this.periodLength = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }
  next();
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
    
    if (today >= start && today <= end) {
      return 'ongoing';
    } else if (today > end) {
      return 'completed';
    } else {
      return 'upcoming';
    }
  } else if (today >= start) {
    return 'ongoing';
  }
  
  return 'upcoming';
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
 * Static method to calculate average cycle length for a user
 */
periodLogSchema.statics.calculateAverageCycleLength = async function(userId) {
  const periods = await this.find({ user: userId, isPredicted: false })
    .sort({ startDate: -1 })
    .limit(6)
    .lean();
  
  if (periods.length < 2) {
    return 28; // Default if not enough data
  }
  
  const cycleLengths = [];
  for (let i = 0; i < periods.length - 1; i++) {
    const current = new Date(periods[i].startDate);
    const previous = new Date(periods[i + 1].startDate);
    const diffDays = Math.round((current - previous) / (1000 * 60 * 60 * 24));
    
    if (diffDays >= 15 && diffDays <= 60) {
      cycleLengths.push(diffDays);
    }
  }
  
  if (cycleLengths.length === 0) {
    return 28;
  }
  
  return Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length);
};

/**
 * Static method to calculate average period length for a user
 */
periodLogSchema.statics.calculateAveragePeriodLength = async function(userId) {
  const periods = await this.find({ 
    user: userId, 
    isPredicted: false,
    periodLength: { $exists: true, $ne: null }
  })
    .sort({ startDate: -1 })
    .limit(6)
    .lean();
  
  if (periods.length === 0) {
    return 5; // Default if no data
  }
  
  const periodLengths = periods.map(p => p.periodLength).filter(l => l >= 1 && l <= 15);
  
  if (periodLengths.length === 0) {
    return 5;
  }
  
  return Math.round(periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length);
};

const PeriodLog = mongoose.model('PeriodLog', periodLogSchema);

export default PeriodLog;
