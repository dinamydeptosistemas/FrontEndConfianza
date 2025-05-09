import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Outlet } from 'react-router-dom';

const DashboardLayoutLighter = () => {
    const { user, negocio, logout } = useAuth();

    const handleLogout = () => {
        logout();
    };

    return (
        <div className="h-screen w-full flex flex-col">
            {/* Header superior */}
            <div className="bg-[#cccccc] py-2 flex justify-between items-center px-8 text-xs border-b border-gray-500 w-full">
                <div className="flex items-center">
                    <span className="font-semibold">NEGOCIO:</span>
                    <span className="text-[#1e4e9c] ml-2">{negocio?.nombre || 'COMPANIA DE PRUEBA'}</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center">
                        <span className="font-semibold">PERIODO:</span>
                        <span className="text-[#1e4e9c] ml-2">2025</span>
                    </div>
                    <div className="flex items-center">
                        <span className="font-semibold">USER:</span>
                        <span className="text-[#1e4e9c] ml-2">{user?.Username?.toUpperCase()}</span>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="bg-white text-[#f5a623] px-3 hover:text-[#f3f3f3] hover:bg-[#f5a623] border border-[#f5a623] py-1 text-xs rounded"
                    >
                        SALIR
                    </button>
                </div>
            </div>

            {/* Contenido principal sin sidebar */}
            <div className="flex-1 overflow-auto bg-gray-100">
                {/* Manager System bar */}
                <div className="bg-[#f5a623] w-full">
                    <div className="w-full py-2 px-4 h-[55px]">
                        <h2 className="text-lg font-bold text-white">
                            <span className="text-base ml-2">{user?.UserFunction || 'Usuario'} :</span>
                        </h2>
                    </div>
                </div>

                <div className="bg-white shadow-md min-h-full p-4">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default DashboardLayoutLighter; 