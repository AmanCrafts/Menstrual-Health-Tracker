import React from 'react';
import '../styles/loadingSpinner.css';

export default function LoadingSpinner() {
    return (
        <div className="loading-spinner-container">
            <div className="loading-spinner">
                <div className="spinner-circle"></div>
                <div className="spinner-circle inner"></div>
            </div>
            <p>Loading...</p>
        </div>
    );
}
