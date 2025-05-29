import React, { useState, useEffect, useCallback } from 'react';
import { getPermisos } from '../../services/permission/PermissionService';
import { getPerfilesAcceso } from '../../services/accessProfile/AccessProfileService';
import {  getUsers } from '../../services/user/UserService';
import { getEmpresas } from '../../services/company/CompanyService';
import { useAuth } from '../../contexts/AuthContext';

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
  const [loadingEmpresas, setLoadingEmpresas] = useState(false);
  const [empresaTemporal, setEmpresaTemporal] = useState('');

  // Cargar lista de empresas
  const cargarEmpresas = useCallback(async () => {
    try {
      setLoadingEmpresas(true);
      console.log('Cargando lista de empresas...');
      
      // Obtener todas las empresas (todas las páginas)
      const empresasData = await getEmpresas({
        getAll: true, // Indica que queremos todas las páginas
        pageSize: 100 // Cantidad de empresas por página (ajustar según necesidad)
      });
      
      console.log('Total de empresas cargadas:', empresasData.length);
      
      // Mapear los datos de las empresas al formato esperado
      const empresasMapeadas = empresasData.map(empresa => ({
        codeCompany: empresa.codeEntity || empresa.codeCompany,
        businessName: empresa.businessName || empresa.commercialName,
        ruc: empresa.ruc,
        ...empresa
      }));
      
      console.log('Empresas mapeadas:', empresasMapeadas);
      setEmpresas(empresasMapeadas);
      
      return empresasData;
    } catch (error) {
      console.error('Error al cargar las empresas:', error);
      setError('Error al cargar la lista de empresas');
      return [];
    } finally {
      setLoadingEmpresas(false);
    }
  }, []);
  
  // Efecto para cargar empresas al abrir el modal
  useEffect(() => {
    let mounted = true;
    
    const cargarDatos = async () => {
      if (isOpen && !loadingEmpresas) {
        let empresasCargadas = empresas;
        
        // Si no hay empresas cargadas, cargarlas
        if (empresas.length === 0) {
          console.log('Cargando lista de empresas...');
          empresasCargadas = await cargarEmpresas();
        }
        
        // Solo actualizar el estado si el componente sigue montado
        if (mounted && empresasCargadas && empresasCargadas.length > 0) {
          // Inicializar empresa temporal con el valor actual o la primera empresa
          const nuevaEmpresa = formData.codigoEntidad || empresasCargadas[0]?.codeCompany || '';
          setEmpresaTemporal(nuevaEmpresa);
        }
      }
    };
    
    cargarDatos();
    
    return () => {
      mounted = false;
    };
  }, [isOpen, loadingEmpresas, empresas, formData.codigoEntidad, cargarEmpresas]);

  // Cargar perfiles de acceso
  const cargarPerfiles = useCallback(async () => {
    try {
      console.log('Cargando perfiles de acceso...');
      setLoadingPerfiles(true);
      
      // Hacer la petición a la API
      const response = await getPerfilesAcceso({ process: 'getAccessProfiles' });
      console.log('Respuesta de getPerfilesAcceso:', response);
      
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
      
      console.log('Perfiles extraídos:', perfilesData);
      
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
      
      console.log('Perfiles formateados:', perfilesData);
      
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
      console.error('Error al cargar perfiles:', error);
      setError('No se pudieron cargar los perfiles de acceso');
      return [];
    } finally {
      setLoadingPerfiles(false);
    }
  }, [ formData.idFunction]);


  

  // Cargar datos del permiso
  const cargarPermiso = useCallback(async () => {
    if (!isOpen || !userId) return;
    
    console.log('Iniciando carga de permisos para userId:', userId);
    setLoading(true);
    setError(null);
    
    try {
      // Cargar perfiles primero
      const perfiles = await cargarPerfiles();
      
      // Luego cargar los permisos
      console.log('Llamando a getPermisos con userId:', userId);
      const response = await getPermisos({ idUser: userId });
      console.log('Respuesta de getPermisos:', response);
      
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
      
      console.log('Permisos extraídos:', permisos);
      
      if (permisos.length > 0) {
        // Encontrar el permiso que coincide con el userId
        const permisoUsuario = permisos.find(p => p.idUser === Number(userId)) || permisos[0];
        
        const formatNumber = (value) => {
          return (value === '' || value === null || value === undefined) ? 0 : Number(value);
        };
        
        // Obtener idFunction del permiso
        const idFunctionFromPermiso = formatNumber(permisoUsuario.idFunction);
        
        console.log('Buscando perfil con idFunction:', idFunctionFromPermiso);
        
        // Buscar el perfil que coincida con idFunction
        const perfilEncontrado = perfiles.find(p => {
          const perfilId = formatNumber(p.idFunction !== undefined ? p.idFunction : p.idregistro);
          return perfilId === idFunctionFromPermiso;
        });
        
        // Usar el ID del perfil encontrado o el primer perfil disponible
        const idFunctionFinal = perfilEncontrado 
          ? formatNumber(perfilEncontrado.idFunction ?? perfilEncontrado.idregistro)
          : (perfiles[0] ? formatNumber(perfiles[0].idFunction ?? perfiles[0].idregistro) : 0);
        
        console.log('Datos del permiso a mostrar:', permisoUsuario);
        console.log('Campos disponibles en permisoUsuario:', Object.keys(permisoUsuario));
        
        // Función para formatear fechas al formato YYYY-MM-DD
        const formatDate = (dateString) => {
          if (!dateString) return '';
          try {
            const date = new Date(dateString);
            // Verificar si la fecha es válida
            if (isNaN(date.getTime())) return '';
            return date.toISOString().split('T')[0];
          } catch (e) {
            console.error('Error al formatear fecha:', e);
            return '';
          }
        };

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
          fechaInicioPermiso: formatDate(permisoUsuario.fechaInicioPermiso || permisoUsuario.fecha_inicio_permiso),
          fechaFinalPermiso: formatDate(permisoUsuario.fechaFinalPermiso || permisoUsuario.fecha_final_permiso),
          userName: nombreUsuario
        }));

       
        
      } else {
        console.warn('No se encontraron datos de permiso para el usuario');
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
      console.error('Error al cargar el permiso:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
      setError(`Error al cargar el permiso: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [isOpen, userId, cargarPerfiles]);

  // Cargar datos del usuario por ID usando getUsers
  const cargarUsuario = useCallback(async (userId) => {
    try {
      setLoading(true);
      console.log('Buscando usuario con ID:', userId);
      
      // Llamar a getUsers con filtro por ID
      const response = await getUsers({ 
        process: 'getUsers',
        filters: { idUser: userId },
        page: 1,
        pageSize: 1
      });
      
      console.log('Respuesta de getUsers:', response);

      // Verificar si la respuesta tiene el formato esperado
      let userInfo = null;
      
      // Manejar diferentes formatos de respuesta
      if (response?.users?.[0]) {
        // Formato { users: [{...}] }
        userInfo = response.users[0];
        console.log('Usuario encontrado (formato users array):', userInfo);
      } else if (response?.data?.users?.[0]) {
        // Formato { data: { users: [{...}] } }
        userInfo = response.data.users[0];
        console.log('Usuario encontrado (formato data.users array):', userInfo);
      } else if (response?.data?.[0]) {
        // Formato { data: [{...}] }
        userInfo = response.data[0];
        console.log('Usuario encontrado (formato data array):', userInfo);
      } else if (response?.data) {
        // Formato { data: {...} }
        userInfo = response.data;
        console.log('Usuario encontrado (formato data object):', userInfo);
      } else if (response) {
        // Formato directo
        userInfo = response;
        console.log('Usuario encontrado (formato directo):', userInfo);
      }
      
      // Debug: Mostrar todas las propiedades del usuario
      if (userInfo) {
        console.log('Propiedades del usuario:', Object.keys(userInfo));
        console.log('Datos completos del usuario:', {
          ...userInfo,
          // Ocultar datos sensibles en el log
          password: '***',
          contrasena: '***'
        });
        
        // Usar el nombreCompleto directamente de la respuesta si está disponible
        // o construirlo a partir de nombre y apellidos si es necesario
        const nombreCompleto = userInfo.nombreCompleto || 
                              (userInfo.nombreUser && userInfo.apellidosUser ? 
                               `${userInfo.nombreUser} ${userInfo.apellidosUser}`.trim() :
                               userInfo.nombre || userInfo.firstName || '');
        
        console.log('Datos de nombre extraídos:', {
          nombreUser: userInfo.nombreUser,
          apellidosUser: userInfo.apellidosUser,
          nombre: userInfo.nombre,
          apellidos: userInfo.apellidos,
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          nombreCompleto
        });
        
        
        
        // Actualizar el userioResponsable en formData con el nombre completo
        setFormData(prev => ({
          ...prev,
          userioResponsable: nombreCompleto || userInfo.username || prev.userioResponsable
        }));
      }

      if (userInfo) {
        console.log('Datos del usuario cargados:', {
          idUser: userInfo.idUser,
          userId: userId,
          nombreUser: userInfo.nombreUser,
          apellidosUser: userInfo.apellidosUser,
          username: userInfo.username
        });
        
        // Guardar la información del usuario en el estado
        setUserInfo(userInfo);
        
        // Extraer nombre y apellido de las propiedades disponibles
        const nombre = userInfo.nombreUser || userInfo.nombre || userInfo.firstName || '';
        const apellidos = userInfo.apellidosUser || userInfo.apellidos || userInfo.lastName || '';
        
        // Formatear nombre completo para mostrar en la interfaz
        const nombreCompleto = [nombre, apellidos]
          .filter(Boolean)
          .join(' ')
          .trim();
        
        console.log('Datos de nombre extraídos:', {
          nombreUser: userInfo.nombreUser,
          apellidosUser: userInfo.apellidosUser,
          nombre: userInfo.nombre,
          apellidos: userInfo.apellidos,
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          nombreCompleto
        });
        

        
        // Actualizar el userioResponsable en formData con el nombre completo
        setFormData(prev => ({
          ...prev,
          userioResponsable: nombreCompleto || userInfo.username || prev.userioResponsable
        }));
        
        // Actualizar el formulario con los datos del usuario
        const newIdUser = userInfo.idUser || userId;
        console.log('ID de usuario que se establecerá:', newIdUser);
        
        setFormData(prev => ({
          ...prev,
          idUser: newIdUser,
          codigoEntidad: prev.codigoEntidad,
          userioResponsable: user?.userName || prev.userioResponsable
        }));
      } else {
        console.warn('No se encontraron datos del usuario');
      }

    } catch (error) {
      console.error('Error al cargar los datos del usuario:', error);
      setError('Error al cargar los datos del usuario');
    }
  }, [user]);

  // Cargar datos cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      console.log('Abriendo modal, cargando datos...');
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
        console.error('Error al cargar datos iniciales:', error);
      });
    }
  }, [isOpen, userId, cargarPerfiles, cargarEmpresas, cargarPermiso, cargarUsuario]);

  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    console.log('Cambio en', name, ':', type === 'checkbox' ? checked : value);
  };

  const handleEmpresaChange = (e) => {
    const value = e.target.value;
    console.log('Cambiando empresa a:', value);
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
          if (isNaN(date.getTime())) {
            console.warn('Fecha inválida:', dateString);
            return null;
          }
          // Formato: YYYY-MM-DD
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        } catch (e) {
          console.error('Error al formatear fecha para el servidor:', e);
          return null;
        }
      };

      // Validar campos requeridos
      const codigoEntidad = formData.codigoEntidad || user?.codigoEmpresa || '999';
      const userioResponsable = formData.userioResponsable || user?.userName || 'SISTEMA';
      
      console.log('Valores a enviar:', { codigoEntidad, userioResponsable });
      
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
      
      console.log('Datos a enviar al servidor:', JSON.stringify(submitData, null, 2));
      
      // Mostrar datos que se enviarán al servidor
      console.group('Datos a enviar al servidor');
      console.log('URL:', process.env.REACT_APP_PERMISSIONS_API_BASE || '/api/Permissions/Process');
      console.log('Método:', 'POST');
      console.log('Datos:', JSON.stringify(submitData, null, 2));
      console.groupEnd();
      
      console.log('Enviando datos al servidor...');
      
      // Llamar a la función de actualización con los datos formateados
      try {
        const result = await onUpdate(submitData);
        console.log('Resultado de la actualización:', result);
        
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
        console.error('Error en handleSubmit:', error);
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

  return (
    <div className="fixed inset-0  px-5 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg w-[500px] max-h-[90vh] overflow-y-auto relative">
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
        <button 
          type="button" 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold focus:outline-none"
          aria-label="Cerrar modal"
        >
          &times;
        </button>
        
        <div className="mb-4 border-b pb-3">
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
                    className="w-full border p-1 rounded bg-gray-300 cursor-not-allowed h-8 text-sm"
                  />
                </div>
                
                {/* ID Usuario */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700">ID Usuario</label>
                  <input
                    type="text"
                    value={formData.idUser || 'N/A'}
                    readOnly
                    className="w-full border p-1 rounded bg-gray-300 cursor-not-allowed h-8 text-sm"
                  />
                </div>
                
                {/* Usuario Actual (Usuario logueado) */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Usuario Actual</label>
                  <div className="w-full p-2 border rounded bg-gray-300 h-8 flex items-center">
                    <span className="text-gray-700 truncate">
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
                  <div className="p-2 bg-gray-300 rounded text-sm text-black h-8">
                    Cargando perfiles...
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      name="idFunction"
                      value={formData.idFunction || ''}
                      onChange={handleChange}
                      className="w-full p-1 h-8 bg-gray-400 border rounded cursor-not-allowed appearance-none pl-2 pr-8"
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
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className={`px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium ${saving ? 'text-gray-400 bg-gray-50 cursor-not-allowed' : 'text-gray-700 bg-white hover:bg-gray-50'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${saving ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                {saving ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </div>
                ) : 'Guardar cambios'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PermisosModal;
