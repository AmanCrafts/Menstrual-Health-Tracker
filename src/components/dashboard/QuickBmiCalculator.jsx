import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { calculateBMI } from '../../utils/cycleCalculations';

export default function QuickBmiCalculator() {
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [bmi, setBmi] = useState(null);
    const { updateUserProfile, userProfile } = useData();

    const handleCalculate = (e) => {
        e.preventDefault();

        if (!height || !weight) return;

        const calculatedBmi = calculateBMI(parseFloat(height), parseFloat(weight));
        setBmi(calculatedBmi);

        // Save to user profile
        if (userProfile) {
            updateUserProfile({
                ...userProfile,
                height: parseFloat(height),
                weight: parseFloat(weight)
            });
        }
    };

    return (
        <div className="status-card">
            <h3>BMI Calculator</h3>

            {bmi ? (
                <div className="bmi-result">
                    <p>Your BMI: <strong>{bmi}</strong></p>
                    <button
                        onClick={() => setBmi(null)}
                        className="small-button"
                    >
                        Recalculate
                    </button>
                </div>
            ) : (
                <form onSubmit={handleCalculate} className="bmi-calculator-form">
                    <div className="form-row">
                        <input
                            type="number"
                            placeholder="Height (cm)"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            min="120"
                            max="220"
                            required
                        />
                        <input
                            type="number"
                            placeholder="Weight (kg)"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            min="30"
                            max="200"
                            required
                        />
                    </div>
                    <button type="submit">Calculate</button>
                </form>
            )}
        </div>
    );
}
