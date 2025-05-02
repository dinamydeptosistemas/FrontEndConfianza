import React from 'react';
import Lottie from 'lottie-react';
import successAnimation from '../assets/animations/registrerok.json';
import { useNavigate } from 'react-router-dom';

const RegisterSuccess = () => {
  const navigate = useNavigate();

  const defaultOptions = {
    loop: false,
    autoplay: true,
    animationData: successAnimation,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl text-center">
        <div className="w-full h-[300px] mx-auto mb-6 flex items-center justify-center">
          <Lottie 
            {...defaultOptions}
            style={{
              width: '100%',
              height: '100%',
              maxWidth: '400px'
            }}
          />
        </div>
        <h2 className="text-2xl font-bold text-green-600 mb-4">¡Registro Exitoso!</h2>
        <p className="text-gray-600 mb-6">
          Tu cuenta ha sido creada correctamente. Ahora contactate con el administrador para que te asignen un permiso para acceder al sistema.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
        >
          Ir al Login
        </button>
      </div>
    </div>
  );
};

export default RegisterSuccess; 