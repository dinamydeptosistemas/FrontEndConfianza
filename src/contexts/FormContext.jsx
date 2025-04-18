import { createContext, useContext } from 'react';
import { useForm } from 'react-hook-form';

const FormContext = createContext();

export const useFormContext = () => {
    const context = useContext(FormContext);
    if (!context) {
        throw new Error('useFormContext must be used within a FormProvider');
    }
    return context;
};

export const FormProvider = ({ children }) => {
    const methods = useForm({
        mode: 'onTouched',
        reValidateMode: 'onChange',
        defaultValues: {
            username: '',
            email: '',
            dni: '',
            password: '',
            userType: 1
        }
    });

    return (
        <FormContext.Provider value={methods}>
            {children}
        </FormContext.Provider>
    );
}; 