import React from 'react';

export default function EmpresasBotonera({ onNueva, onEditar, onBorrar }) {
  return (
    <div className="flex gap-2 mb-4">
      <button
        className="bg-white border border-blue-700 text-blue-700 px-4 py-1 rounded hover:bg-blue-50"
        onClick={onNueva}
      >
        Nueva
      </button>
      <button
        className="bg-white border border-blue-700 text-blue-700 px-4 py-1 rounded hover:bg-blue-50"
        onClick={onEditar}
      >
        Editar
      </button>
      <button
        className="bg-red-600 border border-red-700 text-white px-4 py-1 rounded hover:bg-red-700"
        onClick={onBorrar}
      >
        Borrar
      </button>
    </div>
  );
} 