import React from 'react';
import { FormProvider } from '../contexts/FormContext';
import { LoginForm } from '../components/forms/LoginForm';

const LoginGeneral = () => {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-lg p-8 space-y-8 bg-white rounded-lg">
                <FormProvider>
                    <LoginForm />
                </FormProvider>
            </div>
        </div>
    );
};

export default LoginGeneral; 