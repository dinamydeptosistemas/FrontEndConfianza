import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { getEmpresas } from '../services/company/CompanyService';
import { getUsers } from '../services/user/UserService';
import { saveConfig, uploadLogo as uploadLogoService } from '../services/config/ConfigService';

import { useConfig } from '../contexts/ConfigContext';

const ConfiguracionPage = () => {
  const { config: contextConfig, loading: contextLoading, error: contextError } = useConfig();

  // Estados para controlar qué secciones están abiertas
  const [openCategories, setOpenCategories] = useState({});
  const [openSubcategories, setOpenSubcategories] = useState({});
  const [modoEntidad, setModoEntidad] = useState(true);
  const [tipoEntidad, setTipoEntidad] = useState('NEGOCIO');
  const [gestionGrupo, setGestionGrupo] = useState(true);
  const [tipoGestion, setTipoGestion] = useState('MULTINEGOCIO');
  const [empresas, setEmpresas] = useState([]);
  const [loadingEmpresas, setLoadingEmpresas] = useState(false);
  const [selectedEmpresa, setSelectedEmpresa] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState('');
  const [logoPath, setLogoPath] = useState(''); // Nuevo estado para almacenar la ruta del logo

  const [configuraciones, setConfiguraciones] = useState({
    ambienteTrabajo: {
      checked: true,
      aplicacion: 'TODO_SISTEMA',
      ambiente: 'PRODUCCION',
    },
    eliminarRegistros: {
      checked: true,
      aplicacion: 'TODO_SISTEMA',
      ambiente: 'PRODUCCION',
    },
    respaldos: {
      checked: false,
      aplicacion: 'POR_MODULO',
      ambiente: 'PRUEBA',
    },
  });

  const handleConfiguracionChange = (key, field, value) => {
    setConfiguraciones(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  // Estado local para configuración editable, inicializado desde contextConfig
  const [editableConfig, setEditableConfig] = useState(() => {
    return contextConfig || {
      mostrarNombreComercial: true,
      valorNombreComercial: '',
      mostrarImagenLogo: true,
      valorImagenLogo: '',
      permitirAccesoManager: true,
      valorAccesoManager: '',
      sesionInactiva: true,
      valorSesionInactiva: 20,
      justificarPausa: true,
      valorJustificarPausa: 10,
      reportarTareasPausa: true,
      valorReportarTareasPausa: 60,
      reportarProyectoTareas: true,
      valorReportarProyectoTareas: 120,
      ambienteHabilitado: true,
      ambienteTrabajo: 'PRODUCCION',
      periodoVigente: 2025,
      periodoAnteriorHabilitado: false,
      fechaInicioPeriodo: '2025-01-01T00:00:00',
      fechaFinPeriodo: '2025-12-30T00:00:00',
      bloqueoAsientosAnteriores: false,
      permitirNuevosAsientosAnterior: false,
      permitirCrearNuevosLibros: false,
      permitirCrearNuevasCuentas: false
    };
  });

  // Sincronizar editableConfig con contextConfig cuando cambia
  useEffect(() => {
    if (contextConfig) {
      setEditableConfig(contextConfig);
    }
  }, [contextConfig  , loadingEmpresas ] ,);

  // Estado para controlar la carga y errores locales
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estado para guardar datos a enviar al backend
  const [saveConfigData, setSaveConfigData] = useState(null);

  // Se eliminan los estados locales `loading` y `error` ya que se usan los del contexto
  // Se elimina la función fetchConfigData y toda la lógica local de carga de configuración

  // Modifico saveConfigToBackend para enviar directamente saveConfigData (objeto plano)
  const saveConfigToBackend = async () => {
    // No se usa setLoading ni setError locales
    try {
      // Agregar process al objeto plano
      const configDataToSave = { process: 'putConfig', ...saveConfigData };

      // Validar valores null o undefined
      for (const [key, value] of Object.entries(configDataToSave)) {
        if (value === null || value === undefined) {
          console.warn(`Warning: Config field '${key}' has null or undefined value.`);
        }
      }

      console.log('Guardando configuración:', configDataToSave);

      await saveConfig(configDataToSave);
      setLoading(false);
      // No se llama a fetchConfigData local, se espera que el contexto actualice

      alert('Configuración guardada exitosamente.');
    } catch (error) {
      console.error('Error saving config:', error);
      if (error.response && error.response.data) {
        console.error('Backend error message:', error.response.data);
        setError(error.response.data);
        // No se usa setError local, pero puede usar alert o console
        alert(`Error al guardar la configuración: ${JSON.stringify(error.response.data)}`);
      } else {
        alert('Error al guardar la configuración.');
      
      }
    }
  };

  useEffect(() => {
    const fetchEmpresas = async () => {
      setLoadingEmpresas(true);
      try {
        const response = await getEmpresas({ getAll: true });
        console.log('Respuesta de getEmpresas:', response);
        setEmpresas(response.companies);
      } catch (error) {
        console.error("Error al cargar las empresas:", error);
      } finally {
        setLoadingEmpresas(false);
      }
    };

    const fetchUsers = async () => {
      setLoadingUsuarios(true);
      let allUsers = [];
      try {
        let currentPage = 1;
        let hasMorePages = true;
        console.log("Iniciando carga de usuarios internos...");
        while (hasMorePages) {
          const response = await getUsers({ tipoUserFiltro: 'INTERNO', page: currentPage });
          let users = [];
          let totalPages = 1;
          if (Array.isArray(response)) {
            users = response;
            hasMorePages = false;
          } else if (response.users && Array.isArray(response.users)) {
            users = response.users;
            totalPages = response.totalPages || 1;
          } else if (response.data && Array.isArray(response.data)) {
            users = response.data;
            totalPages = response.last_page || response.totalPages || 1;
          } else {
            hasMorePages = false;
          }
          if (users.length > 0) {
            const normalizedUsers = users.map(user => ({
              id: user.idUser || user.IdUser || user.id || user.Id, // Normalizar a 'id'
              username: user.username || user.Username || user.name || user.Name // Normalizar a 'username'
            }));
            allUsers = [...allUsers, ...normalizedUsers];
          }
          if (currentPage >= totalPages) {
            hasMorePages = false;
          }
          currentPage++;
        }
        console.log("Carga de usuarios internos finalizada. Total de usuarios cargados:", allUsers.length);
        setUsuarios(allUsers);
      } catch (error) {
        console.error("Error al cargar los usuarios:", error);
      } finally {
        setLoadingUsuarios(false);
      }
    };

    // Carga datos iniciales
    fetchEmpresas();
    fetchUsers();
  }, []); // Este useEffect se ejecuta solo una vez al montar el componente

  // Sincronizar selectedEmpresa con editableConfig.valorNombreComercial
  useEffect(() => {
    if (editableConfig.valorNombreComercial && editableConfig.valorNombreComercial !== selectedEmpresa) {
      setSelectedEmpresa(editableConfig.valorNombreComercial);
    }
  }, [editableConfig.valorNombreComercial, selectedEmpresa]);

  const handleConfigChange = (key) => {
    setEditableConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleEmpresaChange = (event) => {
    const companyName = event.target.value;
    setSelectedEmpresa(companyName);
    setEditableConfig(prev => ({ ...prev, valorNombreComercial: companyName }));
  };

  const handleUsuarioChange = (event) => {
    const userId = event.target.value;
    setSelectedUsuario(userId);
    setEditableConfig(prev => ({ ...prev, valorAccesoManager: userId }));
  };

  const handleLogoChange = async (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      try {
        const response = await uploadLogoService(file);
        const path = (response && (response.path || response.filePath || response.archivologo)) || response; // Manejar diferentes formatos de respuesta
        setLogoPath(path);
        setEditableConfig(prev => ({ ...prev, valorImagenLogo: path }));
      } catch (error) {
        alert('Error al subir el logo');
      }
    }
  };

  // Efecto para actualizar tipoEntidad cuando modoEntidad cambia
  useEffect(() => {
    if (!modoEntidad) {
      setTipoEntidad('AMBOS');
    } else {
      if (tipoEntidad === 'AMBOS') {
        setTipoEntidad('NEGOCIO'); // O 'EMPRESA' como default
      }
    }
  }, [modoEntidad, tipoEntidad]);

  // Efecto para actualizar tipoGestion y conMatriz cuando gestionGrupo cambia
  useEffect(() => {
    if (!gestionGrupo) {
      setTipoGestion('INDIVIDUAL');
    } else {
      setTipoGestion('MULTINEGOCIO');
    }
  }, [gestionGrupo]);

  // Función para alternar categorías principales
  const toggleCategory = (categoryId) => {
    setOpenCategories(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
  };

  // Función para alternar subcategorías
  const toggleSubcategory = (subcategoryId) => {
    setOpenSubcategories(prev => ({ ...prev, [subcategoryId]: !prev[subcategoryId] }));
  };

  const ConfiguracionRow = ({ label, checked, onCheckChange, aplicacion, onAplicacionChange, ambiente, onAmbienteChange }) => {
    return (
      <div className="flex justify-between items-center py-3 px-8 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
        <span className="text-sm text-gray-700 flex-1 pr-4">{label}</span>
        <div className="flex items-center justify-end" style={{ width: '50%' }}>
          <div className="w-1/4 flex justify-center">
            <input
              type="checkbox"
              checked={checked}
              onChange={onCheckChange}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
          </div>
          <div className="w-2/4 flex justify-center">
            <select 
              value={aplicacion} 
              onChange={onAplicacionChange} 
              className="text-xs px-2 py-1 text-white font-medium rounded border-0" 
              style={{ backgroundColor: checked ? '#1e4e9c' : '#6b7280' }}
              disabled={!checked}
            >
              <option value="TODO_SISTEMA" style={{ backgroundColor: 'white', color: 'black' }}>TODO SISTEMA</option>
              <option value="POR_MODULO" style={{ backgroundColor: 'white', color: 'black' }}>POR MÓDULO</option>
            </select>
          </div>
          <div className="w-1/4 flex justify-center">
            <select 
              value={ambiente} 
              onChange={onAmbienteChange} 
              className="text-xs px-2 py-1 text-white font-medium rounded border-0" 
              style={{ backgroundColor: checked ? '#1e4e9c' : '#6b7280' }}
              disabled={!checked}
            >
              <option value="PRODUCCION" style={{ backgroundColor: 'white', color: 'black' }}>PRODUCCIÓN</option>
              <option value="PRUEBA" style={{ backgroundColor: 'white', color: 'black' }}>PRUEBA</option>
            </select>
          </div>
        </div>
      </div>
    );
  };

  // Componente para elementos de configuración individuales
  const ConfigItem = ({ label, checked, onChange, secondaryValue, values = [], numericValue, onNumericChange, min, max }) => {
    const [error, setError] = React.useState('');
    const handleNumericChange = (e) => {
      const value = e.target.value;
      if (value === '') {
        setError('');
        onNumericChange(e);
        return;
      }
      const numValue = Number(value);
      if (isNaN(numValue)) {
        setError('Debe ser un número válido');
        return;
      }
      if (min !== undefined && numValue < min) {
        setError(`El valor mínimo es ${min}`);
        return;
      }
      if (max !== undefined && numValue > max) {
        setError(`El valor máximo es ${max}`);
        return;
      }
      setError('');
      onNumericChange(e);
    };

    if (checked === undefined) {
      return (
        <div className="flex justify-between items-start py-3 px-8 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors bg-white" >
          <span className="text-sm text-gray-700 flex-1 pr-4 leading-relaxed">{label}</span>
          <div className="flex flex-col items-end gap-1">
            {values.map((value, index) => (
              <span key={index} className="text-xs px-2 py-1 text-white font-medium" style={{ backgroundColor: '#1e4e9c' }} >
                {value}
              </span>
            ))}
          </div>
        </div>
      );
    }
    return (
      <div className="flex justify-between items-start py-3 px-8 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors bg-white" >
        <span className="text-sm text-gray-700 flex-1 pr-4 leading-relaxed">{label}</span>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={checked} onChange={(e) => {
              onChange(e);
              if (!e.target.checked && onNumericChange) {
                onNumericChange({ target: { value: '' } }); // Clear numeric value when unchecked
              }
            }} className="form-checkbox h-5 w-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
            <input type="number" value={checked ? (numericValue !== undefined ? numericValue : '') : ''} onChange={handleNumericChange} className={`border border-gray-300 rounded px-2 py-1 w-20 ${!checked ? 'bg-gray-100' : ''}`} disabled={!checked} min={min} max={max} />
          </div>
          {error && <span className="text-xs text-red-600">{error}</span>}
          {!checked && secondaryValue && (
            <span className="text-xs px-2 py-1 text-white font-medium rounded" style={{ backgroundColor: '#1e4e9c' }}>
              {secondaryValue}
            </span>
          )}
        </div>
      </div>
    );
  }

  const Subcategory = ({ id, title, children, isOpen }) => (
    <div className="border-l-2 ml-4" style={{ borderColor: '#d1d5db' }}>
      <button onClick={() => toggleSubcategory(id)} className={`w-full text-left p-3 text-sm font-medium transition-all duration-300 border-b bg-gray-200 hover:bg-gray-300 text-gray-700`} style={{ borderColor: '#d1d5db' }} >
        <div className="flex items-center justify-between">
          <span>{title}</span>
          <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}> ▼ </span>
        </div>
      </button>
      {isOpen && (
        <div className="bg-white border-b animate-fadeIn" style={{ borderColor: '#d1d5db' }} >
          {children}
        </div>
      )}
    </div>
  );

  // Componente para categorías principales
  const Category = ({ id, title, children, isOpen, hasTopMargin = false }) => (
    <div className={`bg-white w-full shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg ${hasTopMargin ? 'mt-6' : ''}`} style={{ borderColor: '#1e4e9c' }}>
      <button onClick={() => toggleCategory(id)} className={`w-full text-left p-4 font-semibold transition-all duration-300 border-b text-white shadow-sm`} style={{ backgroundColor: '#1e4e9c', borderColor: '#1e4e9c' }} >
        <div className="flex items-center justify-between">
          <span className="text-base">{title}</span>
          <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}> ▼ </span>
        </div>
      </button>
      {isOpen && (
        <div className="divide-y animate-fadeIn" style={{ borderColor: '#d1d5db' }} >
          {children}
        </div>
      )}
    </div>
  );

  const tipoEntidadLabels = {
    AMBOS: 'Sociedades / Personas Naturales',
    NEGOCIO: 'Personas Naturales',
    EMPRESA: 'Sociedades'
  };

  const handleSave = async () => {
    if (!saveConfigData) {
      alert('No hay datos para guardar');
      return;
    }
    await saveConfigToBackend(saveConfigData);
  };

  // Cambio periodoanteriorhabilitado para que sea booleano en lugar de 0 o 1
  useEffect(() => {
    const configToSave = {
      modoEntidad: modoEntidad,
      nombreModoEntidad: tipoEntidad,
      gestionGrupoMatriz: gestionGrupo,
      nombreGestionGrupo: tipoGestion,
      mostrarNombreComercialLogin: editableConfig.mostrarNombreComercial,
      nombreComercialLogin: editableConfig.valorNombreComercial || selectedEmpresa || '',
      mostrarImagenLogoLogin: editableConfig.mostrarImagenLogo,
      archivoLogo: editableConfig.valorImagenLogo,
      permitirAccesoManagerSystem: editableConfig.permitirAccesoManager,
      nombreUsuarioManagerSystem: editableConfig.valorAccesoManager || selectedUsuario || '',
      cerradoSesionInactiva: editableConfig.sesionInactiva,
      minutosCerrarSesion: Number(editableConfig.valorSesionInactiva) || 20,
      opcionJustificarSesionPausada: editableConfig.justificarPausa,
      minutosJustificarSesion: Number(editableConfig.valorJustificarPausa) || 10,
      opcionReportarTareasDespues: editableConfig.reportarTareasPausa,
      minutosReportarTareas: Number(editableConfig.valorReportarTareasPausa) || 60,
      opcionReportarProyectoTareasDespues: editableConfig.reportarProyectoTareas,
      minutosReportarProyectoTareas: Number(editableConfig.valorReportarProyectoTareas) || 120,
      ambienteTrabajoHabilitado: editableConfig.ambienteHabilitado,
      ambienteTrabajoModo: editableConfig.ambienteTrabajo,
      periodoVigente: editableConfig.periodoVigente,
      periodoAnteriorHabilitado: !!editableConfig.periodoAnteriorHabilitado,
      fechaInicioPeriodoVigente: editableConfig.fechaInicioPeriodo,
      fechaFinalPeriodoVigente: editableConfig.fechaFinPeriodo,
      bloqueoModificacionAsientosAnteriores: editableConfig.bloqueoAsientosAnteriores,
      permitirNuevosAsientosAnterior: editableConfig.permitirNuevosAsientosAnterior,
      permitirCrearNuevosLibros: editableConfig.permitirCrearNuevosLibros,
      permitirCrearNuevasCuentas: editableConfig.permitirCrearNuevasCuentas
    };
    setSaveConfigData(configToSave);
  }, [editableConfig, modoEntidad, tipoEntidad, gestionGrupo, tipoGestion, selectedEmpresa, selectedUsuario]);

  if (contextLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div>Cargando configuración...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (contextError) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-red-600 font-semibold">{contextError}</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        `}</style>
        <div className="flex justify-between items-center mb-4">
          <button onClick={handleSave} disabled={loading} className="bg-blue-600 text-white px-2 py-1.5 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed" style={{ boxShadow: 'none' }} >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>

        {/* Lista de configuración */}
        <div className="space-y-4">
          {/* GRUPO 1: Company and User, Staff, Manager, Investments */}
          <Category id="company-user" title="Company and User" isOpen={openCategories['company-user']} >
            <Subcategory id="accesos" title="1. Accesos" isOpen={openSubcategories['accesos']} >
              <div className="flex justify-between items-start py-3 px-8 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors bg-white" >
                <span className="text-sm text-gray-700 flex-1 pr-4 leading-relaxed">a) MODO ENTIDAD: permite crear empresas en el sistema solo con RUC de</span>
                <div className="flex items-center gap-4">
                  <input type="checkbox" checked={modoEntidad} value={modoEntidad} onChange={(e) => setModoEntidad(e.target.checked)} className="form-checkbox h-5 w-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
                  <select value={tipoEntidad} onChange={(e) => setTipoEntidad(e.target.value)} disabled={!modoEntidad} className="text-xs px-2 py-1 text-white font-medium rounded border-0" style={{ backgroundColor: modoEntidad ? '#1e4e9c' : '#6b7280' }} >
                    {!modoEntidad && <option value="AMBOS" style={{ backgroundColor: 'white', color: 'black' }}>AMBOS</option>}
                    <option value="NEGOCIO" style={{ backgroundColor: 'white', color: 'black' }}>NEGOCIO</option>
                    <option value="EMPRESA" style={{ backgroundColor: 'white', color: 'black' }}>EMPRESA</option>
                  </select>
                  <span className="text-xs px-2 py-1 text-gray-700 font-medium rounded" >
                    {tipoEntidadLabels[tipoEntidad]}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-start py-3 px-8 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors bg-white" >
                <span className="text-sm text-gray-700 flex-1 pr-4 leading-relaxed">b) GESTIÓN GRUPO: Contabiliza información como ente Individual o Grupo</span>
                <div className="flex items-center gap-4">
                  <input type="checkbox" checked={gestionGrupo} onChange={(e) => setGestionGrupo(e.target.checked)} className="form-checkbox h-5 w-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
                  <select value={tipoGestion} onChange={(e) => setTipoGestion(e.target.value)} disabled={!gestionGrupo} className="text-xs px-2 py-1 text-white font-medium rounded border-0" style={{ backgroundColor: gestionGrupo ? '#1e4e9c' : '#6b7280' }} >
                    {gestionGrupo ? (
                      <>
                        <option value="MULTINEGOCIO" style={{ backgroundColor: 'white', color: 'black' }}>MULTINEGOCIO</option>
                        <option value="MULTIEMPRESA" style={{ backgroundColor: 'white', color: 'black' }}>MULTIEMPRESA</option>
                      </>
                    ) : (
                      <option value="INDIVIDUAL" style={{ backgroundColor: 'white', color: 'black' }}>INDIVIDUAL</option>
                    )}
                  </select>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-700">{tipoGestion === 'INDIVIDUAL' ? 'Sin Matriz' : 'Con Matriz'}</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-start py-3 px-8 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors bg-white">
              <span className="text-sm text-gray-700 flex-1 pr-4 leading-relaxed">c) Mostrar Nombre Comercial de Empresa Principal en Login</span>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={editableConfig.mostrarNombreComercial} 
                  onChange={() => handleConfigChange('mostrarNombreComercial')} 
                  className="form-checkbox h-5 w-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" 
                />
                {editableConfig.mostrarNombreComercial && (
                  <select value={selectedEmpresa} onChange={handleEmpresaChange} className="text-xs px-2 py-1 text-white font-medium rounded border-0" style={{ backgroundColor: '#1e4e9c' }} >
                    {/* Si existe un selectedEmpresa y no está en empresas, mostrarla primero */}
                    {selectedEmpresa && !empresas.some(e => e.commercialName === selectedEmpresa) && (
                      <option value={selectedEmpresa} style={{ backgroundColor: 'white', color: 'black' }}>
                        {selectedEmpresa}
                      </option>
                    )}
                    {empresas.map((empresa) => (
                      <option key={empresa.codeCompany || empresa.id} value={empresa.commercialName} style={{ backgroundColor: 'white', color: 'black' }} >
                        {empresa.commercialName}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
            <div className="flex justify-between items-start py-3 px-8 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors bg-white">
                <span className="text-sm text-gray-700 flex-1 pr-4 leading-relaxed">d) Mostrar Imagen o Logo de Empresa Principal en Fondo de Login</span>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={editableConfig.mostrarImagenLogo} onChange={() => handleConfigChange('mostrarImagenLogo')} className="form-checkbox h-5 w-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
                  {editableConfig.mostrarImagenLogo && (
                    <>
                      <input type="file" onChange={handleLogoChange} accept="image/*" className="text-sm text-gray-700" />
                      {logoPath && (
                        <img src={logoPath} alt="Logo de la empresa" className="mt-2 h-16 object-contain" />
                      )}
                    </>
                  )}
                </div>
            </div>
            <div className="flex justify-between items-start py-3 px-8 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors bg-white">
              <span className="text-sm text-gray-700 flex-1 pr-4 leading-relaxed">e) Permitir acceso a Manager System a otro Usuario</span>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={editableConfig.permitirAccesoManager} onChange={() => handleConfigChange('permitirAccesoManager')} className="form-checkbox h-5 w-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
                {editableConfig.permitirAccesoManager && (
                  <select value={selectedUsuario} onChange={handleUsuarioChange} disabled={loadingUsuarios} className="text-xs px-2 py-1 text-white font-medium rounded border-0" style={{ backgroundColor: '#1e4e9c' }} >
                    <option value="">{loadingUsuarios ? 'Cargando...' : 'Seleccione un usuario'}</option>
                    {usuarios.map((usuario) => (
                      <option key={usuario.id} value={usuario.id} style={{ backgroundColor: 'white', color: 'black' }}>
                        {usuario.username}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              
            </div>
              {/* f) CERRADO AUTOMÁTICO DE SESIÓN INACTIVA (20 a 30 min) */}
              <div className="flex justify-between items-center py-3 px-8 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors bg-white">
                <span className="text-sm text-gray-700 flex-1 pr-4">f) CERRADO AUTOMÁTICO DE SESIÓN INACTIVA (20 a 30 min)</span>
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={editableConfig.sesionInactiva}
                    onChange={(e) => setEditableConfig({ ...editableConfig, sesionInactiva: e.target.checked })}
                    className="form-checkbox h-5 w-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    min={20}
                    max={30}
                    value={editableConfig.valorSesionInactiva || 20}
                    onChange={(e) => setEditableConfig({ ...editableConfig, valorSesionInactiva: e.target.value })}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>

              {/* g) OPCIÓN JUSTIFICAR SESIÓN PAUSADA (10 a 15 min) */}
              <div className="flex justify-between items-center py-3 px-8 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors bg-white">
                <span className="text-sm text-gray-700 flex-1 pr-4">g) OPCIÓN JUSTIFICAR SESIÓN PAUSADA (10 a 15 min)</span>
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={editableConfig.justificarPausa}
                    onChange={(e) => setEditableConfig({ ...editableConfig, justificarPausa: e.target.checked })}
                    className="form-checkbox h-5 w-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    min={10}
                    max={15}
                    value={editableConfig.valorJustificarPausa || 10}
                    onChange={(e) => setEditableConfig({ ...editableConfig, valorJustificarPausa: e.target.value })}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>

              {/* h) OPCIÓN REPORTAR TAREAS DURANTE PAUSA (60, 120 o 240 min) */}
              <div className="flex justify-between items-center py-3 px-8 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors bg-white">
                <span className="text-sm text-gray-700 flex-1 pr-4">h) OPCIÓN REPORTAR TAREAS DURANTE PAUSA (60, 120 o 240 min)</span>
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={editableConfig.reportarTareasPausa}
                    onChange={(e) => setEditableConfig({ ...editableConfig, reportarTareasPausa: e.target.checked })}
                    className="form-checkbox h-5 w-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <select
                    value={editableConfig.valorReportarTareasPausa || 60}
                    onChange={(e) => setEditableConfig({ ...editableConfig, valorReportarTareasPausa: Number(e.target.value) })}
                    className="text-xs px-2 py-1 rounded border border-gray-300"
                  >
                    <option value={60}>60</option>
                    <option value={120}>120</option>
                    <option value={240}>240</option>
                  </select>
                </div>
            </div>

          
            </Subcategory>
            <Subcategory id="configuraciones" title="2. Configuraciones" isOpen={openSubcategories['configuraciones']}>
              {/* Header */}
              <div className="flex justify-between items-center py-2 px-8 border-b bg-gray-100 font-semibold text-gray-600">
                <span className="text-sm flex-1 pr-4">Opción</span>
                <div className="flex items-center justify-end" style={{ width: '50%' }}>
                  <span className="w-1/4 text-center">Habilitado</span>
                  <span className="w-2/4 text-center">Aplicación</span>
                  <span className="w-1/4 text-center">Ambiente</span>
                </div>
              </div>

              <ConfiguracionRow
                label="a) AMBIENTE DE TRABAJO: habilitar creacion de registros de Prueba:"
                checked={configuraciones.ambienteTrabajo.checked}
                onCheckChange={(e) => handleConfiguracionChange('ambienteTrabajo', 'checked', e.target.checked)}
                aplicacion={configuraciones.ambienteTrabajo.aplicacion}
                onAplicacionChange={(e) => handleConfiguracionChange('ambienteTrabajo', 'aplicacion', e.target.value)}
                ambiente={configuraciones.ambienteTrabajo.ambiente}
                onAmbienteChange={(e) => handleConfiguracionChange('ambienteTrabajo', 'ambiente', e.target.value)}
              />
              <ConfiguracionRow
                label="b) ELIMINAR REGISTROS DE PRUEBA: permitir eliminar y recuperar:"
                checked={configuraciones.eliminarRegistros.checked}
                onCheckChange={(e) => handleConfiguracionChange('eliminarRegistros', 'checked', e.target.checked)}
                aplicacion={configuraciones.eliminarRegistros.aplicacion}
                onAplicacionChange={(e) => handleConfiguracionChange('eliminarRegistros', 'aplicacion', e.target.value)}
                ambiente={configuraciones.eliminarRegistros.ambiente}
                onAmbienteChange={(e) => handleConfiguracionChange('eliminarRegistros', 'ambiente', e.target.value)}
              />
            
            </Subcategory>
          </Category>

          <Category id="staff" title="Staff" isOpen={openCategories['staff']} >
            <Subcategory id="usuarios-externos" title="3. Usuarios Externos" isOpen={openSubcategories['usuarios-externos']} >
              <ConfigItem label="a) Gestión de usuarios externos" values={['CONFIGURAR']} />
              <ConfigItem label="b) Permisos de acceso externo" values={['CONFIGURAR']} />
              <ConfigItem label="c) Auditoría de accesos externos" values={['CONFIGURAR']} />
            </Subcategory>
            <Subcategory id="nomina" title="4. Nómina" isOpen={openSubcategories['nomina']} >
              <ConfigItem label="a) Configuración de nómina" values={['CONFIGURAR']} />
              <ConfigItem label="b) Cálculos automáticos" values={['CONFIGURAR']} />
              <ConfigItem label="c) Reportes de nómina" values={['CONFIGURAR']} />
            </Subcategory>
          </Category>

          <Category id="manager" title="Manager" isOpen={openCategories['manager']} >
            <Subcategory id="contabilidad" title="5. Contabilidad" isOpen={openSubcategories['contabilidad']} >
              <ConfigItem label="a) Periodo Contable predeterminado (Vigente)" values={['2025']} />
              <ConfigItem label="b) Periodo Anterior habilitado para consultas desde" values={['2024']} />
              <ConfigItem label="c) Fecha Inicio Periodo Contable (Vigente)" values={['2025-01-01']} />
              <ConfigItem label="d) Fecha Final Periodo Contable (Vigente)" values={['2025-12-31']} />
              <ConfigItem label="e) Bloqueo de modificación de Asientos de Periodos Anteriores (Cerrados)" values={['SI']} />
              <ConfigItem label="f) Permitir Nuevos Asientos o Cargar plantillas de años anteriores" values={['SI']} />
              <ConfigItem label="g) Permitir Crear nuevos Libros Contables" values={['SI']} />
              <ConfigItem label="h) Permitir Crear nuevas Cuentas Contables" values={['SI']} />
            </Subcategory>
            <Subcategory id="administracion" title="6. Administración" isOpen={openSubcategories['administracion']} >
              <ConfigItem label="a) Configuración administrativa" values={['CONFIGURAR']} />
              <ConfigItem label="b) Gestión de documentos" values={['CONFIGURAR']} />
              <ConfigItem label="c) Control de procesos" values={['CONFIGURAR']} />
            </Subcategory>
          </Category>

          <Category id="investments" title="Investments and Contract" isOpen={openCategories['investments']} >
            <Subcategory id="financiamiento" title="7.1 Financiamiento" isOpen={openSubcategories['financiamiento']} >
              <ConfigItem label="a) Gestión de financiamiento" values={['CONFIGURAR']} />
              <ConfigItem label="b) Seguimiento de créditos" values={['CONFIGURAR']} />
              <ConfigItem label="c) Análisis financiero" values={['CONFIGURAR']} />
            </Subcategory>
            <Subcategory id="contratos" title="7.8 Contratos" isOpen={openSubcategories['contratos']} >
              <ConfigItem label="a) Gestión contractual" values={['CONFIGURAR']} />
              <ConfigItem label="b) Seguimiento de vencimientos" values={['CONFIGURAR']} />
              <ConfigItem label="c) Archivo digital de contratos" values={['CONFIGURAR']} />
            </Subcategory>
          </Category>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ConfiguracionPage;