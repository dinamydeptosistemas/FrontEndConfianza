import React, { useEffect, useState, useCallback, useRef } from 'react';
import { getPerfilesAcceso, deletePerfilAcceso, putPerfilAcceso, downloadTemplate, uploadTemplate } from '../../services/accessProfile/AccessProfileService';
import ManagementDashboardLayout from '../../layouts/ManagementDashboardLayout';
import ButtonGroup from '../../components/common/ButtonGroup';
import ConfirmEliminarModal from '../../components/common/ConfirmEliminarModal';
import SearchBar from '../../components/common/SearchBar';
import GenericTable from '../../components/common/GenericTable';
import PerfilAccesoUpdateModal from '../../components/accessprofile/PerfilAccesoUpdateModal';
import PerfilAccesoCreateModal from '../../components/accessprofile/PerfilAccesoCreateModal';
import { useAuth } from '../../contexts/AuthContext';
import Paginador from '../../components/common/Paginador';
import { useNotification } from '../../context/NotificationContext';



export default function PerfilAccesoDashboard() {
  const { user, negocio } = useAuth();
  const { showSuccessMessage, showErrorMessage } = useNotification();
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
  const [registrosprueba, setRegistrosprueba] = useState(7);
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [showExcelMenu, setShowExcelMenu] = useState(false);
  const excelMenuRef = useRef(null);
  const [mostrarModalSubirPlantilla, setMostrarModalSubirPlantilla] = useState(false);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [mostrarConfirmacionActualizacion, setMostrarConfirmacionActualizacion] = useState(false);
  
  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (excelMenuRef.current && !excelMenuRef.current.contains(event.target)) {
        setShowExcelMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Función para descargar un archivo desde un Blob
  const descargarArchivo = (blob, nombreArchivo) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo || 'perfiles_acceso.xlsx';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  };
  
  const confirmarSubirPlantilla = async (esActualizacion) => {
    setMostrarConfirmacionActualizacion(false);
    
    try {
      // Si es una descarga de plantilla
      if (esActualizacion === undefined) {
        const blob = await downloadTemplate({
          process: 'getAccessProfiles',
          page: 0
        });
        if (blob) {
          descargarArchivo(blob, 'plantilla_perfiles_acceso.xlsx');
          showSuccessMessage('Plantilla descargada exitosamente');
        }
        return;
      }
      const formData = new FormData();
      formData.append('Archivo', archivoSeleccionado);
      
      // Según el código del controlador backend, el parámetro se llama 'EsActualizacion' y es de tipo bool
      // ASP.NET Core model binding acepta varios formatos para booleanos, pero usaremos el formato estándar
      formData.append('EsActualizacion', esActualizacion);
      
      // Mostrar mensaje de carga
      showSuccessMessage(esActualizacion 
        ? 'Actualizando registros existentes...' 
        : 'Creando nuevos registros...');
      
      // Registrar los datos que se están enviando
      console.log('Enviando formData con los siguientes valores:', {
        archivo: archivoSeleccionado?.name,
        esActualizacionBoolean: esActualizacion,
        esActualizacionString: esActualizacion ? "true" : "false",
        esActualizacionNumber: esActualizacion ? 1 : 0
      });
      
      try {
        // Subir el archivo y esperar la respuesta
        const response = await uploadTemplate(formData);
        console.log('Respuesta recibida del servidor:', response);
        
        // Mostrar mensaje de éxito basado en la respuesta del servidor
        if (response && response.message) {
          showSuccessMessage(response.message);
        } else if (response && response.error) {
          throw new Error(response.error);
        } else {
          showSuccessMessage(esActualizacion 
            ? 'Registros actualizados correctamente' 
            : 'Registros creados correctamente');
        }
        
        // Recargar los perfiles después de la actualización
        cargarPerfiles(paginaActual, filtroActivo);
      } catch (error) {
        console.error('Error detallado al subir plantilla:', error);
        showErrorMessage(`Error al ${esActualizacion ? 'actualizar' : 'crear'} registros: ${error.message}`);
      }
      
      // Cerrar el modal y limpiar el estado
      setMostrarModalSubirPlantilla(false);
      setArchivoSeleccionado(null);
      
      // Recargar perfiles después de subir la plantilla
      cargarPerfiles(paginaActual, filtroActivo || '');
    } catch (error) {
      console.error('Error al subir plantilla:', error);
      showErrorMessage(error.message || 'Error al procesar el archivo');
    }
  };


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
    setTotalRegistros(data.totalRecords || 0);
    setRegistrosprueba(data.profilesInPrueba || 0)
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
        return;
      }
    }
    setPerfiles(encontrados);
    setPaginaActual(1);
    setTotalPaginas(1);
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
        showSuccessMessage('Perfil de acceso eliminado correctamente.');
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
      showSuccessMessage('Perfil de acceso actualizado exitosamente.');
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
      showSuccessMessage('Perfil de acceso creado exitosamente.');
    } catch (error) {
      alert('Error al crear el perfil de acceso.');
    }
  };

  return (
    <ManagementDashboardLayout 
    title={(

       <>
          <div>
            <span className="font-bold">PERFILES DE ACCESOS:</span>
            <span className="font-light w-100 text-[16px] ml-2">{`${totalRegistros} Total`}</span>
          </div>
          <span></span>
       
           {registrosprueba > 0 && (
            <span className="text-white flex justify-end">
              <p className='rounded-lg bg-red-400 w-8 px-2 py-1 text-center'>{`${registrosprueba}`}</p>
            </span>
          )}
        </>
      
      )} user={user} negocio={negocio}>
      <div className="bg-white border-b border-l border-r border-gray-300 rounded-b p-4">

<div className="grid grid-cols-3 items-center gap-2 mb-4 min-h-[48px]">
<div className="flex gap-2">
            <ButtonGroup
              buttons={[{
                label: 'Nuevo',
                onClick: () => setMostrarModalCreacion(true),
                variant: 'normal',
                className: 'bg-white border-[#1e4e9c] border px-8 py-1 font-bold hover:text-white hover:bg-[#1e4e9c]'
              }]}
            />
            <div className="relative" ref={excelMenuRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowExcelMenu(!showExcelMenu);
                }}
                className="flex items-center gap-1 bg-white border border-[#1e4e9c] text-[#1e4e9c] px-2 py-2 font-bold hover:text-white hover:bg-[#1e4e9c] rounded"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 11-2 0V4H5v11h4a1 1 0 110 2H4a1 1 0 01-1-1V3zm7 4a1 1 0 011-1h5a1 1 0 011 1v5a1 1 0 01-1 1h-5a1 1 0 01-1-1V7z" clipRule="evenodd" />
                </svg>
                Plantilla
              </button>
              {showExcelMenu && (
                <div className="absolute z-50 mt-1 w-64 bg-white rounded-md shadow-lg border border-gray-200">
                  <div className="py-1">
                    {/* Botón para descargar plantilla vacía */}
                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowExcelMenu(false);
                        try {
                          const blob = await downloadTemplate({
                            process: 'getAccessProfiles',
                            page: 0 // Página 0 para plantilla vacía
                          });
                          
                          if (!blob || !(blob instanceof Blob)) {
                            throw new Error('El archivo recibido no es válido');
                          }
                          
                          descargarArchivo(blob, 'plantilla_perfiles_acceso.xlsx');
                          showSuccessMessage('Plantilla descargada exitosamente');
                        } catch (error) {
                          console.error('Error al descargar la plantilla:', error);
                          showErrorMessage(error.message || 'Error al descargar la plantilla');
                        }
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    >
                      Descargar Plantilla (vacía)
                    </button>
                    
                    {/* Botón para subir plantilla */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setMostrarModalSubirPlantilla(true);
                        setShowExcelMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    >
                      Subir Plantilla
                    </button>
                    
                    {/* Botón para exportar datos */}
                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        try {
                          console.log('Iniciando exportación de perfiles de acceso');
                          const blob = await downloadTemplate({
                            process: 'getAccessProfiles',
                            page: 1, // Solicitar todos los registros, no plantilla vacía
                            ...(filtroActivo && { searchTerm: filtroActivo })
                          });
                          
                          if (!blob || !(blob instanceof Blob)) {
                            throw new Error('El archivo recibido no es válido');
                          }
                          
                          if (blob.size === 0) {
                            throw new Error('No hay datos para exportar');
                          }
                          
                          descargarArchivo(blob, `perfiles_acceso_exportacion_${new Date().toISOString().split('T')[0]}.xlsx`);
                          showSuccessMessage('Exportación completada exitosamente');
                        } catch (error) {
                          console.error('Error al exportar datos:', error);
                          showErrorMessage(error.message || 'Error al exportar los datos');
                        }
                        setShowExcelMenu(false);
                      }}
                      className="block w-full text-sm text-left px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    >
                      Actualizar Plantilla (descargar)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="w-full flex justify-center">
            <div className="w-full sm:w-auto">
              <Paginador
                paginaActual={paginaActual}
                totalPaginas={totalPaginas}
                onPageChange={(p) => cargarPerfiles(p, filtroActivo)}
              />
            </div>
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
              placeholder="Buscar por Perfil..."
              className="w-[300px]"
              debounceTime={300}
            />
          </div>
        </div>
        <div className="mb-4 overflow-x-auto">
          <GenericTable
            columns={[
              { key: 'idFunction', label: 'ID', align: 'right' },
              { key: 'functionName', label: 'Nombre del Perfil', align: 'left' },
              { 
                key: 'grantPermissions', 
                label: 'Dar Permisos', 
                align: 'center',
                render: row => (
                  <span className={`px-2 py-1 rounded-full text-xs flex items-center justify-center ${
                    row.grantPermissions ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`} style={{ minWidth: 32 }}>
                    {row.grantPermissions ? 'Sí' : 'No'}
                  </span>
                )
              },
              { 
                key: 'allModules', 
                label: 'Todos Mod', 
                align: 'center',
                render: row => (
                  <span className={`px-2 py-1 rounded-full text-xs flex items-center justify-center ${
                    row.allModules ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`} style={{ minWidth: 32 }}>
                    {row.allModules ? 'Sí' : 'No'}
                  </span>
                )
              },
               { 
                key: 'externalModules', 
                label: 'Externos Mod',
                align: 'center',
                render: row => (
                  <span className={`px-2 py-1 rounded-full text-xs flex items-center justify-center ${row.externalModules }`} style={{ minWidth: 32 }}>
                    {row.externalModules ? 'Sí' : 'No'}
                  </span>
                )
              },
              { 
                key: 'administration', 
                label: 'Admin',
                align: 'center',
                render: row => (
                  <span className={`px-2 py-1 rounded-full text-xs flex items-center justify-center ${row.administration }`} style={{ minWidth: 32 }}>
                    {row.administration ? 'Sí' : 'No'}
                  </span>
                )
              },
             
              { 
                key: 'product', 
                label: 'Producto',
                align: 'center',
                render: row => (
                 <span className={`px-2 py-1 rounded-full text-xs flex items-center justify-center ${row.product }`} style={{ minWidth: 32 }}>
                    {row.product ? 'Sí' : 'No'}
                  </span>
                )
              },

              { 
                key: 'inventory', 
                label: 'Inventario',
                align: 'center',
                render: row => (
                 <span className={`px-2 py-1 rounded-full text-xs flex items-center justify-center ${row.inventory }`} style={{ minWidth: 32 }}>
                    {row.inventory ? 'Sí' : 'No'}
                  </span>
                )
              } , 
              { 
                key: 'purchase', 
                label: 'Compras',
                align: 'center',
                render: row => (
                  <span className={`px-2 py-1 rounded-full text-xs flex items-center justify-center ${row.purchase }`} style={{ minWidth: 32 }}>
                    {row.purchase ? 'Sí' : 'No'}
                  </span>
                )
              },
              { 
                key: 'sale', 
                label: 'Ventas',
                align: 'center',
                render: row => (
                  <span className={`px-2 py-1 rounded-full text-xs flex items-center justify-center ${row.sale }`} style={{ minWidth: 32 }}>
                    {row.sale ? 'Sí' : 'No'}
                  </span>
                )
              },
               //generalCash
               { 
                key: 'CashRegister', 
                label: 'Caja',
                align: 'center',
                render: row => (
                  <span className={`px-2 py-1 rounded-full text-xs flex items-center justify-center ${row.CashRegister }`} style={{ minWidth: 32 }}>
                    {row.cashRegister ? 'Sí' : 'No'}
                  </span>
                )
              },
               { 
                key: 'bank', 
                label: 'Banco',
                align: 'center',
                render: row => (
                  <span className={`px-2 py-1 rounded-full text-xs flex items-center justify-center ${row.bank }`} style={{ minWidth: 32 }}>
                    {row.bank ? 'Sí' : 'No'}
                  </span>
                )
              },
              { 
                key: 'accounting', 
                label: 'Contabilidad',
                align: 'center',
                render: row => (
                  <span className={`px-2 py-1 rounded-full text-xs flex items-center justify-center ${row.accounting }`} style={{ minWidth: 32 }}>
                    {row.accounting ? 'Sí' : 'No'}
                  </span>
                )
              },
               { 
                key: 'payroll', 
                label: 'Nomina',
                align: 'center',
                render: row => (
                  <span className={`px-2 py-1 rounded-full text-xs flex items-center justify-center ${row.payroll }`} style={{ minWidth: 32 }}>
                    {row.payroll ? 'Sí' : 'No'}
                  </span>
                )
              } ,
              // fixedAsset
               { 
                key: 'fixedAsset', 
                label: 'Activo Fijo',
                align: 'center',
                render: row => (
                  <span className={`px-2 py-1 rounded-full text-xs flex items-center justify-center ${row.fixedAsset }`} style={{ minWidth: 32 }}>
                    {row.fixedAsset ? 'Sí' : 'No'}
                  </span>
                )
              },
              // generalCash
                { 
                key: 'generalCash', 
                label: 'Caja General',
                align: 'center',
                render: row => (
                  <span className={`px-2 py-1 rounded-full text-xs flex items-center justify-center ${row.generalCash }`} style={{ minWidth: 32 }}>
                    {row.generalCash ? 'Sí' : 'No'}
                  </span>
                )
              },
                 { 
                key: 'closeCashGen', 
                label: 'Cierre Caja Gen',
                align: 'center',
                render: row => (
                  <span className={`px-2 py-1 rounded-full text-xs flex items-center justify-center ${row.closeCashGen }`} style={{ minWidth: 32 }}>
                    {row.closeCashGen ? 'Sí' : 'No'}
                  </span>
                )
              } 
              ,
             
            ]}
            data={perfiles}
            rowKey="idFunction"
            actions={true}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
             rowClassName={(row) => {
              const enviroment = (row.enviroment || row.environment || '').toUpperCase();
              if (enviroment === 'PRUEBA') {
                return 'bg-red-100';
              }
              return '';
            }}
          />
        </div>
      <ConfirmEliminarModal
        isOpen={mostrarModal}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        mensaje={`¿Está seguro que desea eliminar el perfil de acceso${perfilAEliminar ? ` "${perfilAEliminar.functionName || perfilAEliminar.nombre || perfilAEliminar.code || perfilAEliminar.codigo || perfilAEliminar.id || 'Sin nombre'}"` : ''}?`}
      />
      {mostrarModalBloqueo && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <p>No se puede eliminar este perfil de acceso.</p>
            <div className="flex justify-end mt-4">
              <button 
                onClick={() => setMostrarModalBloqueo(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
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
    {/* El componente de notificación ahora es manejado por el NotificationContext */}
    
    {/* Modal para subir plantilla */}
    {mostrarModalSubirPlantilla && (
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
                      onChange={(e) => setArchivoSeleccionado(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {archivoSeleccionado ? archivoSeleccionado.name : 'No se ha seleccionado ningún archivo'}
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setMostrarModalSubirPlantilla(false);
                setArchivoSeleccionado(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 w-[100px] text-center"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                if (archivoSeleccionado) {
                  setMostrarConfirmacionActualizacion(true);
                } else {
                  showErrorMessage('Por favor, seleccione un archivo');
                }
              }}
              disabled={!archivoSeleccionado}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md w-[100px] text-center ${
                archivoSeleccionado 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Subir
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Confirmación de actualización */}
    {mostrarConfirmacionActualizacion && (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[1000] p-4">
        <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-md">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Tipo de Importación</h3>
          <p className="mb-6 text-gray-700">
            ¿Necesita crear nuevos registros o actualizar registros existentes?
          </p>
          
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={() => setMostrarConfirmacionActualizacion(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex-1 sm:flex-none w-[100px]"
            >
              Cancelar
            </button>
            {mostrarModalSubirPlantilla && (
              <>
                <button
                  type="button"
                  onClick={() => confirmarSubirPlantilla(false)}
                  className="px-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 flex-1 sm:flex-none w-[100px]"
                >
                  Crear
                </button>
                <button
                  type="button"
                  onClick={() => confirmarSubirPlantilla(true)}
                  className="px-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex-1 sm:flex-none w-[100px]"
                >
                  Actualizar
                </button>
              </>
            )}
            {!mostrarModalSubirPlantilla && (
              <button
                type="button"
                onClick={() => confirmarSubirPlantilla()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex-1 sm:flex-none"
              >
                Descargar Plantilla
              </button>
            )}
          </div>
        </div>
      </div>
    )}
    
    {/* El modal de confirmación para actualización ha sido reemplazado por el nuevo diseño arriba */}
  </ManagementDashboardLayout>
);

}