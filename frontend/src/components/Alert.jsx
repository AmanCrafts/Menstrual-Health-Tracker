import React from 'react';
import '../styles/alert.css';

export default function Alert({ type, message }) {
    if (!message) return null;

    return <div className={`alert alert-${type}`}>{message}</div>;
}
