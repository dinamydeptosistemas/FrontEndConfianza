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
    FiltroEstadoPermiso: '', // '', true, false
    FiltroTodasEmpresas: '', // '', true, false
    FiltroMasDeUnaSesion: '', // '', true, false
  });


  function handleApply() {
    // Limpiar los filtros para no enviar los que son '' (Todos)
    const filtrosEnviar = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '') filtrosEnviar[key] = value;
    });
    if (onApply) onApply(filtrosEnviar);
    if (onClose) onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Filtrar Permisos</h2>
        <div className="space-y-3">
          <div className="flex flex-col gap-2">
            <span className="font-semibold">Estado del permiso:</span>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="FiltroEstadoPermiso"
                value=""
                checked={filters.FiltroEstadoPermiso === ''}
                onChange={() => setFilters(prev => ({ ...prev, FiltroEstadoPermiso: '' }))}
              />
              Todos
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="FiltroEstadoPermiso"
                value="true"
                checked={filters.FiltroEstadoPermiso === true}
                onChange={() => setFilters(prev => ({ ...prev, FiltroEstadoPermiso: true }))}
              />
              Activo
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="FiltroEstadoPermiso"
                value="false"
                checked={filters.FiltroEstadoPermiso === false}
                onChange={() => setFilters(prev => ({ ...prev, FiltroEstadoPermiso: false }))}
              />
              Inactivo
            </label>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-semibold">Todas las empresas:</span>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="FiltroTodasEmpresas"
                value=""
                checked={filters.FiltroTodasEmpresas === ''}
                onChange={() => setFilters(prev => ({ ...prev, FiltroTodasEmpresas: '' }))}
              />
              Todos
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="FiltroTodasEmpresas"
                value="true"
                checked={filters.FiltroTodasEmpresas === true}
                onChange={() => setFilters(prev => ({ ...prev, FiltroTodasEmpresas: true }))}
              />
              Sí
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="FiltroTodasEmpresas"
                value="false"
                checked={filters.FiltroTodasEmpresas === false}
                onChange={() => setFilters(prev => ({ ...prev, FiltroTodasEmpresas: false }))}
              />
              No
            </label>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-semibold">Permisos con más de una sesión:</span>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="FiltroMasDeUnaSesion"
                value=""
                checked={filters.FiltroMasDeUnaSesion === ''}
                onChange={() => setFilters(prev => ({ ...prev, FiltroMasDeUnaSesion: '' }))}
              />
              Todos
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="FiltroMasDeUnaSesion"
                value="true"
                checked={filters.FiltroMasDeUnaSesion === true}
                onChange={() => setFilters(prev => ({ ...prev, FiltroMasDeUnaSesion: true }))}
              />
              Sí
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="FiltroMasDeUnaSesion"
                value="false"
                checked={filters.FiltroMasDeUnaSesion === false}
                onChange={() => setFilters(prev => ({ ...prev, FiltroMasDeUnaSesion: false }))}
              />
              No
            </label>
          </div>
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
