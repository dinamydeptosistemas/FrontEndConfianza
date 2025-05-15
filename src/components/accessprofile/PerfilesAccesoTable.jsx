import React from 'react';

export default function PerfilesAccesoTable({ perfiles, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-300 bg-white">
      <table className="min-w-full text-xs text-gray-700">
        <thead className="bg-gray-200 text-gray-700 uppercase text-xs">
          <tr>
            <th className="p-2">Edit</th>
            <th className="p-2">Borr</th>
            <th className="p-2">ID</th>
            <th className="p-2">Nombre de Función</th>
            <th className="p-2">Permisos</th>
            <th className="p-2">Todos los Módulos</th>
            <th className="p-2">Administración</th>
            <th className="p-2">Producto</th>
            <th className="p-2">Inventario</th>
            <th className="p-2">Compra</th>
            <th className="p-2">Venta</th>
            <th className="p-2">Caja</th>
            <th className="p-2">Banco</th>
            <th className="p-2">Contabilidad</th>
            <th className="p-2">Nómina</th>
            <th className="p-2">Caja General</th>
            <th className="p-2">Cierre Caja Gen.</th>
            <th className="p-2">Caja 001</th>
            <th className="p-2">Caja 002</th>
            <th className="p-2">Caja 003</th>
            <th className="p-2">Caja 004</th>
            <th className="p-2">Módulos Externos</th>
          </tr>
        </thead>
        <tbody>
          {perfiles.map((perfil) => (
            <tr key={perfil.idFunction} className="border-t">
              <td className="p-2 text-center">
                <button
                  className="text-blue-600 hover:text-blue-900"
                  onClick={() => onEdit(perfil)}
                  title="Editar"
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm-6 6h6v-6H3v6z"></path></svg>
                </button>
              </td>
              <td className="p-2 text-center">
                <button
                  className="text-red-600 hover:text-red-900 border border-red-400 rounded px-1"
                  onClick={() => onDelete(perfil)}
                  title="Borrar"
                >□</button>
              </td>
              <td className="p-2">{perfil.idFunction}</td>
              <td className="p-2">{perfil.functionName}</td>
              <td className="p-2">{perfil.grantPermissions ? 'SI' : 'NO'}</td>
              <td className="p-2">{perfil.allModules ? 'SI' : 'NO'}</td>
              <td className="p-2">{perfil.administration ? 'SI' : 'NO'}</td>
              <td className="p-2">{perfil.product ? 'SI' : 'NO'}</td>
              <td className="p-2">{perfil.inventory ? 'SI' : 'NO'}</td>
              <td className="p-2">{perfil.purchase ? 'SI' : 'NO'}</td>
              <td className="p-2">{perfil.sale ? 'SI' : 'NO'}</td>
              <td className="p-2">{perfil.cashRegister ? 'SI' : 'NO'}</td>
              <td className="p-2">{perfil.bank ? 'SI' : 'NO'}</td>
              <td className="p-2">{perfil.accounting ? 'SI' : 'NO'}</td>
              <td className="p-2">{perfil.payroll ? 'SI' : 'NO'}</td>
              <td className="p-2">{perfil.generalCash ? 'SI' : 'NO'}</td>
              <td className="p-2">{perfil.closeCashGen ? 'SI' : 'NO'}</td>
              <td className="p-2">{perfil.cashRegister001 ? 'SI' : 'NO'}</td>
              <td className="p-2">{perfil.cashRegister002 ? 'SI' : 'NO'}</td>
              <td className="p-2">{perfil.cashRegister003 ? 'SI' : 'NO'}</td>
              <td className="p-2">{perfil.cashRegister004 ? 'SI' : 'NO'}</td>
              <td className="p-2">{perfil.externalModules ? 'SI' : 'NO'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 