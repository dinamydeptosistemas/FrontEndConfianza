import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import PropTypes from 'prop-types';
/**
 * Modal para justificar inactividad de trabajo
 * Se muestra cuando el usuario no ha interactuado con la base de datos por más de 10 minutos
 */
const WorkJustificationModal = ({ 
    open, 
    onContinue, 
    onRRHHJustification, 
    onLogout,
    minutesSinceLastActivity = 0,
    lastActivity = null 
}) => {
    const [showRRHHInput, setShowRRHHInput] = useState(false);
    const [motivo, setMotivo] = useState('');
    const { directLogout } = useAuth();

    const handleRRHH = () => setShowRRHHInput(true);

    const handleGuardarMotivo = () => {
        if (motivo.trim()) {
            if (onRRHHJustification) {
                onRRHHJustification(motivo);
            }
            setShowRRHHInput(false);
            setMotivo('');
        }
    };

    const handleLogout = () => {
        setShowRRHHInput(false);
        setMotivo('');
        if (onLogout) {
            onLogout();
        } else {
            directLogout();
        }
    };

    const handleContinue = () => {
        setShowRRHHInput(false);
        setMotivo('');
        if (onContinue) {
            onContinue();
        }
    };

    const formatLastActivity = (activityTime) => {
        if (!activityTime) return 'No disponible';

        const date = new Date(activityTime);
        if (isNaN(date.getTime())) {
            return 'No disponible';
        }
        return date.toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md mx-4">
                <div className="text-center mb-6">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                        <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                        Inactividad Detectada
                    </h2>
                    <p className="text-sm text-gray-600 mb-4">
                        No se ha detectado actividad de trabajo en los últimos{' '}
                        <span className="font-semibold text-yellow-600">
                            {Math.round(minutesSinceLastActivity)} minutos
                        </span>
                    </p>
                    {lastActivity && (
                        <p className="text-xs text-gray-500">
                            Última actividad: {formatLastActivity(lastActivity)}
                        </p>
                    )}
                </div>

                {!showRRHHInput ? (
                    <div className="flex flex-col gap-3">
                        <button 
                            className="w-full px-4 py-3 bg-[#1e4e9c] text-white rounded-lg hover:bg-[#5aa2ff] font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
                            onClick={handleContinue}
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Continuar Trabajando
                        </button>
                        
                        <button 
                            className="w-full px-4 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
                            onClick={handleRRHH}
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Justificar a RRHH
                        </button>
                        
                        <button 
                            className="w-full px-4 py-3 bg-[#555557] text-white rounded-lg hover:bg-gray-700 font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
                            onClick={handleLogout}
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Cerrar Sesión
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <label 
                                htmlFor="motivo-inactividad"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Motivo de la inactividad para RRHH:
                            </label>
                            <textarea
                                id="motivo-inactividad"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-[#285398] focus:ring-1 focus:ring-[#285398] outline-none resize-none"
                                rows="3"
                                value={motivo}
                                onChange={e => setMotivo(e.target.value)}
                                placeholder="Describe el motivo de tu inactividad..."
                                maxLength={500}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {motivo.length}/500 caracteres
                            </p>
                        </div>
                        
                        <div className="flex gap-3">
                            <button 
                                className="flex-1 px-4 py-2 bg-[#1e4e9c] text-white rounded-lg hover:bg-[#5aa2ff] font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={handleGuardarMotivo}
                                disabled={!motivo.trim()}
                            >
                                Guardar y Continuar
                            </button>
                            <button 
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold transition-colors duration-200"
                                onClick={() => {
                                    setShowRRHHInput(false);
                                    setMotivo('');
                                }}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};



WorkJustificationModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onContinue: PropTypes.func,
    onRRHHJustification: PropTypes.func,
    onLogout: PropTypes.func,
    minutesSinceLastActivity: PropTypes.number,
    lastActivity: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.instanceOf(Date),
        PropTypes.number,
    ]),
};

export default WorkJustificationModal;
