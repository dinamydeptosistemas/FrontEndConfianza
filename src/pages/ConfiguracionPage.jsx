import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { getEmpresas } from '../services/company/CompanyService';

const ConfiguracionPage = () => {
  // Estados para controlar qué secciones están abiertas
  const [openCategories, setOpenCategories] = useState({});
  const [openSubcategories, setOpenSubcategories] = useState({});
  const [modoEntidad, setModoEntidad] = useState(true);
  const [tipoEntidad, setTipoEntidad] = useState('NEGOCIO'); // Default a NEGOCIO
  const [gestionGrupo, setGestionGrupo] = useState(true);
  const [tipoGestion, setTipoGestion] = useState('MULTINEGOCIO');
  const [empresas, setEmpresas] = useState([]);
  const [loadingEmpresas, setLoadingEmpresas] = useState(false);
  const [selectedEmpresa, setSelectedEmpresa] = useState('');

  const [config, setConfig] = useState({
    mostrarNombreComercial: true,
    valorNombreComercial: '',
    mostrarImagenLogo: true,
    valorImagenLogo: 'Archivo',
    permitirAccesoManager: true,
    valorAccesoManager: 'Listado',
    sesionInactiva: true,
    valorSesionInactiva: 20,
    justificarPausa: true,
    valorJustificarPausa: 10,
    reportarTareasPausa: true,
    valorReportarTareasPausa: 60,
  });

  useEffect(() => {
    const fetchEmpresas = async () => {
      setLoadingEmpresas(true);
      try {
        const response = await getEmpresas({ getAll: true });
        setEmpresas(response.companies);
        if (response.companies.length > 0) {
          // Opcional: seleccionar la primera empresa por defecto
          // setSelectedEmpresa(response.companies[0].codeCompany);
          // setConfig(prev => ({ ...prev, valorNombreComercial: response.companies[0].codeCompany }));
        }
      } catch (error) {
        console.error("Error al cargar las empresas:", error);
        // Manejar el error, por ejemplo, mostrando una notificación
      } finally {
        setLoadingEmpresas(false);
      }
    };

    fetchEmpresas();
  }, []);

  const handleConfigChange = (key) => {
      setConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleEmpresaChange = (event) => {
    const companyCode = event.target.value;
    setSelectedEmpresa(companyCode);
    setConfig(prev => ({ ...prev, valorNombreComercial: companyCode }));
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
  }, [modoEntidad , tipoEntidad]);

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
    setOpenCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Función para alternar subcategorías
  const toggleSubcategory = (subcategoryId) => {
    setOpenSubcategories(prev => ({
      ...prev,
      [subcategoryId]: !prev[subcategoryId]
    }));
  };

  // Componente para elementos de configuración individuales
  const ConfigItem = ({ label, checked, onChange, secondaryValue, values = [] }) => {
    if (checked === undefined) {
        return (
            <div
              className="flex justify-between items-start py-3 px-8 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors bg-white"
            >
              <span className="text-sm text-gray-700 flex-1 pr-4 leading-relaxed">{label}</span>
              <div className="flex flex-col items-end gap-1">
                {values.map((value, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-1 text-white font-medium"
                    style={{ backgroundColor: '#1e4e9c' }}
                  >
                    {value}
                  </span>
                ))}
              </div>
            </div>
        );
    }

    return (
        <div
          className="flex justify-between items-start py-3 px-8 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors bg-white"
        >
          <span className="text-sm text-gray-700 flex-1 pr-4 leading-relaxed">{label}</span>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={checked}
              onChange={onChange}
              className="form-checkbox h-5 w-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            {checked && secondaryValue && (
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
      <button
        onClick={() => toggleSubcategory(id)}
        className={`w-full text-left p-3 text-sm font-medium transition-all duration-300
                   border-b bg-gray-200 hover:bg-gray-300 text-gray-700`}
        style={{
          borderColor: '#d1d5db'
        }}
      >
        <div className="flex items-center justify-between">
          <span>{title}</span>
          <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </div>
      </button>

      {isOpen && (
        <div
          className="bg-white border-b animate-fadeIn"
          style={{ borderColor: '#d1d5db' }}
        >
          {children}
        </div>
      )}
    </div>
  );

  // Componente para categorías principales
  const Category = ({ id, title, children, isOpen, hasTopMargin = false }) => (
    <div className={`bg-white  ml-4  w-[91%] shadow-md  overflow-hidden transition-all duration-300 hover:shadow-lg ${hasTopMargin ? 'mt-6' : ''}`}
         style={{ borderColor: '#1e4e9c' }}>
      <button
        onClick={() => toggleCategory(id)}
        className={`w-full text-left p-4 font-semibold transition-all duration-300 border-b text-white shadow-sm`}
        style={{
          backgroundColor: '#1e4e9c',
          borderColor: '#1e4e9c'
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-base">{title}</span>
          <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </div>
      </button>

      {isOpen && (
        <div
          className="divide-y animate-fadeIn"
          style={{ borderColor: '#d1d5db' }}
        >
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

  const handleSave = () => {
    const settings = {
      modoEntidad,
      tipoEntidad,
      gestionGrupo,
      tipoGestion,
      ...config
      // Aquí se agregarían las demás configuraciones
    };
    console.log("Guardando configuración:", settings);
    alert('Configuración guardada. Revisa la consola para ver los detalles.');
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 p-4">
        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
        `}</style>

        <div className="flex justify-between items-center mb-4">

          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300"
          >
            Guardar Cambios
          </button>
        </div>

        {/* Lista de configuración */}
        <div className="space-y-4">
          {/* GRUPO 1: Company and User, Staff, Manager, Investments */}
          <Category
            id="company-user"
            title="Company and User"
            isOpen={openCategories['company-user']}
          >
            <Subcategory
              id="accesos"
              title="1. Accesos"
              isOpen={openSubcategories['accesos']}
            >
              <div
                className="flex justify-between items-start py-3 px-8 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors bg-white"
              >
                <span className="text-sm text-gray-700 flex-1 pr-4 leading-relaxed">a) MODO ENTIDAD: permite crear empresas en el sistema solo con RUC de</span>
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={modoEntidad}
                    onChange={(e) => setModoEntidad(e.target.checked)}
                    className="form-checkbox h-5 w-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <select
                    value={tipoEntidad}
                    onChange={(e) => setTipoEntidad(e.target.value)}
                    disabled={!modoEntidad}
                    className="text-xs px-2 py-1 text-white font-medium rounded border-0"
                    style={{ backgroundColor: modoEntidad ? '#1e4e9c' : '#6b7280' }}
                  >
                    {!modoEntidad && <option value="AMBOS" style={{ backgroundColor: 'white', color: 'black' }}>AMBOS</option>}
                    <option value="NEGOCIO" style={{ backgroundColor: 'white', color: 'black' }}>NEGOCIO</option>
                    <option value="EMPRESA" style={{ backgroundColor: 'white', color: 'black' }}>EMPRESA</option>
                  </select>
                  <span className="text-xs px-2 py-1 text-white font-medium rounded"
                    style={{ backgroundColor: modoEntidad ? '#1e4e9c' : '#6b7280' }}>
                    {tipoEntidadLabels[tipoEntidad]}
                  </span>
                </div>
              </div>
              <div
                className="flex justify-between items-start py-3 px-8 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors bg-white"
              >
                <span className="text-sm text-gray-700 flex-1 pr-4 leading-relaxed">b) GESTIÓN GRUPO: Contabiliza información como ente Individual o Grupo</span>
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={gestionGrupo}
                    onChange={(e) => setGestionGrupo(e.target.checked)}
                    className="form-checkbox h-5 w-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <select
                    value={tipoGestion}
                    onChange={(e) => setTipoGestion(e.target.value)}
                    disabled={!gestionGrupo}
                    className="text-xs px-2 py-1 text-white font-medium rounded border-0"
                    style={{ backgroundColor: gestionGrupo ? '#1e4e9c' : '#6b7280' }}
                  >
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
                    checked={config.mostrarNombreComercial}
                    onChange={() => handleConfigChange('mostrarNombreComercial')}
                    className="form-checkbox h-5 w-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  {config.mostrarNombreComercial && (
                    <select
                      value={selectedEmpresa}
                      onChange={handleEmpresaChange}
                      disabled={loadingEmpresas}
                      className="text-xs px-2 py-1 text-white font-medium rounded border-0"
                      style={{ backgroundColor: '#1e4e9c' }}
                    >
                      <option value="">{loadingEmpresas ? 'Cargando...' : 'Seleccione una empresa'}</option>
                      {empresas.map((empresa) => (
                        <option key={empresa.codeCompany} value={empresa.codeCompany} style={{ backgroundColor: 'white', color: 'black' }}>
                          {empresa.commercialName}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
              <ConfigItem
                label="d) Mostrar Imagen o Logo de Empresa Principal en Fondo de Login"
                checked={config.mostrarImagenLogo}
                onChange={() => handleConfigChange('mostrarImagenLogo')}
                secondaryValue={config.valorImagenLogo}
              />
              <ConfigItem
                label="e) Permitir acceso a Manager System a otro Usuario"
                checked={config.permitirAccesoManager}
                onChange={() => handleConfigChange('permitirAccesoManager')}
                secondaryValue={config.valorAccesoManager}
              />
              <ConfigItem
                label="f) Cerrado Automático de Sesión Inactiva (20 a 30 min)"
                checked={config.sesionInactiva}
                onChange={() => handleConfigChange('sesionInactiva')}
                secondaryValue={config.valorSesionInactiva}
              />
              <ConfigItem
                label="g) Opción Justificar Sesión Pausada (10 a 15 min)"
                checked={config.justificarPausa}
                onChange={() => handleConfigChange('justificarPausa')}
                secondaryValue={config.valorJustificarPausa}
              />
              <ConfigItem
                label="h) Opción Reportar Tareas durante Pausa (60, 120 o 240 min)"
                checked={config.reportarTareasPausa}
                onChange={() => handleConfigChange('reportarTareasPausa')}
                secondaryValue={config.valorReportarTareasPausa}
              />
            </Subcategory>

            <Subcategory
              id="configuraciones"
              title="2. Configuraciones"
              isOpen={openSubcategories['configuraciones']}
            >
              <ConfigItem label="a) Configuración general del sistema" values={['PENDIENTE']} />
              <ConfigItem label="b) Parámetros de seguridad" values={['PENDIENTE']} />
              <ConfigItem label="c) Configuración de respaldos" values={['PENDIENTE']} />
            </Subcategory>
          </Category>

          <Category
            id="staff"
            title="Staff"
            isOpen={openCategories['staff']}
          >
            <Subcategory
              id="usuarios-externos"
              title="3. Usuarios Externos"
              isOpen={openSubcategories['usuarios-externos']}
            >
              <ConfigItem label="a) Gestión de usuarios externos" values={['CONFIGURAR']} />
              <ConfigItem label="b) Permisos de acceso externo" values={['CONFIGURAR']} />
              <ConfigItem label="c) Auditoría de accesos externos" values={['CONFIGURAR']} />
            </Subcategory>

            <Subcategory
              id="nomina"
              title="4. Nómina"
              isOpen={openSubcategories['nomina']}
            >
              <ConfigItem label="a) Configuración de nómina" values={['CONFIGURAR']} />
              <ConfigItem label="b) Cálculos automáticos" values={['CONFIGURAR']} />
              <ConfigItem label="c) Reportes de nómina" values={['CONFIGURAR']} />
            </Subcategory>
          </Category>

          <Category
            id="manager"
            title="Manager"
            isOpen={openCategories['manager']}
          >
            <Subcategory
              id="contabilidad"
              title="5. Contabilidad"
              isOpen={openSubcategories['contabilidad']}
            >
              <ConfigItem
                label="a) Periodo Contable predeterminado (Vigente)"
                values={['2025']}
              />
              <ConfigItem
                label="b) Periodo Anterior habilitado para consultas desde"
                values={['2024']}
              />
              <ConfigItem
                label="c) Fecha Inicio Periodo Contable (Vigente)"
                values={['2025-01-01']}
              />
              <ConfigItem
                label="d) Fecha Final Periodo Contable (Vigente)"
                values={['2025-12-31']}
              />
              <ConfigItem
                label="e) Bloqueo de modificación de Asientos de Periodos Anteriores (Cerrados)"
                values={['SI']}
              />
              <ConfigItem
                label="f) Permitir Nuevos Asientos o Cargar plantillas de años anteriores"
                values={['SI']}
              />
              <ConfigItem
                label="g) Permitir Crear nuevos Libros Contables"
                values={['SI']}
              />
              <ConfigItem
                label="h) Permitir Crear nuevas Cuentas Contables"
                values={['SI']}
              />
            </Subcategory>

            <Subcategory
              id="administracion"
              title="6. Administración"
              isOpen={openSubcategories['administracion']}
            >
              <ConfigItem label="a) Configuración administrativa" values={['CONFIGURAR']} />
              <ConfigItem label="b) Gestión de documentos" values={['CONFIGURAR']} />
              <ConfigItem label="c) Control de procesos" values={['CONFIGURAR']} />
            </Subcategory>
          </Category>

          <Category
            id="investments"
            title="Investments and Contract"
            isOpen={openCategories['investments']}
          >
            <Subcategory
              id="financiamiento"
              title="7.1 Financiamiento"
              isOpen={openSubcategories['financiamiento']}
            >
              <ConfigItem label="a) Gestión de financiamiento" values={['CONFIGURAR']} />
              <ConfigItem label="b) Seguimiento de créditos" values={['CONFIGURAR']} />
              <ConfigItem label="c) Análisis financiero" values={['CONFIGURAR']} />
            </Subcategory>

            <Subcategory
              id="inversion"
              title="7.2 Inversión"
              isOpen={openSubcategories['inversion']}
            >
              <ConfigItem label="a) Portafolio de inversiones" values={['CONFIGURAR']} />
              <ConfigItem label="b) Análisis de rentabilidad" values={['CONFIGURAR']} />
              <ConfigItem label="c) Reportes de inversión" values={['CONFIGURAR']} />
            </Subcategory>

            <Subcategory
              id="contratos"
              title="7.8 Contratos"
              isOpen={openSubcategories['contratos']}
            >
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
