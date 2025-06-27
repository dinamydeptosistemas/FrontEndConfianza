import React, { useState, useEffect } from 'react';
import { getPermisos, putPermiso } from '../../services/permission/PermissionService';

const UpdatePermisoModal = ({ isOpen, onClose, userId, userName, onUpdate }) => {
  const [permisos, setPermisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Cargar permisos cuando se abre el modal
  useEffect(() => {
    const cargarPermisos = async () => {
      if (!isOpen || !userId) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await getPermisos({ idUser: userId });
        setPermisos(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error cargando permisos:', err);
        setError('No se pudieron cargar los permisos. Por favor, intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    cargarPermisos();
  }, [isOpen, userId]);

  const handleTogglePermiso = (index, field) => {
    const nuevosPermisos = [...permisos];
    nuevosPermisos[index] = {
      ...nuevosPermisos[index],
      [field]: !nuevosPermisos[index][field]
    };
    setPermisos(nuevosPermisos);
  };

  const handleGuardar = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Actualizar cada permiso modificado
      for (const permiso of permisos) {
        await putPermiso(permiso);
      }
      
      onUpdate?.();
      onClose();
    } catch (err) {
      console.error('Error guardando permisos:', err);
      setError('Error al guardar los cambios. Por favor, intente nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Permisos de {userName || 'Usuario'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              disabled={saving}
            >
              ✕
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Módulo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ver
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Crear
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Editar
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Eliminar
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {permisos.map((permiso, index) => (
                      <tr key={permiso.regPermiso}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {permiso.function || 'Sin nombre'}
                        </td>
                        {['ver', 'crear', 'editar', 'eliminar'].map((accion) => (
                          <td key={`${permiso.regPermiso}-${accion}`} className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={permiso[accion] || false}
                              onChange={() => handleTogglePermiso(index, accion)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              disabled={saving}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleGuardar}
                  disabled={saving}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdatePermisoModal;
