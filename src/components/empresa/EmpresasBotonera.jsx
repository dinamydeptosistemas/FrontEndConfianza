import React from 'react';

export default function EmpresasBotonera({ onNueva }) {
  return (
    <div className="flex gap-2">
      <button
        onClick={onNueva}
        className="bg-white border-[#1e4e9c] border font-bold text-[#1e4e9c] px-8 py-1 hover:text-white rounded hover:bg-[#1e4e9c]"
      >
        Nueva
      </button>
    </div>
  );
} 