import React, { useState, useEffect } from 'react';
import { getEmpresas } from '../../services/company/CompanyService';
import { getUsers } from '../../services/user/UserService';
import { getPerfilesAcceso } from '../../services/accessProfile/AccessProfileService';
import { useAuth } from '../../contexts/AuthContext';



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
        
        // Cargar empresas (todas las páginas)
        const empresasResponse = await getEmpresas({
          getAll: true,
          pageSize: 100
        });

        // Manejar la respuesta según el formato
        let empresasData = [];
        if (Array.isArray(empresasResponse)) {
          empresasData = empresasResponse;
        } else if (empresasResponse?.empresas && Array.isArray(empresasResponse.empresas)) {
          empresasData = empresasResponse.empresas;
        } else if (empresasResponse?.data && Array.isArray(empresasResponse.data)) {
          empresasData = empresasResponse.data;
        }

        if (empresasData.length > 0) {
          const empresasFormateadas = empresasData.map(empresa => ({
            value: empresa.codeCompany || empresa.idEmpresa || empresa.id,
            label: empresa.businessName || empresa.nombreEmpresa || empresa.name,
            data: empresa // Mantener los datos completos de la empresa
          }));
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
        setError('Error al cargar los datos necesarios');
        setLoading(false);
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

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[600px] max-h-[90vh] overflow-y-auto relative">
        <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold focus:outline-none">&times;</button>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Nuevo Permiso</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {loading && <div className="text-center py-4">Cargando...</div>}
          {error && <div className="text-red-500 mb-4">{error}</div>}

          <div className="grid grid-cols-1 gap-4">
            {/* Selector de Usuario */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
              <select
                name="idUser"
                value={formData.idUser}
                onChange={(e) => handleSelectChange('idUser', e.target.value)}
                className="w-full border p-2 rounded"
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

            {/* Selector de Función */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Función</label>
              <select
                name="idFunction"
                value={formData.idFunction}
                onChange={(e) => handleSelectChange('idFunction', e.target.value)}
                className="w-full border p-2 rounded"
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



            {/* Campos de permisos */}
            <div className="space-y-2">
              {/* Selector de Empresa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
                <select
                  name="codigoEntidad"
                  value={formData.codigoEntidad}
                  onChange={(e) => handleSelectChange('codigoEntidad', e.target.value)}
                  className="w-full border p-2 rounded"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado del Permiso</label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="estadoPermisoActivado"
                    checked={formData.estadoPermisoActivado}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Activado</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Permitir acceso a todas las empresas</label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="permitirTodasEmpresas"
                    checked={formData.permitirTodasEmpresas}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Permitir</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Permitir múltiples sesiones</label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="permitirMasDeUnaSesion"
                    checked={formData.permitirMasDeUnaSesion}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Permitir</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cierre de sesión automático</label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="cierreSesionJornada"
                    checked={formData.cierreSesionJornada}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Activado</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bloqueo de sesión máxima</label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="bloqueoSesionMaxima"
                    checked={formData.bloqueoSesionMaxima}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Activado</span>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Crear Permiso
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
