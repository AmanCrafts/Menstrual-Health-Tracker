/**
 * Test data for the Menstrual Health Tracker app
 * Contains sample data for 5 different users with varying cycle patterns
 */

// Function to generate dates in the past (for creating history)
const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
};

// Generate a series of period logs based on a pattern
const generatePeriodLogs = (startDate, count, avgCycleLength, variability, avgPeriodLength) => {
  const logs = [];
  let currentDate = new Date(startDate);
  
  for (let i = 0; i < count; i++) {
    // Add some variability to cycle length
    const cycleVariation = Math.floor(Math.random() * variability * 2) - variability;
    const cycleLength = avgCycleLength + cycleVariation;
    
    // Add some variability to period length
    const periodVariation = Math.floor(Math.random() * 2) - 1;
    const periodLength = Math.max(2, avgPeriodLength + periodVariation);
    
    // Create start date
    const startDateStr = currentDate.toISOString().split('T')[0];
    
    // Create end date
    const endDate = new Date(currentDate);
    endDate.setDate(currentDate.getDate() + periodLength - 1);
    const endDateStr = endDate.toISOString().split('T')[0];
    
    // Add log
    logs.push({
      id: `period-${i}-${startDateStr}`,
      startDate: startDateStr,
      endDate: endDateStr,
      flow: getRandomFlow(),
      notes: getRandomPeriodNote()
    });
    
    // Move to next period
    currentDate.setDate(currentDate.getDate() + cycleLength);
  }
  
  return logs.reverse(); // Most recent first
};

// Generate symptom logs (more frequent during certain phases)
const generateSymptomLogs = (periodLogs, cycleLength) => {
  const logs = [];
  const symptoms = [
    'cramps', 'headache', 'backache', 'fatigue', 'bloating', 
    'breastTenderness', 'acne', 'cravings', 'nausea', 'diarrhea', 
    'constipation', 'insomnia', 'spotting', 'dizziness'
  ];
  
  // For each period, create symptom logs during various phases
  periodLogs.forEach((periodLog, idx) => {
    if (idx === 0) return; // Skip the most recent period (it's in the future)
    
    const periodStart = new Date(periodLog.startDate);
    const periodEnd = new Date(periodLog.endDate);
    
    // During period (higher chance of symptoms)
    for (let day = new Date(periodStart); day <= periodEnd; day.setDate(day.getDate() + 1)) {
      if (Math.random() < 0.7) { // 70% chance of logging symptoms during period
        logs.push(createSymptomLog(day, symptoms, 0.3)); // Higher chance of each symptom
      }
    }
    
    // PMS days (5-7 days before period)
    const pmsStart = new Date(periodStart);
    pmsStart.setDate(periodStart.getDate() - 7);
    const pmsEnd = new Date(periodStart);
    pmsEnd.setDate(periodStart.getDate() - 1);
    
    for (let day = new Date(pmsStart); day <= pmsEnd; day.setDate(day.getDate() + 1)) {
      if (Math.random() < 0.5) { // 50% chance of logging symptoms during PMS
        logs.push(createSymptomLog(day, symptoms, 0.25)); // Medium chance of each symptom
      }
    }
    
    // Ovulation (14 days before period)
    const ovulationDate = new Date(periodStart);
    ovulationDate.setDate(periodStart.getDate() - 14);
    
    if (Math.random() < 0.4) { // 40% chance of logging symptoms on ovulation
      logs.push(createSymptomLog(ovulationDate, symptoms, 0.15)); // Lower chance of each symptom
    }
    
    // Random days in cycle (sparse)
    const nextPeriod = idx > 0 ? new Date(periodLogs[idx - 1].startDate) : new Date();
    const cycleDays = Math.round((nextPeriod - periodStart) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i < cycleDays; i++) {
      if (Math.random() < 0.1) { // 10% chance of random log
        const randomDay = new Date(periodStart);
        randomDay.setDate(periodStart.getDate() + i);
        logs.push(createSymptomLog(randomDay, symptoms, 0.1)); // Low chance of each symptom
      }
    }
  });
  
  return logs.sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date (most recent first)
};

// Create a single symptom log
const createSymptomLog = (date, symptoms, probability) => {
  const symptomLog = {
    id: `symptom-${date.toISOString().split('T')[0]}-${Math.floor(Math.random() * 1000)}`,
    date: date.toISOString().split('T')[0],
    symptoms: {},
    intensity: getRandomIntensity(),
    notes: getRandomSymptomNote()
  };
  
  // Randomly select symptoms based on probability
  symptoms.forEach(symptom => {
    symptomLog.symptoms[symptom] = Math.random() < probability;
  });
  
  return symptomLog;
};

// Generate mood logs
const generateMoodLogs = (periodLogs, cycleLength) => {
  const logs = [];
  const moods = ['happy', 'calm', 'tired', 'anxious', 'irritable', 'sad', 'stressed', 'emotional'];
  
  // For each period, create mood logs
  periodLogs.forEach((periodLog, idx) => {
    if (idx === 0) return; // Skip the most recent period (it's in the future)
    
    const periodStart = new Date(periodLog.startDate);
    const periodEnd = new Date(periodLog.endDate);
    
    // During period (more likely to be tired, irritable, etc.)
    for (let day = new Date(periodStart); day <= periodEnd; day.setDate(day.getDate() + 1)) {
      if (Math.random() < 0.6) { // 60% chance of logging mood during period
        logs.push(createMoodLog(day, getPeriodMood(moods)));
      }
    }
    
    // PMS days (more likely to be emotional, irritable, etc.)
    const pmsStart = new Date(periodStart);
    pmsStart.setDate(periodStart.getDate() - 7);
    const pmsEnd = new Date(periodStart);
    pmsEnd.setDate(periodStart.getDate() - 1);
    
    for (let day = new Date(pmsStart); day <= pmsEnd; day.setDate(day.getDate() + 1)) {
      if (Math.random() < 0.5) { // 50% chance of logging mood during PMS
        logs.push(createMoodLog(day, getPmsMood(moods)));
      }
    }
    
    // Ovulation (more likely to be happy, energetic)
    const ovulationDate = new Date(periodStart);
    ovulationDate.setDate(periodStart.getDate() - 14);
    
    if (Math.random() < 0.4) { // 40% chance of logging mood on ovulation
      logs.push(createMoodLog(ovulationDate, getOvulationMood(moods)));
    }
    
    // Random days in cycle (sparse, more balanced moods)
    const nextPeriod = idx > 0 ? new Date(periodLogs[idx - 1].startDate) : new Date();
    const cycleDays = Math.round((nextPeriod - periodStart) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i < cycleDays; i++) {
      if (Math.random() < 0.15) { // 15% chance of random mood log
        const randomDay = new Date(periodStart);
        randomDay.setDate(periodStart.getDate() + i);
        logs.push(createMoodLog(randomDay, getRandomMood(moods)));
      }
    }
  });
  
  return logs.sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date (most recent first)
};

// Create a single mood log
const createMoodLog = (date, mood) => {
  return {
    id: `mood-${date.toISOString().split('T')[0]}-${Math.floor(Math.random() * 1000)}`,
    date: date.toISOString().split('T')[0],
    mood: mood,
    energy: getRandomEnergy(),
    notes: getRandomMoodNote(mood)
  };
};

// Generate health logs (more sporadic)
const generateHealthLogs = (periodLogs, userProfile) => {
  const logs = [];
  
  // Base metrics from profile
  const baseWeight = userProfile.weight || Math.floor(Math.random() * 30) + 50; // 50-80 kg if not specified
  const height = userProfile.height || Math.floor(Math.random() * 30) + 155; // 155-185 cm if not specified
  
  // For each month period, create 2-5 health logs
  periodLogs.forEach((periodLog, idx) => {
    if (idx === 0) return; // Skip the most recent period (it's in the future)
    
    const periodStart = new Date(periodLog.startDate);
    const nextPeriod = idx > 0 ? new Date(periodLogs[idx - 1].startDate) : new Date();
    const cycleDays = Math.round((nextPeriod - periodStart) / (1000 * 60 * 60 * 24));
    
    // Create 2-5 random health logs during this cycle
    const logsCount = Math.floor(Math.random() * 4) + 2; // 2-5 logs
    
    for (let i = 0; i < logsCount; i++) {
      const randomDay = new Date(periodStart);
      randomDay.setDate(periodStart.getDate() + Math.floor(Math.random() * cycleDays));
      
      // Small weight fluctuations
      const weightVariation = (Math.random() * 2 - 1) * 1.5; // -1.5 to +1.5 kg
      const weight = (baseWeight + weightVariation).toFixed(1);
      
      logs.push({
        id: `health-${randomDay.toISOString().split('T')[0]}-${Math.floor(Math.random() * 1000)}`,
        date: randomDay.toISOString().split('T')[0],
        weight: parseFloat(weight),
        height: height,
        bmi: (weight / ((height / 100) * (height / 100))).toFixed(1),
        sleepHours: Math.floor(Math.random() * 4) + 5, // 5-8 hours
        waterIntake: Math.floor(Math.random() * 8) + 2, // 2-10 cups
        exercise: getRandomExercise(),
        stress: getRandomStress(),
        notes: getRandomHealthNote()
      });
    }
  });
  
  return logs.sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date (most recent first)
};

// Helper functions to get random values
const getRandomFlow = () => {
  const flows = ['light', 'medium', 'heavy', 'very heavy'];
  const weights = [0.3, 0.4, 0.2, 0.1]; // More likely to be medium
  return weightedRandom(flows, weights);
};

const getRandomIntensity = () => {
  const intensities = ['mild', 'moderate', 'severe'];
  return intensities[Math.floor(Math.random() * intensities.length)];
};

const getRandomEnergy = () => {
  const levels = ['very low', 'low', 'moderate', 'high', 'very high'];
  return levels[Math.floor(Math.random() * levels.length)];
};

const getRandomExercise = () => {
  const exercises = ['none', 'light', 'moderate', 'intense'];
  return exercises[Math.floor(Math.random() * exercises.length)];
};

const getRandomStress = () => {
  const levels = ['low', 'moderate', 'high'];
  return levels[Math.floor(Math.random() * levels.length)];
};

// Weighted random selection for realistic distributions
const weightedRandom = (items, weights) => {
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < items.length; i++) {
    if (random < weights[i]) {
      return items[i];
    }
    random -= weights[i];
  }
  
  return items[0]; // Fallback
};

// Mood helpers based on cycle phase
const getPeriodMood = (moods) => {
  const periodMoods = ['tired', 'irritable', 'sad', 'emotional'];
  const normalMoods = ['happy', 'calm'];
  return Math.random() < 0.7 ? 
    periodMoods[Math.floor(Math.random() * periodMoods.length)] : 
    normalMoods[Math.floor(Math.random() * normalMoods.length)];
};

const getPmsMood = (moods) => {
  const pmsMoods = ['irritable', 'anxious', 'emotional', 'stressed'];
  const normalMoods = ['happy', 'calm', 'tired'];
  return Math.random() < 0.75 ? 
    pmsMoods[Math.floor(Math.random() * pmsMoods.length)] : 
    normalMoods[Math.floor(Math.random() * normalMoods.length)];
};

const getOvulationMood = (moods) => {
  const ovulationMoods = ['happy', 'calm', 'energetic'];
  const normalMoods = ['tired', 'anxious', 'stressed'];
  return Math.random() < 0.7 ? 
    ovulationMoods[Math.floor(Math.random() * ovulationMoods.length)] : 
    normalMoods[Math.floor(Math.random() * normalMoods.length)];
};

const getRandomMood = (moods) => {
  return moods[Math.floor(Math.random() * moods.length)];
};

// Random notes generators
const periodNotes = [
  "Flow seems heavier than last month",
  "Lighter than usual, maybe due to exercise",
  "Started later in the day",
  "Woke up with cramps before flow started",
  "Very light spotting at first",
  "Using my new menstrual cup today",
  "More clots than usual",
  "Pain better after taking ibuprofen",
  "Breakthrough bleeding mid-cycle",
  "Delayed by stress?"
];

const symptomNotes = [
  "Cramps worse on right side",
  "Headache started in the afternoon",
  "Bloating feels worse after eating dairy",
  "Tender breasts when sleeping on stomach",
  "Acne around jawline",
  "Lower back pain relieved by heating pad",
  "Slight nausea with breakfast",
  "Fatigue despite good sleep",
  "Noticed mood swings throughout the day",
  "Feeling dizzy when standing up quickly"
];

const moodNotes = {
  happy: [
    "Feeling great today!",
    "Had a productive day",
    "Good energy all day",
    "Social plans made me feel better",
    "Exercise boosted my mood"
  ],
  calm: [
    "Feeling balanced today",
    "Meditation helped",
    "Had a peaceful day",
    "Nothing major to report",
    "Slept well last night"
  ],
  tired: [
    "Low energy today",
    "Felt exhausted despite sleeping",
    "Needed an afternoon nap",
    "Struggled to focus",
    "Coffee didn't help much"
  ],
  anxious: [
    "Nervous about upcoming events",
    "Feeling on edge",
    "Racing thoughts before bed",
    "Work stress affecting me",
    "Breathing exercises helped a bit"
  ],
  irritable: [
    "Small things bothering me more than usual",
    "Quick to anger today",
    "Everything feels frustrating",
    "Easily annoyed by noise",
    "Snappy with others"
  ],
  sad: [
    "Feeling down today",
    "Cried without clear reason",
    "Low motivation",
    "Missing social connections",
    "Needed alone time"
  ],
  stressed: [
    "Overwhelmed with work/life",
    "Tension headache from stress",
    "Too many deadlines",
    "Couldn't relax today",
    "Stress affecting sleep"
  ],
  emotional: [
    "Mood swings throughout the day",
    "Tears came easily",
    "Feeling sensitive to comments",
    "Emotions feel intense",
    "Difficulty regulating feelings"
  ]
};

const healthNotes = [
  "Increased water intake today",
  "Tried a new workout routine",
  "Sleep disrupted by noise",
  "Feeling more energetic after diet changes",
  "Reduced caffeine intake",
  "Started taking new supplements",
  "Did yoga before bed",
  "Eating more vegetables this week",
  "Stress affected appetite",
  "Tracking macros more carefully"
];

const getRandomPeriodNote = () => Math.random() < 0.7 ? periodNotes[Math.floor(Math.random() * periodNotes.length)] : "";
const getRandomSymptomNote = () => Math.random() < 0.6 ? symptomNotes[Math.floor(Math.random() * symptomNotes.length)] : "";
const getRandomMoodNote = (mood) => {
  if (!mood || Math.random() > 0.7) return "";
  const notes = moodNotes[mood] || moodNotes.calm;
  return notes[Math.floor(Math.random() * notes.length)];
};
const getRandomHealthNote = () => Math.random() < 0.5 ? healthNotes[Math.floor(Math.random() * healthNotes.length)] : "";

// Generate test users
export const testUsers = {
  // User 1: Regular cycles (28 days, low variability)
  user1: {
    userProfile: {
      displayName: "Emma Thompson",
      email: "emma.thompson@example.com",
      age: 27,
      height: 165,
      weight: 62,
      lastPeriod: daysAgo(15), // 15 days ago
      cycleLength: 28,
      periodLength: 5,
      usingHormonal: false,
      lastUpdated: new Date().toISOString()
    },
    periodData: {
      logs: generatePeriodLogs(daysAgo(375), 14, 28, 1, 5), // 14 cycles with 28±1 day length
      lastUpdated: new Date().toISOString()
    },
    get symptomsData() {
      return {
        logs: generateSymptomLogs(this.periodData.logs, this.userProfile.cycleLength),
        lastUpdated: new Date().toISOString()
      };
    },
    get notesData() {
      return {
        moodLogs: generateMoodLogs(this.periodData.logs, this.userProfile.cycleLength),
        healthLogs: generateHealthLogs(this.periodData.logs, this.userProfile),
        lastUpdated: new Date().toISOString()
      };
    }
  },
  
  // User 2: Irregular cycles (highly variable)
  user2: {
    userProfile: {
      displayName: "Sophia Rodriguez",
      email: "sophia.rodriguez@example.com",
      age: 31,
      height: 170,
      weight: 68,
      lastPeriod: daysAgo(22), // 22 days ago
      cycleLength: 32,
      periodLength: 6,
      usingHormonal: false,
      lastUpdated: new Date().toISOString()
    },
    periodData: {
      logs: generatePeriodLogs(daysAgo(400), 12, 32, 7, 6), // 12 cycles with 32±7 day length (very irregular)
      lastUpdated: new Date().toISOString()
    },
    get symptomsData() {
      return {
        logs: generateSymptomLogs(this.periodData.logs, this.userProfile.cycleLength),
        lastUpdated: new Date().toISOString()
      };
    },
    get notesData() {
      return {
        moodLogs: generateMoodLogs(this.periodData.logs, this.userProfile.cycleLength),
        healthLogs: generateHealthLogs(this.periodData.logs, this.userProfile),
        lastUpdated: new Date().toISOString()
      };
    }
  },
  
  // User 3: Short cycles
  user3: {
    userProfile: {
      displayName: "Olivia Chen",
      email: "olivia.chen@example.com",
      age: 24,
      height: 160,
      weight: 54,
      lastPeriod: daysAgo(19), // 19 days ago
      cycleLength: 24,
      periodLength: 4,
      usingHormonal: true, // On birth control
      lastUpdated: new Date().toISOString()
    },
    periodData: {
      logs: generatePeriodLogs(daysAgo(340), 15, 24, 2, 4), // 15 cycles with 24±2 day length (short cycles)
      lastUpdated: new Date().toISOString()
    },
    get symptomsData() {
      return {
        logs: generateSymptomLogs(this.periodData.logs, this.userProfile.cycleLength),
        lastUpdated: new Date().toISOString()
      };
    },
    get notesData() {
      return {
        moodLogs: generateMoodLogs(this.periodData.logs, this.userProfile.cycleLength),
        healthLogs: generateHealthLogs(this.periodData.logs, this.userProfile),
        lastUpdated: new Date().toISOString()
      };
    }
  },
  
  // User 4: Long cycles
  user4: {
    userProfile: {
      displayName: "Amara Jackson",
      email: "amara.jackson@example.com",
      age: 29,
      height: 175,
      weight: 72,
      lastPeriod: daysAgo(35), // 35 days ago
      cycleLength: 36,
      periodLength: 7,
      usingHormonal: false,
      lastUpdated: new Date().toISOString()
    },
    periodData: {
      logs: generatePeriodLogs(daysAgo(450), 11, 36, 4, 7), // 11 cycles with 36±4 day length (long cycles)
      lastUpdated: new Date().toISOString()
    },
    get symptomsData() {
      return {
        logs: generateSymptomLogs(this.periodData.logs, this.userProfile.cycleLength),
        lastUpdated: new Date().toISOString()
      };
    },
    get notesData() {
      return {
        moodLogs: generateMoodLogs(this.periodData.logs, this.userProfile.cycleLength),
        healthLogs: generateHealthLogs(this.periodData.logs, this.userProfile),
        lastUpdated: new Date().toISOString()
      };
    }
  },
  
  // User 5: Sparse data (missing some months)
  user5: {
    userProfile: {
      displayName: "Maya Patel",
      email: "maya.patel@example.com",
      age: 22,
      height: 162,
      weight: 58,
      lastPeriod: daysAgo(10), // 10 days ago
      cycleLength: 29,
      periodLength: 5,
      usingHormonal: false,
      lastUpdated: new Date().toISOString()
    },
    periodData: {
      // Create logs with gaps (some missing months)
      get logs() {
        const baseLogs = generatePeriodLogs(daysAgo(390), 13, 29, 3, 5);
        // Remove approximately 30% of the logs randomly to create gaps
        return baseLogs.filter(() => Math.random() > 0.3);
      },
      lastUpdated: new Date().toISOString()
    },
    get symptomsData() {
      return {
        logs: generateSymptomLogs(this.periodData.logs, this.userProfile.cycleLength),
        lastUpdated: new Date().toISOString()
      };
    },
    get notesData() {
      return {
        moodLogs: generateMoodLogs(this.periodData.logs, this.userProfile.cycleLength),
        healthLogs: generateHealthLogs(this.periodData.logs, this.userProfile),
        lastUpdated: new Date().toISOString()
      };
    }
  }
};

// Function to get test data for a specific user
export const getTestUserData = (userId) => {
  return testUsers[userId] || testUsers.user1;
};

// Function to get list of available test users
export const getTestUsersList = () => {
  return Object.keys(testUsers).map(key => ({
    id: key,
    name: testUsers[key].userProfile.displayName,
    email: testUsers[key].userProfile.email,
    description: getUserDescription(key)
  }));
};

// Helper to get user descriptions
const getUserDescription = (userId) => {
  switch(userId) {
    case 'user1': return "Regular 28-day cycles";
    case 'user2': return "Irregular cycles (variable length)";
    case 'user3': return "Short cycles (24 days average)";
    case 'user4': return "Long cycles (36 days average)";
    case 'user5': return "Incomplete tracking history";
    default: return "Test user";
  }
};
