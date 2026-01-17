import mongoose from 'mongoose';
import config from './config/index.js';
import User from './models/User.js';
import PeriodLog from './models/PeriodLog.js';
import HealthLog from './models/HealthLog.js';
import MoodLog from './models/MoodLog.js';
import SymptomLog from './models/SymptomLog.js';

/**
 * Database Seed Script
 * Creates 5 sample users with comprehensive period tracking data
 * Each user has 10+ period cycles with associated health, mood, and symptom logs
 */

// Helper function to get date offset from today
const getDaysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

// Helper function to get random element from array
const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Helper function to get random number in range
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// User data templates with distinct patterns
const users = [
  {
    email: 'sarah.johnson@example.com',
    password: 'pass123',
    displayName: 'Sarah Johnson',
    birthDate: new Date('1995-06-15'),
    cycleSettings: {
      averageCycleLength: 28,
      averagePeriodLength: 5,
      lastPeriodDate: getDaysAgo(5)
    },
    profile: 'regular' // Very regular, healthy cycles
  },
  {
    email: 'emma.williams@example.com',
    password: 'pass123',
    displayName: 'Emma Williams',
    birthDate: new Date('1998-03-22'),
    cycleSettings: {
      averageCycleLength: 30,
      averagePeriodLength: 6,
      lastPeriodDate: getDaysAgo(12)
    },
    profile: 'irregular' // Highly irregular cycles (possible PCOS)
  },
  {
    email: 'olivia.brown@example.com',
    password: 'pass123',
    displayName: 'Olivia Brown',
    birthDate: new Date('1992-11-08'),
    cycleSettings: {
      averageCycleLength: 26,
      averagePeriodLength: 4,
      lastPeriodDate: getDaysAgo(8)
    },
    profile: 'short' // Short cycles, light flow, minimal symptoms
  },
  {
    email: 'ava.davis@example.com',
    password: 'pass123',
    displayName: 'Ava Davis',
    birthDate: new Date('1996-09-30'),
    cycleSettings: {
      averageCycleLength: 32,
      averagePeriodLength: 5,
      lastPeriodDate: getDaysAgo(20)
    },
    profile: 'heavy' // Heavy periods with severe symptoms
  },
  {
    email: 'mia.martinez@example.com',
    password: 'pass123',
    displayName: 'Mia Martinez',
    birthDate: new Date('1994-01-17'),
    cycleSettings: {
      averageCycleLength: 29,
      averagePeriodLength: 7,
      lastPeriodDate: getDaysAgo(3)
    },
    profile: 'athlete' // Athletic, longer periods but manageable
  }
];

// Generate period logs based on user profile
const generatePeriodLogs = (userId, cycleLength, periodLength, profile) => {
  const logs = [];
  let numCycles, cycleVariation, flowPatterns, painRange, symptomSeverity;
  
  // Customize based on profile
  switch(profile) {
    case 'regular':
      numCycles = 12;
      cycleVariation = 1; // Very consistent
      flowPatterns = ['medium', 'medium', 'medium', 'light'];
      painRange = [1, 4]; // Low to moderate pain
      symptomSeverity = 'low';
      break;
    
    case 'irregular':
      numCycles = 10; // Fewer cycles due to irregularity
      cycleVariation = 8; // Highly variable (21-45 days)
      flowPatterns = ['spotting', 'light', 'heavy', 'medium'];
      painRange = [3, 7]; // Moderate to high pain
      symptomSeverity = 'high';
      break;
    
    case 'short':
      numCycles = 14; // More cycles due to shorter length
      cycleVariation = 2;
      flowPatterns = ['light', 'light', 'spotting', 'medium'];
      painRange = [0, 3]; // Minimal pain
      symptomSeverity = 'low';
      break;
    
    case 'heavy':
      numCycles = 11;
      cycleVariation = 3;
      flowPatterns = ['heavy', 'heavy', 'heavy', 'medium'];
      painRange = [5, 10]; // High pain
      symptomSeverity = 'severe';
      break;
    
    case 'athlete':
      numCycles = 11;
      cycleVariation = 4;
      flowPatterns = ['medium', 'light', 'light', 'medium'];
      painRange = [2, 5]; // Moderate pain
      symptomSeverity = 'moderate';
      break;
    
    default:
      numCycles = 11;
      cycleVariation = 3;
      flowPatterns = ['medium'];
      painRange = [2, 6];
      symptomSeverity = 'moderate';
  }
  
  let currentDate = getDaysAgo(5);
  
  for (let i = 0; i < numCycles; i++) {
    const variation = randomInt(-cycleVariation, cycleVariation);
    const actualCycleLength = cycleLength + variation;
    
    // Period length variation based on profile
    let actualPeriodLength;
    if (profile === 'irregular') {
      actualPeriodLength = periodLength + randomInt(-2, 3);
    } else if (profile === 'heavy') {
      actualPeriodLength = periodLength + randomInt(0, 2); // Longer periods
    } else {
      actualPeriodLength = periodLength + randomInt(-1, 1);
    }
    actualPeriodLength = Math.max(2, Math.min(10, actualPeriodLength));
    
    const startDate = new Date(currentDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + actualPeriodLength);
    
    // Flow intensity based on profile
    const flowIntensity = randomFrom(flowPatterns);
    
    // Pain level based on profile
    const painLevel = randomInt(painRange[0], painRange[1]);
    
    // Symptoms based on profile
    let symptoms;
    if (symptomSeverity === 'severe') {
      symptoms = randomFrom([
        ['cramps', 'backache', 'fatigue', 'headache', 'nausea'],
        ['cramps', 'bloating', 'breastTenderness', 'moodSwings', 'fatigue'],
        ['cramps', 'headache', 'fatigue', 'dizziness', 'backache']
      ]);
    } else if (symptomSeverity === 'high') {
      symptoms = randomFrom([
        ['cramps', 'fatigue', 'bloating', 'acne'],
        ['headache', 'bloating', 'moodSwings'],
        ['cramps', 'backache', 'fatigue']
      ]);
    } else if (symptomSeverity === 'moderate') {
      symptoms = randomFrom([
        ['cramps', 'fatigue'],
        ['headache', 'bloating'],
        ['cramps', 'backache']
      ]);
    } else {
      symptoms = randomFrom([
        ['cramps'],
        ['fatigue'],
        ['bloating'],
        []
      ]);
    }
    
    logs.push({
      user: userId,
      startDate,
      endDate,
      flowIntensity,
      periodLength: actualPeriodLength,
      cycleLength: i > 0 ? actualCycleLength : undefined,
      painLevel,
      symptoms,
      notes: getProfileNotes(profile, i)
    });
    
    currentDate.setDate(currentDate.getDate() - actualCycleLength);
  }
  
  return logs.reverse();
};

// Get notes based on profile
const getProfileNotes = (profile, cycleIndex) => {
  const notes = {
    regular: [
      'Regular cycle as expected',
      'Right on schedule',
      'Normal flow',
      'Feeling good',
      ''
    ],
    irregular: [
      'Late this month',
      'Unexpected timing',
      'Cycle is off again',
      'Not sure when to expect next one',
      'Very unpredictable',
      ''
    ],
    short: [
      'Quick and light as usual',
      'Barely any symptoms',
      'Easy cycle',
      '',
      ''
    ],
    heavy: [
      'Very heavy flow',
      'Needed extra protection',
      'Painful cramps today',
      'Taking pain medication',
      'Flow is intense',
      'Considering seeing doctor'
    ],
    athlete: [
      'After intense training week',
      'Managed workout despite period',
      'Energy levels affected',
      'Modified training routine',
      ''
    ]
  };
  
  return randomFrom(notes[profile] || ['']);
};

// Generate health logs based on user profile
const generateHealthLogs = (userId, startDate, endDate, profile) => {
  const logs = [];
  let baseWeight, baseHeight, exerciseFrequency, waterIntakeAvg;
  
  // Customize based on profile
  switch(profile) {
    case 'regular':
      baseWeight = randomInt(58, 68);
      baseHeight = randomInt(162, 170);
      exerciseFrequency = 0.6; // 60% chance of exercise
      waterIntakeAvg = 2500;
      break;
    
    case 'irregular':
      baseWeight = randomInt(70, 85); // Possibly higher BMI (PCOS correlation)
      baseHeight = randomInt(160, 168);
      exerciseFrequency = 0.3; // Less active
      waterIntakeAvg = 1800;
      break;
    
    case 'short':
      baseWeight = randomInt(50, 60); // Lighter weight
      baseHeight = randomInt(155, 165);
      exerciseFrequency = 0.5;
      waterIntakeAvg = 2200;
      break;
    
    case 'heavy':
      baseWeight = randomInt(65, 78);
      baseHeight = randomInt(165, 175);
      exerciseFrequency = 0.4;
      waterIntakeAvg = 2800; // Higher due to blood loss
      break;
    
    case 'athlete':
      baseWeight = randomInt(55, 65); // Athletic build
      baseHeight = randomInt(165, 175);
      exerciseFrequency = 0.9; // Very active
      waterIntakeAvg = 3200;
      break;
    
    default:
      baseWeight = randomInt(55, 75);
      baseHeight = randomInt(160, 170);
      exerciseFrequency = 0.5;
      waterIntakeAvg = 2300;
  }
  
  const dayRange = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
  const numLogs = profile === 'athlete' ? 8 : 5; // Athletes track more
  
  for (let i = 0; i < numLogs; i++) {
    const daysOffset = Math.floor((dayRange / numLogs) * i);
    const logDate = new Date(startDate);
    logDate.setDate(logDate.getDate() + daysOffset);
    
    // Weight fluctuation
    let weightVariation;
    if (profile === 'irregular') {
      weightVariation = randomInt(-5, 5); // More fluctuation
    } else if (profile === 'athlete') {
      weightVariation = randomInt(-1, 1); // Very stable
    } else {
      weightVariation = randomInt(-3, 3);
    }
    
    // Exercise based on profile
    let exerciseDuration = 0;
    let exerciseType = null;
    if (Math.random() < exerciseFrequency) {
      if (profile === 'athlete') {
        exerciseDuration = randomFrom([60, 75, 90, 120]);
        exerciseType = randomFrom(['running', 'strength', 'cycling', 'swimming']);
      } else if (profile === 'irregular') {
        exerciseDuration = randomFrom([0, 20, 30]);
        exerciseType = randomFrom(['walking', 'yoga']);
      } else {
        exerciseDuration = randomFrom([30, 45, 60]);
        exerciseType = randomFrom(['walking', 'running', 'yoga', 'cycling']);
      }
    }
    
    logs.push({
      user: userId,
      date: logDate,
      weight: Math.round((baseWeight + weightVariation) * 10) / 10,
      height: baseHeight,
      waterIntake: waterIntakeAvg + randomInt(-500, 500),
      exerciseDuration,
      exerciseType,
      sexualActivity: randomFrom([true, false, false, false, false]),
      protectionUsed: randomFrom([true, false, null]),
      notes: getHealthNotes(profile)
    });
  }
  
  return logs;
};

const getHealthNotes = (profile) => {
  const notes = {
    regular: ['Maintaining healthy routine', 'Feeling balanced', 'Good energy levels', ''],
    irregular: ['Trying to lose weight', 'Stressed lately', 'Need to exercise more', 'Tired often', ''],
    short: ['Feeling great', 'Energy is good', 'Keeping active', ''],
    heavy: ['Iron supplements helping', 'Fatigue during period', 'Trying to stay active', ''],
    athlete: ['Training for competition', 'Recovery day', 'High-intensity workout', 'Pre-competition prep', '']
  };
  
  return randomFrom(notes[profile] || ['']);
};

// Generate mood logs based on profile
const generateMoodLogs = (userId, periodLogs, profile) => {
  const logs = [];
  
  periodLogs.forEach((period, index) => {
    // Mood intensity based on profile
    let moodDuringPeriod, moodBetweenCycles, energyDuringPeriod, stressDuringPeriod;
    
    switch(profile) {
      case 'regular':
        moodDuringPeriod = ['calm', 'tired', 'neutral'];
        moodBetweenCycles = ['happy', 'energetic', 'calm', 'relaxed'];
        energyDuringPeriod = [2, 3];
        stressDuringPeriod = [1, 2];
        break;
      
      case 'irregular':
        moodDuringPeriod = ['irritable', 'stressed', 'anxious', 'emotional'];
        moodBetweenCycles = ['anxious', 'stressed', 'neutral', 'calm'];
        energyDuringPeriod = [1, 2];
        stressDuringPeriod = [3, 4];
        break;
      
      case 'short':
        moodDuringPeriod = ['calm', 'neutral', 'happy'];
        moodBetweenCycles = ['happy', 'energetic', 'calm'];
        energyDuringPeriod = [3, 4];
        stressDuringPeriod = [1, 2];
        break;
      
      case 'heavy':
        moodDuringPeriod = ['tired', 'irritable', 'sad', 'overwhelmed'];
        moodBetweenCycles = ['calm', 'neutral', 'tired'];
        energyDuringPeriod = [1, 2];
        stressDuringPeriod = [3, 5];
        break;
      
      case 'athlete':
        moodDuringPeriod = ['energetic', 'calm', 'tired'];
        moodBetweenCycles = ['energetic', 'happy', 'calm'];
        energyDuringPeriod = [3, 4];
        stressDuringPeriod = [2, 3];
        break;
      
      default:
        moodDuringPeriod = ['tired', 'calm'];
        moodBetweenCycles = ['happy', 'calm'];
        energyDuringPeriod = [2, 3];
        stressDuringPeriod = [2, 3];
    }
    
    // Log mood during period (first day)
    logs.push({
      user: userId,
      date: new Date(period.startDate),
      mood: randomFrom(moodDuringPeriod),
      intensity: profile === 'heavy' || profile === 'irregular' ? randomInt(3, 5) : randomInt(2, 4),
      energyLevel: randomInt(energyDuringPeriod[0], energyDuringPeriod[1]),
      sleepQuality: profile === 'irregular' ? randomInt(2, 3) : randomInt(3, 4),
      sleepHours: profile === 'athlete' ? randomInt(7, 9) : randomInt(5, 8),
      stressLevel: randomInt(stressDuringPeriod[0], stressDuringPeriod[1]),
      notes: getMoodNotes(profile, 'period')
    });
    
    // Log mood mid-period
    const midPeriod = new Date(period.startDate);
    midPeriod.setDate(midPeriod.getDate() + Math.floor(period.periodLength / 2));
    logs.push({
      user: userId,
      date: midPeriod,
      mood: randomFrom(moodDuringPeriod),
      intensity: randomInt(2, 3),
      energyLevel: randomInt(energyDuringPeriod[0], energyDuringPeriod[1] + 1),
      sleepQuality: randomInt(3, 5),
      sleepHours: randomInt(6, 8),
      stressLevel: randomInt(1, 3)
    });
    
    // Log mood between cycles (mid-cycle)
    if (index < periodLogs.length - 1) {
      const midCycle = new Date(period.endDate);
      midCycle.setDate(midCycle.getDate() + 7);
      logs.push({
        user: userId,
        date: midCycle,
        mood: randomFrom(moodBetweenCycles),
        intensity: profile === 'irregular' ? randomInt(2, 4) : randomInt(3, 5),
        energyLevel: profile === 'athlete' ? 5 : randomInt(3, 5),
        sleepQuality: randomInt(4, 5),
        sleepHours: randomInt(7, 9),
        stressLevel: profile === 'irregular' ? randomInt(2, 4) : randomInt(1, 2),
        notes: getMoodNotes(profile, 'between')
      });
    }
  });
  
  return logs;
};

const getMoodNotes = (profile, phase) => {
  if (phase === 'period') {
    const notes = {
      regular: ['Period started, feeling okay', '', ''],
      irregular: ['Mood swings today', 'Feeling anxious', 'Emotionally exhausted'],
      short: ['Period started, barely noticeable', '', ''],
      heavy: ['Exhausted from heavy flow', 'Pain affecting mood', 'Feeling drained'],
      athlete: ['Modified workout due to period', 'Energy lower than usual', '']
    };
    return randomFrom(notes[profile] || ['']);
  } else {
    const notes = {
      regular: ['Feeling great mid-cycle', '', ''],
      irregular: ['Anxious about next cycle', 'Still stressed', ''],
      short: ['Feeling energized', '', ''],
      heavy: ['Recovered from period', 'Energy returning', ''],
      athlete: ['Training going well', 'Peak performance', '']
    };
    return randomFrom(notes[profile] || ['']);
  }
};

// Generate symptom logs based on profile
const generateSymptomLogs = (userId, periodLogs, profile) => {
  const logs = [];
  
  periodLogs.forEach((period) => {
    let pmsSymptoms, periodSymptoms, intensityLevel, painLevel;
    
    switch(profile) {
      case 'regular':
        pmsSymptoms = { bloating: true, fatigue: randomFrom([true, false]) };
        periodSymptoms = { cramps: true, fatigue: randomFrom([true, false]) };
        intensityLevel = 'mild';
        painLevel = [1, 3];
        break;
      
      case 'irregular':
        pmsSymptoms = {
          bloating: true,
          breastTenderness: true,
          acne: true,
          cravings: true,
          fatigue: true,
          moodSwings: randomFrom([true, false])
        };
        periodSymptoms = {
          cramps: true,
          backache: true,
          fatigue: true,
          bloating: true,
          headache: randomFrom([true, false]),
          nausea: randomFrom([true, false])
        };
        intensityLevel = randomFrom(['moderate', 'severe']);
        painLevel = [4, 7];
        break;
      
      case 'short':
        pmsSymptoms = { bloating: randomFrom([true, false]) };
        periodSymptoms = { cramps: randomFrom([true, false]), fatigue: randomFrom([true, false]) };
        intensityLevel = 'mild';
        painLevel = [0, 2];
        break;
      
      case 'heavy':
        pmsSymptoms = {
          bloating: true,
          breastTenderness: true,
          fatigue: true,
          headache: randomFrom([true, false])
        };
        periodSymptoms = {
          cramps: true,
          backache: true,
          fatigue: true,
          bloating: true,
          headache: true,
          nausea: randomFrom([true, false]),
          dizziness: randomFrom([true, false])
        };
        intensityLevel = 'severe';
        painLevel = [6, 10];
        break;
      
      case 'athlete':
        pmsSymptoms = { fatigue: true, cravings: randomFrom([true, false]) };
        periodSymptoms = {
          cramps: randomFrom([true, false]),
          fatigue: true,
          backache: randomFrom([true, false])
        };
        intensityLevel = 'moderate';
        painLevel = [2, 5];
        break;
      
      default:
        pmsSymptoms = { bloating: true };
        periodSymptoms = { cramps: true };
        intensityLevel = 'moderate';
        painLevel = [2, 5];
    }
    
    // Symptoms a few days before period (PMS)
    const prePeriod = new Date(period.startDate);
    prePeriod.setDate(prePeriod.getDate() - 3);
    logs.push({
      user: userId,
      date: prePeriod,
      symptoms: pmsSymptoms,
      intensity: profile === 'heavy' || profile === 'irregular' ? 'moderate' : 'mild',
      painLevel: randomInt(painLevel[0], Math.ceil(painLevel[1] / 2)),
      notes: getSymptomNotes(profile, 'pms')
    });
    
    // Symptoms during period (first day)
    logs.push({
      user: userId,
      date: new Date(period.startDate),
      symptoms: periodSymptoms,
      intensity: intensityLevel,
      painLevel: period.painLevel,
      notes: getSymptomNotes(profile, 'period')
    });
    
    // Symptoms mid-period (only for profiles with ongoing symptoms)
    if (profile === 'heavy' || profile === 'irregular') {
      const midPeriod = new Date(period.startDate);
      midPeriod.setDate(midPeriod.getDate() + 2);
      logs.push({
        user: userId,
        date: midPeriod,
        symptoms: {
          cramps: randomFrom([true, false]),
          fatigue: true,
          bloating: randomFrom([true, false]),
          headache: profile === 'heavy' ? randomFrom([true, false]) : false
        },
        intensity: 'moderate',
        painLevel: randomInt(painLevel[0], painLevel[1] - 2),
        notes: 'Still experiencing symptoms'
      });
    }
  });
  
  return logs;
};

const getSymptomNotes = (profile, phase) => {
  if (phase === 'pms') {
    const notes = {
      regular: ['PMS symptoms, nothing unusual', ''],
      irregular: ['PMS is intense this month', 'Breakouts again', 'Hormonal symptoms'],
      short: ['Mild PMS', ''],
      heavy: ['Know period is coming soon', 'PMS bloating severe', 'Breast tenderness bad'],
      athlete: ['PMS affecting training', '']
    };
    return randomFrom(notes[profile] || ['']);
  } else {
    const notes = {
      regular: ['Day 1 cramps', ''],
      irregular: ['Painful cramps', 'Taking ibuprofen', 'Severe symptoms today'],
      short: ['Minimal discomfort', ''],
      heavy: ['Severe cramps, staying home', 'Pain is unbearable', 'Heating pad and medication needed', 'Considering doctor visit'],
      athlete: ['Managing symptoms during training', 'Modifying workouts', '']
    };
    return randomFrom(notes[profile] || ['']);
  }
};

// Main seed function
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...');
    
    // Connect to MongoDB
    await mongoose.connect(config.mongodb.uri);
    console.log('✅ Connected to MongoDB');
    console.log('📍 Database:', config.mongodb.uri.includes('mongodb.net') ? 'MongoDB Atlas' : 'Local MongoDB');
    
    // Clear existing data
    console.log('\n🗑️  Clearing existing data...');
    await SymptomLog.deleteMany({});
    console.log('  ✓ Cleared symptom logs');
    await MoodLog.deleteMany({});
    console.log('  ✓ Cleared mood logs');
    await HealthLog.deleteMany({});
    console.log('  ✓ Cleared health logs');
    await PeriodLog.deleteMany({});
    console.log('  ✓ Cleared period logs');
    await User.deleteMany({});
    console.log('  ✓ Cleared users');
    
    // Create users
    console.log('\n📝 Creating users...');
    const createdUsers = [];
    
    for (const userData of users) {
      // Create user - the pre-save hook will hash the password
      const user = new User({
        ...userData,
        authProvider: 'local',
        isActive: true,
        isEmailVerified: true,
        lastLogin: new Date()
      });
      
      await user.save();
      createdUsers.push(user);
      console.log(`  ✓ Created user: ${user.email}`);
    }
    
    // Generate and create logs for each user
    console.log('\n📊 Creating period logs and associated data...');
    
    for (let i = 0; i < createdUsers.length; i++) {
      const user = createdUsers[i];
      const userProfile = users[i].profile; // Get the profile type
      
      console.log(`\n  Processing ${user.displayName} (${userProfile} profile)...`);
      
      // Generate period logs with profile
      const periodLogs = generatePeriodLogs(
        user._id,
        user.cycleSettings.averageCycleLength,
        user.cycleSettings.averagePeriodLength,
        userProfile
      );
      
      const createdPeriods = await PeriodLog.insertMany(periodLogs);
      console.log(`    ✓ Created ${createdPeriods.length} period logs`);
      
      // Generate health logs with profile
      const oldestDate = new Date(periodLogs[0].startDate);
      const newestDate = new Date(periodLogs[periodLogs.length - 1].endDate);
      const healthLogs = generateHealthLogs(user._id, oldestDate, newestDate, userProfile);
      
      const createdHealth = await HealthLog.insertMany(healthLogs);
      console.log(`    ✓ Created ${createdHealth.length} health logs`);
      
      // Generate mood logs with profile
      const moodLogs = generateMoodLogs(user._id, periodLogs, userProfile);
      const createdMoods = await MoodLog.insertMany(moodLogs);
      console.log(`    ✓ Created ${createdMoods.length} mood logs`);
      
      // Generate symptom logs with profile
      const symptomLogs = generateSymptomLogs(user._id, periodLogs, userProfile);
      const createdSymptoms = await SymptomLog.insertMany(symptomLogs);
      console.log(`    ✓ Created ${createdSymptoms.length} symptom logs`);
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('✨ Database seeding completed successfully!');
    console.log('='.repeat(50));
    console.log('\n📊 Summary:');
    console.log(`  • Users created: ${createdUsers.length}`);
    console.log(`  • Total period logs: ${await PeriodLog.countDocuments()}`);
    console.log(`  • Total health logs: ${await HealthLog.countDocuments()}`);
    console.log(`  • Total mood logs: ${await MoodLog.countDocuments()}`);
    console.log(`  • Total symptom logs: ${await SymptomLog.countDocuments()}`);
    
    console.log('\n👥 Test Users (all have password: pass123):');
    for (const user of createdUsers) {
      console.log(`  • ${user.email} (${user.displayName})`);
    }
    
    console.log('\n✅ You can now login with any of these users!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the seed function
seedDatabase()
  .then(() => {
    console.log('🎉 Seed script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seed script failed:', error);
    process.exit(1);
  });
