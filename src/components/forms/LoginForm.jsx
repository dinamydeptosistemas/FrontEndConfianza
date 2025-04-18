import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FormInput } from './FormInput';
import { MensajeHead } from './MensajeHead';

export const LoginForm = () => {
    const { login } = useAuth();
    const [userType, setUserType] = useState(0);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        dni: '',
        userType: 0
    });
    const [globalError, setGlobalError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Efecto para limpiar campos cuando cambia el tipo de usuario
    useEffect(() => {
        setFormData({
            username: '',
            password: '',
            email: '',
            dni: '',
            userType: userType
        });
    }, [userType]);

    const handleUserTypeChange = (type) => {
        setUserType(type);
        setGlobalError('');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if ((userType === 1 && (name === 'email' || name === 'dni')) ||
            (userType === 2 && (name === 'username' || name === 'password'))) {
            return;
        }
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setGlobalError('');
    };

    const validateForm = () => {
        if (userType === 0) {
            setGlobalError('Por favor, seleccione un tipo de usuario.');
            return false;
        }

        if (userType === 1) {
            if (!formData.username || !formData.password) {
                setGlobalError('Por favor complete usuario y contraseña');
                return false;
            }
            if (formData.username.length < 3) {
                setGlobalError('El usuario debe tener al menos 3 caracteres');
                return false;
            }
            if (formData.password.length !== 4) {
                setGlobalError('La contraseña debe tener 4 caracteres');
                return false;
            }
        } else {
            if (!formData.email || !formData.dni) {
                setGlobalError('Por favor complete todos los campos');
                return false;
            }
            
            // Validación de correo con mensaje personalizado
            const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
            if (!emailRegex.test(formData.email)) {
                setGlobalError('El correo electrónico debe tener un formato válido (ejemplo: usuario@dominio.com)');
                return false;
            }

            const dniRegex = /^[0-9]{10,13}$/;
            if (!dniRegex.test(formData.dni)) {
                setGlobalError('El DNI debe tener entre 10 y 13 dígitos numéricos');
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        console.log('[LoginForm] Datos del formulario antes de onSubmit:', formData);
        setIsSubmitting(true);
        try {
            await login(formData);
        } catch (error) {
            setGlobalError(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative w-full">
            <MensajeHead mensaje={globalError} />
            <div className="w-full max-w-md mx-auto">
                <div className="p-6">
                    <h1 className="text-3xl font-bold text-center text-[#0047BB] mb-8">SG CONFIANZA 2.5</h1>

                    <div className="flex justify-center space-x-4 mb-6">
                        <button
                            type="button"
                            className={`px-2 py-1 rounded border-2 transition-colors ${
                                userType === 1 
                                    ? 'bg-[#c2c2c2] text-white border-[#c2c2c2]' 
                                    : 'bg-white text-[#898989] border-[#c2c2c2] hover:border-[#c2c2c2] hover:bg-[#c2c2c2] hover:text-black'
                            }`}
                            onClick={() => handleUserTypeChange(1)}
                        >
                            Usuario Interno
                        </button>
                        <button
                            type="button"
                            className={`px-2 py-1 rounded border-2 transition-colors ${
                                userType === 2 
                                    ? 'bg-[#c2c2c2] text-white border-[#c2c2c2]' 
                                    : 'bg-white text-[#898989] border-[#c2c2c2]  hover:border-[#c2c2c2]  hover:bg-[#c2c2c2] hover:text-black'
                            }`}
                            onClick={() => handleUserTypeChange(2)}
                        >
                            Usuario Externo
                        </button>
                    </div>

                    <div className="bg-[#0047BB] rounded-lg p-8 shadow-lg">
                        <h2 className="text-2xl font-semibold text-white text-center mb-6">Iniciar Sesión</h2>

                        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                        {userType === 0 && (
                                <>
                                    <FormInput
                                        name="username o correo"
                                        placeholder="Usuario"
                                        value={formData.username}
                                        disabled={true}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 rounded focus:outline-none focus:border-blue-500"
                                    />
                                    <FormInput
                                        name="password o CI/RUC"
                                        type="password"
                                        placeholder="Contraseña"
                                        value={formData.password}
                                        disabled={true}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 rounded focus:outline-none focus:border-blue-500"
                                    />
                                </>
                            )}
                            {userType === 1 && (
                                <>
                                    <FormInput
                                        name="username"
                                        placeholder="Usuario"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 rounded focus:outline-none focus:border-blue-500"
                                    />
                                    <FormInput
                                        name="password"
                                        type="password"
                                        placeholder="Contraseña"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 rounded focus:outline-none focus:border-blue-500"
                                    />
                                </>
                            )}
                            {userType === 2 && (
                                <>
                                    <FormInput
                                        name="email"
                                        type="email"
                                        placeholder="Correo electrónico"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 rounded focus:outline-none focus:border-blue-500"
                                    />
                                    <FormInput
                                        name="dni"
                                        placeholder="DNI/RUC"
                                        value={formData.dni}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 rounded focus:outline-none focus:border-blue-500"
                                    />
                                </>
                            )}

                            <div className="flex justify-center">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-24 bg-gray-200 text-[#0047BB] py-2 px-4 rounded font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Accediendo...' : 'Acceder'}
                                </button>
                            </div>

                            <div className="text-center space-y-2 mt-4">
                                <button
                                    type="button"
                                    onClick={() => console.log('Recuperar contraseña')}
                                    className="block w-full text-white hover:underline text-sm"
                                >
                                    ¿Perdiste tu contraseña?
                                </button>
                                <button
                                    type="button"
                                    onClick={() => console.log('Ir a registro')}
                                    className="block w-full text-white hover:underline text-sm"
                                >
                                    ¿No tienes Cuenta? Regístrate
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;