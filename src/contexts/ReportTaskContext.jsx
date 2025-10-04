import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { Briefcase, AlertTriangle, RefreshCw, Clock , CheckCircle } from 'lucide-react';

import { putTask } from '../services/tasks/tasksService';
import { useCurrentUser } from './CurrentUserContext';

// =========================================================================
// 1. LÓGICA DE CONTEXTO Y TEMPORIZADOR (Originalmente ReportTaskContext.jsx)
// =========================================================================

// --- CONSTANTES DE CONFIGURACIÓN DEL TEMPORIZADOR ---
const TIME_UNIT_MULTIPLIER = 1000; // 1 segundo para DEMO
const TIME_PAUSA = 20; // 20 unidades
const TIME_TAREA = 30; // 30 unidades
const TIME_PROYECTO = 35; // 35 unidades

// Definición del Contexto
const ReportTaskContext = createContext();

/**
 * Hook personalizado para usar el contexto.
 */
const useReportTask = () => useContext(ReportTaskContext);

export { useReportTask }; // Exportar useReportTask como un named export

/**
 * Formatea el tiempo total en segundos a HH:MM:SS.
 */
const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (num) => String(num).padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

const addMinutesToTime = (timeString, minutesToAdd) => {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes + minutesToAdd, seconds, 0);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }); // Vuelve a HH:MM:SS
};

const statusMap = {
    'Trabajando...': { class: 'bg-blue-50 border-blue-500 text-blue-800', Icon: Clock },
    'Pausa Requerida. ¡Justifique!': { class: 'bg-yellow-50 border-yellow-500 text-yellow-800', Icon: AlertTriangle },
    'Reporte de Tarea Pendiente.': { class: 'bg-purple-50 border-purple-500 text-purple-800', Icon: Briefcase },
    'Reporte de Proyecto y Tarea Pendiente.': { class: 'bg-red-50 border-red-500 text-red-800', Icon: RefreshCw },
    'Completado': { class: 'bg-green-50 border-green-500 text-green-800', Icon: CheckCircle },
};

// --- Componente Proveedor del Contexto ---
const ReportTaskProvider = ({ children }) => {
    console.log('[ReportTaskProvider] Componente renderizado.');
    // Dummy call to useReportTask to satisfy linter, as the hook is for external consumption
    // This ensures the linter doesn't flag it as unused in its defining file.
  // Destructure nothing, just call it
    const { user: currentUser, loading: currentUserLoading, isInitialized: currentUserInitialized } = useCurrentUser();

    console.log('[ReportTaskContext] currentUser:', currentUser);
    console.log('[ReportTaskContext] currentUserLoading:', currentUserLoading);
    console.log('[ReportTaskContext] currentUserInitialized:', currentUserInitialized);

    const [elapsedTimeUnits, setElapsedTimeUnits] = useState(0);
    const [formsShown, setFormsShown] = useState({ pausa: false, tarea: false, proyecto: false });
    const [activeModal, setActiveModal] = useState(null); // 'pausa', 'tarea', 'proyecto'
    const [statusText, setStatusText] = useState('Trabajando...');
    const [responseData, setResponseData] = useState({}); // Nuevo estado para la respuesta del API
    const [pauseCounter, setPauseCounter] = useState(0); // Nuevo estado para el contador de pausas

    console.log('[ReportTaskContext] Render. activeModal:', activeModal, 'formsShown:', formsShown, 'elapsedTimeUnits:', elapsedTimeUnits);

    // Calcula el tiempo total y la hora actual
    const totalSeconds = elapsedTimeUnits * (TIME_UNIT_MULTIPLIER / 1000);
    const formattedElapsedTime = formatTime(totalSeconds);
    const currentTimeString = new Date().toLocaleTimeString('es-ES', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const handleModalClose = useCallback((type) => {
        setActiveModal(null);
        // Si se cerró la pausa, regresa a 'Trabajando'
        if (type === 'pausa') {
            setStatusText('Trabajando...');
        }
    }, []);
    
    // Función para manejar el envío del formulario desde el modal
    const handleSubmit = async (formType, formData) => {
        console.log(`[REGISTRO ${formType.toUpperCase()}]`, formData);
        console.log("Datos del formulario recibidos:", formData);

        if (currentUserLoading || !currentUserInitialized || !currentUser || !currentUser.iduser || !currentUser.usernameInterno) {
            console.error("Error: No se encontró información del usuario actual. O no está cargada o inicializada.");
            return;
        }

        const baseTaskData = {
            idUser: currentUser.iduser, // Corregido a idUser para coincidir con el backend
            usernameInterno: currentUser.usernameInterno,
            fechaPausa: new Date().toISOString(), // Formato ISO 8601
            horaInicioPausa: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }), // Formato HH:MM:SS
            // Campos por defecto o nulos para evitar errores si no se usan
            // regPausa: 1, // Ajustado a 1 como en el ejemplo del backend
            horaFinalPausa: "", // Ajustado a valor vacío según el JSON del usuario
            controlDePausa: "",
            duracionDePausa: 0, // Se sobrescribe en el caso 'pausa'
            numeroDePausa: pauseCounter, // Usar el contador de pausas
            justificarPausa: "", 
            lapsoDeRegistrosEnHoras: "2 Horas", // Ajustado a "2 Horas" según el JSON del usuario
            registrosContadosNuevos: 0, // Ajustado a 0 según el JSON del usuario
            registrosContadosActualizados: 0, // Ajustado a 0 según el JSON del usuario
            detalleDeRegistros: "", // Ajustado a valor vacío según el JSON del usuario
            reportarProyecto: "", // Ajustado a valor vacío según el JSON del usuario
            reportarEtapa: "",     
            reportarArea: "",      
            reportarTrabajo: "",   
            reportarTarea: "", // Ajustado a cadena vacía por defecto
            esInicioTarea: false,    // Ajustado a false por defecto
            esAvanceTarea: false,    // Ajustado a false por defecto
            esFinalTarea: false,     // Ajustado a false por defecto
            fechaRegistro: new Date().toISOString(),
            userSystem: currentUser.usernameInterno, // Usar el username del usuario actual
            ambienteDeTrabajo: 'PRODUCCION', // Ajustado a PRODUCCION para coincidir con el ejemplo del backend
            periodoContable: new Date().getFullYear(),
        };

        let taskDataToSend = { 
            ...baseTaskData, 
            Process: 'putTasks' // Asegura que 'Process' esté con 'P' mayúscula desde el inicio
        };

        switch (formType) {
            case 'pausa':
                taskDataToSend = {
                    ...taskDataToSend,
                    fechaPausa: new Date().toISOString(),
                    numeroDePausa: pauseCounter + 1,
                    controlDePausa: 'JUSTIFICAR PAUSA', 
                    duracionDePausa: parseInt(formData.duracion || 0, 10),
                    justificarPausa: `${formData.motivo} / ${formData.explicacion || ''}`.trim(),
                    fechaRegistro: new Date().toISOString(),
                    userSystem: currentUser.usernameInterno,
                    ambienteDeTrabajo: 'PRODUCCION',
                    periodoContable: new Date().getFullYear(),
                    horaInicioPausa: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
                    horaFinalPausa: addMinutesToTime(new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }), parseInt(formData.duracion || 0, 10)),
                    esInicioTarea: true,    // Ajustado a true según el JSON de referencia
                    esAvanceTarea: true,    // Ajustado a true según el JSON de referencia
                    esFinalTarea: true,     // Ajustado a true según el JSON de referencia
                };
                console.log("[DEBUG] Task Data (Pausa):", taskDataToSend);
                break;
            case 'tarea':
                taskDataToSend = {
                    ...taskDataToSend,
                    controlDePausa: 'REPORTAR TAREA', // Ajustado a 'REPORTAR TAREA' según el JSON del usuario
                    reportarTarea: formData.explicacion, 
                    detalleDeRegistros: formData.estado, 
                    horaInicioPausa: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
                    esInicioTarea: formData.estado === 'INICIANDO', 
                    esAvanceTarea: formData.estado === 'CONTINUANDO', 
                    esFinalTarea: formData.estado === 'FINALIZANDO', 
                    fechaRegistro: new Date().toISOString(),
                    userSystem: currentUser.usernameInterno,

                    ambienteDeTrabajo: 'PRODUCCION',
                    periodoContable: new Date().getFullYear(),
                    horaFinalPausa: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
                    justificarPausa: "", // Sobrescribir a cadena vacía
                    numeroDePausa: 0, // Sobrescribir a 0
                    lapsoDeRegistrosEnHoras: "", // Sobrescribir a cadena vacía
                    registrosContadosNuevos: 0, // Sobrescribir a 0
                    registrosContadosActualizados: 0, // Sobrescribir a 0
                };
                console.log("[DEBUG] Task Data (Tarea):", taskDataToSend);
                break;
            case 'proyecto':
                taskDataToSend = {
                    ...taskDataToSend,
                    controlDePausa: 'PROYECTO / TAREA',
                    reportarProyecto: formData.proyecto,
                    reportarEtapa: formData.etapa,
                    reportarArea: formData.area,
                    reportarTrabajo: formData.trabajo || "", 
                    reportarTarea: formData.explicacion, 
                    detalleDeRegistros: formData.estado, 
                    horaInicioPausa: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
                    esInicioTarea: formData.estado === 'INICIO', 
                    esAvanceTarea: formData.estado === 'AVANCE', 
                    esFinalTarea: formData.estado === 'FINAL', 
                    horaFinalPausa: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
                    justificarPausa: "", // Sobrescribir a cadena vacía
                    numeroDePausa: 0, // Sobrescribir a 0
                    lapsoDeRegistrosEnHoras: "", // Sobrescribir a cadena vacía
                    registrosContadosNuevos: 0, // Sobrescribir a 0
                    registrosContadosActualizados: 0, // Sobrescribir a 0
                };
                console.log("[DEBUG] Task Data (Proyecto):", taskDataToSend);
                break;
            default:
                console.error("Tipo de formulario desconocido:", formType);
                return;
        }

        console.log("Final taskData enviado a putTask:", taskDataToSend);

        try {
            const response = await putTask(taskDataToSend); // Envía taskDataToSend directamente, sin el objeto 'request'
            setResponseData(response); // Guarda la respuesta en el estado
            console.log("Respuesta del API:", response);
        } catch (error) {
            console.error("Error al enviar tarea:", error);
        }
        handleModalClose(formType);
    };

    // Lógica del Temporizador y Activación
    useEffect(() => {
        console.log('[ReportTaskContext] useEffect triggered. Active modal:', activeModal);
        // Solo ejecuta el temporizador si NO hay un modal activo
        if (activeModal) {
            console.log('[ReportTaskContext] Modal activo, pausando temporizador.');
            return;
        }

        console.log('[ReportTaskContext] Iniciando temporizador...');
        const intervalId = setInterval(() => {
            setElapsedTimeUnits(prev => {
                const newTime = prev + 1;
                
                const remainingPausa = TIME_PAUSA - newTime;
                const remainingTarea = TIME_TAREA - newTime;
                const remainingProyecto = TIME_PROYECTO - newTime;

                console.log(`[ReportTaskContext] Timer tick! Elapsed: ${newTime}s. Pausa in: ${remainingPausa > 0 ? remainingPausa : 0}s, Tarea in: ${remainingTarea > 0 ? remainingTarea : 0}s, Proyecto in: ${remainingProyecto > 0 ? remainingProyecto : 0}s.`);

                // 1. Mostrar Pausa (20 unidades)
                if (newTime === TIME_PAUSA && !formsShown.pausa) {
                    console.log('[ReportTaskContext] Activando modal PAUSA.');
                    setActiveModal('pausa');
                    setFormsShown(prev => ({ ...prev, pausa: true }));
                    setStatusText('Pausa Requerida. ¡Justifique!');
                }

                // 2. Mostrar Reportar Tarea (30 unidades)
                else if (newTime === TIME_TAREA && !formsShown.tarea) {
                    console.log('[ReportTaskContext] Activando modal TAREA.');
                    setActiveModal('tarea');
                    setFormsShown(prev => ({ ...prev, tarea: true }));
                    setStatusText('Reporte de Tarea Pendiente.');
                }
                
                if (newTime === TIME_PAUSA && !formsShown.pausa) {
                    setPauseCounter(prev => prev + 1);
                }

                // 3. Mostrar Reportar Proyecto - Tarea (35 unidades)
                else if (newTime === TIME_PROYECTO && !formsShown.proyecto) {
                    console.log('[ReportTaskContext] Activando modal PROYECTO.');
                    setActiveModal('proyecto');
                    setFormsShown(prev => ({ ...prev, proyecto: true }));
                    setStatusText('Reporte de Proyecto y Tarea Pendiente.');
                }

                return newTime;
            });
        }, TIME_UNIT_MULTIPLIER);

        return () => clearInterval(intervalId);
    }, [formsShown.pausa, formsShown.tarea, formsShown.proyecto, activeModal]);

    // Objeto de valor del contexto
    const contextValue = {
        elapsedTimeUnits,
        formattedElapsedTime,
        currentTimeString,
        statusText,
        statusInfo: statusMap[statusText],
        timePoints: { TIME_PAUSA, TIME_TAREA, TIME_PROYECTO, TIME_UNIT_MULTIPLIER },
        activeModal,
        handleModalClose,
        handleSubmit,
        responseData, // Añadir la respuesta al contexto
        currentUserLoading,
        currentUserInitialized,
    };

    return (
        <ReportTaskContext.Provider value={contextValue}>
            {children}
        </ReportTaskContext.Provider>
    );
};

export default ReportTaskProvider;