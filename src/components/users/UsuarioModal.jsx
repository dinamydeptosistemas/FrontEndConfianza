import React, { useState, useEffect } from 'react';
import { getEmpresas } from '../../services/company/CompanyService'; // Asegúrate de que este servicio exista


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
  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [formData, setFormData] = useState({
    nombreUser: usuario?.nombreUser || '',
    apellidosUser: usuario?.apellidosUser || '',
    identificacion: usuario?.identificacion || '',
    usuarioActivo: usuario?.usuarioActivo || true,
    username: usuario?.username || '',
    passnumber: '',
    password: '',
    confirmPassword: '',
    emailUsuario: usuario?.emailUsuario || '',
    celularUsuario: usuario?.celularUsuario || '',
    sms: usuario?.sms || false,
    whatsap: usuario?.whatsap || false,
    tipoUser: usuario?.tipoUser || '',
    relacionUsuario: usuario?.relacionUsuario || '',
    codeEntity: usuario?.codeEntity || ''
  });

  const [empresas, setEmpresas] = useState([]); // Estado para almacenar las empresas
  const [loadingEmpresas, setLoadingEmpresas] = useState(false); // Estado para manejar la carga

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
          // Si el backend devuelve totalPages, úsalo; si no, termina cuando companies.length < pageSize
          totalPages = response.totalPages || totalPages;
          page++;
          // Si no hay totalPages, termina cuando no se reciban más empresas
          if (!response.totalPages && (!response.companies || response.companies.length === 0)) {
            break;
          }
        } while (page <= totalPages);
        // Si estamos editando y la empresa actual no está en la lista, agrégala como opción especial
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };
      // Solo autogenerar si NO es edición
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

  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    // Validación de passnumber (PIN) solo al crear
    if (!isEditing && !/^\d{4}$/.test(formData.passnumber)) {
      setError('El PIN debe tener exactamente 4 dígitos numéricos.');
      return;
    }
    // Validación de password solo si tiene valor
    if (formData.password && formData.password.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }
    // Validación de confirmación solo si password tiene valor
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    // Envía ambos campos tal cual
    let dataToSend = { ...formData };
  // El backend espera 'passNumber' y no 'passnumber'. No envíes si está vacío.
  if (dataToSend.passnumber !== undefined) {
    if (dataToSend.passnumber && dataToSend.passnumber.trim() !== '') {
      dataToSend.passNumber = dataToSend.passnumber;
    }
    delete dataToSend.passnumber;
  }
  console.log('Datos a guardar:', dataToSend); // Verifica los datos
  onSave(dataToSend);
  onClose();
  };



  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50 ${isOpen ? 'block' : 'hidden'}`}>
      <div className="bg-white p-6 rounded-lg shadow-lg w-[800px] max-h-[90vh] overflow-y-auto relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold focus:outline-none"
          aria-label="Cerrar"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4 py-2 text-gray-800">{isEditing ? 'Editar Usuario' : 'Crear Usuario'}</h2>
        {error && (
          <div className="col-span-2 mb-2 text-red-600 font-bold">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              name="nombreUser"
              value={formData.nombreUser}
              onChange={handleChange}
              className="mt-1 block w-full h-10 rounded-md border border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-2 py-1 outline-none"
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
              className="mt-1 block w-full h-10 rounded-md border border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-2 py-1 outline-none"
              required={!isEditing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Identificación</label>
            <input
              type="text"
              name="identificacion"
              value={formData.identificacion}
              onChange={handleChange}
              className="mt-1 block w-full h-10 rounded-md border border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-2 py-1 outline-none"
              required={!isEditing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              disabled={true}
              className="mt-1 block w-full h-10 bg-gray-200 rounded-md border border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-2 py-1 outline-none"
              required={!isEditing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="emailUsuario"
              value={formData.emailUsuario}
              onChange={handleChange}
              className="mt-1 block w-full h-10 rounded-md border border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-2 py-1 outline-none"
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
              className="mt-1 block w-full h-10 rounded-md border border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-2 py-1 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Código de Empresa</label>
            <select
              name="codeEntity"
              value={formData.codeEntity}
              onChange={handleChange}
              className="mt-1 block w-full h-10 rounded-md border border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-2 py-1 outline-none"
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
              className="mt-1 block w-full h-10 rounded-md border border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-2 py-1 outline-none"
              required={!isEditing}
            >
              <option value="">Seleccione tipo</option>
              <option value="INTERNO">INTERNO</option>
              <option value="EXTERNO">EXTERNO</option>
            </select>
          </div>

          <div>
  <label className="block text-sm font-medium text-gray-700">Relación Usuario</label>
  <select
    name="relacionUsuario"
    value={formData.relacionUsuario}
    onChange={handleChange}
    className="mt-1 block w-full h-10 rounded-md border border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-2 py-1 outline-none"
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
                type={isEditing && !showPassword ? 'password' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full h-10 rounded-md border border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-2 py-1 pr-10 outline-none placeholder-gray-600"
                placeholder={isEditing && usuario && usuario.password && !formData.password ? '********' : ''}
                autoComplete="new-password"
              />
              {isEditing && usuario && usuario.password && !formData.password && (
                <div className="text-xs text-gray-500 mt-1">
                  Por seguridad, la contraseña no se muestra. Si deseas cambiarla, escribe una nueva.
                </div>
              )}
              {isEditing && (
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-700"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.042-3.338M6.873 6.873A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.956 9.956 0 01-4.043 5.306M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  )}
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">PIN (4 dígitos)</label>
            <div className="relative">
              <input
                type={isEditing && !showPin ? 'password' : 'password'}
                name="passnumber"
                value={formData.passnumber}
                onChange={handleChange}
                className="mt-1 block w-full h-10 rounded-md border border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-2 py-1 pr-10 outline-none"
                maxLength={4}
                pattern="\d{4}"
            
              />
              {isEditing && (
                <button
                  type="button"
                  onClick={() => setShowPin((v) => !v)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-700"
                  tabIndex={-1}
                >
                  {showPin ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.042-3.338M6.873 6.873A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.956 9.956 0 01-4.043 5.306M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  )}
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="mt-1 block w-full h-10 rounded-md border border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-2 py-1 outline-none"
              
            />
          </div>

          <div className="col-span-2 flex items-center">
            <input
              type="checkbox"
              name="sms"
              checked={formData.sms}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-200 text-blue-600 focus:ring-blue-500 outline-none"
            />
            <label className="ml-2 block text-sm text-gray-700">Recibir SMS</label>
          </div>

          <div className="col-span-2 flex items-center">
            <input
              type="checkbox"
              name="whatsap"
              checked={formData.whatsap}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-200 text-blue-600 focus:ring-blue-500 outline-none"
            />
            <label className="ml-2 block text-sm text-gray-700">Recibir WhatsApp</label>
          </div>

          <div className="col-span-2 flex items-center">
            <input
              type="checkbox"
              name="usuarioActivo"
              checked={formData.usuarioActivo}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-200 text-blue-600 focus:ring-blue-500 outline-none"
            />
            <label className="ml-2 block text-sm text-gray-700">Usuario Activo</label>
          </div>

          <div className="col-span-2 flex justify-end gap-2 mt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-[#1e4e9c] text-white font-bold rounded hover:bg-blue-700 outline-none"
            >
              {isEditing ? 'Actualizar' : 'Crear'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UsuarioModal; 