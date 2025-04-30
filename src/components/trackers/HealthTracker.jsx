import React, { useState, useEffect } from 'react';
import { calculateBMI, getBmiCategory } from '../../utils/cycleCalculations';

export default function HealthTracker({ selectedDate, healthLogs, userProfile, onSubmit, onDelete }) {
    const [date, setDate] = useState('');
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [sleepHours, setSleepHours] = useState('7');
    const [waterIntake, setWaterIntake] = useState('');
    const [exercise, setExercise] = useState('none');
    const [stress, setStress] = useState('low');
    const [notes, setNotes] = useState('');
    const [existingLog, setExistingLog] = useState(null);
    const [bmi, setBmi] = useState(null);

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

    // Set form fields based on selected date and user profile
    useEffect(() => {
        // Set height from profile if available
        if (userProfile && userProfile.height && !height) {
            setHeight(userProfile.height);
        }

        if (selectedDate) {
            setDate(formatDateForInput(selectedDate));

            // Check if there's an existing log for this date
            const existingHealthLog = healthLogs?.find(log =>
                new Date(log.date).toDateString() === new Date(selectedDate).toDateString()
            );

            if (existingHealthLog) {
                setExistingLog(existingHealthLog);
                setWeight(existingHealthLog.weight || '');
                setHeight(existingHealthLog.height || (userProfile ? userProfile.height : ''));
                setSleepHours(existingHealthLog.sleepHours || '7');
                setWaterIntake(existingHealthLog.waterIntake || '');
                setExercise(existingHealthLog.exercise || 'none');
                setStress(existingHealthLog.stress || 'low');
                setNotes(existingHealthLog.notes || '');
            } else {
                resetForm();
            }
        }
    }, [selectedDate, healthLogs, userProfile, height]);

    // Calculate BMI when weight or height changes
    useEffect(() => {
        if (weight && height) {
            const calculatedBmi = calculateBMI(parseFloat(height), parseFloat(weight));
            setBmi(calculatedBmi);
        } else {
            setBmi(null);
        }
    }, [weight, height]);

    // Reset form to default values
    const resetForm = () => {
        setExistingLog(null);
        setWeight('');
        // Don't reset height as it's usually constant
        setSleepHours('7');
        setWaterIntake('');
        setExercise('none');
        setStress('low');
        setNotes('');
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        const healthData = {
            date,
            weight: weight ? parseFloat(weight) : null,
            height: height ? parseFloat(height) : null,
            bmi: bmi ? parseFloat(bmi) : null,
            sleepHours: sleepHours ? parseFloat(sleepHours) : null,
            waterIntake: waterIntake ? parseFloat(waterIntake) : null,
            exercise,
            stress,
            notes
        };

        onSubmit(healthData);
    };

    // Handle log deletion
    const handleDelete = () => {
        if (existingLog) {
            onDelete('health', existingLog.id);
            resetForm();
        }
    };

    return (
        <div className="health-tracker">
            <h2>Health Tracker</h2>
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
                    <label htmlFor="health-date">Date</label>
                    <input
                        id="health-date"
                        type="date"
                        className="form-control"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="weight">Weight (kg)</label>
                        <input
                            id="weight"
                            type="number"
                            step="0.1"
                            min="30"
                            max="200"
                            className="form-control"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            placeholder="Enter weight"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="height">Height (cm)</label>
                        <input
                            id="height"
                            type="number"
                            step="0.1"
                            min="120"
                            max="220"
                            className="form-control"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            placeholder="Enter height"
                        />
                    </div>
                </div>

                {bmi && (
                    <div className="bmi-display">
                        <p>BMI: <strong>{bmi}</strong> - {getBmiCategory(bmi)}</p>
                    </div>
                )}

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="sleep">Sleep (hours)</label>
                        <input
                            id="sleep"
                            type="number"
                            step="0.5"
                            min="0"
                            max="24"
                            className="form-control"
                            value={sleepHours}
                            onChange={(e) => setSleepHours(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="water">Water Intake (cups)</label>
                        <input
                            id="water"
                            type="number"
                            step="1"
                            min="0"
                            max="20"
                            className="form-control"
                            value={waterIntake}
                            onChange={(e) => setWaterIntake(e.target.value)}
                            placeholder="Number of cups"
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="exercise">Exercise</label>
                        <select
                            id="exercise"
                            className="form-control"
                            value={exercise}
                            onChange={(e) => setExercise(e.target.value)}
                        >
                            <option value="none">None</option>
                            <option value="light">Light (&lt; 30 min)</option>
                            <option value="moderate">Moderate (30-60 min)</option>
                            <option value="intense">Intense (&gt; 60 min)</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="stress">Stress Level</label>
                        <select
                            id="stress"
                            className="form-control"
                            value={stress}
                            onChange={(e) => setStress(e.target.value)}
                        >
                            <option value="low">Low</option>
                            <option value="moderate">Moderate</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="health-notes">Notes (Optional)</label>
                    <textarea
                        id="health-notes"
                        className="form-control"
                        rows="3"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any additional health notes for the day..."
                    ></textarea>
                </div>

                <div className="form-actions">
                    <button type="submit" className="submit-button">
                        {existingLog ? 'Update Health Log' : 'Save Health Log'}
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
