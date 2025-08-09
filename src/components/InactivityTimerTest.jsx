import React, { useState } from 'react';
import useInactivityTimer from '../hooks/useInactivityTimer';

/**
 * Componente de prueba para el cronómetro de inactividad
 * Permite probar la funcionalidad con intervalos más cortos
 */
const InactivityTimerTest = () => {
    const [testMode, setTestMode] = useState(false);
    const [logs, setLogs] = useState([]);
    const [modalTriggered, setModalTriggered] = useState(false);

    const addLog = (message) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev.slice(-9), `[${timestamp}] ${message}`]);
    };

    const handleInactivityDetected = (data) => {
        addLog(`¡INACTIVIDAD DETECTADA! ${data.minutesInactive} minutos`);
        setModalTriggered(true);
        console.log('Datos de inactividad:', data);
    };

    const {
        timeRemaining,
        isInactive,
        lastActivity,
        resetTimer,
        startTimer,
        stopTimer,
        forceInactivity,
        minutesRemaining,
        secondsRemaining,
        percentageRemaining,
        getStatus
    } = useInactivityTimer({
        inactivityThreshold: testMode ? 30 * 1000 : 10 * 60 * 1000, // 30 segundos en modo test, 10 min normal
        checkInterval: 1000,
        onInactivityDetected: handleInactivityDetected,
        enabled: true,
        debug: true
    });

    const handleReset = () => {
        resetTimer();
        setModalTriggered(false);
        addLog('Cronómetro reiniciado manualmente');
    };

    const handleForceInactivity = () => {
        forceInactivity();
        addLog('Inactividad forzada para testing');
    };

    const handleToggleTestMode = () => {
        setTestMode(!testMode);
        setModalTriggered(false);
        addLog(`Modo test ${!testMode ? 'activado (30s)' : 'desactivado (10min)'}`);
    };

    const getStatusInfo = () => {
        const status = getStatus();
        addLog(`Estado: ${JSON.stringify(status, null, 2)}`);
        console.log('Estado completo:', status);
    };

    return (
        <div className="fixed top-4 left-4 bg-white border-2 border-gray-300 rounded-lg shadow-lg p-4 z-50 max-w-sm">
            <div className="mb-4">
                <h3 className="font-bold text-lg mb-2">Cronómetro de Inactividad</h3>
                <div className="text-sm space-y-1">
                    <div>
                        <span className="font-semibold">Modo:</span> 
                        {testMode ? ' Test (30s)' : ' Normal (10min)'}
                    </div>
                    <div>
                        <span className="font-semibold">Tiempo restante:</span> 
                        {testMode 
                            ? ` ${secondsRemaining}s`
                            : ` ${minutesRemaining}:${secondsRemaining.toString().padStart(2, '0')}`
                        }
                    </div>
                    <div>
                        <span className="font-semibold">Estado:</span> 
                        <span className={isInactive ? 'text-red-600' : 'text-green-600'}>
                            {isInactive ? ' Inactivo' : ' Activo'}
                        </span>
                    </div>
                    <div>
                        <span className="font-semibold">Progreso:</span> {Math.round(percentageRemaining)}%
                    </div>
                    <div>
                        <span className="font-semibold">Última actividad:</span>
                        <br />
                        <span className="text-xs">{lastActivity?.toLocaleTimeString()}</span>
                    </div>
                </div>
            </div>

            {/* Barra de progreso */}
            <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                        className={`h-3 rounded-full transition-all duration-1000 ${
                            percentageRemaining > 50 ? 'bg-green-500' :
                            percentageRemaining > 25 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${percentageRemaining}%` }}
                    ></div>
                </div>
            </div>

            {/* Modal simulado */}
            {modalTriggered && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded">
                    <div className="text-red-800 font-semibold">¡Modal Activado!</div>
                    <div className="text-red-600 text-sm">
                        Se detectó inactividad de {testMode ? '30 segundos' : '10 minutos'}
                    </div>
                </div>
            )}

            {/* Controles */}
            <div className="space-y-2 mb-4">
                <div className="flex gap-2">
                    <button 
                        onClick={handleReset}
                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                    >
                        Reset
                    </button>
                    <button 
                        onClick={handleForceInactivity}
                        className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                    >
                        Forzar
                    </button>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={handleToggleTestMode}
                        className={`px-3 py-1 rounded text-sm ${
                            testMode 
                                ? 'bg-orange-500 text-white hover:bg-orange-600' 
                                : 'bg-gray-500 text-white hover:bg-gray-600'
                        }`}
                    >
                        {testMode ? 'Modo Normal' : 'Modo Test'}
                    </button>
                    <button 
                        onClick={getStatusInfo}
                        className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
                    >
                        Status
                    </button>
                </div>
            </div>

            {/* Logs */}
            <div className="border-t pt-2">
                <div className="font-semibold text-sm mb-1">Logs:</div>
                <div className="bg-gray-100 p-2 rounded text-xs max-h-32 overflow-y-auto">
                    {logs.length === 0 ? (
                        <div className="text-gray-500">No hay logs aún...</div>
                    ) : (
                        logs.map((log, index) => (
                            <div key={index} className="mb-1">{log}</div>
                        ))
                    )}
                </div>
            </div>

            {/* Instrucciones */}
            <div className="border-t pt-2 mt-2">
                <div className="text-xs text-gray-600">
                    <strong>Instrucciones:</strong><br />
                    • Modo Test: 30 segundos de inactividad<br />
                    • Modo Normal: 10 minutos de inactividad<br />
                    • Mueve el mouse para reiniciar el cronómetro<br />
                    • "Forzar" simula inactividad inmediata
                </div>
            </div>
        </div>
    );
};

export default InactivityTimerTest;
