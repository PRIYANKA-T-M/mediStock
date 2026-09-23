import React from 'react';

/**
 * Reusable Loading Spinner Component
 * @param {string} size - 'sm', 'md', or 'lg'
 * @param {string} message - Optional label text
 * @param {string} className - Optional container class
 */
const Loading = ({ size = 'md', message = '', className = '' }) => {
  return (
    <div className={`loading-container ${className}`} role="status" aria-live="polite">
      <div className={`spinner spinner-${size}`} aria-hidden="true"></div>
      {message && <span>{message}</span>}
      <span className="sr-only" style={{ position: 'absolute', width: '1px', height: '1px', padding: '0', margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: '0' }}>
        Loading...
      </span>
    </div>
  );
};

export default Loading;
