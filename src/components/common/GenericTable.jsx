import React from 'react';

/**
 * columns: [
 *   { key: 'nombre', label: 'Nombre', render?: (row) => ReactNode }
 * ]
 * data: array of objects
 * onEdit, onDelete: (row) => void
 */
export default function GenericTable({ columns, data, onEdit, onDelete, rowKey = 'id', actions = true }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-300 bg-white">
      <table className="min-w-full text-xs text-gray-700">
        <thead className="bg-gray-200 text-gray-700 uppercase text-xs">
          <tr>
            {actions && <th className="p-2">Edit</th>}
            {actions && <th className="p-2">Borr</th>}
            {columns.map(col => (
              <th key={col.key} className="p-2 text-center min-h-[20px]">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={rowKey && row[rowKey] !== undefined ? row[rowKey] : idx} className="border-t min-h-[20px]">
              {actions && (
                <td className="p-2 text-center">
                  <button className="text-blue-600 hover:text-blue-900" onClick={() => onEdit && onEdit(row)} title="Editar">
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm-6 6h6v-6H3v6z"></path></svg>
                  </button>
                </td>
              )}
              {actions && (
                <td className="p-2 text-center">
                  <button className="text-red-600 hover:text-red-900 border border-red-400 rounded px-1" onClick={() => onDelete && onDelete(row)} title="Borrar"></button>
                </td>
              )}
              {columns.map(col => (
                <td key={col.key} className="p-2 text-center min-h-[20px]">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
