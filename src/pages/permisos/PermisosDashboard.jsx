import React, { useEffect, useState, useCallback } from 'react';
import { getPermisos, deletePermiso, putPermiso } from '../../services/permission/PermissionService';
import ManagementDashboardLayout from '../../layouts/ManagementDashboardLayout';
import GenericTable from '../../components/common/GenericTable';
import ButtonGroup from '../../components/common/ButtonGroup';
import SearchBar from '../../components/common/SearchBar';
import ConfirmEliminarModal from '../../components/common/ConfirmEliminarModal';
import PermisoCreateModal from '../../components/permisos/PermisoCreateModal';
import PermisosModal from '../../components/bitacora/PermisosModal';
import Paginador from '../../components/common/Paginador';
import { useAuth } from '../../contexts/AuthContext';

export default function PermisosDashboard() {
  const { user, negocio } = useAuth();
  const [permisosOriginales, setPermisosOriginales] = useState([]);
  const [permisos, setPermisos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [filtroActivo, setFiltroActivo] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [permisoAEditar, setPermisoAEditar] = useState(null);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [mostrarModalCreacion, setMostrarModalCreacion] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [modalExito, setModalExito] = useState({ open: false, mensaje: '', esError: false });
  const [showConfirmEliminar, setShowConfirmEliminar] = useState(false);
  const [permisoAEliminar, setPermisoAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminacion, setErrorEliminacion] = useState('');

  // Efecto para cerrar automáticamente el modal de éxito después de 3 segundos
  useEffect(() => {
    if (modalExito.open) {
      const timer = setTimeout(() => {
        setModalExito(prev => ({ ...prev, open: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [modalExito.open]);

  const cargarPermisos = useCallback(async (pagina = 1, filtroBusqueda = '') => {
    const params = { page: pagina };
    if (filtroBusqueda) {
      params.searchTerm = filtroBusqueda;
      setFiltroActivo(filtroBusqueda);
    }
    const data = await getPermisos(params);
    setPermisosOriginales(data.permissions || []);
    setPermisos(data.permissions || []);
    setPaginaActual(pagina);
    setTotalPaginas(data.totalPages || 1);
  }, []);

  useEffect(() => {
    cargarPermisos(1, '');
  }, [cargarPermisos ]);

  // Métodos para CRUD y búsqueda
  const buscarEnPermisos = (permisosArr, filtro) => {
    if (!filtro) return permisosArr;
    return permisosArr.filter(p =>
      (p.userName && p.userName.toLowerCase().includes(filtro.toLowerCase())) ||
      (p.regPermiso && String(p.regPermiso).toLowerCase().includes(filtro.toLowerCase())) ||
      (p.function && p.function.toLowerCase().includes(filtro.toLowerCase()))
    );
  };

  // Función para formatear fechas al formato YYYY-MM-DD
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const handleDeleteClick = (permiso) => {
    setPermisoAEliminar(permiso);
    setShowConfirmEliminar(true);
    setErrorEliminacion('');
  };

  const confirmarEliminacion = async () => {
    if (!permisoAEliminar) return;
    
    setEliminando(true);
    setErrorEliminacion('');
    
    try {
      await deletePermiso(permisoAEliminar.regPermiso);
      // Recargar los permisos después de eliminar
      await cargarPermisos(paginaActual, filtro);
      setModalExito({ 
        open: true, 
        mensaje: `Permiso de ${permisoAEliminar.userName || 'usuario'} eliminado correctamente`,
        esError: false
      });
      setShowConfirmEliminar(false);
    } catch (error) {
      console.error('Error al eliminar el permiso:', error);
      setErrorEliminacion(error.message || 'Error al eliminar el permiso');
    } finally {
      setEliminando(false);
    }
  };
  
  const cancelarEliminacion = () => {
    setShowConfirmEliminar(false);
    setPermisoAEliminar(null);
    setErrorEliminacion('');
  };

  const handleEditClick = (permiso) => {
    setPermisoAEditar(permiso);
    setMostrarModalEdicion(true);
  };

  const handleUpdatePermiso = async (updatedPermiso) => {
    try {
      // Formatear fechas antes de enviar al servidor
      const permisoFormateado = {
        ...updatedPermiso,
        fechaInicioPermiso: formatDate(updatedPermiso.fechaInicioPermiso),
        fechaFinalPermiso: formatDate(updatedPermiso.fechaFinalPermiso)
      };
      
      await putPermiso(permisoFormateado);
      setMostrarModalEdicion(false);
      setPermisoAEditar(null);
      await cargarPermisos(paginaActual, filtro);
      setModalExito({ 
        open: true, 
        mensaje: 'Permiso actualizado correctamente',
        esError: false
      });
    } catch (error) {
      console.error('Error al actualizar el permiso:', error);
      setModalExito({ 
        open: true, 
        mensaje: error.message || 'Error al actualizar el permiso',
        esError: true 
      });
    }
  };

  const handleSavePermiso = async (nuevoPermiso) => {
    try {
      // Formatear fechas antes de enviar al servidor
      const permisoFormateado = {
        ...nuevoPermiso,
        fechaInicioPermiso: formatDate(nuevoPermiso.fechaInicioPermiso),
        fechaFinalPermiso: formatDate(nuevoPermiso.fechaFinalPermiso)
      };
      
      await putPermiso(permisoFormateado);
      setMostrarModalCreacion(false);
      await cargarPermisos(1, busqueda);
      setModalExito({ 
        open: true, 
        mensaje: 'Permiso creado exitosamente.' 
      });
    } catch (error) {
      console.error('Error al crear el permiso:', error);
      setModalExito({ 
        open: true, 
        mensaje: error.message || 'Error al crear el permiso',
        esError: true 
      });
    }
  };

  const handleBuscar = (termino) => {
    setBusqueda(termino);
    setFiltro(termino);
    
    if (termino.trim() === '') {
      // Si el término de búsqueda está vacío, mostramos todos los permisos
      cargarPermisos(1, '');
    } else {
      // Filtramos localmente los permisos usando permisosOriginales
      const permisosFiltrados = buscarEnPermisos(permisosOriginales, termino);
      setPermisos(permisosFiltrados);
    }
  };

  const handleLimpiarBusqueda = () => {
    // Restauramos los permisos originales
    setPermisos([...permisosOriginales]);
    // Limpiamos los estados de búsqueda
    setBusqueda('');
    setFiltro('');
    setFiltroActivo('');
  };

  return (
    <ManagementDashboardLayout title="PERMISOS:" user={user} negocio={negocio}>
      <div className="bg-white border-b border-l border-r border-gray-300 rounded-b p-4 mx-[18px] w-[96%]">
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
          <div className="w-full flex justify-center">
            <div className="w-full sm:w-auto">
              <Paginador
                paginaActual={paginaActual}
                totalPaginas={totalPaginas}
                onPageChange={(p) => cargarPermisos(p, filtroActivo)}
              />
            </div>
          </div>
          <div className='flex justify-end items-center gap-2'>
            {filtroActivo && (
              <span className="bg-gray-200 px-2 py-1 rounded flex items-center ml-4">
                {filtroActivo}
                <button
                  onClick={handleLimpiarBusqueda}
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
              placeholder="Buscar por usuario, permiso o función..."
              className="w-[300px]"
              debounceTime={300}
            />
          </div>
        </div>
        <div className="mb-4 overflow-x-auto">
          <GenericTable
            columns={[
              {
                key: 'regPermiso',
                label: 'N° Registro',
                render: (row) => row.regPermiso || 'N/A'
              },
              { 
                key: 'username', 
                label: 'Usuario',
                render: (row) => row.username || 'Sin usuario'
              },
              { 
                key: 'nombreCompleto', 
                label: 'Nombre Completo',
                render: (row) => row.nombreCompleto?.trim() || 'Sin nombre'
              },
              { 
                key: 'nombreFuncion', 
                label: 'Función',
                render: (row) => row.nombreFuncion || 'Sin función'
              },
              { 
                key: 'estadoPermisoActivado', 
                label: 'Estado', 
                render: (row) => (
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    row.estadoPermisoActivado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {row.estadoPermisoActivado ? 'Activo' : 'Inactivo'}
                  </span>
                )
              },
              { 
                key: 'permitirTodasEmpresas', 
                label: 'Todas Empresas', 
                render: (row) => row.permitirTodasEmpresas ? 'Sí' : 'No' 
              },
              { 
                key: 'permitirMasDeUnaSesion', 
                label: 'Múltiples Sesiones', 
                render: (row) => row.permitirMasDeUnaSesion ? 'Sí' : 'No' 
              },
              { 
                key: 'fechaInicioPermiso', 
                label: 'Inicio',
                render: (row) => row.fechaInicioPermiso ? new Date(row.fechaInicioPermiso).toLocaleDateString() : 'N/A'
              },
              { 
                key: 'fechaFinalPermiso', 
                label: 'Fin',
                render: (row) => row.fechaFinalPermiso ? new Date(row.fechaFinalPermiso).toLocaleDateString() : 'N/A'
              }
            ]}
            data={permisos}
            rowKey="regPermiso"
            actions={true}
            showActions={{
              edit: true,
              delete: true,
              updatePermissions: false // Ocultar el botón de actualizar permisos
            }}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            onUpdatePermissions={null} // Asegurarse de que no hay función de actualización de permisos
          />
        </div>
        {mostrarModalEdicion && permisoAEditar && (
          <PermisosModal
            isOpen={mostrarModalEdicion}
            negocio={negocio}
            user={user}
            onClose={() => setMostrarModalEdicion(false)}
            onUpdate={handleUpdatePermiso}
            userId={permisoAEditar.idUser}
            userName={permisoAEditar.userName}
          />
        )}
        {mostrarModalCreacion && (
          <PermisoCreateModal
            onClose={() => setMostrarModalCreacion(false)}
            onSave={handleSavePermiso}
          />
        )}
        {showConfirmEliminar && (
          <ConfirmEliminarModal
            isOpen={showConfirmEliminar}
            onConfirm={confirmarEliminacion}
            onCancel={cancelarEliminacion}
            mensaje={`¿Está seguro que desea eliminar el permiso de ${permisoAEliminar?.userName || 'este usuario'}?`}
            titulo="Confirmar Eliminación"
            textoBotonConfirmar="Eliminar"
            loading={eliminando}
            error={errorEliminacion}
          />
        )}
        {modalExito.open && (
          <div 
            className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg flex items-center justify-between ${
              modalExito.esError 
                ? 'bg-red-50 border-l-4 border-red-500 text-red-700' 
                : 'bg-green-50 border-l-4 border-green-500 text-green-700'
            }`}
            style={{ minWidth: '300px', maxWidth: '400px', zIndex: 1000 }}
          >
            <div className="flex-1">
              <p className="font-medium">
                {modalExito.esError ? 'Error' : 'Éxito'}
              </p>
              <p className="text-sm">{modalExito.mensaje}</p>
            </div>
            <button 
              className="ml-4 text-gray-500 hover:text-gray-700 focus:outline-none"
              onClick={() => setModalExito(prev => ({ ...prev, open: false }))}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </ManagementDashboardLayout>
  );
}
