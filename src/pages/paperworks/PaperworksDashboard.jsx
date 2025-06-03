import React, { useEffect, useState, useCallback, useRef } from 'react';
import { getPaperworks, savePaperwork, deletePaperwork } from '../../services/Paperwork/PaperworkService';
import ManagementDashboardLayout from '../../layouts/ManagementDashboardLayout';
import GenericTable from '../../components/common/GenericTable';
import ButtonGroup from '../../components/common/ButtonGroup';
import ConfirmEliminarModal from '../../components/common/ConfirmEliminarModal';
import SearchBar from '../../components/common/SearchBar';
import PaperworkUpdateModal from '../../components/paperwork/PaperworkUpdateModal';
import PaperworkCreateModal from '../../components/paperwork/PaperworkCreateModal';
import { useAuth } from '../../contexts/AuthContext';
import Paginador from '../../components/common/Paginador';

export default function PaperworksDashboard() {
  const { user, negocio } = useAuth();
  const [paperworksOriginales, setPaperworksOriginales] = useState([]);
  const [paperworks, setPaperworks] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [filtroActivo, setFiltroActivo] = useState('');
  const [paperworkAEliminar, setPaperworkAEliminar] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [paperworkAEditar, setPaperworkAEditar] = useState(null);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [mostrarModalCreacion, setMostrarModalCreacion] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const handleCancelDelete = () => handleCloseConfirmDelete();
  
  const searchTimeoutRef = useRef(null);

  const cargarPaperworks = useCallback(async (pagina = 1, filtroBusqueda = '') => {
    console.log(`Iniciando carga de trámites - Página: ${pagina}, Filtro: ${filtroBusqueda}`);
    setIsLoading(true);
    
    try {
      // Parámetros para la petición
      const params = {
        page: pagina,
        ...(filtroBusqueda && { searchTerm: filtroBusqueda })
      };

      console.log('Solicitando trámites con parámetros:', params);
      
      // Obtener los datos del servidor
      const response = await getPaperworks(params);
      console.log('Respuesta de la API (cruda):', response);
      
      // Manejar la respuesta del servidor
      let listaPaperworks = [];
      let totalDePaginas = 1;
      
      // Si la respuesta es un array directo
      if (Array.isArray(response)) {
        listaPaperworks = response;
      } 
      // Si la respuesta es un objeto con una propiedad que es un array
      else if (response && typeof response === 'object') {
        const arrayKey = Object.keys(response).find(key => Array.isArray(response[key]));
        if (arrayKey) {
          listaPaperworks = response[arrayKey];
          totalDePaginas = response.totalPages || 1;
        } else if (response.data && Array.isArray(response.data)) {
          // Si la respuesta tiene un formato { data: [...] }
          listaPaperworks = response.data;
          totalDePaginas = response.totalPages || 1;
        }
      }
      
      console.log('Trámites cargados:', listaPaperworks);
      console.log('Total de páginas:', totalDePaginas);
      
      // Actualizar el estado
      setPaperworksOriginales([...listaPaperworks]);
      setPaperworks([...listaPaperworks]);
      setPaginaActual(pagina);
      setTotalPaginas(totalDePaginas);
      
    } catch (error) {
      console.error('Error al cargar los trámites:', error);
      
      // Mostrar mensaje de error al usuario
      if (error.response) {
        const { status, data } = error.response;
        console.error('Detalles del error:', { status, data });
        
        // Mostrar mensaje de error específico del servidor si está disponible
        const errorMessage = data?.message || 'Error al cargar los trámites';
        alert(`Error ${status}: ${errorMessage}`);
      } else if (error.request) {
        console.error('No se recibió respuesta del servidor');
        alert('No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet.');
      } else {
        console.error('Error al configurar la petición:', error.message);
        alert('Error al realizar la petición. Por favor, inténtalo de nuevo.');
      }
      
      // Limpiar datos en caso de error
      setPaperworksOriginales([]);
      setPaperworks([]);
      
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    cargarPaperworks(1, '');
  }, [cargarPaperworks]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [filtro]);

  const buscarEnPaperworks = (paperworksArr, filtro) => {
    if (!filtro) return paperworksArr;
    return paperworksArr.filter(paperwork =>
      (paperwork.businessName && paperwork.businessName.toLowerCase().includes(filtro.toLowerCase())) ||
      (paperwork.ruc && paperwork.ruc.toLowerCase().includes(filtro.toLowerCase())) ||
      (paperwork.commercialName && paperwork.commercialName.toLowerCase().includes(filtro.toLowerCase()))
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
        const filtradas = buscarEnPaperworks(paperworksOriginales, valor);
        setPaperworks(filtradas);
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
    
    // Si hay paperworks originales, restaurarlas
    if (paperworksOriginales.length > 0) {
      setPaperworks(paperworksOriginales);
    } else {
      // Si no hay paperworks cargadas, hacer una nueva petición
      cargarPaperworks(1, '');
    }
  };

  const handleCloseConfirmDelete = () => {
    setPaperworkAEliminar(null);
    setMostrarModal(false);
  };


  const handleDeleteClick = (paperwork) => {
    setPaperworkAEliminar(paperwork);
    setMostrarModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deletePaperwork(paperworkAEliminar.regTramite);
      await cargarPaperworks(paginaActual, filtro);
      setPaperworkAEliminar(null);
      setMostrarModal(false);
    } catch (error) {
      console.error('Error al eliminar la empresa:', error);
      alert(`Error al eliminar la empresa: ${error.message || 'Error desconocido'}`);
    }
  };

  const handleEdit = (paperwork) => {
    setPaperworkAEditar(paperwork);
    setMostrarModalEdicion(true);
  };

  const handleSavePaperwork = async (paperwork) => {
    try {
      await savePaperwork(paperwork);
      setMostrarModalEdicion(false);
      setPaperworkAEditar(null);
      await cargarPaperworks(1, filtro);
    } catch (error) {
      console.error('Error al crear el trámite:', error);
      alert('Error al crear el trámite. Por favor, intente nuevamente.');
    }
  };

  return (
    <ManagementDashboardLayout title="TRAMITES:" user={user} negocio={negocio}>
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
              onPageChange={(pagina) => cargarPaperworks(pagina, filtroActivo)}
            />
          </div>
          
          <div className="w-full sm:w-auto">
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
              <div className="relative w-full max-w-md">
                <SearchBar
                  onSearch={handleBuscar}
                  value={filtro}
                  onChange={handleBuscar}
                  placeholder="Buscar por Trámite..."
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
                key: 'regTramite', 
                label: 'ID Trámite',
                render: (row) => row.regTramite || 'N/A'
              },
              { 
                key: 'fechaSolicitud', 
                label: 'Fecha Solicitud',
                render: (row) => row.fechaSolicitud ? new Date(row.fechaSolicitud).toLocaleDateString() : 'N/A'
              },
              { 
                key: 'tipoTramite', 
                label: 'Tipo de Trámite',
                render: (row) => row.tipoTramite || 'N/A'
              },
              { 
                key: 'tipoUser', 
                label: 'Tipo Usuario',
                render: (row) => row.tipoUser || 'N/A'
              },
              { 
                key: 'relacionUser', 
                label: 'Relación Usuario',
                render: (row) => row.relacionUser || 'N/A'
              },
              { 
                key: 'estadoTramite', 
                label: 'Estado',
                render: (row) => row.estadoTramite || 'N/A'
              },
              { 
                key: 'registradoComo', 
                label: 'Registrado Como',
                render: (row) => row.registradoComo || 'N/A'
              },
              { 
                key: 'email', 
                label: 'Email',
                render: (row) => row.email || 'N/A'
              },
              { 
                key: 'telefonoCelular', 
                label: 'Teléfono',
                render: (row) => row.telefonoCelular || 'N/A'
              }
            ]}
            data={paperworks}
            rowKey="RegTramite"
            actions={true}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            showActions={{
              edit: true,
              delete: true,
              updatePermissions: false
            }}
          />
        </div>
        <ConfirmEliminarModal
          isOpen={mostrarModal}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          mensaje={`¿Está seguro que desea eliminar el trámite${paperworkAEliminar ? ` "${paperworkAEliminar.businessName || paperworkAEliminar.nombre || ''}${paperworkAEliminar.ruc ? ' (RUC: ' + paperworkAEliminar.ruc + ')' : ''}"` : ''}?`}
        />
        <PaperworkUpdateModal
          isOpen={mostrarModalEdicion}
          paperwork={paperworkAEditar}
          onClose={() => {
            setPaperworkAEditar(null);
            setMostrarModalEdicion(false);
          }}
          onSave={handleSavePaperwork}
        />
        {mostrarModalCreacion && (
          <PaperworkCreateModal
            isOpen={mostrarModalCreacion}
            onClose={() => setMostrarModalCreacion(false)}
            onSave={handleSavePaperwork}
          />
        )}
      </div>
    </ManagementDashboardLayout>
  );
}