
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getConfig } from '../services/config/ConfigService';

const ConfigContext = createContext(null);

export const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reloadConfig = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getConfig();
      if (data && data.config && Array.isArray(data.config) && data.config.length > 0) {
        // Map the backend config to the frontend state structure
        const backendConfig = data.config[0];
        // Assuming a direct mapping for now, adjust as needed based on your backend response
        setConfig(backendConfig);
      } else {
        setConfig(null);
      }
    } catch (err) {
      setError(err.message || 'Error fetching configuration');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearConfig = useCallback(() => {
    setConfig(null);
  }, []);

  useEffect(() => {
    reloadConfig();
  }, [reloadConfig]);

  return (
    <ConfigContext.Provider value={{ config, loading, error, reloadConfig, clearConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};
