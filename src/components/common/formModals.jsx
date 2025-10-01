import React from 'react';
import { Briefcase, CheckCircle } from 'lucide-react';
import { useReportTask } from '../../contexts/ReportTaskContext'; // Importar del contexto real

// --- Componente Modal genérico ---
export const ModalWrapper = ({ children }) => {
    console.log('[ModalWrapper] Componente ModalWrapper renderizado con estilos de depuración.');
    return (
        <div className="fixed inset-0  bg-opacity-80  bg-gray-800 flex justify-center items-center z-[9999] p-4 border-8  animate-fadeIn">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl  w-[57%] transform transition-all duration-300 overflow-hidden">
                <div className="p-0">
                    {children}
                </div>
            </div>
        </div>
    );
};

// --- Componente de Metadatos Común (Cabecera estilo Excel) ---
const MetaDataGrid = ({ controlText, currentTime, headerTitle }) => {
    const currentDate = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'numeric', day: 'numeric' });
    const timeOnly = currentTime.split(' ')[0];

    return (
        <div className=" ">
            {/* Título Principal (Encabezado Azul Oscuro) */}
            <div className="bg-blue-900 text-white font-extrabold text-xl text-center py-2 mb-0 shadow-md">
                {headerTitle}
            </div>

            {/* Metadatos (2 Filas, 4 Columnas) */}
            <div className="grid grid-cols-4 text-sm pt-5  text-gray-700 px-5 bg-white">
                {/* Row 1 */}
                <p className="p-2  font-medium col-span-1 ">Control de pausa:</p>
                <p className="p-2   col-span-1">{controlText}</p>
                <p className="p-2  font-medium col-span-1 " readOnly >User name:</p>
                <p className="p-2  col-span-1">XAVIER</p>

                {/* Row 2 */}
                <p className="p-2  font-medium col-span-1 " readOnly >Fecha de pausa:</p>
                <p className="p-2  col-span-1">{currentDate}</p>
                <p className="p-2  font-medium col-span-1 " readOnly >Hora de pausa:</p>
                <p className="p-2 col-span-1" readOnly >{timeOnly}</p>
            </div>
        </div>
    );
};

// --- 1. Formulario JUSTIFICAR PAUSA ---
export const PausaForm = () => {
    const { currentTimeString, handleSubmit } = useReportTask();

    const onSubmit = (e) => {
        e.preventDefault();
        const data = {
            motivo: e.target['pausa-motivo'].value,
            duracion: e.target['pausa-duracion'].value,
            explicacion: e.target['pausa-explicacion'].value,
            hora: currentTimeString,
        };
        handleSubmit('pausa', data);
    };

    return (
        <form onSubmit={onSubmit} className="w-full">
            <MetaDataGrid controlText="JUSTIFICAR PAUSA" currentTime={currentTimeString} headerTitle="JUSTIFICAR PAUSA" />
            <div className="grid grid-cols-4 text-sm text-gray-700  px-5 ">
                {/* No, Duracion, Motivo, Justificar */}
                <p className="p-2  font-medium col-span-1 ">No</p>
                <p className="p-2  col-span-3" readOnly >1</p>
                <label htmlFor="pausa-duracion" className="p-2  font-medium col-span-1  flex items-center">Duracion de pausa:</label>
                <div className="p-1  col-span-3">
                    <input type="number" id="pausa-duracion" readOnly defaultValue="8" min="1" className="w-full h-full border-none focus:ring-0 rounded-none p-1" required />
                </div>
                <label htmlFor="pausa-motivo" className="p-2  font-medium col-span-1  flex items-center">Motivo:</label>
                <div className="p-1   col-span-3">
                    <select id="pausa-motivo" className="w-full h-full bg-gray-100 focus:ring-0 rounded-none bg-white p-1" required>
                        <option value="IR AL BAÑO">IR AL BAÑO</option>
                        <option value="ALMUERZO">ALMUERZO </option>
                        <option value="REUNION EQUIPO">REUNIÓN EQUIPO </option>
                        <option value="CITA CON">CITA CON:</option>
                        <option value="CON PERMISO">CON PERMISO</option>
                        <option value="SIN PERMISO">SIN PERMISO</option>
                    </select>
                </div>
                <label htmlFor="pausa-explicacion" className="p-2  font-medium col-span-1 ">Justificar (explicacion)</label>
                <div className="p-1  col-span-3">
                    <textarea id="pausa-explicacion" rows="2" className="w-full border border-gray-400 focus:ring-0 rounded-none p-1 min-h-[60px] resize-none" placeholder="IR AL BAÑO:"></textarea>
                </div>
            </div>
            <div className="p-4 flex justify-center gap-3 ">
               
                <button type="submit" className="bg-orange-400 hover:bg-orange-700 text-white font-bold py-1 px-2 rounded-lg transition duration-150 ease-in-out shadow-lg flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Justificar
                </button>
            </div>
        </form>
    );
};

// --- 2. Formulario REPORTAR TAREA ---
export const TareaForm = () => {
    const { currentTimeString, handleSubmit } = useReportTask();

    const onSubmit = (e) => {
        e.preventDefault();
        const data = {
            estado: e.target['tarea-estado'].value,
            explicacion: e.target['tarea-explicacion'].value,
            hora: currentTimeString,
        };
        handleSubmit('tarea', data);
    };

    return (
        <form onSubmit={onSubmit} className="w-full">
            <MetaDataGrid controlText="REPORTAR TAREA" currentTime={currentTimeString} headerTitle="REPORTAR TAREA" />
            <div className="grid grid-cols-4 text-sm text-gray-700  px-5
            
            ">
                {/* No, Registros, Lapso, Estado, Reportar */}
                <p className="p-2  font-medium col-span-1 ">No</p>
                <p className="p-2  col-span-1" readOnly >1</p>
                <p className="p-2  col-span-2 bg-white"></p>
                <p className="p-2  font-medium col-span-1 ">Registros en Sistema:</p>
                <p className="p-2  col-span-1" readOnly >17</p>
                <p className="p-2  font-medium col-span-1 ">Lapso de Tiempo:</p>
                <p className="p-2  col-span-1" readOnly>2 Horas</p>
                
                <label htmlFor="tarea-estado" className="p-2  font-medium col-span-1  flex items-center">Estado tarea:</label>
                <div className="p-1   col-span-3">
                    <select id="tarea-estado" className="w-full h-full border-none  bg-gray-100 focus:ring-0 rounded-none  p-1" required>
                        <option value="INICIANDO">INICIANDO</option>
                        <option value="CONTINUANDO">CONTINUANDO</option>
                        <option value="FINALIZANDO">FINALIZANDO</option>
                    </select>
                </div>
                <label htmlFor="tarea-explicacion" className="p-2 font-medium col-span-1 ">Reportar Tarea (explicacion)</label>
                <div className="p-1 col-span-3">
                    <textarea id="tarea-explicacion" rows="2" className="w-full border border-gray-400 focus:ring-0 rounded-none p-1 min-h-[60px] resize-none" placeholder="Escriba el detalle de la tarea..."></textarea>
                </div>
            </div>
            <div className="p-4 flex justify-center gap-3 ">
             
                <button type="submit" className="bg-orange-400 hover:bg-orange-700 text-white font-bold py-1 px-2 rounded-lg transition duration-150 ease-in-out shadow-lg flex items-center justify-center">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Reportar
                </button>
            </div>
        </form>
    );
};

// --- 3. Formulario REPORTAR PROYECTO - TAREA ---
export const ProyectoTareaForm = () => {
    const { currentTimeString, handleSubmit } = useReportTask();

    const onSubmit = (e) => {
        e.preventDefault();
        const data = {
            proyecto: e.target['proyecto-buscar'].value,
            etapa: e.target['proyecto-etapa'].value,
            area: e.target['proyecto-area'].value,
            estado: e.target['proyecto-estado'].value,
            explicacion: e.target['proyecto-explicacion'].value,
            hora: currentTimeString,
        };
        handleSubmit('proyecto', data);
    };

    return (
        <form onSubmit={onSubmit} className="w-full">
            <MetaDataGrid controlText="PROYECTO / TAREA" currentTime={currentTimeString} headerTitle="REPORTAR PROYECTO - TAREA" />
            <div className="grid grid-cols-4 text-sm text-gray-700 px-5
            
            ">
                {/* No, Registros, Lapso */}
                <p className="p-2 font-medium col-span-1 ">No</p>
                <p className="p-2  col-span-1" readOnly>1</p>
                <p className="p-2  col-span-2 bg-white"></p>
                <p className="p-2  font-medium col-span-1 ">Registros en Sistema:</p>
                <p className="p-2  col-span-1" readOnly>17</p>
                <p className="p-2  font-medium col-span-1 ">Lapso de Tiempo:</p>
                <p className="p-2  col-span-1" readOnly>4 Horas</p>

                {/* Buscar Proyecto */}
                <label htmlFor="proyecto-buscar" className="p-2  font-medium col-span-1  flex items-center">Buscar Proyecto:</label>
                <div className="p-1   col-span-3">
                    <select id="proyecto-buscar" defaultValue="URB LAS CUMBRES / LOS ESTEROS:" className="w-full h-full border-none focus:ring-0 rounded-none p-1" required>
                       <option value="URB LAS CUMBRES">URB LAS CUMBRES</option>
                       <option value="LOS ESTEROS DEL SOL">LOS ESTEROS DEL SOL</option>
                    <option value="SISTEMA CONFIANZA">SISTEMA CONFIANZA SCGC</option>
                    </select>
                </div>

                {/* Seleccionar Etapa & Trabajo */}
                <label htmlFor="proyecto-etapa" className="p-2  font-medium col-span-1  flex items-center">Seleccionar Etapa:</label>
                <div className="p-1  col-span-1">
                    <select id="proyecto-etapa" className="w-full h-full  bg-gray-100 border-none focus:ring-0 rounded-none bg-white p-1" required>
                        <option value="Etapa 1">INICIAL</option>
                        <option value="Etapa 2">INTERMEDIA</option>
                    </select>
                </div>
                <p className="p-2  font-medium col-span-1 ">Trabajo:</p>
                <p className="p-2  col-span-1">VILLA 17</p>

                {/* Seleccionar Área & Estado Tarea */}
                <label htmlFor="proyecto-area" className="p-2  font-medium col-span-1  flex items-center">Seleccionar Área:</label>
                <div className="p-1  col-span-1">
                    <input type="text" id="proyecto-area" defaultValue="Mz 230" className="w-full h-full border-none focus:ring-0 rounded-none p-1" required />
                </div>
                <label htmlFor="proyecto-estado" className="p-2  font-medium col-span-1  flex items-center">Estado tarea:</label>
                <div className="p-1  col-span-1">
                    {/* ESTADO TAREA CON OPCIONES: INICIO, AVANCE, FINAL, NO APLICA */}
                    <select id="proyecto-estado" className="w-full h-full border-none focus:ring-0 rounded-none bg-white p-1" required>
                        <option value="INICIO">INICIO</option>
                        <option value="AVANCE">AVANCE</option>
                        <option value="FINAL">FINAL</option>
                        <option value="NO APLICA">NO APLICA</option>
                    </select>
                </div>

                {/* Reportar Tarea (explicacion) */}
                <label htmlFor="proyecto-explicacion" className="p-2  font-medium col-span-1 ">Reportar Tarea (explicacion)</label>
                <div className="p-1  col-span-3">
                    <textarea id="proyecto-explicacion" rows="2" className="w-full border border-gray-400 focus:ring-0 rounded-none p-1 min-h-[80px] resize-none" placeholder="Escriba el detalle de la tarea y proyecto..."></textarea>
                </div>
            </div>
            <div className="p-4 flex justify-center gap-3">
             
                <button type="submit" className="bg-orange-400 hover:bg-orange-700 text-white font-bold py-1 px-2 rounded-lg transition duration-150 ease-in-out shadow-lg flex items-center justify-center">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Reportar
                </button>
            </div>
        </form>
    );
};


// --- Componente principal del Modal (Renderizado Único) ---
export const FormModal = () => {
    const { activeModal } = useReportTask();

    if (!activeModal) {
        return null;
    }

    let FormComponent = null;

    switch (activeModal) {
        case 'pausa':
            FormComponent = PausaForm;
            break;
        case 'tarea':
            FormComponent = TareaForm;
            break;
        case 'proyecto':
            FormComponent = ProyectoTareaForm;
            break;
        default:
            return null;
    }

    return (
        <ModalWrapper>
            <FormComponent />
        </ModalWrapper>
    );
};
