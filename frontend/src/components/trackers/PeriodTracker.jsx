import React, { useState, useEffect } from 'react';

export default function PeriodTracker({ selectedDate, cycleLogs, onSubmit, onDelete }) {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [flow, setFlow] = useState('medium');
    const [notes, setNotes] = useState('');
    const [existingLog, setExistingLog] = useState(null);

    // Format date for input field (YYYY-MM-DD)
    const formatDateForInput = (date) => {
        if (!date) return '';
        const d = new Date(date);
        let month = `${d.getMonth() + 1}`;
        let day = `${d.getDate()}`;
        const year = d.getFullYear();

        if (month.length < 2) month = `0${month}`;
        if (day.length < 2) day = `0${day}`;

        return [year, month, day].join('-');
    };

    // Set form fields based on selected date
    useEffect(() => {
        if (selectedDate) {
            setStartDate(formatDateForInput(selectedDate));

            // Check if there's an existing log for this date
            const existingPeriodLog = cycleLogs?.find(
                (log) =>
                    new Date(log.startDate).toDateString() === new Date(selectedDate).toDateString()
            );

            if (existingPeriodLog) {
                setExistingLog(existingPeriodLog);
                setEndDate(formatDateForInput(existingPeriodLog.endDate || ''));
                setFlow(existingPeriodLog.flow || 'medium');
                setNotes(existingPeriodLog.notes || '');
            } else {
                setExistingLog(null);
                setEndDate('');
                setFlow('medium');
                setNotes('');
            }
        }
    }, [selectedDate, cycleLogs]);

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        const periodData = {
            startDate,
            endDate: endDate || null,
            flow,
            notes,
        };

        onSubmit(periodData);
    };

    // Handle log deletion
    const handleDelete = () => {
        if (existingLog) {
            onDelete('period', existingLog._id || existingLog.id);
        }
    };

    return (
        <div className="period-tracker">
            <h2>Period Tracker</h2>
            <p className="selected-date-display">
                Selected Date:{' '}
                {selectedDate
                    ? selectedDate.toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                      })
                    : ''}
            </p>

            <form onSubmit={handleSubmit} className="tracker-form">
                <div className="form-group">
                    <label htmlFor="period-start">Start Date</label>
                    <input
                        id="period-start"
                        type="date"
                        className="form-control"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="period-end">End Date (Optional)</label>
                    <input
                        id="period-end"
                        type="date"
                        className="form-control"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="flow">Flow Intensity</label>
                    <select
                        id="flow"
                        className="form-control"
                        value={flow}
                        onChange={(e) => setFlow(e.target.value)}
                    >
                        <option value="light">Light</option>
                        <option value="medium">Medium</option>
                        <option value="heavy">Heavy</option>
                        <option value="very heavy">Very Heavy</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="notes">Notes (Optional)</label>
                    <textarea
                        id="notes"
                        className="form-control"
                        rows="3"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any additional notes about your period..."
                    ></textarea>
                </div>

                <div className="form-actions">
                    <button type="submit" className="submit-button">
                        {existingLog ? 'Update Period' : 'Log Period'}
                    </button>

                    {existingLog && (
                        <button type="button" className="delete-button" onClick={handleDelete}>
                            Delete
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
