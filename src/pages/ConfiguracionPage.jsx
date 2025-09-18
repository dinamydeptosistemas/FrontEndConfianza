import React, { useState, useEffect, useRef } from 'react';
import { useBlocker } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { getEmpresas } from '../services/company/CompanyService';
import { getUsers } from '../services/user/UserService';
import { saveConfig, uploadLogo as uploadLogoService } from '../services/config/ConfigService';
import { useConfig } from '../contexts/ConfigContext';
import MensajeHead from '../components/forms/MensajeHead';
import SuccessModal from '../components/common/SuccessModal';

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
  const { config, loading, error, reloadConfig, updateConfig } = useConfig();

  // Estados principales
  const [originalConfig, setOriginalConfig] = useState(null);
  const [editableConfig, setEditableConfig] = useState(null);

  const [modoEntidad, setModoEntidad] = useState(null);
  const [tipoEntidad, setTipoEntidad] = useState(null);
  const [gestionGrupo, setGestionGrupo] = useState(null);
  const [tipoGestion, setTipoGestion] = useState(null);

  // Datos auxiliares
  const [empresas, setEmpresas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);

  // Selecciones
  const [selectedUsuario, setSelectedUsuario] = useState('');
  const [logoPath, setLogoPath] = useState('');

  // UI
  const [openCategories, setOpenCategories] = useState({});
  const [openSubcategories, setOpenSubcategories] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });
  const [showNavBlockerModal, setShowNavBlockerModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Configuraciones adicionales
  const [configuraciones, setConfiguraciones] = useState(null);

  const isInitialMountGestionGrupo = useRef(true);
  const isInitialMountTipoGestion = useRef(true);

  const blocker = useBlocker(() => isDirty);

  const resetToOriginalConfig = () => {
    if (!originalConfig) return;

    const newEditableConfig = {
        mostrarNombreComercial: originalConfig.mostrarnombrecomerciallogin,
        nombrecomerciallogin: originalConfig.nombrecomerciallogin || '',
        mostrarImagenLogo: originalConfig.mostrarimagenlogologin,
        valorImagenLogo: originalConfig.archivologo,
        permitirAccesoManager: originalConfig.permitiraccesomanagersystem,
        valorAccesoManager: originalConfig.nombreusuariomanagersystem,
        sesionInactiva: originalConfig.cerradosesioninactiva,
        valorSesionInactiva: originalConfig.minutoscerrarsesion,
        justificarPausa: originalConfig.opcionjustificarsesionpausada,
        valorJustificarPausa: originalConfig.minutosjustificarsesion,
        reportarTareasPausa: originalConfig.opcionreportartareasdespues,
        valorReportarTareasPausa: originalConfig.minutosreportartareas,
        reportarProyectoTareas: originalConfig.opcionreportarproyectotareasdespues,
        valorReportarProyectoTareas: originalConfig.minutosreportarproyectotareas,
        periodoVigente: originalConfig.periodovigente,
        periodoAnteriorHabilitado: !!originalConfig.periodoanteriorhabilitado,
        fechaInicioPeriodo: originalConfig.fechainicioperiodovigente,
        fechaFinPeriodo: originalConfig.fechafinalperiodovigente,
        bloqueoAsientosAnteriores: originalConfig.bloqueomodificacionasientosanteriores,
        permitirNuevosAsientosAnterior: originalConfig.permitirnuevosasientosanterior,
        permitirCrearNuevosLibros: originalConfig.permitircrearnuevoslibros,
        permitirCrearNuevasCuentas: originalConfig.permitircrearnuevascuentas,
        eliminarPruebaHabilitado: originalConfig.eliminarpruebahabilitado
    };
    setEditableConfig(newEditableConfig);

    setModoEntidad(!!originalConfig.modorentidad);
    setTipoEntidad(originalConfig.nombremodorentidad || 'AMBOS');
    setGestionGrupo(!!originalConfig.gestiongrupomatriz);
    setTipoGestion(originalConfig.nombregestiongrupo || 'INDIVIDUAL');
    setSelectedUsuario(originalConfig.nombreusuariomanagersystem || '');
    setLogoPath(originalConfig.archivologo || '');
    setConfiguraciones({
      ambienteTrabajo: {
        checked: originalConfig.ambienteTrabajoModo === 'PRUEBA',
        modo: originalConfig.ambiente_creacion_prueba_modo || 'TODO_SISTEMA',
      },
      eliminarRegistros: {
        checked: !!originalConfig.eliminarPruebaHabilitado,
      }
    });
    setIsDirty(false);
  };

  const showSaveModal = () => {
    if(saving) return;
    setModalContent({ title: 'Guardar Cambios', message: 'Ha realizado cambios. ¿Desea guardarlos?' });
    setShowModal(true);
  };

  useEffect(() => {
    if (config) {
      setOriginalConfig(JSON.parse(JSON.stringify(config)));
      setIsInitializing(false);
    }
  }, [config]);

  useEffect(() => {
    if (!isInitializing && originalConfig) {
      resetToOriginalConfig();
    }
  }, [originalConfig, isInitializing]);

  useEffect(() => {
    if (blocker && blocker.state === 'blocked') {
      setShowNavBlockerModal(true);
    }
  }, [blocker]);

  useEffect(() => {
    if (isInitializing) return;
    if (isInitialMountGestionGrupo.current) {
      isInitialMountGestionGrupo.current = false;
    } else {
      if (gestionGrupo) {
        if (tipoGestion === 'INDIVIDUAL') {
          setTipoGestion('MULTINEGOCIO');
          setIsDirty(true);
        }
      } else {
        if (tipoGestion !== 'INDIVIDUAL') {
          setTipoGestion('INDIVIDUAL');
          setIsDirty(true);
        }
      }
      if (isDirty) showSaveModal();
    }
  }, [gestionGrupo, isInitializing]);

  useEffect(() => {
    if (isInitializing) return;
    if (isInitialMountTipoGestion.current) {
      isInitialMountTipoGestion.current = false;
    } else {
      if (tipoGestion === 'MULTINEGOCIO') {
        setModoEntidad(true);
        setTipoEntidad('NEGOCIO');
        setIsDirty(true);
      } else if (tipoGestion === 'MULTIEMPRESA') {
        setModoEntidad(true);
        setTipoEntidad('EMPRESA');
        setIsDirty(true);
      }
      if (isDirty) showSaveModal();
    }
  }, [tipoGestion, isInitializing]);

  useEffect(() => {
    const fetchEmpresas = async () => {
      try {
        const response = await getEmpresas({ getAll: true });
        setEmpresas(response?.companies || []);
      } catch (err) {
        console.error('Error al cargar empresas:', err);
      }
    };
    fetchEmpresas();
  }, []);

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
  }, [isInitializing]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  const handleConfigChange = (key, value) => {
    setEditableConfig(prev => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const handleEmpresaChange = (e) => {
    const value = e.target.value;
    handleConfigChange('nombrecomerciallogin', value);
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
        showSaveModal();
      }
    } catch (err) {
      setModalContent({ title: 'Error', message: 'Error al subir el logo.' });
      setShowModal(true);
    }
  };

  const handleNumericChange = (key, min, max) => (e) => {
    const value = e.target.value;
    if (value === '' || (Number(value) >= min && Number(value) <= max)) {
      handleConfigChange(key, value === '' ? '' : Number(value));
    }
  };

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
    showSaveModal();
  };

  const handleSave = () => {
    if (!isDirty) {
      setModalContent({ title: 'Sin cambios', message: 'No hay cambios para guardar.' });
      setShowModal(true);
      return;
    }
    if (!originalConfig) {
      setModalContent({ title: 'Error', message: 'La configuración original no se ha cargado. Por favor, recargue la página.' });
      setShowModal(true);
      return;
    }
    showSaveModal();
  };

  const executeSave = async () => {
    if (saving) return;
    setShowModal(false);
    setSaving(true);
    try {
      const payload = {
        modorentidad: modoEntidad,
        nombremodorentidad: tipoEntidad,
        gestiongrupomatriz: gestionGrupo,
        nombregestiongrupo: tipoGestion,
        mostrarnombrecomerciallogin: editableConfig.mostrarNombreComercial,
        nombrecomerciallogin: editableConfig.nombrecomerciallogin,
        mostrarimagenlogologin: editableConfig.mostrarImagenLogo,
        archivologo: logoPath,
        permitiraccesomanagersystem: editableConfig.permitirAccesoManager,
        nombreusuariomanagersystem: selectedUsuario,
        cerradosesioninactiva: editableConfig.sesionInactiva,
        minutoscerrarsesion: Number(editableConfig.valorSesionInactiva),
        opcionjustificarsesionpausada: editableConfig.justificarPausa,
        minutosjustificarsesion: Number(editableConfig.valorJustificarPausa),
        opcionreportartareasdespues: editableConfig.reportarTareasPausa,
        minutosreportartareas: Number(editableConfig.valorReportarTareasPausa),
        opcionreportarproyectotareasdespues: editableConfig.reportarProyectoTareas,
        minutosreportarproyectotareas: Number(editableConfig.valorReportarProyectoTareas),
        periodovigente: Number(editableConfig.periodoVigente),
        periodoanteriorhabilitado: editableConfig.periodoAnteriorHabilitado,
        fechaInicioPeriodoVigente: editableConfig.fechaInicioPeriodo ? new Date(editableConfig.fechaInicioPeriodo).toISOString() : null,
        fechaFinalPeriodoVigente: editableConfig.fechaFinPeriodo ? new Date(editableConfig.fechaFinPeriodo).toISOString() : null,
        bloqueoModificacionAsientosAnteriores: editableConfig.bloqueoAsientosAnteriores,
        permitirNuevosAsientosAnterior: editableConfig.permitirNuevosAsientosAnterior,
        permitirCrearNuevosLibros: editableConfig.permitirCrearNuevosLibros,
        permitirCrearNuevasCuentas: editableConfig.permitirCrearNuevasCuentas,
        ambienteTrabajoHabilitado: configuraciones.ambienteTrabajo.checked,
        ambienteTrabajoModo: configuraciones.ambienteTrabajo.checked ? 'PRUEBA' : 'PRODUCCION',
        ambiente_creacion_prueba_modo: configuraciones.ambienteTrabajo.modo,
        eliminarPruebaHabilitado: configuraciones.eliminarRegistros.checked,
      };

      await saveConfig(payload);

      const newConfig = { ...config, ...payload };
      updateConfig(newConfig);
      setOriginalConfig(newConfig);
      setIsDirty(false);
      setShowSuccessModal(true);

    } catch (err) {
      console.error('Error al guardar:', err);
      setModalContent({ title: 'Error', message: `Error al guardar: ${err.response?.data?.message || err.message || 'Intente nuevamente.'}` });
      setShowModal(true);
    } finally {
      setSaving(false);
    }
  };

  const revertChanges = () => {
    resetToOriginalConfig();
    setShowModal(false);
  }

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

  if (loading || !originalConfig || !editableConfig || !configuraciones) {
    return (
      <DashboardLayout>
        <div className={`${styles.general.minHeight} ${styles.general.background} flex items-center justify-center`}>
          <p>Cargando configuración...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className={`${styles.general.minHeight} ${styles.general.background} flex items-center justify-center`}>
          <div className="text-red-600 text-center">
            <p>{error}</p>
            <button onClick={reloadConfig} className="text-sm underline mt-2">
              Reintentar
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <MensajeHead 
          mensaje={configuraciones.ambienteTrabajo.checked ? 'AMBIENTE DE PRUEBA' : ''}
          style={{ boxShadow: 'none', backgroundColor: '#FEE2E2' }}
          textStyle={{ color: '#8ba4cb', fontWeight:'400', fontSize: '0.9rem' }}
        />
      <div className={`${styles.general.minHeight} ${styles.general.background} ${styles.layout.container.padding} ${styles.spacing.margin.leftMain}`}>
        <style jsx>{`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
          .animate-fadeIn { animation: fadeIn ${styles.animations.fadeIn.duration} ${styles.animations.fadeIn.timingFunction}; }
        `}</style>

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
          <Category id="company-user" title="Company and User" isOpen={openCategories['company-user']}>
            <Subcategory id="accesos" title="1. Accesos" isOpen={openSubcategories['accesos']}>
              <div className={`flex justify-between items-center ${styles.layout.item.padding} ${styles.layout.item.borderBottom} ${styles.layout.item.background}`}>
                <span className={`${styles.typography.itemLabel.className} ${styles.typography.itemLabel.textColor}`}>a) MODO ENTIDAD: permite crear empresas solo con RUC de</span>
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={modoEntidad}
                    onChange={(e) => {
                      const newModoEntidad = e.target.checked;
                      setModoEntidad(newModoEntidad);
                      if (!newModoEntidad) {
                        setTipoEntidad('AMBOS');
                      } else {
                        if (tipoEntidad === 'AMBOS') {
                          setTipoEntidad('NEGOCIO');
                        }
                      }
                      setIsDirty(true);
                      setShowModal(true);
                    }}
                    className={`${styles.forms.checkbox.size} ${styles.forms.checkbox.color} ${styles.forms.checkbox.background} ${styles.forms.checkbox.border} ${styles.forms.checkbox.rounded} ${styles.forms.checkbox.focusRing}`}
                  />
                  <select
                    value={tipoEntidad}
                    onChange={(e) => {
                      setTipoEntidad(e.target.value);
                      setIsDirty(true);
                      setShowModal(true)
                    }}
                    onBlur={showSaveModal}
                    disabled={!modoEntidad}
                    className={`${styles.forms.select.padding} ${styles.forms.select.fontSize} ${styles.forms.select.fontWeight} ${styles.forms.select.textColor} ${styles.forms.select.border} ${styles.forms.select.rounded}`}
                    style={{ backgroundColor: modoEntidad ? styles.forms.select.background : styles.forms.select.disabledBackground }}
                  >
                    {modoEntidad ? (
                      <>
                        {tipoEntidad && !['NEGOCIO', 'EMPRESA'].includes(tipoEntidad) &&
                          <option style={{ color: styles.forms.select.optionTextColor, backgroundColor: styles.forms.select.optionBgColor }} value={tipoEntidad}>{tipoEntidad}</option>
                        }
                        <option style={{ color: styles.forms.select.optionTextColor, backgroundColor: styles.forms.select.optionBgColor }} value="NEGOCIO">NEGOCIO</option>
                        <option style={{ color: styles.forms.select.optionTextColor, backgroundColor: styles.forms.select.optionBgColor }} value="EMPRESA">EMPRESA</option>
                      </>
                    ) : (
                      <>
                        {tipoEntidad && tipoEntidad !== 'AMBOS' &&
                          <option style={{ color: styles.forms.select.optionTextColor, backgroundColor: styles.forms.select.optionBgColor }} value={tipoEntidad}>{tipoEntidad}</option>
                        }
                        <option style={{ color: styles.forms.select.optionTextColor, backgroundColor: styles.forms.select.optionBgColor }} value="AMBOS">AMBOS</option>
                      </>
                    )}
                  </select>
                  <span className={`${styles.typography.itemLabel.className} ${styles.typography.textSecondary}`}>
                    {tipoEntidad} ({tipoEntidad === 'AMBOS' ? 'Sociedades / Personas Naturales' :
                     tipoEntidad === 'NEGOCIO' ? 'Personas Naturales' : 'Sociedades'})
                  </span>
                </div>
              </div>

              <div className={`flex justify-between items-center ${styles.layout.item.padding} ${styles.layout.item.borderBottom} ${styles.layout.item.background}`}>
                <span className={`${styles.typography.itemLabel.className} ${styles.typography.itemLabel.textColor}`}>b) GESTIÓN GRUPO: Contabiliza como ente Individual o Grupo</span>
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={gestionGrupo}
                    onChange={(e) => {
                      setGestionGrupo(e.target.checked);
                      setIsDirty(true);
                      setShowModal(true)
                    }}
                    className={`${styles.forms.checkbox.size} ${styles.forms.checkbox.color} ${styles.forms.checkbox.background} ${styles.forms.checkbox.border} ${styles.forms.checkbox.rounded} ${styles.forms.checkbox.focusRing}`}
                  />
                  <select
                    value={tipoGestion}
                    onChange={(e) => {
                      setTipoGestion(e.target.value);
                      setIsDirty(true);
                      setShowModal(true)
                    }}
                    onBlur={showSaveModal}
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

              <div className={`flex justify-between items-center ${styles.layout.item.padding} ${styles.layout.item.borderBottom} ${styles.layout.item.background}`}>
                <span className={`${styles.typography.itemLabel.className} ${styles.typography.itemLabel.textColor}`}>c) Mostrar NOMBRE COMERCIAL en Login</span>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editableConfig.mostrarNombreComercial}
                    onChange={() => {
                      const newValue = !editableConfig.mostrarNombreComercial;
                      handleConfigChange('mostrarNombreComercial', newValue);
                      if (!newValue) {
                        handleConfigChange('nombrecomerciallogin', 'CONFIANZA SCGC');
                      }
                      showSaveModal();
                    }}
                    className={`${styles.forms.checkbox.size} ${styles.forms.checkbox.color} ${styles.forms.checkbox.background} ${styles.forms.checkbox.border} ${styles.forms.checkbox.rounded} ${styles.forms.checkbox.focusRing}`}
                  />
                  {editableConfig.mostrarNombreComercial && (
                    <select
                      value={editableConfig.nombrecomerciallogin}
                      onChange={handleEmpresaChange}
                      onBlur={showSaveModal}
                      className={`${styles.forms.select.padding} ${styles.forms.select.fontSize} ${styles.forms.select.fontWeight} ${styles.forms.select.textColor} ${styles.forms.select.border} ${styles.forms.select.rounded}`}
                      style={{ backgroundColor: styles.forms.select.background }}
                    >
                      {editableConfig.nombrecomerciallogin && !empresas.some(e => e.commercialName === editableConfig.nombrecomerciallogin) && (
                        <option style={{ color: styles.forms.select.optionTextColor, backgroundColor: styles.forms.select.optionBgColor }} value={editableConfig.nombrecomerciallogin}>{editableConfig.nombrecomerciallogin}</option>
                      )}
                      {empresas.map(emp => (
                        <option key={emp.codeCompany} style={{ color: styles.forms.select.optionTextColor, backgroundColor: styles.forms.select.optionBgColor }} value={emp.commercialName}>
                          {emp.commercialName || 'CONFIANZA SCGC'}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className={`flex justify-between items-center ${styles.layout.item.padding} ${styles.layout.item.borderBottom} ${styles.layout.item.background}`}>
                <span className={`${styles.typography.itemLabel.className} ${styles.typography.itemLabel.textColor}`}>d) Mostrar Logo en Fondo de Login</span>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editableConfig.mostrarImagenLogo}
                    onChange={() => { handleConfigChange('mostrarImagenLogo', !editableConfig.mostrarImagenLogo); showSaveModal(); }}
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

              <div className={`flex justify-between items-center ${styles.layout.item.padding} ${styles.layout.item.borderBottom} ${styles.layout.item.background}`}>
                <span className={`${styles.typography.itemLabel.className} ${styles.typography.itemLabel.textColor}`}>e) Permitir acceso a Manager System a otro Usuario</span>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editableConfig.permitirAccesoManager}
                    onChange={() => { handleConfigChange('permitirAccesoManager', !editableConfig.permitirAccesoManager); showSaveModal(); }}
                    className={`${styles.forms.checkbox.size} ${styles.forms.checkbox.color} ${styles.forms.checkbox.background} ${styles.forms.checkbox.border} ${styles.forms.checkbox.rounded} ${styles.forms.checkbox.focusRing}`}
                  />
                  {editableConfig.permitirAccesoManager && (
                    <select
                      value={selectedUsuario}
                      onChange={handleUsuarioChange}
                      onBlur={showSaveModal}
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

              <div className={`flex justify-between items-center ${styles.layout.item.padding} ${styles.layout.item.borderBottom} ${styles.layout.item.background}`}>
                <span className={`${styles.typography.itemLabel.className} ${styles.typography.itemLabel.textColor}`}>f) Cerrado automático de SESIÓN inactiva (20 a 30 min)</span>
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={editableConfig.sesionInactiva}
                    onChange={(e) => { handleConfigChange('sesionInactiva', e.target.checked); showSaveModal(); }}
                    className={`${styles.forms.checkbox.size} ${styles.forms.checkbox.color} ${styles.forms.checkbox.background} ${styles.forms.checkbox.border} ${styles.forms.checkbox.rounded} ${styles.forms.checkbox.focusRing}`}
                  />
                  {editableConfig.sesionInactiva && (
                    <input
                      type="number"
                      min={20}
                      max={30}
                      value={editableConfig.valorSesionInactiva}
                      onChange={handleNumericChange('valorSesionInactiva', 20, 30)}
                      onBlur={showSaveModal}
                      className={`${styles.forms.input.width} ${styles.forms.input.padding} ${styles.forms.input.border} ${styles.forms.input.rounded} ${styles.forms.input.fontSize} ${styles.forms.input.focusOutline}`}
                      disabled={!editableConfig.sesionInactiva}
                      style={{backgroundColor: !editableConfig.sesionInactiva ? styles.conditionalStyles.disabledInput : 'white'}}
                    />
                  )}
                </div>
              </div>

              <div className={`flex justify-between items-center ${styles.layout.item.padding} ${styles.layout.item.borderBottom} ${styles.layout.item.background}`}>
                <span className={`${styles.typography.itemLabel.className} ${styles.typography.itemLabel.textColor}`}>g) Opción justificar SESIÓN PAUSADA (10 a 15 min)</span>
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={editableConfig.justificarPausa}
                    onChange={(e) => { handleConfigChange('justificarPausa', e.target.checked); showSaveModal(); }}
                    className={`${styles.forms.checkbox.size} ${styles.forms.checkbox.color} ${styles.forms.checkbox.background} ${styles.forms.checkbox.border} ${styles.forms.checkbox.rounded} ${styles.forms.checkbox.focusRing}`}
                  />
                  {editableConfig.justificarPausa && (
                    <input
                      type="number"
                      min={10}
                      max={15}
                      value={editableConfig.valorJustificarPausa}
                      onChange={handleNumericChange('valorJustificarPausa', 10, 15)}
                      onBlur={showSaveModal}
                      className={`${styles.forms.input.width} ${styles.forms.input.padding} ${styles.forms.input.border} ${styles.forms.input.rounded} ${styles.forms.input.fontSize} ${styles.forms.input.focusOutline}`}
                      disabled={!editableConfig.justificarPausa}
                      style={{backgroundColor: !editableConfig.justificarPausa ? styles.conditionalStyles.disabledInput : 'white'}}
                    />
                  )}
                </div>
              </div>

              <div className={`flex justify-between items-center ${styles.layout.item.padding} ${styles.layout.item.borderBottom} ${styles.layout.item.background}`}>
                <span className={`${styles.typography.itemLabel.className} ${styles.typography.itemLabel.textColor}`}>h) Opción reportar tareas durante pausa (60, 120 o 240 min)</span>
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={editableConfig.reportarTareasPausa}
                    onChange={(e) => { handleConfigChange('reportarTareasPausa', e.target.checked); showSaveModal(); }}
                    className={`${styles.forms.checkbox.size} ${styles.forms.checkbox.color} ${styles.forms.checkbox.background} ${styles.forms.checkbox.border} ${styles.forms.checkbox.rounded} ${styles.forms.checkbox.focusRing}`}
                  />
                  {editableConfig.reportarTareasPausa && (
                    <select
                      value={editableConfig.valorReportarTareasPausa || 60}
                      onChange={(e) => { handleConfigChange('valorReportarTareasPausa', Number(e.target.value)); showSaveModal(); }}
                      onBlur={showSaveModal}
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

              <div className={`flex justify-between items-center ${styles.layout.item.padding} ${styles.layout.item.borderBottom} ${styles.layout.item.background}`}>
                <span className={`${styles.typography.itemLabel.className} ${styles.typography.itemLabel.textColor}`}>i) Opción reportar proyecto/tareas después de pausa (120 o 240 min)</span>
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={editableConfig.reportarProyectoTareas}
                    onChange={(e) => { handleConfigChange('reportarProyectoTareas', e.target.checked); showSaveModal(); }}
                    className={`${styles.forms.checkbox.size} ${styles.forms.checkbox.color} ${styles.forms.checkbox.background} ${styles.forms.checkbox.border} ${styles.forms.checkbox.rounded} ${styles.forms.checkbox.focusRing}`}
                  />
                  {editableConfig?.reportarProyectoTareas && (
                    <select
                      value={editableConfig?.valorReportarProyectoTareas ?? 120}
                      onChange={(e) => { handleConfigChange('valorReportarProyectoTareas', Number(e.target.value)); showSaveModal(); }}
                      onBlur={showSaveModal}
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

            <Subcategory id="configuraciones" title="2. Configuraciones" isOpen={openSubcategories['configuraciones']}>
              <div className={`flex justify-between items-center ${styles.misc.tableHeader.padding} ${styles.misc.tableHeader.borderBottom} ${styles.misc.tableHeader.background} ${styles.misc.tableHeader.fontWeight} ${styles.misc.tableHeader.textColor} text-sm`}>
                <span className="flex-1">Opción</span>
                <div className="grid grid-cols-3 w-1/2">
                  <span className="text-center">Habilitado</span>
                  <span className="text-center"></span>
                  <span className="text-center">Estado</span>
                </div>
              </div>

              <div className={`flex justify-between items-center ${styles.layout.item.padding} ${styles.layout.item.borderBottom} ${styles.layout.item.background}`}>
                <span className={`${styles.typography.itemLabel.className} ${styles.typography.itemLabel.textColor} flex-1`}>a) AMBIENTE DE TRABAJO PRUEBA: habilitar registros de Prueba</span>
                <div className="grid grid-cols-3 w-1/2 items-center">
                  <div className="flex justify-center">
                    <input
                      type="checkbox"
                      checked={configuraciones.ambienteTrabajo.checked}
                      onChange={(e) => { handleConfiguracionChange('ambienteTrabajo', 'checked', e.target.checked); showSaveModal(); }}
                      className={`${styles.forms.checkbox.size} ${styles.forms.checkbox.color} ${styles.forms.checkbox.background} ${styles.forms.checkbox.border} ${styles.forms.checkbox.rounded} ${styles.forms.checkbox.focusRing}`}
                    />
                  </div>
                  <div className="flex justify-center">
                    <select
                      value={configuraciones.ambienteTrabajo.modo}
                      onChange={(e) => { handleConfiguracionChange('ambienteTrabajo', 'modo', e.target.value); }}
                      onBlur={showSaveModal}
                      disabled={!configuraciones.ambienteTrabajo.checked}
                      className={`${styles.forms.select.padding} ${styles.forms.select.fontSize} ${styles.forms.select.fontWeight} ${styles.forms.select.textColor} ${styles.forms.select.border} ${styles.forms.select.rounded}`}
                      style={{ backgroundColor: configuraciones.ambienteTrabajo.checked ? styles.forms.select.background : styles.forms.select.disabledBackground }}
                    >
                      <option style={{ color: styles.forms.select.optionTextColor, backgroundColor: styles.forms.select.optionBgColor }} value="TODO_SISTEMA">TODO SISTEMA</option>
                      <option style={{ color: styles.forms.select.optionTextColor, backgroundColor: styles.forms.select.optionBgColor }} value="MODULO">MÓDULO</option>
                    </select>
                  </div>
                  <div className="flex justify-center">
                    <span className={`${styles.typography.itemLabel.className} ${styles.typography.textSecondary}`}>
                      {configuraciones.ambienteTrabajo.checked ? 'PRUEBA' : 'PRODUCCION'}
                    </span>
                  </div>
                </div>
              </div>

              <div className={`flex justify-between items-center ${styles.layout.item.padding} ${styles.layout.item.borderBottom} ${styles.layout.item.background}`}>
                <span className={`${styles.typography.itemLabel.className} ${styles.typography.itemLabel.textColor} flex-1`}>b) ELIMINAR REGISTROS DE PRUEBA</span>
                <div className="grid grid-cols-3 w-1/2 items-center">
                  <div className="flex justify-center">
                    <input
                      type="checkbox"
                      checked={configuraciones.eliminarRegistros.checked}
                      onChange={(e) => { handleConfiguracionChange('eliminarRegistros', 'checked', e.target.checked); showSaveModal(); }}
                      className={`${styles.forms.checkbox.size} ${styles.forms.checkbox.color} ${styles.forms.checkbox.background} ${styles.forms.checkbox.border} ${styles.forms.checkbox.rounded} ${styles.forms.checkbox.focusRing}`}
                    />
                  </div>
                  <div />
                  <div className="flex justify-center">
                    <span className={`${styles.typography.itemLabel.className} ${styles.typography.textSecondary}`}>
                      {configuraciones.eliminarRegistros.checked ? 'Puede eliminar' : 'No puede'}
                    </span>
                  </div>
                </div>
              </div>
            </Subcategory>
          </Category>

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

      {/* Modales */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg">
            <h2 className="text-lg font-semibold mb-4">{modalContent.title}</h2>
            <p className="mb-6">{modalContent.message}</p>
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
                onClick={() => setShowModal(false)}
              >
                Rechazar
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={executeSave}
                disabled={saving}
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <SuccessModal 
          message="Cambios guardados con éxito"
          onClose={() => setShowSuccessModal(false)}
        />
      )}

      {showNavBlockerModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Salir sin guardar</h2>
            <p className="mb-6">Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?</p>
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
                onClick={() => {
                  setShowNavBlockerModal(false);
                  if (blocker) blocker.reset();
                }}
              >
                No, quedarse
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={() => {
                  setShowNavBlockerModal(false);
                  if (blocker) blocker.proceed();
                }}
              >
                Sí, salir
              </button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
};

export default ConfiguracionPage;