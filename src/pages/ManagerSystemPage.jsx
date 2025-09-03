import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useMenuStatistics } from '../hooks/useMenuStatistics';
import { countTestData } from '../services/DataCleanup/DataCleanupService';
import { useConfirmarEliminacion } from '../components/common/ConfirmEliminarModal';
import DataManagementModal from '../components/DataManagementModal';

const ManagerSystemPage = () => {
    const { user } = useAuth();
    const { statistics, loading } = useMenuStatistics();
    const [testDataCount, setTestDataCount] = useState(0);
    const { ConfirmDialog } = useConfirmarEliminacion();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchTestDataCount = useCallback(async () => {
        if (user?.codeFunction === 1 || user?.codeFunction === "1") {
            try {
                const data = await countTestData();
                setTestDataCount(data.count || 0);
            } catch (error) {
                console.error("Error al obtener contador de datos de prueba:", error);
                setTestDataCount(0);
            }
        }
    }, [user]);

    useEffect(() => {
        fetchTestDataCount();
    }, [fetchTestDataCount]);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const accessItems = [
        { to: "/dashboard/empresas", title: "1 Empresas", stats: statistics.empresas, fields: { total: 'Total', activos: 'Activas', inactivos: 'Inactivas' } },
        { to: "/dashboard/perfil-acceso", title: "2 Configurar Perfil Acceso", stats: statistics.perfiles, fields: { total: 'Total', profilesWithGrantPermissions: 'Dan Permisos', profilesWithAllModules: 'Todos Módulos' } },
        { to: "/dashboard/usuarios", title: "3 Usuarios", stats: statistics.usuarios, fields: { total: 'Total', internos: 'Internos', externos: 'Externos' } },
        { to: "/dashboard/permisos", title: "4 Permisos", stats: statistics.permisos, fields: { total: 'Total', activos: 'Activos', inactivos: 'Inactivos' } },
        { to: "/dashboard/bitacora", title: "5 Bitacora de Accesos", stats: statistics.bitacora, fields: { total: 'Total', sesionesAbiertas: 'Abiertas', sesionesCerradas: 'Cerradas' } }
    ];

    const mediaItems = [
        { to: "/dashboard/tramites", title: "6 Trámites", stats: statistics.tramites, fields: { total: 'Total', aprobados: 'Aprobados', rechazados: 'Rechazados' } },
        { to: "/dashboard/redes-sociales", title: "7 Email y Redes Sociales", stats: statistics.redesSociales, fields: { total: 'Total', activos: 'Activas', inactivos: 'Inactivas' } }
    ];

    const StatDisplay = ({ stats, fields }) => (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 border border-gray-200 py-[7px] px-[16px] bg-gray-200">
            {Object.entries(fields).map(([field, label], index) => {
                const value = stats ? stats[field] : 0;
                const marginClass = index === 1 ? 'sm:ml-[-30px]' : index === 2 ? 'sm:ml-[-18px]' : '';

                return (
                    <span key={field} className={`flex justify-start ${marginClass}`}>
                        {label}: <span className="text-blue-500 font-bold text-[16px] ml-1">{value}</span>
                    </span>
                );
            })}
        </div>
    );

    return (
        <div className="h-100vh" style={{ overflow: 'hidden' }}>
            <div className="p-4">
                <ConfirmDialog />
                {isModalOpen && <DataManagementModal onClose={closeModal} onDataCleaned={fetchTestDataCount} />}

                <div className="relative text-lg w-100 h-full">
                    <div className="flex flex-col md:flex-row mb-6">
                        {/* Columna izquierda - Accesos */}
                        <div className="w-full md:w-1/2  md:pr-4 mb-6 md:mb-0">
                            <h2 className="text-xl text-gray-700 mb-4 font-semibold">Accesos</h2>
                            <ul className="space-y-2">
                                {accessItems.map((item, index) => (
                                    <li key={index}>
                                        <Link to={item.to} className="text-[#1e4e9c] hover:underline block">
                                            <span className="inline-block w-full">{item.title}</span>
                                        </Link>
                                        <div className="text-sm text-gray-500 mt-1">
                                            {loading ? (
                                                <span className="animate-pulse">Cargando...</span>
                                            ) : (
                                                <StatDisplay stats={item.stats} fields={item.fields} />
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Columna derecha - Medios y Redes */}
                        <div className="w-full md:w-1/2 md:pl-5 md:ml-8">
                            <div className="mb-6">
                                <h3 className="text-xl text-gray-700 mb-4 font-semibold">Trámites Medios y Redes</h3>
                                <ul className="space-y-2">
                                    {mediaItems.map((item, index) => (
                                         <li key={index}>
                                            <Link to={item.to} className="text-[#1e4e9c] hover:underline block">
                                                <span className="inline-block w-full">{item.title}</span>
                                            </Link>
                                            <div className="text-sm text-gray-500 mt-1">
                                                {loading ? (
                                                    <span className="animate-pulse">Cargando...</span>
                                                ) : (
                                                    <StatDisplay stats={item.stats} fields={item.fields} />
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* "Registros de Prueba" block */}
                    {(user?.codeFunction === 1 || user?.codeFunction === "1") && (
                      <div className="bg-white border border-gray-200  shadow-sm p-4 w-full mt-5">
                        <div className="flex flex-row items-center justify-end w-full space-x-2">
                          <span className="text-sm -mt-5 font-normal text-gray-700">Registros de Prueba:</span>
                          <div className="flex flex-col items-center ">
                            <div className="w-10 h-5 bg-blue-600 text-white  flex items-center justify-center">
                              <span className="text-sm font-bold">{testDataCount}</span>
                            </div>
                            <button
                              onClick={openModal}
                              disabled={testDataCount === 0}
                              className="w-10 h-4 bg-gray-200 hover:bg-gray-200  flex items-center justify-center transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed text-xs"
                            >
                              <span className="text-xs font-semibold text-gray-700">...</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Flow diagram */}
                    {(user?.codeFunction === 1 || user?.codeFunction === "1") && (
                        <div className="mt-6 w-full flex">
                            <div className="w-[450px] h-[400px] max-w-5xl justify-start p-2 rounded-lg bg-white" id="flujo-permiso-acceso">
                                <div className="text-center text-2xl font-bold text-gray-700 mb-2">FLUJO PERMISO DE ACCESO</div>

                                <div className="flex justify-between">
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

                                <div className="relative h-8">
                                    <div className="absolute left-[60px] h-4 w-px bg-gray-400"></div>
                                    <div className="absolute left-1/2 h-4 w-px bg-gray-400"></div>
                                    <div className="absolute right-[60px] h-4 w-px bg-gray-400"></div>
                                    <div className="absolute top-4 left-[60px] right-[60px] h-px bg-gray-400"></div>
                                    <div className="absolute left-1/2 top-4 h-4 w-px bg-gray-400"></div>
                                    <div className="absolute left-1/2 top-8 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-400"></div>
                                </div>

                                <div className="flex justify-center">
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
        </div>
    );
};

export default ManagerSystemPage;
