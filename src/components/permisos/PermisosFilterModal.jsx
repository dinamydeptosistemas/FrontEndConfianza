import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Modal de filtros para permisos
 * Props:
 * - isOpen: boolean para mostrar/ocultar el modal
 * - onClose: función para cerrar el modal
 * - onApply: función para aplicar los filtros (envía el objeto de filtros)
 */
function PermisosFilterModal({ isOpen, onClose, onApply }) {
  const [filters, setFilters] = useState({
    usuario: '',
    funcion: '',
    estado: '',
    fechaInicio: '',
    fechaFin: ''
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  }

  function handleApply() {
    if (onApply) onApply(filters);
    if (onClose) onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Filtrar Permisos</h2>
        <div className="space-y-3">
          <input
            type="text"
            name="usuario"
            value={filters.usuario}
            onChange={handleChange}
            placeholder="Usuario"
            className="w-full border rounded px-2 py-1"
          />
          <input
            type="text"
            name="funcion"
            value={filters.funcion}
            onChange={handleChange}
            placeholder="Función"
            className="w-full border rounded px-2 py-1"
          />
          <select
            name="estado"
            value={filters.estado}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
          >
            <option value="">Estado</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
          <input
            type="date"
            name="fechaInicio"
            value={filters.fechaInicio}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
          />
          <input
            type="date"
            name="fechaFin"
            value={filters.fechaFin}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-1 rounded bg-gray-200 hover:bg-gray-300">Cancelar</button>
          <button onClick={handleApply} className="px-4 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">Aplicar</button>
        </div>
      </div>
    </div>
  );
}

PermisosFilterModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onApply: PropTypes.func
};

export default PermisosFilterModal;
