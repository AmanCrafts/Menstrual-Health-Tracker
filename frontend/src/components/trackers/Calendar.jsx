import { useState, useEffect } from 'react';
import {
    calculateFertileWindow,
    calculateOvulation,
    calculateFuturePeriods,
} from '../../utils/cycleCalculations';

export default function Calendar({
    selectedDate,
    onDateSelect,
    cycleLogs,
    symptomLogs,
    moodLogs,
    userProfile,
}) {
    const [calendarDays, setCalendarDays] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Regenerate calendar when month, data, or selectedDate changes
    useEffect(() => {
        generateCalendarDays(currentMonth);
    }, [currentMonth, cycleLogs, symptomLogs, moodLogs, userProfile, selectedDate]);

    // Generate days for the current month view
    const generateCalendarDays = (monthDate) => {
        const year = monthDate.getFullYear();
        const month = monthDate.getMonth();

        // Get first day of month and number of days
        const firstDayOfMonth = new Date(year, month, 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Calculate days from previous month to show
        const firstDayWeekday = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.

        // Calculate days from next month to show
        const totalCells = 42; // 6 rows of 7 days
        const daysFromPrevMonth = firstDayWeekday;
        const daysFromNextMonth = totalCells - daysInMonth - daysFromPrevMonth;

        // Create array of date objects for the calendar
        const days = [];

        // Previous month days
        const prevMonthDays = new Date(year, month, 0).getDate();
        for (let i = prevMonthDays - daysFromPrevMonth + 1; i <= prevMonthDays; i++) {
            const date = new Date(year, month - 1, i);
            date.setHours(0, 0, 0, 0);
            days.push({
                date,
                isCurrentMonth: false,
                isSelected: selectedDate && date.toDateString() === selectedDate.toDateString(),
                isPeriod: false,
                isFertileWindow: false,
                isOvulation: false,
                isPms: false,
                isPredictor: false,
                isLogged: false,
                hasEntries: false,
            });
        }

        // Current month days
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            date.setHours(0, 0, 0, 0);
            days.push({
                date,
                isCurrentMonth: true,
                isSelected: selectedDate && date.toDateString() === selectedDate.toDateString(),
                isToday: date.toDateString() === today.toDateString(),
                isPeriod: false,
                isFertileWindow: false,
                isOvulation: false,
                isPms: false,
                isPredictor: false,
                isLogged: false,
                hasEntries: false,
            });
        }

        // Next month days
        for (let i = 1; i <= daysFromNextMonth; i++) {
            const date = new Date(year, month + 1, i);
            date.setHours(0, 0, 0, 0);
            days.push({
                date,
                isCurrentMonth: false,
                isSelected: selectedDate && date.toDateString() === selectedDate.toDateString(),
                isPeriod: false,
                isFertileWindow: false,
                isOvulation: false,
                isPms: false,
                isPredictor: false,
                isLogged: false,
                hasEntries: false,
            });
        }

        // Mark logged period days
        if (cycleLogs && cycleLogs.length > 0) {
            cycleLogs.forEach((log) => {
                const startDate = new Date(log.startDate);
                startDate.setHours(0, 0, 0, 0);
                let endDate;

                if (log.endDate) {
                    endDate = new Date(log.endDate);
                } else {
                    endDate = new Date(startDate);
                    endDate.setDate(startDate.getDate() + (userProfile?.periodLength || 5) - 1);
                }
                endDate.setHours(0, 0, 0, 0);

                days.forEach((day) => {
                    const dayDate = new Date(day.date);
                    dayDate.setHours(0, 0, 0, 0);
                    if (dayDate >= startDate && dayDate <= endDate) {
                        day.isPeriod = true;
                        day.isLogged = true; // Mark as logged (not predicted)
                    }
                });
            });
        }

        // Get reference date for predictions (from cycleLogs or userProfile)
        let lastPeriodDate = null;
        if (cycleLogs && cycleLogs.length > 0) {
            // Sort to get most recent period
            const sortedLogs = [...cycleLogs].sort(
                (a, b) => new Date(b.startDate) - new Date(a.startDate)
            );
            lastPeriodDate = new Date(sortedLogs[0].startDate);
        } else if (userProfile?.lastPeriod) {
            lastPeriodDate = new Date(userProfile.lastPeriod);
        }

        // Mark predicted cycles and other phases
        if (lastPeriodDate) {
            lastPeriodDate.setHours(0, 0, 0, 0);
            const cycleLength = userProfile?.cycleLength || 28;
            const periodLength = userProfile?.periodLength || 5;

            // Calculate future periods (next 3)
            const futurePeriods = calculateFuturePeriods(lastPeriodDate, cycleLength, cycleLogs, 3);

            // For each predicted period, mark the days
            futurePeriods.forEach((prediction) => {
                // Handle both old format (Date) and new format (object with predictedDate)
                const periodStartDate = prediction.predictedDate || prediction;

                // Skip if invalid
                if (!periodStartDate) return;

                const periodStart = new Date(periodStartDate);
                periodStart.setHours(0, 0, 0, 0);

                // Mark predicted period days
                for (let i = 0; i < periodLength; i++) {
                    const periodDay = new Date(periodStart);
                    periodDay.setDate(periodStart.getDate() + i);
                    periodDay.setHours(0, 0, 0, 0);

                    days.forEach((day) => {
                        const dayDate = new Date(day.date);
                        dayDate.setHours(0, 0, 0, 0);
                        if (dayDate.toDateString() === periodDay.toDateString() && !day.isLogged) {
                            day.isPeriod = true;
                            day.isPredictor = true;
                        }
                    });
                }

                // Calculate fertile window for this period
                const fertileWindow = calculateFertileWindow(periodStart, cycleLength);

                // Mark fertile window days
                if (fertileWindow && fertileWindow.start && fertileWindow.end) {
                    const fertileStart = new Date(fertileWindow.start);
                    fertileStart.setHours(0, 0, 0, 0);
                    const fertileEnd = new Date(fertileWindow.end);
                    fertileEnd.setHours(0, 0, 0, 0);

                    days.forEach((day) => {
                        const dayDate = new Date(day.date);
                        dayDate.setHours(0, 0, 0, 0);
                        if (dayDate >= fertileStart && dayDate <= fertileEnd && !day.isPeriod) {
                            day.isFertileWindow = true;
                        }
                    });
                }

                // Calculate ovulation day
                const ovulationResult = calculateOvulation(periodStart, cycleLength);
                const ovulationDate = ovulationResult?.date || null;

                // Mark ovulation day
                if (ovulationDate) {
                    const ovDate = new Date(ovulationDate);
                    ovDate.setHours(0, 0, 0, 0);

                    days.forEach((day) => {
                        const dayDate = new Date(day.date);
                        dayDate.setHours(0, 0, 0, 0);
                        if (dayDate.toDateString() === ovDate.toDateString()) {
                            day.isOvulation = true;
                            day.isFertileWindow = false; // Ovulation takes priority
                        }
                    });
                }

                // Calculate PMS days (7 days before period)
                const pmsStart = new Date(periodStart);
                pmsStart.setDate(periodStart.getDate() - 7);
                pmsStart.setHours(0, 0, 0, 0);

                const pmsEnd = new Date(periodStart);
                pmsEnd.setDate(periodStart.getDate() - 1);
                pmsEnd.setHours(0, 0, 0, 0);

                // Mark PMS days (only if not marked as something else)
                days.forEach((day) => {
                    const dayDate = new Date(day.date);
                    dayDate.setHours(0, 0, 0, 0);
                    if (
                        dayDate >= pmsStart &&
                        dayDate <= pmsEnd &&
                        !day.isPeriod &&
                        !day.isFertileWindow &&
                        !day.isOvulation
                    ) {
                        day.isPms = true;
                    }
                });
            });

            // Also mark current cycle's phases (from most recent period)
            const nextPeriodDate = new Date(lastPeriodDate);
            nextPeriodDate.setDate(lastPeriodDate.getDate() + cycleLength);
            nextPeriodDate.setHours(0, 0, 0, 0);

            // Current cycle fertile window
            const currentFertile = calculateFertileWindow(nextPeriodDate, cycleLength);
            if (currentFertile && currentFertile.start && currentFertile.end) {
                const fertileStart = new Date(currentFertile.start);
                fertileStart.setHours(0, 0, 0, 0);
                const fertileEnd = new Date(currentFertile.end);
                fertileEnd.setHours(0, 0, 0, 0);

                days.forEach((day) => {
                    const dayDate = new Date(day.date);
                    dayDate.setHours(0, 0, 0, 0);
                    if (dayDate >= fertileStart && dayDate <= fertileEnd && !day.isPeriod) {
                        day.isFertileWindow = true;
                    }
                });
            }

            // Current cycle ovulation
            const currentOvulation = calculateOvulation(nextPeriodDate, cycleLength);
            if (currentOvulation?.date) {
                const ovDate = new Date(currentOvulation.date);
                ovDate.setHours(0, 0, 0, 0);

                days.forEach((day) => {
                    const dayDate = new Date(day.date);
                    dayDate.setHours(0, 0, 0, 0);
                    if (dayDate.toDateString() === ovDate.toDateString()) {
                        day.isOvulation = true;
                        day.isFertileWindow = false;
                    }
                });
            }

            // Current cycle PMS
            const currentPmsStart = new Date(nextPeriodDate);
            currentPmsStart.setDate(nextPeriodDate.getDate() - 7);
            currentPmsStart.setHours(0, 0, 0, 0);

            const currentPmsEnd = new Date(nextPeriodDate);
            currentPmsEnd.setDate(nextPeriodDate.getDate() - 1);
            currentPmsEnd.setHours(0, 0, 0, 0);

            days.forEach((day) => {
                const dayDate = new Date(day.date);
                dayDate.setHours(0, 0, 0, 0);
                if (
                    dayDate >= currentPmsStart &&
                    dayDate <= currentPmsEnd &&
                    !day.isPeriod &&
                    !day.isFertileWindow &&
                    !day.isOvulation
                ) {
                    day.isPms = true;
                }
            });
        }

        // Mark days with entries (symptoms, moods)
        if (symptomLogs && symptomLogs.length > 0) {
            symptomLogs.forEach((log) => {
                const logDate = new Date(log.date);
                days.forEach((day) => {
                    if (day.date.toDateString() === logDate.toDateString()) {
                        day.hasEntries = true;
                    }
                });
            });
        }

        if (moodLogs && moodLogs.length > 0) {
            moodLogs.forEach((log) => {
                const logDate = new Date(log.date);
                days.forEach((day) => {
                    if (day.date.toDateString() === logDate.toDateString()) {
                        day.hasEntries = true;
                    }
                });
            });
        }

        setCalendarDays(days);
    };

    // Handle month navigation
    const goToPreviousMonth = () => {
        setCurrentMonth((prevMonth) => {
            const newMonth = new Date(prevMonth);
            newMonth.setMonth(prevMonth.getMonth() - 1);
            return newMonth;
        });
    };

    const goToNextMonth = () => {
        setCurrentMonth((prevMonth) => {
            const newMonth = new Date(prevMonth);
            newMonth.setMonth(prevMonth.getMonth() + 1);
            return newMonth;
        });
    };

    // Format month name
    const formatMonth = (date) => {
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    return (
        <div className="tracker-calendar">
            <div className="calendar-header">
                <div className="calendar-month">{formatMonth(currentMonth)}</div>
                <div className="calendar-controls">
                    <button className="calendar-control-btn" onClick={goToPreviousMonth}>
                        <i className="fas fa-chevron-left"></i>
                    </button>
                    <button className="calendar-control-btn" onClick={goToNextMonth}>
                        <i className="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>

            <div className="calendar-weekdays">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
            </div>

            <div className="calendar-days">
                {calendarDays.map((day, index) => (
                    <div
                        key={index}
                        className={`calendar-day 
                            ${!day.isCurrentMonth ? 'other-month' : ''} 
                            ${day.isSelected ? 'selected' : ''} 
                            ${day.isPeriod ? 'period' : ''} 
                            ${day.isFertileWindow ? 'fertile' : ''} 
                            ${day.isOvulation ? 'ovulation' : ''}
                            ${day.isPms ? 'pms' : ''}
                            ${day.isToday ? 'today' : ''}
                            ${day.hasEntries ? 'has-entry' : ''}
                            ${day.isPredictor ? 'predicted' : ''}
                        `}
                        onClick={() => {
                            const clickedDate = new Date(day.date);
                            clickedDate.setHours(0, 0, 0, 0);
                            onDateSelect(clickedDate);
                        }}
                    >
                        {day.date.getDate()}
                        {day.hasEntries && <span className="entry-dot"></span>}
                    </div>
                ))}
            </div>

            <div className="calendar-legend">
                <div className="legend-item">
                    <div className="legend-color period"></div>
                    <span>Period</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color predicted"></div>
                    <span>Predicted</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color fertile"></div>
                    <span>Fertile</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color ovulation"></div>
                    <span>Ovulation</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color pms"></div>
                    <span>PMS</span>
                </div>
            </div>
        </div>
    );
}
