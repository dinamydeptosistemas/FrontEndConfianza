import React, { useState, useEffect } from 'react';




export default function PermisoUpdateModal({ onClose, onUpdate, permiso }) {
  const [formData, setFormData] = useState({
    regPermiso: '',
    idUser: '',
    userName: '',
    idFunction: '',
    function: '',
    codigoEntidad: '',
    estadoPermisoActivado: true,
    permitirTodasEmpresas: true,
    permitirMasDeUnaSesion: true,
    cierreSesionJornada: 0,
    bloqueoSesionMaxima: 0,
    usuarioResponsable: '',
    fechaInicioPermiso: '',
    fechaFinalPermiso: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (permiso) {
      setFormData({
        regPermiso: permiso.regPermiso || '',
        idUser: permiso.idUser || '',
        userName: permiso.userName || '',
        idFunction: permiso.idFunction || '',
        function: permiso.function || '',
        codigoEntidad: permiso.codigoEntidad || '',
        estadoPermisoActivado: permiso.estadoPermisoActivado ?? true,
        permitirTodasEmpresas: permiso.permitirTodasEmpresas ?? true,
        permitirMasDeUnaSesion: permiso.permitirMasDeUnaSesion ?? true,
        cierreSesionJornada: permiso.cierreSesionJornada || 0,
        bloqueoSesionMaxima: permiso.bloqueoSesionMaxima || 0,
        usuarioResponsable: permiso.usuarioResponsable || '',
        fechaInicioPermiso: permiso.fechaInicioPermiso || '',
        fechaFinalPermiso: permiso.fechaFinalPermiso || ''
      });
    }
  }, [permiso]);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onUpdate(formData);
      setShowSuccess(true);
    } catch (error) {
      alert('Error al actualizar el permiso');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[600px] max-h-[90vh] overflow-y-auto relative">
        <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold focus:outline-none">&times;</button>
        <h3 className="text-xl font-bold mb-4">Editar Permiso</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input name="regPermiso" value={formData.regPermiso} onChange={handleChange} placeholder="Reg Permiso" className="border p-1" required />
            <input name="idUser" value={formData.idUser} onChange={handleChange} placeholder="Id User" className="border p-1" required />
            <input name="userName" value={formData.userName} onChange={handleChange} placeholder="User Name" className="border p-1" required />
            <input name="idFunction" value={formData.idFunction} onChange={handleChange} placeholder="Id Función" className="border p-1" required />
            <input name="function" value={formData.function} onChange={handleChange} placeholder="Función" className="border p-1" required />
            <input name="codigoEntidad" value={formData.codigoEntidad} onChange={handleChange} placeholder="Código Entidad" className="border p-1" required />
            <input name="usuarioResponsable" value={formData.usuarioResponsable} onChange={handleChange} placeholder="Usuario Responsable" className="border p-1" required />
            <input name="fechaInicioPermiso" type="date" value={formData.fechaInicioPermiso} onChange={handleChange} placeholder="Fecha Inicio Permiso" className="border p-1" required />
            <input name="fechaFinalPermiso" type="date" value={formData.fechaFinalPermiso} onChange={handleChange} placeholder="Fecha Final Permiso" className="border p-1" required />
            <input name="cierreSesionJornada" type="number" value={formData.cierreSesionJornada} onChange={handleChange} placeholder="Cierre Sesión Jornada" className="border p-1" />
            <input name="bloqueoSesionMaxima" type="number" value={formData.bloqueoSesionMaxima} onChange={handleChange} placeholder="Bloqueo Sesión Máxima" className="border p-1" />
          </div>
          <div className="flex gap-3">
            <label><input type="checkbox" name="estadoPermisoActivado" checked={formData.estadoPermisoActivado} onChange={handleChange} /> Estado Permiso Activado</label>
            <label><input type="checkbox" name="permitirTodasEmpresas" checked={formData.permitirTodasEmpresas} onChange={handleChange} /> Permitir Todas Empresas</label>
            <label><input type="checkbox" name="permitirMasDeUnaSesion" checked={formData.permitirMasDeUnaSesion} onChange={handleChange} /> Permitir Más De Una Sesión</label>
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Actualizar</button>
          {showSuccess && <div className="text-green-600">Permiso actualizado exitosamente</div>}
        </form>
      </div>
    </div>
  );
}
