import React from 'react';
import { useFormContext } from '../../contexts/FormContext';

export const FormInput = ({
    name,
    label,
    type = 'text',
    placeholder,
    validation = {},
    className = '',
    onInput,
    ...props
}) => {
    const { register, formState: { errors } } = useFormContext();
    const error = errors[name];

    return (
        <div className={`mb-6 ${className}`}>
            {label && (
                <label htmlFor={name} className="block text-sm font-medium text-gray-600 mb-2">
                    {label}
                </label>
            )}
            <input
                id={name}
                type={type}
                placeholder={placeholder}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                }`}
                {...register(name, validation)}
                onInput={onInput}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-red-500">
                    {error.message}
                </p>
            )}
        </div>
    );
}; 