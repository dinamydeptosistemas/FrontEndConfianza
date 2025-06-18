import React, { useState, useEffect } from 'react';
import MensajeHead from '../../components/forms/MensajeHead';
import RegisterSuccess from '../../components/RegisterSuccess';
import externalRegistrerService from '../../services/registrer/ExternalRegistrerService';

const relaciones = [
  { label: 'Cliente', value: 1 },
  { label: 'Proveedor', value: 2 },
  { label: 'Ex-empleado', value: 3 },
  { label: 'Contratista', value: 4 },
  { label: 'Transportista', value: 5 },
  { label: 'Seguridad', value: 6 },
  { label: 'Comisionista', value: 7 },
  { label: 'Postulante', value: 8 },
];

const tiposId = [
  { label: 'PERSONA NATURAL', value: 'persona_natural' },
  { label: 'SOCIEDADES', value: 'sociedades' },
];

const RegistrerUserExternal = () => {
  // Estados para el formulario principal
  const [form, setForm] = useState({
    identificacion: '',
    email: '',
    tipo_id: '',
    nombres: '',
    celular: '',
    claveNumero: '',
    repetirClave: ''
  });
  
  // Estados para control de la aplicación
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [relacionuser, setRelacionuser] = useState('');
  const [selectedRelacion, setSelectedRelacion] = useState('');

  // Estado para controlar la visualización del formulario de contacto
  const [showContactForm, setShowContactForm] = useState(false);
  
  // Estado para el formulario de contacto
  const [contactForm, setContactForm] = useState({
    apellidos: '',
    nombres: '', 
    celular: '', 
    email: '',
    username: ''
  });
  
  const [passwordError, setPasswordError] = useState('');
  const [esClienteProveedor, setEsClienteProveedor] = useState(null);
  const [esExEmpleado, setEsExEmpleado] = useState(null);

  // Genera el username automáticamente basado en los datos de contacto
  // Genera el username cuando cambian los datos relevantes
  useEffect(() => {
    const { nombres, apellidos, celular, username } = contactForm;
    if (!nombres || !apellidos || !celular || celular.length < 2) return;

    const apellidosArray = apellidos.split(' ');
    const primerApellido = apellidosArray[0] || '';
    const segundoApellido = apellidosArray[1] || '';
    const primerNombre = nombres.split(' ')[0] || '';
    const ultimosDigitosCelular = celular.slice(-2);
    
    const generatedUsername = (
      (primerApellido.slice(0, 2)) +
      (segundoApellido.slice(0, 2)) +
      (primerNombre.slice(0, 2)) +
      ultimosDigitosCelular
    ).toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "")
      .toUpperCase();

    if (generatedUsername !== username) {
      setContactForm(prev => ({ ...prev, username: generatedUsername }));
    }
  }, [contactForm]);

  // Maneja la selección de relación y determina el tipo de usuario
  const handleRelacionBtnClick = (value) => {
    setSelectedRelacion(value);
    setError('');
    setRelacionuser(value);
    
    // Lógica simplificada para determinar el tipo de relación
    if (value === 'CLIENTE' || value === 'PROVEEDOR') {
      setEsClienteProveedor(true);
      setEsExEmpleado(false);
    } else if (value === 'EXEMPLEADO') {
      setEsClienteProveedor(false);
      setEsExEmpleado(true);
    } else {
      setEsClienteProveedor(false);
      setEsExEmpleado(false);
    }
  };

  // Maneja cambios en los inputs del formulario principal
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  // Valida el formato de la contraseña
  const validatePasswordFormat = () => {
    const pass = form.claveNumero;
    if (pass.length < 4) {
      setPasswordError('La clave debe tener al menos 4 caracteres.');
      return false;
    } else if (!/[A-Z]/.test(pass)) {
      setPasswordError('La clave debe contener al menos una mayúscula.');
      return false;
    } else if (!/[0-9]/.test(pass)) {
      setPasswordError('La clave debe contener al menos un número.');
      return false;
    } else {
      setPasswordError('');
      return true;
    }
  };

  // Valida los campos obligatorios del formulario principal
  const validateMainForm = () => {
    if (!selectedRelacion) {
      setError('Debe seleccionar una relación');
      return false;
    }
    
    if (!form.identificacion) {
      setError('El campo CC/RUC es obligatorio');
      return false;
    }
    
    if (!form.email) {
      setError('El campo Email es obligatorio');
      return false;
    }
    
    if (!form.tipo_id) {
      setError('Debe seleccionar un tipo de ID');
      return false;
    }
    
    if (!form.nombres) {
      setError('El campo Nombres es obligatorio');
      return false;
    }
    
    return true;
  };

  // Maneja el envío del formulario principal
  const handleSubmitMainForm = (e) => {
    e.preventDefault();
    
    if (!validateMainForm()) {
      return;
    }

    // Preparar datos para el formulario de contacto
    setContactForm(prev => ({
      ...prev,
      email: form.email,
      actualizar: '0' // Valor por defecto
    }));
    
    setShowContactForm(true);
  };

  // Valida los campos del formulario de contacto
  const validateContactForm = () => {
    const requiredFields = [
      { field: 'apellidos', message: 'El campo Apellidos es obligatorio' },
      { field: 'nombres', message: 'El campo Nombres es obligatorio' },
      { field: 'celular', message: 'El campo Celular es obligatorio' },
      { field: 'email', message: 'El campo Email es obligatorio' },
      { field: 'username', message: 'El campo Username es obligatorio' }
    ];

    for (const { field, message } of requiredFields) {
      if (!contactForm[field]) {
        setError(message);
        return false;
      }
    }

    // Validación de contraseñas para usuarios específicos
    const requiresPassword = ['CLIENTE', 'PROVEEDOR', 'EXEMPLEADO'].includes(selectedRelacion);
    if (requiresPassword) {
      if (!form.claveNumero) {
        setError('El campo Clave es obligatorio');
        return false;
      }
      
      if (!form.repetirClave) {
        setError('Debe repetir la clave');
        return false;
      }
      
      if (form.claveNumero !== form.repetirClave) {
        setError('Las claves no coinciden');
        return false;
      }
      
      if (!validatePasswordFormat()) {
        return false;
      }
    }
    
    return true;
  };

  // Maneja el registro final del usuario
  const handleRegister = async (e) => {
    if (e) e.preventDefault();
    
    if (!validateContactForm()) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Validar campos obligatorios
      const requiredFields = [
        { field: 'identificacion', label: 'Identificación' },
        { field: 'email', label: 'Email', form: 'contactForm' },
        { field: 'apellidos', label: 'Apellidos', form: 'contactForm' },
        { field: 'nombres', label: 'Nombres', form: 'contactForm' },
        { field: 'celular', label: 'Celular', form: 'contactForm' },
        { field: 'claveNumero', label: 'Clave' },
        { field: 'username', label: 'Usuario', form: 'contactForm' }
      ];

      for (const item of requiredFields) {
        const value = item.form === 'contactForm' ? contactForm[item.field] : form[item.field];
        if (!value) {
          setError(`El campo ${item.label} es obligatorio`);
          return;
        }
      }

      if (!relacionuser) {
        setError('Debe seleccionar una relación de usuario');
        return;
      }

      // Validar celular (10 dígitos)
      if (!/^[0-9]{10}$/.test(contactForm.celular)) {
        setError('El celular debe tener exactamente 10 dígitos');
        return;
      }

      // Validar email (debe contener @ y formato básico)
      if (!/^\S+@\S+\.\S+$/.test(contactForm.email)) {
        setError('Correo inválido');
        return;
      }

      // Validar campos adicionales para postulantes

      const registerData = {
        nombreuser: contactForm.nombres,
        apellidouser: contactForm.apellidos,
        identificacion: form.identificacion,
        username: contactForm.username.toUpperCase(),
        passnumber: parseInt(form.claveNumero),
        emailusuario: contactForm.email,
        celularusuario: contactForm.celular,
        relacionuser: relacionuser,
        tipousuario: 2
      };

      console.log('Intentando registrar usuario con:', registerData);
      const result = await externalRegistrerService.register({ request: registerData });
      
      if (result && result.statusCode === 200) {
        setShowSuccess(true);
        setShowContactForm(false);
      } else {
        setError(result?.message || 'Error al registrar usuario');
      }
    } catch (err) {
      console.error('Error en registro:', err);
      setError('Error al registrar usuario: ' + (err.message || 'Intente más tarde'));
    } finally {
      setLoading(false);
    }
  };

  // Renderiza los botones de relación con lógica de habilitación/deshabilitación
  const renderRelationButton = (rel) => {
    const isDisabled = 
      (esClienteProveedor === true && !['CLIENTE', 'PROVEEDOR'].includes(rel.value)) ||
      (esClienteProveedor === false && ['CLIENTE', 'PROVEEDOR'].includes(rel.value)) ||
      (esExEmpleado === true && rel.value !== 'EXEMPLEADO') ||
      (esExEmpleado === false && rel.value === 'EXEMPLEADO');
    
    return (
      <button
        key={rel.value}
        type="button"
        className={`relationship-btn py-1 rounded border transition-colors h-[36px] text-sm ${
          selectedRelacion === rel.value 
            ? 'bg-[#0b49ab] text-white border-[#0b49ab]' 
            : isDisabled
              ? 'bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed'
              : 'bg-[#f2f5f4] text-gray-700 border-[#f2f5f4] hover:bg-[#e0e0e0]'
        }`}
        onClick={() => !isDisabled && handleRelacionBtnClick(rel.value)}
        disabled={isDisabled}
      >
        {rel.label}
      </button>
    );
  };

  if (showSuccess) {
    return <RegisterSuccess />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <MensajeHead />
      {!showContactForm && (
        <div className="site-title text-[#0047AB] text-3xl font-bold mb-2">
          SG CONFIANZA 2.5
        </div>
      )}
     
      <h2 className="page-subtitle text-xl font-bold mb-6 text-[#777777]">
        Crear Nueva Cuenta
      </h2>

      {!showContactForm ? (
        <>
          {/* Sección de preguntas de confirmación */}
          <div className="confirmation-box bg-[#cacaca] p-6 rounded-lg mb-6 w-[405px]">
            <div className="confirmation-questions">
              <p className="mb-2">
                <span className="question-text font-semibold">
                  1. ¿Necesita esta cuenta para acceder como CLIENTE o PROVEEDOR?
                </span>
                <span className="radio-options ml-4">
                  <input 
                    type="radio" 
                    id="q1_si" 
                    name="cliente_proveedor" 
                    checked={esClienteProveedor === true} 
                    onChange={() => {
                      setEsClienteProveedor(true);
                      setEsExEmpleado(false);
                      setSelectedRelacion('');
                      setRelacionuser('');
                    }}
                  />
                  <label htmlFor="q1_si" className="mr-2">Sí</label>
                  <input 
                    type="radio" 
                    id="q1_no" 
                    name="cliente_proveedor" 
                    checked={esClienteProveedor === false} 
                    onChange={() => {
                      setEsClienteProveedor(false);
                      if (['CLIENTE', 'PROVEEDOR'].includes(selectedRelacion)) {
                        setSelectedRelacion('');
                        setRelacionuser('');
                      }
                    }}
                  />
                  <label htmlFor="q1_no">No</label>
                </span>
              </p>
              
              <p className="mb-2">
                <span className="question-text font-semibold">
                  2. ¿Necesita esta cuenta para acceder como EX-EMPLEADO?
                </span>
                <span className="radio-options ml-4">
                  <input 
                    type="radio" 
                    id="q2_si" 
                    name="ex_empleado" 
                    checked={esExEmpleado === true} 
                    onChange={() => {
                      setEsExEmpleado(true);
                      setEsClienteProveedor(false);
                      setSelectedRelacion('EXEMPLEADO');
                      setRelacionuser('EXEMPLEADO');
                    }}
                  />
                  <label htmlFor="q2_si" className="mr-2">Sí</label>
                  <input 
                    type="radio" 
                    id="q2_no" 
                    name="ex_empleado" 
                    checked={esExEmpleado === false} 
                    onChange={() => {
                      setEsExEmpleado(false);
                      if (selectedRelacion === 'EXEMPLEADO') {
                        setSelectedRelacion('');
                        setRelacionuser('');
                      }
                    }}
                  />
                  <label htmlFor="q2_no">No</label>
                </span>
              </p>
              
              <p className="font-semibold">
                3. Selecciona con el botón la relación que solicita para acceder:
              </p>
            </div>
            
            <div className="relationship-buttons-container mt-2">
              {/* Dividir los botones en grupos de 3 */}
              {Array.from({ length: Math.ceil(relaciones.length / 3) }).map((_, rowIndex) => (
                <div key={rowIndex} className="grid grid-cols-3 gap-2 mb-2">
                  {relaciones.slice(rowIndex * 3, rowIndex * 3 + 3).map(renderRelationButton)}
                </div>
              ))}
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="text-red-600 text-center mt-3 font-semibold">
                {error}
              </div>
            )}

            {/* Formulario principal */}
            <form onSubmit={handleSubmitMainForm} className="form-inner bg-[#0047ab] px-6 py-4 rounded-lg mt-4 text-white">
              <div className="form-group mb-3">
                <label htmlFor="identificacion" className="block mb-1">CC/RUC:</label>
                <input
                  type="text"
                  id="identificacion"
                  name="identificacion"
                  value={form.identificacion}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-1 h-[36px] rounded text-gray-800 border-0"
                />
              </div>
              
              <div className="form-group mb-3">
                <label htmlFor="email" className="block mb-1">Email:</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-1 h-[36px] rounded text-gray-800 border-0"
                />
              </div>

              <div className="form-group mb-3">
                <label htmlFor="tipo_id" className="block mb-1">Tipo ID:</label>
                <select
                  id="tipo_id"
                  name="tipo_id"
                  value={form.tipo_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-1 h-[36px] rounded text-gray-800 border-0"
                >
                  <option value="">Seleccione tipo ID</option>
                  {tiposId.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group mb-3">
                <label htmlFor="nombres" className="block mb-1">Nombres:</label>
                <input
                  type="text"
                  id="nombres"
                  name="nombres"
                  value={form.nombres}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-1 h-[36px] rounded text-gray-800 border-0"
                />
              </div>

              {/* Botón de registrar */}
              <div className="flex justify-center mt-4">
                <button
                  type="submit"
                  className="register-button px-6 py-2 bg-[#4299e1] hover:bg-[#3182ce] text-white font-medium rounded transition-colors"
                  disabled={loading}
                >
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </>
      ) : (
        /* Formulario de información adicional */
        <div className="create-user-form bg-[#0047ab] px-6 py-4 rounded-lg w-[405px] text-white">
          <div className="login-container user-section-box">
            <h3 className="text-2xl font-bold mb-4 text-center">Ingrese Contacto</h3>
            
            <div className="mb-2 flex items-center">
              <label className="w-1/3">Apellidos:</label>
              <input
                type="text"
                name="apellidos"
                value={contactForm.apellidos}
                onChange={(e) => setContactForm(prev => ({ ...prev, apellidos: e.target.value }))}
                className="w-2/3 px-2 py-1 h-[34px] rounded text-gray-800 bg-white"
              />
            </div>

            <div className="mb-2 flex items-center">
              <label className="w-1/3">Nombres:</label>
              <input
                type="text"
                name="nombres"
                value={contactForm.nombres}
                onChange={(e) => setContactForm(prev => ({ ...prev, nombres: e.target.value }))}
                className="w-2/3 px-2 py-1 h-[34px] rounded text-gray-800 bg-white"
              />
            </div>

            <div className="mb-2 flex items-center">
              <label className="w-1/3"># Celular:</label>
              <input
                type="text"
                name="celular"
                value={contactForm.celular}
                onChange={(e) => setContactForm(prev => ({ ...prev, celular: e.target.value }))}
                className="w-2/3 px-2 py-1 h-[34px] rounded text-gray-800 bg-white"
              />
            </div>

            <div className="mb-2 flex items-center">
              <label className="w-1/3">Nuevo Email:</label>
              <input
                type="email"
                name="email"
                value={contactForm.email}
                readOnly
                className="w-2/3 px-2 py-1 h-[34px] rounded text-gray-800 bg-gray-300"
              />
            </div>

            <div className="mb-2 flex items-center">
              <label className="w-1/3">User name:</label>
              <input
                type="text"
                name="username"
                value={contactForm.username}
                readOnly
                className="w-2/3 px-2 py-1 h-[34px] rounded text-gray-800 bg-gray-300"
              />
            </div>

            {/* Campos de contraseña para ciertos tipos de usuarios */}
            {showContactForm && (
              <>
                <h3 className="text-lg font-semibold mb-3 pt-4 text-center text-white">
                  Ingrese Clave
                </h3>
                <div className="mb-2 flex items-center">
                  <label className="w-1/3">Clave:</label>
                  <input
                    type="password"
                    name="claveNumero"
                    value={form.claveNumero}
                    onChange={handleInputChange}
                    onBlur={validatePasswordFormat}
                    required
                    className="w-2/3 px-2 py-1 h-[34px] rounded text-gray-800 bg-white"
                  />
                </div>
                <div className="mb-2 flex items-center">
                  <label className="w-1/3">Repetir Clave:</label>
                  <input
                    type="password"
                    name="repetirClave"
                    value={form.repetirClave}
                    onChange={handleInputChange}
                    required
                    className="w-2/3 px-2 py-1 h-[34px] rounded text-gray-800 bg-white"
                  />
                </div>
                {passwordError && (
                  <p className="text-red-300 text-sm mb-2 text-center">{passwordError}</p>
                )}
              </>
            )}

            <div className="flex justify-center mt-4">
              <button
                type="button"
                onClick={handleRegister}
                disabled={loading}
                className="bg-[#4299e1] hover:bg-[#3182ce] text-white font-bold px-[18px] py-[8px] rounded disabled:bg-blue-300"
              >
                {loading ? 'Registrando...' : 'Registrar'}
              </button>
            </div>

            {error && (
              <div className="text-red-200 text-center mt-4 font-semibold">
                {error}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="back-link mt-4">
        <a href="/login" className="text-blue-700 underline">
          Volver al Inicio de Sesión
        </a>
      </div>
    </div>
  );
};

export default RegistrerUserExternal;