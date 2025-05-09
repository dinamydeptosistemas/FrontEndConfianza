import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ManagerSystemPage = () => {
    const { user } = useAuth();
    return (
        <div className="w-full">
            {/* Manager System Title */}
 

            {/* Main content */}
            <div className="p-10">
                <div className="flex mb-6">
                    {/* Columna izquierda - Accesos */}
                    <div className="w-1/2 pr-8">
                        <h3 className="text-base font-semibold mb-3">Accesos</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/dashboard/empresas" className="text-[#1e4e9c] hover:underline block">
                                    1 Empresas
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard/perfil-acceso" className="text-[#1e4e9c] hover:underline block">
                                    2 Configurar Perfil Acceso
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard/usuarios" className="text-[#1e4e9c] hover:underline block">
                                    3 Usuarios
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard/permisos" className="text-[#1e4e9c] hover:underline block">
                                    4 Permisos
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard/bitacora" className="text-[#1e4e9c] hover:underline block">
                                    5 Bitacora de Accesos
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Columna derecha - Tramites y Medios */}
                    <div className="w-1/2">
                        <div className="mb-6">
                            <h3 className="text-base font-semibold mb-3">Tramites</h3>
                            <ul className="space-y-2">
                                <li>
                                    <Link to="/dashboard/tramites" className="text-[#1e4e9c] hover:underline block">
                                        6 Tramites de Acceso
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-base font-semibold mb-3">Medios y Redes</h3>
                            <ul className="space-y-2">
                                <li>
                                    <Link to="/dashboard/email-redes" className="text-[#1e4e9c] hover:underline block">
                                        7 Email y Redes Sociales
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Diagrama */}
                {(user?.codeFunction === 1 || user?.codeFunction === "1") && (
                  <div className="mt-6 mb-8">
                      <img 
                          src="/diagrama_de_flujo_usuarios.png" 
                          alt="Diagrama de flujo"
                          style={{ maxWidth: '377px', width: '100%', height: '270px' }}
                      />
                  </div>
                )}
            </div>
        </div>
    );
};

export default ManagerSystemPage;