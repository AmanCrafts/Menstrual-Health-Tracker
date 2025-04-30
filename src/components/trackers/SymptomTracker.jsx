import React, { useState, useEffect } from 'react';

export default function SymptomTracker({ selectedDate, symptomLogs, onSubmit, onDelete }) {
    const [date, setDate] = useState('');
    const [symptoms, setSymptoms] = useState({
        headache: false,
        cramps: false,
        bloating: false,
        backPain: false,
        nausea: false,
        fatigue: false,
        breastTenderness: false,
        moodSwings: false,
        acne: false,
        dizziness: false,
        insomnia: false,
        appetite: false
    });
    const [intensity, setIntensity] = useState('moderate');
    const [notes, setNotes] = useState('');
    const [existingLog, setExistingLog] = useState(null);

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
            const existingSymptomLog = symptomLogs?.find(log =>
                new Date(log.date).toDateString() === new Date(selectedDate).toDateString()
            );

            if (existingSymptomLog) {
                setExistingLog(existingSymptomLog);
                setSymptoms(existingSymptomLog.symptoms || {});
                setIntensity(existingSymptomLog.intensity || 'moderate');
                setNotes(existingSymptomLog.notes || '');
            } else {
                resetForm();
            }
        }
    }, [selectedDate, symptomLogs]);

    // Reset form to default values
    const resetForm = () => {
        setExistingLog(null);
        setSymptoms({
            headache: false,
            cramps: false,
            bloating: false,
            backPain: false,
            nausea: false,
            fatigue: false,
            breastTenderness: false,
            moodSwings: false,
            acne: false,
            dizziness: false,
            insomnia: false,
            appetite: false
        });
        setIntensity('moderate');
        setNotes('');
    };

    // Handle symptom checkbox changes
    const handleSymptomChange = (symptom) => {
        setSymptoms({
            ...symptoms,
            [symptom]: !symptoms[symptom]
        });
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        const symptomData = {
            date,
            symptoms,
            intensity,
            notes
        };

        onSubmit(symptomData);
    };

    // Handle log deletion
    const handleDelete = () => {
        if (existingLog) {
            onDelete('symptom', existingLog.id);
            resetForm();
        }
    };

    return (
        <div className="symptom-tracker">
            <h2>Symptom Tracker</h2>
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
                    <label htmlFor="symptom-date">Date</label>
                    <input
                        id="symptom-date"
                        type="date"
                        className="form-control"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Symptoms</label>
                    <div className="symptom-checkboxes">
                        <div className="symptom-checkbox">
                            <input
                                type="checkbox"
                                id="headache"
                                checked={symptoms.headache}
                                onChange={() => handleSymptomChange('headache')}
                            />
                            <label htmlFor="headache">Headache</label>
                        </div>
                        <div className="symptom-checkbox">
                            <input
                                type="checkbox"
                                id="cramps"
                                checked={symptoms.cramps}
                                onChange={() => handleSymptomChange('cramps')}
                            />
                            <label htmlFor="cramps">Cramps</label>
                        </div>
                        <div className="symptom-checkbox">
                            <input
                                type="checkbox"
                                id="bloating"
                                checked={symptoms.bloating}
                                onChange={() => handleSymptomChange('bloating')}
                            />
                            <label htmlFor="bloating">Bloating</label>
                        </div>
                        <div className="symptom-checkbox">
                            <input
                                type="checkbox"
                                id="backPain"
                                checked={symptoms.backPain}
                                onChange={() => handleSymptomChange('backPain')}
                            />
                            <label htmlFor="backPain">Back Pain</label>
                        </div>
                        <div className="symptom-checkbox">
                            <input
                                type="checkbox"
                                id="nausea"
                                checked={symptoms.nausea}
                                onChange={() => handleSymptomChange('nausea')}
                            />
                            <label htmlFor="nausea">Nausea</label>
                        </div>
                        <div className="symptom-checkbox">
                            <input
                                type="checkbox"
                                id="fatigue"
                                checked={symptoms.fatigue}
                                onChange={() => handleSymptomChange('fatigue')}
                            />
                            <label htmlFor="fatigue">Fatigue</label>
                        </div>
                        <div className="symptom-checkbox">
                            <input
                                type="checkbox"
                                id="breastTenderness"
                                checked={symptoms.breastTenderness}
                                onChange={() => handleSymptomChange('breastTenderness')}
                            />
                            <label htmlFor="breastTenderness">Breast Tenderness</label>
                        </div>
                        <div className="symptom-checkbox">
                            <input
                                type="checkbox"
                                id="moodSwings"
                                checked={symptoms.moodSwings}
                                onChange={() => handleSymptomChange('moodSwings')}
                            />
                            <label htmlFor="moodSwings">Mood Swings</label>
                        </div>
                        <div className="symptom-checkbox">
                            <input
                                type="checkbox"
                                id="acne"
                                checked={symptoms.acne}
                                onChange={() => handleSymptomChange('acne')}
                            />
                            <label htmlFor="acne">Acne</label>
                        </div>
                        <div className="symptom-checkbox">
                            <input
                                type="checkbox"
                                id="dizziness"
                                checked={symptoms.dizziness}
                                onChange={() => handleSymptomChange('dizziness')}
                            />
                            <label htmlFor="dizziness">Dizziness</label>
                        </div>
                        <div className="symptom-checkbox">
                            <input
                                type="checkbox"
                                id="insomnia"
                                checked={symptoms.insomnia}
                                onChange={() => handleSymptomChange('insomnia')}
                            />
                            <label htmlFor="insomnia">Insomnia</label>
                        </div>
                        <div className="symptom-checkbox">
                            <input
                                type="checkbox"
                                id="appetite"
                                checked={symptoms.appetite}
                                onChange={() => handleSymptomChange('appetite')}
                            />
                            <label htmlFor="appetite">Changed Appetite</label>
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="intensity">Intensity</label>
                    <select
                        id="intensity"
                        className="form-control"
                        value={intensity}
                        onChange={(e) => setIntensity(e.target.value)}
                    >
                        <option value="mild">Mild</option>
                        <option value="moderate">Moderate</option>
                        <option value="severe">Severe</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="symptoms-notes">Notes (Optional)</label>
                    <textarea
                        id="symptoms-notes"
                        className="form-control"
                        rows="3"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any additional notes about your symptoms..."
                    ></textarea>
                </div>

                <div className="form-actions">
                    <button type="submit" className="submit-button">
                        {existingLog ? 'Update Symptoms' : 'Log Symptoms'}
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
