import React, { useEffect, useState, useCallback } from 'react';
import { getPermisos, deletePermiso, putPermiso } from '../../services/permission/PermissionService';
import ManagementDashboardLayout from '../../layouts/ManagementDashboardLayout';
import GenericTable from '../../components/common/GenericTable';
import ButtonGroup from '../../components/common/ButtonGroup';
import SearchBar from '../../components/common/SearchBar';
import ConfirmEliminarModal from '../../components/common/ConfirmEliminarModal';
import PermisoCreateModal from '../../components/permisos/PermisoCreateModal';
import PermisosFilterModal from '../../components/permisos/PermisosFilterModal';
import PermisosModal from '../../components/bitacora/PermisosModal';
import Paginador from '../../components/common/Paginador';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../context/NotificationContext';

export default function PermisosDashboard() {
  // Estado para mostrar el modal de filtros
  const [mostrarModalFiltros, setMostrarModalFiltros] = useState(false);
  const [filtros, setFiltros] = useState({});
  const [mostrarListaFiltros, setMostrarListaFiltros] = useState(false);
  // Estado para el total de permisos
  const [totalRecords, setTotalRecords] = useState(0);
  const { user, negocio } = useAuth();
  const { showSuccessMessage } = useNotification();
  const [permisosOriginales, setPermisosOriginales] = useState([]);
  const [permisos, setPermisos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [filtroActivo, setFiltroActivo] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [permisoAEditar, setPermisoAEditar] = useState(null);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [mostrarModalCreacion, setMostrarModalCreacion] = useState(false);
  const [registrosPrueba, setRegistrosPrueba] = useState(0);
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [showConfirmEliminar, setShowConfirmEliminar] = useState(false);
  const [permisoAEliminar, setPermisoAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminacion, setErrorEliminacion] = useState('');

  // Limpia los filtros para no enviar valores vacíos, nulos o undefined
  function limpiarFiltros(obj) {
    const limpio = {};
    Object.entries(obj).forEach(([key, value]) => {
      // No enviar FiltroEstadoPermiso si es '' (Todos)
      if (key === 'FiltroEstadoPermiso' && value === '') return;
      // Enviar booleanos como true o false, y strings solo si no son vacíos
      if (typeof value === 'boolean') {
        limpio[key] = value;
      } else if (value !== '' && value !== null && value !== undefined) {
        limpio[key] = value;
      }
    });
    return limpio;
  }

  // Ahora acepta un tercer parámetro opcional para filtros extra
  const cargarPermisos = useCallback(async (pagina = 1, filtroBusqueda = '', filtrosExtra = {}) => {
    const filtrosLimpios = limpiarFiltros(filtrosExtra);
    const params = { page: pagina, ...filtrosLimpios };
    if (filtroBusqueda) {
      params.searchTerm = filtroBusqueda;
      setFiltroActivo(filtroBusqueda);
    }
    console.log('Filtros enviados al servidor:', params);
    const data = await getPermisos(params);
    setPermisosOriginales(data.permissions || []);
    setPermisos(data.permissions || []);
    setPaginaActual(pagina);
    setTotalPaginas(data.totalPages || 1);
    setRegistrosPrueba(data.permisosPrueba || 0);
    setTotalRecords(data.totalRecords || (data.permissions ? data.permissions.length : 0));
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
      // Recargar los permisos después de eliminar (volver a la primera página)
      await cargarPermisos(1, filtro);
      showSuccessMessage(`Permiso de ${permisoAEliminar.userName || 'usuario'} eliminado correctamente`);
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
      showSuccessMessage('Permiso actualizado correctamente');
    } catch (error) {
      console.error('Error al actualizar el permiso:', error);
      // Mostrar mensaje de error
      alert(error.message || 'Error al actualizar el permiso');
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
      showSuccessMessage('Permiso creado exitosamente.');
    } catch (error) {
      console.error('Error al crear el permiso:', error);
      // Mostrar mensaje de error
      alert(error.message || 'Error al crear el permiso');
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
    <ManagementDashboardLayout title={(
 <>
          <div>
            <span className="font-bold">PERMISOS:</span>
            <span className="font-light w-100 text-[16px] ml-2">{`${totalRecords} Total`}</span>
          </div>
          <span></span>
         {registrosPrueba > 0 && (
            <span className="text-white flex justify-end">
              <p className='rounded-lg bg-red-400 w-8 px-2 py-1 text-center'>{`${registrosPrueba}`}</p>
            </span>
          )}
       
        </>
      )}  user={user} negocio={negocio}>
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
             
        {/* Modal de filtros para permisos */}
        <PermisosFilterModal
          isOpen={mostrarModalFiltros}
          onClose={() => setMostrarModalFiltros(false)}
          onApply={(filtrosAplicados) => {
            setFiltros(filtrosAplicados);
            setMostrarModalFiltros(false);
            // Solo enviar los filtros requeridos
            cargarPermisos(1, '', {
              FiltroEstadoPermiso: filtrosAplicados.FiltroEstadoPermiso,
              FiltroTodasEmpresas: filtrosAplicados.FiltroTodasEmpresas,
              FiltroMasDeUnaSesion: filtrosAplicados.FiltroMasDeUnaSesion
            });
          }}
        />
              <div className="relative">
                <div className="flex items-center">
                  <button
                    onClick={() => setMostrarModalFiltros(true)}
                  className="flex items-center text-[#1e4e9c]  gap-1 bg-white border-[#1e4e9c] border px-4 py-3 font-bold hover:text-white hover:bg-[#1e4e9c] rounded"
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
                  {Object.keys(filtros).length > 0 && (
                    <button
                      className="ml-2 text-xs text-blue-700"
                      style={{ height: '32px', textDecoration: 'none' }}
                      onClick={() => setMostrarListaFiltros((v) => !v)}
                    >Ver/Quitar filtros</button>
                  )}
                </div>
                {mostrarListaFiltros && (
                  <div className="absolute z-50 bg-white border rounded shadow-lg mt-2 right-0 min-w-[180px]">
                    <div className="p-2 border-b font-bold">Filtros activos</div>
                    {Object.entries(filtros).map(([key, value]) => (
                      value ? (
                        <div key={key} className="flex items-center justify-between px-2 py-1 text-sm">
                          <span>{key}: {typeof value === 'boolean' ? (value ? 'Sí' : 'No') : value}</span>
                          <button
                            className="ml-2 text-blue-600 hover:text-blue-800"
                            onClick={() => {
                              const nuevos = { ...filtros };
                              nuevos[key] = typeof value === 'boolean' ? false : '';
                              setFiltros(nuevos);
                              cargarPermisos(1, '', nuevos);
                            }}
                          >Quitar</button>
                        </div>
                      ) : null
                    ))}
                    <div className="px-2 py-1">
                      <button
                        className="text-xs text-blue-700 hover:text-blue-900 font-bold"
                        onClick={() => {
                          setFiltros({});
                          setMostrarListaFiltros(false);
                          cargarPermisos(1, '', {});
                        }}
                      >Quitar todos</button>
                    </div>
                  </div>
                )}
              </div>
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
              placeholder="Buscar por usuario..."
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
                label: 'N° Reg',
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
              updatePermissions: false 
              
            }}
             rowClassName={(row) => {
              const enviroment = (row.ambiente);
              if (enviroment === 'PRUEBA') {
                return 'bg-red-100';
              }
              return '';
            }}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            onUpdatePermissions={null}
          
          
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
        {/* El componente de notificación ahora es manejado por el NotificationContext */}
      </div>
    </ManagementDashboardLayout>
  );
}
