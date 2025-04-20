import React from 'react';

export const FormInput = ({
    name,
    type = 'text',
    placeholder,
    value = '',
    onChange,
    className = '',
    disabled = false,
    ...props
}) => {
    return (
        <div className="mb-4">
            <input
                id={name}
                name={name}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 
                    ${disabled 
                        ? 'bg-gray-100 cursor-not-allowed' 
                        : 'border-gray-300 focus:ring-[#0047BB]'
                    } ${className}`}
                {...props}
            />
        </div>
    );
}; 