import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Componente de prueba para verificar que los errores de BrowserStatus se han corregido
 */
const BrowserStatusTest = () => {
  const { user, browserStatus } = useAuth();
  const [testResults, setTestResults] = useState([]);

  const addTestResult = (test, result, details = '') => {
    setTestResults(prev => [...prev, {
      test,
      result,
      details,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const runTests = () => {
    setTestResults([]);
    
    // Test 1: Verificar que browserStatus existe cuando está autenticado
    if (user && browserStatus) {
      addTestResult('browserStatus existe cuando autenticado', '✅ PASS', 'browserStatus está disponible');
    } else if (!user && !browserStatus) {
      addTestResult('browserStatus es null cuando no autenticado', '✅ PASS', 'browserStatus es null como esperado');
    } else {
      addTestResult('Estado de browserStatus', '❌ FAIL', `user: ${!!user}, browserStatus: ${!!browserStatus}`);
    }

    // Test 2: Verificar propiedades de browserStatus
    if (browserStatus) {
      try {
        const { isActive, isClosing, lastActivity, keepAliveStatus } = browserStatus;
        addTestResult('Propiedades de browserStatus', '✅ PASS', 
          `isActive: ${isActive}, isClosing: ${isClosing}, lastActivity: ${!!lastActivity}, keepAliveStatus: ${!!keepAliveStatus}`);
      } catch (error) {
        addTestResult('Propiedades de browserStatus', '❌ FAIL', error.message);
      }
    }

    // Test 3: Verificar funciones de browserStatus
    if (browserStatus) {
      try {
        const { forceKeepAlive, getStatistics } = browserStatus;
        if (typeof forceKeepAlive === 'function' && typeof getStatistics === 'function') {
          addTestResult('Funciones de browserStatus', '✅ PASS', 'forceKeepAlive y getStatistics son funciones');
        } else {
          addTestResult('Funciones de browserStatus', '❌ FAIL', 'Funciones no están disponibles');
        }
      } catch (error) {
        addTestResult('Funciones de browserStatus', '❌ FAIL', error.message);
      }
    }

    // Test 4: Intentar ejecutar forceKeepAlive (solo si está autenticado)
    if (browserStatus && user) {
      try {
        browserStatus.forceKeepAlive();
        addTestResult('Ejecución de forceKeepAlive', '✅ PASS', 'No generó errores');
      } catch (error) {
        addTestResult('Ejecución de forceKeepAlive', '❌ FAIL', error.message);
      }
    }

    // Test 5: Intentar obtener estadísticas
    if (browserStatus && user) {
      try {
        const stats = browserStatus.getStatistics();
        addTestResult('Obtener estadísticas', '✅ PASS', `Stats: ${stats ? 'disponibles' : 'null'}`);
      } catch (error) {
        addTestResult('Obtener estadísticas', '❌ FAIL', error.message);
      }
    }
  };

  const simulateTabChange = () => {
    // Simular cambio de pestaña
    Object.defineProperty(document, 'hidden', {
      writable: true,
      value: true
    });
    const event = new Event('visibilitychange');
    document.dispatchEvent(event);
    
    addTestResult('Simulación cambio de pestaña', '✅ EJECUTADO', 'Evento visibilitychange disparado');
    
    // Volver después de 2 segundos
    setTimeout(() => {
      Object.defineProperty(document, 'hidden', {
        writable: true,
        value: false
      });
      const returnEvent = new Event('visibilitychange');
      document.dispatchEvent(returnEvent);
      
      addTestResult('Simulación regreso a pestaña', '✅ EJECUTADO', 'Evento visibilitychange (return) disparado');
    }, 2000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Pruebas de BrowserStatus</h2>
      
      {/* Estado actual */}
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">Estado Actual</h3>
        <div className="text-sm space-y-1">
          <div><strong>Usuario autenticado:</strong> {user ? '✅ Sí' : '❌ No'}</div>
          <div><strong>BrowserStatus disponible:</strong> {browserStatus ? '✅ Sí' : '❌ No'}</div>
          {browserStatus && (
            <>
              <div><strong>Navegador activo:</strong> {browserStatus.isActive ? '✅ Sí' : '❌ No'}</div>
              <div><strong>Navegador cerrando:</strong> {browserStatus.isClosing ? '⚠️ Sí' : '✅ No'}</div>
            </>
          )}
        </div>
      </div>

      {/* Controles */}
      <div className="mb-6 space-x-3">
        <button
          onClick={runTests}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Ejecutar Pruebas
        </button>
        
        <button
          onClick={simulateTabChange}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Simular Cambio de Pestaña
        </button>
        
        <button
          onClick={() => setTestResults([])}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Limpiar Resultados
        </button>
      </div>

      {/* Resultados */}
      {testResults.length > 0 && (
        <div className="bg-white border rounded-lg">
          <h3 className="font-semibold p-4 border-b">Resultados de Pruebas</h3>
          <div className="divide-y">
            {testResults.map((result, index) => (
              <div key={index} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{result.test}</div>
                  <div className="text-sm text-gray-500">{result.timestamp}</div>
                </div>
                <div className="mt-1">
                  <span className="font-medium">{result.result}</span>
                  {result.details && (
                    <span className="ml-2 text-sm text-gray-600">- {result.details}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instrucciones */}
      <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
        <h4 className="font-semibold text-yellow-800 mb-2">Instrucciones</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>1. <strong>Ejecutar Pruebas:</strong> Verifica que no hay errores de null/undefined</li>
          <li>2. <strong>Simular Cambio de Pestaña:</strong> Prueba los eventos de visibilidad</li>
          <li>3. <strong>Revisar Consola:</strong> Busca errores de "Cannot read properties of null"</li>
          <li>4. <strong>Autenticarse/Desautenticarse:</strong> Prueba el comportamiento en ambos estados</li>
        </ul>
      </div>
    </div>
  );
};

export default BrowserStatusTest;
