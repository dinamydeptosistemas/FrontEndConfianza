import React, { useState, useEffect } from 'react';
import { provincias, ciudadesPorProvincia } from '../../data/ecuadorLocations';
import { putEmpresa } from '../../services/company/CompanyService';
import { useNotification } from '../../context/NotificationContext';
import ActionButtons, { LoadingOverlay } from '../common/Buttons';


/**
 * Modal para editar empresa.
 * @param {object} empresa - Empresa a editar
 * @param {function} onClose - Cierra el modal
 * @param {function} onUpdate - Refresca la lista tras editar
 * @param {function} onSuccess - (opcional) Muestra mensaje de éxito global
 */
export default function EmpresaUpdateModal({ empresa, onClose, onUpdate }) {
  // Usar el contexto de notificaciones global
  const { showSuccessMessage } = useNotification();
  const [loading, setLoading] = useState(false);

  // Estado inicial del formulario
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
    nameGroup: '',
    state: 0 // 0 = INACTIVO, 1 = ACTIVO
  });

  // Estados para manejo de ubicación
  const [ciudadesDisponibles, setCiudadesDisponibles] = useState([]);
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState('');
  
  // Estados para manejo de grupos
  const [mostrarInputGrupo, setMostrarInputGrupo] = useState(false);
  const [nuevoGrupo, setNuevoGrupo] = useState('');
  const [grupos, setGrupos] = useState([
    'Grupo A',
    'Grupo B',
    'Grupo C'
    // TODO: Cargar grupos desde el backend
  ]);



  // Efecto para inicializar datos cuando se recibe la empresa
  useEffect(() => {
    if (empresa) {
      setFormData({
        ...empresa,
        // Asegurar que state sea número (0 o 1)
        state: typeof empresa.state === 'number' ? empresa.state : Number(empresa.state) || 0,
        province: empresa.province || ''
      });

      // Configurar provincia y ciudades disponibles
      if (empresa.city) {
        const provinciaEncontrada = Object.entries(ciudadesPorProvincia).find(
          ([_, ciudades]) => ciudades.includes(empresa.city.toUpperCase())
        );
        
        if (provinciaEncontrada) {
          const [nombreProvincia] = provinciaEncontrada;
          setProvinciaSeleccionada(nombreProvincia);
          setCiudadesDisponibles(ciudadesPorProvincia[nombreProvincia]);
          setFormData(prev => ({ ...prev, province: nombreProvincia }));
        }
      }
    }
  }, [empresa]);

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (name === 'state' ? (checked ? 1 : 0) : checked) 
        : value
    }));
  };

  // Manejar cambio de provincia
  const handleProvinciaChange = (e) => {
    const provincia = e.target.value;
    setProvinciaSeleccionada(provincia);
    setCiudadesDisponibles(ciudadesPorProvincia[provincia] || []);
    
    setFormData(prev => ({ 
      ...prev, 
      province: provincia, 
      city: '' // Resetear ciudad cuando cambia la provincia
    }));
  };

  // Agregar nuevo grupo
  const handleAddGrupo = () => {
    if (nuevoGrupo.trim()) {
      setGrupos(prev => [...prev, nuevoGrupo.trim()]);
      setFormData(prev => ({ ...prev, nameGroup: nuevoGrupo.trim() }));
      setNuevoGrupo('');
      setMostrarInputGrupo(false);
    }
  };

  // Manejar envío del formulario
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      // Construir payload solo con los campos que cambiaron
      const payload = {};
      
      // Mapear codeEntity a codeCompany si existe
      if (formData.codeEntity) {
        payload.codeCompany = formData.codeEntity;
      }
      
      // Comparar y agregar solo campos modificados
      Object.keys(formData).forEach(key => {
        if (key === 'codeEntity') return; // Ya mapeado arriba
        
        if (formData[key] !== empresa[key]) {
          payload[key] = formData[key];
        }
      });
      
      // Convertir state a booleano si existe
      if ('state' in payload) {
        payload.state = payload.state === 1;
      }
      console.log('Payload enviado a putEmpresa:', payload);
      await putEmpresa(payload);
      
      setLoading(false);
      
      // Mostrar mensaje de éxito usando el contexto global
      showSuccessMessage('¡Empresa actualizada exitosamente!');
      
      // Llamar a onUpdate para refrescar la lista en EmpresasDashboard
      if (onUpdate) {
        onUpdate();
      }
      
      // Cerrar modal
      if (onClose) {
        onClose();
      }
      
    } catch (error) {
      setLoading(false);
      alert('Error al actualizar la empresa');
      console.error('Error al actualizar empresa:', error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white py-6 px-10 rounded-lg shadow-lg w-[750px] max-h-[90vh] overflow-y-auto relative">
        {/* Overlay de carga */}
        {loading && <LoadingOverlay isLoading={true} message="Actualizando empresa..." />}
        
        {/* Botón cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold focus:outline-none"
          aria-label="Cerrar"
        >
          ×
        </button>

        {/* Header con título y botones */}
        <div className="grid grid-cols-2 items-center mb-2">
          <h2 className="text-2xl font-bold text-gray-800 pt-4">Actualizar Empresa</h2>
          <div className="flex justify-end gap-3 mr-[25px]">
            <ActionButtons 
              onClose={onClose} 
              handleSubmit={handleSubmit} 
              disabled={false} 
              loading={loading}
              loadingText="Actualizando..." 
            />
          </div>
        </div>
        <hr className="col-span-2 border-blue-500 mr-6 m-0 p-0" />

          <form onSubmit={handleSubmit} className="grid mt-5 grid-cols-2 gap-x-4 gap-y-3 relative">
            
            {/* Row 2: Checkbox + Estado */}
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
            <div className="flex items-center h-10">
              <div className={`inline-flex px-4 py-2 text-[1rem] rounded-full text-xs font-medium ${formData.state === 1 ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}> 
                {formData.state === 1 ? 'ACTIVO' : 'INACTIVO'}
              </div>
            </div>
            {/* Row 1: Código Entidad (solo lectura) + Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Código Entidad</label>
              <input
                type="text"
                name="codeEntity"
                value={formData.codeEntity}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md px-2 py-1 border border-gray-200 shadow-sm focus:border-[#285398] focus:ring-0 bg-gray-50 text-gray-600 transition-colors outline-none"
                readOnly
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
                disabled={true}
                className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:border-[#285398] focus:ring-0 px-2 py-1 bg-gray-50 text-gray-600 transition-colors outline-none"
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
              <input
                type="text"
                name="typeEntity"
                value={formData.typeEntity}
                onChange={handleChange}
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

            {/* Row 8: Nombre Grupo */}
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
                    onKeyPress={(e) => e.key === 'Enter' && handleAddGrupo()}
                  />
                  <button
                    type="button"
                    className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                    onClick={handleAddGrupo}
                  >
                    Agregar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMostrarInputGrupo(false);
                      setNuevoGrupo('');
                    }}
                    className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>

            {/* Row final: Checkboxes en 3 columnas */}
            <div className="col-span-2">
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center h-10">
                  <input
                    type="checkbox"
                    name="matrix"
                    checked={formData.matrix}
                    onChange={handleChange}
                    disabled={true}
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