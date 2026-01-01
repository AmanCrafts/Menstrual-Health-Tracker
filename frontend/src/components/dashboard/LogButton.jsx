import React from 'react';

export default function LogButton({ icon, label, onClick }) {
    return (
        <button className="log-button" onClick={onClick}>
            <i className={`fas fa-${icon}`}></i>
            <span>{label}</span>
        </button>
    );
}
