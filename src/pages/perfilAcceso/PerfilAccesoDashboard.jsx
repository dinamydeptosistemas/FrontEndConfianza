import React, { useEffect, useState, useCallback } from 'react';
import { getPerfilesAcceso, deletePerfilAcceso, putPerfilAcceso } from '../../services/accessProfile/AccessProfileService';
import PerfilesAccesoTable from '../../components/accessprofile/PerfilesAccesoTable';
import ButtonGroup from '../../components/common/ButtonGroup';
import SearchBar from '../../components/common/SearchBar';
import PerfilAccesoUpdateModal from '../../components/accessprofile/PerfilAccesoUpdateModal';
import PerfilAccesoCreateModal from '../../components/accessprofile/PerfilAccesoCreateModal';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function PerfilAccesoDashboard() {
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
  const [loadingBusqueda, setLoadingBusqueda] = useState(false);
  const [modalExito, setModalExito] = useState({ open: false, mensaje: '' });
  const navigate = useNavigate();
  const location = useLocation();
  const { user, negocio } = useAuth();

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
    setLoadingBusqueda(true);
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
        setLoadingBusqueda(false);
        return;
      }
    }
    setPerfiles(encontrados);
    setPaginaActual(1);
    setTotalPaginas(1);
    setLoadingBusqueda(false);
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
      setModalExito({ open: true, mensaje: 'Registro actualizado exitosamente.' });
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
      setModalExito({ open: true, mensaje: 'Registro guardado exitosamente.' });
    } catch (error) {
      alert('Error al crear el perfil de acceso.');
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
          <button className="bg-white border border-gray-300 px-3 py-1 rounded">Usuario</button>
          <button className="bg-white border border-gray-300 px-3 py-1 rounded">Permiso</button>
          <button className="bg-white border border-gray-300 px-3 py-1 rounded">Bitacora</button>
          <button className="bg-white border border-gray-300 px-3 py-1 rounded">User Activos</button>
          <button
            className="ml-auto bg-orange-500 text-white px-4 py-1 rounded"
            onClick={() => navigate('/dashboard-internal')}
          >
            SALIR
          </button>
        </div>
      </div>
      <div className="bg-blue-900 text-white text-lg font-bold px-4 py-2 rounded-t">PERFILES DE ACCESO:</div>
      <div className="bg-white border-b border-l border-r border-gray-300 rounded-b p-4">
        <div className="relative flex gap-2 mb-4 items-center justify-between min-h-[48px]">
          <ButtonGroup
            buttons={[{
              label: 'Nuevo',
              onClick: () => setMostrarModalCreacion(true),
              variant: 'normal',
              className: 'bg-white border-[#1e4e9c]  border px-8 py-1 font-bold  hover:text-white hover:bg-[#1e4e9c]'
            }]}
          />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="flex items-center justify-center gap-2">
              <button
                className="w-8 h-8 flex items-center justify-center rounded-md bg-blue-600 text-white font-bold hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={() => cargarPerfiles(paginaActual - 1, filtroActivo)}
                disabled={paginaActual === 1}
                title="Página anterior"
              >
                &#171;
              </button>
              <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-semibold">
                {paginaActual} / {totalPaginas}
              </span>
              <button
                className="w-8 h-8 flex items-center justify-center rounded-md bg-blue-600 text-white font-bold hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={() => cargarPerfiles(paginaActual + 1, filtroActivo)}
                disabled={paginaActual === totalPaginas}
                title="Página siguiente"
              >
                &#187;
              </button>
            </div>
          </div>
          <div className='flex flex-1 justify-end items-center gap-2'>
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
              placeholder="Buscar por nombre o código de función..."
              className="w-[300px]"
              showClearButton={true}
            />
          </div>
        </div>
        <PerfilesAccesoTable perfiles={perfiles} onEdit={handleEditClick} onDelete={handleDeleteClick} />
        {loadingBusqueda && (
          <div className="text-center text-blue-600 font-semibold py-2">Buscando en todas las páginas...</div>
        )}
      </div>
      {mostrarModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <p>¿Seguro que deseas eliminar el perfil <b>{perfilAEliminar?.functionName}</b>?</p>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={handleCancelDelete} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancelar</button>
              <button onClick={handleConfirmDelete} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Eliminar</button>
            </div>
          </div>
        </div>
      )}
      {mostrarModalBloqueo && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <p>No se puede eliminar este perfil porque forma parte de la lógica básica del sistema.</p>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setMostrarModalBloqueo(false)} className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800">Aceptar</button>
            </div>
          </div>
        </div>
      )}
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