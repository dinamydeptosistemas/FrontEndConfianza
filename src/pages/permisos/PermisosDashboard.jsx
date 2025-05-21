import React, { useEffect, useState, useCallback } from 'react';
import { getPermisos, deletePermiso, putPermiso } from '../../services/permission/PermissionService';
import ManagementDashboardLayout from '../../layouts/ManagementDashboardLayout';
import GenericTable from '../../components/common/GenericTable';
import ButtonGroup from '../../components/common/ButtonGroup';
import ConfirmEliminarModal from '../../components/common/ConfirmEliminarModal';
import SearchBar from '../../components/common/SearchBar';
import PermisoCreateModal from '../../components/permisos/PermisoCreateModal';
import PermisoUpdateModal from '../../components/permisos/PermisoUpdateModal';
import Paginador from '../../components/common/Paginador';
import { useAuth } from '../../contexts/AuthContext';

export default function PermisosDashboard() {
  const { user, negocio } = useAuth(); // negocio puede ser null si no existe en el contexto
  const [permisosOriginales, setPermisosOriginales] = useState([]);
  const [permisos, setPermisos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [filtroActivo, setFiltroActivo] = useState('');
  // Estado para busqueda, útil si se requiere en la page
  const [busqueda, setBusqueda] = useState('');
  const [permisoAEliminar, setPermisoAEliminar] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [permisoAEditar, setPermisoAEditar] = useState(null);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [mostrarModalCreacion, setMostrarModalCreacion] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [modalExito, setModalExito] = useState({ open: false, mensaje: '' });

  const cargarPermisos = useCallback(async (pagina = 1, filtroBusqueda = '') => {
    const params = { page: pagina };
    if (filtroBusqueda) {
      params.searchTerm = filtroBusqueda;
    }
    const data = await getPermisos(params);
    setPermisosOriginales(data.permissions || []);
    setPermisos(data.permissions || []);
    setPaginaActual(pagina);
    setTotalPaginas(data.totalPages || 1);
  }, []);

  useEffect(() => {
    cargarPermisos(1, '');
  }, [cargarPermisos]);

  // Métodos para CRUD y búsqueda
  const buscarEnPermisos = (permisosArr, filtro) => {
    if (!filtro) return permisosArr;
    return permisosArr.filter(p =>
      (p.userName && p.userName.toLowerCase().includes(filtro.toLowerCase())) ||
      (p.regPermiso && String(p.regPermiso).toLowerCase().includes(filtro.toLowerCase())) ||
      (p.function && p.function.toLowerCase().includes(filtro.toLowerCase()))
    );
  };

  // (handleBuscar ya está definido en la nueva estructura, eliminar duplicados si existen)

  // Eliminar funciones antiguas no usadas
  // const handleGuardar = ...
  // const handleEditar = ...
  // const handleBorrar = ...
  // const handlePagina = ...
  // const busqueda = ...
  // Todo está centralizado en los nuevos handlers (handleSavePermiso, handleEditClick, handleDeleteClick, etc)


  const handleDeleteClick = (permiso) => {
    setPermisoAEliminar(permiso);
    setMostrarModal(true);
  };

  const handleConfirmDelete = async () => {
    const regPermiso = permisoAEliminar?.regPermiso;
    if (regPermiso) {
      try {
        await deletePermiso(regPermiso);
        const data = await getPermisos();
        setPermisosOriginales(data.permissions || []);
        const filtroActual = filtroActivo;
        if (!filtroActual) {
          setPermisos(data.permissions || []);
        } else {
          const filtrados = (data.permissions || []).filter(p =>
            (p.userName && p.userName.toLowerCase().includes(filtroActual.toLowerCase())) ||
            (p.regPermiso && String(p.regPermiso).toLowerCase().includes(filtroActual.toLowerCase()))
          );
          setPermisos(filtrados);
        }
        setPermisoAEliminar(null);
        setMostrarModal(false);
      } catch (error) {
        alert('Error al eliminar el permiso.');
        setMostrarModal(false);
      }
    }
  };

  const handleCancelDelete = () => {
    setPermisoAEliminar(null);
    setMostrarModal(false);
  };

  const handleEditClick = (permiso) => {
    setPermisoAEditar(permiso);
    setMostrarModalEdicion(true);
  };

  const handleUpdatePermiso = async (permisoActualizado) => {
    try {
      await putPermiso(permisoActualizado);
      setMostrarModalEdicion(false);
      setPermisoAEditar(null);
      cargarPermisos(paginaActual, busqueda);
      setModalExito({ open: true, mensaje: 'Permiso actualizado exitosamente.' });
    } catch (error) {
      alert('Error al actualizar el permiso.');
    }
  };

  // Eliminar cualquier referencia a 'busqueda' (no existe ni es necesaria)

  const handleSavePermiso = async (nuevoPermiso) => {
    try {
      await putPermiso(nuevoPermiso);
      setMostrarModalCreacion(false);
      cargarPermisos(1, busqueda);
      setModalExito({ open: true, mensaje: 'Permiso creado exitosamente.' });
    } catch (error) {
      alert('Error al crear el permiso.');
    }
  };

  // Eliminadas funciones no usadas: handleNuevo, handleEditar, handleBorrar. Todo el flujo usa handleEditClick, handleDeleteClick, handleConfirmDelete, etc.

  // handleBuscar: necesario para el buscador y el botón de limpiar búsqueda
  const handleBuscar = async (nuevoFiltro) => {
    setFiltro(nuevoFiltro);
    setFiltroActivo(nuevoFiltro);
    setBusqueda(nuevoFiltro);
    if (!nuevoFiltro) {
      cargarPermisos(1, '');
      return;
    }
    let pagina = 1;
    let encontrados = buscarEnPermisos(permisosOriginales, nuevoFiltro);
    let permisosAcumulados = [...permisosOriginales];
    let totalPaginasLocal = totalPaginas;
    while (encontrados.length === 0 && (pagina < totalPaginasLocal || permisosAcumulados.length === 0)) {
      pagina++;
      try {
        const data = await getPermisos({ page: pagina });
        if (data.permissions && data.permissions.length > 0) {
          permisosAcumulados = [...permisosAcumulados, ...data.permissions];
          setPermisosOriginales(permisosAcumulados);
          totalPaginasLocal = data.totalPages || totalPaginasLocal;
          encontrados = buscarEnPermisos(permisosAcumulados, nuevoFiltro);
        } else {
          break;
        }
      } catch (error) {
        alert('Error al buscar permisos.');
        return;
      }
    }
    setPermisos(encontrados);
    setPaginaActual(1);
    setTotalPaginas(1);
  };
  return (
    <ManagementDashboardLayout title="PERMISOS DEL SISTEMA" user={user} negocio={negocio}>
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
          <div className="flex justify-center">
            <Paginador
              paginaActual={paginaActual}
              totalPaginas={totalPaginas}
              onPageChange={(p) => cargarPermisos(p, filtroActivo)}
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
              placeholder="Buscar por usuario, permiso o función..."
              className="w-[300px]"
              debounceTime={300}
            />
          </div>
        </div>
        <GenericTable
          columns={[
            { key: 'regPermiso', label: 'Reg Permiso' },
            { key: 'idUser', label: 'Id User' },
            { key: 'userName', label: 'User Name' },
            { key: 'idFunction', label: 'Id Función' },
            { key: 'function', label: 'Función' },
            { key: 'codigoEntidad', label: 'Código Entidad' },
            { key: 'estadoPermisoActivado', label: 'Estado', render: (row) => row.estadoPermisoActivado ? 'Activo' : 'Inactivo' },
            { key: 'permitirTodasEmpresas', label: 'Todas Empresas', render: (row) => row.permitirTodasEmpresas ? 'Sí' : 'No' },
            { key: 'permitirMasDeUnaSesion', label: 'Multi Sesión', render: (row) => row.permitirMasDeUnaSesion ? 'Sí' : 'No' },
            { key: 'cierreSesionJornada', label: 'Cierre Jornada' },
            { key: 'bloqueoSesionMaxima', label: 'Bloq. Máx. Sesión' },
            { key: 'usuarioResponsable', label: 'Responsable' },
            { key: 'fechaInicioPermiso', label: 'Inicio' },
            { key: 'fechaFinalPermiso', label: 'Fin' },
          ]}
          data={permisos}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          rowKey="regPermiso"
        />
        <ConfirmEliminarModal
          isOpen={mostrarModal}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          mensaje={`¿Está seguro que desea eliminar el permiso${permisoAEliminar ? ` "${permisoAEliminar.userName || ''} (${permisoAEliminar.regPermiso || ''})"` : ''}?`}
        />
        {mostrarModalEdicion && (
          <PermisoUpdateModal
            permiso={permisoAEditar}
            onClose={() => {
              setPermisoAEditar(null);
              setMostrarModalEdicion(false);
            }}
            onUpdate={handleUpdatePermiso}
          />
        )}
        {mostrarModalCreacion && (
          <PermisoCreateModal
            onClose={() => setMostrarModalCreacion(false)}
            onSave={handleSavePermiso}
          />
        )}
        {modalExito.open && (
          <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded">
            {modalExito.mensaje}
            <button className="ml-4 text-green-900 font-bold" onClick={() => setModalExito({ open: false, mensaje: '' })}>X</button>
          </div>
        )}
      </div>
    </ManagementDashboardLayout>
  );
}
