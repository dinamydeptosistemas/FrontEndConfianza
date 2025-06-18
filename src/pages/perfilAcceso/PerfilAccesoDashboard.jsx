import React, { useEffect, useState, useCallback } from 'react';
import { getPerfilesAcceso, deletePerfilAcceso, putPerfilAcceso } from '../../services/accessProfile/AccessProfileService';
import ManagementDashboardLayout from '../../layouts/ManagementDashboardLayout';
import ButtonGroup from '../../components/common/ButtonGroup';
import ConfirmEliminarModal from '../../components/common/ConfirmEliminarModal';
import SearchBar from '../../components/common/SearchBar';
import GenericTable from '../../components/common/GenericTable';
import PerfilAccesoUpdateModal from '../../components/accessprofile/PerfilAccesoUpdateModal';
import PerfilAccesoCreateModal from '../../components/accessprofile/PerfilAccesoCreateModal';
import { useAuth } from '../../contexts/AuthContext';
import Paginador from '../../components/common/Paginador';
import { useNotification } from '../../context/NotificationContext';

export default function PerfilAccesoDashboard() {
  const { user, negocio } = useAuth();
  const { showSuccessMessage } = useNotification();
  const [perfilesOriginales, setPerfilesOriginales] = useState([]);
  const [perfiles, setPerfiles] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [filtroActivo, setFiltroActivo] = useState('');
  const [perfilAEliminar, setPerfilAEliminar] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalBloqueo, setMostrarModalBloqueo] = useState(false);
  const [perfilAEditar, setPerfilAEditar] = useState(null);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [mostrarModalCreacion, setMostrarModalCreacion] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);


  const cargarPerfiles = useCallback(async (pagina = 1, filtroBusqueda = '') => {
    const params = { page: pagina };
    if (filtroBusqueda) {
      params.searchTerm = filtroBusqueda;
    }
    const data = await getPerfilesAcceso(params);
    setPerfilesOriginales(data.accessProfiles || []);
    setPerfiles(data.accessProfiles || []);
    setPaginaActual(pagina);
    setTotalPaginas(data.totalPages || 1);
  }, []);

  useEffect(() => {
    cargarPerfiles(1, '');
  }, [cargarPerfiles]);

  const buscarEnPerfiles = (perfilesArr, filtro) => {
    if (!filtro) return perfilesArr;
    return perfilesArr.filter(p =>
      (p.functionName && p.functionName.toLowerCase().includes(filtro.toLowerCase())) ||
      (p.code && p.code.toLowerCase().includes(filtro.toLowerCase()))
    );
  };

  const handleBuscar = async (nuevoFiltro) => {
    setFiltro(nuevoFiltro);
    setFiltroActivo(nuevoFiltro);
    if (!nuevoFiltro) {
      cargarPerfiles(1, '');
      return;
    }
    let pagina = 1;
    let encontrados = buscarEnPerfiles(perfilesOriginales, nuevoFiltro);
    let perfilesAcumulados = [...perfilesOriginales];
    let totalPaginasLocal = totalPaginas;
    while (encontrados.length === 0 && (pagina < totalPaginasLocal || perfilesAcumulados.length === 0)) {
      pagina++;
      try {
        const data = await getPerfilesAcceso({ page: pagina });
        if (data.accessProfiles && data.accessProfiles.length > 0) {
          perfilesAcumulados = [...perfilesAcumulados, ...data.accessProfiles];
          setPerfilesOriginales(perfilesAcumulados);
          totalPaginasLocal = data.totalPages || totalPaginasLocal;
          encontrados = buscarEnPerfiles(perfilesAcumulados, nuevoFiltro);
        } else {
          break;
        }
      } catch (error) {
        alert('Error al buscar perfiles de acceso. Por favor, intente nuevamente.');
        return;
      }
    }
    setPerfiles(encontrados);
    setPaginaActual(1);
    setTotalPaginas(1);
  };

  const handleDeleteClick = (perfil) => {
    setPerfilAEliminar(perfil);
    if (perfil.idFunction > 11) {
      setMostrarModal(true);
    } else {
      setMostrarModalBloqueo(true);
    }
  };

  const handleConfirmDelete = async () => {
    const idFunction = perfilAEliminar?.idFunction;
    if (idFunction) {
      try {
        await deletePerfilAcceso(idFunction);
        const data = await getPerfilesAcceso({ page: 1 });
        setPerfilesOriginales(data.accessProfiles || []);
        const filtroActual = filtroActivo;
        if (!filtroActual) {
          setPerfiles(data.accessProfiles || []);
        } else {
          const filtrados = (data.accessProfiles || []).filter(p =>
            (p.functionName && p.functionName.toLowerCase().includes(filtroActual.toLowerCase())) ||
            (p.code && p.code.toLowerCase().includes(filtroActual.toLowerCase()))
          );
          setPerfiles(filtrados);
        }
        setPaginaActual(1);
        showSuccessMessage('Perfil de acceso eliminado correctamente.');
      } catch (error) {
        alert('Error al eliminar el perfil de acceso.');
      } finally {
        setPerfilAEliminar(null);
        setMostrarModal(false);
      }
    } else {
      alert('No se ha seleccionado un perfil para eliminar o falta el identificador.');
      setMostrarModal(false);
    }
  };

  const handleCancelDelete = () => {
    setPerfilAEliminar(null);
    setMostrarModal(false);
  };

  const handleEditClick = (perfil) => {
    setPerfilAEditar(perfil);
    setMostrarModalEdicion(true);
  };

  const handleUpdatePerfil = async (perfilActualizado) => {
    try {
      await putPerfilAcceso(perfilActualizado);
      const data = await getPerfilesAcceso({ page: paginaActual });
      setPerfilesOriginales(data.accessProfiles || []);
      setPerfiles(data.accessProfiles || []);
      handleBuscar(filtroActivo);
      setPerfilAEditar(null);
      setMostrarModalEdicion(false);
      showSuccessMessage('Perfil de acceso actualizado exitosamente.');
    } catch (error) {
      alert('Error al actualizar el perfil de acceso.');
    }
  };

  const handleSavePerfil = async (nuevoPerfil) => {
    try {
      await putPerfilAcceso(nuevoPerfil);
      const data = await getPerfilesAcceso({ page: 1 });
      setPerfilesOriginales(data.accessProfiles || []);
      setPerfiles(data.accessProfiles || []);
      handleBuscar(filtroActivo);
      setPaginaActual(1);
      setMostrarModalCreacion(false);
      showSuccessMessage('Perfil de acceso creado exitosamente.');
    } catch (error) {
      alert('Error al crear el perfil de acceso.');
    }
  };

  return (
    <ManagementDashboardLayout title="PERFILES DE ACCESO:" user={user} negocio={negocio}>
   
      <div className="bg-white border-white border-l border-r rounded-b p-2 w-full">
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
                onPageChange={(p) => cargarPerfiles(p, filtroActivo)}
              />
            </div>
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
              placeholder="Buscar perfil de acceso..."
              className="w-[300px]"
              debounceTime={300}
            />
          </div>
        </div>
        <div className="mb-4 overflow-x-auto">
          <GenericTable
            columns={[
              { key: 'idFunction', label: 'ID' },
              { key: 'functionName', label: 'Nombre del Perfil' },
              { 
                key: 'grantPermissions', 
                label: 'Permisos', 
                render: row => (
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    row.grantPermissions ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {row.grantPermissions ? 'Concedidos' : 'No concedidos'}
                  </span>
                )
              },
              { 
                key: 'allModules', 
                label: 'Acceso Total', 
                render: row => (
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    row.allModules ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {row.allModules ? 'Sí' : 'No'}
                  </span>
                )
              },
              { 
                key: 'administration', 
                label: 'Admin',
                render: row => row.administration ? 'Sí' : 'No'
              },
              { 
                key: 'sale', 
                label: 'Ventas',
                render: row => row.sale ? 'Sí' : 'No'
              },
              { 
                key: 'inventory', 
                label: 'Inventario',
                render: row => row.inventory ? 'Sí' : 'No'
              },
              { 
                key: 'accounting', 
                label: 'Contabilidad',
                render: row => row.accounting ? 'Sí' : 'No'
              },
              { 
                key: 'cashRegister', 
                label: 'Caja',
                render: row => row.cashRegister ? 'Sí' : 'No'
              }
            ]}
            data={perfiles}
            rowKey="idFunction"
            actions={true}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />
        </div>
      <ConfirmEliminarModal
        isOpen={mostrarModal}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        mensaje={`¿Está seguro que desea eliminar el perfil de acceso${perfilAEliminar ? ` "${perfilAEliminar.functionName || perfilAEliminar.nombre || perfilAEliminar.code || perfilAEliminar.codigo || perfilAEliminar.id || 'Sin nombre'}"` : ''}?`}
      />
      {mostrarModalBloqueo && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <p>No se puede eliminar este perfil de acceso.</p>
            <div className="flex justify-end mt-4">
              <button 
                onClick={() => setMostrarModalBloqueo(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    {mostrarModalEdicion && (
      <PerfilAccesoUpdateModal
        perfil={perfilAEditar}
        onClose={() => {
          setPerfilAEditar(null);
          setMostrarModalEdicion(false);
        }}
        onUpdate={handleUpdatePerfil}
      />
    )}
    {mostrarModalCreacion && (
      <PerfilAccesoCreateModal
        onClose={() => setMostrarModalCreacion(false)}
        onSave={handleSavePerfil}
      />
    )}
    {/* El componente de notificación ahora es manejado por el NotificationContext */}
    
  </ManagementDashboardLayout>
);

}
