import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useMenuStatistics } from '../hooks/useMenuStatistics';

const ManagerSystemPage = () => {
    const { user } = useAuth();
    const { statistics, loading } = useMenuStatistics();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Effect para manejar cambios de tamaño de pantalla
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Ya no necesitamos estilos adicionales para las estadísticas
    // El grid se encarga de la alineación uniforme

    return (
        <div className="w-full overflow-hidden h-[1000px]">
            {/* Manager System Title */}
 
            {/* Main content */}
            <div className="p-10 text-[20px] w-full h-full">
                <div className="flex flex-col md:flex-row mb-6">
                    {/* Columna izquierda - Accesos */}
                    <div className="w-full md:w-1/2 pr-0 md:pr-8 mb-6 md:mb-0">
                        <h3 className="text-base text-gray-600 mb-3 text-[20px]">Accesos</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/dashboard/empresas" className="text-[#1e4e9c] hover:underline block">
                                    <span className={`inline-block ${isMobile ? 'w-full' : 'min-w-[210px]'}`}>1 Empresas</span>
                                </Link>
                                <div className="text-sm text-gray-500 ml-4 mt-1">
                                    {loading ? (
                                        <span className="animate-pulse">Cargando...</span>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 border border-gray-200 p-2 bg-gray-200">
                                            <span>Total: <span className="text-blue-500 font-bold text-[16px]">{statistics.empresas.total}</span></span>
                                            <span className="flex justify-start sm:ml-[-30px]">Activas: <span className="text-blue-500 font-bold text-[16px]">{statistics.empresas.activos}</span></span>
                                            <span className="sm:ml-[-18px]">Inactivas: <span className="text-blue-500 font-bold text-[16px]">{statistics.empresas.inactivos}</span></span>
                                        </div>
                                    )}
                                </div>
                            </li>
                            <li>
                                <Link to="/dashboard/perfil-acceso" className="text-[#1e4e9c] hover:underline block">
                                    <span className={`inline-block ${isMobile ? 'w-full' : 'min-w-[210px]'}`}>2 Configurar Perfil Acceso</span>
                                </Link>
                                <div className="text-sm text-gray-500 ml-4 mt-1">
                                    {loading ? (
                                        <span className="animate-pulse">Cargando...</span>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 border border-gray-200 p-2 bg-gray-200">
                                            <span>Total: <span className="text-blue-500 font-bold text-[16px]">{statistics.perfiles.total}</span></span>
                                            <span className="sm:ml-[-30px]">Dan Permisos: <span className="text-blue-500 font-bold text-[16px]">{statistics.perfiles.profilesWithGrantPermissions}</span></span>
                                            <span className="sm:ml-[-18px]">Todos Módulos: <span className="text-blue-500 font-bold text-[16px]">{statistics.perfiles.profilesWithAllModules}</span></span>
                                        </div>
                                    )}
                                </div>
                            </li>
                            <li>
                                <Link to="/dashboard/usuarios" className="text-[#1e4e9c] hover:underline block">
                                    <span className={`inline-block ${isMobile ? 'w-full' : 'min-w-[210px]'}`}>3 Usuarios</span>
                                </Link>
                                <div className="text-sm text-gray-500 ml-4 mt-1">
                                    {loading ? (
                                        <span className="animate-pulse">Cargando...</span>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 border border-gray-200 p-2 bg-gray-200">
                                            <span>Total: <span className="text-blue-500 font-bold text-[16px]">{statistics.usuarios.total}</span></span>
                                            <span className="sm:ml-[-30px]">Internos: <span className="text-blue-500 font-bold text-[16px]">{statistics.usuarios.internos}</span></span>
                                            <span className="sm:ml-[-18px]">Externos: <span className="text-blue-500 font-bold text-[16px]">{statistics.usuarios.externos}</span></span>
                                        </div>
                                    )}
                                </div>
                            </li>
                            <li>
                                <Link to="/dashboard/permisos" className="text-[#1e4e9c] hover:underline block">
                                    <span className={`inline-block ${isMobile ? 'w-full' : 'min-w-[210px]'}`}>4 Permisos</span>
                                </Link>
                                <div className="text-sm text-gray-500 ml-4 mt-1">
                                    {loading ? (
                                        <span className="animate-pulse">Cargando...</span>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 border border-gray-200 p-2 bg-gray-200">
                                            <span>Total: <span className="text-blue-500 font-bold text-[16px]">{statistics.permisos.total}</span></span>
                                            <span className="sm:ml-[-30px]">Activos: <span className="text-blue-500 font-bold text-[16px]">{statistics.permisos.activos}</span></span>
                                            <span className="sm:ml-[-18px]">Inactivos: <span className="text-blue-500 font-bold text-[16px]">{statistics.permisos.inactivos}</span></span>
                                        </div>
                                    )}
                                </div>
                            </li>
                            <li>
                                <Link to="/dashboard/bitacora" className="text-[#1e4e9c] hover:underline block">
                                    <span className={`inline-block ${isMobile ? 'w-full' : 'min-w-[210px]'}`}>5 Bitacora de Accesos</span>
                                </Link>
                                <div className="text-sm text-gray-500 ml-4 mt-1">
                                    {loading ? (
                                        <span className="animate-pulse">Cargando...</span>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 border border-gray-200 p-2 bg-gray-200">
                                            <span>Total: <span className="text-blue-500 font-bold text-[16px]">{statistics.bitacora.total}</span></span>
                                            <span className="sm:ml-[-30px]">Abiertas: <span className="text-blue-500 font-bold text-[16px]">{statistics.bitacora.sesionesAbiertas}</span></span>
                                            <span className="sm:ml-[-18px]">Cerradas: <span className="text-blue-500 font-bold text-[16px]">{statistics.bitacora.sesionesCerradas}</span></span>
                                        </div>
                                    )}
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* Columna derecha - Tramites y Medios */}
                    <div className="w-full md:w-1/2">
                        <div className="mb-6">
                            <h3 className="text-base mb-3 text-[20px] text-gray-600">Tramites</h3>
                            <ul className="space-y-2">
                                <li>
                                    <Link to="/dashboard/tramites" className="text-[#1e4e9c] hover:underline block">
                                        <span className={`inline-block ${isMobile ? 'w-full' : 'min-w-[210px]'}`}>6 Tramites de Acceso</span>
                                    </Link>
                                    <div className="text-sm text-gray-500 ml-4 mt-1">
                                        {loading ? (
                                            <span className="animate-pulse">Cargando...</span>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 border border-gray-200 p-2 bg-gray-200 w-[86.5%]">
                                                <span>Total: <span className="text-blue-500 font-bold text-[16px]">{statistics.tramites.total}</span></span>
                                                <span className="sm:ml-[-30px]">Aprobados: <span className="text-blue-500 font-bold text-[16px]">{statistics.tramites.aprobados}</span></span>
                                                <span className="sm:ml-[-18px]">Rechazados: <span className="text-blue-500 font-bold text-[16px]">{statistics.tramites.rechazados}</span></span>
                                            </div>
                                        )}
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-base text-gray-600 mb-3 text-[20px]">Medios y Redes</h3>
                            <ul className="space-y-2">
                                <li>
                                    <Link to="/dashboard/redes-sociales" className="text-[#1e4e9c] hover:underline block">
                                        <span className={`inline-block ${isMobile ? 'w-full' : 'min-w-[210px]'}`}>7 Email y Redes Sociales</span>
                                    </Link>
                                    <div className="text-sm text-gray-500 ml-4 mt-1">
                                        {loading ? (
                                            <span className="animate-pulse">Cargando...</span>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 border border-gray-200 p-2 bg-gray-200 w-[86%]">
                                                <span>Total: <span className="text-blue-500 font-bold text-[16px]">{statistics.redesSociales.total}</span></span>
                                                <span className="sm:ml-[-30px]">Activas: <span className="text-blue-500 font-bold text-[16px]">{statistics.redesSociales.activos}</span></span>
                                                <span className="sm:ml-[-18px]">Inactivas: <span className="text-blue-500 font-bold text-[16px]">{statistics.redesSociales.inactivos}</span></span>
                                            </div>
                                        )}
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Diagrama */}
                {(user?.codeFunction === 1 || user?.codeFunction === "1") && (
                  <div className="mt-6 w-full flex">
                     
                <div className="w-[450px] h-[400px] max-w-5xl justify-start p-2 rounded-lg bg-white" id="flujo-permiso-acceso">
                    <div className="text-center text-2xl font-bold text-gray-700 mb-2">FLUJO PERMISO DE ACCESO</div>

                    <div className="flex justify-between ">
                        <div className="w-[120px] h-[70px] border border-gray-300 rounded-md flex flex-col justify-center items-center bg-white">
                            <div className="font-semibold text-center text-gray-700 text-[14px]">1 Empresas</div>
                            <div className="text-xs text-center text-gray-500">codigoentidad</div>
                        </div>
                        <div className="w-[120px] h-[70px] border border-gray-300 rounded-md flex flex-col justify-center items-center bg-white">
                            <div className="font-semibold text-center text-gray-700 text-[14px]">2 Perfil Acceso</div>
                            <div className="text-xs text-center text-gray-500">idfuncion</div>
                        </div>
                        <div className="w-[120px] h-[70px] border border-gray-300 rounded-md flex flex-col justify-center items-center bg-white">
                            <div className="font-semibold text-center text-gray-700 text-[14px]">3 Usuarios</div>
                            <div className="text-xs text-center text-gray-500">idusuario</div>
                        </div>
                    </div>

                    <div className="relative h-8 ">
                        <div className="absolute left-[60px] h-4 w-px bg-gray-400"></div>
                        <div className="absolute left-1/2 h-4 w-px bg-gray-400"></div>
                        <div className="absolute right-[60px] h-4 w-px bg-gray-400"></div>
                        <div className="absolute top-4 left-[60px] right-[60px] h-px bg-gray-400"></div>
                        <div className="absolute left-1/2 top-4 h-4 w-px bg-gray-400"></div>
                        <div className="absolute left-1/2 top-8 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-400"></div>
                    </div>

                    <div className="flex justify-center ">
                        <div className="w-[120px] h-[70px] border border-gray-300 rounded-md flex flex-col justify-center items-center bg-white">
                            <div className="font-semibold text-center text-gray-700 text-[14px]">4 Permisos</div>
                            <div className="text-xs text-center text-gray-500">regpermiso</div>
                        </div>
                    </div>

                    <div className="relative h-8"> 
                        <div className="absolute left-1/2 h-8 w-px bg-gray-400"></div>
                        <div className="absolute left-1/2 top-8 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-400"></div>
                    </div>

                    <div className="flex justify-center">
                        <div className="w-[120px] h-[70px] border border-gray-300 rounded-md flex flex-col justify-center items-center bg-white">
                            <div className="font-semibold text-center text-gray-700 text-[14px]">5 Bitácora</div>
                            <div className="text-xs text-center text-gray-500">regacceso</div>
                        </div>
                    </div>
                </div>
            
                  </div>
                )}
            </div>
        </div>
    );
};

export default ManagerSystemPage;