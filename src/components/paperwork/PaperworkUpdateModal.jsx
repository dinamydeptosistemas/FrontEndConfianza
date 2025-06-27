import React, { useState, useEffect } from 'react';
import ActionButtons from '../common/Buttons'; // Corrected import for default export
import axiosInstance from '../../config/axios';

import { 
  MdEmail, 
  MdPhone, 
  MdCheckCircle, 
  MdRefresh, 
  MdSecurity  // Para el ícono de seguridad
} from 'react-icons/md';

// --- COMPONENTES AUXILIARES ---
// Componente de Grupo de Actualización Reutilizable
const UpdateFieldGroup = ({
  label,
  icon,
  oldValue,
  newValue,
  newValueStatus = 'idle',  // Estado por defecto
  onNewValueChange,
  onVerify,
  placeholder,
  type = 'text',
  preventEmptyValue = false,
  readOnly = false
}) => {
  // Estados del campo
  const isPending = newValueStatus === 'pending';
  const isVerified = newValueStatus === 'verified';
  const isFailed = newValueStatus === 'failed';

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4">
      <div className="flex items-center gap-3">
        {icon}
        <h3 className="font-bold text-lg text-gray-800">{label}</h3>
      </div>

      {/* Valor actual */}
      <div>
        <label className="block text-sm font-medium text-gray-500">Valor Actual</label>
        <div className="mt-1 flex items-center gap-2 p-3 bg-gray-200 rounded-lg">
          <MdSecurity className="text-gray-500" size={18}/>
          <span className="text-gray-700 font-mono break-all">
            {oldValue || 'No encontrado'}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-500">Nuevo Valor</label>
        <div className="grid grid-cols-2 gap-4 mt-1">
          <div className="relative">
            <input
              type={type}
              placeholder={placeholder}
              value={newValue || ''}
              onChange={(e) => {
                // Si preventEmptyValue es true y el valor está vacío, no actualizar
                if (preventEmptyValue && e.target.value === '') {
                  return;
                }
                onNewValueChange(e.target.value);
              }}
              className={`
                w-full p-3 rounded-lg border
                ${isVerified ? 'border-green-500 bg-green-50' : ''}
                ${isFailed ? 'border-red-500 bg-red-50' : ''}
                ${!isVerified && !isFailed ? 'border-gray-300' : ''}
                focus:outline-none focus:ring-2 focus:ring-blue-500
              `}
              disabled={isVerified || isPending || readOnly}
            />
          </div>
          
          <div className="flex items-center gap-2">
            {!isVerified && (
              <button
                onClick={onVerify}
                disabled={!newValue || isPending}
                className={`
                  p-3 rounded-lg transition-colors duration-200
                  ${!newValue || isPending
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-100 hover:bg-blue-200 text-blue-600'
                  }
                `}
              >
                {isPending ? (
                  <span className="flex items-center">
                    <MdRefresh className="animate-spin mr-1" size={20} />
                  </span>
                ) : (
                  <span className="flex items-center">
                    <MdCheckCircle className="mr-1" size={20} />
                    Verificar
                  </span>
                )}
              </button>
            )}

            {isVerified && (
              <span className="text-sm text-green-600 font-medium bg-green-50 px-3 py-2 rounded-lg border border-green-200">Verificado</span>
            )}
            
            {isFailed && (
              <span className="text-sm text-red-600 font-medium bg-red-50 px-3 py-2 rounded-lg border border-red-200">Rechazado</span>
            )}
          </div>
        </div>
        {isFailed && (
          <p className="mt-2 text-sm text-red-600">Error al verificar. Por favor intente nuevamente.</p>
        )}
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
const PaperworkUpdateModal = ({ isOpen, onSave, paperwork, onClose }) => {
  // Estados para mapas de usuarios



  const [isLoadingEmails, setIsLoadingEmails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Estado para almacenar el ID de usuario
  const [idUsuario, setIdUsuario] = useState('');

  // Estados para email y teléfono
  const [emailData, setEmailData] = useState({
    oldValue: '',  // Valor del servicio de usuarios
    newValue: '',  // Valor del paperwork
    status: 'idle'
  });

  const [phoneData, setPhoneData] = useState({
    oldValue: '',  // Valor del servicio de usuarios
    newValue: '',  // Valor del paperwork
    status: 'idle'
  });
  
  // Estado para la novedad
  const [novedad, setNovedad] = useState('');

  // Efecto para inicializar los datos cuando cambia el paperwork
  useEffect(() => {
    if (!paperwork?.username) {
      console.log('No hay username en paperwork');
      return;
    }
    
    // Inicializar estados
    setIsLoading(false);
    setIsLoadingEmails(false);
    
    // Establecer el ID de usuario desde paperwork
    if (paperwork.id_usuario) {
      setIdUsuario(paperwork.id_usuario);
      console.log('ID de usuario establecido:', paperwork.id_usuario);
    } else {
      console.warn('No se encontró id_usuario en paperwork');
    }
    
  }, [paperwork]); // Se ejecuta cuando cambia el paperwork

  // Actualizar estados cuando cambian los mapas o el paperwork
  useEffect(() => {
    if (!paperwork?.username) return;

    const emailOldValue = paperwork.correoViejo || 'No encontrado';
    const emailNewValue = paperwork.emailNuevo || '';
    const phoneOldValue = paperwork.telefonoViejo || 'No encontrado';
    const phoneNewValue = paperwork.telefonoNuevo || '';
    const novedadValue = paperwork.novedad || '';

    // Verificar el estado del email según paperwork.verificadoEmail
    const emailStatus = paperwork.verificadoEmail === true ? 'verified' : 'idle';
    
    // Verificar el estado del teléfono según paperwork.verificadoCelular
    const phoneStatus = paperwork.verificadoCelular === true ? 'verified' : 'idle';

    // Actualizar email
    setEmailData({
      oldValue: emailOldValue,
      newValue: emailNewValue,
      status: emailStatus
    });

    // Actualizar teléfono
    setPhoneData({
      oldValue: phoneOldValue,
      newValue: phoneNewValue,
      status: phoneStatus
    });
    
    // Actualizar novedad
    setNovedad(novedadValue);

    console.log('Estado de verificación de email:', emailStatus, 'basado en verificadoEmail:', paperwork.verificadoEmail);
    console.log('Estado de verificación de teléfono:', phoneStatus, 'basado en verificadoCelular:', paperwork.verificadoCelular);

  }, [paperwork]); // Se ejecuta cuando cambian los mapas o el paperwork



  // --- Manejadores para Correo Electrónico ---
  const handleVerifyEmail = async () => {
    if (!emailData.newValue || !idUsuario) {
      console.error('Falta email nuevo o ID de usuario para verificar');
      return;
    }
    
    setEmailData(prev => ({ ...prev, status: 'pending' }));
    try {
      // Llamar al endpoint para enviar correo de verificación
      console.log('Enviando solicitud de verificación de email');
      await axiosInstance.post('/api/EmailVerification/send-verification', {
        userId: idUsuario, // Usando el estado idUsuario
        email: emailData.newValue
      });
      
      console.log('Correo de verificación enviado exitosamente');
      // No cambiamos el estado a 'verified' directamente, ya que depende de paperwork.verificadoEmail
      // El estado se actualizará cuando se recargue el paperwork con verificadoEmail = true
      setEmailData(prev => ({
        ...prev,
        status: 'idle' // Volvemos a idle después de enviar el correo
      }));
      
      // Mostrar mensaje informativo al usuario
      alert('Se ha enviado un correo de verificación. Por favor, verifique su bandeja de entrada.');
      
    } catch (error) {
      console.error('Error al enviar correo de verificación:', error);
      setEmailData(prev => ({ ...prev, status: 'failed' }));
    }
  };



  // --- Manejadores para Teléfono ---
  const handleVerifyPhone = async () => {
    if (!phoneData.newValue || !idUsuario) {
      console.error('Falta teléfono nuevo o ID de usuario para verificar');
      return;
    }
    
    setPhoneData(prev => ({ ...prev, status: 'pending' }));
    try {
      // Llamar al endpoint para verificación manual de teléfono
      console.log('Ejecutando verificación manual de teléfono');
      
      // Ejecutamos la verificación manual del teléfono
      await axiosInstance.post('/api/EmailVerification/execute-verification', {
        idUser: idUsuario, // Usar idUser como parámetro
        responsableAprobacion: localStorage.getItem('username') || 'XAVIER',
        novedad: "se valido el telefono",
        verify: "phone"
      });
      
      console.log('Verificación de teléfono ejecutada exitosamente');
      
      // Actualizar el estado del teléfono a verified después de la verificación exitosa
      setPhoneData(prev => ({
        ...prev,
        status: 'verified' // Cambiamos a verified ya que la verificación fue exitosa
      }));
      
      // Mostrar mensaje informativo al usuario
      alert('Teléfono verificado exitosamente.');
      
    } catch (error) {
      console.error('Error al verificar teléfono:', error);
      setPhoneData(prev => ({ ...prev, status: 'failed' }));
      alert('Error al verificar el teléfono. Por favor, intente nuevamente.');
    }
  };

  // --- Manejadores Generales ---
  const handleApproveAll = async () => {
    // Ejecutar la verificación incluso si no hay función onSave
    if (!onSave) {
      console.warn('No se proporcionó función onSave, pero se ejecutará la verificación');
      // No retornamos, continuamos con la verificación
    }

    setIsLoading(true);
    
    try {
      // Verificar si hay cambios, pero continuar de todos modos
      const hasEmailChange = emailData.oldValue !== emailData.newValue && emailData.newValue;
      const hasPhoneChange = phoneData.oldValue !== phoneData.newValue && phoneData.newValue;
      
      // Si no hay cambios, informamos pero continuamos con la aprobación
      if (!hasEmailChange && !hasPhoneChange) {
        console.log('No hay cambios para guardar, pero se ejecutará la aprobación de todos modos');
      }
      
      const dataToSave = { 
        username: paperwork.username,
        id_usuario: idUsuario, // Incluir el ID de usuario
        novedad: novedad
      };
      

      // Guardar cambios de email si hay
      if (hasEmailChange) {
        dataToSave.email = emailData.newValue;
      }

      // Guardar cambios de teléfono si hay
      if (hasPhoneChange) {
        dataToSave.telefono = phoneData.newValue;
      }

      // Siempre ejecutar las verificaciones, haya o no cambios efectivos
      try {
        // Ejecutar verificación de email siempre
        console.log('Ejecutando verificación de email');
        await axiosInstance.post('/api/EmailVerification/execute-verification', {
          idUser: idUsuario, // Usando el estado idUsuario
          responsableAprobacion: localStorage.getItem('username') || 'XAVIER',
          novedad: novedad, // Usar la novedad del formulario
          verify: "email" // Indicar que estamos verificando el email
        });
        console.log('Verificación de email ejecutada con éxito');
        
        // Ejecutar también la verificación de teléfono siempre
        console.log('Ejecutando verificación de teléfono');
        await axiosInstance.post('/api/EmailVerification/execute-verification', {
          idUser: idUsuario, // Usar idUser como parámetro
          responsableAprobacion: localStorage.getItem('username') || 'XAVIER',
          novedad: novedad, // Usar la novedad del formulario
          verify: "phone" // Indicar que estamos verificando el teléfono
        });
        console.log('Verificación de teléfono ejecutada con éxito');
      } catch (error) {
        console.error('Error al ejecutar verificación:', error);
        // Continuar con el guardado aunque la verificación falle
      }

      // Guardar cambios si existe la función onSave
      if (onSave) {
        await onSave(dataToSave);
        console.log('Cambios guardados:', dataToSave);
      } else {
        console.log('No se guardaron los cambios (no hay función onSave), pero se ejecutó la verificación');
      }

      if (dataToSave.email) {
        setEmailData(prev => ({ 
          ...prev, 
          oldValue: dataToSave.email, 
          status: 'idle',
        }));
      } else if (emailData.status === 'pending') { // Si estaba 'pending' pero no se guardó (no cambió)
        setEmailData(prev => ({ ...prev, status: 'idle' }));
      }

      if (dataToSave.telefono) {
        setPhoneData(prev => ({ 
          ...prev, 
          oldValue: dataToSave.telefono, 
          status: 'idle',
        }));
      } else if (phoneData.status === 'pending') { // Si estaba 'pending' pero no se guardó
        setPhoneData(prev => ({ ...prev, status: 'idle' }));
      }
      
      // Cerrar el modal si existe la función onClose
      if (onClose) {
        onClose();
      } else {
        console.log('No se cerró el modal (no hay función onClose)');
      }
    } catch (error) {
      console.error('Error al guardar cambios:', error);
      alert('Error al guardar los cambios. Por favor, intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  }; // Closes handleApproveAll function

  // Verificar estados para UI
  const isPending = emailData.status === 'pending' || phoneData.status === 'pending' || isLoadingEmails;
  const canSaveChanges = 
    (emailData.status === 'verified' && phoneData.status === 'verified') || novedad;
  const hasFailed = emailData.status === 'failed' || phoneData.status === 'failed';

  // Retorno temprano si el modal no está abierto
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 relative">
          {/* Botón de cerrar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            disabled={isPending || isLoading || isLoadingEmails}
            aria-label="Cerrar modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {(isLoading || isLoadingEmails) ? (
            <div className="flex items-center justify-center p-8">
              <MdRefresh className="animate-spin text-blue-500" size={32} />
              <span className="ml-2 text-gray-600">
                {isLoadingEmails ? 'Cargando correos...' : 'Cargando datos...'}
              </span>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Verificación de Acceso</h2>
                <p className="text-gray-600 mt-2">Verificación de tramites.</p>
              </div>

              {/* --- Sección de Username --- */}
              <div className="mb-4">
                <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
                  <label className="text-sm font-medium text-gray-500 whitespace-nowrap">Username:</label>
                  <MdSecurity className="text-gray-500 flex-shrink-0" size={18}/>
                  <input
                    type="text"
                    value={paperwork?.username || ''}
                    readOnly
                    className="bg-transparent text-gray-700 font-mono w-full outline-none truncate"
                  />
                </div>
                {/* Nombre completo del usuario debajo */}
                <div className="mt-2 flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
                  <label className="text-sm font-medium text-gray-500 whitespace-nowrap">Nombre:</label>
                  <span className="text-gray-700 font-mono w-full truncate">
                    {paperwork?.nombresUser || 'Usuario no encontrado'}
                  </span>
                </div>

                {/* RUC/CC del usuario */}
                <div className="mt-2 flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
                  <label className="text-sm font-medium text-gray-500 whitespace-nowrap">RUC/CC:</label>
                  <span className="text-gray-700 font-mono w-full truncate">
                    {(() => {
                     
                      const rucValue = paperwork?.cedula;
                      // console.log('Buscando RUC con clave:', key, 'Resultado:', rucValue); 
                      return rucValue || 'No encontrado';
                    })()}
                  </span>
                </div>
              </div>

              {/* --- Sección de Email --- */}
              <UpdateFieldGroup
                label="Correo Electrónico"
                icon={<MdEmail className="text-blue-600" size={24}/>}
                oldValue={emailData.oldValue}
                newValue={emailData.newValue}
                newValueStatus={emailData.status}
                onNewValueChange={(e) => setEmailData(prev => ({ ...prev, newValue: e.target.value, status: 'idle' }))}
                onVerify={handleVerifyEmail}
                
                placeholder="Nuevo correo"
                type="email"
              />

              {/* --- Sección de Número de Teléfono --- */}
              <UpdateFieldGroup
                label="Número de Teléfono"
                icon={<MdPhone className="text-green-600" size={24}/>}
                oldValue={phoneData.oldValue}
                newValue={phoneData.newValue} 
                newValueStatus={phoneData.status}
                preventEmptyValue={true}
                onNewValueChange={(e) => setPhoneData(prev => ({ ...prev, newValue: e.target.value, status: 'idle' }))}
                onVerify={handleVerifyPhone}
                placeholder="Nuevo teléfono"
                type="tel"
                readOnly={true}
              />

              {/* Campo de Novedad */}
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4">
                <div className="flex items-center gap-3">
                  <MdRefresh className="text-gray-600" size={20}/>
                  <h3 className="font-bold text-lg text-gray-800">Novedad</h3>
                </div>
                <div>
                  <textarea
                    className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ingrese la novedad..."
                    rows="3"
                    value={novedad}
                    onChange={(e) => setNovedad(e.target.value)}
                  />
                </div>
              </div>

              {/* --- Botones de Acción --- */}
              <ActionButtons 
                onClose={onClose} 
                handleSubmit={handleApproveAll} 
                disabled={!canSaveChanges || isPending || hasFailed}
                loading={isPending}
                loadingText="Guardando..."
                submitText="Aprobar"
                cancelText="Rechazar"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
  
};

export default PaperworkUpdateModal;