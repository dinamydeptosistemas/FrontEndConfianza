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
  // Efecto para inicializar datos cuando se recibe la empresa
  useEffect(() => {
    if (empresa && typeof empresa === 'object') {
      setFormData(prev => ({
        ...prev,
        ...empresa,
        // Asegurar que state sea número (0 o 1)
        state: typeof empresa.state === 'number' ? empresa.state : Number(empresa.state) || 0,
        province: empresa.province || ''
      }));

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
    } else {
      // Si la empresa es nula, resetear el formulario a su estado inicial
      setFormData({
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
        state: 0
      });
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
      // Construir payload con todos los campos necesarios
      const payload = {};
      
      // Mapear codeEntity a codeCompany si existe (campo requerido para actualizar)
      if (formData.codeEntity) {
        payload.codeCompany = formData.codeEntity;
      } else {
        console.error('Error: codeEntity/codeCompany es requerido para actualizar');
        throw new Error('Falta el código de empresa para actualizar');
      }
      
      // Campos requeridos por el backend (según documentación)
      const camposRequeridos = ['businessName', 'codeGroup'];
      const camposFaltantes = [];
      
      // Verificar campos requeridos
      camposRequeridos.forEach(campo => {
        if (!formData[campo] && formData[campo] !== 0 && formData[campo] !== false) {
          camposFaltantes.push(campo);
        }
      });
      
      if (camposFaltantes.length > 0) {
        console.error('Error: Faltan campos requeridos:', camposFaltantes);
        throw new Error(`Faltan campos requeridos: ${camposFaltantes.join(', ')}`);
      }
      
      // Agregar todos los campos relevantes, incluso si no cambiaron
      Object.keys(formData).forEach(key => {
        if (key === 'codeEntity') return; // Ya mapeado arriba
        
        // Asegurarse de que los valores vacíos o undefined se envíen como null explícitamente
        if (formData[key] === '' || formData[key] === undefined) {
          payload[key] = null;
        } else {
          payload[key] = formData[key];
        }
      });
      
      // Convertir campos booleanos a su tipo correcto
      const camposBooleanos = ['state', 'matrix', 'keepsAccounting', 'retentionAgent'];
      camposBooleanos.forEach(campo => {
        if (campo in payload) {
          // Asegurarse de que sea un booleano real, no un string
          if (typeof payload[campo] === 'string') {
            payload[campo] = payload[campo].toLowerCase() === 'true';
          } else if (typeof payload[campo] === 'number') {
            payload[campo] = payload[campo] === 1;
          }
        }
      });
      
      // Asegurar que codeGroup sea un número si existe y mayor que 0
      if (payload.codeGroup !== null && payload.codeGroup !== undefined) {
        const codeGroupNum = Number(payload.codeGroup);
        if (!isNaN(codeGroupNum)) {
          payload.codeGroup = codeGroupNum;
          
          // Si codeGroup es 0, establecerlo como 1 (asumiendo que 0 no es válido)
          if (payload.codeGroup === 0) {
            payload.codeGroup = 1;
          }
        }
      }
      console.log('Payload enviado a putEmpresa:', payload);
      await putEmpresa(payload);
      
      setLoading(false);
      
      // Mostrar mensaje de éxito usando el contexto global
      showSuccessMessage('¡Empresa actualizada exitosamente!');
      
      // Cerrar modal primero
      if (onClose) {
        onClose();
      }
      
      // Llamar a onUpdate para refrescar la lista en EmpresasDashboard
      // Pasamos null para evitar que se intente actualizar nuevamente
      if (onUpdate) {
        // Usar setTimeout para asegurar que el modal se cierre primero
        setTimeout(() => {
          onUpdate(null);
        }, 100);
      }
      
    } catch (error) {
      setLoading(false);
      
      // Extraer mensaje de error detallado
      let errorMessage = 'Error al actualizar la empresa';
      
      if (error.response) {
        // El servidor respondió con un código de error
        console.error('Error de respuesta del servidor:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        });
        
        // Intentar obtener mensaje del backend
        if (error.response.data?.message) {
          errorMessage = `Error: ${error.response.data.message}`;
        } else if (typeof error.response.data === 'string') {
          errorMessage = `Error: ${error.response.data}`;
        } else {
          errorMessage = `Error ${error.response.status}: ${error.response.statusText}`;
        }
      } else if (error.request) {
        // La petición fue hecha pero no se recibió respuesta
        console.error('No se recibió respuesta del servidor:', error.request);
        errorMessage = 'No se recibió respuesta del servidor';
      } else {
        // Error al configurar la petición
        console.error('Error de configuración de la petición:', error.message);
        errorMessage = `Error: ${error.message}`;
      }
      
      // Mostrar mensaje de error al usuario
      alert(errorMessage);
      console.error('Error al actualizar empresa:', error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white py-6 px-10 rounded-lg shadow-lg w-[750px] max-h-[90vh] overflow-y-auto relative">
        {/* Overlay de carga */}
        {loading && <LoadingOverlay isLoading={true} message="Actualizando empresa..." />}
        
   

        {/* Header con título y botones */}
        <div className="grid grid-cols-2 items-center ">
          <h2 className="text-2xl font-bold text-gray-800 mt-6">Editar Empresa</h2>
          <div className="flex justify-end gap-3 mr-[25px] mb-2">
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
              <label className="block text-sm font-medium text-gray-700">Nombre Comercial</label>
              <input
                type="text"
                name="commercialName"
                value={formData.commercialName}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:border-[#285398] focus:ring-0 px-2 py-1 bg-white hover:bg-gray-50 transition-colors outline-none"
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
              <label className="block text-sm font-medium text-gray-700">Tipo Comprobante de Venta</label>
              <select
                name="salesReceipt"
                value={formData.salesReceipt}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:border-[#285398] focus:ring-0 px-2 py-1 bg-white hover:bg-gray-50 transition-colors outline-none"
              >
              <option value="">Seleccione...</option>
              <option value="FACTURA">Factura</option>
              <option value="NOTA DE VENTA">Nota de venta - RISE</option>
              <option value="LIQUIDACION DE COMPRA">Liquidacion de compra de bienes y prestación de servicios</option>
              <option value="TICKET">Tiquet emitidos por máquinas registradoras</option>
              <option value="BOLETO">Boleto o entrada a espectáculos públicos</option>
              <option value="DOC">Otro documento</option>
              </select>
            </div>

            {/* Row 7: Régimen Tributario + Leyenda de Régimen */}
           <div>
            <label className="block text-sm font-medium text-gray-700">Régimen Tributario</label>
            <select
              name="taxRegime"
              value={formData.taxRegime}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:border-[#285398] focus:ring-0 px-2 py-1 bg-white hover:bg-gray-50 transition-colors outline-none"
            >
              <option value="">Seleccione...</option>
              <option value="Régimen RIMPE Negocio Popular">Régimen RIMPE Negocio Popular</option>
              <option value="Régimen RIMPE Emprendedor (PN)">Régimen RIMPE Emprendedor (PN)</option>
              <option value="Régimen RIMPE Emprendedor (SOCIEDAD)">Régimen RIMPE Emprendedor (SOCIEDAD)</option>
              <option value="Régimen General">Régimen General</option>
              <option value="Régimen Sociedades">Régimen Sociedades</option>
              <option value="Instituciones de carácter privado sin fines de lucro">Instituciones de carácter privado sin fines de lucro</option>
            </select>
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