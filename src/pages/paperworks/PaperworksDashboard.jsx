import React, { useEffect, useState, useCallback, useRef } from 'react';
import { getPaperworks } from '../../services/Paperwork/PaperworkService';
import { getBitacora } from '../../services/bitacora/BitacoraService';
import ManagementDashboardLayout from '../../layouts/ManagementDashboardLayout';
import GenericTable from '../../components/common/GenericTable';
import ConfirmEliminarModal from '../../components/common/ConfirmEliminarModal';
import SearchBar from '../../components/common/SearchBar';
import PaperworkUpdateModal from '../../components/paperwork/PaperworkUpdateModal';
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
  // No necesitamos mantener el estado de las bitácoras aquí
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [filtrosEstado, setFiltrosEstado] = useState({
    RECHAZADO: false,
    APROBADO: false,
    'POR PROCESAR': false
  });
  const handleCancelDelete = () => handleCloseConfirmDelete();
  
  const searchTimeoutRef = useRef(null);

  // Función para actualizar bitácoras sin guardar el estado
  const actualizarBitacoras = useCallback(async () => {
    try {
      console.log('Actualizando bitácoras...');
      await getBitacora(); // Solo llamamos al servicio para actualizar los datos
      console.log('Bitácoras actualizadas');
    } catch (error) {
      console.error('Error al actualizar bitácoras:', error);
    }
  }, []);

  const cargarPaperworks = useCallback(async (pagina = 1, filtroBusqueda = '') => {
    console.log(`Iniciando carga de trámites - Página: ${pagina}, Filtro: ${filtroBusqueda}`);
    setIsLoading(true);
    
    try {
      // Obtener estados seleccionados
      const estadosSeleccionados = Object.entries(filtrosEstado)
        .filter(([_, checked]) => checked)
        .map(([estado]) => estado);
      
      // Parámetros para la petición
      const params = {
        page: pagina,
        ...(filtroBusqueda && { searchTerm: filtroBusqueda }),
        ...(estadosSeleccionados.length > 0 && { estados: estadosSeleccionados.join(',') })
      };

      console.log('Solicitando trámites con parámetros:', params);
      
      // Obtener los datos del servidor
      const response = await getPaperworks(params);
      console.log('Respuesta de la API (cruda):', response);
      console.log('Tipo de respuesta:', typeof response);
      console.log('Propiedades de la respuesta:', Object.keys(response));
      
      // Verificar específicamente la propiedad paperworks
      if (response.paperworks) {
        console.log('Propiedad paperworks encontrada:', response.paperworks);
        console.log('Tipo de paperworks:', typeof response.paperworks);
        console.log('Es array?', Array.isArray(response.paperworks));
      } else {
        console.log('No se encontró la propiedad paperworks en la respuesta');
      }
      
      // Manejar la respuesta del servidor
      let listaPaperworks = [];
      let totalDePaginas = 1;
      
      console.log('Procesando respuesta para extraer datos...');
      
      // Verificar la estructura exacta de la respuesta basada en tu mensaje de error
      if (response && typeof response === 'object') {
        // Extraer información de paginación
        if (response.totalPages !== undefined) {
          totalDePaginas = response.totalPages;
          console.log('Total de páginas encontrado:', totalDePaginas);
        }
        
        // Verificar si existe la propiedad 'paperworks' directamente
        if ('paperworks' in response) {
          console.log('Propiedad paperworks encontrada en la respuesta');
          
          if (Array.isArray(response.paperworks)) {
            console.log('paperworks es un array con', response.paperworks.length, 'elementos');
            listaPaperworks = response.paperworks;
          } else {
            console.log('paperworks no es un array, es de tipo:', typeof response.paperworks);
          }
        } 
        // Si no hay paperworks, intentar buscar otros arrays en la respuesta
        else {
          console.log('Buscando arrays en la respuesta...');
          const arrayKeys = Object.keys(response).filter(key => Array.isArray(response[key]));
          console.log('Arrays encontrados:', arrayKeys);
          
          if (arrayKeys.length > 0) {
            // Usar el primer array encontrado
            const arrayKey = arrayKeys[0];
            console.log('Usando array:', arrayKey);
            listaPaperworks = response[arrayKey];
          } else if (response.data && Array.isArray(response.data)) {
            console.log('Usando response.data como fuente de datos');
            listaPaperworks = response.data;
          }
        }
      } else if (Array.isArray(response)) {
        console.log('La respuesta es directamente un array');
        listaPaperworks = response;
      }
      
      console.log('Trámites cargados:', listaPaperworks);
      console.log('Total de páginas:', totalDePaginas);
      
      // Eliminar posibles duplicados usando el RegTramite como identificador único
      const uniquePaperworks = Array.isArray(listaPaperworks) ? 
        listaPaperworks.filter((paperwork, index, self) => 
          index === self.findIndex(p => p.RegTramite === paperwork.RegTramite)
        ) : [];
      
      console.log('Trámites después de eliminar duplicados:', uniquePaperworks.length);
      
      // Actualizar el estado con la lista sin duplicados
      setPaperworksOriginales(uniquePaperworks);
      setPaperworks(uniquePaperworks);
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
  }, [filtrosEstado]);

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

  const handleBuscar = (termino) => {
    setFiltro(termino);
    // Si el término de búsqueda está vacío, restablecer el filtro activo
    if (!termino.trim()) {
      setFiltroActivo('');
      cargarPaperworks(1, '');
      return;
    }
    
    // Cancelar la búsqueda anterior si existe
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Establecer un nuevo temporizador para la búsqueda
    searchTimeoutRef.current = setTimeout(() => {
      setFiltroActivo(termino);
      cargarPaperworks(1, termino);
      searchTimeoutRef.current = null;
    }, 500);
  };

  const handleFiltroEstadoChange = (estado) => {
    const nuevosFiltros = {
      ...filtrosEstado,
      [estado]: !filtrosEstado[estado]
    };
    setFiltrosEstado(nuevosFiltros);
    
    // Si hay un filtro de búsqueda activo, aplicar el filtro local
    if (filtro) {
      const paperworksFiltrados = buscarEnPaperworks(paperworksOriginales, filtro);
      // Aplicar filtro de estado localmente
      const paperworksFiltradosPorEstado = paperworksFiltrados.filter(paperwork => {
        const estadosSeleccionados = Object.entries(nuevosFiltros)
          .filter(([_, checked]) => checked)
          .map(([estado]) => estado);
        
        return estadosSeleccionados.length === 0 || 
               (paperwork.estadoTramite && estadosSeleccionados.includes(paperwork.estadoTramite));
      });
      
      setPaperworks(paperworksFiltradosPorEstado);
    } else {
      // Si no hay filtro de búsqueda, recargar del servidor
      const estadosSeleccionados = Object.entries(nuevosFiltros)
        .filter(([_, checked]) => checked)
        .map(([estado]) => estado);
      
      if (estadosSeleccionados.length > 0) {
        cargarPaperworks(1, filtro);
      } else {
        // Si no hay filtros activos, mostrar todos los trámites
        cargarPaperworks(1, '');
      }
    }
    
    setIsSearching(false);
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




  const handleConfirmDelete = async () => {
    try {

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

 

  return (
    <ManagementDashboardLayout title="TRAMITES:" user={user} negocio={negocio}>
      <div className="w-full bg-white border-b border-l border-r border-gray-300 rounded-b py-4">
        {/* Grid de 3 columnas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4 px-4">
          {/* Columna 1: Filtros horizontales */}
          <div className="col-span-1">
            <div className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
              <h3 className="font-medium text-gray-700 mb-3 ">Filtrar por estado</h3>
              <div className="flex flex-row flex-wrap gap-2 items-center">
                {['POR PROCESAR', 'APROBADO', 'RECHAZADO'].map((estado) => {
                  const isActive = filtrosEstado[estado] || false;
                  return (
                    <label
                      key={estado}
                      className={`flex flex-row items-center px-3 py-1.5 rounded-full border cursor-pointer transition-colors ${
                        isActive
                          ? 'bg-blue-50 border-blue-300 text-blue-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-blue-600 focus:ring-blue-500"
                        checked={isActive}
                        onChange={() => handleFiltroEstadoChange(estado)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="ml-2 text-sm">{estado}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Columna 2: Paginador */}
          <div className="col-span-1 flex items-center justify-center">
            <Paginador
              paginaActual={paginaActual}
              totalPaginas={totalPaginas}
              onPageChange={(pagina) => cargarPaperworks(pagina, filtroActivo)}
            />
          </div>
          
          {/* Columna 3: Buscador */}
          <div className="col-span-1">
         
              <div className="flex justify-end  gap-2">
                <SearchBar
                  onSearch={handleBuscar}
                  value={filtro}
                  onChange={handleBuscar}
                  placeholder="Buscar por Trámite..."
                  showClearButton={true}
                  onClear={handleClearSearch}
                  disabled={isLoading}
                  className="w-[300px]"
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
                  className="mt-2 bg-gray-200 hover:bg-gray-300 px-3 py-1.5 rounded text-sm font-medium whitespace-nowrap w-full"
                  aria-label="Limpiar búsqueda"
                >
                  Limpiar filtros
                </button>
              )}
          
          </div>
        </div>
        {/* La tabla está fuera del grid, pero dentro del mismo div principal */}
        <div className="w-full px-4">
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
                key: 'tipodetTramite', 
                label: 'Tipo de Trámite',
                render: (row) => row.tipodetTramite || 'N/A'
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
                render: (row) => (
                    <span className={`px-2 py-1 rounded-full text-xs ${
                        row.estadoTramite === 'APROBADO' ? 'bg-blue-100 text-blue-800' : row.estadoTramite === 'RECHAZADO' ? 'bg-red-100 text-red-800' : row.estadoTramite === 'POR PROCESAR' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                        {row.estadoTramite}
                    </span>
                )
              },
              { 
                key: 'registradoComo', 
                label: 'Registrado Como',
                render: (row) => row.registradoComo || 'N/A'
              },
              { 
                key: 'emailNuevo', 
                label: 'Email',
                render: (row) => row.emailNuevo || 'N/A'
              },
              { 
                key: 'telefonoNuevo', 
                label: 'Teléfono',
                render: (row) => row.telefonoNuevo || 'N/A'
              }
            ]}
            data={paperworks}
            rowKey="RegTramite"
            actions={true}
            onEdit={handleEdit}
            showActions={{
              edit: true,
              delete: true,
              updatePermissions: false
            }}
          />
        </div>
      </div>
      {/* Modales fuera del div principal, pero dentro del layout */}
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
        onSave={async (updatedData) => {
          try {
            // Actualizar el paperwork con los nuevos datos
            console.log('Guardando datos actualizados:', updatedData);
            // Aquí puedes llamar a tu servicio para actualizar los datos
            // Por ejemplo: await paperworkService.update(paperworkAEditar.id, updatedData);
            
            // Recargar la lista de paperworks después de actualizar
            cargarPaperworks();
            // Actualizar las bitácoras
            actualizarBitacoras();
            
            return true;
          } catch (error) {
            console.error('Error al guardar los cambios:', error);
            return false;
          }
        }}
      />
    </ManagementDashboardLayout>
  );
}