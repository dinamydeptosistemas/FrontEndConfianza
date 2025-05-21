import React, { useEffect, useState, useCallback } from 'react';
import { getEmpresas, deleteEmpresa } from '../../services/company/CompanyService';
import ManagementDashboardLayout from '../../layouts/ManagementDashboardLayout';
import GenericTable from '../../components/common/GenericTable';
import ButtonGroup from '../../components/common/ButtonGroup';
import ConfirmEliminarModal from '../../components/common/ConfirmEliminarModal';
import SearchBar from '../../components/common/SearchBar';
import EmpresaUpdateModal from '../../components/empresa/EmpresaUpdateModal';
import EmpresaCreateModal from '../../components/empresa/EmpresaCreateModal';
import { useAuth } from '../../contexts/AuthContext';
import Paginador from '../../components/common/Paginador';

export default function EmpresasDashboard() {
  const { user, negocio } = useAuth();
  const [empresasOriginales, setEmpresasOriginales] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [filtroActivo, setFiltroActivo] = useState('');
  const [empresaAEliminar, setEmpresaAEliminar] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [empresaAEditar, setEmpresaAEditar] = useState(null);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [mostrarModalCreacion, setMostrarModalCreacion] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);


  const cargarEmpresas = useCallback(async (pagina = 1, filtroBusqueda = '') => {
    const params = { page: pagina };
    if (filtroBusqueda) {
      params.searchTerm = filtroBusqueda;
    }
    const data = await getEmpresas(params);
    setEmpresasOriginales(data.companies || []);
    setEmpresas(data.companies || []);
    setPaginaActual(pagina);
    setTotalPaginas(data.totalPages || 1);
  }, []);

  useEffect(() => {
    cargarEmpresas(1, '');
  }, [cargarEmpresas]);

  const buscarEnEmpresas = (empresasArr, filtro) => {
    if (!filtro) return empresasArr;
    return empresasArr.filter(e =>
      (e.businessName && e.businessName.toLowerCase().includes(filtro.toLowerCase())) ||
      (e.ruc && e.ruc.toLowerCase().includes(filtro.toLowerCase())) ||
      (e.commercialName && e.commercialName.toLowerCase().includes(filtro.toLowerCase()))
    );
  };

  const handleBuscar = async (nuevoFiltro) => {
    setFiltro(nuevoFiltro);
    setFiltroActivo(nuevoFiltro);
    if (!nuevoFiltro) {
      cargarEmpresas(1, '');
      return;
    }
    let pagina = 1;
    let encontrados = buscarEnEmpresas(empresasOriginales, nuevoFiltro);
    let empresasAcumuladas = [...empresasOriginales];
    let totalPaginasLocal = totalPaginas;
    while (encontrados.length === 0 && (pagina < totalPaginasLocal || empresasAcumuladas.length === 0)) {
      pagina++;
      try {
        const data = await getEmpresas({ page: pagina });
        if (data.companies && data.companies.length > 0) {
          empresasAcumuladas = [...empresasAcumuladas, ...data.companies];
          setEmpresasOriginales(empresasAcumuladas);
          totalPaginasLocal = data.totalPages || totalPaginasLocal;
          encontrados = buscarEnEmpresas(empresasAcumuladas, nuevoFiltro);
        } else {
          break;
        }
      } catch (error) {
        console.error('Error al buscar empresas:', error);
        alert('Error al buscar empresas. Por favor, intente nuevamente.');
        return;
      }
    }
    setEmpresas(encontrados);
    setPaginaActual(1);
    setTotalPaginas(1);
  };

  const handleDeleteClick = (empresa) => {
    console.log('Empresa seleccionada para eliminar:', {
      codeEntity: empresa.codeEntity,
      businessName: empresa.businessName,
      ruc: empresa.ruc,
      empresaCompleta: empresa
    });
    setEmpresaAEliminar(empresa);
    setMostrarModal(true);
  };

  const handleConfirmDelete = async () => {
    const codeEntity = empresaAEliminar?.codeEntity;
    if (codeEntity) {
      console.log('Intentando eliminar empresa con codeEntity:', codeEntity);
      try {
        await deleteEmpresa(codeEntity);
        console.log('Llamada a deleteEmpresa completada para:', codeEntity);

        console.log('Recargando lista de empresas...');
        const data = await getEmpresas();
        console.log('Empresas recibidas después de eliminar:', data.companies);

        setEmpresasOriginales(data.companies || []);
        const filtroActual = filtroActivo;
        if (!filtroActual) {
          setEmpresas(data.companies || []);
        } else {
          const filtradas = (data.companies || []).filter(e =>
            (e.businessName && e.businessName.toLowerCase().includes(filtroActual.toLowerCase())) ||
            (e.ruc && e.ruc.toLowerCase().includes(filtroActual.toLowerCase()))
          );
          setEmpresas(filtradas);
        }
        
      } catch (error) {
        console.error('Error durante el proceso de eliminación:', error);
        alert(`Error al eliminar la empresa: ${error.message || 'Error desconocido. Revisa la consola para más detalles.'}`);
      } finally {
        console.log('Cerrando modal y reseteando empresaAEliminar.');
        setEmpresaAEliminar(null);
        setMostrarModal(false);
      }
    } else {
      console.warn('handleConfirmDelete llamado sin codeEntity válido:', empresaAEliminar);
      alert('No se ha seleccionado una empresa para eliminar o falta el identificador.');
      setMostrarModal(false);
    }
  };

  const handleCancelDelete = () => {
    setEmpresaAEliminar(null);
    setMostrarModal(false);
  };

  const handleEditClick = (empresa) => {
    setEmpresaAEditar(empresa);
    setMostrarModalEdicion(true);
  };

  const handleUpdateEmpresa = async (empresaActualizada) => {
    try {
      const data = await getEmpresas({ page: paginaActual });
      setEmpresasOriginales(data.companies || []);
      setEmpresas(data.companies || []);
      handleBuscar(filtroActivo);
      setEmpresaAEditar(null);
      setMostrarModalEdicion(false);
    } catch (error) {
      console.error('Error al actualizar la empresa:', error);
      alert('Error al actualizar la empresa. Por favor, intente nuevamente.');
    }
  };

  const handleSaveEmpresa = async (nuevaEmpresa) => {
    try {
      const data = await getEmpresas({ page: paginaActual });
      setEmpresasOriginales(data.companies || []);
      setEmpresas(data.companies || []);
      handleBuscar(filtroActivo);
      setMostrarModalCreacion(false);
    } catch (error) {
      console.error('Error al crear la empresa:', error);
      alert('Error al crear la empresa. Por favor, intente nuevamente.');
    }
  };

  return (
    <ManagementDashboardLayout title="EMPRESAS / NEGOCIOS" user={user} negocio={negocio}>


        
      <div className="bg-white border-white border-l border-r  rounded-b p-2 w-full">
        <div className="grid grid-cols-3 items-center gap-2 mb-4 min-h-[48px]">
          <div>
            <ButtonGroup
              buttons={[{
                label: 'Nuevo',
                onClick: () => setMostrarModalCreacion(true),
                variant: 'normal',
                className: 'bg-white border-[#1e4e9c] border px-8 py-1 font-bold hover:text-white hover:bg-[#1e4e9c]'
              }]}
            />
          </div>
          <div className="flex justify-center">
            <Paginador
              paginaActual={paginaActual}
              totalPaginas={totalPaginas}
              onPageChange={(p) => cargarEmpresas(p, filtroActivo)}
            />
          </div>
          <div className='flex justify-end items-center gap-2'>
            {filtroActivo && (
              <span className="bg-gray-200 px-2 py-1 rounded flex items-center ml-4">
                {filtroActivo}
                <button
                  onClick={() => { setFiltro(''); setFiltroActivo(''); handleBuscar(''); }}
                  className="ml-1 text-red-500 hover:text-red-700 font-bold"
                  aria-label="Limpiar búsqueda"
                  style={{ fontSize: '1.1em', lineHeight: 1 }}
                >
                  ×
                </button>
              </span>
            )}
            <SearchBar
              onSearch={handleBuscar}
              value={filtro}
              onChange={setFiltro}
              placeholder="Buscar por RUC o nombre de empresa..."
              className="w-[300px]"
              debounceTime={300}
            />
          </div>
        </div>
        <GenericTable
        columns={[
          { key: 'codeEntity', label: 'Codigo Entidad' },
          { key: 'typeEntity', label: 'Tipo Entidad' },
          { key: 'matrix', label: 'Matr', render: (row) => typeof row.matrix === 'boolean' ? (row.matrix ? 'SI' : 'NO') : '-' },
          { key: 'typeEntity', label: 'Tipo Contribuyente' },
          { key: 'ruc', label: 'Ruc' },
          { key: 'businessName', label: 'Razon Social' },
          { key: 'commercialName', label: 'Nombre Comercial' },
          { key: 'city', label: 'Ciudad' },
          { key: 'phone', label: 'Telefono' },
          { key: 'email', label: 'Email' },
          { key: 'economicActivity', label: 'Actividad Económica' },
          { key: 'salesReceipt', label: 'Comprobante de Venta' },
          { key: 'taxRegime', label: 'Régimen Tributario' },
          { key: 'regimeLegend', label: 'Leyenda de Régimen' },
          { key: 'keepsAccounting', label: 'Mantiene Contabilidad', render: (row) => typeof row.keepsAccounting === 'boolean' ? (row.keepsAccounting ? 'SI' : 'NO') : '-' },
          { key: 'retentionAgent', label: 'Agente Retención', render: (row) => typeof row.retentionAgent === 'boolean' ? (row.retentionAgent ? 'SI' : 'NO') : '-' },
          { key: 'nameGroup', label: 'Nombre Grupo' },
        ]}
        data={empresas}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        rowKey="codeEntity"
      />
      <ConfirmEliminarModal
        isOpen={mostrarModal}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        mensaje={`¿Está seguro que desea eliminar la empresa${empresaAEliminar ? ` "${empresaAEliminar.businessName || empresaAEliminar.nombre || ''}${empresaAEliminar.ruc ? ' (RUC: ' + empresaAEliminar.ruc + ')' : ''}"` : ''}?`}
      />
      {mostrarModalEdicion && (
        <EmpresaUpdateModal
          empresa={empresaAEditar}
          onClose={() => {
            setEmpresaAEditar(null);
            setMostrarModalEdicion(false);
          }}
          onUpdate={handleUpdateEmpresa}
        />
      )}
      {mostrarModalCreacion && (
        <EmpresaCreateModal
          onClose={() => setMostrarModalCreacion(false)}
          onSave={handleSaveEmpresa}
        />
      )}
    </div>
    </ManagementDashboardLayout>
  );
}