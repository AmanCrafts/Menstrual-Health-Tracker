import mongoose from 'mongoose';

/**
 * Mood Log Schema
 * Stores daily mood tracking records
 */
const moodLogSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },

        // Date of the mood log
        date: {
            type: Date,
            required: [true, 'Date is required'],
        },

        // Primary mood
        mood: {
            type: String,
            required: [true, 'Mood is required'],
            enum: [
                'happy',
                'calm',
                'tired',
                'anxious',
                'irritable',
                'sad',
                'stressed',
                'emotional',
                'energetic',
                'neutral',
                'angry',
                'confused',
                'hopeful',
                'relaxed',
                'overwhelmed',
            ],
        },

        // Mood intensity (1-5)
        intensity: {
            type: Number,
            min: 1,
            max: 5,
            default: 3,
        },

        // Energy level (1-5)
        energyLevel: {
            type: Number,
            min: 1,
            max: 5,
            default: 3,
        },

        // Sleep quality (1-5)
        sleepQuality: {
            type: Number,
            min: 1,
            max: 5,
        },

        // Hours of sleep
        sleepHours: {
            type: Number,
            min: 0,
            max: 24,
        },

        // Stress level (1-5)
        stressLevel: {
            type: Number,
            min: 1,
            max: 5,
        },

        // Notes
        notes: {
            type: String,
            maxlength: [500, 'Notes cannot exceed 500 characters'],
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Compound index for user + date queries
moodLogSchema.index({ user: 1, date: -1 });

// Ensure one mood log per user per day
moodLogSchema.index({ user: 1, date: 1 }, { unique: true });

/**
 * Static method to get user's mood history
 */
moodLogSchema.statics.getUserHistory = async function (userId, startDate, endDate) {
    const query = { user: userId };

    if (startDate && endDate) {
        query.date = {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
        };
    }

    return await this.find(query).sort({ date: -1 }).lean();
};

/**
 * Static method to get mood analytics for a user
 */
moodLogSchema.statics.getMoodAnalytics = async function (userId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await this.find({
        user: userId,
        date: { $gte: startDate },
    }).lean();

    const moodCounts = {};
    let totalEnergy = 0;
    let totalStress = 0;
    let energyCount = 0;
    let stressCount = 0;

    logs.forEach((log) => {
        moodCounts[log.mood] = (moodCounts[log.mood] || 0) + 1;

        if (log.energyLevel) {
            totalEnergy += log.energyLevel;
            energyCount++;
        }

        if (log.stressLevel) {
            totalStress += log.stressLevel;
            stressCount++;
        }
    });

    return {
        moodDistribution: Object.entries(moodCounts)
            .map(([mood, count]) => ({
                mood,
                count,
                percentage: Math.round((count / logs.length) * 100),
            }))
            .sort((a, b) => b.count - a.count),
        averageEnergy: energyCount > 0 ? (totalEnergy / energyCount).toFixed(1) : null,
        averageStress: stressCount > 0 ? (totalStress / stressCount).toFixed(1) : null,
        totalLogs: logs.length,
    };
};

const MoodLog = mongoose.model('MoodLog', moodLogSchema);

export default MoodLog;
