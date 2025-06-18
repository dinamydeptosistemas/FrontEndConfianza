import React, { useState, useEffect } from 'react';
import { getEmpresas } from '../../services/company/CompanyService';
import { getUsers } from '../../services/user/UserService';
import { getPerfilesAcceso } from '../../services/accessProfile/AccessProfileService';
import { useAuth } from '../../contexts/AuthContext';
import ActionButtons, { LoadingOverlay } from '../common/Buttons';

/**
 * Modal para crear permisos.
 * @param {function} onClose - Cierra el modal
 * @param {function} onSave - Función para guardar el permiso
 * @param {function} onSuccess - (opcional) Muestra mensaje de éxito global
 */
export default function PermisoCreateModal({ onClose, onSave }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    idUser: '',
    idFunction: '',
    codigoEntidad:  '',
    estadoPermisoActivado: true,
    permitirTodasEmpresas: false,
    permitirMasDeUnaSesion: false,
    cierreSesionJornada: 0,
    bloqueoSesionMaxima: 0,
    userioResponsable: user?.userName || 'XAVIER',
    fechaInicioPermiso: new Date().toISOString().split('T')[0],
    fechaFinalPermiso: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    selectedEmpresa: null
  });

  useEffect(() => {
    // Actualizar fechas y código de entidad si el usuario cambia
    if (user) {
      setFormData(prev => ({
        ...prev,
        userioResponsable: user.userName || '',
        codigoEntidad: user.codigoEmpresa || ''
      }));
    }
  }, [user]);

  const [empresas, setEmpresas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [funciones, setFunciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadingData, setLoadingData] = useState(false);

  // Actualizar el código de entidad cuando se selecciona una empresa
  useEffect(() => {
    if (formData.idEmpresa && empresas.length > 0) {
      const selectedEmpresa = empresas.find(e => e.value === formData.idEmpresa);
      if (selectedEmpresa) {
        setFormData(prev => ({
          ...prev,
          codigoEntidad: selectedEmpresa.value,
          selectedEmpresa: selectedEmpresa
        }));
      }
    }
  }, [formData.idEmpresa, empresas]);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        
       
        const empresasResponse = await getEmpresas({
          process: 'getCompanies',
          getAll: true,
          pageSize: 100
        });
        console.log('Respuesta de empresas:', empresasResponse);

        // Manejar la respuesta según el formato
        let empresasData = [];
        if (Array.isArray(empresasResponse)) {
          empresasData = empresasResponse;
        } else if (empresasResponse?.empresas && Array.isArray(empresasResponse.empresas)) {
          empresasData = empresasResponse.empresas;
        } else if (empresasResponse?.companies && Array.isArray(empresasResponse.companies)) {
          empresasData = empresasResponse.companies;
        } else if (empresasResponse?.data && Array.isArray(empresasResponse.data)) {
          empresasData = empresasResponse.data;
        }

        console.log('Empresas procesadas:', empresasData);

        if (empresasData && empresasData.length > 0) {
          const empresasFormateadas = empresasData.map(empresa => ({
            value: empresa.codeCompany || empresa.idEmpresa || empresa.id,
            label: empresa.businessName || empresa.nombreEmpresa || empresa.name,
            data: empresa // Mantener los datos completos de la empresa
          }));
          console.log('Empresas formateadas:', empresasFormateadas);
          setEmpresas(empresasFormateadas);
          
          // Establecer empresa por defecto si hay empresas
          if (empresasFormateadas.length > 0) {
            const defaultEmpresa = empresasFormateadas[0];
            setFormData(prev => ({
              ...prev,
              idEmpresa: defaultEmpresa.value,
              codigoEntidad: defaultEmpresa.data?.codeCompany || defaultEmpresa.value,
              selectedEmpresa: defaultEmpresa
            }));
          }
        } else {
          console.warn('No se encontraron empresas o el formato de respuesta es incorrecto');
          setError('No se pudieron cargar las empresas. Formato de respuesta incorrecto.');
        }

        // Cargar usuarios y funciones en paralelo
        const [usuariosResponse, funcionesResponse] = await Promise.all([
          getUsers({ process: 'getUsers', page: 1, pageSize: 100 }),
          getPerfilesAcceso({ process: 'getAccessProfiles', page: 1, pageSize: 100 })
        ]);

        // Procesar usuarios
        let usuariosData = [];
        if (Array.isArray(usuariosResponse)) {
          usuariosData = usuariosResponse;
        } else if (usuariosResponse?.users && Array.isArray(usuariosResponse.users)) {
          usuariosData = usuariosResponse.users;
        } else if (usuariosResponse?.data && Array.isArray(usuariosResponse.data)) {
          usuariosData = usuariosResponse.data;
        }

        if (usuariosData.length > 0) {
          const usuariosFormateados = usuariosData.map(usuario => ({
            value: usuario.idUser || usuario.id,
            label: `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim() || usuario.userName || usuario.username
          }));
          setUsuarios(usuariosFormateados);
        }

        // Procesar funciones
        let funcionesData = [];
        if (Array.isArray(funcionesResponse)) {
          funcionesData = funcionesResponse;
        } else if (funcionesResponse?.accessProfiles && Array.isArray(funcionesResponse.accessProfiles)) {
          funcionesData = funcionesResponse.accessProfiles;
        } else if (funcionesResponse?.data && Array.isArray(funcionesResponse.data)) {
          funcionesData = funcionesResponse.data;
        }

        if (funcionesData.length > 0) {
          const funcionesFormateadas = funcionesData.map(funcion => ({
            value: funcion.idFunction || funcion.id,
            label: funcion.functionName || funcion.nombreFuncion || funcion.name
          }));
          setFunciones(funcionesFormateadas);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Error al cargar los datos necesarios';
        setError(`Error: ${errorMessage}`);
        setLoading(false);
        // Intentar continuar con la carga de usuarios y funciones aunque falle la carga de empresas
      }
    };

    cargarDatos();
  }, [user]);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelectChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingData(true);
    setError('');
    
    try {
      // Validar campos requeridos
      if (!formData.idUser || !formData.idFunction || !formData.codigoEntidad) {
        setError('Por favor, seleccione un usuario, una función y una empresa');
        return;
      }

      // Validar fechas
      if (!formData.fechaInicioPermiso || !formData.fechaFinalPermiso) {
        setError('Por favor, asegúrese de que las fechas estén establecidas');
        return;
      }

      // Validar rango de fechas
      const inicio = new Date(formData.fechaInicioPermiso);
      const fin = new Date(formData.fechaFinalPermiso);
      if (inicio > fin) {
        setError('La fecha de inicio no puede ser posterior a la fecha final');
        return;
      }

      // Preparar datos para el backend según el formato esperado
      const permisoData = {
        process: 'putPermissions',
        idUser: formData.idUser,
        idFunction: formData.idFunction,
        codigoEntidad: formData.codigoEntidad,
        estadoPermisoActivado: formData.estadoPermisoActivado,
        permitirTodasEmpresas: formData.permitirTodasEmpresas,
        permitirMasDeUnaSesion: formData.permitirMasDeUnaSesion,
        cierreSesionJornada: formData.cierreSesionJornada ? 1 : 0,
        bloqueoSesionMaxima: formData.bloqueoSesionMaxima ? 1 : 0,
        userioResponsable: user?.userName || 'XAVIER',
        fechaInicioPermiso: formData.fechaInicioPermiso,
        fechaFinalPermiso: formData.fechaFinalPermiso
      };

      // Llamar a la función onSave proporcionada por el componente padre
      const response = await onSave(permisoData);
      
      // Mostrar mensaje de éxito
      if (response && response.status === 'SUCCESS') {
        // Cerrar el modal después de un breve retraso para mostrar el mensaje
        setTimeout(() => {
          onClose();
        }, 1500);
      }

    } catch (error) {
      console.error('Error al guardar el permiso:', error);
      setError('Error al guardar el permiso: ' + (error.message || 'Error desconocido'));
    }
  };

  const isFormValid = () => {
    // Implementar lógica para validar el formulario
    return true;
  };


  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white py-6 px-10 rounded-lg shadow-lg w-[750px] max-h-[90vh] overflow-y-auto relative">
        
        {/* Overlay de carga */}
        {loading && <LoadingOverlay isLoading={true} message="Guardando permiso..." />}
        
        {/* Botón de cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold"
          aria-label="Cerrar"
        >
          ×
        </button>

        {/* Header con título y botones */}
        <div className="grid grid-cols-2 items-center mb-2">
          <h2 className="text-2xl font-bold text-gray-800 pt-4">Nuevo Permiso</h2>
          <div className="flex justify-end gap-3 mr-[25px]">
            <ActionButtons
              onClose={onClose} 
              handleSubmit={handleSubmit} 
              disabled={!isFormValid()} 
              loading={loading}
              loadingText="Guardando..." 
            />
          </div>
        </div>
        
        <hr className="col-span-2 border-blue-500 mr-6 m-0 p-0" />

        {/* Indicadores de carga y error */}
        {loadingData && (
          <div className="text-center py-8">
            <div className="text-gray-600">Cargando datos...</div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="grid mt-5 grid-cols-2 gap-x-4 gap-y-3 relative">
          
          {/* Row 1: Estado del permiso */}
          <div className="flex items-center h-10">
            <label className="text-sm text-gray-700 font-medium">Estado Activo</label>
            <input
              type="checkbox"
              name="estadoPermisoActivado"
              checked={formData.estadoPermisoActivado}
              onChange={handleChange}
              className="h-4 w-4 ml-2 rounded border-gray-200 text-blue-600 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="flex items-center h-10">
            <div className={`inline-flex px-4 py-2 text-[1rem] rounded-full text-xs font-medium ${
              formData.estadoPermisoActivado 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-red-100 text-red-800'
            }`}> 
              {formData.estadoPermisoActivado ? 'ACTIVO' : 'INACTIVO'}
            </div>
          </div>

          {/* Row 2: Usuario + Función */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Usuario</label>
            <select
              name="idUser"
              value={formData.idUser}
              onChange={(e) => handleSelectChange('idUser', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:border-[#285398] focus:ring-0 px-2 py-1 bg-white hover:bg-gray-50 transition-colors outline-none"
              required
            >
              <option value="">Seleccione un usuario...</option>
              {usuarios.map(usuario => (
                <option key={usuario.value} value={usuario.value}>
                  {usuario.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Función</label>
            <select
              name="idFunction"
              value={formData.idFunction}
              onChange={(e) => handleSelectChange('idFunction', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:border-[#285398] focus:ring-0 px-2 py-1 bg-white hover:bg-gray-50 transition-colors outline-none"
              required
            >
              <option value="">Seleccione una función...</option>
              {funciones.map(funcion => (
                <option key={funcion.value} value={funcion.value}>
                  {funcion.label}
                </option>
              ))}
            </select>
          </div>

          {/* Row 3: Empresa + Usuario Responsable */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Empresa</label>
            <select
              name="codigoEntidad"
              value={formData.codigoEntidad}
              onChange={(e) => handleSelectChange('codigoEntidad', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:border-[#285398] focus:ring-0 px-2 py-1 bg-white hover:bg-gray-50 transition-colors outline-none"
              required
            >
              <option value="">Seleccione una empresa...</option>
              {empresas.map(empresa => (
                <option key={empresa.value} value={empresa.value}>
                  {empresa.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Usuario Responsable</label>
            <input
              type="text"
              name="userioResponsable"
              value={formData.userioResponsable}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:border-[#285398] focus:ring-0 px-2 py-1 bg-white hover:bg-gray-50 transition-colors outline-none"
              readOnly
            />
          </div>

          {/* Row 4: Fechas */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha Inicio</label>
            <input
              type="date"
              name="fechaInicioPermiso"
              value={formData.fechaInicioPermiso}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:border-[#285398] focus:ring-0 px-2 py-1 bg-white hover:bg-gray-50 transition-colors outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha Final</label>
            <input
              type="date"
              name="fechaFinalPermiso"
              value={formData.fechaFinalPermiso}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:border-[#285398] focus:ring-0 px-2 py-1 bg-white hover:bg-gray-50 transition-colors outline-none"
              required
            />
          </div>

          {/* Row 5: Configuraciones adicionales - Checkboxes en 2 columnas */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-3">Configuraciones Adicionales</label>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center h-10">
                <input
                  type="checkbox"
                  name="permitirTodasEmpresas"
                  checked={formData.permitirTodasEmpresas}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-200 text-blue-600 focus:ring-blue-500 outline-none"
                />
                <label className="ml-2 block text-sm text-gray-700">Permitir Todas las Empresas</label>
              </div>
              <div className="flex items-center h-10">
                <input
                  type="checkbox"
                  name="permitirMasDeUnaSesion"
                  checked={formData.permitirMasDeUnaSesion}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-200 text-blue-600 focus:ring-blue-500 outline-none"
                />
                <label className="ml-2 block text-sm text-gray-700">Múltiples Sesiones</label>
              </div>
              <div className="flex items-center h-10">
                <input
                  type="checkbox"
                  name="cierreSesionJornada"
                  checked={formData.cierreSesionJornada}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-200 text-blue-600 focus:ring-blue-500 outline-none"
                />
                <label className="ml-2 block text-sm text-gray-700">Cierre Automático de Sesión</label>
              </div>
              <div className="flex items-center h-10">
                <input
                  type="checkbox"
                  name="bloqueoSesionMaxima"
                  checked={formData.bloqueoSesionMaxima}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-200 text-blue-600 focus:ring-blue-500 outline-none"
                />
                <label className="ml-2 block text-sm text-gray-700">Bloqueo de Sesión Máxima</label>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}