import React, { useEffect, useState, useCallback } from 'react';
import { getEmpresas, deleteEmpresa } from '../../services/company/CompanyService';
import EmpresasTable from '../../components/empresa/EmpresasTable';
import ButtonGroup from '../../components/common/ButtonGroup';
import SearchBar from '../../components/common/SearchBar';
import EmpresaUpdateModal from '../../components/empresa/EmpresaUpdateModal';
import EmpresaCreateModal from '../../components/empresa/EmpresaCreateModal';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Paginador from '../../components/common/Paginador';

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
  const navigate = useNavigate();
  const location = useLocation();
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
        return;
      }
    }
    setEmpresas(encontrados);
    setPaginaActual(1);
    setTotalPaginas(1);
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
          <button 
            className={`px-3 py-1 rounded border ${location.pathname === '/dashboard/empresas' ? 'bg-[#1e4e9c] text-white' : 'bg-white border-gray-300 hover:bg-gray-50'}`}
            onClick={() => navigate('/dashboard/empresas')}
          >
            Empresa
          </button>
          <button  
            className={`px-3 py-1 rounded border ${location.pathname === '/dashboard/perfil-acceso' ? 'bg-[#1e4e9c] text-white' : 'bg-white border-gray-300 hover:bg-gray-50'}`}
            onClick={() => navigate('/dashboard/perfil-acceso')}
          >
            Perfil Acceso
          </button>
          <button
            className={`px-3 py-1 rounded border ${location.pathname === '/dashboard/usuarios' ? 'bg-[#1e4e9c] text-white' : 'bg-white border-gray-300 hover:bg-gray-50'}`}
            onClick={() => navigate('/dashboard/usuarios')}
          >
            Usuario
          </button>
          <button
            className={`px-3 py-1 rounded border ${location.pathname === '/dashboard/permisos' ? 'bg-[#1e4e9c] text-white' : 'bg-white border-gray-300 hover:bg-gray-50'}`}
            onClick={() => navigate('/dashboard/permisos')}
          >
            Permiso
          </button>
          <button
            className={`px-3 py-1 rounded border ${location.pathname === '/dashboard/bitacora' ? 'bg-[#1e4e9c] text-white' : 'bg-white border-gray-300 hover:bg-gray-50'}`}
            onClick={() => navigate('/dashboard/bitacora')}
          >
            Bitacora
          </button>
          <button
            className={`px-3 py-1 rounded border ${location.pathname === '/dashboard/usuarios-activos' ? 'bg-[#1e4e9c] text-white' : 'bg-white border-gray-300 hover:bg-gray-50'}`}
            onClick={() => navigate('/dashboard/usuarios-activos')}
          >
            User Activos
          </button>
          <button 
            className="ml-auto bg-orange-500 text-white px-4 py-1 rounded hover:bg-orange-600 transition-colors" 
            onClick={() => navigate('/dashboard-internal')}
          >
            SALIR
          </button>
        </div>
      </div>
      <div className="bg-blue-900 text-white text-lg font-bold px-4 py-2 rounded-t">EMPRESAS / NEGOCIOS:</div>
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
              onPageChange={(p) => cargarEmpresas(p, filtroActivo)}
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
              placeholder="Buscar por RUC o nombre de empresa..."
              className="w-[300px]"
              debounceTime={300}
            />
          </div>
        </div>
        <EmpresasTable empresas={empresas} onEdit={handleEditClick} onDelete={handleDeleteClick} />
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