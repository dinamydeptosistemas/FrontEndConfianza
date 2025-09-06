import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Outlet } from 'react-router-dom';
import { useConfig } from '../contexts/ConfigContext';

const DashboardLayoutLight = () => {
    const { user, negocio, logout, loading: authLoading, error: authError } = useAuth();
    const { config, loading: configLoading, error: configError } = useConfig();

    const handleLogout = () => {
        logout();
    };

    if (authLoading || configLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="loader">Loading...</div>
            </div>
        );
    }

    if (authError || configError) {
        return (
            <div className="flex flex-col justify-center items-center h-screen">
                <p className="text-red-500 mb-4">Error al cargar datos.</p>
                <button onClick={() => window.location.reload()} className="bg-blue-500 text-white px-4 py-2 rounded">
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className="h-screen w-full flex flex-col">
            {/* Header superior */}
            <div className="bg-[#e9e9e9] py-2 flex justify-between items-center px-8 text-xs border-b border-gray-500 w-[90.8%]">
                <div className="flex items-center">
                    <span className="font-semibold">NEGOCIO:</span>
                    <span className="text-[#1e4e9c] ml-2">{negocio?.nombre || 'COMPANIA DE PRUEBA'}</span>
                </div>
                <div className="flex items-center">
                    <span className="font-semibold">PERIODO:</span>
                    <span className="text-[#1e4e9c] ml-2">2025</span>
                </div>
            </div>

            {/* Contenido principal con sidebar más ligero */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar izquierdo simplificado */}
                <div className="w-[180px] bg-[#1e4e9c] flex flex-col flex-shrink-0">
                    <div className="text-white text-center py-4">
                        <h1 className="text-xl font-bold">CONFIANZA</h1>
                        <h2 className="text-xl font-bold">2.5</h2>
                        <p className="text-xs mt-1">Sistema de Control</p>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="bg-[#1e4e9c] text-white border border-r-2 border-white mx-auto w-[110px] mb-4 py-2 hover:bg-[#173d7a] text-sm rounded mt-auto"
                    >
                        SALIR DEL<br />MODULO
                    </button>
                </div>

                {/* Contenido dinámico */}
                <div className="flex-1 overflow-auto bg-gray-100 flex flex-col">
                    {/* User bar */}
                    <div className="flex bg-white mx-[40px] w-[87%] border-b">
                        <div className="w-full py-2 px-4 flex justify-between text-xs">
                            <div className="flex">
                                <span className="font-semibold">USER:</span>
                                <span className="text-[#1e4e9c] ml-1">{user?.Username?.toUpperCase()}</span>
                            </div>
                            <button 
                                onClick={handleLogout}
                                className="bg-white text-[#f5a623] px-5 hover:text-[#f3f3f3] hover:bg-[#f5a623] border border-[#f5a623] px-3 py-1 text-xs rounded"
                            >
                                CAMBIAR <br /> USUARIO
                            </button>
                        </div>
                    </div>

                    {/* Manager System bar */}
                    <div className="flex justify-between bg-[#f5a623] mx-[40px] w-[87%]">
                        <div className="w-full py-2 px-4 h-[55px]">
                            <h2 className="text-lg font-bold text-white">
                                <span className="text-base ml-2">{user?.UserFunction || 'Usuario'} :</span>
                            </h2>
                        </div>
                    </div>

                    <div className="bg-white min-h-full flex-1 w-full">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardLayoutLight; 