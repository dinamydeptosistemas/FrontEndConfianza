import React, { useEffect, useState, useCallback, useRef } from 'react';
import { 
  getUsers, 
  putUser, 
  deleteUser,
  uploadTemplate,
  downloadTemplate
} from '../../services/user/UserService';
import ManagementDashboardLayout from '../../layouts/ManagementDashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import ButtonGroup from '../../components/common/ButtonGroup';
import ConfirmEliminarModal from '../../components/common/ConfirmEliminarModal';
import SearchBar from '../../components/common/SearchBar';
import GenericTable from '../../components/common/GenericTable';
import UsuarioModal from '../../components/users/UsuarioModal';
import Paginador from '../../components/common/Paginador';
import { useNotification } from '../../context/NotificationContext';
import FilterModal from '../../components/common/FilterModal';


export default function UsuarioDashboard() {
    const { user, negocio } = useAuth();
    const { showSuccessMessage, showErrorMessage } = useNotification();
    const [usuariosOriginales, setUsuariosOriginales] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [filtroActivo, setFiltroActivo] = useState('');
    const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [usuarioAEditar, setUsuarioAEditar] = useState(null);
    const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
    const [mostrarModalCreacion, setMostrarModalCreacion] = useState(false);
    const [paginaActual, setPaginaActual] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [mostrarModalFiltros, setMostrarModalFiltros] = useState(false);
    const [mostrarModalSubirPlantilla, setMostrarModalSubirPlantilla] = useState(false);
    const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
    const [mostrarConfirmacionActualizacion, setMostrarConfirmacionActualizacion] = useState(false);
    const [filtros, setFiltros] = useState({});
    const [showPlantillaMenu, setShowPlantillaMenu] = useState(false);
    const plantillaMenuRef = useRef(null);
    // Estados para totales dinámicos
    const [totalRegistros, setTotalRegistros] = useState(0);
    const [totalInternos, setTotalInternos] = useState(0);
    const [totalExternos, setTotalExternos] = useState(0);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (plantillaMenuRef.current && !plantillaMenuRef.current.contains(event.target)) {
                setShowPlantillaMenu(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Función para descargar un archivo desde un Blob
    const descargarArchivo = (blob, nombreArchivo) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nombreArchivo || 'usuarios.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    };


    const downloadExcel = async () => {
        try {
            console.log('Iniciando descarga de Excel con filtros:', filtros);
            const blob = await downloadTemplate({
                process: 'getUsers',
                page: 0, // Para obtener todos los registros
                ...filtros
            });
            
            // Verificar si el blob es válido
            if (!blob || !(blob instanceof Blob)) {
                throw new Error('El archivo recibido no es válido');
            }
            
            // Verificar el tamaño del blob
            if (blob.size === 0) {
                throw new Error('El archivo recibido está vacío');
            }
            
            descargarArchivo(blob, `usuarios_exportacion_${new Date().toISOString().split('T')[0]}.xlsx`);
            showSuccessMessage('Archivo Excel generado exitosamente');
        } catch (error) {
            console.error('Error al generar Excel:', {
                message: error.message,
                name: error.name,
                stack: error.stack,
                originalError: error.originalError || null
            });
            
            // Mostrar mensaje de error más descriptivo
            const errorMessage = error.message.includes('No autorizado')
                ? 'Su sesión ha expirado. Por favor, inicie sesión nuevamente.'
                : error.message.includes('conectar con el servidor')
                    ? 'No se pudo conectar con el servidor. Verifique su conexión a internet.'
                    : `Error al generar el archivo Excel: ${error.message}`;
            
            showErrorMessage(errorMessage);
        }
    };

    const confirmarSubirPlantilla = async (esActualizacion) => {
    setMostrarConfirmacionActualizacion(false);
    
    try {
      // Si es una descarga de plantilla
      if (esActualizacion === undefined) {
        const blob = await downloadTemplate({
          process: 'template',
          page: 0
        });
        if (blob) {
          descargarArchivo(blob, 'plantilla_usuarios.xlsx');
          showSuccessMessage('Plantilla descargada exitosamente');
        }
        return;
      }
      const formData = new FormData();
      formData.append('Archivo', archivoSeleccionado);
      formData.append('EsActualizacion', esActualizacion);
      
      // Mostrar mensaje de carga
      showSuccessMessage(esActualizacion 
        ? 'Actualizando registros existentes...' 
        : 'Creando nuevos registros...');
      
      // Subir el archivo y esperar la respuesta
      const response = await uploadTemplate(formData);
      
      // Mostrar mensaje de éxito basado en la respuesta del servidor
      if (response && response.message) {
        showSuccessMessage(response.message);
      } else if (response && response.error) {
        throw new Error(response.error);
      } else {
        showSuccessMessage(esActualizacion 
          ? 'Registros actualizados correctamente' 
          : 'Registros creados correctamente');
      }
      
      // Cerrar el modal y limpiar el estado
      setMostrarModalSubirPlantilla(false);
      setArchivoSeleccionado(null);
      
      // Recargar usuarios después de subir la plantilla
      cargarUsuarios(paginaActual, busqueda, filtros);
    } catch (error) {
      console.error('Error al subir plantilla:', error);
      showErrorMessage(error.message || 'Error al procesar el archivo');
    }
    };

    const cargarUsuarios = useCallback(async (pagina = 1, filtroBusqueda = '', filtrosAdicionales = {}) => {
        // Preparar los parámetros para la llamada a la API
        const params = {
            page: pagina
        };
        
        // Agregar término de búsqueda si existe
        if (filtroBusqueda) {
            params.searchTerm = filtroBusqueda;
        }
        
        // Agregar filtros adicionales a los parámetros
        if (filtrosAdicionales) {
            console.log('Aplicando filtros adicionales:', filtrosAdicionales);
            
            // Verificar y aplicar cada filtro específico usando los nombres originales
            if (filtrosAdicionales.fechaRegistroDesde) {
                params.fechaRegistroDesde = filtrosAdicionales.fechaRegistroDesde;
                console.log('Aplicando filtro fechaRegistroDesde:', filtrosAdicionales.fechaRegistroDesde);
            }
            
            if (filtrosAdicionales.fechaRegistroHasta) {
                params.fechaRegistroHasta = filtrosAdicionales.fechaRegistroHasta;
                console.log('Aplicando filtro fechaRegistroHasta:', filtrosAdicionales.fechaRegistroHasta);
            }
            
            if (filtrosAdicionales.usuarioActivoFiltro !== undefined) {
                params.usuarioActivoFiltro = filtrosAdicionales.usuarioActivoFiltro;
                console.log('Aplicando filtro usuarioActivoFiltro:', filtrosAdicionales.usuarioActivoFiltro);
            }
            
            if (filtrosAdicionales.tipoUserFiltro) {
                params.tipoUserFiltro = filtrosAdicionales.tipoUserFiltro;
                console.log('Aplicando filtro tipoUserFiltro:', filtrosAdicionales.tipoUserFiltro);
            }
            
            if (filtrosAdicionales.relacionUsuarioFiltro) {
                params.relacionUsuarioFiltro = filtrosAdicionales.relacionUsuarioFiltro;
                console.log('Aplicando filtro relacionUsuarioFiltro:', filtrosAdicionales.relacionUsuarioFiltro);
            }
            
            // Agregar otros filtros que puedan existir
            Object.entries(filtrosAdicionales).forEach(([key, value]) => {
                if (!['fechaRegistroDesde', 'fechaRegistroHasta', 'usuarioActivoFiltro', 
                     'tipoUserFiltro', 'relacionUsuarioFiltro'].includes(key) && 
                    value !== undefined && value !== null && value !== '') {
                    params[key] = value;
                    console.log(`Aplicando filtro adicional ${key}:`, value);
                }
            });
        }
        
        console.log('Parámetros para la API:', params);
        
        try {
            const data = await getUsers(params);
            console.log('Datos recibidos de la API:', data);
            // Actualizar los totales desde la respuesta del servicio
            setTotalRegistros(data.totalRecords || 0);
            setTotalInternos(data.totalInternos || 0);
            setTotalExternos(data.totalExternos || 0);
            setUsuariosOriginales(data.users || []);
            setUsuarios(data.users || []);
            setPaginaActual(pagina);
            setTotalPaginas(data.totalPages || 1);
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            alert('Error al cargar usuarios');
        }
    }, []);

    // Estado para controlar si ya se cargaron los usuarios inicialmente
    const [cargaInicialRealizada, setCargaInicialRealizada] = useState(false);
    
    useEffect(() => {
        if (!cargaInicialRealizada) {
            console.log('Iniciando carga inicial de usuarios');
            cargarUsuarios(1, '', filtros);
            setCargaInicialRealizada(true);
        }
    }, [cargarUsuarios, cargaInicialRealizada, filtros]);

    const buscarEnUsuarios = (usuariosArr, filtro) => {
        if (!filtro) return usuariosArr;
        return usuariosArr.filter(u =>
            (u.nombreUser && u.nombreUser.toLowerCase().includes(filtro.toLowerCase())) ||
            (u.apellidosUser && u.apellidosUser.toLowerCase().includes(filtro.toLowerCase())) ||
            (u.username && u.username.toLowerCase().includes(filtro.toLowerCase())) ||
            (u.emailUsuario && u.emailUsuario.toLowerCase().includes(filtro.toLowerCase())) ||
            (u.identificacion && u.identificacion.toLowerCase().includes(filtro.toLowerCase()))
        );
    };

    const handleBuscar = (valor) => {
        setFiltroActivo(valor);
        const filtrados = buscarEnUsuarios(usuariosOriginales, valor);
        setUsuarios(filtrados);
    };

    const handleClearSearch = () => {
        setFiltroActivo('');
        setBusqueda('');
        setUsuarios(usuariosOriginales);
    };

    const handleEliminar = (usuario) => {
        setUsuarioAEliminar(usuario);
        setMostrarModal(true);
    };

    const handleConfirmarEliminar = async () => {
        if (!usuarioAEliminar) return;
        try {
            const userId = usuarioAEliminar.IdUser || usuarioAEliminar.idUser;
            await deleteUser(userId);
            showSuccessMessage('Usuario eliminado correctamente');
            cargarUsuarios(paginaActual, filtroActivo, filtros);
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            showErrorMessage(error.message || 'Error al eliminar usuario');
        } finally {
            setUsuarioAEliminar(null);
            setMostrarModal(false);
        }
    };

    const handleCancelarEliminar = () => {
        setUsuarioAEliminar(null);
        setMostrarModal(false);
    };

    const handleEditar = (usuario) => {
        setUsuarioAEditar(usuario);
        setMostrarModalEdicion(true);
    };

    const handleSaveUsuario = async (nuevoUsuario) => {
        try {
            await putUser(nuevoUsuario);
            showSuccessMessage('Usuario guardado exitosamente');
            setMostrarModalCreacion(false);
            setMostrarModalEdicion(false);
            cargarUsuarios(paginaActual, filtroActivo, filtros);
        } catch (error) {
            console.error('Error al guardar usuario:', error);
            showErrorMessage(error.message || 'Error al guardar usuario');
        }
    };


    return (
        <ManagementDashboardLayout title={(
        <>
          <span className="font-bold">USUARIOS:</span>
          {filtros.tipoUserFiltro === 'INTERNO' ? (
            <span className="font-light ml-5 text-[16px]">{`${totalInternos} Internos`}</span>
          ) : filtros.tipoUserFiltro === 'EXTERNO' ? (
            <span className="font-light ml-5 text-[16px]">{`${totalExternos} Externos`}</span>
          ) : (
            <span className="font-light ml-5 text-[16px]">{`${totalRegistros} Totales`}</span>
          )}
        </>
      )} user={user} negocio={negocio}>
            <div className="bg-white border-b border-l border-r border-gray-300 rounded-b p-4">

                <div className="grid grid-cols-3 items-center gap-2 mb-4 min-h-[48px]">
          <div className="flex gap-2">
            <ButtonGroup
              buttons={[{
                label: 'Nuevo',
                onClick: () => setMostrarModalCreacion(true),
                variant: 'normal',
                className: 'bg-white border-[#1e4e9c] border px-8 py-1 font-bold hover:text-white hover:bg-[#1e4e9c]'
              }]}
            />
            <button
              onClick={() => setMostrarModalFiltros(true)}
              className="flex items-center text-[#1e4e9c]  gap-1 bg-white border-[#1e4e9c] border px-4 py-1 font-bold hover:text-white hover:bg-[#1e4e9c] rounded"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              
              {Object.keys(filtros).length > 0 && (
                <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {Object.keys(filtros).length}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                // Usar los datos ya filtrados del estado
                const columnMappings = {
                  'idUser': 'ID',
                  'nombreUser': 'Nombre',
                  'apellidosUser': 'Apellidos',
                  'username': 'Username',
                  'emailUsuario': 'Email',
                  'identificacion': 'Identificación',
                  'tipoUser': 'Tipo de Usuario',
                  'relacionUsuario': 'Relación',
                  'fechaRegistro': 'Fecha de Registro',
                  'usuarioActivo': 'Estado'
                };
                // Usar directamente los usuarios filtrados del estado
                console.log("Usuarios enviados a Excel:", usuarios);
                if (usuarios.length > 0) {
                  console.log("Primer usuario:", usuarios[0]);
                }
                downloadExcel(usuarios, columnMappings, 'Usuarios', 'usuarios');
              }}
              className="flex items-center gap-1 bg-white font-bold hover:text-white hover:bg-[#1e4e9c] rounded"
            >
              <div className="relative" ref={plantillaMenuRef}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPlantillaMenu(!showPlantillaMenu);
                  }}
                  className="flex items-center gap-1 bg-white border border-[#1e4e9c] text-[#1e4e9c] px-2 py-2 font-bold hover:text-white hover:bg-[#1e4e9c] rounded"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 11-2 0V4H5v11h4a1 1 0 110 2H4a1 1 0 01-1-1V3zm7 4a1 1 0 011-1h5a1 1 0 011 1v5a1 1 0 01-1 1h-5a1 1 0 01-1-1V7z" clipRule="evenodd" />
                  </svg>
                  Plantilla
                </button>

                {showPlantillaMenu && (
                  <div className="absolute right-0 mt-1 w-64 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                    <div className="py-1">
                      {/* Botón para descargar plantilla vacía */}
                      <button
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowPlantillaMenu(false);
                          try {
                            const blob = await downloadTemplate({
                              process: 'getUsers',
                              page: 0 // Página 0 para plantilla vacía
                            });
                            
                            if (!blob || !(blob instanceof Blob)) {
                              throw new Error('El archivo recibido no es válido');
                            }
                            
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'plantilla_usuarios.xlsx';
                            document.body.appendChild(a);
                            a.click();
                            window.URL.revokeObjectURL(url);
                            a.remove();
                            
                            showSuccessMessage('Plantilla descargada exitosamente');
                          } catch (error) {
                            console.error('Error al descargar la plantilla:', error);
                            showErrorMessage(error.message || 'Error al descargar la plantilla');
                          }
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      >
                        Descargar Plantilla (vacía)
                      </button>
                      
                      {/* Botón para subir plantilla */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setMostrarModalSubirPlantilla(true);
                          setShowPlantillaMenu(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      >
                        Subir Plantilla
                      </button>
                      
                      
                      
                      {/* Botón para exportar datos */}
                      <button
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          try {
                            const blob = await downloadTemplate({
                              process: 'export',
                              ...filtros
                            });
                            if (blob) {
                              descargarArchivo(blob, `usuarios_exportacion_${new Date().toISOString().split('T')[0]}.xlsx`);
                              showSuccessMessage('Exportación completada exitosamente');
                            }
                          } catch (error) {
                            console.error('Error al exportar datos:', error);
                            showErrorMessage('Error al exportar los datos');
                          }
                          setShowPlantillaMenu(false);
                        }}
                        className="block w-full  text-sm text-left px-4 py-2  text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      >
                        Actualizar Plantilla (descargar)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </button>
          </div>
          <div className="flex justify-center">
            <Paginador
              paginaActual={paginaActual}
              totalPaginas={totalPaginas}
              onPageChange={(pagina) => cargarUsuarios(pagina, filtroActivo, filtros)}
            />
          </div>
          <div className='flex justify-end items-center gap-2'>
            {filtroActivo && (
              <span className="bg-gray-200 px-2 py-1 rounded flex items-center ml-4">
                {filtroActivo}
                <button
                  onClick={() => handleClearSearch()}
                  className="ml-1 text-red-500 hover:text-red-700 font-bold"
                  aria-label="Limpiar búsqueda"
                  style={{ fontSize: '1.1em', lineHeight: 1 }}
                >
                  ×
                </button>
              </span>
            )}
            <SearchBar
              onSearch={handleBuscar}
              value={busqueda}
              onChange={setBusqueda}
              placeholder="Buscar por Apellido, Username..."
              className="w-[300px]"
              debounceTime={300}
            />
          </div>
        </div>
                <div className="mb-4 overflow-x-auto">
                    <GenericTable
                        columns={[
                            { key: 'idUser', label: 'ID', render: (row) => row.idUser || row.IdUser },
                            { key: 'nombreUser', label: 'Nombre', render: (row) => row.nombreUser || row.NombreUser },
                            { key: 'apellidosUser', label: 'Apellidos', render: (row) => row.apellidosUser || row.ApellidosUser },
                            { key: 'identificacion', label: 'Identificación', render: (row) => row.identificacion || row.Identificacion },
                            {
                                key: 'relacionUsuario',
                                label: 'Relación',
                                render: (row) => {
                                    const relacion = row.relacionUsuario || row.RelacionUsuario;
                                    return (
                                        <span className={`px-2 py-1 rounded-full text-xs ${relacion === 'EMPLEADO' ? 'text-blue-800' : 'bg-white'}`}>
                                            {relacion || 'N/A'}
                                        </span>
                                    );
                                }
                            },
                            { key: 'tipoUser', label: 'Tipo', render: (row) => row.tipoUser || row.TipoUser },
                            { key: 'username', label: 'Usuario', render: (row) => row.username || row.Username },
                            { key: 'emailUsuario', label: 'Email', render: (row) => row.emailUsuario || row.EmailUsuario },
                            {
                                key: 'usuarioActivo',
                                label: 'Estado',
                                render: (row) => {
                                    const isActive = row.usuarioActivo !== undefined ? row.usuarioActivo : row.UsuarioActivo;
                                    return (
                                        <span className={`px-2 py-1 rounded-full text-xs ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {isActive ? 'Activo' : 'Inactivo'}
                                        </span>
                                    );
                                }
                            }
                        ]}
                        data={usuarios}
                        rowKey={(row) => row.idUser || row.IdUser}
                        actions={true}
                        onEdit={handleEditar}
                        onDelete={handleEliminar}
                    />
                </div>

                <ConfirmEliminarModal
                    isOpen={mostrarModal}
                    onConfirm={handleConfirmarEliminar}
                    onCancel={handleCancelarEliminar}
                    mensaje={`¿Está seguro de eliminar al usuario ${(usuarioAEliminar?.nombreUser || usuarioAEliminar?.NombreUser) ?? ''} ${(usuarioAEliminar?.apellidosUser || usuarioAEliminar?.ApellidosUser) ?? ''}?`}
                />

                {mostrarModalEdicion && (
                    <UsuarioModal
                        isOpen={true}
                        onClose={() => {
                            setMostrarModalEdicion(false);
                            setUsuarioAEditar(null);
                        }}
                        onSave={handleSaveUsuario}
                        usuario={usuarioAEditar}
                        isEditing={true}
                    />
                )}

                {mostrarModalCreacion && (
                    <UsuarioModal
                        isOpen={true}
                        onClose={() => setMostrarModalCreacion(false)}
                        onSave={handleSaveUsuario}
                        isEditing={false}
                    />
                )}

                {/* El componente de notificación ahora es manejado por el NotificationContext */}
                
                {/* Modal de Filtros */}
                <FilterModal
                    isOpen={mostrarModalFiltros}
                    onClose={() => setMostrarModalFiltros(false)}
                    onApplyFilters={(filtrosAplicados) => {
                        console.log('Filtros recibidos del modal:', filtrosAplicados);
                        
                        // Crear una copia de los filtros aplicados y limpiar valores vacíos
                        const filtrosModificados = {};
                        
                        // Mapear los nombres de los campos de fecha al formato esperado por la API
                        if (filtrosAplicados.fechaDesde) {
                            // Usar el parámetro 'fechaRegistroDesde' como espera el backend
                            filtrosModificados.fechaRegistroDesde = filtrosAplicados.fechaDesde;
                            console.log('Fecha desde seleccionada:', filtrosAplicados.fechaDesde);
                        }
                        
                        if (filtrosAplicados.fechaHasta) {
                            // Usar el parámetro 'fechaRegistroHasta' como espera el backend
                            filtrosModificados.fechaRegistroHasta = filtrosAplicados.fechaHasta;
                            console.log('Fecha hasta seleccionada:', filtrosAplicados.fechaHasta);
                        }
                        
                        // Procesar los filtros de usuario activo/inactivo
                        if (filtrosAplicados.usuarioActivo) {
                            // Usar el parámetro 'usuarioActivoFiltro' como espera el backend
                            filtrosModificados.usuarioActivoFiltro = true;
                            console.log('Filtro usuarioActivoFiltro:', true);
                        } else if (filtrosAplicados.usuarioInactivo) {
                            // Usar el parámetro 'usuarioActivoFiltro' como espera el backend
                            filtrosModificados.usuarioActivoFiltro = false;
                            console.log('Filtro usuarioActivoFiltro:', false);
                        }
                        
                        // Pasar directamente los filtros de tipo de usuario y relación
                        if (filtrosAplicados.tipoUser !== undefined && filtrosAplicados.tipoUser !== null && filtrosAplicados.tipoUser !== '') {
                            // Usar el parámetro 'tipoUserFiltro' como espera el backend
                            filtrosModificados.tipoUserFiltro = filtrosAplicados.tipoUser;
                            console.log('Filtro tipoUserFiltro:', filtrosAplicados.tipoUser);
                        }
                        
                        if (filtrosAplicados.relacionUsuario !== undefined && filtrosAplicados.relacionUsuario !== null && filtrosAplicados.relacionUsuario !== '') {
                            // Usar el parámetro 'relacionUsuarioFiltro' como espera el backend
                            filtrosModificados.relacionUsuarioFiltro = filtrosAplicados.relacionUsuario;
                            console.log('Filtro relacionUsuarioFiltro:', filtrosAplicados.relacionUsuario);
                        }
                        
                        // Procesar el filtro de búsqueda
                        if (filtrosAplicados.busqueda !== undefined && filtrosAplicados.busqueda !== null && filtrosAplicados.busqueda !== '') {
                            filtrosModificados.busqueda = filtrosAplicados.busqueda;
                            console.log('Filtro busqueda:', filtrosAplicados.busqueda);
                        }
                        
                        // Guardar los filtros en el estado
                        setFiltros(filtrosModificados);
                        console.log('Filtros aplicados:', filtrosModificados);
                        setMostrarModalFiltros(false);
                        
                        // Cargar usuarios con los filtros aplicados
                        cargarUsuarios(1, busqueda, filtrosModificados);
                    }}
                    initialFilters={filtros}
                    filterConfig={[
                        {
                            type: 'checkbox',
                            name: 'usuarioActivo',
                            label: 'Solo Activos',
                            value: true,
                            secondCheckbox: {
                                name: 'usuarioInactivo',
                                label: 'Solo Inactivos',
                                value: false
                            }
                        },
                        {
                            type: 'search',
                            name: 'busqueda',
                            label: 'Buscar usuario',
                            placeholder: 'Buscar por usuario'
                        },
                        {
                            type: 'select',
                            name: 'tipoUser',
                            label: 'Tipo de Usuario',
                            options: [
                                { value: '', label: 'Todos' },
                                { value: 'INTERNO', label: 'Interno' },
                                { value: 'EXTERNO', label: 'Externo' }
                            ]
                        },
                        {
                            type: 'select',
                            name: 'relacionUsuario',
                            label: 'Relación',
                            options: [
                                { value: '', label: 'Todos' },
                                { value: 'EMPLEADO', label: 'Empleado' },
                                { value: 'CLIENTE', label: 'Cliente' },
                                { value: 'PROVEEDOR', label: 'Proveedor' }
                            ]
                        },
                        {
                            type: 'date',
                            name: 'fechaDesde',
                            label: 'Fecha Desde'
                        },
                        {
                            type: 'date',
                            name: 'fechaHasta',
                            label: 'Fecha Hasta'
                        }
                    ]}
                    title="Filtros de Usuarios"
                />
            </div>

            {/* Upload Template Modal */}
            {mostrarModalSubirPlantilla && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                        <h3 className="text-lg font-bold mb-4">Subir Plantilla</h3>
                        
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-sm font-medium text-gray-700">
                                    Seleccionar el archivo
                                </label>
                                <div className="relative">
                                    <div className="relative">
                                        <div className="text-sm text-white bg-blue-500 hover:bg-blue-600 py-2 px-4 rounded-md font-medium cursor-pointer w-[100px] text-center">
                                            Seleccionar
                                            <input
                                                type="file"
                                                accept=".xlsx, .xls"
                                                onChange={(e) => setArchivoSeleccionado(e.target.files[0])}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                {archivoSeleccionado ? archivoSeleccionado.name : 'No se ha seleccionado ningún archivo'}
                            </div>
                        </div>
                        
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setMostrarModalSubirPlantilla(false);
                                    setArchivoSeleccionado(null);
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 w-[100px] text-center"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    console.log('Subir button clicked');
                                    console.log('archivoSeleccionado:', archivoSeleccionado);
                                    if (archivoSeleccionado) {
                                        console.log('Showing confirmation dialog');
                                        setMostrarConfirmacionActualizacion(true);
                                    } else {
                                        console.log('No file selected');
                                    }
                                }}
                                disabled={!archivoSeleccionado}
                                className={`px-4 py-2 text-sm font-medium text-white rounded-md w-[100px] text-center ${
                                    archivoSeleccionado 
                                        ? 'bg-blue-600 hover:bg-blue-700' 
                                        : 'bg-gray-400 cursor-not-allowed'
                                }`}
                            >
                                Subir
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmación de actualización */}
            {console.log('Render - mostrarConfirmacionActualizacion:', mostrarConfirmacionActualizacion)}
            {mostrarConfirmacionActualizacion && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[1000] p-4">
                    <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4 text-gray-800">Tipo de Importación</h3>
                        <p className="mb-6 text-gray-700">
                            ¿Necesita crear nuevos registros o actualizar registros existentes?
                        </p>
                        
                        <div className="flex flex-col sm:flex-row justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setMostrarConfirmacionActualizacion(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex-1 sm:flex-none w-[100px]"
                            >
                                Cancelar
                            </button>
                            {mostrarModalSubirPlantilla && (
                              <>
                                <button
                                    type="button"
                                    onClick={() => confirmarSubirPlantilla(false)}
                                    className="px-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 flex-1 sm:flex-none w-[100px]"
                                >
                                    Crear
                                </button>
                                <button
                                    type="button"
                                    onClick={() => confirmarSubirPlantilla(true)}
                                    className="px-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex-1 sm:flex-none w-[100px]"
                                >
                                    Actualizar
                                </button>
                              </>
                            )}
                            {!mostrarModalSubirPlantilla && (
                              <button
                                  type="button"
                                  onClick={() => confirmarSubirPlantilla()}
                                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex-1 sm:flex-none"
                              >
                                  Descargar Plantilla
                              </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </ManagementDashboardLayout>
  );
};