import React, { useEffect, useState, useCallback } from 'react';
import { getEmpresas, deleteEmpresa } from '../../services/company/CompanyService';
import EmpresasTable from '../../components/empresa/EmpresasTable';
import EmpresasBotonera from '../../components/empresa/EmpresasBotonera';
import EmpresasBuscar from '../../components/empresa/EmpresasBuscar';
import EmpresaUpdateModal from '../../components/empresa/EmpresaUpdateModal';
import EmpresaCreateModal from '../../components/empresa/EmpresaCreateModal';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function EmpresasDashboard() {
  const [empresasOriginales, setEmpresasOriginales] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [filtroActivo, setFiltroActivo] = useState('');
  const [empresaAEliminar, setEmpresaAEliminar] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [empresaAEditar, setEmpresaAEditar] = useState(null);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [mostrarModalCreacion, setMostrarModalCreacion] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [loadingBusqueda, setLoadingBusqueda] = useState(false);
  const navigate = useNavigate();
  const { user, negocio } = useAuth();

  const cargarEmpresas = useCallback(async (pagina = 1, filtroBusqueda = '') => {
    const params = { page: pagina };
    if (filtroBusqueda) {
      params.searchTerm = filtroBusqueda;
    }
    const data = await getEmpresas(params);
    setEmpresasOriginales(data.companies || []);
    setEmpresas(data.companies || []);
    setPaginaActual(pagina);
    setTotalPaginas(data.totalPages || 1);
  }, []);

  useEffect(() => {
    cargarEmpresas(1, '');
  }, [cargarEmpresas]);

  const buscarEnEmpresas = (empresasArr, filtro) => {
    if (!filtro) return empresasArr;
    return empresasArr.filter(e =>
      (e.businessName && e.businessName.toLowerCase().includes(filtro.toLowerCase())) ||
      (e.ruc && e.ruc.toLowerCase().includes(filtro.toLowerCase())) ||
      (e.commercialName && e.commercialName.toLowerCase().includes(filtro.toLowerCase()))
    );
  };

  const handleBuscar = async (nuevoFiltro) => {
    setFiltro(nuevoFiltro);
    setFiltroActivo(nuevoFiltro);
    if (!nuevoFiltro) {
      cargarEmpresas(1, '');
      return;
    }
    setLoadingBusqueda(true);
    let pagina = 1;
    let encontrados = buscarEnEmpresas(empresasOriginales, nuevoFiltro);
    let empresasAcumuladas = [...empresasOriginales];
    let totalPaginasLocal = totalPaginas;
    while (encontrados.length === 0 && (pagina < totalPaginasLocal || empresasAcumuladas.length === 0)) {
      pagina++;
      try {
        const data = await getEmpresas({ page: pagina });
        if (data.companies && data.companies.length > 0) {
          empresasAcumuladas = [...empresasAcumuladas, ...data.companies];
          setEmpresasOriginales(empresasAcumuladas);
          totalPaginasLocal = data.totalPages || totalPaginasLocal;
          encontrados = buscarEnEmpresas(empresasAcumuladas, nuevoFiltro);
        } else {
          break;
        }
      } catch (error) {
        console.error('Error al buscar empresas:', error);
        alert('Error al buscar empresas. Por favor, intente nuevamente.');
        setLoadingBusqueda(false);
        return;
      }
    }
    setEmpresas(encontrados);
    setPaginaActual(1);
    setTotalPaginas(1);
    setLoadingBusqueda(false);
  };

  const handleDeleteClick = (empresa) => {
    console.log('Empresa seleccionada para eliminar:', {
      codeEntity: empresa.codeEntity,
      businessName: empresa.businessName,
      ruc: empresa.ruc,
      empresaCompleta: empresa
    });
    setEmpresaAEliminar(empresa);
    setMostrarModal(true);
  };

  const handleConfirmDelete = async () => {
    const codeEntity = empresaAEliminar?.codeEntity;
    if (codeEntity) {
      console.log('Intentando eliminar empresa con codeEntity:', codeEntity);
      try {
        await deleteEmpresa(codeEntity);
        console.log('Llamada a deleteEmpresa completada para:', codeEntity);

        console.log('Recargando lista de empresas...');
        const data = await getEmpresas();
        console.log('Empresas recibidas después de eliminar:', data.companies);

        setEmpresasOriginales(data.companies || []);
        const filtroActual = filtroActivo;
        if (!filtroActual) {
          setEmpresas(data.companies || []);
        } else {
          const filtradas = (data.companies || []).filter(e =>
            (e.businessName && e.businessName.toLowerCase().includes(filtroActual.toLowerCase())) ||
            (e.ruc && e.ruc.toLowerCase().includes(filtroActual.toLowerCase()))
          );
          setEmpresas(filtradas);
        }
        
      } catch (error) {
        console.error('Error durante el proceso de eliminación:', error);
        alert(`Error al eliminar la empresa: ${error.message || 'Error desconocido. Revisa la consola para más detalles.'}`);
      } finally {
        console.log('Cerrando modal y reseteando empresaAEliminar.');
        setEmpresaAEliminar(null);
        setMostrarModal(false);
      }
    } else {
      console.warn('handleConfirmDelete llamado sin codeEntity válido:', empresaAEliminar);
      alert('No se ha seleccionado una empresa para eliminar o falta el identificador.');
      setMostrarModal(false);
    }
  };

  const handleCancelDelete = () => {
    setEmpresaAEliminar(null);
    setMostrarModal(false);
  };

  const handleEditClick = (empresa) => {
    setEmpresaAEditar(empresa);
    setMostrarModalEdicion(true);
  };

  const handleUpdateEmpresa = async (empresaActualizada) => {
    try {
      const data = await getEmpresas({ page: paginaActual });
      setEmpresasOriginales(data.companies || []);
      setEmpresas(data.companies || []);
      handleBuscar(filtroActivo);
      setEmpresaAEditar(null);
      setMostrarModalEdicion(false);
    } catch (error) {
      console.error('Error al actualizar la empresa:', error);
      alert('Error al actualizar la empresa. Por favor, intente nuevamente.');
    }
  };

  const handleSaveEmpresa = async (nuevaEmpresa) => {
    try {
      const data = await getEmpresas({ page: paginaActual });
      setEmpresasOriginales(data.companies || []);
      setEmpresas(data.companies || []);
      handleBuscar(filtroActivo);
      setMostrarModalCreacion(false);
    } catch (error) {
      console.error('Error al crear la empresa:', error);
      alert('Error al crear la empresa. Por favor, intente nuevamente.');
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
          <button className="bg-white border px-3 py-1 rounded">Empresa</button>
          <button className="bg-white border px-3 py-1 rounded">Perfil Acceso</button>
          <button className="bg-white border px-3 py-1 rounded">Usuario</button>
          <button className="bg-white border px-3 py-1 rounded">Permiso</button>
          <button className="bg-white border px-3 py-1 rounded">Bitacora</button>
          <button className="bg-white border px-3 py-1 rounded">User Activos</button>
          <button className="ml-auto bg-orange-500 text-white px-4 py-1 rounded" onClick={() => navigate('/dashboard-internal')}>SALIR</button>
        </div>
      </div>
      <div className="bg-blue-900 text-white text-lg font-bold px-4 py-2 rounded-t">EMPRESAS / NEGOCIOS:</div>
      <div className="bg-white border-b border-l border-r border-gray-300 rounded-b p-4">
        <div className="relative flex gap-2 mb-4 items-center justify-between min-h-[48px]">
          <EmpresasBotonera
            onNueva={() => setMostrarModalCreacion(true)}
          />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="flex items-center justify-center gap-2">
              <button
                className="w-8 h-8 flex items-center justify-center rounded-md bg-blue-600 text-white font-bold hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={() => cargarEmpresas(paginaActual - 1, filtroActivo)}
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
                onClick={() => cargarEmpresas(paginaActual + 1, filtroActivo)}
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
            <EmpresasBuscar onBuscar={handleBuscar} filtro={filtro} setFiltro={setFiltro} filtroActivo={filtroActivo} setFiltroActivo={setFiltroActivo} mostrarEtiqueta={false} inputWidth="180px" />
          </div>
        </div>
        <EmpresasTable empresas={empresas} onEdit={handleEditClick} onDelete={handleDeleteClick} />
        {loadingBusqueda && (
          <div className="text-center text-blue-600 font-semibold py-2">Buscando en todas las páginas...</div>
        )}
      </div>
      {mostrarModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <p>¿Seguro que deseas eliminar la empresa <b>{empresaAEliminar?.businessName}</b>?</p>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={handleCancelDelete} className="px-4 py-2 bg-gray-300 rounded">Cancelar</button>
              <button onClick={handleConfirmDelete} className="px-4 py-2 bg-red-600 text-white rounded">Eliminar</button>
            </div>
          </div>
        </div>
      )}
      {mostrarModalEdicion && (
        <EmpresaUpdateModal
          empresa={empresaAEditar}
          onClose={() => {
            setEmpresaAEditar(null);
            setMostrarModalEdicion(false);
          }}
          onUpdate={handleUpdateEmpresa}
        />
      )}
      {mostrarModalCreacion && (
        <EmpresaCreateModal
          onClose={() => setMostrarModalCreacion(false)}
          onSave={handleSaveEmpresa}
        />
      )}
    </div>
  );
} 