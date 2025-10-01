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
    const { currentUser } = useCurrentUser();

    const [elapsedTimeUnits, setElapsedTimeUnits] = useState(0);
    const [formsShown, setFormsShown] = useState({ pausa: false, tarea: false, proyecto: false });
    const [activeModal, setActiveModal] = useState(null); // 'pausa', 'tarea', 'proyecto'
    const [statusText, setStatusText] = useState('Trabajando...');
    const [responseData, setResponseData] = useState({}); // Nuevo estado para la respuesta del API

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

        if (!currentUser || !currentUser.iduser || !currentUser.usernameinterno) {
            console.error("Error: No se encontró información del usuario actual.");
            return;
        }

        const baseTaskData = {
            iduser: currentUser.iduser,
            usernameInterno: currentUser.usernameInterno,
            fechaPausa: new Date().toISOString(), // Formato ISO 8601
            horaInicioPausa: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }), // Formato HH:MM:SS
            // Campos por defecto o nulos para evitar errores si no se usan
            regPausa: 0,
            horaFinalPausa: "", // Si el backend necesita un valor específico, ajustar aquí
            controlDePausa: "",
            duracionDePausa: 0,
            numeroDePausa: 0,
            justificarPausa: "",
            lapsoDeRegistrosEnHoras: "", // Asumiendo que esto se calcula en el backend o se deja vacío inicialmente
            registrosContadosNuevos: 0,
            registrosContadosActualizados: 0,
            detalleDeRegistros: "",
            reportarProyecto: "", // Inicialmente vacío
            reportarEtapa: "",     // Inicialmente vacío
            reportarArea: "",      // Inicialmente vacío
            reportarTrabajo: "",   // Inicialmente vacío
            reportarTarea: "",     // Inicialmente vacío
            esInicioTarea: false,    // Por defecto false
            esAvanceTarea: false,    // Por defecto false
            esFinalTarea: false,     // Por defecto false
            fechaRegistro: new Date().toISOString(),
            userSystem: currentUser.usernameInterno, // Usar el username del usuario actual
            ambienteDeTrabajo: process.env.NODE_ENV === 'production' ? 'PRODUCCION' : 'DESARROLLO',
            periodoContable: new Date().getFullYear(),
        };

        let taskDataToSend = { ...baseTaskData };

        switch (formType) {
            case 'pausa':
                taskDataToSend = {
                    ...taskDataToSend,
                    process: 'putTasks',
                    controlDePausa: 'Pausa',
                    duracionDePausa: parseInt(formData.duracion || 0, 10),
                    justificarPausa: `${formData.motivo} / ${formData.explicacion}`,
                    horaInicioPausa: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
                };
                break;
            case 'tarea':
                taskDataToSend = {
                    ...taskDataToSend,
                    process: 'putTasks',
                    controlDePausa: 'Tarea',
                    reportarTarea: formData.explicacion, // El ejemplo indica que 'reportarTarea' es la explicación
                    detalleDeRegistros: formData.estado, // El ejemplo no especifica, pero 'estado' podría ir aquí
                    horaInicioPausa: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
                    esInicioTarea: formData.estado === 'INICIANDO', // Asumiendo que 'INICIANDO' es inicio
                    esAvanceTarea: formData.estado === 'CONTINUANDO', // Asumiendo que 'CONTINUANDO' es avance
                    esFinalTarea: formData.estado === 'FINALIZANDO', // Asumiendo que 'FINALIZANDO' es final
                };
                break;
            case 'proyecto':
                taskDataToSend = {
                    ...taskDataToSend,
                    process: 'putTasks',
                    controlDePausa: 'Proyecto',
                    reportarProyecto: formData.proyecto,
                    reportarEtapa: formData.etapa,
                    reportarArea: formData.area,
                    reportarTrabajo: formData.trabajo || "", 
                    reportarTarea: formData.explicacion, // El ejemplo indica que 'reportarTarea' es la explicación
                    detalleDeRegistros: formData.estado, // El ejemplo no especifica, pero 'estado' podría ir aquí
                    horaInicioPausa: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
                    esInicioTarea: formData.estado === 'INICIO', 
                    esAvanceTarea: formData.estado === 'AVANCE', 
                    esFinalTarea: formData.estado === 'FINAL', 
                };
                break;
            default:
                console.error("Tipo de formulario desconocido:", formType);
                return;
        }

        console.log("Final taskData enviado a putTask:", taskDataToSend);

        try {
            const response = await putTask(taskDataToSend); // Llama al servicio putTask con los datos completos
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
    };

    return (
        <ReportTaskContext.Provider value={contextValue}>
            {children}
        </ReportTaskContext.Provider>
    );
};

export default ReportTaskProvider;