import React, { useState, useEffect } from 'react';
import { provincias, ciudadesPorProvincia } from '../../data/ecuadorLocations';
import { putEmpresa } from '../../services/company/CompanyService';
import ActionButtons, { LoadingOverlay } from '../common/Buttons';
/**
 * Modal para crear empresa.
 * @param {function} onClose - Cierra el modal
 * @param {function} onSave - Refresca la lista tras crear
 * @param {function} onSuccess - (opcional) Muestra mensaje de éxito global
 */
export default function EmpresaCreateModal({ onClose, onSave, onSuccess }) {
  const [formData, setFormData] = useState({
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
    nameGroup: '',
    state: 0 // 0 = INACTIVO, 1 = ACTIVO
  });

  const [mostrarInputGrupo, setMostrarInputGrupo] = useState(false);
  const [nuevoGrupo, setNuevoGrupo] = useState('');
  const [grupos, setGrupos] = useState([
    'Grupo A',
    'Grupo B',
    'Grupo C'
    // TODO: Cargar grupos desde el backend
  ]);

  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState('');
  const [ciudadesDisponibles, setCiudadesDisponibles] = useState([]);
const [loading, setLoading] = useState(false);


  useEffect(() => {
    setProvinciaSeleccionada(formData.province);
  }, [formData.province]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (name === 'state' ? (checked ? 1 : 0) : checked) : value
    }));
  };

  const handleProvinciaChange = (e) => {
    const provincia = e.target.value;
    setProvinciaSeleccionada(provincia);
    setCiudadesDisponibles(ciudadesPorProvincia[provincia] || []);
    setFormData(prev => ({ ...prev, province: provincia, city: '' })); // Guardar provincia y resetear ciudad
  };

  const handleAddGrupo = () => {
    if (nuevoGrupo.trim()) {
      setGrupos(prev => [...prev, nuevoGrupo.trim()]);
      setFormData(prev => ({ ...prev, nameGroup: nuevoGrupo.trim() }));
      setNuevoGrupo('');
      setMostrarInputGrupo(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await putEmpresa(formData);
      if (typeof onSuccess === 'function') {
        onSuccess('¡Empresa creada correctamente!');
      }
      if (typeof onSave === 'function') {
        onSave();
      }
    } catch (error) {
      alert('Error al crear la empresa');
    }
  };

  const isFormValid = () => {
    // Implementar lógica para validar el formulario
    return true;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white py-6 px-10 rounded-lg shadow-lg w-[750px] max-h-[90vh] overflow-y-auto relative">
        {/* Overlay de carga */}
        {loading && <LoadingOverlay isLoading={true } message="Guardando empresa..." />}
        

        <div className="grid grid-cols-2 items-center ">
          <h2 className="text-2xl font-bold text-gray-800 mt-6">Nueva Empresa</h2>
          <div className="flex justify-end gap-3 mr-[25px] mb-2">
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

          {/* Row 2: Checkbox + Estado */}
          <div className="flex items-center h-10">
          <div className={`inline-flex px-4 py-2 text-[1rem] rounded-full text-xs font-medium ${formData.state === 1 ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}> 
              {formData.state === 1 ? 'ACTIVO' : 'INACTIVO'}
            </div>
          </div>
          <div className="flex items-center h-10">
        

            <label className="text-sm text-gray-700 font-medium">Es Activo</label>
            <input
              type="checkbox"
              name="state"
              checked={formData.state === 1}
              onChange={handleChange}
              className="h-4 w-4 ml-2 rounded border-gray-200 text-blue-600 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Row 2: RUC + Nombre Comercial */}
          <div>
            <label className="block text-sm font-medium text-gray-700">RUC</label>
            <input
              type="text"
              name="ruc"
              value={formData.ruc}
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

          {/* Row 3: Tipo Entidad + Razón Social */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo Entidad</label>
            <select
              name="typeEntity"
              value={formData.typeEntity}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:border-[#285398] focus:ring-0 px-2 py-1 bg-white hover:bg-gray-50 transition-colors outline-none"
              required
            >
              <option value="">Seleccione tipo</option>
              <option value="Empresa">Empresa</option>
              <option value="Negocio">Negocio</option>
            </select>
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

          {/* Row 4: Provincia/Ciudad + Dirección */}
          <div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Provincia</label>
                <select
                  name="province"
                  value={provinciaSeleccionada}
                  onChange={handleProvinciaChange}
                  className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:border-[#285398] focus:ring-0 px-2 py-1 bg-white hover:bg-gray-50 transition-colors outline-none"
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
              className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:border-[#285398] focus:ring-0 px-2 py-1 bg-white hover:bg-gray-50 transition-colors outline-none"
            />
          </div>

          {/* Row 5: Teléfono + Email */}
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

          {/* Row 6: Actividad Económica + Comprobante de Venta */}
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

          {/* Row 7: Régimen Tributario + Leyenda de Régimen */}
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

          {/* Row 8: Nombre Grupo + Es Matriz */}
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
                {grupos.map((grupo, idx) => (
                  <option key={idx} value={grupo}>{grupo}</option>
                ))}
              </select>
              <button
                type="button"
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => setMostrarInputGrupo(true)}
              >
                Nuevo
              </button>
            </div>
            {mostrarInputGrupo && (
              <div className="flex mt-2 gap-2">
                <input
                  type="text"
                  value={nuevoGrupo}
                  onChange={e => setNuevoGrupo(e.target.value)}
                  className="block w-full rounded-md border border-gray-200 px-2 py-1"
                />
                <button
                  type="button"
                  className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                  onClick={handleAddGrupo}
                >
                  Agregar
                </button>
              </div>
            )}
          </div>

          {/* Row final: Checkboxes, en 3 columnas */}
          <div className="col-span-2">
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center h-10">
                <input
                  type="checkbox"
                  name="matrix"
                  checked={formData.matrix}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-200 text-blue-600 focus:ring-blue-500 outline-none"
                />
                <label className="ml-2 block text-sm text-gray-700">Es Matriz</label>
              </div>
              <div className="flex items-center h-10">
                <input
                  type="checkbox"
                  name="keepsAccounting"
                  checked={formData.keepsAccounting}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-200 text-blue-600 focus:ring-blue-500 outline-none"
                />
                <label className="ml-2 block text-sm text-gray-700">Lleva Contabilidad</label>
              </div>
              <div className="flex items-center h-10">
                <input
                  type="checkbox"
                  name="retentionAgent"
                  checked={formData.retentionAgent}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-200 text-blue-600 focus:ring-blue-500 outline-none"
                />
                <label className="ml-2 block text-sm text-gray-700">Es Agente Retención</label>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  
  );
}