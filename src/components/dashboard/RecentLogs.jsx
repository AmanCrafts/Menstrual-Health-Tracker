import React from 'react';

export default function RecentLogs({ logs }) {
    if (!logs || logs.length === 0) {
        return null;
    }

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Format symptom log details
    const formatSymptomLog = (log) => {
        const symptoms = Object.entries(log.symptoms || {})
            .filter(([_, value]) => value)
            .map(([key]) => key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()));

        return symptoms.length > 0
            ? `Symptoms: ${symptoms.join(', ')}`
            : 'No symptoms recorded';
    };

    // Format mood log details
    const formatMoodLog = (log) => {
        return `Mood: ${log.mood || 'Not specified'}`;
    };

    // Get appropriate format based on log type
    const getLogDetails = (log) => {
        if (log.symptoms) {
            return formatSymptomLog(log);
        } else if (log.mood) {
            return formatMoodLog(log);
        } else {
            return 'Log details';
        }
    };

    return (
        <div className="recent-logs">
            <h3>Recent Logs</h3>
            {logs.map((log, index) => (
                <div key={index} className="log-item">
                    <div className="log-date">{formatDate(log.date)}</div>
                    <div className="log-details">{getLogDetails(log)}</div>
                </div>
            ))}
        </div>
    );
}
