import React, { useState } from 'react';
import { FormInput } from '../../components/forms/FormInput';
import registrerService from '../../services/registrer/RegistrerService';
import { MensajeHead } from '../../components/forms/MensajeHead';
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
  const [form, setForm] = useState({
    identificacion: '',
    email: '',
    nombre: '',
    apellidos: '',
    nombres: '',
    celular: '',
    nuevoEmail: '',
    claveNumero: '',
    repetirClave: '',
    userName: ''
  });
  const [isTyping, setIsTyping] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    // Generar username cuando se modifican nombres, apellidos o celular
    if (name === 'nombres' || name === 'apellidos' || name === 'celular') {
      const nombres = name === 'nombres' ? value : form.nombres;
      const apellidos = name === 'apellidos' ? value : form.apellidos;
      const celular = name === 'celular' ? value : form.celular;
      
      if (nombres && apellidos && celular) {
        const apellidosArray = apellidos.split(' ');
        const primerApellido = apellidosArray[0] || '';
        const segundoApellido = apellidosArray[1] || '';
        const primerNombre = nombres.split(' ')[0] || '';
        const ultimosDigitosCelular = celular.slice(-2);
        
        const username = (
          primerApellido.slice(0, 2) +
          segundoApellido.slice(0, 2) +
          primerNombre.slice(0, 2) +
          ultimosDigitosCelular
        ).toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]/g, "");

        setForm(prev => ({ ...prev, userName: username.toUpperCase() }));
      }
    }
  };

  const handleEmailBlur = async () => {
    if (relacionuser !== 1) return;
    if (!form.email || !form.identificacion) {
      setForm(prev => ({ ...prev, nombre: '' }));
      setResponse(null);
      return;
    }
    
    setLoading(true);
    try {
      const response = await registrerService.verifyEmail({
        email: form.email,
        identificacion: form.identificacion
      });

      if (response.status === 200) {
        // Extraer y asignar el nombre directamente de la respuesta
        const nombreCompleto = response?.nombreCompleto || response?.nombrecompleto || '';
        const emailRespuesta = response?.email || '';
        
        setForm(prevForm => ({
          ...prevForm,
          nombre: nombreCompleto,
          nuevoEmail: emailRespuesta === form.email ? emailRespuesta : form.email
        }));
        
        setError(response.messageResponse || 'Validación exitosa');
        setResponse({ 
          status: 200, 
          color: "#87fa87",
          message: response.messageResponse 
        });
      } else if (response.status === 404) {
        setError('No se ha encontrado coincidencia con la cedula ingresada del postulante. Deberá cambiar el tipo de relacion, y reintente.');
        setResponse({ 
          status: 404, 
          color: "#f16363",
          message: 'No se ha encontrado coincidencia con el email anterior del postulante.'
        });
        setForm(prev => ({
          ...prev,
          nuevoEmail: form.email, // En caso de 404, siempre será un nuevo email
          nombre: ''
        }));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al validar el email');
      setResponse({ 
        status: 500, 
        color: "#f16363",
        message: err.response?.data?.message || 'Error al validar el email'
      });
      setForm(prev => ({ ...prev, nombre: '' }));
    } finally {
      setLoading(false);
    }
  };

  const handlePostulanteChange = (value) => {
    setEsPostulante(value);
    if (value === true) {
      setRelacionuser(1);
      setShowContactForm(false);
      // Limpiar el formulario cuando cambia el tipo de postulante
      setForm(prev => ({
        ...prev,
        nombre: '',
        nuevoEmail: ''
      }));
    } else {
      setRelacionuser(null);
      setShowContactForm(false);
      // Limpiar el formulario cuando cambia el tipo de postulante
      setForm(prev => ({
        ...prev,
        nombre: '',
        nuevoEmail: ''
      }));
    }
  };

  const handleRelacionUserClick = (value) => {
    setRelacionuser(value);
  };

  const handleRegister = async () => {
    setError('');
    setLoading(true);
    try {
      const registerData = {
        esPostulante,
        nombreuser: form.nombres,
        apellidouser: form.apellidos,
        identificacion: form.identificacion,
        username: form.userName,
        passnumber: parseInt(form.claveNumero),
        emailusuario: form.nuevoEmail,
        celularusuario: form.celular,
        relacionuser
      };

      const response = await registrerService.register(registerData);
      
      if (response && response.statusCode === 200) {
        setShowSuccess(true);
      } else {
        setError(response?.message || 'Error al registrar el usuario');
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
    if (!form.email || !form.identificacion) {
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

  if (showContactForm && form.email && form.identificacion) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        {error && !isTyping && <MensajeHead mensaje={error} color={response?.color} />}
        <div className="bg-blue-600 p-8 rounded-lg w-full max-w-md text-white">
          <h2 className="text-2xl font-semibold mb-6 text-center">Ingrese Contacto</h2>
          
          <div className="mb-4 flex items-center">
            <label className="w-1/3">Apellidos:</label>
            <input
              type="text"
              name="apellidos"
              value={form.apellidos}
              onChange={(e) => {
                setError('');
                setIsTyping(true);
                handleInputChange(e);
              }}
              onBlur={() => setIsTyping(false)}
              className="w-2/3 p-2 rounded text-gray-800 bg-white"
            />
          </div>

          {relacionuser !== 1 && (
            <div className="mb-4 flex items-center">
              <label className="w-1/3">Nombres:</label>
              <input
                type="text"
                name="nombres"
                value={form.nombres}
                onChange={(e) => {
                  setError('');
                  setIsTyping(true);
                  handleInputChange(e);
                }}
                onBlur={() => setIsTyping(false)}
                className="w-2/3 p-2 rounded text-gray-800 bg-white"
              />
            </div>
          )}

          <div className="mb-4 flex items-center">
            <label className="w-1/3"># Celular:</label>
            <input
              type="text"
              name="celular"
              value={form.celular}
              onChange={(e) => {
                setError('');
                setIsTyping(true);
                handleInputChange(e);
              }}
              onBlur={() => setIsTyping(false)}
              className="w-2/3 p-2 rounded text-gray-800 bg-white"
            />
          </div>

          {form.email !== form.nuevoEmail && (
            <div className="mb-4 flex items-center">
              <label className="w-1/3">Nuevo Email:</label>
              <input
                type="email"
                name="nuevoEmail"
                value={form.nuevoEmail}
                onChange={(e) => {
                  setError('');
                  setIsTyping(true);
                  handleInputChange(e);
                }}
                onBlur={() => setIsTyping(false)}
                className="w-2/3 p-2 rounded text-gray-800 bg-white"
              />
            </div>
          )}

          <div className="mb-6 flex items-center">
            <label className="w-1/3">Actualizar:</label>
            <select
              className="w-2/3 p-2 rounded text-gray-800 bg-gray-200"
              name="actualizar"
              value={form.email !== response?.email || '' ? "1" : "0"}
              disabled
            >
              <option value="0">No</option>
              <option value="1">Si</option>
            </select>
          </div>

          <h2 className="text-2xl font-semibold mb-6 text-center">Ingrese Clave</h2>
          
          <div className="mb-4 flex items-center">
            <label className="w-1/3">Clave Numero:</label>
            <input
              type="password"
              name="claveNumero"
              value={form.claveNumero}
              onChange={handleInputChange}
              className="w-2/3 p-2 rounded text-gray-800 bg-white"
            />
          </div>

          <div className="mb-4 flex items-center">
            <label className="w-1/3">Repetir Clave:</label>
            <input
              type="password"
              name="repetirClave"
              value={form.repetirClave}
              onChange={handleInputChange}
              className="w-2/3 p-2 rounded text-gray-800 bg-white"
            />
          </div>

          <div className="mb-6 flex items-center">
            <label className="w-1/3">User name:</label>
            <input
              type="text"
              name="userName"
              value={form.userName}
              onChange={handleInputChange}
              className="w-2/3 p-2 rounded text-gray-800 bg-gray-200"
              disabled
            />
          </div>

          <div className="flex justify-between gap-4">
            <button
              type="button"
              onClick={() => setShowContactForm(false)}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-8 rounded"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={handleRegister}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-8 rounded disabled:bg-blue-300"
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
          color={response?.color || '#ff0000'} 
        />
      )}
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <h1 className="text-2xl font-bold text-blue-900 mb-2">SG CONFIANZA 2.5</h1>
        <h2 className="text-xl font-semibold mb-6 text-gray-700">Crear Nueva Cuenta</h2>
        <div className="bg-gray-200 p-6 rounded-lg mb-6 w-full max-w-md">
          <div className="mb-4">
            <label className="block font-semibold mb-2">
              1. ¿Tenía usted antes una cuenta para acceder como POSTULANTE?
            </label>
            <div className="flex gap-4">
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
          {esPostulante === false && (
            <div>
              <label className="block font-semibold mb-2">
                2. Selecciona con el botón la relación que solicita para acceder:
              </label>
              <div className="flex gap-4">
                {relaciones.map((rel) => (
                  <button
                    key={rel.value}
                    type="button"
                    className={`px-4 py-2 rounded border ${relacionuser === rel.value ? 'bg-blue-700 text-white' : 'bg-white text-gray-700 border-gray-300'}`}
                    onClick={() => handleRelacionUserClick(rel.value)}
                    disabled={rel.value === 1}
                  >
                    {rel.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
         
        <form className="bg-blue-900 p-6 rounded-lg w-full max-w-md text-[#f3f3f3]">
          <h3 className="text-lg font-bold mb-4">Usuario Interno</h3>
          <FormInput
            name="identificacion"
            placeholder="CC:"
            value={form.identificacion}
            onChange={handleInputChange}
          />
          <FormInput
            name="email"
            placeholder="Cta email:"
            value={form.email}
            onChange={handleInputChange}
            onBlur={handleEmailBlur}
          />
          {relacionuser === 1 && (
            <>
              <div className="mb-4">
                <label htmlFor="nombre" className="block text-sm font-medium text-white mb-1">
                  Nombre:
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={form.nombre || ''}
                  onChange={handleInputChange}
                  disabled
                  className="w-full px-3 py-2 bg-gray-100 border rounded-md text-gray-700"
                />
              </div>
              {response?.status === 200 && (
                <button
                  type="button"
                  onClick={handleVerifyClick}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mt-2"
                  disabled={loading || !form.email || !form.identificacion}
                >
                  {loading ? 'Verificando...' : 'Verificar'}
                </button>
              )}
            </>
          )}
          {(relacionuser === 2 || relacionuser === 3) && (
            <button
              type="button"
              onClick={handleVerifyClick}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mt-2"
              disabled={loading || !form.email || !form.identificacion}
            >
              {loading ? 'Verificando...' : 'Verificar'}
            </button>
          )}
        </form>
      </div>
    </>
  );
};

export default RegisterUserInternal; 