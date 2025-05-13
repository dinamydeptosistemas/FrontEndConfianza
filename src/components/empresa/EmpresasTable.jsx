import React from 'react';

export default function EmpresasTable({ empresas, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-300 bg-white">
      <table className="min-w-full text-xs text-gray-700">
        <thead className="bg-gray-200 text-gray-700 uppercase text-xs">
          <tr>
            <th className="p-2">Edit</th>
            <th className="p-2">Borr</th>
            <th className="p-2">Codigo Entidad</th>
            <th className="p-2">Tipo Entidad</th>
            <th className="p-2">Matr</th>
            <th className="p-2">Tipo Contribuye...</th>
            <th className="p-2">Ruc</th>
            <th className="p-2">Razon Social</th>
            <th className="p-2">Nombre Comercial</th>
            <th className="p-2">Ciudad</th>
            <th className="p-2">Telefono</th>
            <th className="p-2">Email</th>
            <th className="p-2">Actividad Económica</th>
            <th className="p-2">Comprobante de Venta</th>
            <th className="p-2">Régimen Tributario</th>
            <th className="p-2">Leyenda de Régimen</th>
            <th className="p-2">Mantiene Contabilidad</th>
            <th className="p-2">Agente Retención</th>
            <th className="p-2">Nombre Grupo</th> 
          </tr>
        </thead>
        <tbody>
          {empresas.map((e) => (
            <tr key={e.codeEntity} className="border-t">
              <td className="p-2 text-center">
                <button
                  className="text-blue-600 hover:text-blue-900"
                  onClick={() => onEdit(e)}
                  title="Editar"
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm-6 6h6v-6H3v6z"></path></svg>
                </button>
              </td>
              <td className="p-2 text-center">
                <button
                  className="text-red-600 hover:text-red-900 border border-red-400 rounded px-1"
                  onClick={() => onDelete(e.codeEntity)}
                  title="Borrar"
                >□</button>
              </td>
              <td className="p-2">{e.codeEntity}</td>
              <td className="p-2">{e.typeEntity}</td>
              <td className="p-2">{e.matrix ? 'SI' : 'NO'}</td>
              <td className="p-2">{e.typeEntity}</td>
              <td className="p-2">{e.ruc}</td>
              <td className="p-2">{e.businessName}</td>
              <td className="p-2">{e.commercialName}</td>
              <td className="p-2">{e.city}</td>
              <td className="p-2">{e.phone}</td>
              <td className="p-2">{e.email}</td>
              <td className="p-2">{e.economicActivity}</td>
              <td className="p-2">{e.salesReceipt}</td>
              <td className="p-2">{e.taxRegime}</td>
              <td className="p-2">{e.regimeLegend}</td>
              <td className="p-2">{e.keepsAccounting ? 'SI' : 'NO'}</td>
              <td className="p-2">{e.retentionAgent ? 'SI' : 'NO'}</td>
              <td className="p-2">{e.nameGroup}</td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 