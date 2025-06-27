import React from 'react';

export default function PermisosTable({ permisos, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-300 bg-white">
      <table className="min-w-full text-xs text-gray-700">
        <thead className="bg-gray-200 text-gray-700 uppercase text-xs">
          <tr>
            <th className="p-2">Edit</th>
            <th className="p-2">Borr</th>
            <th className="p-2">Reg Permiso</th>
            <th className="p-2">Id User</th>
            <th className="p-2">User Name</th>
            <th className="p-2">Id Función</th>
            <th className="p-2">Función</th>
            <th className="p-2">Código Entidad</th>
            <th className="p-2">Estado Permiso Activado</th>
            <th className="p-2">Permitir Todas Empresas</th>
            <th className="p-2">Permitir Más De Una Sesión</th>
            <th className="p-2">Cierre Sesión Jornada</th>
            <th className="p-2">Bloqueo Sesión Máxima</th>
            <th className="p-2">Usuario Responsable</th>
            <th className="p-2">Fecha Inicio Permiso</th>
            <th className="p-2">Fecha Final Permiso</th>
          </tr>
        </thead>
        <tbody>
          {permisos.map((permiso) => (
            <tr key={permiso.regPermiso} className="border-t">
              <td className="p-2 text-center">
                <button className="text-blue-600 hover:text-blue-900" onClick={() => onEdit(permiso)} title="Editar">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm-6 6h6v-6H3v6z"></path></svg>
                </button>
              </td>
              <td className="p-2 text-center">
                <button 
                  className="text-red-600 hover:text-red-900 hover:bg-red-100 p-1 rounded" 
                  onClick={() => onDelete(permiso)} 
                  title="Borrar"
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </td>
              <td className="p-2 text-center">
                <button 
                  className="text-green-600 hover:text-green-900 hover:bg-green-100 p-1 rounded" 
                  onClick={() => onUpdatePermissions && onUpdatePermissions(permiso)} 
                  title="Actualizar Permisos"
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 15l8.385-8.415a2.1 2.1 0 00-2.976-2.968L9 12.01V15h2.99z"></path>
                    <path d="M18 10l-8 8"></path>
                    <path d="M12 3a9 9 0 11-6 15.364"></path>
                  </svg>
                </button>
              </td>
              <td className="p-2">{permiso.regPermiso}</td>
              <td className="p-2">{permiso.idUser}</td>
              <td className="p-2">{permiso.userName}</td>
              <td className="p-2">{permiso.idFunction}</td>
              <td className="p-2">{permiso.function}</td>
              <td className="p-2">{permiso.codigoEntidad}</td>
              <td className="p-2">{permiso.estadoPermisoActivado ? 'Si' : 'No'}</td>
              <td className="p-2">{permiso.permitirTodasEmpresas ? 'Si' : 'No'}</td>
              <td className="p-2">{permiso.permitirMasDeUnaSesion ? 'Si' : 'No'}</td>
              <td className="p-2">{permiso.cierreSesionJornada}</td>
              <td className="p-2">{permiso.bloqueoSesionMaxima}</td>
              <td className="p-2">{permiso.usuarioResponsable}</td>
              <td className="p-2">{permiso.fechaInicioPermiso}</td>
              <td className="p-2">{permiso.fechaFinalPermiso}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
