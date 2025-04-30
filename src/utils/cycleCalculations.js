/**
 * Calculate the next period start date based on last period and cycle length
 * Uses the most recent period from logs if available
 */
export function calculateNextPeriod(lastPeriodDate, cycleLength, cycleLogs = []) {
  // Convert lastPeriodDate to Date object if it's not already
  lastPeriodDate = new Date(lastPeriodDate);
  
  // If there are period logs, use the most recent one as the reference
  if (cycleLogs && cycleLogs.length > 0) {
    const sortedLogs = [...cycleLogs].sort((a, b) => 
      new Date(b.startDate) - new Date(a.startDate)
    );
    
    const mostRecentPeriod = new Date(sortedLogs[0].startDate);
    
    // If the most recent logged period is more recent than the profile's lastPeriod
    if (mostRecentPeriod > lastPeriodDate) {
      lastPeriodDate = mostRecentPeriod;
    }
  }
  
  const nextPeriod = new Date(lastPeriodDate);
  nextPeriod.setDate(nextPeriod.getDate() + cycleLength);
  
  // If the calculated next period is in the past, keep adding cycle lengths until it's in the future
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize time to compare only dates
  
  while (nextPeriod < today) {
    nextPeriod.setDate(nextPeriod.getDate() + cycleLength);
  }
  
  return nextPeriod;
}

/**
 * Calculate multiple future periods for calendar display
 */
export function calculateFuturePeriods(lastPeriodDate, cycleLength, cycleLogs = [], count = 3) {
  const periods = [];
  let currentPeriod = lastPeriodDate;
  
  // Use the most recent log as the starting point if available
  if (cycleLogs && cycleLogs.length > 0) {
    const sortedLogs = [...cycleLogs].sort((a, b) => 
      new Date(b.startDate) - new Date(a.startDate)
    );
    
    if (new Date(sortedLogs[0].startDate) > new Date(lastPeriodDate)) {
      currentPeriod = new Date(sortedLogs[0].startDate);
    } else {
      currentPeriod = new Date(lastPeriodDate);
    }
  } else {
    currentPeriod = new Date(lastPeriodDate);
  }
  
  // Get the next few periods
  for (let i = 0; i < count; i++) {
    const nextPeriod = new Date(currentPeriod);
    nextPeriod.setDate(nextPeriod.getDate() + cycleLength);
    periods.push(nextPeriod);
    currentPeriod = nextPeriod;
  }
  
  return periods;
}

/**
 * Calculate the fertile window based on next period and cycle length
 * Fertile window is typically 5 days before ovulation plus 1 day after
 */
export function calculateFertileWindow(nextPeriodDate, cycleLength) {
  const ovulationDate = calculateOvulation(nextPeriodDate, cycleLength);
  
  const fertileStart = new Date(ovulationDate);
  fertileStart.setDate(ovulationDate.getDate() - 5); // 5 days before ovulation
  
  const fertileEnd = new Date(ovulationDate);
  fertileEnd.setDate(ovulationDate.getDate() + 1); // 1 day after ovulation
  
  return {
    start: fertileStart,
    end: fertileEnd
  };
}

/**
 * Calculate the ovulation date based on next period and cycle length
 * Ovulation typically occurs 14 days before the next period starts
 */
export function calculateOvulation(nextPeriodDate, cycleLength) {
  const ovulationDate = new Date(nextPeriodDate);
  ovulationDate.setDate(nextPeriodDate.getDate() - 14); // 14 days before next period
  
  return ovulationDate;
}

/**
 * Calculate the current day in the cycle
 */
export function calculateCycleDay(lastPeriodDate, currentDate, cycleLength) {
  // Calculate days since last period
  const daysSinceLastPeriod = Math.floor(
    (currentDate - lastPeriodDate) / (1000 * 60 * 60 * 24)
  );
  
  // Calculate cycle day (wrapping around if we're past one cycle)
  return (daysSinceLastPeriod % cycleLength) + 1;
}

/**
 * Predict potential PMS days (typically 3-7 days before period)
 */
export function calculatePmsDays(nextPeriodDate) {
  const pmsStart = new Date(nextPeriodDate);
  pmsStart.setDate(nextPeriodDate.getDate() - 7);
  
  const pmsEnd = new Date(nextPeriodDate);
  pmsEnd.setDate(nextPeriodDate.getDate() - 1);
  
  return {
    start: pmsStart,
    end: pmsEnd
  };
}

/**
 * Calculate BMI based on height (in cm) and weight (in kg)
 */
export function calculateBMI(height, weight) {
  if (!height || !weight) return null;
  
  const heightInMeters = height / 100;
  return (weight / (heightInMeters * heightInMeters)).toFixed(1);
}

/**
 * Get BMI category
 */
export function getBmiCategory(bmi) {
  if (bmi < 18.5) return `Underweight`;
  if (bmi < 25) return `Normal weight`;
  if (bmi < 30) return `Overweight`;
  return `Obese`;
}

/**
 * Adjust cycle prediction based on factors like age, BMI, stress, activity level
 * Returns adjusted cycle length estimate
 */
export function adjustCyclePrediction(baseLength, age, bmi, stressLevel, activityLevel) {
  let adjustedLength = baseLength;
  
  // Age adjustments
  if (age < 18) {
    adjustedLength += 2; // Teenagers often have more irregular cycles
  } else if (age > 40) {
    adjustedLength -= 1; // Cycles often shorten as menopause approaches
  }
  
  // BMI adjustments
  if (bmi < 18.5) {
    adjustedLength += 2; // Underweight can lead to longer, irregular cycles
  } else if (bmi > 30) {
    adjustedLength += 1; // Obesity can affect cycle regularity
  }
  
  // Stress level adjustments
  if (stressLevel === `high`) {
    adjustedLength += 2; // High stress can delay periods
  }
  
  // Activity level adjustments
  if (activityLevel === `very high`) {
    adjustedLength += 1; // Intense exercise can affect cycles
  }
  
  return Math.max(21, Math.min(adjustedLength, 40)); // Keep within realistic range
}

/**
 * Get cycle phase information based on date
 */
export function getCyclePhaseInfo(date, lastPeriodDate, cycleLength, periodLength, cycleLogs = []) {
  date = new Date(date);
  
  // Normalize date objects for comparison
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);
  
  // Calculate next period based on logs or last period
  const nextPeriod = calculateNextPeriod(lastPeriodDate, cycleLength, cycleLogs);
  
  // Calculate ovulation
  const ovulationDate = calculateOvulation(nextPeriod, cycleLength);
  
  // Calculate fertile window
  const fertileWindow = calculateFertileWindow(nextPeriod, cycleLength);
  
  // Calculate PMS days
  const pmsDays = calculatePmsDays(nextPeriod);
  
  // Find previous period (the one before nextPeriod)
  let previousPeriod;
  if (cycleLogs && cycleLogs.length > 0) {
    // Find the most recent period before nextPeriod
    const filteredLogs = cycleLogs.filter(log => 
      new Date(log.startDate) < nextPeriod
    ).sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    
    if (filteredLogs.length > 0) {
      previousPeriod = new Date(filteredLogs[0].startDate);
    } else {
      // If no log found, calculate from nextPeriod
      previousPeriod = new Date(nextPeriod);
      previousPeriod.setDate(previousPeriod.getDate() - cycleLength);
    }
  } else {
    previousPeriod = new Date(lastPeriodDate);
  }
  
  // Check if date is during period
  const periodStart = new Date(previousPeriod);
  const periodEnd = new Date(previousPeriod);
  periodEnd.setDate(periodEnd.getDate() + (periodLength - 1));
  
  const isPeriod = normalizedDate >= periodStart && normalizedDate <= periodEnd;
  
  // Check if date is ovulation day
  const isOvulation = normalizedDate.toDateString() === ovulationDate.toDateString();
  
  // Check if date is in fertile window
  const isFertile = normalizedDate >= fertileWindow.start && normalizedDate <= fertileWindow.end;
  
  // Check if date is in PMS phase
  const isPMS = normalizedDate >= pmsDays.start && normalizedDate <= pmsDays.end;
  
  // Determine the phase
  let phase;
  let phaseInfo = {};
  
  if (isPeriod) {
    phase = `period`;
    phaseInfo = {
      name: `Menstruation`,
      description: `This is when the uterine lining sheds, resulting in menstrual bleeding. Common symptoms include cramps, fatigue, and mood changes.`,
      tips: [
        `Stay hydrated`,
        `Use a heating pad for cramps`,
        `Get plenty of rest`,
        `Take iron-rich foods to prevent anemia`,
        `Practice self-care activities`
      ],
      color: `#FF6B6B`
    };
  } else if (isOvulation) {
    phase = `ovulation`;
    phaseInfo = {
      name: `Ovulation Day`,
      description: `This is when your ovary releases an egg. You may experience increased energy, heightened senses, and slight pelvic pain (mittelschmerz).`,
      tips: [
        `Track cervical mucus changes (becomes clear and slippery)`,
        `Note any slight temperature rise`,
        `Be aware of heightened fertility`,
        `Some women experience increased libido`,
        `Good time for physical activity`
      ],
      color: `#FF84A1`
    };
  } else if (isFertile) {
    phase = `fertile`;
    phaseInfo = {
      name: `Fertile Window`,
      description: `This is your most fertile phase. Your body is preparing for potential conception with changes in cervical mucus and hormone levels.`,
      tips: [
        `Increased fertility - important if trying to conceive or avoid pregnancy`,
        `Track cervical mucus changes`,
        `May experience increased energy and libido`,
        `Good time for challenging physical activities`,
        `Stay aware of your body's changes`
      ],
      color: `#78D5D7`
    };
  } else if (isPMS) {
    phase = `pms`;
    phaseInfo = {
      name: `Premenstrual Phase`,
      description: `This phase occurs before your period begins. You may experience mood changes, bloating, fatigue, food cravings, and breast tenderness.`,
      tips: [
        `Reduce salt intake to minimize bloating`,
        `Increase calcium and magnesium intake`,
        `Practice stress-reducing activities`,
        `Gentle exercise can help reduce symptoms`,
        `Prioritize sleep and rest`
      ],
      color: `#FFB347`
    };
  } else {
    phase = `follicular`;
    phaseInfo = {
      name: `Follicular Phase`,
      description: `This phase begins after your period and lasts until ovulation. Hormone levels begin to rise, and your body prepares to release an egg.`,
      tips: [
        `Excellent time for new projects and activities`,
        `Energy levels typically higher`,
        `Good time for high-intensity workouts`,
        `Your immune system is stronger`,
        `Focus on goals and personal growth`
      ],
      color: `#A8D8EA`
    };
  }
  
  // Calculate current day of cycle
  const cycleDay = calculateCycleDay(previousPeriod, normalizedDate, cycleLength);
  
  return {
    phase,
    cycleDay,
    info: phaseInfo,
    nextPeriod,
    ovulationDate,
    fertileWindow,
    isPeriod,
    isOvulation,
    isFertile,
    isPMS
  };
}

/**
 * Get health insights based on user data
 */
export function generateHealthInsights(userProfile, periodData, symptomLogs) {
  const insights = [];
  
  // Check if we have enough data
  if (!periodData || !periodData.logs || periodData.logs.length < 2) {
    insights.push({
      type: `info`,
      title: `Not enough cycle data`,
      description: `Log at least 2 periods to see personalized insights.`,
      icon: `info-circle`
    });
    return insights;
  }
  
  // Calculate cycle regularity
  const sortedLogs = [...periodData.logs].sort((a, b) => 
    new Date(a.startDate) - new Date(b.startDate)
  );
  
  if (sortedLogs.length >= 3) {
    const cycleLengths = [];
    for (let i = 1; i < sortedLogs.length; i++) {
      const daysInCycle = Math.round(
        (new Date(sortedLogs[i].startDate) - new Date(sortedLogs[i-1].startDate)) / 
        (1000 * 60 * 60 * 24)
      );
      cycleLengths.push(daysInCycle);
    }
    
    const avgCycleLength = cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length;
    const maxDiff = Math.max(...cycleLengths.map(length => Math.abs(length - avgCycleLength)));
    
    if (maxDiff > 7) {
      insights.push({
        type: `warning`,
        title: `Irregular Cycles Detected`,
        description: `Your cycle length varies by more than 7 days, which may indicate hormonal fluctuations.`,
        icon: `exclamation-triangle`
      });
    } else if (maxDiff < 3) {
      insights.push({
        type: `positive`,
        title: `Regular Cycles`,
        description: `Your cycles have been very consistent, which is a good sign of hormonal balance.`,
        icon: `check-circle`
      });
    }
  }
  
  // Check period length consistency
  const periodLengths = sortedLogs
    .filter(log => log.endDate)
    .map(log => {
      const start = new Date(log.startDate);
      const end = new Date(log.endDate);
      return Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
    });
  
  if (periodLengths.length >= 2) {
    const avgPeriodLength = periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length;
    
    if (avgPeriodLength > 7) {
      insights.push({
        type: `warning`,
        title: `Extended Menstrual Flow`,
        description: `Your periods last more than 7 days on average, which might warrant a health check.`,
        icon: `clock`
      });
    }
  }
  
  // Analyze symptoms if we have symptom logs
  if (symptomLogs && symptomLogs.length > 0) {
    // Count most frequent symptoms
    const symptomCounts = {};
    symptomLogs.forEach(log => {
      if (!log.symptoms) return;
      
      Object.entries(log.symptoms).forEach(([symptom, present]) => {
        if (present) {
          symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
        }
      });
    });
    
    // Get top symptoms
    const topSymptoms = Object.entries(symptomCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([symptom, count]) => symptom);
    
    if (topSymptoms.includes(`headache`) && topSymptoms.includes(`fatigue`)) {
      insights.push({
        type: `tip`,
        title: `Frequent Headaches & Fatigue`,
        description: `Try tracking water intake and sleep patterns as these can impact both symptoms.`,
        icon: `lightbulb`
      });
    }
    
    if (topSymptoms.includes(`cramps`)) {
      insights.push({
        type: `tip`,
        title: `Menstrual Cramps Relief`,
        description: `Regular exercise, heating pads, and anti-inflammatory foods may help reduce cramping.`,
        icon: `heart`
      });
    }
  }
  
  return insights;
}
