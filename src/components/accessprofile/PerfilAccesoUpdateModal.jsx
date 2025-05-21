import React, { useState, useEffect } from 'react';

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
    cashRegister001: false,
    cashRegister002: false,
    cashRegister003: false,
    cashRegister004: false,
    externalModules: false
  });
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (perfil) {
      setFormData({
        functionName: perfil.functionName || '',
        grantPermissions: perfil.grantPermissions || false,
        allModules: perfil.allModules || false,
        administration: perfil.administration || false,
        product: perfil.product || false,
        inventory: perfil.inventory || false,
        purchase: perfil.purchase || false,
        sale: perfil.sale || false,
        cashRegister: perfil.cashRegister || false,
        bank: perfil.bank || false,
        accounting: perfil.accounting || false,
        payroll: perfil.payroll || false,
        generalCash: perfil.generalCash || false,
        closeCashGen: perfil.closeCashGen || false,
        cashRegister001: perfil.cashRegister001 || false,
        cashRegister002: perfil.cashRegister002 || false,
        cashRegister003: perfil.cashRegister003 || false,
        cashRegister004: perfil.cashRegister004 || false,
        externalModules: perfil.externalModules || false
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
      await onUpdate({ ...perfil, ...formData });
      setShowSuccess(true);
    } catch (error) {
      alert('Error al actualizar el perfil de acceso');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white py-6 px-14 rounded-lg shadow-lg w-[800px] max-h-[90vh] overflow-y-auto relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold focus:outline-none"
          aria-label="Cerrar"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4 text-gray-800 pt-4">Editar Perfil de Acceso</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
          <div className="col-span-3">
            <label className="block text-sm font-medium text-gray-700">Nombre de Función</label>
            <input
              type="text"
              name="functionName"
              value={formData.functionName}
              onChange={handleChange}
              disabled={true}
              className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:border-[#285398] focus:ring-0 px-2 py-1 bg-gray-100 hover:bg-gray-100 transition-colors outline-none cursor-not-allowed"
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
          <div className="col-span-2 flex justify-end mt-6 space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border-2 border-gray-400 rounded text-base font-semibold hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#285398] text-white rounded hover:bg-[#1e3d6b]"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
        {showSuccess && (
          <div className="text-green-600 font-semibold mt-2">Perfil de acceso actualizado correctamente.</div>
        )}
      </div>
    </div>
  );
} 