import React, { useEffect, useState, useCallback, useRef } from 'react';
import { getEmpresas, deleteEmpresa } from '../../services/company/CompanyService';
import ManagementDashboardLayout from '../../layouts/ManagementDashboardLayout';
import GenericTable from '../../components/common/GenericTable';
import ButtonGroup from '../../components/common/ButtonGroup';
import ConfirmEliminarModal from '../../components/common/ConfirmEliminarModal';
import SearchBar from '../../components/common/SearchBar';
import EmpresaUpdateModal from '../../components/empresa/EmpresaUpdateModal';
import EmpresaCreateModal from '../../components/empresa/EmpresaCreateModal';
import { useAuth } from '../../contexts/AuthContext';
import Paginador from '../../components/common/Paginador';

export default function EmpresasDashboard() {
  const { user, negocio } = useAuth();
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
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  const searchTimeoutRef = useRef(null);

  const cargarEmpresas = useCallback(async (pagina = 1, filtroBusqueda = '') => {
    setIsLoading(true);
    try {
      const params = { 
        page: pagina,
        pageSize: 10, // Tamaño de página fijo
        ...(filtroBusqueda && { searchTerm: filtroBusqueda })
      };

      // Obtener solo la página solicitada
      const response = await getEmpresas(params);
      console.log('Respuesta del servidor:', response);
      
      // Manejar diferentes formatos de respuesta
      let listaEmpresas = [];
      let totalDePaginas = 1;
      let paginaActualRespuesta = pagina;

      if (Array.isArray(response)) {
        listaEmpresas = response;
      } else if (response && typeof response === 'object') {
        // Si la respuesta es un objeto, buscar el array de empresas en diferentes propiedades
        if (Array.isArray(response.companies)) {
          listaEmpresas = response.companies;
          totalDePaginas = response.totalPages || 1;
          paginaActualRespuesta = response.page || pagina;
        } else if (Array.isArray(response.data)) {
          listaEmpresas = response.data;
          totalDePaginas = response.last_page || response.totalPages || 1;
          paginaActualRespuesta = response.current_page || response.page || pagina;
        } else if (Array.isArray(response)) {
          listaEmpresas = response;
        }
      }

      // Asegurarse de que siempre tengamos un array
      if (!Array.isArray(listaEmpresas)) {
        listaEmpresas = [];
      }

      // Eliminar duplicados basados en codeCompany
      const empresasUnicas = Array.from(new Map(
        listaEmpresas.map(empresa => [empresa.codeCompany || empresa.codeEntity, empresa])
      ).values());

      console.log('Empresas únicas:', empresasUnicas);

      setEmpresasOriginales(empresasUnicas);
      setEmpresas(empresasUnicas);
      setPaginaActual(paginaActualRespuesta);
      setTotalPaginas(totalDePaginas);
    } catch (error) {
      console.error('Error al cargar empresas:', error);
   
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    cargarEmpresas(1, '');
  }, [cargarEmpresas]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [filtro]);

  const buscarEnEmpresas = (empresasArr, filtro) => {
    if (!filtro) return empresasArr;
    return empresasArr.filter(empresa =>
      (empresa.businessName && empresa.businessName.toLowerCase().includes(filtro.toLowerCase())) ||
      (empresa.ruc && empresa.ruc.toLowerCase().includes(filtro.toLowerCase())) ||
      (empresa.commercialName && empresa.commercialName.toLowerCase().includes(filtro.toLowerCase()))
    );
  };

  const handleBuscar = (valor) => {
    setFiltro(valor);
    
    // Si el filtro está vacío, limpiar búsqueda inmediatamente
    if (!valor.trim()) {
      handleClearSearch();
      return;
    }
    
    // Usar debounce para búsquedas locales
    searchTimeoutRef.current = setTimeout(() => {
      setFiltroActivo(valor);
      setIsSearching(true);
      
      try {
        const filtradas = buscarEnEmpresas(empresasOriginales, valor);
        setEmpresas(filtradas);
      } catch (error) {
        console.error('Error en búsqueda local:', error);
   
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms de debounce
  };

  const handleClearSearch = () => {
    // Limpiar timeout si existe
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
    
    setFiltro('');
    setFiltroActivo('');
    
    // Si hay empresas originales, restaurarlas
    if (empresasOriginales.length > 0) {
      setEmpresas(empresasOriginales);
    } else {
      // Si no hay empresas cargadas, hacer una nueva petición
      cargarEmpresas(1, '');
    }
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
      try {
        await deleteEmpresa(codeEntity);
        // Recargar la página actual con los filtros aplicados
        await cargarEmpresas(paginaActual, filtro);
      } catch (error) {
        console.error('Error al eliminar la empresa:', error);
        alert(`Error al eliminar la empresa: ${error.message || 'Error desconocido'}`);
      } finally {
        setEmpresaAEliminar(null);
        setMostrarModal(false);
      }
    } else {
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
      // Recargar la página actual con los filtros aplicados
      await cargarEmpresas(paginaActual, filtro);
      setEmpresaAEditar(null);
      setMostrarModalEdicion(false);
    } catch (error) {
      console.error('Error al actualizar la empresa:', error);
      alert('Error al actualizar la empresa. Por favor, intente nuevamente.');
    }
  };

  const handleSaveEmpresa = async (nuevaEmpresa) => {
    try {
      // Recargar la página actual con los filtros aplicados
      await cargarEmpresas(paginaActual, filtro);
      setMostrarModalCreacion(false);
    } catch (error) {
      console.error('Error al crear la empresa:', error);
      alert('Error al crear la empresa. Por favor, intente nuevamente.');
    }
  };

  return (
    <ManagementDashboardLayout title="EMPRESAS:" user={user} negocio={negocio}>
      <div className="bg-white border-b border-l border-r border-gray-300 rounded-b p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="w-full sm:w-auto">
            <ButtonGroup
              buttons={[{
                label: 'Nuevo',
                onClick: () => setMostrarModalCreacion(true),
                variant: 'normal',
                className: 'bg-white border-[#1e4e9c] border px-8 py-1 font-bold hover:text-white hover:bg-[#1e4e9c] w-full sm:w-auto'
              }]}
            />
          </div>
          
          <div className="flex justify-center">
            <Paginador
              paginaActual={paginaActual}
              totalPaginas={totalPaginas}
              onPageChange={(pagina) => cargarEmpresas(pagina, filtroActivo)}
            />
          </div>
          
          <div className="w-full sm:w-auto">
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
              <div className="relative w-full max-w-md">
                <SearchBar
                  onSearch={handleBuscar}
                  value={filtro}
                  onChange={handleBuscar}
                  placeholder="Buscar por RUC o nombre de empresa..."
                  showClearButton={true}
                  onClear={handleClearSearch}
                  disabled={isLoading}
                  className="w-full"
                />
                {(isSearching || isLoading) && (
                  <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                  </div>
                )}
              </div>
              
              {filtroActivo && (
                <button
                  onClick={handleClearSearch}
                  className="bg-gray-200 hover:bg-gray-300 px-3 py-1.5 rounded text-sm font-medium whitespace-nowrap self-center"
                  aria-label="Limpiar búsqueda"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="mb-4 overflow-x-auto">
          <GenericTable
            columns={[
              { 
                key: 'codeEntity', 
                label: 'Código',
                render: (row) => row.codeEntity || 'N/A'
              },
              { 
                key: 'businessName', 
                label: 'Razón Social',
                render: (row) => row.businessName || 'N/A'
              },
              { 
                key: 'commercialName', 
                label: 'Nombre Comercial',
                render: (row) => row.commercialName || 'N/A'
              },
              { 
                key: 'ruc', 
                label: 'RUC',
                render: (row) => row.ruc || 'N/A'
              },
              { 
                key: 'typeEntity', 
                label: 'Tipo',
                render: (row) => row.typeEntity || 'N/A'
              },
              { 
                key: 'taxRegime', 
                label: 'Régimen',
                render: (row) => row.taxRegime || 'N/A'
              },
              { 
                key: 'city', 
                label: 'Ciudad',
                render: (row) => row.city || 'N/A'
              },
              { 
                key: 'state', 
                label: 'Estado',
                render: (row) => row.state ? <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Activo</span> : <span className="bg-red-100 text-red-800 px-2 py-1 rounded">Inactivo</span>
              }
            ]}
            data={empresas}
            rowKey="codeEntity"
            actions={true}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />
        </div>
        <ConfirmEliminarModal
          isOpen={mostrarModal}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          mensaje={`¿Está seguro que desea eliminar la empresa${empresaAEliminar ? ` "${empresaAEliminar.businessName || empresaAEliminar.nombre || ''}${empresaAEliminar.ruc ? ' (RUC: ' + empresaAEliminar.ruc + ')' : ''}"` : ''}?`}
        />
        {mostrarModalEdicion && empresaAEditar && (
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
    </ManagementDashboardLayout>
  );
}