import React from 'react';

export default function EmpresasBuscar({ onBuscar, filtro, setFiltro, filtroActivo, setFiltroActivo, mostrarEtiqueta = true, inputWidth = '80px' }) {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onBuscar(filtro);
    }
  };

  const handleClear = () => {
    setFiltro('');
    setFiltroActivo('');
    onBuscar('');
  };

  return (
    <div className="flex gap-2 items-center">
      <input
        type="text"
        className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        style={{ width: inputWidth }}
        placeholder="Buscar por RUC o nombre de empresa..."
        value={filtro}
        onChange={e => setFiltro(e.target.value)}
        onKeyPress={handleKeyPress}
        aria-label="Buscar empresas"
      />
      <button
        type="button"
        className="bg-blue-700 text-white px-4 py-1 rounded hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        onClick={() => onBuscar(filtro)}
        aria-label="Buscar"
      >
        Buscar
      </button>
      {mostrarEtiqueta && filtroActivo && (
        <span className="ml-2 bg-gray-200 px-2 py-1 rounded flex items-center">
          {filtroActivo}
          <button
            onClick={handleClear}
            className="ml-1 text-red-500 hover:text-red-700 font-bold"
            aria-label="Limpiar búsqueda"
            style={{ fontSize: '1.1em', lineHeight: 1 }}
          >
            ×
          </button>
        </span>
      )}
    </div>
  );
} 