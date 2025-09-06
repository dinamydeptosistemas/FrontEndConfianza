import React from 'react';
import ReactDOM from 'react-dom';

const MensajeHead = ({ mensaje, color, style, textStyle, className, textClassName }) => {
    if (!mensaje) return null;

    const defaultStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 2147483647,
        backgroundColor: color || '#f16363',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        height: '40px'
    };

    const combinedStyle = { ...defaultStyle, ...style };

    const baseClasses = "fixed top-0 left-0 w-full flex items-center justify-center text-white text-center shadow-lg";
    const combinedClasses = `${baseClasses} ${className || ''}`;

    const baseTextClasses = "font-semibold text-lg";
    const combinedTextClasses = `${baseTextClasses} ${textClassName || ''}`;

    return ReactDOM.createPortal(
        <div
            className={combinedClasses}
            style={combinedStyle}
        >
            <span className={combinedTextClasses} style={textStyle}>{mensaje}</span>
        </div>,
        document.body
    );
};

export default MensajeHead;