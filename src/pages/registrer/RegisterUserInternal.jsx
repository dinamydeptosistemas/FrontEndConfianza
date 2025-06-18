import React, { useState } from 'react';
import { FormInput } from '../../components/forms/FormInput';
import registrerService from '../../services/registrer/RegistrerService';
import MensajeHead from '../../components/forms/MensajeHead';
import RegisterSuccess from '../../components/RegisterSuccess';

const relaciones = [
  { label: 'Empleado', value: 1 },
  { label: 'Ayudante', value: 2 },
  { label: 'Profesional', value: 3 },
];

const RegisterUserInternal = () => {
  const [esPostulante, setEsPostulante] = useState(null);
  const [relacionuser, setRelacionuser] = useState(null);
  const [response, setResponse] = useState(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [telefonoViejo, setTelefonoViejo] = useState('');

  const [form, setForm] = useState({
    esPostulante: true,
    nombreuser: '',
    apellidouser: '',
    identificacion: '',
    username: '',
    passnumber: '',
    emailusuarioviejo: '',
    relacionuser: 1,
    emailusuarionuevo: '',
    telefononuevo: '',
    repetirClave: '',
  });
  const [isTyping, setIsTyping] = useState(false);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    

    setForm(prev => ({ ...prev, [name]: value }));
    setError('');
    setResponse(null);
  };

  const generateUsername = () => {
    const { nombreuser, apellidouser, telefononuevo } = form;
    console.log('Generando username con:', { nombreuser, apellidouser, telefononuevo });
    
    if (nombreuser && apellidouser && telefononuevo) {
      const apellidosArray = apellidouser.split(' ');
      const primerApellido = apellidosArray[0] || '';
      const segundoApellido = apellidosArray[1] || '';
      const primerNombre = nombreuser.split(' ')[0] || '';
      const ultimosDigitosCelular = telefononuevo.slice(-2);
      
      const username = (
        primerApellido.slice(0, 2) +
        segundoApellido.slice(0, 2) +
        primerNombre.slice(0, 2) +
        ultimosDigitosCelular
      ).toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "");

      setForm(prev => ({ ...prev, username: username.toUpperCase() }));
    }
  };

  const handlePhoneBlur = (e) => {
    setIsTyping(false);
    setForm(prev => ({
      ...prev,
      telefononuevo: e.target.value
    }));
    setTimeout(generateUsername, 0);
  };

  const handleEmailBlur = async () => {
    setIsTyping(false);
    
    // Validar formato básico del email
    if (!/^\S+@\S+\.\S+$/.test(form.emailusuarioviejo)) {
      setError('Formato de email inválido');
      setResponse({
        status: 400,
        color: '#f16363',
        message: 'Formato de email inválido'
      });
      return;
    }

    if (!form.emailusuarioviejo || !form.identificacion) {
      setError('Se requiere email e identificación');
      setResponse({
        status: 400,
        color: '#f16363',
        message: 'Se requiere email e identificación'
      });
      return;
    }
    
    setLoading(true);
    try {
      const apiResponse = await registrerService.verifyEmail({
        email: form.emailusuarioviejo,
        identificacion: form.identificacion,
        respCelular: form.respCelular
      });

      console.log('Respuesta de verifyEmail:', apiResponse);

      if (apiResponse.status === 200) {
        const nombreCompleto = apiResponse?.nombreCompleto || apiResponse?.nombrecompleto || '';
        const emailRespuesta = apiResponse?.email || form.emailusuarioviejo;
        const telefonoRespuesta = apiResponse?.respCelular || '';
        
        // Si el teléfono ingresado es diferente al de la respuesta
        if (form.telefononuevo !== telefonoRespuesta) {
          // Guardamos el teléfono de la respuesta como viejo
          setTelefonoViejo(telefonoRespuesta);
        } else {
          // Si son iguales, usamos el del form
          setTelefonoViejo(form.telefononuevo);
        }
        
        setForm(prevForm => ({
          ...prevForm,
          nombreuser: nombreCompleto,
          emailusuarioviejo: emailRespuesta
        }));
        
        setError('');
        setResponse({ 
          status: 200, 
          color: "#87fa87",
          message: 'Email validado correctamente'
        });
      } else {
        setError(apiResponse.messageResponse || 'Error al validar email');
        setResponse({
          status: apiResponse.status || 400,
          color: '#f16363',
          message: apiResponse.messageResponse || 'Error al validar email'
        });
      }
    } catch (err) {
      console.error('Error al validar email:', err);
      setError('Error al validar email');
      setResponse({
        status: 500,
        color: '#f16363',
        message: 'Error al validar email'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePostulanteChange = (value) => {
    setEsPostulante(value);
    setError('');
    setResponse(null);
    if (value === true) {
      setRelacionuser(1);
      setShowContactForm(false);
      // Limpiar el formulario cuando cambia el tipo de postulante
      setForm(prev => ({
        ...prev,
        nombreuser: '',
        emailusuarionuevo: '',
        emailusuarioviejo: '',
        identificacion: ''
      }));
    } else {
      setRelacionuser(null);
      setShowContactForm(false);
      // Limpiar todo el formulario cuando cambia el tipo de postulante a No
      setForm({
        esPostulante: true,
        nombreuser: '',
        apellidouser: '',
        identificacion: '',
        username: '',
        passnumber: '',
        emailusuarioviejo: '',
        relacionuser: 1,
        emailusuarionuevo: '',
        telefonoviejo: '',
        telefononuevo: '',
        repetirClave: ''
      });
      setError('');
      setResponse(null);
    }
  };

  const handleRelacionUserClick = (value) => {
    setRelacionuser(value);
    setError('');
    setResponse(null);
  };

  // Validar solo coincidencia de contraseñas
  const validatePasswordMatch = () => {
    if (!form.repetirClave) {
      setError('');
      setResponse(null);
      return true;
    }
    if (form.passnumber !== form.repetirClave) {
      setError('Las claves no coinciden');
      setResponse({
        status: 400,
        color: '#f16363',
        message: 'Las claves no coinciden'
      });
      return false;
    }
    setError('');
    setResponse(null);
    return true;
  };

  // Validar formato de la clave (4 dígitos y no empieza con cero)
  const validatePasswordFormat = (e) => {
    // Si se llama desde un evento, usar el valor del evento
    // Si no, usar el valor actual del form
    const password = e?.target?.value || form.passnumber;
    
    // Solo actualizar el form si viene de un evento
    if (e?.target) {
      setForm(prev => ({ ...prev, passnumber: password }));
    }

    if (!/^[0-9]{4}$/.test(password)) {
      setError('La clave debe tener exactamente 4 dígitos numéricos');
      setResponse({
        status: 400,
        color: '#f16363',
        message: 'La clave debe tener exactamente 4 dígitos numéricos'
      });
      return false;
    }
    if (/^0/.test(password)) {
      setError('La clave no debe empezar con cero');
      setResponse({
        status: 400,
        color: '#f16363',
        message: 'La clave no debe empezar con cero'
      });
      return false;
    }
    setError('');
    setResponse(null);
    return true;
  };

  const handleRegister = async () => {
    setError('');
    // Validar campos obligatorios
    const requiredFields = [
      { field: 'identificacion', label: 'Identificación' },
      { field: 'emailusuarioviejo', label: 'Email Anterior' },
      { field: 'emailusuarionuevo', label: 'Email Nuevo' },
      { field: 'apellidouser', label: 'Apellidos' },
      { field: 'nombreuser', label: 'Nombres' },
      { field: 'telefononuevo', label: 'Celular' },
      { field: 'passnumber', label: 'Clave' },
      { field: 'repetirClave', label: 'Repetir Clave' }
    ];
    for (const item of requiredFields) {
      if (!form[item.field]) {
        setError(`El campo ${item.label} es obligatorio`);
        setResponse({
          status: 400,
          color: '#f16363',
          message: `El campo ${item.label} es obligatorio`
        });
        return;
      }
    }
    // Validar contraseña antes de guardar
    if (!validatePasswordFormat() || !validatePasswordMatch()) {
      return;
    }
    // Validar celular (10 dígitos)
    if (!/^[0-9]{10}$/.test(form.telefononuevo)) {
      setError('El celular debe tener exactamente 10 dígitos');
      setResponse({
        status: 400,
        color: '#f16363',
        message: 'El celular debe tener exactamente 10 dígitos'
      });
      return;
    }
    // Validar email (debe contener @ y formato básico)
    if (!/^\S+@\S+\.\S+$/.test(form.emailusuarioviejo)) {
      setError('Correo inválido');
      setResponse({
        status: 400,
        color: '#f16363',
        message: 'Correo inválido'
      });
      return;
    }
    setLoading(true);
    try {
      // Preparar datos base
      const registerData = {
        esPostulante,
        nombreuser: form.nombreuser,
        apellidouser: form.apellidouser,
        identificacion: form.identificacion,
        username: form.username.toUpperCase(),
        passnumber: parseInt(form.passnumber),
        relacionuser,
        // Guardamos el email validado y el teléfono que vino del API
        emailusuarioviejo: form.emailusuarioviejo,
        telefonoviejo: telefonoViejo
      };

      // Solo para postulantes agregamos los datos nuevos para trámites
      if (relacionuser === 1) {
        registerData.emailusuarionuevo = form.emailusuarionuevo;
        registerData.telefononuevo = form.telefononuevo;
      }

      const apiResponse = await registrerService.register(registerData);
      
      if (apiResponse && apiResponse.statusCode === 200) {
        setShowSuccess(true);
      } else {
        setError(apiResponse?.message || 'Error al registrar el usuario');
        setResponse(null);
      }
    } catch (err) {
      setError('Error al registrar el usuario');
      setResponse(null);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyClick = () => {
    if (!relacionuser) {
      setError('Debe seleccionar una relación de usuario');
      setResponse({ 
        status: 400, 
        message: 'Debe seleccionar una relación de usuario'
      });
      return;
    }

    if (!form.identificacion) {
      setError('Debe ingresar la identificación');
      setResponse({ 
        status: 400, 
        message: 'Debe ingresar la identificación'
      });
      return;
    }

    if (!form.emailusuarioviejo) {
      setError('Debe ingresar el email');
      setResponse({ 
        status: 400, 
        color: '#f16363',
        message: 'Debe ingresar el email'
      });
      return;
    }

    if (relacionuser === 1) {
      if (response?.status === 200) {
        setShowContactForm(true);
      } else {
        handleEmailBlur();
      }
    } else {
      setShowContactForm(true);
    }
  };

  if (showSuccess) {
    return <RegisterSuccess />;
  }

  if (showContactForm && form.emailusuarioviejo && form.identificacion) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        {error && !isTyping && <MensajeHead mensaje={error} color={response?.color} />}
        <div className="bg-[#0b49ab] py-4 rounded-lg w-[405px]  px-6  max-w-md text-white">
          <h2 className="text-2xl font-semibold mb-3 text-center">Ingrese Contacto</h2>
          
          <div className="mb-2 flex items-center">
            <label className="w-1/3">Apellidos:</label>
            <input
              type="text"
              name="apellidouser"
              value={form.apellidouser}
              onChange={(e) => {
                setError('');
                setIsTyping(true);
                handleInputChange(e);
              }}
              onBlur={() => setIsTyping(false)}
              
              className="w-2/3  px-2 py-1 h-[34px]   p-2 rounded text-gray-800 bg-white"
            />
          </div>

          {relacionuser !== 0 && (
            <div className="mb-2 flex items-center">
              <label className="w-1/3">Nombres:</label>
              <input
                type="text"
                name="nombreuser"
                value={form.nombreuser}
                onChange={(e) => {
                  setError('');
                  setIsTyping(true);
                  handleInputChange(e);
                }}
                onBlur={() => setIsTyping(false)}
                className="w-2/3  px-2 py-1 h-[34px]   p-2 rounded text-gray-800 bg-white"
              />
            </div>
          )}

          <div className="mb-2 flex items-center">
            <label className="w-1/3"># Celular:</label>
            <input
              type="text"
              name="telefononuevo"
              value={form.telefononuevo}
              onChange={(e) => {
                setError('');
                setIsTyping(true);
                handleInputChange(e);
              }}
              onBlur={handlePhoneBlur}
               className="w-2/3  px-2 py-1 h-[34px]  p-2 rounded text-gray-800 bg-white"
            />
          </div>

          <div className="mb-2 flex items-center">
            <label className="w-1/3">Email:</label>
            <input
              type="email"
              name="emailusuarioviejo"
              value={form.emailusuarioviejo}
              onChange={handleInputChange}
              onBlur={handleEmailBlur}
              className="w-2/3 px-2 py-1 h-[34px] p-2 rounded text-gray-800 bg-white"
            />
          </div>

          <div className="mb-2 flex items-center">
            <label className="w-1/3">Email Nuevo:</label>
            <input
              type="email"
              name="emailusuarionuevo"
              value={form.emailusuarionuevo}
              onChange={handleInputChange}
              className="w-2/3 px-2 py-1 h-[34px] p-2 rounded text-gray-800 bg-white"
            />
          </div>

          {(relacionuser === 1 || relacionuser === 2 || relacionuser === 3) && (
            <>
              <h2 className="text-2xl font-semibold mb-3  pt-2 text-center">Ingrese Clave</h2>
              
              <div className="mb-2 flex items-center">
                <label className="w-1/3">Clave Numero:</label>
                <input
                  type="password"
                  name="passnumber"
                  value={form.passnumber}
                  onChange={handleInputChange}
                  onBlur={validatePasswordFormat}
                  className="w-2/3  px-2 py-1 h-[34px]  p-2 rounded text-gray-800 bg-white"
                />
              </div>

              <div className="mb-2 flex items-center">
                <label className="w-1/3">Repetir Clave:</label>
                <input
                  type="password"
                  name="repetirClave"
                  value={form.repetirClave}
                  onChange={handleInputChange}
                  onBlur={validatePasswordMatch}
                  className="w-2/3  px-2 py-1 h-[34px]   p-2 rounded text-gray-800 bg-white"
                />
              </div>

              <div className="mb-2 flex items-center">
                <label className="w-1/3">User name:</label>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleInputChange}
                  className="w-2/3  px-2 py-1 h-[34px]   p-2 rounded text-gray-800 bg-gray-300"
                  disabled
                />
              </div>
            </>
          )}

          <div className="flex justify-center gap-6 py-4">
            <button
              type="button"
              onClick={() => setShowContactForm(false)}
              className="bg-[#bbbbbb] hover:bg-[#5484A8] text-blue-900 font-bold  px-[18px] py-[8px] rounded"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={handleRegister}
              disabled={loading}
              className="bg-[#dde4e8] hover:bg-[#5484A8] text-blue-900 hover:text-[#0047ab] font-bold px-[18px] py-[8px] rounded disabled:bg-blue-300"
            >
              {loading ? 'Registrando...' : 'Registrar'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {error && (
        <MensajeHead 
          mensaje={error} 
          color={response?.color || '#f16363'} 
        />
      )}
      {response?.message && (
        <MensajeHead 
          mensaje={response.message} 
          color={response.color || '#f16363'} 
        />
      )}
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-[29px] font-bold text-[#0047AB] mb-2">SG CONFIANZA 2.5</h1>
        <h2 className="text-[24px] font-bold mb-6 text-[#777777]">Crear Nueva Cuenta</h2>
        <div className="bg-[#cacaca] p-6 rounded-lg mb-6 w-[405px]">
          <div className="mb-4">
            <label className="block text-[#333333] font-semibold mb-2">
              1. ¿Tenía usted antes una cuenta para acceder como POSTULANTE?
            </label>
            <div className="flex justify-end gap-4">
              <label>
                <input
                  type="radio"
                  name="esPostulante"
                  value="true"
                  checked={esPostulante === true}
                  onChange={() => handlePostulanteChange(true)}
                />{' '}
                Sí
              </label>
              <label>
                <input
                  type="radio"
                  name="esPostulante"
                  value="false"
                  checked={esPostulante === false}
                  onChange={() => handlePostulanteChange(false)}
                />{' '}
                No
              </label>
            </div>
          </div>
          {esPostulante === false && relacionuser !== 1 && (
            <div>
              <label className="block text-[#333333]font-semibold mb-2">
                2. Selecciona con el botón la relación que solicita para acceder:
              </label>
              <div className="flex gap-4">
                {relaciones.map((rel) => (
                  (rel.value !== 1 || esPostulante === true) && (
                    <button
                      key={rel.value}
                      type="button"
                      className={`px-3 py-1 rounded border ${relacionuser === rel.value ? 'bg-[#0b49ab] text-white border-[#0b49ab]' : 'bg-[#f2f5f4] text-gray-700 border-[#f2f5f4]'}`}
                      onClick={() => handleRelacionUserClick(rel.value)}
                      disabled={rel.value === 1}
                    >
                      {rel.label}
                    </button>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
         
        <form className="bg-[#0b49ab] px-6 py-4 rounded-lg w-[405px] text-[#f3f3f3] mt-0">
          <h3 className="text-[24px] font-bold mb-4 mt-0 text-center">Usuario Interno</h3>
          <div className="flex items-center mb-0.1">
            <label className="w-24 text-white">CC:</label>
            <div className="flex-1">
              <FormInput
                name="identificacion"
                placeholder="CC:"
                value={form.identificacion}
                onChange={handleInputChange}
                className="px-2 py-1 h-[36px]"
              />
            </div>
          </div>
          <div className="flex items-center mb-0.1">
            <label className="w-24 text-white">Cta email:</label>
            <div className="flex-1">
              <FormInput
                name="emailusuarioviejo"
                placeholder="Email anterior:"
                value={form.emailusuarioviejo}
                onChange={handleInputChange}
                onBlur={handleEmailBlur}
                className="px-2 py-1 h-[36px]"
              />
            </div>
          </div>
          {relacionuser === 1 && (
            <div className="flex items-center mb-0.1">
              <label htmlFor="nombre" className="w-24 text-white">
                Nombre:
              </label>
              <div className="flex-1">
                <input
                  type="text"
                  id="nombre"
                  name="nombreuser"
                  value={form.nombreuser || ''}
                  onChange={handleInputChange}
                  disabled
                  className="w-full h-[36px] px-2 py-1 bg-[#bbbbbb] border border-[#bbbbbb] rounded-md text-gray-700"
                />
              </div>
            </div>
          )}
        </form>
        
        {(relacionuser === 1 || relacionuser === 2 || relacionuser === 3) && (
          <button
            type="button"
            onClick={handleVerifyClick}
            className="bg-[#4da3f7] hover:bg-[#3393e6] text-white font-bold text-md py-2 px-6 rounded mx-auto block mt-4"
            disabled={loading}
          >
            {loading ? 'Verificando...' : 'Validar'}
          </button>
        )}
      </div>
    </>
  );
};

export default RegisterUserInternal; 