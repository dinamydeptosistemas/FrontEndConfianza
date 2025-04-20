import React from 'react';

export const LogoutConfirmModal = ({ isOpen, onConfirm, onCancel, error, loading }) => {
    if (!isOpen) return null;

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
                        disabled={loading}
                        className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50 flex items-center"
                    >
                        {loading ? (
                            <>
                                <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                                Cerrando sesión...
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