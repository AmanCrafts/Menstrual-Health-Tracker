import React from 'react';

export default function StatusCard({ title, value, unit, icon, colorized }) {
    // For BMI colors
    const getBmiColor = (bmi) => {
        if (bmi < 18.5) return '#3498db'; // Underweight - blue
        if (bmi < 25) return '#2ecc71'; // Normal - green
        if (bmi < 30) return '#f39c12'; // Overweight - orange
        return '#e74c3c'; // Obese - red
    };

    // For BMI category
    const getBmiCategory = (bmi) => {
        if (bmi < 18.5) return 'Underweight';
        if (bmi < 25) return 'Normal';
        if (bmi < 30) return 'Overweight';
        return 'Obese';
    };

    const valueColor = colorized && title === 'BMI' ? getBmiColor(parseFloat(value)) : '#6C63FF';

    return (
        <div className="status-card">
            <div className="status-card-icon">
                <i className={`fas fa-${icon}`}></i>
            </div>
            <div className="status-card-content">
                <h3>{title}</h3>
                <div className="status-card-value" style={{ color: valueColor }}>
                    {value}
                    {unit && <span className="status-card-unit">{unit}</span>}
                </div>
                {colorized && title === 'BMI' && (
                    <div className="status-card-subtitle">{getBmiCategory(parseFloat(value))}</div>
                )}
            </div>
        </div>
    );
}
