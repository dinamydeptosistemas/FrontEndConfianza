import React, { useState, useEffect } from 'react';
import ActionButtons from '../common/Buttons'; // Corrected import for default export

import { 
  MdEmail, 
  MdPhone, 
  MdCheckCircle, 
  MdCancel, 
  MdRefresh, 
  MdSecurity  // Para el ícono de seguridad
} from 'react-icons/md';
import { getUsers } from '../../services/user/UserService';

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
  onReject,
  placeholder,
  type = 'text'
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
        <div className="flex items-center gap-3 mt-1">
          <div className="relative flex-grow">
            <input
              type={type}
              placeholder={placeholder}
              value={newValue || ''}
              onChange={(e) => onNewValueChange(e.target.value)}
              className={`
                w-full p-3 rounded-lg border
                ${isVerified ? 'border-green-500 bg-green-50' : ''}
                ${isFailed ? 'border-red-500 bg-red-50' : ''}
                ${!isVerified && !isFailed ? 'border-gray-300' : ''}
                focus:outline-none focus:ring-2 focus:ring-blue-500
              `}
              disabled={isVerified || isPending}
            />
            {isFailed && (
              <p className="mt-2 text-sm text-red-600">Error al verificar. Por favor intente nuevamente.</p>
            )}
          </div>
          
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
                <MdRefresh className="animate-spin" size={20} />
              ) : (
                <MdCheckCircle size={20} />
              )}
            </button>
          )}

          {isVerified && (
            <button
              onClick={onReject}
              className="p-3 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition-colors duration-200"
            >
              <MdCancel size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
const PaperworkUpdateModal = ({ isOpen, onSave, paperwork, onClose }) => {
  // Estados para mapas de usuarios
  const [userEmailMap, setUserEmailMap] = useState({});
  const [userPhoneMap, setUserPhoneMap] = useState({});
  const [userNameMap, setUserNameMap] = useState({});
  const [userRucMap, setUserRucMap] = useState({});
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  // Cargar datos de usuarios (emails y teléfonos)
  useEffect(() => {
    const loadUserData = async () => {
      console.log('Iniciando loadUserData con paperwork:', paperwork);
      if (!paperwork?.username) {
        console.log('No hay username en paperwork');
        return;
      }
      setIsLoading(true);
      setIsLoadingEmails(true);
      try {
        const emails = {};
        const phones = {};
        const names = {};
        const rucs = {}; // Añadir para RUC/CC
        let page = 1;
        let hasMore = true;

        while (hasMore) {
          const response = await getUsers({ page });
          console.log('Respuesta de usuarios:', response);
          
          if (!response?.users || response.users.length === 0) {
            hasMore = false;
            continue;
          }

          // Procesar cada usuario
          response.users.forEach(user => {
            if (user.username) {
              const upperUsername = user.username.toUpperCase();
              // Guardar email
              if (user.emailUsuario) {
                emails[upperUsername] = user.emailUsuario;
              }
              // Guardar teléfono
              if (user.telefonoviejo) {
                phones[upperUsername] = user.telefonoviejo;
              }
              // Guardar nombre completo
              const nombre = user.nombreUser || '';
              const apellido = user.apellidosUser || '';
              if (nombre || apellido) {
                names[upperUsername] = paperwork.nombresUser;
              }

              const ruc_o_cc = user.identificacion || '';
              if (ruc_o_cc) {
                rucs[upperUsername] = ruc_o_cc;
              }
            }
          });

          page++;
          hasMore = response.totalPages > page;
        }

        // Actualizar mapas
        setUserEmailMap(emails);
        setUserPhoneMap(phones);
        setUserNameMap(names);
        setUserRucMap(rucs); // Actualizar estado para RUC/CC
        console.log('Mapas de usuario actualizados:', { emails, phones, names, rucs });

      } catch (error) {
        console.error('Error en loadUserData:', error);
        // Considerar mostrar un mensaje de error al usuario aquí
      } finally {
        setIsLoading(false);
        setIsLoadingEmails(false);
        console.log('loadUserData finalizado, isLoading y isLoadingEmails seteados a false');
      }
    };

    loadUserData();
  }, [paperwork]); // Se ejecuta cuando cambia el paperwork

  // Actualizar estados cuando cambian los mapas o el paperwork
  useEffect(() => {
    if (!paperwork?.username) return;

    const upperUsername = paperwork.username.toUpperCase();
    const currentEmail = userEmailMap[upperUsername];
    const currentPhone = userPhoneMap[upperUsername];

    // Actualizar email
    setEmailData(prev => ({
      ...prev,
      oldValue: currentEmail || 'No encontrado',
      newValue: paperwork.email || currentEmail || ''
    }));

    // Actualizar teléfono
    setPhoneData(prev => ({
      ...prev,
      oldValue: currentPhone || 'No encontrado',
      newValue: paperwork.celular || currentPhone || ''
    }));
  }, [paperwork, userEmailMap, userPhoneMap]); // Se ejecuta cuando cambian los mapas o el paperwork

  // Simulación de una llamada a API
  const simulateApiCall = () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.1) { // 90% de éxito
          resolve({ success: true });
        } else {
          reject({ success: false });
        }
      }, 1500);
    });
  };

  // --- Manejadores para Correo Electrónico ---
  const handleVerifyEmail = async () => {
    setEmailData(prev => ({ ...prev, status: 'pending' }));
    try {
      await simulateApiCall();
      setEmailData(prev => ({
        ...prev,
        oldValue: prev.newValue,
        status: 'verified'
      }));
    } catch (error) {
      setEmailData(prev => ({ ...prev, status: 'failed' }));
    }
  };

  const handleRejectEmail = () => {
    setEmailData(prev => ({
      ...prev,
      newValue: paperwork?.email || '',
      status: 'idle'
    }));
  };

  // --- Manejadores para Teléfono ---
  const handleVerifyPhone = async () => {
    setPhoneData(prev => ({ ...prev, status: 'pending' }));
    try {
      await simulateApiCall();
      setPhoneData(prev => ({
        ...prev,
        oldValue: prev.newValue,
        status: 'verified'
      }));
    } catch (error) {
      setPhoneData(prev => ({ ...prev, status: 'failed' }));
    }
  };

  const handleRejectPhone = () => {
    setPhoneData(prev => ({
      ...prev,
      newValue: paperwork?.telefonoCelular || '',
      status: 'idle'
    }));
  };

  // --- Manejadores Generales ---
  const handleApproveAll = async () => {
    if (!onSave) {
      console.warn('No se proporcionó función onSave');
      return;
    }

    const hasVerifiedChangesToSave = emailData.status === 'verified' || phoneData.status === 'verified';
    if (!hasVerifiedChangesToSave) {
      console.log('No hay cambios verificados para guardar.');
      // onClose(); // Opcional: cerrar si no hay nada que guardar y se hizo clic.
      return;
    }

    // Guardar el estado original para revertir en caso de error y para comparar cambios
    const originalEmailData = { ...emailData };
    const originalPhoneData = { ...phoneData };

    // Actualizar UI a 'pending' para los campos que se van a guardar
    if (emailData.status === 'verified') {
      setEmailData(prev => ({ ...prev, status: 'pending' }));
    }
    if (phoneData.status === 'verified') {
      setPhoneData(prev => ({ ...prev, status: 'pending' }));
    }
    
    try {
      const dataToSave = { username: paperwork.username };
      let actualChangesMade = false;

      if (emailData.status === 'pending' && emailData.newValue !== originalEmailData.oldValue) {
        dataToSave.email = emailData.newValue;
        actualChangesMade = true;
      }
      if (phoneData.status === 'pending' && phoneData.newValue !== originalPhoneData.oldValue) {
        dataToSave.telefonocelular = phoneData.newValue;
        actualChangesMade = true;
      }

      if (actualChangesMade) {
        await onSave(dataToSave);
        console.log('Cambios guardados:', dataToSave);

        if (dataToSave.email) {
          setEmailData(prev => ({ 
            ...prev, 
            oldValue: dataToSave.email, 
            status: 'idle',
          }));
        } else if (emailData.status === 'pending') { // Si estaba 'pending' pero no se guardó (no cambió)
           setEmailData(prev => ({ ...prev, status: 'idle' }));
        }

        if (dataToSave.telefonocelular) {
          setPhoneData(prev => ({ 
            ...prev, 
            oldValue: dataToSave.telefonocelular, 
            status: 'idle',
          }));
        } else if (phoneData.status === 'pending') { // Si estaba 'pending' pero no se guardó
          setPhoneData(prev => ({ ...prev, status: 'idle' }));
        }
      } else {
        console.log('No hubo cambios efectivos para enviar al backend (valores verificados son iguales a los originales).');
        // Resetear status a idle si no se envió nada pero se intentó
        if (emailData.status === 'pending') setEmailData(prev => ({ ...prev, status: 'idle' }));
        if (phoneData.status === 'pending') setPhoneData(prev => ({ ...prev, status: 'idle' }));
      }
      
      onClose();
    } catch (error) {
      console.error('Error al guardar:', error);
      // Revertir a los estados antes de 'pending'
      setEmailData(originalEmailData);
      setPhoneData(originalPhoneData);
    } // Closes catch block
  }; // Closes handleApproveAll function

  // Verificar estados para UI
  const isPending = emailData.status === 'pending' || phoneData.status === 'pending' || isLoadingEmails;
  const canSaveChanges = 
    (emailData.status === 'verified' && emailData.newValue !== emailData.oldValue) || 
    (phoneData.status === 'verified' && phoneData.newValue !== phoneData.oldValue);
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
                      const key = paperwork?.username?.toUpperCase();
                      const rucValue = userRucMap[key];
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
                onReject={handleRejectEmail}
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
                onNewValueChange={(e) => setPhoneData(prev => ({ ...prev, newValue: e.target.value, status: 'idle' }))}
                onVerify={handleVerifyPhone}
                onReject={handleRejectPhone}
                placeholder="Nuevo teléfono"
                type="tel"
              />

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