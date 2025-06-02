import React, { useEffect, useState, useCallback, useRef } from 'react';
import { getSocialMedia, saveSocialMedia, deleteSocialMedia } from '../../services/SocialMedia/SocialMediaService';
import ManagementDashboardLayout from '../../layouts/ManagementDashboardLayout';
import GenericTable from '../../components/common/GenericTable';
import ButtonGroup from '../../components/common/ButtonGroup';
import ConfirmEliminarModal from '../../components/common/ConfirmEliminarModal';
import SearchBar from '../../components/common/SearchBar';
import { useAuth } from '../../contexts/AuthContext';
import Paginador from '../../components/common/Paginador';
import SocialMediaUpdateModal from '../../components/socialmedia/SocialMediaUpdateModal';
import SocialMediaCreateModal from '../../components/socialmedia/SocialMediaCreateModal';


// Opciones para el filtro de redes sociales
const REDES_SOCIALES = [
  { value: 'FACEBOOK', label: 'Facebook' },
  { value: 'TWITTER', label: 'Twitter' },
  { value: 'INSTAGRAM', label: 'Instagram' },
  { value: 'LINKEDIN', label: 'LinkedIn' },
  { value: 'YOUTUBE', label: 'YouTube' },
  { value: 'TIKTOK', label: 'TikTok' },
  { value: 'OTRO', label: 'Otra red social' }
];

// Estado inicial para los filtros
const INITIAL_FILTERS = {
  redSocial: '',
  searchQuery: '',
  page: 1,
  pageSize: 10
};

export default function SocialMediaDashboard() {
  const { user, negocio } = useAuth();
  const [mediosSociales, setMediosSociales] = useState([]);
  const [filtros, setFiltros] = useState({
    ...INITIAL_FILTERS,
    redSocial: '',
    estado: '',
    tipoProceso: ''
  });
  const [filtroActivo, setFiltroActivo] = useState('');
  const [medioAEliminar, setMedioAEliminar] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [medioAEditar, setMedioAEditar] = useState(null);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [mostrarModalCreacion, setMostrarModalCreacion] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  const searchTimeoutRef = useRef(null);
  
  // Mapear los datos para la tabla
  const datosTabla = mediosSociales.map(medio => {
    const acciones = [];
    
    if (user.permisos?.includes('editar_medios')) {
      acciones.push({
        label: 'Editar',
        onClick: () => handleEditClick(medio),
        variant: 'primary'
      });
    }
    
    if (user.permisos?.includes('eliminar_medios')) {
      acciones.push({
        label: 'Eliminar',
        onClick: () => handleDeleteClick(medio),
        variant: 'danger'
      });
    }
    
    return {
      ...medio,
      redSocial: REDES_SOCIALES.find(r => r.value === medio.redSocial)?.label || medio.redSocial,
      acciones: acciones.length > 0 ? <ButtonGroup buttons={acciones} /> : null
    };
  });

  const cargarMediosSociales = useCallback(async (pagina = 1, busqueda = '') => {
    setIsLoading(true);
    try {
      const params = { 
        page: pagina,
        pageSize: filtros.pageSize,
        ...(busqueda && { searchTerm: busqueda }),
        ...(filtros.redSocial && { redSocial: filtros.redSocial })
      };

      const response = await getSocialMedia(params);
      console.log('Respuesta del servidor (medios sociales):', response);
      
      let listaMedios = [];
      let totalDePaginas = 1;
      let paginaActualRespuesta = pagina;

      if (Array.isArray(response)) {
        listaMedios = response;
      } else if (response && typeof response === 'object') {
        if (Array.isArray(response.data)) {
          listaMedios = response.data;
          totalDePaginas = response.last_page || response.totalPages || 1;
          paginaActualRespuesta = response.current_page || response.page || pagina;
        } else if (Array.isArray(response)) {
          listaMedios = response;
        }
      }

      setMediosSociales(listaMedios);
      setPaginaActual(paginaActualRespuesta);
      setTotalPaginas(totalDePaginas);
    } catch (error) {
      console.error('Error al cargar empresas:', error);
   
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  }, [filtros]);

  // Cargar medios sociales al montar el componente y cuando cambien los filtros
  useEffect(() => {
    cargarMediosSociales(1, filtroActivo);
  }, [filtros, cargarMediosSociales, filtroActivo]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [filtros]);

  const handleBuscar = (valor) => {
    // Si el filtro está vacío, limpiar búsqueda inmediatamente
    if (!valor.trim()) {
      setFiltroActivo('');
      return;
    }
    
    // Usar debounce para búsquedas en el servidor
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setFiltroActivo(valor);
    }, 500); // 500ms de debounce
  };

  const handleFiltroRedSocial = (redSocial) => {
    setFiltros(prev => ({
      ...prev,
      redSocial: redSocial || ''
    }));
  };
  
  const handleClearSearch = () => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
    
    setFiltroActivo('');
    setFiltros(INITIAL_FILTERS);
  };

  const handleDeleteClick = (medio) => {
    console.log('Medio social seleccionado para eliminar:', medio);
    setMedioAEliminar(medio);
    setMostrarModal(true);
  };

  const handleConfirmDelete = async () => {
    const idMedio = medioAEliminar?.idMedio;
    if (idMedio) {
      try {
        await deleteSocialMedia(idMedio);
        // Recargar la página actual con los filtros aplicados
        await cargarMediosSociales(paginaActual, filtroActivo);
      } catch (error) {
        console.error('Error al eliminar el medio social:', error);
        alert(`Error al eliminar el medio social: ${error.message || 'Error desconocido'}`);
      } finally {
        setMedioAEliminar(null);
        setMostrarModal(false);
      }
    } else {
      alert('No se ha seleccionado un medio social para eliminar o falta el identificador.');
      setMostrarModal(false);
    }
  };

  const handleCancelDelete = () => {
    setMedioAEliminar(null);
    setMostrarModal(false);
  };

  const handleEditClick = (medio) => {
    setMedioAEditar(medio);
    setMostrarModalEdicion(true);
  };

  const handleUpdateMedio = async (medioActualizado) => {
    try {
      await saveSocialMedia(medioActualizado);
      // Recargar la página actual con los filtros aplicados
      await cargarMediosSociales(paginaActual, filtroActivo);
      setMedioAEditar(null);
      setMostrarModalEdicion(false);
    } catch (error) {
      console.error('Error al actualizar el medio social:', error);
      alert('Error al actualizar el medio social. Por favor, intente nuevamente.');
    }
  };

  const handleCreateMedio = async (nuevoMedio) => {
    try {
      await saveSocialMedia(nuevoMedio);
      // Recargar la página actual con los filtros aplicados
      await cargarMediosSociales(1, '');
      setMostrarModalCreacion(false);
    } catch (error) {
      console.error('Error al crear el medio social:', error);
      alert('Error al crear el medio social. Por favor, intente nuevamente.');
    }
  };

  const handlePageChange = (nuevaPagina) => {
    cargarMediosSociales(nuevaPagina, filtroActivo);
  };

  const handleCreateClick = () => {
    setMostrarModalCreacion(true);
  };

  // Debug: Log user permissions and data
  console.log('=== DEBUG: User Permissions ===', user?.permisos);
  console.log('Has editar_medios:', user?.permisos?.includes('editar_medios'));
  console.log('Has eliminar_medios:', user?.permisos?.includes('eliminar_medios'));
  console.log('=== DEBUG: datosTabla ===', datosTabla);
  console.log('=== DEBUG: datosTabla first item ===', datosTabla[0]);

  return (
    <ManagementDashboardLayout title="MEDIOS SOCIALES:" user={user} negocio={negocio}>
      <div className="bg-white border-b border-l border-r border-gray-300 rounded-b p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
             <div className="w-full sm:w-auto">
                    <ButtonGroup
                      buttons={[{
                        label: 'Nuevo',
                        onClick: () => handleCreateClick(),
                        variant: 'normal',
                        className: 'bg-white border-[#1e4e9c] border px-8 py-1 font-bold hover:text-white hover:bg-[#1e4e9c] w-full sm:w-auto'
                      }]}
                    />
                  </div>
          
          <div className="flex justify-center">
            <Paginador
              paginaActual={paginaActual}
              totalPaginas={totalPaginas}
              onPageChange={handlePageChange}
            />
          </div>
          
          <div className="w-full sm:w-auto">
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
              <div className="relative w-full max-w-md">
                <SearchBar
                  onSearch={handleBuscar}
                  value={filtroActivo}
                  onChange={handleBuscar}
                  placeholder="Buscar por cuenta, responsable o empresa..."
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
              
              <div className="w-full sm:w-48">
                <select
                  id="redSocial"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={filtros.redSocial}
                  onChange={(e) => handleFiltroRedSocial(e.target.value)}
                  disabled={isLoading}
                >
                  <option value="">Todas las redes</option>
                  {REDES_SOCIALES.map((red) => (
                    <option key={red.value} value={red.value}>
                      {red.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {(filtroActivo || filtros.redSocial) && (
                <button
                  onClick={handleClearSearch}
                  className="bg-gray-200 hover:bg-gray-300 px-3 py-1.5 rounded text-sm font-medium whitespace-nowrap self-center"
                  aria-label="Limpiar filtros"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div className="mb-4 overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <GenericTable
              columns={[
                { key: 'idMedio', label: 'ID' },
                { key: 'redSocial', label: 'Red Social' },
                { key: 'nombreCuenta', label: 'Cuenta' },
                { key: 'tipoMedio', label: 'Tipo de Medio' },
                { key: 'empresa', label: 'Empresa' },
                { key: 'responsable', label: 'Responsable' },
                { key: 'departamento', label: 'Departamento' },
                { 
                  key: 'medioActivo', 
                  label: 'Estado', 
                  render: (row) => row.medioActivo ? 'Activo' : 'Inactivo' 
                }
              ]}
              data={datosTabla}
              rowKey="idMedio"
              actions={true}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          )}
        </div>
        
        <ConfirmEliminarModal
          isOpen={mostrarModal}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          mensaje={`¿Está seguro que desea eliminar la cuenta de ${medioAEliminar?.redSocial ? REDES_SOCIALES.find(r => r.value === medioAEliminar.redSocial)?.label || medioAEliminar.redSocial : 'esta red social'} "${medioAEliminar?.nombreCuenta || ''}"?`}
        />
        
        {mostrarModalEdicion && medioAEditar && (
          <SocialMediaUpdateModal
            isOpen={mostrarModalEdicion}
            onClose={() => setMostrarModalEdicion(false)}
            onSave={handleUpdateMedio}
            medio={medioAEditar}
            redesSociales={REDES_SOCIALES}
          />
        )}
        
        {mostrarModalCreacion && (
          <SocialMediaCreateModal
            isOpen={mostrarModalCreacion}
            onClose={() => setMostrarModalCreacion(false)}
            onSave={handleCreateMedio}
            redesSociales={REDES_SOCIALES}
          />
        )}
      </div>
    </ManagementDashboardLayout>
  );
}