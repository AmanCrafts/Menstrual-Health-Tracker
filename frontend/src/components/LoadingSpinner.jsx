import React from 'react';
import '../styles/loadingSpinner.css';

/**
 * LoadingSpinner Component
 * @param {boolean} fullPage - If true, centers the spinner in the full viewport
 * @param {string} message - Optional loading message to display
 */
export default function LoadingSpinner({ fullPage = false, message = 'Loading...' }) {
    const containerClass = fullPage ? 'spinner-fullpage' : 'spinner-inline';

    return (
        <div className={containerClass}>
            <div className="spinner-wrapper">
                <div className="loader-three-rings">
                    <div className="ring"></div>
                    <div className="ring"></div>
                    <div className="ring"></div>
                    <div className="dot"></div>
                </div>
                {message && <p className="spinner-message">{message}</p>}
            </div>
        </div>
    );
}
