import React, { useEffect, useState, useCallback } from 'react';
import { getEmpresas, deleteEmpresa } from '../../services/company/CompanyService';
import EmpresasTable from './EmpresasTable';
import EmpresasBotonera from './EmpresasBotonera';
import EmpresasBuscar from './EmpresasBuscar';
import EmpresaCreateModal from './EmpresaCreateModal';
import EmpresaUpdateModal from './EmpresaUpdateModal';
import { useNotification } from '../../context/NotificationContext';

export default function EmpresasDashboard() {
  // Usar el contexto de notificaciones global
  const { showSuccessMessage } = useNotification();
  
  // Estado para modal de edición de empresa
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null);

  // Estado para modal de creación de empresa
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Handler para abrir modal de edición
  const handleEditEmpresa = (empresa) => {
    console.log('[EmpresasDashboard] handleEditEmpresa llamada con:', empresa);
    setEmpresaSeleccionada(empresa);
    setShowUpdateModal(true);
  };

  // Handler para cerrar modal de edición
  const handleCloseUpdate = () => {
    setShowUpdateModal(false);
    setEmpresaSeleccionada(null);
  };

  // Handler para refrescar lista tras editar
  const handleUpdateEmpresas = () => {
    cargarEmpresas(filtro);
    showSuccessMessage('¡Empresa actualizada correctamente!');
    handleCloseUpdate();
  };

  // Handler para mostrar mensajes de éxito - ahora usa el contexto global
  const handleShowSuccess = (message) => {
    showSuccessMessage(message);
  };

  // Handler para abrir modal de creación
  const handleOpenCreate = () => setShowCreateModal(true);
  // Handler para cerrar modal de creación
  const handleCloseCreate = () => setShowCreateModal(false);
  // Handler para refrescar lista tras crear
  const handleCreateEmpresa = () => {
    cargarEmpresas(filtro);
    handleCloseCreate();
  };


  const [empresas, setEmpresas] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargarEmpresas = useCallback(async (searchTerm = '') => {
    console.log('Iniciando cargarEmpresas con término:', searchTerm); // Debug
    try {
      setLoading(true);
      setError(null);
      
      // Asegurarnos de que searchTerm sea un string y esté limpio
      const searchTermClean = typeof searchTerm === 'string' ? searchTerm.trim() : '';
      
      // Construir los parámetros de búsqueda
      const params = {
        process: 'getCompanies',
        page: 1 // Siempre incluimos la página
      };

      // Solo agregamos searchTerm si tiene valor
      if (searchTermClean) {
        params.searchTerm = searchTermClean;
      }
      
      console.log('Parámetros de búsqueda:', params); // Debug
      
      const data = await getEmpresas(params);
      console.log('Respuesta del servidor:', data); // Debug
      
      if (data && data.status === 'OK') {
        console.log('Empresas encontradas:', data.companies?.length || 0); // Debug
        setEmpresas(data.companies || []);
      } else {
        const errorMsg = data?.message || 'Error al cargar empresas';
        console.error('Error en la respuesta:', errorMsg); // Debug
        setError(errorMsg);
        setEmpresas([]);
      }
    } catch (error) {
      console.error('Error detallado al cargar empresas:', error); // Debug
      if (error.response) {
        console.error('Respuesta del servidor:', error.response.data); // Debug
        console.error('Status:', error.response.status); // Debug
      }
      setError('Error al cargar empresas. Por favor, intente nuevamente.');
      setEmpresas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar empresas al montar el componente
  useEffect(() => {
    console.log('Componente montado, cargando empresas iniciales'); // Debug
    cargarEmpresas();
  }, [cargarEmpresas]);

  const handleBuscar = useCallback((searchTerm) => {
    console.log('handleBuscar llamado con término:', searchTerm); // Debug
    if (typeof searchTerm !== 'string') {
      console.error('searchTerm no es un string:', searchTerm); // Debug
      return;
    }
    setFiltro(searchTerm);
    cargarEmpresas(searchTerm);
  }, [cargarEmpresas]);

  const handleDelete = useCallback(async (codeCompany) => {
    try {
      console.log('Eliminando empresa:', codeCompany); // Debug
      await deleteEmpresa(codeCompany);
      console.log('Empresa eliminada, recargando lista...'); // Debug
      cargarEmpresas(filtro);
    } catch (error) {
      console.error('Error al eliminar empresa:', error);
      setError('Error al eliminar la empresa');
    }
  }, [cargarEmpresas, filtro]);

  return (
    <>
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
          <button className="ml-auto bg-orange-500 text-white px-4 py-1 rounded">SALIR</button>
        </div>
        <div className="bg-blue-900 text-white text-lg font-bold px-4 py-2 rounded-t">EMPRESAS / NEGOCIOS:</div>
        <div className="bg-white border-b border-l border-r border-gray-300 rounded-b p-4">
          <EmpresasBotonera
            onNueva={handleOpenCreate}
            onEditar={() => alert('Funcionalidad Editar')}
            onBorrar={() => alert('Selecciona una empresa para borrar')}
          />
          <EmpresasBuscar onBuscar={handleBuscar} />
          {loading && (
            <div className="text-center py-2">
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
              <span className="ml-2">Cargando...</span>
            </div>
          )}
          {error && (
            <div className="text-red-500 py-2 px-4 bg-red-50 rounded border border-red-200">
              {error}
            </div>
          )}
          {!loading && !error && empresas.length === 0 && (
            <div className="text-center py-4 text-gray-500 bg-gray-50 rounded border border-gray-200">
              No se encontraron empresas
            </div>
          )}
          {showCreateModal && (
            <EmpresaCreateModal
              onClose={handleCloseCreate}
              onSave={handleCreateEmpresa}
              onSuccess={handleShowSuccess}
            />
          )}
          {showUpdateModal && (
            <>
              {console.log('[EmpresasDashboard] Renderizando EmpresaUpdateModal con:', empresaSeleccionada)}
              <EmpresaUpdateModal
                empresa={empresaSeleccionada}
                onClose={handleCloseUpdate}
                onUpdate={handleUpdateEmpresas}
              />
            </>
          )}
          <EmpresasTable 
            empresas={empresas} 
            onEdit={(empresa) => {
              console.log('[EmpresasDashboard] Editando empresa:', empresa);
              handleEditEmpresa(empresa);
            }} 
            onDelete={handleDelete}
          />
        </div>
      </div>
    </>
  );
}