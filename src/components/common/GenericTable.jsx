import React from 'react';

/**
 * columns: [
 *   { key: 'nombre', label: 'Nombre', render?: (row) => ReactNode }
 * ]
 * data: array of objects
 * onEdit, onDelete: (row) => void
 */
export default function GenericTable({ 
  columns, 
  data, 
  onEdit, 
  onDelete, 
  onUpdatePermissions,
  rowKey = 'id', 
  actions = true,
  showActions = {
    edit: true,
    delete: true,
    updatePermissions: true
  }
}) {
  return (
    <table className="w-full text-xs text-gray-700 rounded-lg border border-gray-300 bg-white">
        <thead className="bg-gray-200 text-gray-700 uppercase text-xs sticky top-0 z-10">
          <tr style={{zIndex: 20}} >
            {actions && showActions.edit && <th className="p-2 left-0 bg-gray-200 sticky z-20">Accion</th>}
           
          
            {actions && showActions.updatePermissions && onUpdatePermissions && <th className="p-2 left-0 bg-gray-200 sticky z-20">Permisos</th>}
            {columns.reduce((acc, col, idx) => {
              let left = 0;
              // Calcula left acumulado para sticky
              if (col.sticky) {
                for (let i = 0; i < idx; i++) {
                  if (columns[i].sticky) {
                    left += columns[i].width || 140;
                  }
                }
              }
              acc.push(
                <th
                  key={col.key}
                  className={`p-2 text-center min-h-[20px]${col.sticky ? ' bg-gray-200 sticky z-20' : ''}`}
                  style={col.sticky ? { left, minWidth: col.width || 140, maxWidth: col.width || 140 } : {}}
                >
                  {col.label}
                </th>
              );
              return acc;
            }, [])}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={rowKey && row[rowKey] !== undefined ? row[rowKey] : idx} className="border-t min-h-[20px]">
              {actions && (showActions.edit || showActions.delete || showActions.updatePermissions) && (
                <td className="p-2 text-center">
                  <div className="flex space-x-1">
                    {showActions.edit && onEdit && (
                      <button 
                        className="text-blue-600 hover:text-blue-900" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(row);
                        }} 
                        title="Editar"
                      >
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm-6 6h6v-6H3v6z"></path>
                        </svg>
                      </button>
                    )}
                    {showActions.updatePermissions && onUpdatePermissions && (
                      <button 
                        className="text-green-600 hover:text-green-900"
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdatePermissions(row);
                        }}
                        title="Actualizar Permisos"
                      >
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M12 15l8-8m0 0l-8-8m8 8H4"></path>
                        </svg>
                      </button>
                    )}
                    {showActions.delete && onDelete && (
                      <button 
                        className="text-red-600 hover:text-red-900 pl-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(row);
                        }}
                        title="Eliminar"
                      >
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    )}
                  </div>
                </td>
              )}
              {columns.reduce((acc, col, idx) => {
                let left = 0;
                if (col.sticky) {
                  for (let i = 0; i < idx; i++) {
                    if (columns[i].sticky) {
                      left += columns[i].width || 140;
                    }
                  }
                }
                acc.push(
                  <td
                    key={col.key}
                    className={`p-2 text-center min-h-[20px]${col.sticky ? ' bg-white sticky z-10' : ''}`}
                    style={col.sticky ? { left, minWidth: col.width || 140, maxWidth: col.width || 140 } : {}}
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                );
                return acc;
              }, [])}
            </tr>
          ))}
        </tbody>
      </table>
  );
}
