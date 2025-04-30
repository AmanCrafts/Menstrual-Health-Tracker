import React, { useState, useEffect } from 'react';

export default function MoodTracker({ selectedDate, moodLogs, onSubmit, onDelete }) {
    const [date, setDate] = useState('');
    const [mood, setMood] = useState('');
    const [energy, setEnergy] = useState('moderate');
    const [notes, setNotes] = useState('');
    const [existingLog, setExistingLog] = useState(null);

    // Available moods with icons
    const moods = [
        { value: 'happy', icon: 'smile-beam', label: 'Happy' },
        { value: 'calm', icon: 'smile', label: 'Calm' },
        { value: 'tired', icon: 'tired', label: 'Tired' },
        { value: 'anxious', icon: 'flushed', label: 'Anxious' },
        { value: 'irritable', icon: 'angry', label: 'Irritable' },
        { value: 'sad', icon: 'sad-tear', label: 'Sad' },
        { value: 'stressed', icon: 'grimace', label: 'Stressed' },
        { value: 'emotional', icon: 'sad-cry', label: 'Emotional' },
    ];

    // Format date for input field (YYYY-MM-DD)
    const formatDateForInput = (date) => {
        if (!date) return '';
        const d = new Date(date);
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        const year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('-');
    };

    // Set form fields based on selected date
    useEffect(() => {
        if (selectedDate) {
            setDate(formatDateForInput(selectedDate));

            // Check if there's an existing log for this date
            const existingMoodLog = moodLogs?.find(log =>
                new Date(log.date).toDateString() === new Date(selectedDate).toDateString()
            );

            if (existingMoodLog) {
                setExistingLog(existingMoodLog);
                setMood(existingMoodLog.mood || '');
                setEnergy(existingMoodLog.energy || 'moderate');
                setNotes(existingMoodLog.notes || '');
            } else {
                resetForm();
            }
        }
    }, [selectedDate, moodLogs]);

    // Reset form to default values
    const resetForm = () => {
        setExistingLog(null);
        setMood('');
        setEnergy('moderate');
        setNotes('');
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        const moodData = {
            date,
            mood,
            energy,
            notes
        };

        onSubmit(moodData);
    };

    // Handle log deletion
    const handleDelete = () => {
        if (existingLog) {
            onDelete('mood', existingLog.id);
            resetForm();
        }
    };

    return (
        <div className="mood-tracker">
            <h2>Mood Tracker</h2>
            <p className="selected-date-display">
                Selected Date: {selectedDate ? selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }) : ''}
            </p>

            <form onSubmit={handleSubmit} className="tracker-form">
                <div className="form-group">
                    <label htmlFor="mood-date">Date</label>
                    <input
                        id="mood-date"
                        type="date"
                        className="form-control"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>How are you feeling today?</label>
                    <div className="mood-buttons">
                        {moods.map((moodOption) => (
                            <button
                                key={moodOption.value}
                                type="button"
                                className={`mood-button ${mood === moodOption.value ? 'selected' : ''}`}
                                onClick={() => setMood(moodOption.value)}
                            >
                                <i className={`fas fa-${moodOption.icon}`}></i>
                                <span>{moodOption.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="energy">Energy Level</label>
                    <select
                        id="energy"
                        className="form-control"
                        value={energy}
                        onChange={(e) => setEnergy(e.target.value)}
                    >
                        <option value="very low">Very Low</option>
                        <option value="low">Low</option>
                        <option value="moderate">Moderate</option>
                        <option value="high">High</option>
                        <option value="very high">Very High</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="mood-notes">Notes (Optional)</label>
                    <textarea
                        id="mood-notes"
                        className="form-control"
                        rows="3"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any additional notes about your mood today..."
                    ></textarea>
                </div>

                <div className="form-actions">
                    <button type="submit" className="submit-button" disabled={!mood}>
                        {existingLog ? 'Update Mood' : 'Log Mood'}
                    </button>

                    {existingLog && (
                        <button
                            type="button"
                            className="delete-button"
                            onClick={handleDelete}
                        >
                            Delete
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
