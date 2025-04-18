import React from 'react';
import ReactDOM from 'react-dom';

export const MensajeHead = ({ mensaje }) => {
    if (!mensaje) return null;

    // Usar createPortal para renderizar fuera del root
    return ReactDOM.createPortal(
        <div 
            className="fixed top-0 left-0 w-full bg-[#ff9471] text-white px-4 py-3 text-center"
            style={{ 
                position: 'fixed',
                top: '0',
                left: '0',
                right: '0',
                zIndex: '2147483647' // Máximo z-index posible
            }}
        >
            <span className="font-semibold">{mensaje}</span>
        </div>,
        document.body
    );
};