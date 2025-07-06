import React, { useState, useEffect } from 'react';
import { getEmpresas } from '../../services/company/CompanyService';
import { useNotification } from '../../context/NotificationContext';
import ActionButtons, { LoadingOverlay } from '../common/Buttons';

function generarUsername({ apellidosUser, nombreUser, celularUsuario }) {
  const [primerApellido = '', segundoApellido = ''] = (apellidosUser || '').trim().split(' ');
  const primerNombre = (nombreUser || '').trim().split(' ')[0] || '';
  const cel = (celularUsuario || '').replace(/\D/g, '');
  const parte1 = (primerApellido.toUpperCase().substring(0, 2) || 'XX');
  const parte2 = (segundoApellido.toUpperCase().substring(0, 2) || 'XX');
  const parte3 = (primerNombre.toUpperCase().substring(0, 2) || 'XX');
  const parte4 = cel.length >= 2 ? cel.slice(-2) : '00';
  return `${parte1}${parte2}${parte3}${parte4}`;
}

const UsuarioModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  usuario = null, 
  isEditing = false 
}) => {
  // Estados para mostrar/ocultar contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Usar el contexto de notificaciones global
  const { showSuccessMessage } = useNotification();

  // Estado inicial del formulario
  const [formData, setFormData] = useState({
    nombreUser: '',
    apellidosUser: '',
    identificacion: '',
    usuarioActivo: true,
    username: '',
    passnumber: '',
    password: '',
    confirmPassword: '',
    emailUsuario: '',
    celularUsuario: '',
    sms: false,
    whatsap: false,
    tipoUser: '',
    relacionUsuario: '',
    codeEntity: ''
  });

  // Estados para empresas
  const [empresas, setEmpresas] = useState([]);
  const [loadingEmpresas, setLoadingEmpresas] = useState(false);
  
  // Estado para errores
  const [error, setError] = useState('');

  // Efecto para inicializar datos cuando se recibe el usuario
  useEffect(() => {
    if (usuario) {
      setFormData({
        ...usuario,
        password: '', // Nunca mostrar ni inicializar password real
        passnumber: '', // Al editar, el PIN siempre inicia vacío
        confirmPassword: ''
      });
    } else {
      setFormData({
        nombreUser: '',
        apellidosUser: '',
        identificacion: '',
        usuarioActivo: true,
        username: '',
        passnumber: '',
        password: '',
        confirmPassword: '',
        emailUsuario: '',
        celularUsuario: '',
        sms: false,
        whatsap: false,
        tipoUser: '',
        relacionUsuario: '',
        codeEntity: ''
      });
    }
  }, [usuario]);

  // Efecto para cargar empresas cuando se abre el modal
  useEffect(() => {
    const fetchAllEmpresas = async () => {
      setLoadingEmpresas(true);
      try {
        let allEmpresas = [];
        let page = 1;
        let totalPages = 1;
        
        do {
          const response = await getEmpresas({ page });
          if (Array.isArray(response.companies)) {
            allEmpresas = allEmpresas.concat(response.companies);
          }
          totalPages = response.totalPages || totalPages;
          page++;
          
          if (!response.totalPages && (!response.companies || response.companies.length === 0)) {
            break;
          }
        } while (page <= totalPages);
        
        // Si estamos editando y la empresa actual no está en la lista, agrégala
        if (isEditing && usuario && usuario.codeEntity) {
          const exists = allEmpresas.some(e => e.codeEntity === usuario.codeEntity);
          if (!exists) {
            allEmpresas.unshift({
              codeEntity: usuario.codeEntity,
              businessName: '(Empresa actual, no disponible)'
            });
          }
        }
        
        setEmpresas(allEmpresas);
      } catch (error) {
        console.error('Error al cargar empresas:', error);
      } finally {
        setLoadingEmpresas(false);
      }
    };

    if (isOpen) {
      fetchAllEmpresas();
    }
  }, [isOpen, isEditing, usuario]);

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };
      
      // Solo autogenerar username si NO es edición
      if (!isEditing && (name === 'nombreUser' || name === 'apellidosUser' || name === 'celularUsuario')) {
        newData.username = generarUsername({
          apellidosUser: newData.apellidosUser,
          nombreUser: newData.nombreUser,
          celularUsuario: newData.celularUsuario
        });
      }
      
      return newData;
    });
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Validación de PIN solo al crear
      if (!isEditing && !/^\d{4}$/.test(formData.passnumber)) {
        setError('El PIN debe tener exactamente 4 dígitos numéricos.');
        setLoading(false);
        return;
      }
      
      // Validación de password solo si tiene valor
      if (formData.password && formData.password.length < 4) {
        setError('La contraseña debe tener al menos 4 caracteres.');
        setLoading(false);
        return;
      }
      
      // Validación de confirmación solo si password tiene valor
      if (formData.password && formData.password !== formData.confirmPassword) {
        setError('Las contraseñas no coinciden.');
        setLoading(false);
        return;
      }
      
      // Preparar datos para envío
      let dataToSend = { ...formData };
      
      // El backend espera 'passNumber' en lugar de 'passnumber'
      if (dataToSend.passnumber !== undefined) {
        if (dataToSend.passnumber && dataToSend.passnumber.trim() !== '') {
          dataToSend.passNumber = dataToSend.passnumber;
        }
        delete dataToSend.passnumber;
      }
      
      // Eliminar confirmPassword del payload
      delete dataToSend.confirmPassword;
      
      console.log('Datos a guardar:', dataToSend);
      
      await onSave(dataToSend);
      
      setLoading(false);
      
      // Mostrar mensaje de éxito usando el contexto global
      showSuccessMessage(isEditing ? '¡Usuario actualizado exitosamente!' : '¡Usuario creado exitosamente!');
      
      // Cerrar modal
      if (onClose) {
        onClose();
      }
      
    } catch (error) {
      setLoading(false);
      setError('Error al guardar el usuario');
      console.error('Error al guardar usuario:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white py-6 px-10 rounded-lg shadow-lg w-[750px] max-h-[90vh] overflow-y-auto relative">
        {/* Overlay de carga */}
        {loading && <LoadingOverlay isLoading={true} message={isEditing ? "Actualizando usuario..." : "Creando usuario..."} />}
        
      

        {/* Header con título y botones */}
        <div className="grid grid-cols-2 items-center">
          <h2 className="text-2xl font-bold text-gray-800 pt-4">
            {isEditing ? 'Editar Usuario' : 'Crear Usuario'}
          </h2>
          <div className="flex justify-end gap-3 mr-[25px] mb-2">
            <ActionButtons 
              onClose={onClose} 
              handleSubmit={handleSubmit} 
              disabled={false} 
              loading={loading}
              loadingText={isEditing ? "Actualizando..." : "Creando..."}
            />
          </div>
        </div>
        <hr className="col-span-2 border-blue-500 mr-6 m-0 p-0" />

        {/* Mostrar errores */}
        {error && (
          <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid mt-5 grid-cols-2 gap-x-4 gap-y-3 relative">
          
          {/* Row 1: Estado activo + Indicador visual */}
          <div className="flex items-center h-10">
          <div className={`inline-flex px-4 py-2 text-[1rem] rounded-full text-xs font-medium ${formData.usuarioActivo ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}> 
              {formData.usuarioActivo ? 'ACTIVO' : 'INACTIVO'}
            </div>

          </div>
          <div className="flex items-center h-10">
        <label className="text-sm text-gray-700 font-medium">Usuario Activo</label>
            <input
              type="checkbox"
              name="usuarioActivo"
              checked={formData.usuarioActivo}
              onChange={handleChange}
              className="h-4 w-4 ml-2 rounded border-gray-200 text-blue-600 focus:ring-blue-500 outline-none"
            />
          </div>

          
          {/* Row 3: Identificación + Username */}
          <div>
          <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:border-[#285398] focus:ring-0 px-2 py-1 bg-blue-200 text-gray-600 transition-colors outline-none"
              readOnly
            />
          </div>
          <div>

          <label className="block text-sm font-medium text-gray-700">Identificación</label>
            <input
              type="text"
              name="identificacion"
              value={formData.identificacion}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:border-[#285398] focus:ring-0 px-2 py-1 bg-white hover:bg-gray-50 transition-colors outline-none"
              required={!isEditing}
            />
         
           
          </div>


          {/* Row 2: Nombre + Apellidos */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              name="nombreUser"
              value={formData.nombreUser}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:border-[#285398] focus:ring-0 px-2 py-1 bg-white hover:bg-gray-50 transition-colors outline-none"
              required={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Apellidos</label>
            <input
              type="text"
              name="apellidosUser"
              value={formData.apellidosUser}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:border-[#285398] focus:ring-0 px-2 py-1 bg-white hover:bg-gray-50 transition-colors outline-none"
              required={!isEditing}
            />
          </div>

          {/* Row 4: Email + Celular */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="emailUsuario"
              value={formData.emailUsuario}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:border-[#285398] focus:ring-0 px-2 py-1 bg-white hover:bg-gray-50 transition-colors outline-none"
              required={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Celular</label>
            <input
              type="tel"
              name="celularUsuario"
              value={formData.celularUsuario}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:border-[#285398] focus:ring-0 px-2 py-1 bg-white hover:bg-gray-50 transition-colors outline-none"
            />
          </div>

          {/* Row 5: Código de Empresa + Tipo de Usuario */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Código de Empresa</label>
            <select
              name="codeEntity"
              value={formData.codeEntity}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:border-[#285398] focus:ring-0 px-2 py-1 bg-white hover:bg-gray-50 transition-colors outline-none"
              required={!isEditing}
            >
              <option value="">Seleccione una empresa</option>
              {loadingEmpresas ? (
                <option>Cargando...</option>
              ) : (
                empresas.map(empresa => (
                  <option key={empresa.codeEntity} value={empresa.codeEntity}>
                    {empresa.businessName}
                  </option>
                ))
              )}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo de Usuario</label>
            <select
              name="tipoUser"
              value={formData.tipoUser}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:border-[#285398] focus:ring-0 px-2 py-1 bg-white hover:bg-gray-50 transition-colors outline-none"
              required={!isEditing}
            >
              <option value="">Seleccione tipo</option>
              <option value="INTERNO">INTERNO</option>
              <option value="EXTERNO">EXTERNO</option>
            </select>
          </div>

          {/* Row 6: Relación Usuario + Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Relación Usuario</label>
            <select
              name="relacionUsuario"
              value={formData.relacionUsuario}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:border-[#285398] focus:ring-0 px-2 py-1 bg-white hover:bg-gray-50 transition-colors outline-none"
              required={!isEditing}
            >
              <option value="">Seleccione relación</option>
              <option value="EMPLEADO">EMPLEADO</option>
              <option value="AYUDANTE">AYUDANTE</option>
              <option value="PROFESIONAL">PROFESIONAL</option>
              <option value="PROVEEDOR">PROVEEDOR</option>
              <option value="CLIENTE">CLIENTE</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:border-[#285398] focus:ring-0 px-2 py-1 pr-10 bg-white hover:bg-gray-50 transition-colors outline-none"
                placeholder={isEditing && usuario && usuario.password && !formData.password ? '********' : ''}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-700"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.042-3.338M6.873 6.873A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.956 9.956 0 01-4.043 5.306M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
            {isEditing && usuario && usuario.password && !formData.password && (
              <div className="text-xs text-gray-500 mt-1">
                Por seguridad, la contraseña no se muestra. Si deseas cambiarla, escribe una nueva.
              </div>
            )}
          </div>

          {/* Row 7: PIN + Confirmar Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700">PIN (4 dígitos)</label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                name="passnumber"
                value={formData.passnumber}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:border-[#285398] focus:ring-0 px-2 py-1 pr-10 bg-white hover:bg-gray-50 transition-colors outline-none"
                maxLength={4}
                pattern="\d{4}"
                required={!isEditing}
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-700"
                tabIndex={-1}
              >
                {showPin ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.042-3.338M6.873 6.873A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.956 9.956 0 01-4.043 5.306M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:border-[#285398] focus:ring-0 px-2 py-1 bg-white hover:bg-gray-50 transition-colors outline-none"
            />
          </div>

          {/* Row final: Checkboxes en 2 columnas */}
          <div className="col-span-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center h-10">
                <input
                  type="checkbox"
                  name="sms"
                  checked={formData.sms}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-200 text-blue-600 focus:ring-blue-500 outline-none"
                />
                <label className="ml-2 block text-sm text-gray-700">Recibir SMS</label>
              </div>
              <div className="flex items-center h-10">
                <input
                  type="checkbox"
                  name="whatsap"
                  checked={formData.whatsap}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-200 text-blue-600 focus:ring-blue-500 outline-none"
                />
                <label className="ml-2 block text-sm text-gray-700">Recibir WhatsApp</label>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UsuarioModal;