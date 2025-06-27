import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Layout especializado para las páginas de gestión (empresa, usuario, perfil, permisos).
 * Incluye cabecera, barra de usuario, y espacio para el contenido principal.
 */
function ManagementDashboardLayout({ title, user, negocio, children }) {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-100 px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16">
      <div className="w-full shadow-lg">
        {/* Header superior */}
        <div className="bg-[#e9e9e9] py-2 px-1.5 md:px-1 lg:px-2 xl:px-4 2xl:px-4 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#ccc] text-sm w-full">
          <div className="flex items-center mb-2 sm:mb-0 pl-7">
            <span className="font-bold text-[#7a7a7a] text-sm sm:text-[14px] mr-1">EMPRESA:</span>
            <span className="text-[#444444] text-sm sm:text-[14px] truncate">
              {negocio?.nombre?.toUpperCase() || 'NO DEFINIDO'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#7a7a7a] text-sm sm:text-[14px]">PERIODO:</span>
            <span className="text-[#444444] text-sm sm:text-[14px]">2025</span>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="bg-white rounded-b-xl text-justify pt-5">
          {/* Barra de usuario */}
          <div className="w-full py-2">
            <div className="w-full flex flex-row justify-between items-center px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16">
              <div className="flex items-center h-10">
                <span className="font-bold text-[#7a7a7a] text-sm sm:text-base">USER:</span>
                <span className="text-[#7a7a7a] text-sm sm:text-base ml-1 truncate">
                  {user?.Username?.toUpperCase() || user?.NombreCompleto?.toUpperCase() || 'USUARIO'}
                </span>
              </div>
              <button 
                className="border border-orange-500 text-orange-500 px-6 h-9 text-xs sm:text-sm font-bold rounded bg-white hover:bg-orange-50 transition-colors" 
                onClick={() => navigate('/dashboard-internal')}
              >
                SALIR
              </button>
            </div>
            
            {/* Menú de navegación */}
            <div className="w-full">
              <div className="flex flex-wrap gap-2 px-8 py-2">
                <button 
                  className={`w-[125px] h-[30px] hover:bg-[#1e4e9c] hover:text-white border border-gray-300 text-gray-600 text-sm rounded-md flex items-center justify-center transition-colors duration-200 flex-shrink-0 ${
                    location.pathname === '/dashboard/empresas' 
                      ? 'bg-[#1e4e9c] text-white border-blue-600' 
                      : 'bg-white'
                  }`}    
                  onClick={() => navigate('/dashboard/empresas')}
                >
                  Empresa
                </button>
                <button  
                  className={`w-[125px] h-[30px] hover:bg-[#1e4e9c] hover:text-white border border-gray-300 text-gray-600 text-sm rounded-md flex items-center justify-center transition-colors duration-200 flex-shrink-0 ${
                    location.pathname === '/dashboard/perfil-acceso' 
                      ? 'bg-[#1e4e9c] text-white border-[#1e4e9c]' 
                      : 'bg-white'
                  }`}
                  onClick={() => navigate('/dashboard/perfil-acceso')}
                >
                  Perfil Acceso
                </button>
                <button
                  className={`w-[125px] h-[30px] hover:bg-[#1e4e9c] hover:text-white border border-gray-300 text-gray-600 text-sm rounded-md flex items-center justify-center transition-colors duration-200 flex-shrink-0 ${
                    location.pathname === '/dashboard/usuarios' 
                      ? 'bg-[#1e4e9c] text-white border-[#1e4e9c]' 
                      : 'bg-white'
                  }`}
                  onClick={() => navigate('/dashboard/usuarios')}
                >
                  Usuario
                </button>
                <button
                  className={`w-[125px] h-[30px] hover:bg-[#1e4e9c] hover:text-white border border-gray-300 text-gray-600 text-sm rounded-md flex items-center justify-center transition-colors duration-200 flex-shrink-0 ${
                    location.pathname === '/dashboard/permisos' 
                      ? 'bg-[#1e4e9c] text-white border-[#1e4e9c]' 
                      : 'bg-white'
                  }`}
                  onClick={() => navigate('/dashboard/permisos')}
                >
                  Permisos
                </button>
                <button
                  className={`w-[125px] h-[30px] hover:bg-[#1e4e9c] hover:text-white border border-gray-300 text-gray-600 text-sm rounded-md flex items-center justify-center transition-colors duration-200 flex-shrink-0 ${
                    location.pathname === '/dashboard/bitacora' 
                      ? 'bg-[#1e4e9c] text-white border-[#1e4e9c]' 
                      : 'bg-white'
                  }`}
                  onClick={() => navigate('/dashboard/bitacora')}
                >
                  Bitácora
                </button>
                <button
                  className={`w-[125px] h-[30px] hover:bg-[#1e4e9c] hover:text-white border border-gray-300 text-gray-600 text-sm rounded-md flex items-center justify-center transition-colors duration-200 flex-shrink-0 ${
                    location.pathname === '/dashboard/usuarios-activos' 
                      ? 'bg-[#1e4e9c] text-white border-[#1e4e9c]' 
                      : 'bg-white'
                  }`}
                  onClick={() => navigate('/dashboard/usuarios-activos')}
                >
                  Usuarios Activos
                </button>
              </div>
            </div>
          </div>

          {/* Área de contenido */}
          <div className="flex-1 flex flex-col items-center bg-[#f8f9fb] pt-5">
            <div className="w-full px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8">
              <div className="flex justify-between bg-[#1e4e9c] w-full">
                <div className="w-full py-1 px-4 h-[50px] flex items-center">
                  <h2 className="text-lg font-bold text-white"> 
                    <span className="text-base ml-2 text-[1.1rem]">
                      {title}
                    </span>
                  </h2>
                </div>
              </div>
              <div className="w-full mt-1 sm:mt-2">
                {children}
              </div>
            </div>
          </div>
          {/* Sombreado lateral izquierdo */}
          <div className="hidden xl:block fixed left-0 top-0 h-full w-12 bg-gradient-to-r from-black/5 to-transparent pointer-events-none" />
          {/* Sombreado lateral derecho */}
          <div className="hidden xl:block fixed right-0 top-0 h-full w-12 bg-gradient-to-l from-black/5 to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
}

export default ManagementDashboardLayout;
