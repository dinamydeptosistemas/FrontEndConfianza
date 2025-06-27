import React from 'react';

const UsuariosTable = ({ usuarios, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-300 bg-white">
      <table className="min-w-full text-xs text-gray-700">
        <thead className="bg-gray-200 text-gray-700 uppercase text-xs">
          <tr>
            <th className="p-2">Edit</th>
            <th className="p-2">Borr</th>
            <th className="p-2">ID</th>
            <th className="p-2">Nombre</th>
            <th className="p-2">Apellidos</th>
            <th className="p-2">Identificación</th>
            <th className="p-2">Usuario</th>
            <th className="p-2">Contraseña #</th>
            <th className="p-2">PIN</th>
            <th className="p-2">Email</th>
            <th className="p-2">Celular</th>
            <th className="p-2">SMS</th>
            <th className="p-2">WhatsApp</th>
            <th className="p-2">Tipo</th>
            <th className="p-2">Relación</th>
            <th className="p-2">Código Entidad</th>
            <th className="p-2">Estado</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.idUser} className="border-t">
              <td className="p-2 text-center">
                <button
                  className="text-blue-600 hover:text-blue-900"
                  onClick={() => onEdit(usuario)}
                  title="Editar"
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm-6 6h6v-6H3v6z"></path></svg>
                </button>
              </td>
              <td className="p-2 text-center">
                <button
                  className="text-red-600 hover:text-red-900 border border-red-400 rounded px-1"
                  onClick={() => onDelete(usuario)}
                  title="Borrar"
                >□</button>
              </td>
              <td className="p-2">{usuario.idUser}</td>
              <td className="p-2">{usuario.nombreUser}</td>
              <td className="p-2">{usuario.apellidosUser}</td>
              <td className="p-2">{usuario.identificacion}</td>
              <td className="p-2">{usuario.username}</td>
              <td className="p-2">
                {
                  usuario.password
                    ? usuario.password.length > 2
                      ? `${usuario.password.slice(0,2)}${'*'.repeat(usuario.password.length-2)}`
                      : '*'.repeat(usuario.password.length)
                    : ''
                }
              </td>
              <td className="p-2">
                {usuario.passNumber !== undefined && usuario.passNumber !== null && String(usuario.passNumber).trim() !== '' ? '****' : ''}
              </td>
              <td className="p-2">{usuario.emailUsuario}</td>
              <td className="p-2">{usuario.celularUsuario}</td>
              <td className="p-2">{usuario.sms ? 'Sí' : 'No'}</td>
              <td className="p-2">{usuario.whatsap ? 'Sí' : 'No'}</td>
              <td className="p-2">{usuario.tipoUser}</td>
              <td className="p-2">{usuario.relacionUsuario}</td>
              <td className="p-2">{usuario.codeEntity}</td>
              <td className="p-2">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  usuario.usuarioActivo 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {usuario.usuarioActivo ? 'Activo' : 'Inactivo'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {usuarios.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          No hay usuarios para mostrar
        </div>
      )}
    </div>
  );
};

export default UsuariosTable; 