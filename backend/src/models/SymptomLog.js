import mongoose from 'mongoose';

/**
 * Symptom Log Schema
 * Stores daily symptom tracking records
 */
const symptomLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    
    // Date of the symptom log
    date: {
      type: Date,
      required: [true, 'Date is required']
    },
    
    // Physical symptoms
    symptoms: {
      cramps: { type: Boolean, default: false },
      headache: { type: Boolean, default: false },
      backache: { type: Boolean, default: false },
      fatigue: { type: Boolean, default: false },
      bloating: { type: Boolean, default: false },
      breastTenderness: { type: Boolean, default: false },
      acne: { type: Boolean, default: false },
      cravings: { type: Boolean, default: false },
      nausea: { type: Boolean, default: false },
      diarrhea: { type: Boolean, default: false },
      constipation: { type: Boolean, default: false },
      insomnia: { type: Boolean, default: false },
      spotting: { type: Boolean, default: false },
      dizziness: { type: Boolean, default: false },
      hotFlashes: { type: Boolean, default: false },
      chills: { type: Boolean, default: false }
    },
    
    // Overall intensity of symptoms
    intensity: {
      type: String,
      enum: ['mild', 'moderate', 'severe'],
      default: 'mild'
    },
    
    // Pain level (0-10)
    painLevel: {
      type: Number,
      min: 0,
      max: 10,
      default: 0
    },
    
    // Notes
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Compound index for user + date queries
symptomLogSchema.index({ user: 1, date: -1 });

// Ensure one symptom log per user per day
symptomLogSchema.index({ user: 1, date: 1 }, { unique: true });

/**
 * Virtual for getting active symptoms as array
 */
symptomLogSchema.virtual('activeSymptoms').get(function() {
  const active = [];
  if (this.symptoms) {
    Object.entries(this.symptoms.toObject ? this.symptoms.toObject() : this.symptoms)
      .forEach(([key, value]) => {
        if (value === true) {
          active.push(key);
        }
      });
  }
  return active;
});

/**
 * Static method to get user's symptom history
 */
symptomLogSchema.statics.getUserHistory = async function(userId, startDate, endDate) {
  const query = { user: userId };
  
  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  return await this.find(query)
    .sort({ date: -1 })
    .lean();
};

/**
 * Static method to get most common symptoms for a user
 */
symptomLogSchema.statics.getMostCommonSymptoms = async function(userId, limit = 5) {
  const logs = await this.find({ user: userId })
    .select('symptoms')
    .lean();
  
  const symptomCounts = {};
  
  logs.forEach(log => {
    if (log.symptoms) {
      Object.entries(log.symptoms).forEach(([symptom, hasSymptom]) => {
        if (hasSymptom) {
          symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
        }
      });
    }
  });
  
  return Object.entries(symptomCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([symptom, count]) => ({ symptom, count, percentage: Math.round((count / logs.length) * 100) }));
};

const SymptomLog = mongoose.model('SymptomLog', symptomLogSchema);

export default SymptomLog;
