import React from 'react';

export default function CycleProgressBar({ progress, phase }) {
    // Determine color based on phase
    const getPhaseColor = (phase) => {
        switch (phase) {
            case 'Menstruation':
                return '#FF6B6B';
            case 'Follicular':
                return '#FFA07A';
            case 'Ovulation':
                return '#FFD700';
            case 'Luteal':
                return '#C3B091';
            case 'Pre-menstrual':
                return '#DDA0DD';
            default:
                return '#6C63FF';
        }
    };

    const phaseColor = getPhaseColor(phase);

    return (
        <div className="cycle-progress-container">
            <div className="cycle-progress-bar">
                <div
                    className="cycle-progress-fill"
                    style={{
                        width: `${progress}%`,
                        backgroundColor: phaseColor
                    }}
                ></div>
            </div>
            <div className="cycle-markers">
                <span>1</span>
                <span>7</span>
                <span>14</span>
                <span>21</span>
                <span>28</span>
            </div>
            <div className="phase-indicator" style={{ borderColor: phaseColor }}>
                {phase}
            </div>
        </div>
    );
}
