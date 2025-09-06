import React, { useEffect, useState, useCallback } from 'react';
import ManagementDashboardLayout from '../../layouts/ManagementDashboardLayout';
import GenericTable from '../../components/common/GenericTable';
import SearchBar from '../../components/common/SearchBar';
import ConfirmEliminarModal from '../../components/common/ConfirmEliminarModal';
import Paginador from '../../components/common/Paginador';
import PermisosModal from '../../components/bitacora/PermisosModal';
import { useAuth } from '../../contexts/AuthContext';

import { getBitacora } from '../../services/bitacora/BitacoraService';
import axiosInstance from '../../config/axios';
import { putPermiso, getPermisos } from '../../services/permission/PermissionService';

export default function BitacoraDashboard() {
  // Estado para el total de bitácoras
  const [totalRecords, setTotalRecords] = useState(0);
  const { user, negocio  } = useAuth();
  const [bitacoras, setBitacoras] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [loading, setLoading] = useState(false);
  const [modalExito, setModalExito] = useState({ open: false, mensaje: '' });
  const [registroSeleccionado, setRegistroSeleccionado ] = useState(null);
  const [modalFiltros, setModalFiltros] = useState(false);

  const cargarBitacora = useCallback(async (pagina = 1, filtroBusqueda = '', estado = '') => {
    setLoading(true);
    const params = { page: pagina, pageSize: 25 };
    if (filtroBusqueda) params.username = filtroBusqueda;
    if (estado) params.estadoSesion = estado;
    try {
      const data = await getBitacora(params);
      console.log('Respuesta getBitacora:', data);
      let registros = data.bitacoras || data.logs || [];
      // Si no es array, pero es un objeto
      if (!Array.isArray(registros) && typeof registros === 'object' && registros !== null) {
        const claves = Object.keys(registros);
        const esNumerico = claves.length > 0 && claves.every(k => !isNaN(Number(k)));
        if (esNumerico) {
          registros = Object.values(registros);
        } else {
          // Si es un objeto plano (un solo registro), lo envolvemos en un array
          registros = [registros];
        }
      }
      setBitacoras(registros);
      setTotalRecords(data.totalRecords || (Array.isArray(registros) ? registros.length : 0));
      console.log('Bitácoras mostradas:', registros);
      setPaginaActual(pagina);
      setTotalPaginas(data.totalPages || 1);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarBitacora(1, '', '');
  }, [cargarBitacora]);

  const handleBuscar = (valor) => {
    setFiltro(valor);
    cargarBitacora(1, valor, estadoFiltro);
  };
  const handleFiltroEstado = (estado) => {
    setEstadoFiltro(estado);
    cargarBitacora(1, filtro, estado);
  };

  const handlePermiso = (row) => {
    setModalPermisos({
      open: true,
      userId: row.idUser,
      userName: row.userName || `Usuario ${row.idUser}`
    });
  };

  const handlePermisosUpdated = async (permisoData) => {
    try {
      console.log('Actualizando permisos con datos:', permisoData);
      // 1. Actualizar los permisos en el servidor
      const response = await putPermiso(permisoData);
      console.log('Respuesta del servidor:', response);
      
      // 2. Verificar si la respuesta indica éxito
      if (!response || response.success === false) {
        throw new Error(response?.message || 'La actualización de permisos no fue exitosa');
      }
      
      // 3. Actualizar la bitácora después de modificar permisos
      await cargarBitacora(paginaActual, filtro, estadoFiltro);
      
      // 4. Retornar true para indicar éxito
      // El mensaje de éxito se mostrará desde el PermisosModal
      return true;
      
    } catch (error) {
      console.error('Error al actualizar permisos:', error);
      
      // El mensaje de error se mostrará desde el PermisosModal
      // Solo propagamos el error para que lo maneje el componente hijo
      throw error;
    }
  };


  // Estado para el modal de confirmación de bloqueo
  const [modalBloqueo, setModalBloqueo] = useState({ open: false, registro: null });
  const [modalPermisos, setModalPermisos] = useState({
    open: false,
    userId: null,
    userName: ''
  });
  
  // Estado para mensajes de éxito/error (ya no se usa, se mantiene para compatibilidad)

  const handleToggleBloqueo = (row) => {
    setModalBloqueo({ 
      open: true, 
      registro: row,
      mensaje: `¿Está seguro que desea ${row.bloqueoSesionMaxima ? 'desbloquear' : 'bloquear'} al usuario ${row.username || row.idUser}?`
    });
  };

  const handleConfirmarBloqueo = async () => {
    const row = modalBloqueo.registro;
    if (!row) {
      console.error('No se ha seleccionado ningún registro para bloquear/desbloquear');
      setModalExito({
        open: true,
        mensaje: 'Error: No se ha seleccionado ningún registro para bloquear/desbloquear'
      });
      return;
    }
    
    try {
      // 1. Validar datos requeridos
      if (!row.regAcceso) {
        throw new Error('El ID de acceso es requerido');
      }
      
      if (!row.idUser) {
        throw new Error('El ID de usuario es requerido');
      }
      
      console.log(`Iniciando ${row.bloqueoSesionMaxima ? 'desbloqueo' : 'bloqueo'} del usuario ID: ${row.idUser}`);
      
      // 2. Primero obtenemos los permisos actuales del usuario para asegurarnos de tener el regPermiso correcto
      const responsePermisoActual = await getPermisos({ idUser: row.idUser });
      console.log('Permisos actuales del usuario:', responsePermisoActual);
      
      // Extraer el primer permiso del array de permisos (si existe)
      const permisoActual = Array.isArray(responsePermisoActual?.permissions) ? 
                          responsePermisoActual.permissions[0] : 
                          responsePermisoActual?.data?.[0] || null;
      
      if (!permisoActual) {
        throw new Error('No se pudo obtener la información de permisos del usuario');
      }
      
      console.log('Permiso actual del usuario:', permisoActual);
      
      const nuevoEstadoBloqueo = !row.bloqueoSesionMaxima;
      const codigoEntidad = user?.codigoEmpresa || '999';
      const userioResponsable = user?.userName || 'SISTEMA';
      
      // Usar el regPermiso del permiso actual del usuario
      const regPermiso = permisoActual.regPermiso || 0;
      
      // Crear el objeto de solicitud con el formato exacto que espera el backend
      const permisoData = {
        idUser: parseInt(row.idUser, 10) || 0,
        idFunction: 1, // ID de función por defecto
        regPermiso: regPermiso, // Usar el regPermiso del registro actual
        codigoEntidad: codigoEntidad,
        estadoPermisoActivado: true, // Debe ser booleano
        permitirTodasEmpresas: true, // Debe ser booleano según el error
        permitirMasDeUnaSesion: true, // Debe ser booleano según el error
        cierreSesionJornada: 0, // 0 para false
        bloqueoSesionMaxima: nuevoEstadoBloqueo ? 1 : 0, // 1 para true, 0 para false
        userioResponsable: userioResponsable,
        estado: nuevoEstadoBloqueo ? 2 : 1, // 2 para bloqueado, 1 para activo
        fechaInicioPermiso: null,
        fechaFinalPermiso: null
      };
      
      // Crear el objeto request que se enviará al backend
      const requestData = {
        process: 'putPermissions',
        CodigoEntidad: codigoEntidad,
        UserioResponsable: userioResponsable,
        ...permisoData
      };
      
      console.log('Enviando datos de permiso al servidor:', JSON.stringify(requestData, null, 2));
      
      const responsePermiso = await putPermiso(requestData);
      
      if (!responsePermiso || responsePermiso.success === false) {
        throw new Error(responsePermiso?.message || 'Error al actualizar los permisos del usuario');
      }
      
      console.log('Permisos actualizados correctamente:', responsePermiso);
      
      // 3. Luego actualizamos el estado en la bitácora
      // Primero, construimos el objeto con la estructura que espera el backend
      const bitacoraUpdate = {
        process: 'putBitacora',
        CodigoEntidad: codigoEntidad,
        UserioResponsable: userioResponsable,
        // Incluir los campos del registro actual
        ...row,
        // Sobrescribir los campos que necesitan actualización
        bloqueoSesionMaxima: nuevoEstadoBloqueo, // Como booleano
        estadoSesion: nuevoEstadoBloqueo ? 'bloqueado' : 'activo', // Como string
        // Asegurarse de que los campos requeridos estén presentes
        idUser: row.idUser,
        regAcceso: row.regAcceso,
        // Agregar campos de auditoría
        fechaActualizacion: new Date().toISOString(),
        usuarioActualizacion: userioResponsable
      };
      
      // Eliminar campos que podrían causar problemas
      delete bitacoraUpdate.__v;
      delete bitacoraUpdate._id;
      
      console.log('Actualizando bitácora con datos:', JSON.stringify(bitacoraUpdate, null, 2));
      
      // 4. Actualizar la bitácora
      let responseBitacora = null;
      try {
        // Usar la instancia configurada de axios
        const response = await axiosInstance.post('/api/Bitacora/Process', bitacoraUpdate);
        responseBitacora = response.data;
        
        if (!responseBitacora) {
          console.warn('No se recibió respuesta del servidor al actualizar la bitácora');
        } else {
          console.log('Respuesta de la bitácora:', responseBitacora);
          
          // Verificar si la respuesta es exitosa según la estructura esperada
          const isSuccess = (responseBitacora && 
                           (responseBitacora.status === 'SUCCESS' || 
                            responseBitacora.success === true || 
                            response.status === 200));
          
          if (!isSuccess) {
            const errorMessage = responseBitacora?.message || 
                              responseBitacora?.data?.message || 
                              'Error desconocido al actualizar la bitácora';
            console.warn('Advertencia al actualizar la bitácora:', errorMessage);
          } else {
            console.log('Bitácora actualizada correctamente');
          }
        }
      } catch (error) {
        console.warn('Error al actualizar la bitácora:', error.message);
        // Si hay un error en la respuesta, intentamos extraer más detalles
        if (error.response?.data) {
          console.warn('Detalles del error del servidor:', error.response.data);
          // Si hay errores de validación, mostrarlos
          if (error.response.data.errors) {
            console.warn('Errores de validación:', error.response.data.errors);
          }
        }
      }
      
      console.log('Bitácora actualizada correctamente:', responseBitacora);
      
      // 4. Mostrar mensaje de éxito
      const accion = row.bloqueoSesionMaxima ? 'desbloqueado' : 'bloqueado';
      setModalExito({
        open: true,
        mensaje: `Usuario ${accion} correctamente`
      });
      
      // 5. Cerrar el modal y actualizar la tabla
      setModalBloqueo({ open: false, registro: null });
      await cargarBitacora(paginaActual, filtro, estadoFiltro);
      
    } catch (error) {
      console.error('Error al actualizar el bloqueo:', error);
      
      // Extraer mensaje de error de la respuesta si está disponible
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Error desconocido al procesar la solicitud';
      
      alert(`Error al ${row.bloqueoSesionMaxima ? 'desbloquear' : 'bloquear'} el usuario: ${errorMessage}`);
      
      // Cerrar el modal de confirmación
      setModalBloqueo(prev => ({ ...prev, open: false }));
    }
  };

  // Función acciones para la columna de acciones de la tabla
  const acciones = (row) => (
    <div className="flex gap-2 justify-center">
      <button 
        title="Gestionar Permisos" 
        className="p-2 border-2 border-blue-500 text-blue-500 hover:bg-blue-50 rounded transition-colors w-8 h-8 flex items-center justify-center" 
        onClick={() => handlePermiso(row)}
      >
        <i className="fa fa-user-cog" />
      </button>
      <button 
        title="Bloquear Usuario" 
        className="p-2 border-2 border-red-500 text-red-500 hover:bg-red-50 rounded transition-colors w-8 h-8 flex items-center justify-center" 
        onClick={() => handleToggleBloqueo(row)}
      >
        <i className="fa fa-user-lock" />
      </button>
    </div>
  );

  // Definición de columnas para la tabla
  const columnas = [
    { key: 'acciones', label: 'Acciones', render: acciones },
    { key: 'regAcceso', label: 'ID Acceso' },
    { key: 'idUser', label: 'ID Usuario' },
    { key: 'username', label: 'Usuario' },
    { 
      key: 'accesoFechaInicial', 
      label: 'Fecha Ingreso', 
      render: row => row.accesoFechaInicial ? new Date(row.accesoFechaInicial).toLocaleDateString() : 'N/A' 
    },
    { 
      key: 'horaDeIngreso', 
      label: 'Hora Ingreso',
      render: row => row.horaDeIngreso || 'N/A'
    },
    { 
      key: 'accesoFechaFinal', 
      label: 'Fecha Salida', 
      render: row => row.accesoFechaFinal ? new Date(row.accesoFechaFinal).toLocaleDateString() : 'N/A' 
    },
    { 
      key: 'horaDeSalida', 
      label: 'Hora Salida',
      render: row => row.horaDeSalida || 'N/A'
    },
    { 
      key: 'ventanaIngreso', 
      label: 'Ventana Ingreso',
      render: row => row.ventanaIngreso || 'N/A'
    },
    { 
      key: 'estadoSesion', 
      label: 'Estado', 
      render: row => {
        if (row.estadoSesion === '1') return 'Activo';
        if (row.estadoSesion === '0') return 'Cerrado';
        if (row.estadoSesion === '2' || row.estadoSesion === 'BLOQUEADO') return 'Bloqueado';
        return row.estadoSesion || 'N/A';
      }
    },
    { 
      key: 'bloqueoSesionMaxima', 
      label: 'Bloqueo Máx.', 
      render: row => row.bloqueoSesionMaxima ? 'Sí' : 'No' 
    }
  ];

  // No se necesitan botones principales

  return (
    <ManagementDashboardLayout title={(
        <>
          <span className="font-bold">BITACORA DE ACCESO:</span>
          <span className="font-light ml-5 text-[16px]">
            {`${totalRecords} `}
            {
              estadoFiltro === '1' ? 'Activos' :
              estadoFiltro === '2' ? 'Bloqueados' :
              estadoFiltro === '0' ? 'Cerrados' :
              'Total'
            }
          </span>
        </>
      )} >
      <div className="bg-white border-b border-l border-r border-gray-300 rounded-b p-4">
        {/* Botón para abrir modal de filtros */}
    
        {/* Modal de filtros */}
        {modalFiltros && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
              <div className="p-4  flex justify-between items-center">
                <h3 className="text-[24px] font-semibold">Filtros de Bitácora</h3>
             
              </div>
              
              {/* Contenido del modal - Formulario de filtros */}
              <form onSubmit={(e) => {
                e.preventDefault();
                cargarBitacora(1, filtro, estadoFiltro);
                setModalFiltros(false);
              }} className="p-6">
                <div className="mb-6">
                  <fieldset className="rounded p-4">
                    <legend className="text-sm font-semibold px-2">Estado de sesión:</legend>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="inline-flex items-center">
                        <input 
                          type="radio" 
                          name="estado" 
                          value="" 
                          checked={estadoFiltro === ''} 
                          onChange={() => handleFiltroEstado('')} 
                          className="form-radio h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2">Todos</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input 
                          type="radio" 
                          name="estado" 
                          value="1" 
                          checked={estadoFiltro === '1'} 
                          onChange={() => handleFiltroEstado('1')} 
                          className="form-radio h-4 w-4 text-green-600"
                        />
                        <span className="ml-2">Activo</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input 
                          type="radio" 
                          name="estado" 
                          value="0" 
                          checked={estadoFiltro === '0'} 
                          onChange={() => handleFiltroEstado('0')} 
                          className="form-radio h-4 w-4 text-gray-600"
                        />
                        <span className="ml-2">Cerrado</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input 
                          type="radio" 
                          name="estado" 
                          value="2" 
                          checked={estadoFiltro === '2'} 
                          onChange={() => handleFiltroEstado('2')} 
                          className="form-radio h-4 w-4 text-red-600"
                        />
                        <span className="ml-2">Bloqueado</span>
                      </label>
                    </div>
                  </fieldset>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Búsqueda por texto:</label>
                  <input
                    type="text"
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    placeholder="Buscar usuario, acción o descripción..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                {/* Botones de acción del formulario */}
                <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                  <button 
                    type="button" 
                    onClick={() => {
                      setFiltro('');
                      handleFiltroEstado('');
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                  >
                    Limpiar filtros
                  </button>
           
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Aplicar filtros
                  </button>

                  <button 
                    type="button"
                    onClick={() => setModalFiltros(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Panel de detalle */}
        {registroSeleccionado && (
          <div className="bg-gray-50 border border-blue-200 rounded p-4 mb-4">
            <div className="font-bold text-blue-800 mb-2">Detalle de Registro</div>
            <div className="grid grid-cols-2 gap-2">
              <div><b>ID Acceso:</b> {registroSeleccionado.regAcceso || 'N/A'}</div>
              <div><b>ID Usuario:</b> {registroSeleccionado.idUser || 'N/A'}</div>
              <div><b>Usuario:</b> {registroSeleccionado.username || 'N/A'}</div>
              <div><b>Fecha Ingreso:</b> {registroSeleccionado.accesoFechaInicial ? new Date(registroSeleccionado.accesoFechaInicial).toLocaleString() : 'N/A'}</div>
              <div><b>Hora Ingreso:</b> {registroSeleccionado.horaDeIngreso || 'N/A'}</div>
              <div><b>Ventana Ingreso:</b> {registroSeleccionado.ventanaIngreso || 'N/A'}</div>
              <div><b>Fecha Final:</b> {registroSeleccionado.accesoFechaFinal ? new Date(registroSeleccionado.accesoFechaFinal).toLocaleString() : 'N/A'}</div>
              <div><b>Hora Salida:</b> {registroSeleccionado.horaDeSalida || 'N/A'}</div>
              <div><b>Ventana Salida:</b> {registroSeleccionado.ventanaSalida || 'N/A'}</div>
              <div><b>Estado:</b> {registroSeleccionado.estadoSesion === '1' ? 'Activo' : 
                                 registroSeleccionado.estadoSesion === '0' ? 'Cerrado' : 
                                 (registroSeleccionado.estadoSesion === '2' || registroSeleccionado.estadoSesion === 'BLOQUEADO') ? 'Bloqueado' : 
                                 registroSeleccionado.estadoSesion || 'N/A'}</div>
              <div><b>Sesión Suspendida:</b> {registroSeleccionado.sesionSuspendida ? 'Sí' : 'No'}</div>
              <div><b>Número de Horas:</b> {registroSeleccionado.numeroDeHoras != null ? registroSeleccionado.numeroDeHoras.toFixed(1) : 'N/A'}</div>
              <div><b>Cumplió Jornada:</b> {registroSeleccionado.cumplioJornada ? 'Sí' : 'No'}</div>
              <div><b>Bloqueo Máx.:</b> {registroSeleccionado.bloqueoSesionMaxima ? 'Sí' : 'No'}</div>
              <div><b>Token Sesión:</b> {registroSeleccionado.tokenSession || 'N/A'}</div>
            </div>
          </div>
        )}

        {/* Modal de confirmación de bloqueo */}
        <ConfirmEliminarModal
          isOpen={modalBloqueo.open}
          onCancel={() => setModalBloqueo({ open: false, registro: null })}
          onConfirm={handleConfirmarBloqueo}
          titulo="Confirmar Bloqueo"
          mensaje={modalBloqueo.mensaje || '¿Está seguro de realizar esta acción?'}
          textoBotonConfirmar={modalBloqueo.registro?.bloqueoSesionMaxima ? 'Desbloquear' : 'Bloquear'}
          colorBotonConfirmar="red"
        />
        <div className="flex items-center justify-between mb-4 h-[48px]">
          <div className="flex items-center">
          <button 
              onClick={() => setModalFiltros(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <i className="fa fa-filter"></i> Filtros
            </button>
            {/* Mostrar indicadores de filtros activos */}
            {(filtro || estadoFiltro) && (
              <div className="text-sm text-gray-600">
                Filtros activos: 
                {estadoFiltro && <span className="ml-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Estado: {estadoFiltro}</span>}
                {filtro && <span className="ml-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Búsqueda: {filtro}</span>}
              </div>
            )}
          </div>
          
          <div className="flex items-center">
            <Paginador
              paginaActual={paginaActual}
              totalPaginas={totalPaginas}
              onPageChange={(p) => cargarBitacora(p, filtro, estadoFiltro)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <SearchBar 
              value={filtro} 
              className="w-[300px]" 
              onChange={e => handleBuscar(e.target.value)} 
              placeholder="Buscar por usuario..." 
            />
         
          </div>
        </div>
        {/* Tabla de bitácora */}
        <GenericTable
          columns={columnas}
          data={bitacoras}
          loading={loading}
          rowKey="regAcceso"
          showActions={{
            edit: false,
            delete: false,
            updatePermissions: false
          }}
          onRowClick={row => {
            setRegistroSeleccionado(row);
          }}
          rowClassName={row => registroSeleccionado && row && (row.regAcceso === registroSeleccionado.regAcceso) ? 'bg-blue-100' : ''}
        />
 
        {/* Modales */}
  
        {/* Modal de éxito para bloqueo/desbloqueo de usuarios */}
        {modalExito.open && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-20">
            <div className="bg-white p-6 rounded shadow">
              <div className="text-green-700 font-bold mb-2">{modalExito.mensaje}</div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={() => setModalExito({ open: false, mensaje: '' })}>Aceptar</button>
            </div>
          </div>
        )}

        {/* Modal de permisos */}
        <PermisosModal
          isOpen={modalPermisos.open}
          onClose={() => setModalPermisos({ ...modalPermisos, open: false })}
          userId={modalPermisos.userId}
          userName={modalPermisos.userName}
          onUpdate={handlePermisosUpdated}
        />
        
        {/* El componente de notificación ahora es manejado por el NotificationContext */}
      </div>
    </ManagementDashboardLayout>
  );
}
