import React, { useEffect, useState, useCallback, useRef } from 'react';
import { getEmpresas, deleteEmpresa, downloadTemplate, uploadTemplate, putEmpresa } from '../../services/company/CompanyService';
import ManagementDashboardLayout from '../../layouts/ManagementDashboardLayout';
import GenericTable from '../../components/common/GenericTable';
import ButtonGroup from '../../components/common/ButtonGroup';
import ConfirmEliminarModal from '../../components/common/ConfirmEliminarModal';
import SearchBar from '../../components/common/SearchBar';
import EmpresaUpdateModal from '../../components/empresa/EmpresaUpdateModal';
import EmpresaCreateModal from '../../components/empresa/EmpresaCreateModal';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import Paginador from '../../components/common/Paginador';

export default function EmpresasDashboard() {
  const { user, negocio } = useAuth();
  const { showSuccessMessage, showErrorMessage, showWarningMessage } = useNotification();
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
  const [showPlantillaMenu, setShowPlantillaMenu] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Ya no necesitamos estos estados porque usamos el contexto de notificaciones
  
  const searchTimeoutRef = useRef(null);
  const plantillaMenuRef = useRef(null);

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
          paginaActualRespuesta = response.currentPage || pagina;
        } else if (Array.isArray(response.Companies)) {
          listaEmpresas = response.Companies;
          totalDePaginas = response.TotalPages || 1;
          paginaActualRespuesta = response.Page || pagina;
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

      // Filtrar empresas sin un identificador válido y luego eliminar duplicados
      const empresasValidas = listaEmpresas.filter(empresa => 
        empresa.CodeCompany || empresa.codeCompany || empresa.codeEntity || empresa.CodeEntity
      );

      const empresasUnicas = Array.from(new Map(
        empresasValidas.map(empresa => [
          empresa.CodeCompany || empresa.codeCompany || empresa.codeEntity || empresa.CodeEntity,
          empresa
        ])
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
      // Buscar en businessName o BusinessName
      ((empresa.businessName && empresa.businessName.toLowerCase().includes(filtro.toLowerCase())) ||
       (empresa.BusinessName && empresa.BusinessName.toLowerCase().includes(filtro.toLowerCase()))) ||
      // Buscar en ruc o RUC
      ((empresa.ruc && empresa.ruc.toLowerCase().includes(filtro.toLowerCase())) ||
       (empresa.RUC && empresa.RUC.toLowerCase().includes(filtro.toLowerCase()))) ||
      // Buscar en commercialName o CommercialName
      ((empresa.commercialName && empresa.commercialName.toLowerCase().includes(filtro.toLowerCase())) ||
       (empresa.CommercialName && empresa.CommercialName.toLowerCase().includes(filtro.toLowerCase())))
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
      codeCompany: empresa.CodeCompany || empresa.codeCompany || empresa.codeEntity || empresa.CodeEntity,
      businessName: empresa.BusinessName || empresa.businessName,
      ruc: empresa.RUC || empresa.ruc,
      empresaCompleta: empresa
    });
    setEmpresaAEliminar(empresa);
    setMostrarModal(true);
  };

  const handleConfirmDelete = async () => {
    // Obtener el código de la empresa, considerando diferentes nombres de propiedad
    const codeCompany = empresaAEliminar?.CodeCompany || 
                       empresaAEliminar?.codeCompany || 
                       empresaAEliminar?.codeEntity || 
                       empresaAEliminar?.CodeEntity;
                       
    if (codeCompany) {
      try {
        await deleteEmpresa(codeCompany);
        // Mostrar mensaje de éxito
        showSuccessMessage('Empresa eliminada correctamente');
        // Recargar la página actual con los filtros aplicados
        await cargarEmpresas(paginaActual, filtro);
      } catch (error) {
        console.error('Error al eliminar la empresa:', error);
        showErrorMessage(`Error al eliminar la empresa: ${error.message || 'Error desconocido'}`);
      } finally {
        setEmpresaAEliminar(null);
        setMostrarModal(false);
      }
    } else {
      showWarningMessage('No se ha seleccionado una empresa para eliminar o falta el identificador.');
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
      // Si empresaActualizada es null, solo recargamos los datos
      // Esto ocurre cuando la actualización ya se realizó en EmpresaUpdateModal
      if (empresaActualizada) {
        await putEmpresa(empresaActualizada);
        showSuccessMessage('Empresa actualizada exitosamente');
      }
      
      // Recargar la página actual con los filtros aplicados
      await cargarEmpresas(paginaActual, filtro);
      setEmpresaAEditar(null);
      setMostrarModalEdicion(false);
    } catch (error) {
      console.error('Error al actualizar la empresa:', error);
      showErrorMessage(error.message || 'Error al actualizar la empresa.');
    }
  };

  const handleSaveEmpresa = async (nuevaEmpresa) => {
    try {
      // Recargar la página actual con los filtros aplicados
      await cargarEmpresas(paginaActual, filtro);
      setMostrarModalCreacion(false);
    } catch (error) {
      console.error('Error al crear la empresa:', error);
      showErrorMessage('Error al crear la empresa. Por favor, intente nuevamente.');
    }
  };
  
  // Ya no necesitamos esta función porque usamos el contexto de notificaciones
  
  // Función para descargar archivos
  const descargarArchivo = (blob, nombreArchivo) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo || 'empresas.xlsx';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  };
  
  // Función para descargar plantilla vacía
  const descargarPlantillaVacia = async () => {
    try {
      const blob = await downloadTemplate({
        Process: 'getCompanies',
        Page: 0  // Page = 0 indica al backend que debe generar una plantilla vacía
      });
      if (!blob || !(blob instanceof Blob)) throw new Error('El archivo recibido no es válido');
      if (blob.size === 0) throw new Error('El archivo recibido está vacío');
      descargarArchivo(blob, `empresas_plantilla_${new Date().toISOString().split('T')[0]}.xlsx`);
      showSuccessMessage('Plantilla vacía descargada exitosamente');
    } catch (error) {
      console.error('Error al descargar plantilla vacía:', error);
      showErrorMessage(error.message || 'Error al descargar la plantilla vacía');
    }
    setShowPlantillaMenu(false);
  };
  
  
  // Función para descargar todas las empresas
  const descargarTodasEmpresas = async () => {
    try {
      showSuccessMessage('Preparando la descarga de todas las empresas, esto puede tardar unos momentos...');
      const blob = await downloadTemplate({
        Process: 'getCompanies',  // Aseguramos que el nombre del parámetro coincida con lo que espera el backend
        Page: 1                 // Page = 1 indica al backend que debe exportar todas las empresas
      });
      if (!blob || !(blob instanceof Blob)) throw new Error('El archivo recibido no es válido');
      if (blob.size === 0) throw new Error('El archivo recibido está vacío');
      descargarArchivo(blob, `todas_empresas_${new Date().toISOString().split('T')[0]}.xlsx`);
      showSuccessMessage('Todas las empresas descargadas exitosamente');
    } catch (error) {
      console.error('Error al descargar todas las empresas:', error);
      showErrorMessage(error.message || 'Error al descargar todas las empresas');
    }
    setShowPlantillaMenu(false);
  };
  
  // Función para manejar la selección de archivo
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Función para subir plantilla
  const subirPlantilla = async (esActualizacion) => {
    if (!selectedFile) {
      showWarningMessage('Por favor, seleccione un archivo');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('Archivo', selectedFile);
      formData.append('EsActualizacion', esActualizacion);

      showSuccessMessage(esActualizacion ? 'Actualizando registros...' : 'Creando nuevos registros...');

      console.log('Enviando formData con los siguientes valores:', {
        archivo: selectedFile?.name,
        esActualizacionBoolean: esActualizacion,
        esActualizacionString: esActualizacion.toString()
      });

      const response = await uploadTemplate(formData);
      console.log('Respuesta recibida del servidor:', response);

      if (response instanceof Blob && response.type.includes('text')) {
        const reader = new FileReader();
        reader.onload = () => {
          showWarningMessage('La importación se completó con advertencias. Se ha descargado un archivo con los detalles.');
          descargarArchivo(response, `errores_importacion_${new Date().toISOString().split('T')[0]}.txt`);
        };
        reader.readAsText(response);
      } else {
        showSuccessMessage(esActualizacion ? 'Registros actualizados correctamente' : 'Registros creados correctamente');
      }

      setShowUploadModal(false);
      setSelectedFile(null);
      await cargarEmpresas(1, ''); // Recargar desde la primera página para ver los cambios
    } catch (error) {
      console.error('Error al subir plantilla:', error);
      showErrorMessage(error.message || 'Error al procesar la plantilla');
    }
  };

  // Efecto para cerrar el menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (plantillaMenuRef.current && !plantillaMenuRef.current.contains(event.target)) {
        setShowPlantillaMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <ManagementDashboardLayout title="EMPRESAS:" user={user} negocio={negocio}>
      <div className="bg-white p-4">
        <div className="grid grid-cols-3 items-center gap-2 mb-4 min-h-[48px]">
          <div className="flex gap-2">
            <ButtonGroup
              buttons={[{
                label: 'Nuevo',
                onClick: () => setMostrarModalCreacion(true),
                variant: 'normal',
                className: 'bg-white border-[#1e4e9c] border px-8 py-1 font-bold hover:text-white hover:bg-[#1e4e9c] w-full sm:w-auto'
              }]}
            />
            
            {/* Botón de Plantilla */}
            <div className="relative" ref={plantillaMenuRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPlantillaMenu(!showPlantillaMenu);
                }}
                className="flex items-center gap-1 bg-white border border-[#1e4e9c] text-[#1e4e9c] px-2 py-2 font-bold hover:text-white hover:bg-[#1e4e9c] rounded"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 11-2 0V4H5v11h4a1 1 0 110 2H4a1 1 0 01-1-1V3zm7 4a1 1 0 011-1h5a1 1 0 011 1v5a1 1 0 01-1 1h-5a1 1 0 01-1-1V7z" clipRule="evenodd" />
                </svg>
                Plantilla
              </button>
              {showPlantillaMenu && (
                <div className="absolute z-50 mt-1 w-64 bg-white rounded-md shadow-lg border border-gray-200">
                  <div className="py-1">
                    <button
                      onClick={descargarPlantillaVacia}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    >
                      Descargar Plantilla (vacía)
                    </button>
                    
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    >
                      Subir Plantilla
                    </button>
                    
                    <button
                      onClick={descargarTodasEmpresas}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    >
                      Actualizar Plantilla (descargar)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-center">
            <Paginador
              paginaActual={paginaActual}
              totalPaginas={totalPaginas}
              onPageChange={(pagina) => cargarEmpresas(pagina, filtroActivo)}
            />
          </div>
          
          <div className='flex justify-end items-center gap-2'>
          {filtroActivo && (
              <span className="bg-gray-200 px-2 py-1 rounded flex items-center ml-4">
                {filtroActivo}
                <button
                  onClick={handleClearSearch}
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
                  onChange={handleBuscar}
                  placeholder="Buscar por RUC o Razon Social..."
                  showClearButton={true}
                  onClear={handleClearSearch}
                  disabled={isLoading}
                   className="w-[300px]"
                />
                </div>
                {(isSearching || isLoading) && (
                  <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                  </div>
                )}
        </div>
        <div className="mb-4 overflow-x-auto">
          <GenericTable
            columns={[
              { 
                key: 'codeEntity', 
                label: 'Código',
                render: (row) => row.CodeCompany || row.codeCompany || row.CodeEntity || row.codeEntity || 'N/A'
              },
              { 
                key: 'businessName', 
                label: 'Razón Social',
                render: (row) => row.BusinessName || row.businessName || 'N/A'
              },
              { 
                key: 'commercialName', 
                label: 'Nombre Comercial',
                render: (row) => row.CommercialName || row.commercialName || 'N/A'
              },
              { 
                key: 'ruc', 
                label: 'RUC',
                render: (row) => row.RUC || row.ruc || 'N/A'
              },
              { 
                key: 'typeEntity', 
                label: 'Tipo',
                render: (row) => row.TypeEntity || row.typeEntity || 'N/A'
              },
              { 
                key: 'taxRegime', 
                label: 'Régimen',
                render: (row) => row.TaxRegime || row.taxRegime || 'N/A'
              },
              { 
                key: 'city', 
                label: 'Ciudad',
                render: (row) => row.City || row.city || 'N/A'
              },
              { 
                key: 'state', 
                label: 'Estado',
                render: (row) => {
                  const isActive = row.State !== undefined ? row.State : (row.state !== undefined ? row.state : true);
                  return isActive ? 
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Activo</span> : 
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded">Inactivo</span>;
                }
              }
            ]}
            data={empresas}
            rowKey={(row) => row.CodeCompany || row.codeCompany || row.CodeEntity || row.codeEntity}
            actions={true}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />
        </div>
        <ConfirmEliminarModal
          isOpen={mostrarModal}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          mensaje={`¿Está seguro que desea eliminar la empresa${empresaAEliminar ? ` "${empresaAEliminar.BusinessName || empresaAEliminar.businessName || empresaAEliminar.nombre || ''}${empresaAEliminar.RUC || empresaAEliminar.ruc ? ' (RUC: ' + (empresaAEliminar.RUC || empresaAEliminar.ruc) + ')' : ''}"` : ''}?`}
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
        
    {/* Modal para subir plantilla */}
    {showUploadModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl w-96">
          <h3 className="text-lg font-bold mb-4">Subir Plantilla</h3>
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">
                Seleccionar el archivo
              </label>
              <div className="relative">
                <div className="relative">
                  <div className="text-sm text-white bg-blue-500 hover:bg-blue-600 py-2 px-4 rounded-md font-medium cursor-pointer w-[100px] text-center">
                    Seleccionar
                    <input
                      type="file"
                      accept=".xlsx, .xls"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {selectedFile ? selectedFile.name : 'No se ha seleccionado ningún archivo'}
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setShowUploadModal(false);
                setSelectedFile(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 w-[100px] text-center"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                if (selectedFile) {
                  setShowUploadModal(false);
                  setShowConfirmModal(true);
                } else {
                  showErrorMessage('Por favor, seleccione un archivo');
                }
              }}
              disabled={!selectedFile}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md w-[100px] text-center ${selectedFile ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}>
              Subir
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Confirmación de actualización */}
    {showConfirmModal && (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[1000] p-4">
        <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-md">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Tipo de Importación</h3>
          <p className="mb-6 text-gray-700">
            ¿Necesita crear nuevos registros o actualizar registros existentes?
          </p>
          
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowConfirmModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex-1 sm:flex-none w-[100px]"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                setShowConfirmModal(false);
                subirPlantilla(false);
              }}
              className="px-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 flex-1 sm:flex-none w-[100px]"
            >
              Crear
            </button>
            <button
              type="button"
              onClick={() => {
                setShowConfirmModal(false);
                subirPlantilla(true);
              }}
              className="px-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex-1 sm:flex-none w-[100px]"
            >
              Actualizar
            </button>
          </div>
        </div>
      </div>
    )}
      </div>
    </ManagementDashboardLayout>
  );
}