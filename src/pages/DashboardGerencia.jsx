import React from 'react';
import { Link } from 'react-router-dom';

const DashboardGerencia = () => {
    return (
        <div className="w-full">
            {/* Main content */}
            <div className="p-10">
                <div className="flex mb-6">
                    {/* Lista única de opciones */}
                    <div className="w-1/2 pr-8">
                        <ul className="space-y-2">
                            <li>
                                <Link to="/dashboard/gerencia/usuarios" className="text-[#1e4e9c] hover:underline block">
                                    1 Usuarios y Permisos
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard/gerencia/configuracion-inicial" className="text-[#1e4e9c] hover:underline block">
                                    2 Configuracion Inicial
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard/gerencia/configuracion-general" className="text-[#1e4e9c] hover:underline block">
                                    3 Configuracion General
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard/gerencia/correccion-errores" className="text-[#1e4e9c] hover:underline block">
                                    4 Correccion de Errores
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard/gerencia/reportes" className="text-[#1e4e9c] hover:underline block">
                                    5 Reportes
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Diagrama */}
                <div className="mt-6 mb-8">
                    <img 
                        src="/diagrama_gerencial.png" 
                        alt="Diagrama gerencial"
                        style={{ maxWidth: '377px', width: '100%', height: '270px' }}
                    />
                </div>
            </div>
        </div>
    );
};

export default DashboardGerencia; 