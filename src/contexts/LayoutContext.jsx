
import React, { createContext, useState, useContext } from 'react';

const LayoutContext = createContext();

export const useLayout = () => useContext(LayoutContext);

export const LayoutProvider = ({ children }) => {
    const [header, setHeader] = useState({
        title: 'MANAGER SYSTEM:',
        color: '#1e4e9c' // Default blue color
    });

    const value = { header, setHeader };

    return (
        <LayoutContext.Provider value={value}>
            {children}
        </LayoutContext.Provider>
    );
};
