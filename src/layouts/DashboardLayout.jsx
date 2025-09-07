import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import useInactivityLogout from '../hooks/useInactivityLogout';
import WorkJustificationModal from '../components/modals/WorkJustificationModal';
import { useConfig } from '../contexts/ConfigContext';
import MensajeHead from '../components/forms/MensajeHead';
import { getEmpresas } from '../services/company/CompanyService';

const DashboardLayout = ({ children }) => {
    const { user, negocio, logout, setNegocio, loading: authLoading, error: authError } = useAuth();
    const { config, loading: configLoading, error: configError } = useConfig();
    const [isJustificationModalOpen, setJustificationModalOpen] = useState(false);
    const [lastActivity, setLastActivity] = useState(null);
    const [minutesInactive, setMinutesInactive] = useState(0);
    const [empresas, setEmpresas] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        const fetchEmpresas = async () => {
            try {
                const response = await getEmpresas({ getAll: true }); // Fetch all companies
                const companiesList = response.companies || [];
                if (Array.isArray(companiesList)) {
                    setEmpresas(companiesList);
                }
            } catch (error) {
                console.error('Error al cargar empresas:', error);
            }
        };
        fetchEmpresas();
    }, []);

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
        setJustificationModalOpen(false);
        resetTimer();
    };

    const handleLogout = () => {
        setJustificationModalOpen(false);
        logout();
    };

    const handleNegocioChange = (e) => {
        const selectedCode = e.target.value;
        const selectedEmpresa = empresas.find(emp => (emp.codeEntity || emp.CodeEntity) === selectedCode);
        if (selectedEmpresa) {
            const negocioData = {
                nombre: selectedEmpresa.businessName || selectedEmpresa.BusinessName,
                codigo: selectedEmpresa.codeEntity || selectedEmpresa.CodeEntity,
            };
            setNegocio(negocioData);
        }
        setShowDropdown(false);
    };

    const isAdmin = user?.CodeFunction === 2;
    const isManagerSystem = user?.UserFunction === 'MANAGER SYSTEM';

    const location = useLocation();

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

    const getModuleTitle = () => {
        if (isAdmin) return 'ADMINISTRADOR';
        if (isManagerSystem) return 'MANAGER SYSTEM';
        return 'USUARIO';
    };

    const getUserFunctionDisplay = () => {
        if (location.pathname === '/configuracion') return 'CONFIGURACION GENERAL:' 
        if (isAdmin) return 'ADMINISTRADOR:';
        if (isManagerSystem) return 'MANAGER SYSTEM:';
        if (user?.UserFunction) return user.UserFunction;
        return 'USUARIO';
    };

    const getNegocioDisplay = () => {
        if (negocio?.nombre) return negocio.nombre;
        if (user?.NameEntity) return user.NameEntity;
        return 'NA';
    };

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const functionBarColorClass = location.pathname === '/configuracion' ? 'bg-orange-400' : 'bg-[#1e4e9c]';

    return (
        <div className="h-screen w-[95%] flex flex-col">
            <MensajeHead 
                mensaje={config?.ambienteTrabajoHabilitado ? 'AMBIENTE DE PRUEBA' : ''}
                style={{ boxShadow: 'none', backgroundColor: '#FEE2E2' }}
                textStyle={{ color: '#8ba4cb', fontWeight: '400', fontSize: '0.9rem' }}
            />
                
            <div className="bg-[#e9e9e9] py-3 flex justify-between items-center px-8 text-xs w-full">
                <div className="flex items-center px-[186px]">
                    <span className="font-bold text-[#7a7a7a] text-[14px]">NEGOCIO:</span>
                    <div className="relative inline-block ml-2">
                        <button onClick={() => setShowDropdown(!showDropdown)} className="text-[#444444] text-[14px] cursor-pointer">
                            {getNegocioDisplay()}
                        </button>
                        {showDropdown && (
                            <select
                                onChange={handleNegocioChange}
                                onBlur={() => setShowDropdown(false)}
                                className="absolute top-full left-0 z-10 bg-white  border rounded shadow-lg"
                                defaultValue={negocio?.codigo}
                                autoFocus
                                size={empresas.length > 10 ? 10 : empresas.length + 1}
                            >
                                <option value="" disabled>Seleccione una empresa</option>
                                {empresas.map(empresa => (
                                    <option key={empresa.codeEntity || empresa.CodeEntity} value={empresa.codeEntity || empresa.CodeEntity}>
                                        {empresa.businessName || empresa.BusinessName}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>
                <div className="flex items-center">
                    <span className="font-bold text-[#7a7a7a] text-[14px]">PERIODO:</span>
                    <span className="text-[#444444] text-[14px] ml-2">2025</span>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                <div className="w-[180px] bg-[#1e4e9c] flex flex-col flex-shrink-0">
                    <div className="text-white text-center py-4">
                        <h1 className="text-[15px] px-2 font-bold">CONFIANZA <br></br> SCGC</h1> 
                    
                        <p className="text-xs mt-1">Sistema de Gestión y<br></br></p>
                        <p className="text-xs">Control de Negocios</p>
                    </div>

                    <div className="bg-[#4a4a4a] mx-4 my-4 p-4 flex-grow flex flex-col justify-between items-center rounded-lg w-[140px]">
                        <div className="text-center text-white leading-[1.1] font-bold text-[14px]">
                            { location.pathname === '/configuracion' ? 'MODULO  CONFIGURACION GENERAL' : 'MODULO '  + getModuleTitle()}
                        </div>
                        {location.pathname === '/configuracion' ? (
                            <div className="flex flex-col items-center w-full mt-4">
                                <Link to="/dashboard" className="bg-gray-300 text-gray-800 text-xs font-bold py-2 px-4 rounded-lg hover:bg-gray-400 w-full text-center mb-2">
                                    Anterior
                                </Link>
                                <Link to="/configuracion/next" className="bg-blue-600 text-white text-xs font-bold py-2 px-4 rounded-lg hover:bg-blue-700 w-full text-center">
                                    Siguiente
                                </Link>
                            </div>
                        ) : (
                            <Link
                                to={location.pathname === '/configuracion' ? '/configuracion/next' : '/configuracion'}
                                className="mt-4 bg-gray-200 text-gray-800 text-xs font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors duration-200 text-center w-full"
                            >
                                {location.pathname === '/configuracion' ? 'Siguiente' : 'Siguiente'}
                            </Link>
                        )}
                    </div>

                    <button
                        onClick={logout}
                        className="bg-white text-blue-800 border border-r-2 border-[#1e4e9c] mx-auto w-[110px] hover:border-white hover:text-white mb-4 py-2 hover:bg-[#173d7a] font-bold text-sm rounded"
                    >
                        SALIR DEL<br />MODULO
                    </button>
                </div>

                <main className="flex-1 flex flex-col w-full no-scrollbar" style={{ overflowY: 'auto' }}>
                    <div className="flex bg-white mx-auto w-[95%]">
                        <div className="w-full py-2 px-2 flex justify-between text-xs">
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

                    <div className={`flex justify-between ${functionBarColorClass}  ml-8 mr-auto w-full `}>
                        <div className="w-full py-1 px-4 h-[50px] flex items-center">
                            <h2 className="text-lg font-bold text-white">
                                <span className="text-[1.3rem]">
                                    {getUserFunctionDisplay()}
                                </span>
                            </h2>
                        </div>
                    </div>

                    <div className="bg-white shadow-md flex-1 w-full p-6 mx-auto">
                        {children ? children : <Outlet />}
                    </div>
                </main>
            </div>

            <WorkJustificationModal
                isOpen={isJustificationModalOpen}
                onClose={() => setJustificationModalOpen(false)}
                onContinue={handleContinue}
                onSubmitJustification={handleRRHHJustification}
                lastActivity={lastActivity}
                minutesInactive={minutesInactive}
                onLogout={handleLogout}
            />
        </div>
    );
};

export default DashboardLayout;