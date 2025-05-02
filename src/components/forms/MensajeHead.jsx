import React from 'react';
import ReactDOM from 'react-dom';

export const MensajeHead = ({ mensaje, color = '#ff9471' }) => {
    if (!mensaje) return null;

    console.log('MensajeHead - Color recibido:', color); // Debug log

    // Usar createPortal para renderizar fuera del root
    return ReactDOM.createPortal(
        <div 
            className="fixed top-0 left-0 w-full text-white px-4 py-3 text-center shadow-lg"
            style={{ 
                position: 'fixed',
                top: '0',
                left: '0',
                right: '0',
                zIndex: '999999', // Aumentado el z-index
                backgroundColor: color,
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)' // Agregado sombra
            }}
        >
            <span className="font-semibold text-lg">{mensaje}</span>
        </div>,
        document.body
    );
};