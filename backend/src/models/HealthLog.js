import mongoose from 'mongoose';

/**
 * Health Log Schema
 * Stores daily health metrics like weight, water intake, exercise, etc.
 */
const healthLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    
    // Date of the health log
    date: {
      type: Date,
      required: [true, 'Date is required']
    },
    
    // Weight tracking (in kg)
    weight: {
      type: Number,
      min: [20, 'Weight must be at least 20 kg'],
      max: [300, 'Weight cannot exceed 300 kg']
    },
    
    // Height tracking (in cm)
    height: {
      type: Number,
      min: [100, 'Height must be at least 100 cm'],
      max: [250, 'Height cannot exceed 250 cm']
    },
    
    // Water intake (in ml)
    waterIntake: {
      type: Number,
      min: 0,
      max: 10000,
      default: 0
    },
    
    // Exercise duration (in minutes)
    exerciseDuration: {
      type: Number,
      min: 0,
      max: 1440
    },
    
    // Type of exercise
    exerciseType: {
      type: String,
      enum: ['walking', 'running', 'cycling', 'swimming', 'yoga', 'strength', 'cardio', 'other']
    },
    
    // Medication taken
    medicationsTaken: [{
      name: String,
      dosage: String,
      time: String
    }],
    
    // Supplements taken
    supplements: [{
      type: String
    }],
    
    // Sexual activity
    sexualActivity: {
      type: Boolean,
      default: false
    },
    
    // Protection used
    protectionUsed: {
      type: Boolean
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
healthLogSchema.index({ user: 1, date: -1 });

// Ensure one health log per user per day
healthLogSchema.index({ user: 1, date: 1 }, { unique: true });

/**
 * Virtual for BMI calculation
 */
healthLogSchema.virtual('bmi').get(function() {
  if (this.weight && this.height) {
    const heightInMeters = this.height / 100;
    return (this.weight / (heightInMeters * heightInMeters)).toFixed(1);
  }
  return null;
});

/**
 * Virtual for BMI category
 */
healthLogSchema.virtual('bmiCategory').get(function() {
  const bmi = this.bmi;
  if (!bmi) return null;
  
  const bmiValue = parseFloat(bmi);
  if (bmiValue < 18.5) return 'Underweight';
  if (bmiValue < 25) return 'Normal';
  if (bmiValue < 30) return 'Overweight';
  return 'Obese';
});

/**
 * Static method to get user's health history
 */
healthLogSchema.statics.getUserHistory = async function(userId, startDate, endDate) {
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
 * Static method to get health analytics
 */
healthLogSchema.statics.getHealthAnalytics = async function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const logs = await this.find({
    user: userId,
    date: { $gte: startDate }
  }).lean();
  
  const weightData = logs.filter(l => l.weight).map(l => ({ date: l.date, value: l.weight }));
  const waterData = logs.filter(l => l.waterIntake).map(l => ({ date: l.date, value: l.waterIntake }));
  const exerciseData = logs.filter(l => l.exerciseDuration).map(l => ({ date: l.date, value: l.exerciseDuration }));
  
  return {
    weightTrend: weightData,
    waterIntakeTrend: waterData,
    exerciseTrend: exerciseData,
    averageWaterIntake: waterData.length > 0 
      ? Math.round(waterData.reduce((a, b) => a + b.value, 0) / waterData.length)
      : 0,
    totalExerciseMinutes: exerciseData.reduce((a, b) => a + b.value, 0),
    daysWithExercise: exerciseData.length
  };
};

const HealthLog = mongoose.model('HealthLog', healthLogSchema);

export default HealthLog;
