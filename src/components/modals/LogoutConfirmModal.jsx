import React, { useState } from 'react';

export const LogoutConfirmModal = ({ isOpen, onConfirm, onCancel, error }) => {
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        try {
            setIsLoading(true);
            await onConfirm();
        } catch (err) {
            console.error('Error al cerrar sesión:', err);
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Confirmar Cierre de Sesión
                </h2>
                
                {error ? (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                ) : (
                    <p className="text-gray-600 mb-6">
                        ¿Está seguro que desea cerrar la sesión?
                    </p>
                )}
                
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center"
                    >
                        {isLoading ? (
                            <>
                                <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                                Cerrando...
                            </>
                        ) : (
                            'Cerrar Sesión'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}; 