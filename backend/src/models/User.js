import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';

/**
 * User Schema
 * Stores user authentication and profile information
 */
const userSchema = new mongoose.Schema(
    {
        // Authentication fields
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
        },
        password: {
            type: String,
            minlength: [6, 'Password must be at least 6 characters'],
            select: false, // Don't return password by default
        },

        // OAuth fields
        googleId: {
            type: String,
            sparse: true, // Allow null but unique when present
            unique: true,
        },
        authProvider: {
            type: String,
            enum: ['local', 'google'],
            default: 'local',
        },

        // Profile fields
        displayName: {
            type: String,
            trim: true,
            maxlength: [50, 'Display name cannot exceed 50 characters'],
        },
        photoURL: {
            type: String,
        },
        birthDate: {
            type: Date,
        },

        // Menstrual cycle settings
        cycleSettings: {
            averageCycleLength: {
                type: Number,
                default: 28,
                min: [20, 'Cycle length must be at least 20 days'],
                max: [45, 'Cycle length cannot exceed 45 days'],
            },
            averagePeriodLength: {
                type: Number,
                default: 5,
                min: [1, 'Period length must be at least 1 day'],
                max: [10, 'Period length cannot exceed 10 days'],
            },
            lastPeriodDate: {
                type: Date,
            },
        },

        // Account status
        isActive: {
            type: Boolean,
            default: true,
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },

        // Password reset fields
        resetPasswordToken: String,
        resetPasswordExpire: Date,

        // Refresh token for JWT rotation
        refreshToken: {
            type: String,
            select: false,
        },

        // Last login tracking
        lastLogin: {
            type: Date,
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Index for sorting by creation date (email and googleId already have indexes from unique: true)
userSchema.index({ createdAt: -1 });

/**
 * Pre-save middleware to hash password
 */
userSchema.pre('save', async function (next) {
    // Only hash if password is modified
    if (!this.isModified('password')) {
        return next();
    }

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(config.bcrypt.saltRounds);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

/**
 * Method to compare entered password with hashed password
 * @param {string} enteredPassword - Password to compare
 * @returns {Promise<boolean>} - True if passwords match
 */
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Method to generate JWT access token
 * @returns {string} - JWT token
 */
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            id: this._id,
            email: this.email,
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expire }
    );
};

/**
 * Method to generate refresh token
 * @returns {string} - Refresh token
 */
userSchema.methods.generateRefreshToken = function () {
    const refreshToken = jwt.sign({ id: this._id }, config.jwt.secret, { expiresIn: '30d' });

    return refreshToken;
};

/**
 * Static method to find user by credentials
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} - User object if credentials are valid
 */
userSchema.statics.findByCredentials = async function (email, password) {
    const user = await this.findOne({ email }).select('+password');

    if (!user) {
        throw new Error('Invalid email or password');
    }

    if (user.authProvider !== 'local') {
        throw new Error(`Please sign in with ${user.authProvider}`);
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
        throw new Error('Invalid email or password');
    }

    return user;
};

/**
 * Virtual for user's age
 */
userSchema.virtual('age').get(function () {
    if (!this.birthDate) return null;

    const today = new Date();
    const birthDate = new Date(this.birthDate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
});

/**
 * Transform output for JSON
 */
userSchema.methods.toJSON = function () {
    const user = this.toObject();

    // Remove sensitive fields
    delete user.password;
    delete user.refreshToken;
    delete user.resetPasswordToken;
    delete user.resetPasswordExpire;
    delete user.__v;

    return user;
};

const User = mongoose.model('User', userSchema);

export default User;
