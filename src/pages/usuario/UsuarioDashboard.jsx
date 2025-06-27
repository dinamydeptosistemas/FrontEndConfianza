import React, { useEffect, useState, useCallback } from 'react';
import { getUsers, putUser, deleteUser } from '../../services/user/UserService';
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
    const { showSuccessMessage } = useNotification();
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
    const [filtros, setFiltros] = useState({});

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
            console.log('Usuarios recibidos:', data.users);
            console.log('Total de usuarios:', data.users?.length || 0);
            
            // Verificar si los datos están siendo filtrados correctamente
            if (params.usuarioActivo === false) {
                console.log('Filtrando por usuarios inactivos, total recibidos:', data.users?.length || 0);
                console.log('Primer usuario recibido:', data.users?.[0]);
            } else if (params.usuarioActivo === true) {
                console.log('Filtrando por usuarios activos, total recibidos:', data.users?.length || 0);
                console.log('Primer usuario recibido:', data.users?.[0]);
            }
            
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
        try {
            await deleteUser(usuarioAEliminar?.idUser);
            // Recargar usuarios después de eliminar
            const data = await getUsers({ page: paginaActual });
            setUsuariosOriginales(data.users || []);
            const filtroActual = filtroActivo;
            if (!filtroActual) {
                setUsuarios(data.users || []);
            } else {
                const filtradas = (data.users || []).filter(u =>
                    (u.nombreUser && u.nombreUser.toLowerCase().includes(filtroActual.toLowerCase())) ||
                    (u.apellidosUser && u.apellidosUser.toLowerCase().includes(filtroActual.toLowerCase())) ||
                    (u.username && u.username.toLowerCase().includes(filtroActual.toLowerCase())) ||
                    (u.emailUsuario && u.emailUsuario.toLowerCase().includes(filtroActual.toLowerCase())) ||
                    (u.identificacion && u.identificacion.toLowerCase().includes(filtroActual.toLowerCase()))
                );
                setUsuarios(filtradas);
            }
            showSuccessMessage('Usuario eliminado correctamente');
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            alert('Error al eliminar usuario');
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
            const response = await putUser(nuevoUsuario);
            if (response) {
                // Recargar usuarios después de guardar
                const data = await getUsers({ page: 1 });
                setUsuariosOriginales(data.users || []);
                const filtroActual = filtroActivo;
                if (!filtroActual) {
                    setUsuarios(data.users || []);
                } else {
                    const filtradas = (data.users || []).filter(u =>
                        (u.nombreUser && u.nombreUser.toLowerCase().includes(filtroActual.toLowerCase())) ||
                        (u.apellidosUser && u.apellidosUser.toLowerCase().includes(filtroActual.toLowerCase())) ||
                        (u.username && u.username.toLowerCase().includes(filtroActual.toLowerCase())) ||
                        (u.emailUsuario && u.emailUsuario.toLowerCase().includes(filtroActual.toLowerCase())) ||
                        (u.identificacion && u.identificacion.toLowerCase().includes(filtroActual.toLowerCase()))
                    );
                    setUsuarios(filtradas);
                }
                setPaginaActual(1);
                showSuccessMessage('Usuario guardado exitosamente');
            }
        } catch (error) {
            console.error('Error al guardar usuario:', error);
            alert('Error al guardar usuario');
        }
    };


    return (
        <ManagementDashboardLayout title="USUARIOS:" user={user} negocio={negocio}>
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
              className="flex items-center gap-1 bg-white border-[#1e4e9c] border px-4 py-1 font-bold hover:text-white hover:bg-[#1e4e9c] rounded"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filtros
              {Object.keys(filtros).length > 0 && (
                <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {Object.keys(filtros).length}
                </span>
              )}
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
              placeholder="Buscar por nombre, apellido, usuario o email..."
              className="w-[300px]"
              debounceTime={300}
            />
          </div>
        </div>
                <div className="mb-4 overflow-x-auto">
                    <GenericTable 
                        columns={[
                            { key: 'idUser', label: 'ID' },
                            { key: 'nombreUser', label: 'Nombre' },
                            { key: 'apellidosUser', label: 'Apellidos' },
                            { key: 'identificacion', label: 'Identificación' },
                            { 
                                key: 'relacionUsuario', 
                                label: 'Relación',
                                render: (row) => (
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                        row.relacionUsuario === 'EMPLEADO' ? ' text-blue-800' : 'bg-white'
                                    }`}>
                                        {row.relacionUsuario || 'N/A'}
                                    </span>
                                )
                            },
                            { key: 'tipoUser', label: 'Tipo' },
                            { key: 'username', label: 'Usuario' },
                            { 
                                key: 'emailUsuario', 
                                label: 'Email'
                            },
                            { 
                                key: 'usuarioActivo', 
                                label: 'Estado',
                                render: (row) => (
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                        row.usuarioActivo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {row.usuarioActivo ? 'Activo' : 'Inactivo'}
                                    </span>
                                )
                            }
                        ]} 
                        data={usuarios} 
                        rowKey="idUser"
                        actions={true}
                        onEdit={handleEditar}
                        onDelete={handleEliminar}
                    />
                </div>

                <ConfirmEliminarModal
                    isOpen={mostrarModal}
                    onConfirm={handleConfirmarEliminar}
                    onCancel={handleCancelarEliminar}
                    mensaje={`¿Está seguro de eliminar al usuario ${usuarioAEliminar?.nombreUser || ''}?`}
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
        </ManagementDashboardLayout>
    );
}
