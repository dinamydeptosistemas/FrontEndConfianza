import React from 'react';
// import { useNavigate } from 'react-router-dom'; // Ya no se usa aquí
import { FormProvider } from '../contexts/FormContext';
import { LoginForm } from '../components/forms/LoginForm';
import { useAuth } from '../contexts/AuthContext'; // Importar el hook correcto

const LoginGeneral = () => {
    // const navigate = useNavigate(); // Ya no se usa aquí
    // Usar el hook importado del contexto real
    const { login } = useAuth();

    const handleSubmit = async (data) => {
        try {
            // Log de datos recibidos de LoginForm
            console.log('[LoginGeneral] Datos recibidos en handleSubmit:', data);

            // Llamar a la función login del contexto, que usa authService
            await login(data);

            // La redirección ahora debería manejarse dentro de la función login 
            // del AuthContext o basándose en el estado del usuario actualizado.
            // Si no, podemos agregarla aquí después de un login exitoso:
            // Necesitamos obtener el user actualizado del contexto, 
            // pero useAuth() solo se llama una vez al inicio. 
            // La función login del contexto debe manejar la navegación o 
            // necesitamos una forma de obtener el user actualizado aquí.
            
            // Simplificado por ahora: asumimos que login() navega si tiene éxito.

        } catch (error) {
            console.error('Error en handleSubmit de LoginGeneral:', error);
            // El error ya debería ser manejado y mostrado por el AuthContext
            // o podríamos mostrar un mensaje específico aquí si es necesario.
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-lg p-8 space-y-8 bg-white rounded-lg">
                <FormProvider>
                    <LoginForm onSubmit={handleSubmit} />
                </FormProvider>
            </div>
        </div>
    );
};

export default LoginGeneral; 