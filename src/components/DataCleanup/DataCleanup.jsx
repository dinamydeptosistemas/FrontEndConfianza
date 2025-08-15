import React, { useState } from 'react';
import { countTestData, cleanTestData } from '../../services/DataCleanup/DataCleanupService';

const DataCleanup = () => {
    const [count, setCount] = useState(null);
    const [cleanupResult, setCleanupResult] = useState(null);
    const [loadingCount, setLoadingCount] = useState(false);
    const [loadingCleanup, setLoadingCleanup] = useState(false);
    const [error, setError] = useState(null);

    const handleCount = async () => {
        setLoadingCount(true);
        setError(null);
        try {
            const data = await countTestData();
            setCount(data.count);
        } catch (err) {
            setError('Error al contar los datos de prueba.');
            console.error(err);
        }
        setLoadingCount(false);
    };

    const handleClean = async () => {
        setLoadingCleanup(true);
        setError(null);
        try {
            const data = await cleanTestData();
            setCleanupResult(data.message);
        } catch (err) {
            setError('Error al limpiar los datos de prueba.');
            console.error(err);
        }
        setLoadingCleanup(false);
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Limpieza de Datos de Prueba</h1>
            <div className="flex space-x-4 mb-4">
                <button
                    onClick={handleCount}
                    disabled={loadingCount}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    {loadingCount ? 'Contando...' : 'Contar Datos de Prueba'}
                </button>
                <button
                    onClick={handleClean}
                    disabled={loadingCleanup}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                    {loadingCleanup ? 'Limpiando...' : 'Limpiar Datos de Prueba'}
                </button>
            </div>
            {error && <p className="text-red-500">{error}</p>}
            {count !== null && <p>Número de registros de prueba: {count}</p>}
            {cleanupResult && <p>{cleanupResult}</p>}
        </div>
    );
};

export default DataCleanup;
