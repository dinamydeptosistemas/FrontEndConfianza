import React, { useState, useEffect } from 'react';
import { FormProvider } from '../contexts/FormContext';
import { LoginForm } from '../components/forms/LoginForm';
import { getLoginConfig } from '../services/config/ConfigService';
import axiosInstance from '../../src/config/axios';



const LoginGeneral = () => {
   const [loginConfig, setLoginConfig] = useState({
           mostrarNombreComercial: false,
           nombreComercialLogin: "CONFIANZA SCGC",
           mostrarColorLogin: false,
           colorLogin: "#217346",
           mostrarImagenLogin: false,
           archivoLogo: "",
           imageUrls: []
       });
    useEffect(() => {
        const fetchConfig = async () => {
            const config = await getLoginConfig();
            setLoginConfig(config);
        };
        fetchConfig();
    }, []);

      const imageUrl = loginConfig.imageUrls && loginConfig.imageUrls.length > 0 
        ? `${axiosInstance.defaults.baseURL}${loginConfig.imageUrls[0]}`
        : null;

    return (
        <div className="relative flex items-center justify-center min-h-screen bg-white">
            {loginConfig.mostrarImagenLogin === "True" && (
                <img 
                    src={imageUrl ? imageUrl : `${axiosInstance.defaults.baseURL}/uploads/fondo.jpg`} 
                    alt="Login Background" 
                    className="absolute inset-0 w-full h-full object-cover" 
                />
            )}
            <div className="relative w-full max-w-lg p-8 space-y-8  rounded-lg shadow-lg">
                <FormProvider>
                    <LoginForm />
                </FormProvider>
            </div>
        </div>
    );
};

export default LoginGeneral; 