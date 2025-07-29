import React, { useEffect, useState, useCallback, useRef } from 'react';
import { getPaperworks } from '../../services/Paperwork/PaperworkService';

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
  const [filtrosEstado, setFiltrosEstado] = useState({
    'Rechazado': false,
    'Aprobado': false,
    'Por Procesar': false
  });
  const handleCancelDelete = () => handleCloseConfirmDelete();
  
  const searchTimeoutRef = useRef(null);

  // Función para procesar la respuesta de la API de trámites
  const procesarRespuestaTramites = useCallback((response, pagina, filtroBusqueda, totalPaginasForzado = null) => {
    console.log('RESPUESTA DIRECTA DEL BACKEND:', response);
    
    // Validar que la respuesta sea válida
    if (!response) {
      console.error('Respuesta inválida del servidor');
      setPaperworksOriginales([]);
      setPaperworks([]);
      setPaginaActual(1);
      setTotalPaginas(1);
      setIsLoading(false);
      return;
    }
    
    let tramitesArray = [];

    // Determinar dónde están los datos de trámites en la respuesta
    // Prioridad: 1. response.paperworks, 2. response.data, 3. response si es array
    if (response && response.paperworks && Array.isArray(response.paperworks)) {
      tramitesArray = response.paperworks;
      console.log('Usando response.paperworks con', tramitesArray.length, 'elementos');
    } else if (response && response.data && Array.isArray(response.data)) {
      tramitesArray = response.data;
      console.log('Usando response.data con', tramitesArray.length, 'elementos');
    } else if (Array.isArray(response)) {
      tramitesArray = response;
      console.log('La respuesta es un array con', tramitesArray.length, 'elementos');
    } else if (response && typeof response === 'object') {
      // Último recurso: buscar cualquier propiedad que sea un array
      const arrayProps = Object.keys(response).filter(key => Array.isArray(response[key]));
      if (arrayProps.length > 0) {
        const arrayProp = arrayProps[0];
        tramitesArray = response[arrayProp];
        console.log(`Usando response.${arrayProp} con`, tramitesArray.length, 'elementos');
      } else {
        console.warn('No se encontró ningún array en la respuesta. Usando array vacío.');
      }
    }
    
    // Normalizar los datos para asegurar que todos los trámites tengan la misma estructura
    const tramitesNormalizados = tramitesArray.map(tramite => {
      // Normalizar el ID del trámite para usar siempre 'regTramite'
      const regTramite = tramite.regTramite || tramite.RegTramite || tramite.regtramite || tramite.id || tramite.ID || tramite.Id;
      
      return {
        ...tramite,
        // Asegurar que siempre exista regTramite con el valor correcto
        regTramite: regTramite
      };
    });
    
    // Eliminar duplicados usando un Map con regTramite como clave
    const tramitesMap = new Map();
    tramitesNormalizados.forEach(tramite => {
      if (tramite.regTramite !== undefined && !tramitesMap.has(tramite.regTramite)) {
        tramitesMap.set(tramite.regTramite, tramite);
      }
    });
    
    // Convertir el Map de vuelta a un array
    const tramitesSinDuplicados = Array.from(tramitesMap.values());
    
    console.log(`Se procesaron ${tramitesArray.length} trámites y quedaron ${tramitesSinDuplicados.length} sin duplicados`);
    
    // Actualizar estados con el array de trámites sin duplicados
    setPaperworksOriginales(tramitesSinDuplicados);
    setPaperworks(tramitesSinDuplicados);
    
    // Extraer información de paginación y contadores
    // Buscar en todas las posibles ubicaciones de la información de paginación
    let totalDePaginas = 1;
    let paginaActualResponse = pagina;
    
    // Si se proporciona un valor forzado para el total de páginas, usarlo
    if (totalPaginasForzado !== null && !isNaN(totalPaginasForzado) && totalPaginasForzado > 0) {
      console.log(`Usando valor forzado para total de páginas: ${totalPaginasForzado}`);
      totalDePaginas = totalPaginasForzado;
    } else {
      // Buscar total de páginas en diferentes formatos posibles
      if (response?.totalPages !== undefined) totalDePaginas = Number(response.totalPages);
      else if (response?.TotalPages !== undefined) totalDePaginas = Number(response.TotalPages);
      else if (response?.totalpages !== undefined) totalDePaginas = Number(response.totalpages);
      else if (response?.total_pages !== undefined) totalDePaginas = Number(response.total_pages);
      else if (response?.totalRegistros !== undefined) {
        // Calcular total de páginas basado en total de registros y tamaño de página
        const totalRegistros = Number(response.totalRegistros);
        const pageSize = 5; // Tamaño de página fijo
        totalDePaginas = Math.ceil(totalRegistros / pageSize);
        console.log(`Calculando total de páginas: ${totalRegistros} registros / ${pageSize} por página = ${totalDePaginas} páginas`);
      }
      
      // Si no se encontró información de paginación, forzar a 2 páginas como mínimo
      // para asegurar que se muestre la paginación
      if (totalDePaginas <= 1) {
        console.log('No se encontró información de paginación, forzando a 2 páginas');
        totalDePaginas = 2;
      }
    }
    
    // Buscar página actual en diferentes formatos posibles
    if (response?.currentPage !== undefined) paginaActualResponse = Number(response.currentPage);
    else if (response?.CurrentPage !== undefined) paginaActualResponse = Number(response.CurrentPage);
    else if (response?.currentpage !== undefined) paginaActualResponse = Number(response.currentpage);
    else if (response?.current_page !== undefined) paginaActualResponse = Number(response.current_page);
    else if (response?.pagina !== undefined) paginaActualResponse = Number(response.pagina);
    
    // Asegurarse de que totalDePaginas sea al menos 2 y que sea un número
    if (isNaN(totalDePaginas) || totalDePaginas < 2) totalDePaginas = 2;
    
    // Asegurarse de que paginaActualResponse sea un número válido
    if (isNaN(paginaActualResponse) || paginaActualResponse < 1) paginaActualResponse = 1;
    if (paginaActualResponse > totalDePaginas) paginaActualResponse = totalDePaginas;
    
    // Registrar información de paginación para depuración
    console.log('Información de paginación procesada:', {
      paginaActual: paginaActualResponse,
      totalPaginas: totalDePaginas,
      respuestaOriginal: {
        totalPages: response?.totalPages,
        TotalPages: response?.TotalPages,
        totalpages: response?.totalpages,
        total_pages: response?.total_pages,
        totalRegistros: response?.totalRegistros,
        currentPage: response?.currentPage,
        CurrentPage: response?.CurrentPage,
        currentpage: response?.currentpage,
        current_page: response?.current_page,
        pagina: response?.pagina
      }
    });
    
    // Actualizar estados de paginación
    setPaginaActual(paginaActualResponse);
    setTotalPaginas(totalDePaginas);
    
    // Forzar la actualización del estado para asegurar que el componente se re-renderice
    if (totalDePaginas > 1) {
      console.log(`Forzando actualización de totalPaginas a ${totalDePaginas}`);
      setTimeout(() => setTotalPaginas(totalDePaginas), 0);
    }
    
    // Registrar contadores para depuración
    console.log('Contadores de trámites recibidos:', {
      countAprobado: response?.countAprobado || response?.CountAprobado,
      countRechazado: response?.countRechazado || response?.CountRechazado,
      countPorProcesar: response?.countPorProcesar || response?.CountPorProcesar
    });
    
    setIsLoading(false);

  }, []);
  
  // Función para manejar errores de carga - Comentada porque ya no se utiliza
  /*
  const manejarErrorCarga = useCallback((error) => {
    console.error('Error al cargar los trámites:', error);
    
    if (error.response) {
      const { status, data } = error.response;
      console.error('Detalles del error:', { status, data });
      
      // Mostrar mensaje de error específico del servidor si está disponible
      const errorMessage = data?.message || 'Error al cargar los trámites';
      alert(`Error ${status}: ${errorMessage}`);
    } else if (error.request) {
      console.error('No se recibió respuesta del servidor');
      alert('No se pudo conectar con el servidor. Verifique su conexión a internet.');
    } else {
      console.error('Error al configurar la solicitud');
      alert('Error al procesar la solicitud. Por favor, intente nuevamente.');
    }
    
    // Limpiar estados
    setIsLoading(false);
  }, []);
  */

  // Función para cargar todos los trámites sin paginación
  const cargarTodosTramites = useCallback(async (filtroBusqueda = '') => {
    console.log(`Iniciando carga de TODOS los trámites - Filtro: ${filtroBusqueda}`);
    setIsLoading(true);
    
    try {
      // Obtener estados seleccionados
      const estadosSeleccionados = Object.entries(filtrosEstado)
        .filter(([_, checked]) => checked)
        .map(([estado]) => estado);
      
      // Parámetros para la petición - Sin paginación
      const params = {
        relacionUser: user?.userName || '',
        tipoUser: user?.tipoUsuario || '',
        negocio: negocio || '',
        pageSize: 1000, // Un número grande para obtener todos los registros
        ...(filtroBusqueda && { searchTerm: filtroBusqueda })
      };
      
      // Agregar estadoTramite si hay un solo estado seleccionado
      if (estadosSeleccionados.length === 1) {
        params.estadoTramite = estadosSeleccionados[0];
      }
      
      console.log('Solicitando TODOS los trámites con parámetros:', params);
      const response = await getPaperworks(params);
      
      procesarRespuestaTramites(response, 1, filtroBusqueda);
    } catch (error) {
      console.error('Error al cargar todos los trámites:', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtrosEstado, procesarRespuestaTramites, user, negocio]);

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
        pageSize: 5, // Establecer explícitamente el tamaño de página a 5 items
        getAllPages: false, // No obtener todas las páginas, solo la página actual
        ...(filtroBusqueda && { searchTerm: filtroBusqueda })
      };
      
      // Agregar estadoTramite si hay un solo estado seleccionado
      if (estadosSeleccionados.length === 1) {
        params.estadoTramite = estadosSeleccionados[0];
      }

      console.log('Solicitando trámites con parámetros:', params);
      
      // Primero, obtener el total de registros para calcular el número de páginas
      const countParams = { ...params, pageSize: 1, onlyCount: true };
      console.log('Solicitando conteo de trámites:', countParams);
      const countResponse = await getPaperworks(countParams);
      console.log('Respuesta de conteo:', countResponse);
      
      // Calcular el total de páginas basado en el total de registros
      let totalRegistros = 0;
      if (countResponse?.totalRegistros) totalRegistros = Number(countResponse.totalRegistros);
      else if (countResponse?.TotalRegistros) totalRegistros = Number(countResponse.TotalRegistros);
      else if (countResponse?.total) totalRegistros = Number(countResponse.total);
      else if (countResponse?.Total) totalRegistros = Number(countResponse.Total);
      else if (Array.isArray(countResponse)) totalRegistros = countResponse.length;
      
      // Asegurar que totalRegistros sea un número válido
      if (isNaN(totalRegistros) || totalRegistros < 0) totalRegistros = 0;
      
      // Forzar al menos 2 páginas para asegurar que se muestre la paginación
      // Esto es temporal hasta que se resuelva el problema con el backend
      let totalPaginas = Math.max(2, Math.ceil(totalRegistros / 5));
      console.log(`Total de registros: ${totalRegistros}, Total de páginas calculado: ${Math.ceil(totalRegistros / 5)}, Total de páginas forzado: ${totalPaginas}`);
      
      // Actualizar el estado de totalPaginas inmediatamente
      setTotalPaginas(totalPaginas);
      
      // Obtener los datos del servidor para la página actual
      const response = await getPaperworks(params);
      console.log('Respuesta completa del backend para la página actual:', response);
      
      procesarRespuestaTramites(response, pagina, filtroBusqueda, totalPaginas);
    } catch (error) {
   
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtrosEstado, procesarRespuestaTramites, user, negocio]);

  // Usar una referencia para evitar cargas múltiples
  const isInitialMount = useRef(true);
  
  // useEffect para la carga inicial de trámites
  useEffect(() => {
    if (isInitialMount.current) {
      console.log('Carga inicial de trámites');
      cargarPaperworks(1, '');
      isInitialMount.current = false;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);  // Deshabilitamos la regla de exhaustive-deps para evitar recarga infinita

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [filtro]);

  // Esta función se mantiene como referencia para futuras implementaciones de búsqueda local
  // pero actualmente la búsqueda se realiza en el servidor
  /*
  const buscarEnPaperworks = (paperworksArr, filtro) => {
    if (!filtro) return paperworksArr;
    return paperworksArr.filter(paperwork =>
      (paperwork.businessName && paperwork.businessName.toLowerCase().includes(filtro.toLowerCase())) ||
      (paperwork.ruc && paperwork.ruc.toLowerCase().includes(filtro.toLowerCase())) ||
      (paperwork.commercialName && paperwork.commercialName.toLowerCase().includes(filtro.toLowerCase()))
    );
  };
  */

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
    
    // Recargar trámites con los nuevos filtros
    // La función cargarPaperworks ya obtiene los estados seleccionados del estado filtrosEstado
    cargarPaperworks(1, filtro);
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
  
  // Función específica para cambiar de página
  const cambiarPagina = (nuevaPagina) => {
    console.log(`Cambiando a página ${nuevaPagina} de ${totalPaginas}`);
    
    // Validar que la página sea válida
    if (nuevaPagina < 1 || nuevaPagina > totalPaginas) {
      console.error(`Página inválida: ${nuevaPagina}. Debe estar entre 1 y ${totalPaginas}`);
      return;
    }
    
    // Actualizar el estado de la página actual
    setPaginaActual(nuevaPagina);
    
    // Cargar los trámites de la nueva página
    cargarPaperworks(nuevaPagina, filtroActivo);
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
                {['Por Procesar', 'Aprobado', 'Rechazado'].map((estado) => {
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
          <div className="col-span-1 flex flex-col items-center justify-center gap-2">
            <Paginador
              paginaActual={paginaActual}
              totalPaginas={totalPaginas}
              onPageChange={(pagina) => cargarPaperworks(pagina, filtroActivo)}
            />
            <button
              onClick={() => cargarTodosTramites(filtroActivo)}
              className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md transition-colors"
              disabled={isLoading}
            >
              {isLoading ? 'Cargando...' : 'Mostrar Todos los Trámites'}
            </button>
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
                {(isLoading) && (
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
                render: (row) => {
                  const estado = row.estadoTramite || '';
                  const estadoLower = estado.toLowerCase();
                  
                  // Definir clases de color para cada estado
                  let bgColorClass = 'bg-gray-100 text-gray-800';
                  let estadoDisplay = estado;
                  
                  // Asignar colores según el estado
                  if (estadoLower.includes('aprobado')) {
                    bgColorClass = 'bg-green-100 text-green-800';
                    estadoDisplay = 'APROBADO';
                  } else if (estadoLower.includes('rechazado')) {
                    bgColorClass = 'bg-red-100 text-red-800';
                    estadoDisplay = 'RECHAZADO';
                  } else if (estadoLower.includes('por procesar') || estadoLower.includes('porprocesar')) {
                    bgColorClass = 'bg-yellow-100 text-yellow-800';
                    estadoDisplay = 'POR PROCESAR';
                  }
                  
                  return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColorClass}`}>
                      {estadoDisplay}
                    </span>
                  );
                }
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
            rowKey="regTramite"
            actions={true}
            onEdit={handleEdit}
            showActions={{
              edit: true,
              delete: true,
              updatePermissions: false
            }}
          />
          
          {/* Componente de paginación */}
          <div className="w-full flex justify-center mt-4 mb-6">
            <Paginador 
              paginaActual={paginaActual} 
              totalPaginas={totalPaginas} 
              onChange={cambiarPagina}
            />
            <div className="ml-4 text-sm text-gray-600">
              Página {paginaActual} de {totalPaginas} | Total: {paperworks.length} trámites en esta página
            </div>
          </div>
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
            // Las bitácoras se actualizan en el backend al modificar un trámite.
            
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