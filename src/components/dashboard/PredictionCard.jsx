import React from 'react';

export default function PredictionCard({ title, date, dateRange, daysUntil, icon, accentColor = '#FF6B6B' }) {
    // Format date
    const formatDate = (date) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            weekday: 'short'
        });
    };

    // Format date range
    const formatDateRange = (range) => {
        if (!range || !range.start || !range.end) return '';

        const startDate = formatDate(range.start);
        const endDate = formatDate(range.end);

        return `${startDate} - ${endDate}`;
    };

    return (
        <div className="prediction-card" style={{ borderTop: `4px solid ${accentColor}` }}>
            <div className="prediction-card-header">
                <h3>{title}</h3>
                <i className={`fas fa-${icon}`} style={{ color: accentColor }}></i>
            </div>
            <div className="prediction-card-content">
                {date && (
                    <div className="prediction-date">{formatDate(date)}</div>
                )}
                {dateRange && (
                    <div className="prediction-date-range">{formatDateRange(dateRange)}</div>
                )}
                {daysUntil !== undefined && (
                    <div className="prediction-days-until">
                        {daysUntil > 0 ? (
                            <>In <span className="highlight">{daysUntil}</span> days</>
                        ) : daysUntil === 0 ? (
                            <span className="highlight">Today</span>
                        ) : (
                            <>Started <span className="highlight">{Math.abs(daysUntil)}</span> days ago</>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
