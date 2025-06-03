import React, { useState, useEffect } from 'react';

// Función helper para formatear fechas de manera segura
const formatDateForInput = (dateValue) => {
  if (!dateValue) return '';
  try {
    return new Date(dateValue).toISOString().split('T')[0];
  } catch (error) {
    console.warn('Error al formatear fecha:', error);
    return '';
  }
};

// Función para obtener los datos iniciales del formulario
const getInitialFormData = (paperworkData) => ({
  regTramite: paperworkData?.regTramite || '',
  fechaSolicitud: formatDateForInput(paperworkData?.fechaSolicitud) || new Date().toISOString().split('T')[0],
  tipoTramite: paperworkData?.tipoTramite || '',
  tipoUser: paperworkData?.tipoUser || '',
  relacionUser: paperworkData?.relacionUser || '',
  registradoComo: paperworkData?.registradoComo || '',
  registroEmpresa: paperworkData?.registroEmpresa || '',
  apellidosUser: paperworkData?.apellidosUser || '',
  nombresUser: paperworkData?.nombresUser || '',
  username: paperworkData?.username || '',
  actualizarEmail: paperworkData?.actualizarEmail || '',
  email: paperworkData?.email || '',
  verificadoEmail: paperworkData?.verificadoEmail || false,
  telefonoCelular: paperworkData?.telefonoCelular || '',
  verificadoCelular: paperworkData?.verificadoCelular || false,
  novedad: paperworkData?.novedad || '',
  estadoTramite: paperworkData?.estadoTramite || 'POR PROCESAR',
  responsableAprobacion: paperworkData?.responsableAprobacion || '',
  fechaAprobacion: formatDateForInput(paperworkData?.fechaAprobacion)
});

export default function PaperworkUpdateModal({ isOpen, onSave, paperwork, onClose }) {
  // Inicializar el estado con los datos del trámite o valores por defecto
  const [formData, setFormData] = useState(() => getInitialFormData(paperwork));

  // Actualizar el estado cuando cambie el trámite
  useEffect(() => {
    if (paperwork) {
      setFormData(getInitialFormData(paperwork));
    }
  }, [paperwork]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  // Retorno temprano si el modal no está abierto
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header del modal */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Actualizar Trámite</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Cerrar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* ID del Trámite */}
              <div>
                <label className="block text-sm font-medium text-gray-700">ID del Trámite</label>
                <input
                  type="text"
                  name="regTramite"
                  value={formData.regTramite}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-100"
                  disabled
                />
              </div>

              {/* Fecha de Solicitud */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha de Solicitud</label>
                <input
                  type="date"
                  name="fechaSolicitud"
                  value={formData.fechaSolicitud}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Tipo de Trámite */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo de Trámite</label>
                <input
                  type="text"
                  name="tipoTramite"
                  value={formData.tipoTramite}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Tipo de Usuario */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo de Usuario</label>
                <select
                  name="tipoUser"
                  value={formData.tipoUser}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccionar...</option>
                  <option value="EXTERNO">EXTERNO</option>
                  <option value="INTERNO">INTERNO</option>
                </select>
              </div>

              {/* Relación con la Empresa */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Relación con la Empresa</label>
                <input
                  type="text"
                  name="relacionUser"
                  value={formData.relacionUser}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Registrado Como */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Registrado Como</label>
                <input
                  type="text"
                  name="registradoComo"
                  value={formData.registradoComo}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Registro de Empresa */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Registro de Empresa</label>
                <input
                  type="text"
                  name="registroEmpresa"
                  value={formData.registroEmpresa}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Apellidos */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Apellidos</label>
                <input
                  type="text"
                  name="apellidosUser"
                  value={formData.apellidosUser}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Nombres */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombres</label>
                <input
                  type="text"
                  name="nombresUser"
                  value={formData.nombresUser}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Teléfono Celular */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Teléfono Celular</label>
                <input
                  type="tel"
                  name="telefonoCelular"
                  value={formData.telefonoCelular}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Estado del Trámite */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Estado del Trámite</label>
                <select
                  name="estadoTramite"
                  value={formData.estadoTramite}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="POR PROCESAR">POR PROCESAR</option>
                  <option value="EN PROCESO">EN PROCESO</option>
                  <option value="COMPLETADO">COMPLETADO</option>
                  <option value="CANCELADO">CANCELADO</option>
                </select>
              </div>

              {/* Responsable de Aprobación */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Responsable de Aprobación</label>
                <input
                  type="text"
                  name="responsableAprobacion"
                  value={formData.responsableAprobacion}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Fecha de Aprobación */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha de Aprobación</label>
                <input
                  type="date"
                  name="fechaAprobacion"
                  value={formData.fechaAprobacion}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Novedad - Campo de texto largo */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Novedad</label>
                <textarea
                  name="novedad"
                  value={formData.novedad}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Escriba cualquier novedad o comentario adicional..."
                />
              </div>

            </div>

            {/* Botones de acción */}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button> 
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Actualizar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}