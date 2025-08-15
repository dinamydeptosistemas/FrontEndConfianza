import React, { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Outlet, Navigate } from 'react-router-dom';
import useInactivityLogout from '../hooks/useInactivityLogout';
import WorkJustificationModal from '../components/modals/WorkJustificationModal';

const DashboardLayout = () => {
    const { user, negocio, logout, loading, error } = useAuth();
    const [isJustificationModalOpen, setJustificationModalOpen] = useState(false);
    const [lastActivity, setLastActivity] = useState(null);
    const [minutesInactive, setMinutesInactive] = useState(0);

    const handleInactivity = useCallback((data) => {
        console.log('[DashboardLayout] Inactivity detected', data);
        setLastActivity(data.lastActivity);
        setMinutesInactive(data.minutesInactive);
        setJustificationModalOpen(true);
    }, []);

    const { resetTimer } = useInactivityLogout({
        onInactivity: handleInactivity,
        enabled: !!user,
        debug: true,
    });

    const handleContinue = () => {
        setJustificationModalOpen(false);
        resetTimer();
    };

    const handleRRHHJustification = (motivo) => {
        console.log('Justificación para RRHH:', motivo);
        // Aquí se podría enviar la justificación al backend
        setJustificationModalOpen(false);
        resetTimer();
    };

    const handleLogout = () => {
        setJustificationModalOpen(false);
        logout();
    };


    // Lógica de roles basada solo en el contexto
    const isAdmin = user?.CodeFunction === 2;
    const isManagerSystem = user?.UserFunction === 'MANAGER SYSTEM';

    // Mostrar loading state
    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e4e9c] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando...</p>
                </div>
            </div>
        );
    }

    // Mostrar error state
    if (error) {
        return (
            <div className="h-screen w-full flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">Error: {error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="bg-[#1e4e9c] text-white px-4 py-2 rounded hover:bg-[#173d7a]"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    // Título del módulo
    const getModuleTitle = () => {
        if (isAdmin) {
            return (
                <>
                    <span>MODULO</span><br />
                    <span>ADMINISTRACION</span>
                </>
            );
        }
        if (isManagerSystem) {
            return (
                <>
                    <span>MODULO</span><br />
                    <span>MANAGER</span><br />
                    <span>SYSTEM</span>
                </>
            );
        }
        return (
            <>
                <span>MODULO</span><br />
                <span>{user?.UserFunction || 'USUARIO'}</span>
            </>
        );
    };

    // Mostrar función del usuario
    const getUserFunctionDisplay = () => {
        if (isAdmin) return 'ADMINISTRACION:';
        if (isManagerSystem) return 'MANAGER SYSTEM:';
        return `${user?.UserFunction || 'Usuario'}:`;
    };

    const getNegocioDisplay = () => {
        if (negocio?.nombre) return negocio.nombre;
        if (user?.NameEntity) return user.NameEntity;
        return 'NA';
    };

    // Redirección si no hay usuario
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="h-screen w-full flex flex-col">
            {/* Header superior */}
            <div className="bg-[#e9e9e9] py-3 flex justify-between items-center px-8 text-xs border-b border-[#dadada] w-[90.8%]">
                <div className="flex items-center px-[186px]">
                    <span className="font-bold text-[#7a7a7a] text-[14px]">NEGOCIO:</span>
                    <span className="text-[#444444] text-[14px] ml-2">{getNegocioDisplay()}</span>
                </div>
                <div className="flex items-center">
                    <span className="font-bold text-[#7a7a7a] text-[14px]">PERIODO:</span>
                    <span className="text-[#444444] text-[14px] ml-2">2025</span>
                </div>
            </div>

            {/* Contenido principal con sidebar */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar izquierdo */}
                <div className="w-[180px] bg-[#1e4e9c] flex flex-col flex-shrink-0">
                    <div className="text-white text-center py-4">
                        <h1 className="text-[18px] font-bold">CONFIANZA</h1>
                        <h2 className="text-[18px] font-bold">2.5</h2>
                        <p className="text-xs mt-1">Sistema de Gestión y<br></br></p>
                        <p className="text-xs">Control de Negocios</p>
                    </div>

                    <div className="bg-[#4a4a4a] mx-4 my-4 p-4 flex-grow flex items-start justify-center rounded-lg w-[140px]">
                        <div className="text-center text-white leading-[1.1] font-bold text-md">
                            {getModuleTitle()}
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="bg-white text-blue-800 border border-r-2 border-[#1e4e9c] mx-auto w-[110px] hover:border-white hover:text-white mb-4 py-2 hover:bg-[#173d7a] font-bold text-sm rounded"
                    >
                        SALIR DEL<br />MODULO
                    </button>
                </div>

                {/* Contenido dinámico */}
                <div className="flex-1 overflow-auto  flex flex-col">
                    {/* User bar */}
                    <div className="flex bg-white mx-[23px] w-[87%]">
                        <div className="w-full py-2 px-4 flex justify-between text-xs">
                            <div className="flex ">
                                <span className="font-bold text-[#7a7a7a] text-[14px] mt-4 ">USER:</span>
                                <span className="text-[#7a7a7a] text-[14px] ml-1 mt-4">{user?.Username?.toUpperCase() || user?.NombreCompleto?.toUpperCase() || 'XAVIER'}</span>
                            </div>
                            <button 
                                onClick={logout}
                                className="bg-white text-[#f5a623] px-5 hover:text-[#f3f3f3] hover:bg-[#f5a623] border border-[#f5a623] px-3 py-1 text-xs rounded"
                            >
                                CAMBIAR <br /> USUARIO
                            </button>
                        </div>
                    </div>

                    {/* Manager System bar */}
                    <div className="flex justify-between bg-[#1e4e9c] mx-[40px] w-[87%] ">
                        <div className="w-full py-1 px-4 h-[50px] flex items-center">
                            <h2 className="text-lg font-bold text-white"> 
                                <span className="text-base ml-2 text-[1.2rem]">
                                    {getUserFunctionDisplay()}
                                </span>
                            </h2>
                        </div>
                    </div>

                    <div className="bg-white shadow-md flex-1 w-full">
                        <Outlet />
                    </div>
                </div>
            </div>
                        <WorkJustificationModal
                open={isJustificationModalOpen}
                onContinue={handleContinue}
                onRRHHJustification={handleRRHHJustification}
                onLogout={handleLogout}
                minutesSinceLastActivity={minutesInactive}
                lastActivity={lastActivity}
            />
        </div>
    );
};

export default DashboardLayout; 