import React from 'react';
import ReactDOM from 'react-dom';

const MensajeHead = ({ mensaje, color }) => {
    if (!mensaje) return null;

    return ReactDOM.createPortal(
        <div 
            className="fixed top-0 left-0 w-full flex items-center justify-center text-white text-center shadow-lg"
            style={{ 
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 2147483647,
                backgroundColor: color || '#f16363',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                height: '48px'
            }}
        >
            <span className="font-semibold text-lg">{mensaje}</span>
        </div>,
        document.body
    );
};

export default MensajeHead;