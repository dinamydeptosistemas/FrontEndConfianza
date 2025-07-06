import React, { useState, useEffect, useCallback } from 'react';
import { getPermisos } from '../../services/permission/PermissionService';
import { getPerfilesAcceso } from '../../services/accessProfile/AccessProfileService';
import {  getUsers } from '../../services/user/UserService';
import { getEmpresas } from '../../services/company/CompanyService';
import { useAuth } from '../../contexts/AuthContext';
import ActionButtons, { LoadingOverlay } from '../common/Buttons';



const PermisosModal = ({ isOpen, onClose, userId, onUpdate  }) => {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    idPermiso: '',
    idUser: '',
    idFunction: '',
    estadoPermisoActivado: false,
    permitirTodasEmpresas: false,
    permitirMasDeUnaSesion: false,
    cierreSesionJornada: 0,
    bloqueoSesionMaxima: 0,
    userioResponsable: user?.userName, // Usar el nombre de usuario actual como valor por defecto
    codigoEntidad: user?.codigoEmpresa, // Usar el código de empresa del usuario o '999' como valor por defecto
    function: '',
    fechaInicioPermiso: '',
    fechaFinalPermiso: ''
  });
  
  const [userInfo, setUserInfo] = useState(null);

  const _updateUserInfoState = useCallback((newUserInfo) => {
    setUserInfo(newUserInfo);
  }, []); // setUserInfo from useState is stable

  const [showCurrentValues, setShowCurrentValues] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [modalExito, setModalExito] = useState({ open: false, mensaje: '', esError: false });
  
  // Efecto para cerrar automáticamente el mensaje de éxito después de 3 segundos
  useEffect(() => {
    if (modalExito.open && !modalExito.esError) {
      const timer = setTimeout(() => {
        setModalExito(prev => ({ ...prev, open: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [modalExito.open, modalExito.esError]);
  
  const [perfiles, setPerfiles] = useState([]);
  const [loadingPerfiles, setLoadingPerfiles] = useState(true);
  const [empresas, setEmpresas] = useState([]);
  const [empresasLoadAttempted, setEmpresasLoadAttempted] = useState(false);
  const [loadingEmpresas, setLoadingEmpresas] = useState(false);
  const [empresaTemporal, setEmpresaTemporal] = useState('');
  const [loadingData, setLoadingData] = useState(false);



  // Cargar lista de empresas
  const cargarEmpresas = useCallback(async () => {
    try {
      setLoadingEmpresas(true);

      
      const respuestaServicio = await getEmpresas({ // Renombrado para claridad
        getAll: true, 
        pageSize: 100 
      });
      
      // Verificar si la respuesta es válida y contiene el array de datos
      if (respuestaServicio && respuestaServicio.companies && Array.isArray(respuestaServicio.companies)) {
        const empresasArray = respuestaServicio.companies; // Extraer el array

        
        const empresasMapeadas = empresasArray.map(empresa => ({
          codeCompany: empresa.codeEntity || empresa.codeCompany,
          businessName: empresa.businessName || empresa.commercialName,
          ruc: empresa.ruc,
          ...empresa
        }));
        

        setEmpresas(empresasMapeadas); // Actualizar estado con las empresas mapeadas
        
        return empresasMapeadas; // Devolver las empresas mapeadas
      } else {
        // Manejar caso donde la respuesta no es la esperada o no hay datos

        setEmpresas([]); // Asegurar que empresas sea un array vacío
        return []; // Devolver array vacío
      }
    } catch (error) {

      setError('Error al cargar la lista de empresas');
      return [];
    } finally {
      setLoadingEmpresas(false);
    }
  }, [/* setEmpresas, setError */]); // Consider adding stable setters if linting requires

  // Efecto para cargar empresas cuando el modal se abre y no se han intentado cargar antes
  useEffect(() => {
    let mounted = true;
    if (isOpen && !loadingEmpresas && !empresasLoadAttempted) {

      setEmpresasLoadAttempted(true); // Set synchronously before the async call
      cargarEmpresas().catch(error => {
        // Error logging for the call from useEffect itself.
        // Actual error state (e.g., for UI) should be handled within cargarEmpresas.
        if (mounted) { // Guard against state updates if component unmounted during cargarEmpresas

        }
      });
    }
    return () => { mounted = false; };
  }, [isOpen, loadingEmpresas, empresasLoadAttempted, cargarEmpresas]);

  // Efecto para resetear el intento de carga cuando el modal se cierra
  useEffect(() => {
    if (!isOpen) {
      setEmpresasLoadAttempted(false);
      setLoadingEmpresas(false); // Ensure loading state is also reset
      // Opcional: limpiar el estado de empresas si se desea que se recarguen siempre
      // setEmpresas([]); 
    }
  }, [isOpen]);

  // Efecto para establecer la empresa temporal una vez que las empresas están cargadas o formData.codigoEntidad cambia
  useEffect(() => {
    if (isOpen && empresas.length > 0) {
      const targetEmpresaCode = formData.codigoEntidad || empresas[0]?.codeCompany || '';
      if (empresaTemporal !== targetEmpresaCode) {
        setEmpresaTemporal(targetEmpresaCode);
      }
    } 
    // Considerar limpiar empresaTemporal si el modal se cierra y no hay formData.codigoEntidad
    // else if (!isOpen && !formData.codigoEntidad && empresaTemporal !== '') {
    //   setEmpresaTemporal('');
    // }
  }, [isOpen, empresas, formData.codigoEntidad, empresaTemporal, setEmpresaTemporal]);

  // Cargar perfiles de acceso
  const cargarPerfiles = useCallback(async () => {
    try {

      setLoadingPerfiles(true);
      
      // Hacer la petición a la API
      const response = await getPerfilesAcceso({ process: 'getAccessProfiles' });

      
      // Extraer perfiles de la respuesta - la respuesta viene con accessProfiles
      let perfilesData = [];
      
      // Si la respuesta tiene accessProfiles, usarlo
      if (Array.isArray(response?.accessProfiles)) {
        perfilesData = response.accessProfiles;
      } 
      // Para compatibilidad con otros formatos
      else if (Array.isArray(response)) {
        perfilesData = response;
      } 
      else if (response?.data && Array.isArray(response.data)) {
        perfilesData = response.data;
      }
      else if (response?.data?.data && Array.isArray(response.data.data)) {
        perfilesData = response.data.data;
      }
      

      
      // Mapear los perfiles al formato esperado
      perfilesData = perfilesData.map(perfil => ({
        ...perfil,
        // Asegurar que siempre tengamos idFunction
        idFunction: perfil.idFunction ?? perfil.idregistro,
        // Usar functionName como nombre por defecto
        nombre: perfil.functionName || perfil.nombre || `Perfil ${perfil.idFunction}`,
        // Si no hay sección, usar N/A
        idseccion: perfil.idseccion ?? 'N/A'
      }));
      

      
      // Si hay un perfil seleccionado, actualizar el formData
      if (formData.idFunction) {
        const perfilSeleccionado = perfilesData.find(p => p.idFunction === formData.idFunction);
        if (perfilSeleccionado) {
          setFormData(prev => ({
            ...prev,
            function: perfilSeleccionado.functionName || perfilSeleccionado.nombre || ''
          }));
        }
      }
      
      setPerfiles(perfilesData);
      return perfilesData;
    } catch (error) {

      setError('No se pudieron cargar los perfiles de acceso');
      return [];
    } finally {
      setLoadingPerfiles(false);
    }
  }, [ formData.idFunction]);


  

  // Cargar datos del permiso
  const cargarPermiso = useCallback(async () => {
    if (!isOpen || !userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Cargar perfiles primero
      const perfiles = await cargarPerfiles();
      
      // Luego cargar los permisos
      const response = await getPermisos({ idUser: userId });
      
      // Extraer datos del permiso del array permissions
      let permisos = [];
      
      // Manejar diferentes formatos de respuesta
      if (response?.permissions?.length > 0) {
        // Nuevo formato con array permissions
        permisos = response.permissions;
      } else if (Array.isArray(response)) {
        // Formato de array directo
        permisos = response;
      } else if (response?.data) {
        // Formato con data
        permisos = Array.isArray(response.data) ? response.data : 
                 (response.data.permisos && Array.isArray(response.data.permisos) ? 
                  response.data.permisos : [response.data]);
      } else if (response) {
        // Único objeto de permiso
        permisos = [response];
      }
      
      if (permisos.length > 0) {
        // Encontrar el permiso que coincide con el userId
        const permisoUsuario = permisos.find(p => p.idUser === Number(userId)) || permisos[0];
        
        const formatNumber = (value) => {
          return (value === '' || value === null || value === undefined) ? 0 : Number(value);
        };
        
        // Obtener idFunction del permiso
        const idFunctionFromPermiso = formatNumber(permisoUsuario.idFunction);
        
        // Buscar el perfil que coincida con idFunction
        const perfilEncontrado = perfiles.find(p => {
          const perfilId = formatNumber(p.idFunction !== undefined ? p.idFunction : p.idregistro);
          return perfilId === idFunctionFromPermiso;
        });
        
        // Usar el ID del perfil encontrado o el primer perfil disponible
        const idFunctionFinal = perfilEncontrado 
          ? formatNumber(perfilEncontrado.idFunction ?? perfilEncontrado.idregistro)
          : (perfiles[0] ? formatNumber(perfiles[0].idFunction ?? perfiles[0].idregistro) : 0);
        
        // Actualizar el estado del formulario con los datos del permiso
        // Obtener el nombre del usuario de la respuesta del permiso
        const nombreUsuario = permisoUsuario.userName || permisoUsuario.nombre || permisoUsuario.nombreUser || '';
        
        // Actualizar el estado del formulario con los datos del permiso
        setFormData(prev => ({
          ...prev,
          regPermiso: formatNumber(permisoUsuario.regPermiso),
          idUser: formatNumber(permisoUsuario.idUser || userId),
          idFunction: idFunctionFinal,
          // Intentar con diferentes nombres de campo comunes para el código de entidad
          codigoEntidad: permisoUsuario.codigoEntidad || 
                        permisoUsuario.codigo_entidad || 
                        permisoUsuario.codeEntity ||
                        permisoUsuario.code_entity ||
                        '999',
          estadoPermisoActivado: permisoUsuario.estadoPermisoActivado ?? true,
          permitirTodasEmpresas: permisoUsuario.permitirTodasEmpresas ?? false,
          permitirMasDeUnaSesion: permisoUsuario.permitirMasDeUnaSesion ?? false,
          cierreSesionJornada: formatNumber(permisoUsuario.cierreSesionJornada),
          bloqueoSesionMaxima: formatNumber(permisoUsuario.bloqueoSesionMaxima),
          userioResponsable: permisoUsuario.userioResponsable || '',
          fechaInicioPermiso: permisoUsuario.fechaInicioPermiso || permisoUsuario.fecha_inicio_permiso,
          fechaFinalPermiso: permisoUsuario.fechaFinalPermiso || permisoUsuario.fecha_final_permiso,
          userName: nombreUsuario
        }));

       
        
      } else {
        // Inicializar con valores por defecto si no hay permisos
        setFormData(prev => ({
          ...prev,
          idUser: userId,
          estadoPermisoActivado: true,
          permitirTodasEmpresas: false,
          permitirMasDeUnaSesion: false,
          cierreSesionJornada: 0,
          bloqueoSesionMaxima: 0
        }));
      }
      
    } catch (error) {
      setError('Error al cargar el permiso');
    } finally {
      setLoading(false);
    }
  }, [isOpen, userId, cargarPerfiles]);

  // Cargar datos del usuario por ID usando getUsers
  const cargarUsuario = useCallback(async (userId) => {
    try {
      setLoading(true);
      
      // Llamar a getUsers con filtro por ID
      const response = await getUsers({ 
        process: 'getUsers',
        filters: { idUser: userId },
        page: 1,
        pageSize: 1
      });
      
      // Verificar si la respuesta tiene el formato esperado
      let userInfo = null;
      
      // Manejar diferentes formatos de respuesta
      if (response?.users?.[0]) {
        // Formato { users: [{...}] }
        userInfo = response.users[0];
      } else if (response?.data?.users?.[0]) {
        // Formato { data: { users: [{...}] } }
        userInfo = response.data.users[0];
      } else if (response?.data?.[0]) {
        // Formato { data: [{...}] }
        userInfo = response.data[0];
      } else if (response?.data) {
        // Formato { data: {...} }
        userInfo = response.data;
      } else if (response) {
        // Formato directo
        userInfo = response;
      }
      
      if (userInfo) {
        _updateUserInfoState(userInfo);

        setFormData(prev => ({
          ...prev,
          userioResponsable: userInfo.nombreUser || userInfo.username || prev.userioResponsable
        }));
        
        // Actualizar el formulario con los datos del usuario
        const newIdUser = userInfo.idUser || userId;
        
        setFormData(prev => ({
          ...prev,
          idUser: newIdUser,
          codigoEntidad: prev.codigoEntidad,
          userioResponsable: user?.userName || prev.userioResponsable
        }));
      } else {
        setError('Error al cargar los datos del usuario');
      }

    } catch (error) {
      setError('Error al cargar los datos del usuario');
    }
  }, [user, _updateUserInfoState]);

  // Cargar datos cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      if (userId) {
        cargarUsuario(userId);
      }
      // Primero cargamos los perfiles y empresas
      Promise.all([
        cargarPerfiles(),
        cargarEmpresas()
      ]).then(() => {
        // Luego cargamos el permiso que actualizará el formData
        return cargarPermiso();
      }).catch(error => {
        setError('Error al cargar datos iniciales');
      });
    }
  }, [isOpen, userId, cargarPerfiles, cargarEmpresas, cargarPermiso, cargarUsuario]);

  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
  };

  const handleEmpresaChange = (e) => {
    const value = e.target.value;
    
    setEmpresaTemporal(value);
    
    // Actualizar formData.codigoEntidad inmediatamente
    setFormData(prev => ({
      ...prev,
      codigoEntidad: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setLoadingData(true);
    
    // Aplicar la empresa seleccionada al formData solo al guardar
    setFormData(prev => ({
      ...prev,
      codigoEntidad: empresaTemporal
    }));
    
    try {
      // Validar datos requeridos
      if (!formData.idUser) {
        throw new Error('El ID de usuario es requerido');
      }
      
      if (!formData.idFunction) {
        throw new Error('Debe seleccionar una función');
      }
      
      // Función para formatear fechas al formato YYYY-MM-DD
      const formatDateForServer = (dateString) => {
        if (!dateString) return null; // Cambiado a null para que el backend pueda manejarlo
        try {
          // Asegurarse de que la fecha esté en el formato correcto
          const date = new Date(dateString);
          if (isNaN(date.getTime())) return null;
          // Formato: YYYY-MM-DD
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        } catch (e) {
          return null;
        }
      };

      // Validar campos requeridos
      const codigoEntidad = formData.codigoEntidad || user?.codigoEmpresa || '999';
      const userioResponsable = formData.userioResponsable || user?.userName || 'SISTEMA';
      
      if (!codigoEntidad) {
        throw new Error('No se pudo determinar el código de entidad');
      }
      
      if (!userioResponsable) {
        throw new Error('No se pudo determinar el usuario responsable');
      }
      
      // Preparar los datos en el formato exacto que espera el backend
      const permisoData = {
        idUser: parseInt(formData.idUser) || 0,
        idFunction: parseInt(formData.idFunction) || 0,
        regPermiso: formData.regPermiso ? parseInt(formData.regPermiso) : 0,
        codigoEntidad: codigoEntidad,
        // Convertir a booleanos (no números)
        estadoPermisoActivado: Boolean(formData.estadoPermisoActivado),
        permitirTodasEmpresas: Boolean(formData.permitirTodasEmpresas),
        permitirMasDeUnaSesion: Boolean(formData.permitirMasDeUnaSesion),
        cierreSesionJornada: Boolean(formData.cierreSesionJornada),
        bloqueoSesionMaxima: Boolean(formData.bloqueoSesionMaxima),
        userioResponsable: userioResponsable,
        fechaInicioPermiso: formatDateForServer(formData.fechaInicioPermiso) || null,
        fechaFinalPermiso: formatDateForServer(formData.fechaFinalPermiso) || null
      };
      
      // Crear el objeto de solicitud con la estructura exacta que espera el backend
      const requestData = {
        idUser: parseInt(permisoData.idUser, 10),
        idFunction: parseInt(permisoData.idFunction, 10),
        regPermiso: permisoData.regPermiso ? parseInt(permisoData.regPermiso, 10) : 0,
        codigoEntidad: codigoEntidad,
        estadoPermisoActivado: Boolean(permisoData.estadoPermisoActivado),
        permitirTodasEmpresas: Boolean(permisoData.permitirTodasEmpresas),
        permitirMasDeUnaSesion: Boolean(permisoData.permitirMasDeUnaSesion),
        cierreSesionJornada: permisoData.cierreSesionJornada ? 1 : 0,
        bloqueoSesionMaxima: permisoData.bloqueoSesionMaxima ? 1 : 0,
        userioResponsable: userioResponsable,
        fechaInicioPermiso: formatDateForServer(permisoData.fechaInicioPermiso) || null,
        fechaFinalPermiso: formatDateForServer(permisoData.fechaFinalPermiso) || null
      };

      // Crear el objeto de solicitud final
      const submitData = {
        process: 'putPermissions',
        CodigoEntidad: codigoEntidad,
        UserioResponsable: userioResponsable,
        ...requestData  // Incluir los datos como string JSON en el campo 'request'
      };
      
      // Llamar a la función de actualización con los datos formateados
      try {
        const result = await onUpdate(submitData);
        
        if (result === false) {
          // Si onUpdate devuelve false, ya se manejó el error en el componente padre
          return;
        }
        
        // Mostrar mensaje de éxito
        setModalExito({
          open: true,
          mensaje: 'Permiso actualizado correctamente',
          esError: false
        });
        
        // Cerrar el modal después de 3 segundos
        setTimeout(() => {
          onClose();
        }, 3000);
        
      } catch (error) {
        // Mostrar mensaje de error del servidor si existe
        const errorMessage = error.response?.data?.message || 
                           error.message || 
                           'Error al actualizar los permisos';
        setError(errorMessage);
      }
      
    } catch (error) {
      console.error('Error al actualizar el permiso:', error);
      // Manejar errores de validación
      setModalExito({
        open: true,
        mensaje: error.message || 'Error al guardar los cambios',
        esError: true
      });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;


  const isFormValid = () => {
    // Implementar lógica para validar el formulario
    return true;
  };
  
  return (
    <div className="fixed inset-0  px-5 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg w-[500px] max-h-[90vh] overflow-y-auto relative">
        {loadingData && (
          <LoadingOverlay isLoading={loadingData} message="Guardando permiso..." />
        )}
        {modalExito.open && (
          <div 
            className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg flex items-center justify-between ${
              modalExito.esError 
                ? 'bg-red-50 border-l-4 border-red-500 text-red-700' 
                : 'bg-green-50 border-l-4 border-green-500 text-green-700'
            }`}
            style={{ minWidth: '300px', maxWidth: '400px', zIndex: 1000 }}
          >
            <div className="flex-1">
              <p className="font-medium">
                {modalExito.esError ? 'Error' : 'Éxito'}
              </p>
              <p className="text-sm">{modalExito.mensaje}</p>
            </div>
            <button 
              className="ml-4 text-gray-500 hover:text-gray-700 focus:outline-none"
              onClick={() => setModalExito(prev => ({ ...prev, open: false }))}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
  
        
        <div className="mb-4 pb-3">
          <h3 className="text-xl font-semibold text-gray-800 mb-1">
            Configuración de Permisos para {formData.userName}
          </h3>
          <div className="flex items-center space-x-2">
            {(userInfo?.idUser || formData.idUser) && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
               
              </span>
            )}
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-4">Cargando...</div>
        ) : error ? (
          <div className="text-red-500 mb-4">{error}</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 px-5">
            <div className="space-y-6">
              {/* Hidden fields that don't need to be shown */}
              <input type="hidden" name="idFunction" value={formData.idFunction || ''} />
              <input type="hidden" name="codigoEntidad" value={formData.codigoEntidad || '999'} />
              <input type="hidden" name="userioResponsable" value={formData.userioResponsable || ''} />
              
              {/* Show ID fields as read-only */}
              <div className="grid grid-cols-1 gap-3">
                {/* ID Permiso */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700">ID Permiso</label>
                  <input
                    type="text"
                    value={formData.regPermiso || 'N/A'}
                    readOnly
                    className="w-full border p-1 rounded bg-[#CCCCCC] cursor-not-allowed h-8 text-sm"
                  />
                </div>
                
                {/* ID Usuario */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700">ID Usuario</label>
                  <input
                    type="text"
                    value={formData.idUser || 'N/A'}
                    readOnly
                    className="w-full border p-1 rounded bg-[#CCCCCC] cursor-not-allowed h-8 text-sm"
                  />
                </div>
                
                {/* Usuario Actual (Usuario logueado) */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Usuario Actual</label>
                  <div className="w-full p-2 border rounded bg-[#CCCCCC] h-8 flex items-center">
                    <span className=" truncate">
                      {user?.nombreUser || user?.username || localStorage.getItem('username')}
                    </span>
                  </div>
                </div>
                
                {/* Empresa */}
                <div className="space-y-1">
                  <label htmlFor="empresa" className="block text-sm font-medium text-gray-700">
                    Empresa
                  </label>
                  {loadingEmpresas ? (
                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Cargando empresas...
                    </div>
                  ) : (
                    <select
                      id="empresa"
                      name="empresa"
                      value={empresaTemporal || ''}
                      onChange={handleEmpresaChange}
                      className="w-full border rounded bg-white p-1 text-sm h-8 focus:ring-blue-500 focus:border-blue-500"
                      disabled={saving}
                    >
                      <option value="">Seleccione una empresa</option>
                      {empresas.map((emp) => (
                        <option key={emp.codeCompany} value={emp.codeCompany}>
                          {emp.businessName || `Empresa ${emp.codeCompany}`}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
              
              {/* Show function as a locked dropdown */}
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700">
                  Función {loadingPerfiles && '(Cargando...)'}
                </label>
                {loadingPerfiles ? (
                  <div className="p-2 bg-[#CCCCCC] rounded text-sm text-black h-8">
                    Cargando perfiles...
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      name="idFunction"
                      value={formData.idFunction || ''}
                      onChange={handleChange}
                      className="w-full p-1 h-8 bg-[#CCCCCC] border rounded cursor-not-allowed appearance-none pl-2 pr-8"
                      disabled={true || saving}
                    >
                      <option value="" disabled>Seleccione una función</option>
                      {perfiles.map((perfil) => {
                        const id = perfil.idFunction ?? perfil.idregistro;
                        const nombre = perfil.functionName || perfil.nombre || `Perfil ${id}`;
                        return (
                          <option 
                            key={id} 
                            value={id}
                            className="h-8"
                          >
                            {nombre}
                          </option>
                        );
                      })}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                      </svg>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Tabla de permisos */}
              <div className="mt-4 overflow-hidden border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Configuración
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Estado del permiso */}
                    <tr className="h-8">
                      <td className="px-6 py-1 whitespace-nowrap">
                        <label htmlFor="estadoPermisoActivado" className="text-sm font-medium text-gray-700">
                          Permiso activado
                        </label>
                      </td>
                      <td className="px-6 py-1 whitespace-nowrap">
                        <div className="flex items-center h-full">
                          <input
                            type="checkbox"
                            id="estadoPermisoActivado"
                            name="estadoPermisoActivado"
                            checked={formData.estadoPermisoActivado || false}
                            onChange={handleChange}
                            disabled={saving}
                            className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          />
                        </div>
                      </td>
                    </tr>
                    
                    {/* Configuración de acceso */}
                    <tr className="h-8">
                      <td className="px-6 py-1 whitespace-nowrap">
                        <label htmlFor="permitirTodasEmpresas" className="text-sm font-medium text-gray-700">
                          Acceso a todas las empresas
                        </label>
                      </td>
                      <td className="px-6 py-1 whitespace-nowrap">
                        <div className="flex items-center h-full">
                          <input
                            type="checkbox"
                            id="permitirTodasEmpresas"
                            name="permitirTodasEmpresas"
                            checked={formData.permitirTodasEmpresas || false}
                            onChange={handleChange}
                            disabled={saving}
                            className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          />
                        </div>
                      </td>
                    </tr>
                    
                    <tr className="h-8">
                      <td className="px-6 py-1 whitespace-nowrap">
                        <label htmlFor="permitirMasDeUnaSesion" className="text-sm font-medium text-gray-700">
                          Múltiples sesiones simultáneas
                        </label>
                      </td>
                      <td className="px-6 py-1 whitespace-nowrap">
                        <div className="flex items-center h-full">
                          <input
                            type="checkbox"
                            id="permitirMasDeUnaSesion"
                            name="permitirMasDeUnaSesion"
                            checked={formData.permitirMasDeUnaSesion || false}
                            onChange={handleChange}
                            disabled={saving}
                            className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          />
                        </div>
                      </td>
                    </tr>
                    
                    {/* Configuración de sesión */}
                    <tr className="h-8">
                      <td className="px-6 py-1 whitespace-nowrap">
                        <label htmlFor="cierreSesionJornada" className="text-sm font-medium text-gray-700">
                          Cierre de sesión automático
                        </label>
                      </td>
                      <td className="px-6 py-1 whitespace-nowrap">
                        <div className="flex items-center h-full">
                          <input
                            type="checkbox"
                            id="cierreSesionJornada"
                            name="cierreSesionJornada"
                            checked={formData.cierreSesionJornada || false}
                            onChange={handleChange}
                            disabled={saving}
                            className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          />
                        </div>
                      </td>
                    </tr>

                    <tr className="h-8">
                      <td className="px-6 py-1 whitespace-nowrap">
                        <label htmlFor="bloqueoSesionMaxima" className="text-sm font-medium text-gray-700">
                          Bloqueo de sesión máxima
                        </label>
                      </td>
                      <td className="px-6 py-1 whitespace-nowrap">
                        <div className="flex items-center h-full">
                          <input
                            type="checkbox"
                            id="bloqueoSesionMaxima"
                            name="bloqueoSesionMaxima"
                            checked={formData.bloqueoSesionMaxima || false}
                            onChange={handleChange}
                            disabled={saving}
                            className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          />
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Botón para mostrar/ocultar valores actuales */}
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowCurrentValues(!showCurrentValues)}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
              >
                {showCurrentValues ? (
                  <>
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    Ocultar valores actuales
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Mostrar valores actuales
                  </>
                )}
              </button>

              {showCurrentValues && (
                <div className="mt-2 overflow-hidden border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <tbody className="bg-white divide-y divide-gray-200 h-32">
                      {formData && Object.entries({
                        'ID Usuario': formData.idUser,
                        'ID Función': formData.idFunction,
                        'Código Entidad': formData.codigoEntidad,
                        'Estado': formData.estadoPermisoActivado ? 'Activo' : 'Inactivo',
                        'Acceso a todas las empresas': formData.permitirTodasEmpresas ? 'Sí' : 'No',
                        'Múltiples sesiones': formData.permitirMasDeUnaSesion ? 'Permitido' : 'No permitido',
                        'Cierre de sesión automático': formData.cierreSesionJornada ? 'Activado' : 'Desactivado',
                        'Bloqueo de sesión máxima': formData.bloqueoSesionMaxima ? 'Activado' : 'Desactivado',
                        'Usuario responsable': formData.userioResponsable || 'No especificado',
                        'Función': formData.function
                      }).filter(([key]) => !['process', 'page', 'regPermiso'].includes(key))
                      .map(([key, value]) => (
                        <tr key={key}>
                          <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900 w-1/3">
                            {key}
                          </td>
                          <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                            {key.includes('fecha') && value 
                              ? new Date(value).toLocaleDateString('es-ES') 
                              : value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded flex justify-between items-center">
                <span>{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="ml-4 px-3 py-1 text-sm bg-red-100 hover:bg-red-200 rounded"
                >
                  Cerrar
                </button>
              </div>
            )}
            
      
            
            {/* Botones de acción fijos en la parte inferior */}
            <div className="mt-8 pt-4 border-t border-gray-200 flex justify-end space-x-3 sticky bottom-0 bg-white">
            <ActionButtons
              onClose={onClose}
              handleSubmit={handleSubmit}
              disabled={!isFormValid() || loadingData}
              loading={loadingData}
              loadingText="Guardando..."
            />
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PermisosModal;
