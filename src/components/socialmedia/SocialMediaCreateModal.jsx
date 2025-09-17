import React, { useState } from 'react';
import ActionButtons, { LoadingOverlay } from '../common/Buttons';
import { useConfig } from '../../contexts/ConfigContext';


const SocialMediaCreateModal = ({ isOpen, onClose, onSave, redesSociales, onSuccess }) => {
  const { config } = useConfig();

 const initialEnv = config ? config.ambienteTrabajoModo : null;
  const [formData, setFormData] = useState({
    redSocial: '',
    nombreCuenta: '',
    password: '',
    tipoMedio: '',
    medioActivo: true,
    empresa: '',
    responsable: '',
    departamento: '',
    tipoProceso: 'EXTERNO',
    notaDeUso: '',
    enviroment: initialEnv,
  });
  
  const [loading, setLoading] = useState(false);


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onSave(formData);
      
      if (typeof onSuccess === 'function') {
        onSuccess('¡Medio social creado correctamente!');
      }
      
      // Limpiar formulario después de guardar
      setFormData({
        redSocial: '',
        nombreCuenta: '',
        password: '',
        tipoMedio: '',
        medioActivo: true,
        empresa: '',
        responsable: '',
        departamento: '',
        tipoProceso: 'EXTERNO',
        notaDeUso: ''
      });
      
      onClose();
    } catch (error) {
      alert('Error al crear el medio social');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return formData.redSocial && formData.nombreCuenta && formData.password;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white py-6 px-10 rounded-lg shadow-lg w-[750px] max-h-[90vh] overflow-y-auto relative">
        {/* Overlay de carga */}
        {loading && <LoadingOverlay isLoading={true} message="Guardando medio social..." />}
        
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold"
          aria-label="Cerrar"
        >
          ×
        </button>

        <div className="grid grid-cols-2 items-center mb-2">
          <h2 className="text-2xl font-bold text-gray-800 pt-4">Nuevo Medio Social</h2>
          <div className="flex justify-end gap-3 mr-[25px]">
            <ActionButtons
              onClose={onClose} 
              handleSubmit={handleSubmit} 
              disabled={!isFormValid()} 
              loading={loading}
              loadingText="Guardando..." 
            />
          </div>
        </div>
        <hr className="col-span-2 border-blue-500 mr-6 m-0 p-0" />

        <form onSubmit={handleSubmit} className="grid mt-5 grid-cols-2 gap-x-4 gap-y-3 relative">

          {/* Row 1: Estado Activo */}
          <div className="flex items-center h-10">
            <label className="text-sm text-gray-700 font-medium">Medio Activo</label>
            <input
              type="checkbox"
              name="medioActivo"
              checked={formData.medioActivo}
              onChange={handleChange}
              className="h-4 w-4 ml-2 rounded border-gray-200 text-blue-600 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="flex items-center h-10">
            <div className={`inline-flex px-4 py-2 text-[1rem] rounded-full text-xs font-medium ${formData.medioActivo ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}> 
              {formData.medioActivo ? 'ACTIVO' : 'INACTIVO'}
            </div>
          </div>

          {/* Row 2: Red Social + Nombre de Cuenta */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Red Social <span className="text-red-600">*</span>
            </label>
            <select
              name="redSocial"
              value={formData.redSocial}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:border-[#285398] focus:ring-0 px-2 py-1 bg-white hover:bg-gray-50 transition-colors outline-none"
              required
            >
              <option value="">Seleccione una red social</option>
              {redesSociales.map(red => (
                <option key={red.value} value={red.value}>
                  {red.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre de Cuenta <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="nombreCuenta"
              value={formData.nombreCuenta}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:border-[#285398] focus:ring-0 px-2 py-1 bg-white hover:bg-gray-50 transition-colors outline-none"
              required
            />
          </div>

          {/* Row 3: Contraseña + Tipo de Medio */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contraseña <span className="text-red-600">*</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:border-[#285398] focus:ring-0 px-2 py-1 bg-white hover:bg-gray-50 transition-colors outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo de Medio</label>
            <input
              type="text"
              name="tipoMedio"
              value={formData.tipoMedio}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:border-[#285398] focus:ring-0 px-2 py-1 bg-white hover:bg-gray-50 transition-colors outline-none"
            />
          </div>

          {/* Row 4: Empresa + Responsable */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Empresa</label>
            <input
              type="text"
              name="empresa"
              value={formData.empresa}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:border-[#285398] focus:ring-0 px-2 py-1 bg-white hover:bg-gray-50 transition-colors outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Responsable</label>
            <input
              type="text"
              name="responsable"
              value={formData.responsable}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:border-[#285398] focus:ring-0 px-2 py-1 bg-white hover:bg-gray-50 transition-colors outline-none"
            />
          </div>

          {/* Row 5: Departamento + Tipo de Proceso */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Departamento</label>
            <input
              type="text"
              name="departamento"
              value={formData.departamento}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:border-[#285398] focus:ring-0 px-2 py-1 bg-white hover:bg-gray-50 transition-colors outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo de Proceso</label>
            <select
              name="tipoProceso"
              value={formData.tipoProceso}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:border-[#285398] focus:ring-0 px-2 py-1 bg-white hover:bg-gray-50 transition-colors outline-none"
            >
              <option value="EXTERNO">Externo</option>
              <option value="INTERNO">Interno</option>
            </select>
          </div>

          {/* Row 6: Notas de Uso (ocupa toda la fila) */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Notas de Uso</label>
            <textarea
              rows={3}
              name="notaDeUso"
              value={formData.notaDeUso}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:border-[#285398] focus:ring-0 px-2 py-1 bg-white hover:bg-gray-50 transition-colors outline-none resize-none"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default SocialMediaCreateModal;