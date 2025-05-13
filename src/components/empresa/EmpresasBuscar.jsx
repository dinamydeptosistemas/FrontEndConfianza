import React, { useState, useCallback } from 'react';

export default function EmpresasBuscar({ onBuscar }) {
  const [filtro, setFiltro] = useState('');

  // Usar useCallback para evitar recreaciones innecesarias de la función
  const handleSearch = useCallback(() => {
    console.log('Ejecutando búsqueda con término:', filtro); // Debug
    if (typeof onBuscar === 'function') {
      onBuscar(filtro);
    } else {
      console.error('onBuscar no es una función:', onBuscar); // Debug
    }
  }, [filtro, onBuscar]);

  const handleKeyPress = useCallback((e) => {
    console.log('Tecla presionada:', e.key); // Debug
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevenir comportamiento por defecto
      console.log('Enter presionado, ejecutando búsqueda'); // Debug
      handleSearch();
    }
  }, [handleSearch]);

  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    console.log('Input cambiado:', newValue); // Debug
    setFiltro(newValue);
  }, []);

  const handleClick = useCallback(() => {
    console.log('Botón buscar clickeado'); // Debug
    handleSearch();
  }, [handleSearch]);

  return (
    <div className="mb-4 flex gap-2 w-full">
      <input
        type="text"
        className="border border-gray-300 rounded px-2 py-1 w-[15%] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Buscar por RUC o nombre de empresa..."
        value={filtro}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        aria-label="Buscar empresas"
      />
      <button
        type="button"
        className="bg-blue-700 text-white px-4 py-1 rounded hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        onClick={handleClick}
        aria-label="Buscar"
      >
        Buscar
      </button>
    </div>
  );
} 