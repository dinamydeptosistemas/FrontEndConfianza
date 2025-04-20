import React from 'react';
import { useAuth } from '../contexts/AuthContext'; // Importar desde el contexto correcto
import { Link } from 'react-router-dom'; // Importar Link para la navegación

// Eliminar la importación de la imagen que causa error
// import diagramaFlujo from '../assets/diagrama_de_flujo_usuarios.png';

const DashboardInterno = () => {
    const { user, logout } = useAuth();

    // Datos simulados (reemplazar con datos reales si es necesario)
    const negocio = localStorage.getItem('negocio');
    const periodo = new Date().getFullYear();

    return (
        <div className="flex flex-col min-h-screen bg-gray-100 max-w-7xl mx-auto shadow-lg overflow-hidden">
            {/* Encabezado Superior */}
            <header className="bg-gray-200 px-6 py-2 flex justify-between items-center border-b border-gray-300 text-sm text-gray-700 shrink-0">
                <div className="pl-[170px]">
                    <span className="font-bold text-gray-600 mr-1">NEGOCIO:</span>
                    <span className="value">{negocio}</span>
                </div>
                <div className="flex items-center gap-5 pr-6">
                    <span className="font-bold text-gray-600 mr-1">PERIODO:</span>
                    <span className="value">{periodo}</span>
                </div>
            </header>

            {/* Contenedor Principal (Sidebar + Contenido) */}
            <div className="flex flex-grow overflow-hidden">
                {/* Barra Lateral Izquierda */}
                <aside className="w-[170px] bg-[#1e4e9c] text-white p-6 flex flex-col items-center shrink-0 overflow-y-auto">
                    <div className="text-center mb-8 mt-[-15px] shrink-0">
                        <h2 className="text-lg font-semibold mb-1">CONFIANZA 2.5</h2>
                        <p className="text-xs leading-tight font-normal">Sistema de Control de Negocios</p>
                    </div>
                    <div className="bg-gray-300 text-gray-700 px-1 py-4 text-center font-bold text-lg rounded w-[3.5cm] h-[400px] my-auto flex items-start justify-center shrink-0 pt-2.5 leading-tight">
                        <span>MODULO MANAGER SYSTEM</span>
                    </div>
                    <button 
                       
                        className="bg-[#1e4e9c] text-white border border-[#a0b4d1] px-3 py-3 font-bold rounded w-full shadow-inner mt-8 shrink-0 hover:bg-[#163a75]"  onClick={logout} 
                    > 
                        SALIR DEL MODULO
                    </button>
                </aside>

                {/* Área de Contenido Principal */}
                <main className="flex-grow bg-white p-5 px-10 overflow-y-auto">
                    {/* Controles Superiores: Usuario y Botón Cambiar */}
                    <div className="flex justify-between items-center mb-4 w-full">
                        <div className="text-sm text-gray-700 pb-0.5">
                            <span className="font-bold text-gray-600 mr-1">USER:</span>
                            <span className="value">{user?.username || 'Usuario'}</span>
                        </div>
                        <button className="bg-white border border-[#f39c12] text-[#f39c12] px-3 py-1 text-xs rounded font-bold text-center w-[83px] leading-tight transition-colors duration-200 hover:bg-[#C06500] hover:text-white hover:border-[#C06500]" onClick={logout}>
                        
                            CAMBIAR USUARIO
                        </button>
                    </div>

                    {/* Barra de Título Naranja */}
                    <div className="bg-[#f39c12] text-white px-5 py-3 mb-9">
                        <h1 className="text-xl font-bold text-left">MANAGER SYSTEM:</h1>
                    </div>

                    {/* Menú de Administración */}
                    <nav className="mb-8">
                        <ol className="list-none p-0" style={{ counterReset: 'menu-counter' }}>
                            <li className="mb-4 text-lg" style={{ counterIncrement: 'menu-counter' }}>
                                <span className="text-[#0056b3] font-bold mr-2 inline-block w-6 text-right">1</span>
                                <Link to="#" className="text-[#0056b3] underline hover:text-[#003d80]">Empresas</Link>
                            </li>
                            <li className="mb-4 text-lg" style={{ counterIncrement: 'menu-counter' }}>
                                <span className="text-[#0056b3] font-bold mr-2 inline-block w-6 text-right">2</span>
                                <Link to="#" className="text-[#0056b3] underline hover:text-[#003d80]">Configurar Perfil Acceso</Link>
                            </li>
                            <li className="mb-4 text-lg" style={{ counterIncrement: 'menu-counter' }}>
                                <span className="text-[#0056b3] font-bold mr-2 inline-block w-6 text-right">3</span>
                                <Link to="#" className="text-[#0056b3] underline hover:text-[#003d80]">Usuarios</Link>
                            </li>
                            <li className="mb-4 text-lg" style={{ counterIncrement: 'menu-counter' }}>
                                <span className="text-[#0056b3] font-bold mr-2 inline-block w-6 text-right">4</span>
                                <Link to="#" className="text-[#0056b3] underline hover:text-[#003d80]">Permisos</Link>
                            </li>
                            <li className="mb-4 text-lg" style={{ counterIncrement: 'menu-counter' }}>
                                <span className="text-[#0056b3] font-bold mr-2 inline-block w-6 text-right">5</span>
                                <Link to="#" className="text-[#0056b3] underline hover:text-[#003d80]">Bitacora de Accesos</Link>
                            </li>
                        </ol>
                    </nav>

                    {/* Imagen del Diagrama - Usando una URL relativa en lugar de importar */}
                    <img src="/diagrama_de_flujo_usuarios.png" alt="Diagrama de flujo de usuarios y permisos" className="block mx-auto max-w-full h-auto mt-4" />
                </main>
            </div>
        </div>
    );
};

export default DashboardInterno; 