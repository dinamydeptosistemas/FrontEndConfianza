import React, { useEffect, useState, useCallback } from 'react';
import { getUsers, putUser, deleteUser } from '../../services/user/UserService';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ButtonGroup from '../../components/common/ButtonGroup';
import SearchBar from '../../components/common/SearchBar';
import UsuariosTable from '../../components/users/UsuariosTable';
import UsuarioModal from '../../components/users/UsuarioModal';
import Paginador from '../../components/common/Paginador';

export default function UsuarioDashboard() {
    const [usuariosOriginales, setUsuariosOriginales] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [filtro, setFiltro] = useState('');
    const [filtroActivo, setFiltroActivo] = useState('');
    const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [usuarioAEditar, setUsuarioAEditar] = useState(null);
    const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
    const [mostrarModalCreacion, setMostrarModalCreacion] = useState(false);
    const [paginaActual, setPaginaActual] = useState(1);
    const [modalExito, setModalExito] = useState({ open: false, mensaje: '' });
    const [totalPaginas, setTotalPaginas] = useState(1);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, negocio } = useAuth();

    const cargarUsuarios = useCallback(async (pagina = 1, filtroBusqueda = '') => {
        try {
            console.log('Cargando usuarios con página:', pagina, 'filtro:', filtroBusqueda);
            const response = await getUsers({ 
                page: pagina, 
                searchTerm: filtroBusqueda || undefined 
            });
            console.log('Respuesta del servicio:', response);
            
            if (!response || response.statusCode !== 200 || !Array.isArray(response.users)) {
                console.error('Formato de respuesta inválido:', response);
                setModalExito({ open: true, mensaje: 'Error: Formato de respuesta inválido del servidor' });
                return;
            }

            setUsuariosOriginales(response.users);
            setUsuarios(response.users);
            setPaginaActual(response.currentPage);
            setTotalPaginas(response.totalPages);
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            if (error.response) {
                console.error('Detalles del error:', error.response.data);
            }
            setModalExito({ open: true, mensaje: 'Error al cargar usuarios: ' + (error.message || 'Error desconocido') });
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

    const handleBuscar = async (termino) => {
        setFiltroActivo(termino);
        if (!termino) {
            cargarUsuarios(1, '');
            return;
        }
        try {
            const usuariosFiltrados = buscarEnUsuarios(usuariosOriginales, termino);
            if (usuariosFiltrados.length === 0) {
                let pagina = 1;
                let usuariosAcumulados = [...usuariosOriginales];
                while (usuariosFiltrados.length === 0 && pagina < 10) {
                    pagina++;
                    const response = await getUsers({ page: pagina });
                    if (response.statusCode === 200 && response.users && response.users.length > 0) {
                        usuariosAcumulados = [...usuariosAcumulados, ...response.users];
                        setUsuariosOriginales(usuariosAcumulados);
                        const nuevosFiltrados = buscarEnUsuarios(usuariosAcumulados, termino);
                        if (nuevosFiltrados.length > 0) {
                            setUsuarios(nuevosFiltrados);
                            break;
                        }
                    } else {
                        break;
                    }
                }
            } else {
                setUsuarios(usuariosFiltrados);
            }
        } catch (error) {
            console.error('Error al buscar usuarios:', error);
            setModalExito({ open: true, mensaje: 'Error al buscar usuarios' });
        }
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
            setModalExito({ open: true, mensaje: 'Usuario eliminado correctamente' });
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            setModalExito({ open: true, mensaje: 'Error al eliminar usuario' });
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
                setModalExito({ open: true, mensaje: 'Usuario guardado exitosamente' });
            }
        } catch (error) {
            console.error('Error al guardar usuario:', error);
            setModalExito({ open: true, mensaje: 'Error al guardar usuario' });
        }
    };


    return (
        <div className="pt-0 px-4 bg-gray-100">
            <div className="flex justify-between items-center bg-gray-200 border-b border-gray-400 px-4 py-2 mb-0 rounded-t rounded-b p-0 mt-0">
                <div>
                    <span className="font-bold text-gray-500">EMPRESA:</span> <span className="text-gray-500">{negocio?.nombre || '---'}</span>
                </div>
                <div>
                    <span className="font-bold text-gray-500">PERIODO:</span> <span className="text-gray-500">2025</span>
                </div>
            </div>
            <div className="bg-white mb-0 p-2 px-8">
                <div className="mb-2">
                    <span className="font-bold text-gray-500">USER:</span> <span className="text-gray-500">{user?.Username || user?.NombreCompleto || user?.nombre || '---'}</span>
                </div>
                <div className="flex gap-2 items-center">
                    <button
                        className={`px-3 py-1 rounded border ${location.pathname === '/dashboard/empresas' ? 'bg-[#1e4e9c] text-white' : 'bg-white border-gray-300'}`}
                        onClick={() => navigate('/dashboard/empresas')}
                    >
                        Empresa
                    </button>
                    <button
                        className={`px-3 py-1 rounded border ${location.pathname === '/dashboard/perfil-acceso' ? 'bg-[#1e4e9c] text-white' : 'bg-white border-gray-300'}`}
                        onClick={() => navigate('/dashboard/perfil-acceso')}
                    >
                        Perfil Acceso
                    </button>
                    <button
                        className={`px-3 py-1 rounded border ${location.pathname === '/dashboard/usuarios' ? 'bg-[#1e4e9c] text-white' : 'bg-white border-gray-300'}`}
                        onClick={() => navigate('/dashboard/usuarios')}
                    >
                        Usuario
                    </button>
                    <button
                        className={`px-3 py-1 rounded border ${location.pathname === '/dashboard/permisos' ? 'bg-[#1e4e9c] text-white' : 'bg-white border-gray-300'}`}
                        onClick={() => navigate('/dashboard/permisos')}
                    >
                        Permiso
                    </button>
                    <button
                        className={`px-3 py-1 rounded border ${location.pathname === '/dashboard/bitacora' ? 'bg-[#1e4e9c] text-white' : 'bg-white border-gray-300'}`}
                        onClick={() => navigate('/dashboard/bitacora')}
                    >
                        Bitacora
                    </button>
                    <button
                        className={`px-3 py-1 rounded border ${location.pathname === '/dashboard/usuarios-activos' ? 'bg-[#1e4e9c] text-white' : 'bg-white border-gray-300'}`}
                        onClick={() => navigate('/dashboard/usuarios-activos')}
                    >
                        User Activos
                    </button>
                    <button
                        className="ml-auto bg-orange-500 text-white px-4 py-1 rounded"
                        onClick={() => navigate('/dashboard-internal')}
                    >
                        SALIR
                    </button>
                </div>
            </div>
            <div className="bg-blue-900 text-white text-lg font-bold px-4 py-2 rounded-t">USUARIOS DEL SISTEMA:</div>
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
                            onPageChange={(p) => cargarUsuarios(p, filtroActivo)}
                        />
                    </div>
                    <div className='flex justify-end items-center gap-2'>
                        {filtroActivo && (
                            <span className="bg-gray-200 px-2 py-1 rounded flex items-center ml-4">
                                {filtroActivo}
                                <button
                                    onClick={() => { setFiltro(''); setFiltroActivo(''); handleBuscar(''); }}
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
                            value={filtro}
                            onChange={setFiltro}
                            placeholder="Buscar por nombre, apellido, usuario o email..."
                            className="w-[300px]"
                            showClearButton={true}
                        />
                    </div>
                </div>
                <UsuariosTable
                    usuarios={usuarios}
                    onEdit={handleEditar}
                    onDelete={handleEliminar}
                />
            </div>
            {mostrarModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
                    <div className="bg-white p-6 rounded shadow-lg">
                        <p>
  ¿Seguro que deseas eliminar al usuario 
  <b>
    {usuarioAEliminar?.nombreUser ? usuarioAEliminar.nombreUser : '(Sin nombre)'}
    {' '}
    {usuarioAEliminar?.apellidosUser ? usuarioAEliminar.apellidosUser : '(Sin apellido)'}
  </b>?
</p>
                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={handleCancelarEliminar} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancelar</button>
                            <button onClick={handleConfirmarEliminar} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Eliminar</button>
                        </div>
                    </div>
                </div>
            )}
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
            {modalExito.open && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
                    <div className="bg-white p-6 rounded shadow-lg">
                        <p className="text-green-700 font-semibold">{modalExito.mensaje}</p>
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={() => setModalExito({ open: false, mensaje: '' })}
                                className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
                            >
                                Aceptar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

