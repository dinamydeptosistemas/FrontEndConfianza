import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { getEmpresas } from '../services/company/CompanyService';
import { getUsers } from '../services/user/UserService';
import { saveConfig, uploadLogo as uploadLogoService, getConfig } from '../services/config/ConfigService';
import { useConfig } from '../contexts/ConfigContext';

const styles = {
  "general": {
    "background": "bg-gray-50",
    "minHeight": "min-h-screen",
    "fontFamily": "sans-serif"
  },
  "colors": {
    "primary": "#1e4e9c",
    "primaryHover": "#1a4385",
    "secondary": "#6b7280",
    "text": "#1f2937",
    "textSecondary": "#4b5563",
    "border": "#d1d5db",
    "error": "#dc2626",
    "success": "#16a34a",
    "warning": "#d97706",
    "info": "#0284c7"
  },
  "typography": {
    "categoryTitle": {
      "fontSize": "18px",
      "fontWeight": "font-semibold",
      "textColor": "text-white",
      "className": "text-[18px]"
    },
    "subcategoryTitle": {
      "fontSize": "16px",
      "fontWeight": "font-medium",
      "textColor": "text-gray-700",
      "className": "text-[16px]"
    },
    "itemLabel": {
      "fontSize": "14px",
      "fontWeight": "normal",
      "textColor": "text-gray-700",
      "lineHeight": "leading-relaxed",
      "className": "text-sm"
    },
    "badgeText": {
      "fontSize": "12px",
      "fontWeight": "font-medium",
      "textColor": "text-white"
    },
    "buttonText": {
      "fontSize": "14px",
      "fontWeight": "normal"
    }
  },
  "layout": {
    "container": {
      "padding": "p-0",
      "margin": "m-0",
      "width": "w-full",
      "maxWidth": "none"
    },
    "categories": {
      "spacing": "space-y-4",
      "marginLeft": "ml-2"
    },
    "category": {
      "background": "bg-white",
      "borderRadius": "rounded-none",
      "shadow": "shadow-md",
      "hoverShadow": "hover:shadow-lg",
      "borderColor": "#1e4e9c",
      "padding": "p-0",
      "marginBottom": "mb-0"
    },
    "subcategory": {
      "borderLeft": "border-l-2",
      "borderColor": "#d1d5db",
      "marginLeft": "ml-4",
      "padding": "p-0"
    },
    "item": {
      "padding": "py-3 px-8",
      "borderBottom": "border-b border-gray-100",
      "lastItemNoBorder": "last:border-b-0",
      "hoverBackground": "hover:bg-gray-50",
      "transition": "transition-colors",
      "background": "bg-white"
    }
  },
  "buttons": {
    "saveButton": {
      "background": "#1e4e9c",
      "textColor": "text-white",
      "padding": "px-2 py-1.5",
      "fontSize": "text-sm",
      "hoverBackground": "hover:bg-blue-500",
      "focusRing": "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50",
      "disabledOpacity": "disabled:opacity-50",
      "disabledCursor": "disabled:cursor-not-allowed",
      "transition": "transition-all duration-300",
      "boxShadow": "none"
    },
    "dropdownButton": {
      "padding": "p-3",
      "fontSize": "text-sm",
      "fontWeight": "font-medium",
      "textColor": "text-gray-700",
      "background": "bg-gray-200",
      "hoverBackground": "hover:bg-gray-300",
      "borderBottom": "border-b",
      "borderColor": "#d1d5db",
      "transition": "transition-all duration-300"
    },
    "categoryButton": {
      "padding": "p-4",
      "fontSize": "text-base",
      "fontWeight": "font-semibold",
      "textColor": "text-white",
      "background": "#1e4e9c",
      "borderBottom": "border-b",
      "borderColor": "#1e4e9c",
      "shadow": "shadow-sm",
      "transition": "transition-all duration-300"
    }
  },
  "forms": {
    "checkbox": {
      "size": "h-5 w-5",
      "color": "text-blue-600",
      "background": "bg-gray-100",
      "border": "border-gray-300",
      "rounded": "rounded",
      "focusRing": "focus:ring-blue-500"
    },
    "input": {
      "border": "border border-gray-300",
      "rounded": "rounded",
      "padding": "px-2 py-1",
      "fontSize": "text-xs",
      "width": "w-20",
      "disabledBackground": "bg-gray-100",
      "focusOutline": "focus:outline-none focus:ring focus:ring-blue-300"
    },
    "select": {
      "padding": "px-2 py-1",
      "fontSize": "text-xs",
      "fontWeight": "font-medium",
      "textColor": "text-white",
      "background": "#1e4e9c",
      "border": "border-0",
      "rounded": "rounded",
      "disabledBackground": "#6b7280",
      "optionTextColor": "black",
      "optionBgColor": "white"
    },
    "fileInput": {
      "fontSize": "text-sm",
      "textColor": "text-gray-700"
    }
  },
  "badges": {
    "statusBadge": {
      "padding": "px-2 py-1",
      "fontSize": "text-xs",
      "fontWeight": "font-medium",
      "textColor": "text-white",
      "background": "#1e4e9c",
      "rounded": "rounded"
    }
  },
  "animations": {
    "fadeIn": {
      "keyframes": "from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); }",
      "className": "animate-fadeIn",
      "duration": "0.3s",
      "timingFunction": "ease-out"
    },
    "rotateArrow": {
      "transition": "transform transition-transform duration-200"
    }
  },
  "spacing": {
    "padding": {
      "horizontal": "px-8",
      "vertical": "py-3",
      "buttonHorizontal": "px-8",
      "buttonVertical": "py-3"
    },
    "margin": {
      "topCategory": "mt-6",
      "leftSubcategory": "ml-4",
      "betweenCategories": "space-y-4",
      "leftMain": "ml-2"
    }
  },
  "conditionalStyles": {
    "disabledInput": "bg-gray-100",
    "disabledSelect": {
      "background": "#6b7280"
    },
    "checkboxDependentInput": {
      "disabledWhenUnchecked": true
    }
  },
  "misc": {
    "logoImage": {
      "maxHeight": "h-16",
      "objectFit": "object-contain",
      "marginTop": "mt-2"
    },
    "tableHeader": {
      "background": "bg-gray-100",
      "textColor": "text-gray-600",
      "fontWeight": "font-semibold",
      "padding": "py-2 px-8",
      "borderBottom": "border-b"
    }
  }
};

const ConfiguracionPage = () => {
  // Contexto de configuración global
  const { config: contextConfig, loading: contextLoading, error: contextError } = useConfig();

  // Estados principales
  const [originalConfig, setOriginalConfig] = useState(null);
  const [editableConfig, setEditableConfig] = useState({
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
    periodoVigente: 2025,
    periodoAnteriorHabilitado: false,
    fechaInicioPeriodo: '2025-01-01T00:00:00',
    fechaFinPeriodo: '2025-12-31T23:59:59',
    bloqueoAsientosAnteriores: false,
    permitirNuevosAsientosAnterior: false,
    permitirCrearNuevosLibros: false,
    permitirCrearNuevasCuentas: false,
  });

  const [modoEntidad, setModoEntidad] = useState(false);
  const [tipoEntidad, setTipoEntidad] = useState('AMBOS');
  const [gestionGrupo, setGestionGrupo] = useState(false);
  const [tipoGestion, setTipoGestion] = useState('INDIVIDUAL');

  // Datos auxiliares
  const [empresas, setEmpresas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loadingEmpresas, setLoadingEmpresas] = useState(false);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);

  // Selecciones
  const [selectedEmpresa, setSelectedEmpresa] = useState('');
  const [selectedUsuario, setSelectedUsuario] = useState('');
  const [logoPath, setLogoPath] = useState('');

  // UI
  const [openCategories, setOpenCategories] = useState({});
  const [openSubcategories, setOpenSubcategories] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  // Configuraciones adicionales
  const [configuraciones, setConfiguraciones] = useState({
    ambienteTrabajo: {
      checked: true,
      aplicacion: 'TODO_SISTEMA',
    },
    eliminarRegistros: {
      checked: true,
    },
  });

  const loadInitialData = async () => {
    try {
      const response = await getConfig();
      if (!response || !response.config || response.config.length === 0) return;

      const data = response.config[0];

      setOriginalConfig(data);

      const newEditableConfig = {
          mostrarNombreComercial: data.mostrarnombrecomerciallogin,
          valorNombreComercial: data.nombrecomerciallogin,
          mostrarImagenLogo: data.mostrarimagenlogologin,
          valorImagenLogo: data.archivologo,
          permitirAccesoManager: data.permitiraccesomanagersystem,
          valorAccesoManager: data.nombreusuariomanagersystem,
          sesionInactiva: data.cerradosesioninactiva,
          valorSesionInactiva: data.minutoscerrarsesion,
          justificarPausa: data.opcionjustificarsesionpausada,
          valorJustificarPausa: data.minutosjustificarsesion,
          reportarTareasPausa: data.opcionreportartareasdespues,
          valorReportarTareasPausa: data.minutosreportartareas,
          reportarProyectoTareas: data.opcionreportarproyectotareasdespues,
          valorReportarProyectoTareas: data.minutosreportarproyectotareas,
          periodoVigente: data.periodovigente,
          periodoAnteriorHabilitado: !!data.periodoanteriorhabilitado,
          fechaInicioPeriodo: data.fechainicioperiodovigente,
          fechaFinPeriodo: data.fechafinalperiodovigente,
          bloqueoAsientosAnteriores: data.bloqueomodificacionasientosanteriores,
          permitirNuevosAsientosAnterior: data.permitirnuevosasientosanterior,
          permitirCrearNuevosLibros: data.permitircrearnuevoslibros,
          permitirCrearNuevasCuentas: data.permitircrearnuevascuentas,
      };
      setEditableConfig(newEditableConfig);

      // Sincronizar estados derivados
      setModoEntidad(!!data.modorentidad);
      setTipoEntidad(data.nombremodorentidad);
      setGestionGrupo(!!data.gestiongrupomatriz);
      setTipoGestion(data.nombregestiongrupo || 'INDIVIDUAL');
      setSelectedEmpresa(data.nombrecomerciallogin || '');
      setSelectedUsuario(data.nombreusuariomanagersystem || '');
      setLogoPath(data.archivologo || '');

      // Actualizar configuraciones específicas
      setConfiguraciones(prev => ({
        ...prev,
        ambienteTrabajo: {
          ...prev.ambienteTrabajo,
          checked: !!data.ambiente_creacion_prueba_habilitado,
          aplicacion: data.ambiente_creacion_prueba_modo || 'TODO_SISTEMA',
        },
        eliminarRegistros: {
          ...prev.eliminarRegistros,
          checked: !!data.eliminar_prueba_habilitado,
        }
      }));
    } catch (err) {
      console.error('Error al cargar configuración:', err);
    }
  };

  // Cargar datos iniciales desde backend
  useEffect(() => {
    loadInitialData();
  }, []);

  // Add debug logs for modoEntidad and tipoEntidad changes
  useEffect(() => {
    console.log('modoEntidad changed:', modoEntidad);
  }, [modoEntidad]);

  useEffect(() => {
    console.log('tipoEntidad changed:', tipoEntidad);
  }, [tipoEntidad]);

  // Cargar empresas
  useEffect(() => {
    const fetchEmpresas = async () => {
      setLoadingEmpresas(true);
      try {
        const response = await getEmpresas({ getAll: true });
        setEmpresas(response?.companies || []);
      } catch (err) {
        console.error('Error al cargar empresas:', err);
      } finally {
        setLoadingEmpresas(false);
      }
    };
    fetchEmpresas();
  }, []);

  // Cargar usuarios internos
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsuarios(true);
      let allUsers = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        try {
          const response = await getUsers({ tipoUserFiltro: 'INTERNO', page });
          let users = [];
          let totalPages = 1;

          if (Array.isArray(response)) {
            users = response;
            hasMore = false;
          } else {
            users = response.users || response.data || [];
            totalPages = response.totalPages || response.last_page || 1;
          }

          const normalized = users.map(u => ({
            id: u.idUser || u.IdUser || u.id,
            username: u.username || u.Username || u.name || 'Usuario sin nombre',
          }));

          allUsers = [...allUsers, ...normalized];

          if (page >= totalPages) hasMore = false;
          page++;
        } catch (err) {
          console.error('Error al cargar usuarios:', err);
          hasMore = false;
        }
      }

      setUsuarios(allUsers);
      setLoadingUsuarios(false);
    };

    fetchUsers();
  }, []);

  // Sincronizar selectedEmpresa con valorNombreComercial
  useEffect(() => {
    if (editableConfig.valorNombreComercial && editableConfig.valorNombreComercial !== selectedEmpresa) {
      setSelectedEmpresa(editableConfig.valorNombreComercial);
    }
  }, [editableConfig.valorNombreComercial, selectedEmpresa]);

  // Sincronizar logoPath
  useEffect(() => {
    if (editableConfig.valorImagenLogo && editableConfig.valorImagenLogo !== logoPath) {
      setLogoPath(editableConfig.valorImagenLogo);
    }
  }, [editableConfig.valorImagenLogo, logoPath]);

  useEffect(() => {
    if (originalConfig && editableConfig.mostrarNombreComercial && !selectedEmpresa) {
        setSelectedEmpresa('CONFIANZA SCGC');
        setEditableConfig(prev => ({ ...prev, valorNombreComercial: 'CONFIANZA SCGC' }));
    }
  }, [originalConfig, editableConfig.mostrarNombreComercial, selectedEmpresa]);


  // Manejo de cambios
  const handleConfigChange = (key, value) => {
    setEditableConfig(prev => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const handleEmpresaChange = (e) => {
    const value = e.target.value;
    setSelectedEmpresa(value);
    handleConfigChange('valorNombreComercial', value);
  };

  const handleUsuarioChange = (e) => {
    const value = e.target.value;
    setSelectedUsuario(value);
    handleConfigChange('valorAccesoManager', value);
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const response = await uploadLogoService(file);
      const path = response?.path || response?.filePath || response?.archivologo || response;
      if (path) {
        setLogoPath(path);
        handleConfigChange('valorImagenLogo', path);
      }
    } catch (err) {
      alert('Error al subir el logo.');
    }
  };

  const handleNumericChange = (key, min, max) => (e) => {
    const value = e.target.value;
    if (value === '' || (Number(value) >= min && Number(value) <= max)) {
      handleConfigChange(key, value === '' ? '' : Number(value));
    }
  };

  // Toggle funciones
  const toggleCategory = (id) => {
    setOpenCategories(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSubcategory = (id) => {
    setOpenSubcategories(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleConfiguracionChange = (key, field, value) => {
    setConfiguraciones(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value }
    }));
    setIsDirty(true);
  };

  // Guardar configuración
  const handleSave = async () => {
    if (saving) return;
    if (!isDirty) {
      alert('No hay cambios para guardar.');
      return;
    }

    const confirm = window.confirm('¿Guardar los cambios realizados?');
    if (!confirm) return;

    setSaving(true);
    try {
      const payload = { process: 'putConfig' };
      const original = originalConfig;

      if (modoEntidad !== !!original.modorentidad) payload.modorentidad = modoEntidad;
      if (tipoEntidad !== (original.nombremodorentidad)) payload.nombremodorentidad = tipoEntidad;
      if (gestionGrupo !== !!original.gestiongrupomatriz) payload.gestiongrupomatriz = gestionGrupo;
      if (tipoGestion !== (original.nombregestiongrupo || 'INDIVIDUAL')) payload.nombregestiongrupo = tipoGestion;
      if (selectedEmpresa !== (original.nombrecomerciallogin || '')) payload.nombrecomerciallogin = selectedEmpresa;
      if (logoPath !== (original.archivologo || '')) payload.archivologo = logoPath;
      if (selectedUsuario !== (original.nombreusuariomanagersystem || '')) payload.nombreusuariomanagersystem = selectedUsuario;

      if (editableConfig.mostrarNombreComercial !== original.mostrarnombrecomerciallogin) payload.mostrarnombrecomerciallogin = editableConfig.mostrarNombreComercial;
      if (editableConfig.mostrarImagenLogo !== original.mostrarimagenlogologin) payload.mostrarimagenlogologin = editableConfig.mostrarImagenLogo;
      if (editableConfig.permitirAccesoManager !== original.permitiraccesomanagersystem) payload.permitiraccesomanagersystem = editableConfig.permitirAccesoManager;
      if (editableConfig.sesionInactiva !== original.cerradosesioninactiva) payload.cerradosesioninactiva = editableConfig.sesionInactiva;
      if (Number(editableConfig.valorSesionInactiva) !== original.minutoscerrarsesion) payload.minutoscerrarsesion = Number(editableConfig.valorSesionInactiva);
      if (editableConfig.justificarPausa !== original.opcionjustificarsesionpausada) payload.opcionjustificarsesionpausada = editableConfig.justificarPausa;
      if (Number(editableConfig.valorJustificarPausa) !== original.minutosjustificarsesion) payload.minutosjustificarsesion = Number(editableConfig.valorJustificarPausa);
      if (editableConfig.reportarTareasPausa !== original.opcionreportartareasdespues) payload.opcionreportartareasdespues = editableConfig.reportarTareasPausa;
      if (Number(editableConfig.valorReportarTareasPausa) !== original.minutosreportartareas) payload.minutosreportartareas = Number(editableConfig.valorReportarTareasPausa);
      if (editableConfig.reportarProyectoTareas !== original.opcionreportarproyectotareasdespues) payload.opcionreportarproyectotareasdespues = editableConfig.reportarProyectoTareas;
      if (Number(editableConfig.valorReportarProyectoTareas) !== original.minutosreportarproyectotareas) payload.minutosreportarproyectotareas = Number(editableConfig.valorReportarProyectoTareas);
      if (Number(editableConfig.periodoVigente) !== original.periodovigente) payload.periodovigente = Number(editableConfig.periodoVigente);
      if (editableConfig.periodoAnteriorHabilitado !== !!original.periodoanteriorhabilitado) payload.periodoanteriorhabilitado = editableConfig.periodoAnteriorHabilitado ? 1 : 0;
      if (new Date(editableConfig.fechaInicioPeriodo).toISOString().split('.')[0] !== new Date(original.fechainicioperiodovigente).toISOString().split('.')[0]) payload.fechainicioperiodovigente = new Date(editableConfig.fechaInicioPeriodo).toISOString();
      if (new Date(editableConfig.fechaFinPeriodo).toISOString().split('.')[0] !== new Date(original.fechafinalperiodovigente).toISOString().split('.')[0]) payload.fechafinalperiodovigente = new Date(editableConfig.fechaFinPeriodo).toISOString();
      if (editableConfig.bloqueoAsientosAnteriores !== original.bloqueomodificacionasientosanteriores) payload.bloqueomodificacionasientosanteriores = editableConfig.bloqueoAsientosAnteriores;
      if (editableConfig.permitirNuevosAsientosAnterior !== original.permitirnuevosasientosanterior) payload.permitirnuevosasientosanterior = editableConfig.permitirNuevosAsientosAnterior;
      if (editableConfig.permitirCrearNuevosLibros !== original.permitircrearnuevoslibros) payload.permitircrearnuevoslibros = editableConfig.permitirCrearNuevosLibros;
      if (editableConfig.permitirCrearNuevasCuentas !== original.permitircrearnuevascuentas) payload.permitircrearnuevascuentas = editableConfig.permitirCrearNuevasCuentas;
      
      if (configuraciones.ambienteTrabajo.checked !== !!original.ambiente_creacion_prueba_habilitado) payload.ambiente_creacion_prueba_habilitado = configuraciones.ambienteTrabajo.checked;
      if (configuraciones.ambienteTrabajo.aplicacion !== (original.ambiente_creacion_prueba_modo || 'TODO_SISTEMA')) payload.ambiente_creacion_prueba_modo = configuraciones.ambienteTrabajo.aplicacion;
      if (configuraciones.eliminarRegistros.checked !== !!original.eliminar_prueba_habilitado) payload.eliminar_prueba_habilitado = configuraciones.eliminarRegistros.checked;

      const response = await saveConfig(payload);

      // Actualizar originalConfig con los valores guardados para evitar sobrescrituras
      setOriginalConfig(prev => ({
        ...prev,
        modorentidad: payload.modorentidad !== undefined ? payload.modorentidad : prev.modorentidad,
        nombremodorentidad: payload.nombremodorentidad !== undefined ? payload.nombremodorentidad : prev.nombremodorentidad,
        gestiongrupomatriz: payload.gestiongrupomatriz !== undefined ? payload.gestiongrupomatriz : prev.gestiongrupomatriz,
        nombregestiongrupo: payload.nombregestiongrupo !== undefined ? payload.nombregestiongrupo : prev.nombregestiongrupo,
        nombrecomerciallogin: payload.nombrecomerciallogin !== undefined ? payload.nombrecomerciallogin : prev.nombrecomerciallogin,
        archivologo: payload.archivologo !== undefined ? payload.archivologo : prev.archivologo,
        nombreusuariomanagersystem: payload.nombreusuariomanagersystem !== undefined ? payload.nombreusuariomanagersystem : prev.nombreusuariomanagersystem,
        mostrarnombrecomerciallogin: payload.mostrarnombrecomerciallogin !== undefined ? payload.mostrarnombrecomerciallogin : prev.mostrarnombrecomerciallogin,
        mostrarimagenlogologin: payload.mostrarimagenlogologin !== undefined ? payload.mostrarimagenlogologin : prev.mostrarimagenlogologin,
        permitiraccesomanagersystem: payload.permitiraccesomanagersystem !== undefined ? payload.permitiraccesomanagersystem : prev.permitiraccesomanagersystem,
        cerradosesioninactiva: payload.cerradosesioninactiva !== undefined ? payload.cerradosesioninactiva : prev.cerradosesioninactiva,
        minutoscerrarsesion: payload.minutoscerrarsesion !== undefined ? payload.minutoscerrarsesion : prev.minutoscerrarsesion,
        opcionjustificarsesionpausada: payload.opcionjustificarsesionpausada !== undefined ? payload.opcionjustificarsesionpausada : prev.opcionjustificarsesionpausada,
        minutosjustificarsesion: payload.minutosjustificarsesion !== undefined ? payload.minutosjustificarsesion : prev.minutosjustificarsesion,
        opcionreportartareasdespues: payload.opcionreportartareasdespues !== undefined ? payload.opcionreportartareasdespues : prev.opcionreportartareasdespues,
        minutosreportartareas: payload.minutosreportartareas !== undefined ? payload.minutosreportartareas : prev.minutosreportartareas,
        opcionreportarproyectotareasdespues: payload.opcionreportarproyectotareasdespues !== undefined ? payload.opcionreportarproyectotareasdespues : prev.opcionreportarproyectotareasdespues,
        minutosreportarproyectotareas: payload.minutosreportarproyectotareas !== undefined ? payload.minutosreportarproyectotareas : prev.minutosreportarproyectotareas,
        periodovigente: payload.periodovigente !== undefined ? payload.periodovigente : prev.periodovigente,
        periodoanteriorhabilitado: payload.periodoanteriorhabilitado !== undefined ? payload.periodoanteriorhabilitado : prev.periodoanteriorhabilitado,
        fechainicioperiodovigente: payload.fechainicioperiodovigente !== undefined ? payload.fechainicioperiodovigente : prev.fechainicioperiodovigente,
        fechafinalperiodovigente: payload.fechafinalperiodovigente !== undefined ? payload.fechafinalperiodovigente : prev.fechafinalperiodovigente,
        bloqueomodificacionasientosanteriores: payload.bloqueomodificacionasientosanteriores !== undefined ? payload.bloqueomodificacionasientosanteriores : prev.bloqueomodificacionasientosanteriores,
        permitirnuevosasientosanterior: payload.permitirnuevosasientosanterior !== undefined ? payload.permitirnuevosasientosanterior : prev.permitirnuevosasientosanterior,
        permitircrearnuevoslibros: payload.permitircrearnuevoslibros !== undefined ? payload.permitircrearnuevoslibros : prev.permitircrearnuevoslibros,
        permitircrearnuevascuentas: payload.permitircrearnuevascuentas !== undefined ? payload.permitircrearnuevascuentas : prev.permitircrearnuevascuentas,
      }));

      // Add a delay before reloading initial data to ensure backend has processed changes
    

      setIsDirty(false);
      alert('Configuración guardada con éxito.');
    } catch (err) {
      console.error('Error al guardar:', err);
      alert(`Error al guardar: ${err.message || 'Intente nuevamente.'}`);
    } finally {
      setSaving(false);
      
    }
  };

  // Componentes UI
  const Category = ({ id, title, children, isOpen }) => (
    <div className={`${styles.layout.category.background} ${styles.layout.category.shadow} ${styles.layout.category.borderRadius} overflow-hidden ${styles.animations.fadeIn.className} ${styles.layout.category.hoverShadow}`}>
      <button
        type="button"
        onClick={() => toggleCategory(id)}
        aria-expanded={isOpen}
        className={`w-full text-left ${styles.buttons.categoryButton.padding} ${styles.typography.categoryTitle.fontWeight} ${styles.typography.categoryTitle.textColor} flex justify-between items-center`}
        style={{ backgroundColor: styles.colors.primary }}
      >
        <span className={styles.typography.categoryTitle.className}>{title}</span>
        <span className={`transform ${styles.animations.rotateArrow.transition} ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {isOpen && <div className={styles.animations.fadeIn.className}>{children}</div>}
    </div>
  );

  const Subcategory = ({ id, title, children, isOpen }) => (
    <div className={`${styles.layout.subcategory.borderLeft} ${styles.layout.subcategory.marginLeft}`} style={{ borderColor: styles.layout.subcategory.borderColor }}>
      <button
        type="button"
        onClick={() => toggleSubcategory(id)}
        aria-expanded={isOpen}
        className={`w-full text-left ${styles.buttons.dropdownButton.padding} ${styles.typography.subcategoryTitle.fontSize} ${styles.buttons.dropdownButton.fontWeight} ${styles.buttons.dropdownButton.background} ${styles.buttons.dropdownButton.hoverBackground} ${styles.buttons.dropdownButton.borderBottom} flex justify-between items-center`}
        style={{ borderColor: styles.buttons.dropdownButton.borderColor }}
      >
        <span className={styles.typography.subcategoryTitle.className}>{title}</span>
        <span className={`transform ${styles.animations.rotateArrow.transition} ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {isOpen && <div className={`${styles.layout.item.background} ${styles.layout.item.borderBottom}`}>{children}</div>}
    </div>
  );

  const ConfigItem = ({ label, values = [] }) => (
    <div className={`flex justify-between items-start ${styles.layout.item.padding} ${styles.layout.item.borderBottom} ${styles.layout.item.hoverBackground} ${styles.layout.item.background}`}>
      <span className={`${styles.typography.itemLabel.className} ${styles.typography.itemLabel.textColor} flex-1 pr-4`}>{label}</span>
      <div className="flex flex-col items-end gap-1">
        {values.map((v, i) => (
          <span key={i} className={`${styles.badges.statusBadge.padding} ${styles.badges.statusBadge.fontSize} ${styles.badges.statusBadge.fontWeight} ${styles.badges.statusBadge.textColor} ${styles.badges.statusBadge.rounded}`} style={{ backgroundColor: styles.badges.statusBadge.background }}>
            {v}
          </span>
        ))}
      </div>
    </div>
  );

  // --- Renderizado ---
  if (contextLoading) {
    return (
      <DashboardLayout>
        <div className={`${styles.general.minHeight} ${styles.general.background} flex items-center justify-center`}>
          <p>Cargando configuración...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (contextError) {
    return (
      <DashboardLayout>
        <div className={`${styles.general.minHeight} ${styles.general.background} flex items-center justify-center`}>
          <div className="text-red-600 text-center">
            <p>{contextError}</p>
            <button onClick={() => window.location.reload()} className="text-sm underline mt-2">
              Reintentar
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className={`${styles.general.minHeight} ${styles.general.background} ${styles.layout.container.padding} ${styles.spacing.margin.leftMain}`}>
        <style jsx>{`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
          .animate-fadeIn { animation: fadeIn ${styles.animations.fadeIn.duration} ${styles.animations.fadeIn.timingFunction}; }
        `}</style>

        {/* Botón de guardar */}
        <div className="flex justify-start mb-6">
          {isDirty && <span className="text-orange-600 text-sm mr-4">✏️ Cambios sin guardar</span>}
          <button
            onClick={handleSave}
            disabled={saving || !isDirty}
            className={`${styles.buttons.saveButton.padding} ${styles.buttons.saveButton.fontSize} ${styles.buttons.saveButton.textColor} ${styles.buttons.saveButton.disabledOpacity} ${styles.buttons.saveButton.disabledCursor} ${styles.buttons.saveButton.transition}`}
            style={{ backgroundColor: styles.buttons.saveButton.background, boxShadow: styles.buttons.saveButton.boxShadow }}
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>

        <div className={styles.layout.categories.spacing}>
          {/* Sección: Company and User */}
          <Category id="company-user" title="Company and User" isOpen={openCategories['company-user']}>
            <Subcategory id="accesos" title="1. Accesos" isOpen={openSubcategories['accesos']}>
              {/* MODO ENTIDAD */}
              <div className={`flex justify-between items-center ${styles.layout.item.padding} ${styles.layout.item.borderBottom} ${styles.layout.item.background}`}>
                <span className={`${styles.typography.itemLabel.className} ${styles.typography.itemLabel.textColor}`}>a) MODO ENTIDAD: permite crear empresas solo con RUC de</span>
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={modoEntidad}
                    onChange={(e) => {
                      setModoEntidad(e.target.checked);
                      setIsDirty(true);
                    }}
                    className={`${styles.forms.checkbox.size} ${styles.forms.checkbox.color} ${styles.forms.checkbox.background} ${styles.forms.checkbox.border} ${styles.forms.checkbox.rounded} ${styles.forms.checkbox.focusRing}`}
                  />
                  <select
                    value={tipoEntidad}
                    onChange={(e) => {
                      setTipoEntidad(e.target.value);
                      setIsDirty(true);
                    }}
                    disabled={!modoEntidad}
                    className={`${styles.forms.select.padding} ${styles.forms.select.fontSize} ${styles.forms.select.fontWeight} ${styles.forms.select.textColor} ${styles.forms.select.border} ${styles.forms.select.rounded}`}
                    style={{ backgroundColor: modoEntidad ? styles.forms.select.background : styles.forms.select.disabledBackground }}
                  >
                    <option style={{ color: styles.forms.select.optionTextColor, backgroundColor: styles.forms.select.optionBgColor }} value="AMBOS">AMBOS</option>
                    <option style={{ color: styles.forms.select.optionTextColor, backgroundColor: styles.forms.select.optionBgColor }} value="NEGOCIO">NEGOCIO</option>
                    <option style={{ color: styles.forms.select.optionTextColor, backgroundColor: styles.forms.select.optionBgColor }} value="EMPRESA">EMPRESA</option>
                  </select>
                  <span className={`${styles.typography.itemLabel.className} ${styles.typography.textSecondary}`}>
                    {tipoEntidad === 'AMBOS' ? 'Sociedades / Personas Naturales' :
                     tipoEntidad === 'NEGOCIO' ? 'Personas Naturales' : 'Sociedades'}
                  </span>
                </div>
              </div>

              {/* GESTIÓN GRUPO */}
              <div className={`flex justify-between items-center ${styles.layout.item.padding} ${styles.layout.item.borderBottom} ${styles.layout.item.background}`}>
                <span className={`${styles.typography.itemLabel.className} ${styles.typography.itemLabel.textColor}`}>b) GESTIÓN GRUPO: Contabiliza como ente Individual o Grupo</span>
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={gestionGrupo}
                    onChange={(e) => {
                      setGestionGrupo(e.target.checked);
                      setIsDirty(true);
                    }}
                    className={`${styles.forms.checkbox.size} ${styles.forms.checkbox.color} ${styles.forms.checkbox.background} ${styles.forms.checkbox.border} ${styles.forms.checkbox.rounded} ${styles.forms.checkbox.focusRing}`}
                  />
                  <select
                    value={tipoGestion}
                    onChange={(e) => {
                      setTipoGestion(e.target.value);
                      setIsDirty(true);
                    }}
                    disabled={!gestionGrupo}
                    className={`${styles.forms.select.padding} ${styles.forms.select.fontSize} ${styles.forms.select.fontWeight} ${styles.forms.select.textColor} ${styles.forms.select.border} ${styles.forms.select.rounded}`}
                    style={{ backgroundColor: gestionGrupo ? styles.forms.select.background : styles.forms.select.disabledBackground }}
                  >
                    {!gestionGrupo ? (
                      <option style={{ color: styles.forms.select.optionTextColor, backgroundColor: styles.forms.select.optionBgColor }} value="INDIVIDUAL">INDIVIDUAL</option>
                    ) : (
                      <>
                        <option style={{ color: styles.forms.select.optionTextColor, backgroundColor: styles.forms.select.optionBgColor }} value="MULTINEGOCIO">MULTINEGOCIO</option>
                        <option style={{ color: styles.forms.select.optionTextColor, backgroundColor: styles.forms.select.optionBgColor }} value="MULTIEMPRESA">MULTIEMPRESA</option>
                      </>
                    )}
                  </select>
                  <span className={`${styles.typography.itemLabel.className} ${styles.typography.textSecondary}`}>{gestionGrupo ? 'Con Matriz' : 'Sin Matriz'}</span>
                </div>
              </div>

              {/* Mostrar nombre comercial */}
              <div className={`flex justify-between items-center ${styles.layout.item.padding} ${styles.layout.item.borderBottom} ${styles.layout.item.background}`}>
                <span className={`${styles.typography.itemLabel.className} ${styles.typography.itemLabel.textColor}`}>c) Mostrar NOMBRE COMERCIAL en Login</span>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editableConfig.mostrarNombreComercial}
                    onChange={() => handleConfigChange('mostrarNombreComercial', !editableConfig.mostrarNombreComercial)}
                    className={`${styles.forms.checkbox.size} ${styles.forms.checkbox.color} ${styles.forms.checkbox.background} ${styles.forms.checkbox.border} ${styles.forms.checkbox.rounded} ${styles.forms.checkbox.focusRing}`}
                  />
                  {editableConfig.mostrarNombreComercial && (
                    <select
                      value={selectedEmpresa}
                      onChange={handleEmpresaChange}
                      className={`${styles.forms.select.padding} ${styles.forms.select.fontSize} ${styles.forms.select.fontWeight} ${styles.forms.select.textColor} ${styles.forms.select.border} ${styles.forms.select.rounded}`}
                      style={{ backgroundColor: styles.forms.select.background }}
                    >
                      {selectedEmpresa && !empresas.some(e => e.commercialName === selectedEmpresa) && (
                        <option style={{ color: styles.forms.select.optionTextColor, backgroundColor: styles.forms.select.optionBgColor }} value={selectedEmpresa}>{selectedEmpresa}</option>
                      )}
                      {empresas.map(emp => (
                        <option key={emp.codeCompany} style={{ color: styles.forms.select.optionTextColor, backgroundColor: styles.forms.select.optionBgColor }} value={emp.commercialName}>
                          {emp.commercialName}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Mostrar logo */}
              <div className={`flex justify-between items-center ${styles.layout.item.padding} ${styles.layout.item.borderBottom} ${styles.layout.item.background}`}>
                <span className={`${styles.typography.itemLabel.className} ${styles.typography.itemLabel.textColor}`}>d) Mostrar Logo en Fondo de Login</span>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editableConfig.mostrarImagenLogo}
                    onChange={() => handleConfigChange('mostrarImagenLogo', !editableConfig.mostrarImagenLogo)}
                    className={`${styles.forms.checkbox.size} ${styles.forms.checkbox.color} ${styles.forms.checkbox.background} ${styles.forms.checkbox.border} ${styles.forms.checkbox.rounded} ${styles.forms.checkbox.focusRing}`}
                  />
                  {editableConfig.mostrarImagenLogo && (
                    <>
                      <input type="file" accept="image/*" onChange={handleLogoChange} className={`${styles.forms.fileInput.fontSize} ${styles.forms.fileInput.textColor}`} />
                      {logoPath && <img src={logoPath} alt="Logo" className={`${styles.misc.logoImage.maxHeight} ${styles.misc.logoImage.objectFit} ${styles.misc.logoImage.marginTop}`} />}
                    </>
                  )}
                </div>
              </div>

              {/* Acceso Manager */}
              <div className={`flex justify-between items-center ${styles.layout.item.padding} ${styles.layout.item.borderBottom} ${styles.layout.item.background}`}>
                <span className={`${styles.typography.itemLabel.className} ${styles.typography.itemLabel.textColor}`}>e) Permitir acceso a Manager System a otro Usuario</span>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editableConfig.permitirAccesoManager}
                    onChange={() => handleConfigChange('permitirAccesoManager', !editableConfig.permitirAccesoManager)}
                    className={`${styles.forms.checkbox.size} ${styles.forms.checkbox.color} ${styles.forms.checkbox.background} ${styles.forms.checkbox.border} ${styles.forms.checkbox.rounded} ${styles.forms.checkbox.focusRing}`}
                  />
                  {editableConfig.permitirAccesoManager && (
                    <select
                      value={selectedUsuario}
                      onChange={handleUsuarioChange}
                      disabled={loadingUsuarios}
                      className={`${styles.forms.select.padding} ${styles.forms.select.fontSize} ${styles.forms.select.fontWeight} ${styles.forms.select.textColor} ${styles.forms.select.border} ${styles.forms.select.rounded}`}
                      style={{ backgroundColor: styles.forms.select.background }}
                    >
                      <option style={{ color: styles.forms.select.optionTextColor, backgroundColor: styles.forms.select.optionBgColor }} value="">{loadingUsuarios ? 'Cargando...' : 'Seleccione usuario'}</option>
                      {usuarios.map(u => (
                        <option key={u.id} style={{ color: styles.forms.select.optionTextColor, backgroundColor: styles.forms.select.optionBgColor }} value={u.username}>{u.username}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Sesión inactiva */}
              <div className={`flex justify-between items-center ${styles.layout.item.padding} ${styles.layout.item.borderBottom} ${styles.layout.item.background}`}>
                <span className={`${styles.typography.itemLabel.className} ${styles.typography.itemLabel.textColor}`}>f) Cerrado automático de SESIÓN inactiva (20 a 30 min)</span>
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={editableConfig.sesionInactiva}
                    onChange={(e) => handleConfigChange('sesionInactiva', e.target.checked)}
                    className={`${styles.forms.checkbox.size} ${styles.forms.checkbox.color} ${styles.forms.checkbox.background} ${styles.forms.checkbox.border} ${styles.forms.checkbox.rounded} ${styles.forms.checkbox.focusRing}`}
                  />
                  {editableConfig.sesionInactiva && (
                    <input
                      type="number"
                      min={20}
                      max={30}
                      value={editableConfig.valorSesionInactiva}
                      onChange={handleNumericChange('valorSesionInactiva', 20, 30)}
                      className={`${styles.forms.input.width} ${styles.forms.input.padding} ${styles.forms.input.border} ${styles.forms.input.rounded} ${styles.forms.input.fontSize} ${styles.forms.input.focusOutline}`}
                      disabled={!editableConfig.sesionInactiva && styles.conditionalStyles.checkboxDependentInput.disabledWhenUnchecked}
                      style={{backgroundColor: !editableConfig.sesionInactiva ? styles.conditionalStyles.disabledInput : 'white'}}
                    />
                  )}
                </div>
              </div>

              {/* Justificar pausa */}
              <div className={`flex justify-between items-center ${styles.layout.item.padding} ${styles.layout.item.borderBottom} ${styles.layout.item.background}`}>
                <span className={`${styles.typography.itemLabel.className} ${styles.typography.itemLabel.textColor}`}>g) Opción justificar SESIÓN PAUSADA (10 a 15 min)</span>
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={editableConfig.justificarPausa}
                    onChange={(e) => handleConfigChange('justificarPausa', e.target.checked)}
                    className={`${styles.forms.checkbox.size} ${styles.forms.checkbox.color} ${styles.forms.checkbox.background} ${styles.forms.checkbox.border} ${styles.forms.checkbox.rounded} ${styles.forms.checkbox.focusRing}`}
                  />
                  {editableConfig.justificarPausa && (
                    <input
                      type="number"
                      min={10}
                      max={15}
                      value={editableConfig.valorJustificarPausa}
                      onChange={handleNumericChange('valorJustificarPausa', 10, 15)}
                      className={`${styles.forms.input.width} ${styles.forms.input.padding} ${styles.forms.input.border} ${styles.forms.input.rounded} ${styles.forms.input.fontSize} ${styles.forms.input.focusOutline}`}
                      disabled={!editableConfig.justificarPausa && styles.conditionalStyles.checkboxDependentInput.disabledWhenUnchecked}
                      style={{backgroundColor: !editableConfig.justificarPausa ? styles.conditionalStyles.disabledInput : 'white'}}
                    />
                  )}
                </div>
              </div>

              {/* h) OPCIÓN REPORTAR TAREAS DURANTE PAUSA (60, 120 o 240 min) */}
              <div className={`flex justify-between items-center ${styles.layout.item.padding} ${styles.layout.item.borderBottom} ${styles.layout.item.background}`}>
                <span className={`${styles.typography.itemLabel.className} ${styles.typography.itemLabel.textColor}`}>h) Opción reportar tareas durante pausa (60, 120 o 240 min)</span>
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={editableConfig.reportarTareasPausa}
                    onChange={(e) => handleConfigChange('reportarTareasPausa', e.target.checked)}
                    className={`${styles.forms.checkbox.size} ${styles.forms.checkbox.color} ${styles.forms.checkbox.background} ${styles.forms.checkbox.border} ${styles.forms.checkbox.rounded} ${styles.forms.checkbox.focusRing}`}
                  />
                  {editableConfig.reportarTareasPausa && (
                    <select
                      value={editableConfig.valorReportarTareasPausa || 60}
                      onChange={(e) => handleConfigChange('valorReportarTareasPausa', Number(e.target.value))}
                      className="text-xs px-2 py-1 rounded border border-gray-300"
                      style={{backgroundColor: 'white', color: 'black'}}
                    >
                      <option value={60}>60</option>
                      <option value={120}>120</option>
                      <option value={240}>240</option>
                    </select>
                  )}
                </div>
              </div>

              {/* i) OPCIÓN REPORTAR PROYECTO/TAREAS DESPUÉS DE PAUSA (120 o 240 min) */}
              <div className={`flex justify-between items-center ${styles.layout.item.padding} ${styles.layout.item.borderBottom} ${styles.layout.item.background}`}>
                <span className={`${styles.typography.itemLabel.className} ${styles.typography.itemLabel.textColor}`}>i) Opción reportar proyecto/tareas después de pausa (120 o 240 min)</span>
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={editableConfig.reportarProyectoTareas}
                    onChange={(e) => handleConfigChange('reportarProyectoTareas', e.target.checked)}
                    className={`${styles.forms.checkbox.size} ${styles.forms.checkbox.color} ${styles.forms.checkbox.background} ${styles.forms.checkbox.border} ${styles.forms.checkbox.rounded} ${styles.forms.checkbox.focusRing}`}
                  />
                  {editableConfig.reportarProyectoTareas && (
                    <select
                      value={editableConfig.valorReportarProyectoTareas || 120}
                      onChange={(e) => handleConfigChange('valorReportarProyectoTareas', Number(e.target.value))}
                      className="text-xs px-2 py-1 rounded border border-gray-300"
                      style={{backgroundColor: 'white', color: 'black'}}
                    >
                      <option value={120}>120</option>
                      <option value={240}>240</option>
                    </select>
                  )}
                </div>
              </div>
            </Subcategory>

            {/* Configuraciones */}
            <Subcategory id="configuraciones" title="2. Configuraciones" isOpen={openSubcategories['configuraciones']}>
              <div className={`flex justify-between items-center ${styles.misc.tableHeader.padding} ${styles.misc.tableHeader.borderBottom} ${styles.misc.tableHeader.background} ${styles.misc.tableHeader.fontWeight} ${styles.misc.tableHeader.textColor} text-sm`}>
                <span className="flex-1">Opción</span>
                <div className="flex w-1/2 justify-around">
                  <span>Habilitado</span>
                  <span>Aplicación</span>
                  <span>Ambiente</span>
                </div>
              </div>

              <div className={`flex justify-between items-center ${styles.layout.item.padding} ${styles.layout.item.borderBottom} ${styles.layout.item.background}`}>
                <span className={`${styles.typography.itemLabel.className} ${styles.typography.itemLabel.textColor} flex-1`}>a) AMBIENTE DE TRABAJO: habilitar registros de Prueba</span>
                <div className="flex w-1/2 justify-around">
                  <input
                    type="checkbox"
                    checked={configuraciones.ambienteTrabajo.checked}
                    onChange={(e) => handleConfiguracionChange('ambienteTrabajo', 'checked', e.target.checked)}
                    className={`${styles.forms.checkbox.size} ${styles.forms.checkbox.color} ${styles.forms.checkbox.background} ${styles.forms.checkbox.border} ${styles.forms.checkbox.rounded} ${styles.forms.checkbox.focusRing}`}
                  />
                  <select
                    value={configuraciones.ambienteTrabajo.aplicacion}
                    onChange={(e) => handleConfiguracionChange('ambienteTrabajo', 'aplicacion', e.target.value)}
                    disabled={!configuraciones.ambienteTrabajo.checked}
                    className={`${styles.forms.select.padding} ${styles.forms.select.fontSize} ${styles.forms.select.fontWeight} ${styles.forms.select.textColor} ${styles.forms.select.border} ${styles.forms.select.rounded}`}
                    style={{ backgroundColor: configuraciones.ambienteTrabajo.checked ? styles.forms.select.background : styles.forms.select.disabledBackground }}
                  >
                    <option style={{ color: styles.forms.select.optionTextColor, backgroundColor: styles.forms.select.optionBgColor }} value="TODO_SISTEMA">TODO SISTEMA</option>
                    <option style={{ color: styles.forms.select.optionTextColor, backgroundColor: styles.forms.select.optionBgColor }} value="MODULO">MÓDULO</option>
                  </select>
                  <span className={`${styles.badges.statusBadge.padding} ${styles.badges.statusBadge.fontSize} ${styles.badges.statusBadge.fontWeight} ${styles.badges.statusBadge.textColor} ${styles.badges.statusBadge.rounded}`} style={{ backgroundColor: styles.badges.statusBadge.background }}>
                    {configuraciones.ambienteTrabajo.checked ? 'PRUEBAS' : 'PRODUCCIÓN'}
                  </span>
                </div>
              </div>

              <div className={`flex justify-between items-center ${styles.layout.item.padding} ${styles.layout.item.borderBottom} ${styles.layout.item.background}`}>
                <span className={`${styles.typography.itemLabel.className} ${styles.typography.itemLabel.textColor} flex-1`}>b) ELIMINAR REGISTROS DE PRUEBA</span>
                <div className="flex w-1/2 justify-around">
                  <input
                    type="checkbox"
                    checked={configuraciones.eliminarRegistros.checked}
                    onChange={(e) => handleConfiguracionChange('eliminarRegistros', 'checked', e.target.checked)}
                    className={`${styles.forms.checkbox.size} ${styles.forms.checkbox.color} ${styles.forms.checkbox.background} ${styles.forms.checkbox.border} ${styles.forms.checkbox.rounded} ${styles.forms.checkbox.focusRing}`}
                  />
                  <span className={`${styles.badges.statusBadge.padding} ${styles.badges.statusBadge.fontSize} ${styles.badges.statusBadge.fontWeight} ${styles.badges.statusBadge.textColor} ${styles.badges.statusBadge.rounded}`} style={{ backgroundColor: styles.badges.statusBadge.background }}>
                    {configuraciones.eliminarRegistros.checked ? 'Puede eliminar' : 'No puede'}
                  </span>
                  <span></span>
                </div>
              </div>
            </Subcategory>
          </Category>

          {/* Staff */}
          <Category id="staff" title="Staff" isOpen={openCategories['staff']}>
            <Subcategory id="usuarios-externos" title="3. Usuarios Externos" isOpen={openSubcategories['usuarios-externos']}>
              <ConfigItem label="a) Gestión de usuarios externos" values={['CONFIGURAR']} />
              <ConfigItem label="b) Permisos de acceso externo" values={['CONFIGURAR']} />
              <ConfigItem label="c) Auditoría de accesos externos" values={['CONFIGURAR']} />
            </Subcategory>
            <Subcategory id="nomina" title="4. Nómina" isOpen={openSubcategories['nomina']}>
              <ConfigItem label="a) Configuración de nómina" values={['CONFIGURAR']} />
              <ConfigItem label="b) Cálculos automáticos" values={['CONFIGURAR']} />
              <ConfigItem label="c) Reportes de nómina" values={['CONFIGURAR']} />
            </Subcategory>
          </Category>

          {/* Manager */}
          <Category id="manager" title="Manager" isOpen={openCategories['manager']}>
            <Subcategory id="contabilidad" title="5. Contabilidad" isOpen={openSubcategories['contabilidad']}>
              <ConfigItem label="a) Periodo Contable predeterminado (Vigente)" values={['2025']} />
              <ConfigItem label="b) Periodo Anterior habilitado para consultas desde" values={['2024']} />
              <ConfigItem label="c) Fecha Inicio Periodo Contable (Vigente)" values={['2025-01-01']} />
              <ConfigItem label="d) Fecha Final Periodo Contable (Vigente)" values={['2025-12-31']} />
              <ConfigItem label="e) Bloqueo de modificación de Asientos de Periodos Anteriores" values={['SI']} />
              <ConfigItem label="f) Permitir Nuevos Asientos de años anteriores" values={['SI']} />
              <ConfigItem label="g) Permitir Crear nuevos Libros Contables" values={['SI']} />
              <ConfigItem label="h) Permitir Crear nuevas Cuentas Contables" values={['SI']} />
            </Subcategory>
            <Subcategory id="administracion" className={styles.typography.subcategoryTitle.className} title="6. Administración" isOpen={openSubcategories['administracion']}>
              <ConfigItem label="a) Configuración administrativa" values={['CONFIGURAR']} />
              <ConfigItem label="b) Gestión de documentos" values={['CONFIGURAR']} />
              <ConfigItem label="c) Control de procesos" values={['CONFIGURAR']} />
            </Subcategory>
          </Category>

          {/* Investments and Contract */}
          <Category id="investments" title="Investments and Contract" isOpen={openCategories['investments']}>
            <Subcategory id="financiamiento" title="7.1 Financiamiento" isOpen={openSubcategories['financiamiento']}>
              <ConfigItem label="a) Gestión de financiamiento" values={['CONFIGURAR']} />
              <ConfigItem label="b) Seguimiento de créditos" values={['CONFIGURAR']} />
              <ConfigItem label="c) Análisis financiero" values={['CONFIGURAR']} />
            </Subcategory>
            <Subcategory id="contratos" title="7.8 Contratos" isOpen={openSubcategories['contratos']}>
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