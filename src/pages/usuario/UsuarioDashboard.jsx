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

    const cargarUsuarios = useCallback(async (pagina = 1, filtroBusqueda = '') => {
        const params = { page: pagina };
        if (filtroBusqueda) {
            params.searchTerm = filtroBusqueda;
        }
        try {
            const data = await getUsers(params);
            setUsuariosOriginales(data.users || []);
            setUsuarios(data.users || []);
            setPaginaActual(pagina);
            setTotalPaginas(data.totalPages || 1);
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            alert('Error al cargar usuarios');
        }
    }, []);

    useEffect(() => {
        console.log('Iniciando carga inicial de usuarios');
        cargarUsuarios(1, '');
    }, [cargarUsuarios]);

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
          <div>
            <ButtonGroup
              buttons={[{
                label: 'Nuevo',
                onClick: () => setMostrarModalCreacion(true),
                variant: 'normal',
                className: 'bg-white border-[#1e4e9c] border px-8 py-1 font-bold hover:text-white hover:bg-[#1e4e9c]'
              }]}
            />
          </div>
          <div className="flex justify-center">
            <Paginador
              paginaActual={paginaActual}
              totalPaginas={totalPaginas}
              onPageChange={(pagina) => cargarUsuarios(pagina, filtroActivo)}
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
                            { key: 'relacionUsuario', label: 'Relación' },
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
            </div>
        </ManagementDashboardLayout>
    );
}
