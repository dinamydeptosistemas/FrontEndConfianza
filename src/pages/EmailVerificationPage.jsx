import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../config/axios';

const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying');
  const [errorMessage, setErrorMessage] = useState('');
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  console.log('Email verification page loaded');
  console.log('Token from URL:', token);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        return;
      }

      try {
        console.log('Sending verification request with token:', token);
        
        // Use direct axios instead of axiosInstance to avoid interceptors
        const response = await fetch('http://localhost:5201/api/EmailVerification/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ token })
        });
        
        console.log('Verification response status:', response.status);
        
        if (response.ok) {
          console.log('Email verification successful');
          setStatus('success');
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('Email verification failed:', errorData);
          setErrorMessage(errorData.message || 'Error de verificación');
          setStatus('error');
        }
      } catch (error) {
        console.error('Error verifying email:', error);
        setErrorMessage(error.message || 'Error al procesar la verificación');
        setStatus('error');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <div className="text-center">
          {status === 'verifying' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Verificando correo electrónico</h2>
              <p className="text-gray-600">Por favor espere mientras verificamos su correo electrónico...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <svg className="h-16 w-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Usuario verificado exitosamente</h2>
              <p className="text-gray-600 mb-4">Su correo electrónico ha sido verificado correctamente.</p>
              <a 
                href="/login" 
                className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Iniciar sesión
              </a>
            </>
          )}

          {status === 'error' && (
            <>
              <svg className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Error de verificación</h2>
              <p className="text-gray-600 mb-4">No se pudo verificar su correo electrónico. El enlace puede haber expirado o ser inválido.</p>
              <p className="text-red-500 mb-4">{errorMessage}</p>
              <a 
                href="/login" 
                className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Volver al inicio
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
