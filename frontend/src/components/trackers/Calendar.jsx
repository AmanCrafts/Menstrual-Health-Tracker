import React, { useState, useEffect } from 'react';
import {
    calculateNextPeriod,
    calculateFertileWindow,
    calculateOvulation,
    calculateFuturePeriods
} from '../../utils/cycleCalculations';

export default function Calendar({ selectedDate, onDateSelect, cycleLogs, symptomLogs, moodLogs, userProfile }) {
    const [calendarDays, setCalendarDays] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    useEffect(() => {
        generateCalendarDays(currentMonth);
    }, [currentMonth, cycleLogs, symptomLogs, moodLogs, userProfile]);

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
            days.push({
                date: new Date(year, month - 1, i),
                isCurrentMonth: false,
                isSelected: false,
                isPeriod: false,
                isFertileWindow: false,
                isOvulation: false,
                isPms: false,
                isPredictor: false,
                hasEntries: false
            });
        }

        // Current month days
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
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
                hasEntries: false
            });
        }

        // Next month days
        for (let i = 1; i <= daysFromNextMonth; i++) {
            days.push({
                date: new Date(year, month + 1, i),
                isCurrentMonth: false,
                isSelected: false,
                isPeriod: false,
                isFertileWindow: false,
                isOvulation: false,
                isPms: false,
                isPredictor: false,
                hasEntries: false
            });
        }

        // Mark logged period days
        if (cycleLogs && cycleLogs.length > 0) {
            cycleLogs.forEach(log => {
                const startDate = new Date(log.startDate);
                let endDate;

                if (log.endDate) {
                    endDate = new Date(log.endDate);
                } else {
                    endDate = new Date(startDate);
                    endDate.setDate(startDate.getDate() + (userProfile?.periodLength || 5) - 1);
                }

                days.forEach(day => {
                    if (day.date >= startDate && day.date <= endDate) {
                        day.isPeriod = true;
                    }
                });
            });
        }

        // Mark predicted cycles
        if (userProfile && userProfile.lastPeriod) {
            const lastPeriodDate = new Date(userProfile.lastPeriod);
            const cycleLength = userProfile.cycleLength || 28;
            const periodLength = userProfile.periodLength || 5;

            // Calculate future periods (next 3)
            const futurePeriods = calculateFuturePeriods(lastPeriodDate, cycleLength, cycleLogs, 3);

            // For each predicted period, mark the days
            futurePeriods.forEach(periodStartDate => {
                // Skip if the period is before the calendar start
                if (periodStartDate < days[0].date) return;

                // Mark period days
                for (let i = 0; i < periodLength; i++) {
                    const periodDay = new Date(periodStartDate);
                    periodDay.setDate(periodStartDate.getDate() + i);

                    days.forEach(day => {
                        if (day.date.toDateString() === periodDay.toDateString()) {
                            day.isPeriod = true;
                            day.isPredictor = true;
                        }
                    });
                }

                // Calculate fertile window for this period
                const fertileWindow = calculateFertileWindow(periodStartDate, cycleLength);

                // Mark fertile window days
                days.forEach(day => {
                    if (day.date >= fertileWindow.start && day.date <= fertileWindow.end) {
                        day.isFertileWindow = true;
                    }
                });

                // Calculate ovulation day
                const ovulationDate = calculateOvulation(periodStartDate, cycleLength);

                // Mark ovulation day
                days.forEach(day => {
                    if (day.date.toDateString() === ovulationDate.toDateString()) {
                        day.isOvulation = true;
                    }
                });

                // Calculate PMS days (5-7 days before period)
                const pmsStart = new Date(periodStartDate);
                pmsStart.setDate(periodStartDate.getDate() - 7);

                const pmsEnd = new Date(periodStartDate);
                pmsEnd.setDate(periodStartDate.getDate() - 1);

                // Mark PMS days
                days.forEach(day => {
                    if (day.date >= pmsStart && day.date <= pmsEnd) {
                        day.isPms = true;
                    }
                });
            });
        }

        // Mark days with entries (symptoms, moods)
        if (symptomLogs && symptomLogs.length > 0) {
            symptomLogs.forEach(log => {
                const logDate = new Date(log.date);
                days.forEach(day => {
                    if (day.date.toDateString() === logDate.toDateString()) {
                        day.hasEntries = true;
                    }
                });
            });
        }

        if (moodLogs && moodLogs.length > 0) {
            moodLogs.forEach(log => {
                const logDate = new Date(log.date);
                days.forEach(day => {
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
        setCurrentMonth(prevMonth => {
            const newMonth = new Date(prevMonth);
            newMonth.setMonth(prevMonth.getMonth() - 1);
            return newMonth;
        });
    };

    const goToNextMonth = () => {
        setCurrentMonth(prevMonth => {
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
                    <button
                        className="calendar-control-btn"
                        onClick={goToPreviousMonth}
                    >
                        <i className="fas fa-chevron-left"></i>
                    </button>
                    <button
                        className="calendar-control-btn"
                        onClick={goToNextMonth}
                    >
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
                        onClick={() => onDateSelect(day.date)}
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
                    <div className="legend-color fertile"></div>
                    <span>Fertile Window</span>
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
