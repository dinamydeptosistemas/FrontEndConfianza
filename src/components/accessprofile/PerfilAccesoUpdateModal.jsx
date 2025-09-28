import React, { useState, useEffect } from 'react';
import SuccessModal from '../common/SuccessModal';
import ActionButtons, { LoadingOverlay } from '../common/Buttons';



export default function PerfilAccesoUpdateModal({ onClose, onUpdate, perfil }) {
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
    fixedAsset: false,
    cashRegister001: false,
    cashRegister002: false,
    cashRegister003: false,
    cashRegister004: false,
    externalModules: false
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  // Importa SuccessModal
  // (importación agregada arriba)


  useEffect(() => {
    if (perfil) {
      let activoFijo = perfil.fixedAsset !== undefined ? perfil.fixedAsset : perfil.FixedAsset;
      if (typeof activoFijo === 'string') {
        activoFijo = activoFijo === 'true' || activoFijo === '1';
      } else if (typeof activoFijo === 'number') {
        activoFijo = activoFijo === 1;
      } else {
        activoFijo = Boolean(activoFijo);
      }
      setFormData({
        idFunction: perfil.idFunction,
        functionName: perfil.functionName || '',
        grantPermissions: !!perfil.grantPermissions,
        allModules: !!perfil.allModules,
        administration: !!perfil.administration,
        product: !!perfil.product,
        inventory: !!perfil.inventory,
        purchase: !!perfil.purchase,
        sale: !!perfil.sale,
        cashRegister: !!perfil.cashRegister,
        bank: !!perfil.bank,
        accounting: !!perfil.accounting,
        payroll: !!perfil.payroll,
        generalCash: !!perfil.generalCash,
        closeCashGen: !!perfil.closeCashGen,
        fixedAsset: !!perfil.fixedAsset,
        cashRegister001: !!perfil.cashRegister001,
        cashRegister002: !!perfil.cashRegister002,
        cashRegister003: !!perfil.cashRegister003,
        cashRegister004: !!perfil.cashRegister004,
        externalModules: !!perfil.externalModules
      });
    }
  }, [perfil]);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onUpdate({ ...perfil, ...formData });
      setLoading(false);
      setShowSuccess(true);
    } catch (error) {
      alert('Error al actualizar el perfil de acceso');
    }
  };

  const isFormValid = () => {
    return formData.functionName.trim() !== '';
  };

  const isEditBlocked = formData.idFunction === 1;

  return (
    <>
      {showSuccess && (
        <SuccessModal
          message="¡Perfil de acceso actualizado correctamente!"
          onClose={() => { setShowSuccess(false); onClose(); }}
        />
      )}
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white py-6 px-10 rounded-lg shadow-lg w-[750px] max-h-[90vh] overflow-y-auto relative">
        {/* Overlay de carga */}
        {loading && <LoadingOverlay isLoading={true} message="Actualizando perfil de acceso..." />}
        
        {/* Header con título y botones */}
        <div className="grid grid-cols-2 items-center ">
          <h2 className="text-2xl font-bold text-gray-800 mt-6">Editar Perfil de Acceso</h2>
          <div className="flex justify-end gap-3 mr-[25px] mb-2">
            <ActionButtons 
              onClose={onClose} 
              handleSubmit={handleSubmit} 
              disabled={!isFormValid() || isEditBlocked} 
              loading={loading}
              loadingText="Actualizando..." 
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
              disabled={isEditBlocked}
              className={`mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:border-[#285398] focus:ring-0 px-2 py-1 transition-colors outline-none ${isEditBlocked ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Permisos Generales</label>
            <input
              type="checkbox"
              name="grantPermissions"
              checked={formData.grantPermissions}
              onChange={handleChange}
              disabled={isEditBlocked}
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
              disabled={isEditBlocked}
              className="mt-1 h-4 w-4 text-[#285398] focus:ring-[#285398] border-gray-300 rounded"
            />
          </div>
             <div>
            <label className="block text-sm font-medium text-gray-700">Módulos Externos</label>
            <input type="checkbox" name="externalModules" checked={formData.externalModules} onChange={handleChange} disabled={isEditBlocked} className="mr-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Administración</label>
            <input type="checkbox" name="administration" checked={formData.administration} onChange={handleChange} disabled={isEditBlocked} className="mr-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Producto</label>
            <input type="checkbox" name="product" checked={formData.product} onChange={handleChange} disabled={isEditBlocked} className="mr-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Inventario</label>
            <input type="checkbox" name="inventory" checked={formData.inventory} onChange={handleChange} disabled={isEditBlocked} className="mr-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Compra</label>
            <input type="checkbox" name="purchase" checked={formData.purchase} onChange={handleChange} disabled={isEditBlocked} className="mr-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Venta</label>
            <input type="checkbox" name="sale" checked={formData.sale} onChange={handleChange} disabled={isEditBlocked} className="mr-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Caja</label>
            <input type="checkbox" name="cashRegister" checked={formData.cashRegister} onChange={handleChange} disabled={isEditBlocked} className="mr-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Banco</label>
            <input type="checkbox" name="bank" checked={formData.bank} onChange={handleChange} disabled={isEditBlocked} className="mr-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contabilidad</label>
            <input type="checkbox" name="accounting" checked={formData.accounting} onChange={handleChange} disabled={isEditBlocked} className="mr-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nómina</label>
            <input type="checkbox" name="payroll" checked={formData.payroll} onChange={handleChange} disabled={isEditBlocked} className="mr-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Caja General</label>
            <input type="checkbox" name="generalCash" checked={formData.generalCash} onChange={handleChange} disabled={isEditBlocked} className="mr-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Cierre Caja Gen.</label>
            <input type="checkbox" name="closeCashGen" checked={formData.closeCashGen} onChange={handleChange} disabled={isEditBlocked} className="mr-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Activo Fijo</label>
            <input type="checkbox" name="fixedAsset" checked={formData.fixedAsset} onChange={handleChange} disabled={isEditBlocked} className="mr-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Caja 001</label>
            <input type="checkbox" name="cashRegister001" checked={formData.cashRegister001} onChange={handleChange} disabled={isEditBlocked} className="mr-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Caja 002</label>
            <input type="checkbox" name="cashRegister002" checked={formData.cashRegister002} onChange={handleChange} disabled={isEditBlocked} className="mr-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Caja 003</label>
            <input type="checkbox" name="cashRegister003" checked={formData.cashRegister003} onChange={handleChange} disabled={isEditBlocked} className="mr-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Caja 004</label>
            <input type="checkbox" name="cashRegister004" checked={formData.cashRegister004} onChange={handleChange} disabled={isEditBlocked} className="mr-2" />
          </div>
       

        </form>
        {showSuccess && (
          <div className="text-green-600 font-semibold mt-2">Perfil de acceso actualizado correctamente.</div>
        )}
      </div>
    </div>
    </>
  );
}