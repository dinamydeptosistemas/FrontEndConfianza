import React, { useEffect, useState } from 'react';
import { getEmpresas, deleteEmpresa } from '../../services/company/CompanyService';
import EmpresasTable from '../../components/empresa/EmpresasTable';
import EmpresasBotonera from '../../components/empresa/EmpresasBotonera';
import EmpresasBuscar from '../../components/empresa/EmpresasBuscar';
import { useNavigate } from 'react-router-dom';

export default function EmpresasDashboard() {
  const [empresas, setEmpresas] = useState([]);
  const [filtro, setFiltro] = useState('');
  const navigate = useNavigate();

  const cargarEmpresas = async (filtro = '') => {
    const params = filtro ? { businessName: filtro } : {};
    const data = await getEmpresas(params);
    setEmpresas(data.companies || []);
  };

  useEffect(() => {
    cargarEmpresas();
  }, []);

  const handleBuscar = (filtro) => {
    setFiltro(filtro);
    cargarEmpresas(filtro);
  };

  const handleDelete = async (codeCompany) => {
    await deleteEmpresa(codeCompany);
    cargarEmpresas(filtro);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-2">
        <div>
          <span className="font-bold text-gray-700">EMPRESA:</span> <span className="text-gray-800">PINTURAS ROSENVELL</span>
        </div>
        <div>
          <span className="font-bold text-gray-700">PERIODO:</span> <span className="text-gray-800">2025</span>
        </div>
      </div>
      <div className="mb-2">
        <span className="font-bold text-gray-700">USER:</span> <span className="text-gray-800">XAVIER</span>
      </div>
      <div className="flex gap-2 mb-4">
        <button className="bg-white border px-3 py-1 rounded">Empresa</button>
        <button className="bg-white border px-3 py-1 rounded">Perfil Acceso</button>
        <button className="bg-white border px-3 py-1 rounded">Usuario</button>
        <button className="bg-white border px-3 py-1 rounded">Permiso</button>
        <button className="bg-white border px-3 py-1 rounded">Bitacora</button>
        <button className="bg-white border px-3 py-1 rounded">User Activos</button>
        <button className="ml-auto bg-orange-500 text-white px-4 py-1 rounded" onClick={() => navigate('/dashboard-internal')}>SALIR</button>
      </div>
      <div className="bg-blue-900 text-white text-lg font-bold px-4 py-2 rounded-t">EMPRESAS / NEGOCIOS:</div>
      <div className="bg-white border-b border-l border-r border-gray-300 rounded-b p-4">
        <EmpresasBotonera
          onNueva={() => alert('Funcionalidad Nueva')}
          onEditar={() => alert('Funcionalidad Editar')}
          onBorrar={() => alert('Selecciona una empresa para borrar')}
        />
        <EmpresasBuscar onBuscar={handleBuscar} />
        <EmpresasTable empresas={empresas} onEdit={() => {}} onDelete={handleDelete} />
      </div>
    </div>
  );
} 