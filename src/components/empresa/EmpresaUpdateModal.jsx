import React, { useState, useEffect } from 'react';
import { provincias, ciudadesPorProvincia } from '../../data/ecuadorLocations';
import { putEmpresa } from '../../services/company/CompanyService';

export default function EmpresaUpdateModal({ empresa, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    codeEntity: '',
    typeEntity: '',
    matrix: false,
    ruc: '',
    businessName: '',
    commercialName: '',
    province: '',
    city: '',
    address: '',
    phone: '',
    email: '',
    economicActivity: '',
    salesReceipt: '',
    taxRegime: '',
    regimeLegend: '',
    keepsAccounting: false,
    retentionAgent: false,
    nameGroup: ''
  });

  const [ciudadesDisponibles, setCiudadesDisponibles] = useState([]);
  const [mostrarInputGrupo, setMostrarInputGrupo] = useState(false);
  const [nuevoGrupo, setNuevoGrupo] = useState('');
  const [grupos, setGrupos] = useState([
    'Grupo A',
    'Grupo B',
    'Grupo C'
    // TODO: Cargar grupos desde el backend
  ]);

  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (empresa) {
      setFormData({ ...empresa, province: empresa.province || '' });
      if (empresa.city) {
        const provinciaEncontrada = Object.entries(ciudadesPorProvincia).find(([_, ciudades]) => 
          ciudades.includes(empresa.city.toUpperCase())
        );
        if (provinciaEncontrada) {
          setCiudadesDisponibles(ciudadesPorProvincia[provinciaEncontrada[0]]);
          setFormData(prev => ({ ...prev, province: provinciaEncontrada[0] }));
        }
      }
    }
  }, [empresa]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleProvinciaChange = (e) => {
    const provincia = e.target.value;
    setProvinciaSeleccionada(provincia);
    setCiudadesDisponibles(ciudadesPorProvincia[provincia] || []);
    setFormData(prev => ({ ...prev, province: provincia, city: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Construir payload solo con los campos que cambiaron
      const payload = {};
      if (formData.codeEntity) {
        payload.codeCompany = formData.codeEntity;
      }
      Object.keys(formData).forEach(key => {
        if (key === 'codeEntity') return; // ya lo mapeamos
        if (formData[key] !== empresa[key]) {
          payload[key] = formData[key];
        }
      });
      console.log('Payload enviado a putEmpresa:', payload);
      await putEmpresa(payload);
      setShowSuccess(true);
    } catch (error) {
      alert('Error al actualizar la empresa');
      console.error('Error al actualizar empresa:', error);
    }
  };

  const handleAddGrupo = () => {
    if (nuevoGrupo.trim()) {
      setGrupos(prev => [...prev, nuevoGrupo.trim()]);
      setFormData(prev => ({ ...prev, nameGroup: nuevoGrupo.trim() }));
      setNuevoGrupo('');
      setMostrarInputGrupo(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 flex  items-center justify-center bg-black bg-opacity-30 z-50">
        <div className="bg-white py-6 px-14 rounded-lg shadow-lg w-[800px] max-h-[90vh] overflow-y-auto relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold focus:outline-none"
            aria-label="Cerrar"
          >
            ×
          </button>
          <h2 className="text-xl font-bold mb-4 text-gray-800 pt-4">Actualizar Empresa</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div className="col-span-2 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 ">Código Entidad</label>
                <input
                  type="text"
                  name="codeEntity"
                  value={formData.codeEntity}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md px-2 py-1 border border-gray-200 shadow-sm focus:border-[#285398] focus:ring-0 bg-gray-50 text-gray-600 transition-colors outline-none"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo Entidad</label>
                <input
                  type="text"
                  name="typeEntity"
                  value={formData.typeEntity}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:border-[#285398] focus:ring-0 px-2 py-1 bg-white hover:bg-gray-50 transition-colors outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">RUC</label>
              <input
                type="text"
                name="ruc"
                value={formData.ruc}
                onChange={handleChange}
                disabled={true}
                className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:border-[#285398] focus:ring-0 px-2 py-1 bg-white hover:bg-gray-50 transition-colors outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Razón Social</label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:border-[#285398] focus:ring-0 px-2 py-1 bg-white hover:bg-gray-50 transition-colors outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre Comercial</label>
              <input
                type="text"
                name="commercialName"
                value={formData.commercialName}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:border-[#285398] focus:ring-0 px-2 py-1 bg-white hover:bg-gray-50 transition-colors outline-none"
              />
            </div>

            <div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Provincia</label>
                  <select
                    name="province"
                    value={provinciaSeleccionada}
                    onChange={handleProvinciaChange}
                    className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:border-[#285398] focus:ring-0 px-2 py-1 bg-white hover:bg-gray-50 transition-colors outline-none disabled:bg-gray-100 disabled:cursor-not-allowed disabled:border-gray-200"
                  >
                    <option value="">Seleccione una provincia</option>
                    {provincias.map(provincia => (
                      <option key={provincia.id} value={provincia.nombre}>
                        {provincia.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ciudad</label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    disabled={!formData.province}
                    className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:border-[#285398] focus:ring-0 px-2 py-1 bg-white hover:bg-gray-50 transition-colors outline-none disabled:bg-gray-100 disabled:cursor-not-allowed disabled:border-gray-200"
                  >
                    <option value="">Seleccione una ciudad</option>
                    {ciudadesDisponibles.map(ciudad => (
                      <option key={ciudad} value={ciudad}>
                        {ciudad}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Dirección</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-2 py-1 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Teléfono</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:border-[#285398] focus:ring-0 px-2 py-1 bg-white hover:bg-gray-50 transition-colors outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:border-[#285398] focus:ring-0 px-2 py-1 bg-white hover:bg-gray-50 transition-colors outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Actividad Económica</label>
              <input
                type="text"
                name="economicActivity"
                value={formData.economicActivity}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:border-[#285398] focus:ring-0 px-2 py-1 bg-white hover:bg-gray-50 transition-colors outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Comprobante de Venta</label>
              <input
                type="text"
                name="salesReceipt"
                value={formData.salesReceipt}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:border-[#285398] focus:ring-0 px-2 py-1 bg-white hover:bg-gray-50 transition-colors outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Régimen Tributario</label>
              <input
                type="text"
                name="taxRegime"
                value={formData.taxRegime}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:border-[#285398] focus:ring-0 px-2 py-1 bg-white hover:bg-gray-50 transition-colors outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Leyenda de Régimen</label>
              <input
                type="text"
                name="regimeLegend"
                value={formData.regimeLegend}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:border-[#285398] focus:ring-0 px-2 py-1 bg-white hover:bg-gray-50 transition-colors outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre Grupo</label>
              <div className="flex gap-2">
                <select
                  name="nameGroup"
                  value={formData.nameGroup}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:border-[#285398] focus:ring-0 px-2 py-1 bg-white hover:bg-gray-50 transition-colors outline-none"
                >
                  <option value="">Seleccione un grupo</option>
                  {grupos.map((grupo, index) => (
                    <option key={index} value={grupo}>{grupo}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setMostrarInputGrupo(true)}
                  className="mt-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center"
                  title="Añadir nuevo grupo"
                >
                  +
                </button>
              </div>
              {mostrarInputGrupo && (
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={nuevoGrupo}
                    onChange={(e) => setNuevoGrupo(e.target.value)}
                    placeholder="Nombre del nuevo grupo"
                    className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:border-[#285398] focus:ring-0 px-2 py-1 bg-white hover:bg-gray-50 transition-colors outline-none"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddGrupo()}
                  />
                  <button
                    type="button"
                    onClick={handleAddGrupo}
                    className="mt-1 px-3 py-1 bg-[#285398] text-white rounded hover:bg-[#4472c4]"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMostrarInputGrupo(false);
                      setNuevoGrupo('');
                    }}
                    className="mt-1 px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>

            <div className="col-span-2 flex items-center gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="matrix"
                  checked={formData.matrix}
                  value={formData.matrix}
                  disabled={true}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-200 text-[#285398] focus:ring-[#285398] focus:ring-1"
                />
                <label className="ml-2 block text-sm text-gray-700">Matriz</label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="keepsAccounting"
                  checked={formData.keepsAccounting}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-200 text-[#285398] focus:ring-[#285398] focus:ring-1"
                />
                <label className="ml-2 block text-sm text-gray-700">Lleva Contabilidad</label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="retentionAgent"
                  checked={formData.retentionAgent}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-200 text-[#285398] focus:ring-[#285398] focus:ring-1"
                />
                <label className="ml-2 block text-sm text-gray-700">Es Agente Retención</label>
              </div>
            </div>

            <div className="col-span-2 flex justify-end gap-2 mt-4">
              <button
                type="submit"
                className="px-4 py-2 bg-[#1e4e9c] text-white font-bold rounded hover:bg-blue-700"
              >
                Actualizar
              </button>
            </div>
          </form>
        </div>
      </div>
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center">
            <svg className="text-green-500 mb-4" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
            <div className="text-xl font-bold mb-2 text-green-700">¡Empresa actualizada correctamente!</div>
            <button
              className="mt-4 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold"
              onClick={() => { setShowSuccess(false); onClose(); }}
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </>
  );
} 