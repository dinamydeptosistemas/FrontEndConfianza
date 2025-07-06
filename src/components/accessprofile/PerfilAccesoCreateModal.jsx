import React, { useState } from 'react';
import SuccessModal from '../common/SuccessModal';
import ActionButtons, { LoadingOverlay } from '../common/Buttons';



export default function PerfilAccesoCreateModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    functionName: '',
    grantPermissions: false,
    allModules: false,
    administration: false,
    product: false,
    inventory: false,
    purchase: false,
    sale: false,
    cashRegister: false,
    bank: false,
    accounting: false,
    payroll: false,
    generalCash: false,
    closeCashGen: false,
    cashRegister001: false,
    cashRegister002: false,
    cashRegister003: false,
    cashRegister004: false,
    externalModules: false
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);


  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      setShowSuccess(true);
    } catch (error) {
      alert('Error al crear el perfil de acceso');
    }
  };

  const isFormValid = () => {
    return formData.functionName.trim() !== '';
  };

  return (
    <>
      {loading && <LoadingOverlay isLoading={true} message="Guardando perfil de acceso..." />}
      {showSuccess && (
        <SuccessModal
          message="¡Perfil de acceso creado correctamente!"
          onClose={() => { setShowSuccess(false); onClose(); }}
        />
      )}
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white py-6 px-10 rounded-lg shadow-lg w-[750px] max-h-[90vh] overflow-y-auto relative">
      <div className="grid grid-cols-2 items-center ">
        <h2 className="text-2xl font-bold text-gray-800 mt-6">Nuevo Perfil de Acceso</h2>
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
          <div className="col-span-3 mb-5">
            <label className="block text-sm font-medium text-gray-700">Nombre de Función</label>
            <input
              type="text"
              name="functionName"
              value={formData.functionName}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:border-[#285398] focus:ring-0 px-2 py-1 bg-white hover:bg-gray-50 transition-colors outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Permisos Generales</label>
            <input
              type="checkbox"
              name="grantPermissions"
              checked={formData.grantPermissions}
              onChange={handleChange}
              className="mt-1 h-4 w-4 text-[#285398] focus:ring-[#285398] border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Todos los Módulos</label>
            <input
              type="checkbox"
              name="allModules"
              checked={formData.allModules}
              onChange={handleChange}
              className="mt-1 h-4 w-4 text-[#285398] focus:ring-[#285398] border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Administración</label>
            <input type="checkbox" name="administration" checked={formData.administration} onChange={handleChange} className="mr-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Producto</label>
            <input type="checkbox" name="product" checked={formData.product} onChange={handleChange} className="mr-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Inventario</label>
            <input type="checkbox" name="inventory" checked={formData.inventory} onChange={handleChange} className="mr-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Compra</label>
            <input type="checkbox" name="purchase" checked={formData.purchase} onChange={handleChange} className="mr-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Venta</label>
            <input type="checkbox" name="sale" checked={formData.sale} onChange={handleChange} className="mr-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Caja</label>
            <input type="checkbox" name="cashRegister" checked={formData.cashRegister} onChange={handleChange} className="mr-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Banco</label>
            <input type="checkbox" name="bank" checked={formData.bank} onChange={handleChange} className="mr-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contabilidad</label>
            <input type="checkbox" name="accounting" checked={formData.accounting} onChange={handleChange} className="mr-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nómina</label>
            <input type="checkbox" name="payroll" checked={formData.payroll} onChange={handleChange} className="mr-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Caja General</label>
            <input type="checkbox" name="generalCash" checked={formData.generalCash} onChange={handleChange} className="mr-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Cierre Caja Gen.</label>
            <input type="checkbox" name="closeCashGen" checked={formData.closeCashGen} onChange={handleChange} className="mr-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Caja 001</label>
            <input type="checkbox" name="cashRegister001" checked={formData.cashRegister001} onChange={handleChange} className="mr-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Caja 002</label>
            <input type="checkbox" name="cashRegister002" checked={formData.cashRegister002} onChange={handleChange} className="mr-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Caja 003</label>
            <input type="checkbox" name="cashRegister003" checked={formData.cashRegister003} onChange={handleChange} className="mr-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Caja 004</label>
            <input type="checkbox" name="cashRegister004" checked={formData.cashRegister004} onChange={handleChange} className="mr-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Módulos Externos</label>
            <input type="checkbox" name="externalModules" checked={formData.externalModules} onChange={handleChange} className="mr-2" />
          </div>
          <div className="col-span-2 flex justify-end mt-2 space-x-4">
      
          </div>
        </form>
        {showSuccess && (
          <div className="text-green-600 font-semibold mt-2">Perfil de acceso creado correctamente.</div>
        )}
      </div>
    </div>
    </>
  );
};
