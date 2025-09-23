import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ActionButtons, { LoadingOverlay } from './Buttons';
import SearchBar from './SearchBar';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './datepicker-custom.css'; // Importamos nuestros estilos personalizados
import { registerLocale } from 'react-datepicker';
import es from 'date-fns/locale/es';

// Registrar el idioma español
registerLocale('es', es);

/**
 * Modal de filtros reutilizable para todo el sistema.
 * @param {boolean} isOpen - Controla si el modal está abierto
 * @param {function} onClose - Función para cerrar el modal
 * @param {function} onApplyFilters - Función que se ejecuta al aplicar los filtros
 * @param {object} initialFilters - Filtros iniciales (opcional)
 * @param {array} filterConfig - Configuración de los filtros a mostrar
 * @param {string} title - Título del modal
 */
const FilterModal = ({
  isOpen,
  onClose,
  onApplyFilters,
  initialFilters = {},
  filterConfig = [],
  title = 'Filtros',
}) => {
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Inicializar filtros cuando cambia initialFilters
  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  // Si el modal no está abierto, no renderizar nada
  if (!isOpen) return null;

  // Manejar cambios en los campos de filtro
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar cambios en los campos de tipo checkbox
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    console.log(`Checkbox ${name} cambiado a: ${checked}`);
    
    // Caso especial para los checkboxes de usuario activo/inactivo
    if (name === 'usuarioActivo' || name === 'usuarioInactivo') {
      const otherName = name === 'usuarioActivo' ? 'usuarioInactivo' : 'usuarioActivo';
      
      // Simplemente actualizar ambos valores directamente
      setFilters(prev => ({
        ...prev,
        [name]: checked,
        [otherName]: checked ? false : prev[otherName] // Si este se marca, el otro se desmarca
      }));
      return;
    }
    
    // Para el resto de checkboxes, buscar si tienen relación
    const relatedFilter = filterConfig.find(filter => 
      filter.type === 'checkbox' && 
      filter.name === name && 
      filter.secondCheckbox
    );
    
    const isSecondCheckbox = filterConfig.some(filter => 
      filter.type === 'checkbox' && 
      filter.secondCheckbox && 
      filter.secondCheckbox.name === name
    );
    
    // Si es un checkbox con relación
    if (relatedFilter || isSecondCheckbox) {
      let primaryName, secondaryName;
      
      if (relatedFilter) {
        primaryName = name;
        secondaryName = relatedFilter.secondCheckbox.name;
      } else {
        const primaryFilter = filterConfig.find(filter => 
          filter.type === 'checkbox' && 
          filter.secondCheckbox && 
          filter.secondCheckbox.name === name
        );
        primaryName = primaryFilter.name;
        secondaryName = name;
      }
      
      setFilters(prev => ({
        ...prev,
        [name]: checked,
        [name === primaryName ? secondaryName : primaryName]: checked ? false : prev[name === primaryName ? secondaryName : primaryName]
      }));
      return;
    }
    
    // Para checkboxes sin relación
    handleFilterChange(name, checked);
  };

  // Manejar cambios en los campos de tipo select
  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    handleFilterChange(name, value);
  };

  // Manejar cambios en los campos de tipo input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    handleFilterChange(name, value);
  };

  // Manejar cambios en los campos de tipo fecha
  const handleDateChange = (name, date) => {
    // Si la fecha es null (cuando se limpia el campo), actualizar el estado
    if (date === null) {
      handleFilterChange(name, null);
      return;
    }
    
    // Si es una fecha válida, guardarla como objeto Date
    // El componente padre se encargará de formatearla según necesite
    handleFilterChange(name, date);
    
    console.log(`Fecha seleccionada para ${name}:`, date);
  };

  // Manejar búsqueda global
  const handleSearch = (term) => {
    setSearchTerm(term);
    handleFilterChange('searchTerm', term);
  };

  // Aplicar filtros
  const handleApplyFilters = () => {
    setLoading(true);
    
    // Preparar los filtros para enviarlos al componente padre
    const filtrosPreparados = { ...filters };
    
    // Formatear fechas en formato ISO para el backend si existen
    Object.keys(filtrosPreparados).forEach(key => {
      // Si el valor es una fecha (objeto Date), convertirla a formato ISO
      if (filtrosPreparados[key] instanceof Date) {
        filtrosPreparados[key] = filtrosPreparados[key].toISOString().split('T')[0]; // Formato YYYY-MM-DD
      }
    });
    
    // Enviar los filtros preparados al componente padre
    setTimeout(() => {
      onApplyFilters(filtrosPreparados);
      setLoading(false);
    }, 500);
  };

  // Limpiar todos los filtros
  const handleClearFilters = () => {
    const clearedFilters = {};
    
    // Mantener solo los campos que deben persistir (si hay alguno)
    filterConfig.forEach(filter => {
      if (filter.persistent) {
        clearedFilters[filter.name] = filters[filter.name];
      } else {
        // Establecer valores por defecto según el tipo
        switch (filter.type) {
          case 'checkbox':
            clearedFilters[filter.name] = false;
            break;
          case 'select':
            clearedFilters[filter.name] = '';
            break;
          case 'date':
            clearedFilters[filter.name] = '';
            break;
          default:
            clearedFilters[filter.name] = '';
        }
      }
    });
    
    setFilters(clearedFilters);
    setSearchTerm('');
  };

  // Renderizar campo de filtro según su tipo
  const renderFilterField = (filter) => {
    const { type, name, label, options, placeholder } = filter;

    switch (type) {
      case 'search':
        return (
          <div key={name} className="col-span-2 mt-4 mb-6">
            <SearchBar
              onSearch={handleSearch}
              placeholder={placeholder}
              value={searchTerm}
              label={label}
              onChange={setSearchTerm}
            />
          </div>
        );
      case 'checkbox':
        return (
          <div key={name} className="col-span-2 flex justify-between">
            <div className="flex items-center h-10">
              <label className="text-sm text-gray-700 font-medium">{label}</label>
              <input
                type="checkbox"
                name={name}
                checked={filters[name] || false}
                onChange={handleCheckboxChange}
                className="h-4 w-4 ml-2 rounded border-gray-200 text-blue-600 focus:ring-blue-500 outline-none"
              />
            </div>
            {filter.secondCheckbox && (
              <div className="flex items-center h-10">
                <label className="text-sm text-gray-700 font-medium">{filter.secondCheckbox.label}</label>
                <input
                  type="checkbox"
                  name={filter.secondCheckbox.name}
                  checked={filters[filter.secondCheckbox.name] || false}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 ml-2 rounded border-gray-200 text-blue-600 focus:ring-blue-500 outline-none"
                />
              </div>
            )}
          </div>
        );
      
      case 'select':
        return (
          <div key={name}>
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <select
              name={name}
              value={filters[name] || ''}
              onChange={handleSelectChange}
              className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:border-[#285398] focus:ring-0 px-2 py-1 bg-white hover:bg-gray-50 transition-colors outline-none"
            >
              <option value="">Seleccione una opción</option>
              {options && options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );
      
      case 'date':
        return (
          <div key={name}>
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-4 h-4 text-[#285398]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"/>
                </svg>
              </div>
              <DatePicker
                selected={filters[name] ? new Date(filters[name]) : null}
                onChange={(date) => handleDateChange(name, date)}
                dateFormat="dd/MM/yyyy"
                placeholderText="Seleccionar fecha"
                className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:border-[#285398] focus:ring-0 pl-10 pr-2 py-2 bg-white hover:bg-gray-50 transition-colors outline-none text-sm"
                locale="es"
                isClearable
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                calendarClassName="bg-white shadow-lg rounded-lg"
                popperClassName="z-[999999]"
                popperProps={{
                  strategy: 'fixed',
                  positionFixed: true
                }}
                popperModifiers={[
                  {
                    name: 'preventOverflow',
                    options: {
                      boundary: 'viewport',
                      padding: 20
                    }
                  },
                  {
                    name: 'flip',
                    options: {
                      fallbackPlacements: ['top', 'bottom']
                    }
                  }
                ]}
                portalId="root"
              />
            </div>
          </div>
        );
      
      case 'text':
      default:
        return (
          <div key={name}>
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <input
              type="text"
              name={name}
              value={filters[name] || ''}
              onChange={handleInputChange}
              placeholder={placeholder || ''}
              className="mt-1 block w-full rounded-md border border-gray-200 shadow-sm focus:border-[#285398] focus:ring-0 px-2 py-1 bg-white hover:bg-gray-50 transition-colors outline-none"
            />
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white py-6 px-10 rounded-lg shadow-lg w-[750px] max-h-[90vh] overflow-y-auto relative">
        {/* Overlay de carga */}
        {loading && <LoadingOverlay isLoading={true} message="Aplicando filtros..." />}
        
        {/* Botón cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold focus:outline-none"
          aria-label="Cerrar"
        >
          ×
                </button>

        {/* Header con título y botones */}
        <div className="grid grid-cols-2 items-center mb-2">
          <h2 className="text-2xl font-bold text-gray-800 pt-4">{title}</h2>
          <div className="flex justify-end gap-3 mr-[25px]">
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-4 py-1.5 text-sm font-medium rounded outline-none bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              Limpiar
            </button>
          </div>
        </div>
        <hr className="col-span-2 border-blue-500 mr-6 m-0 p-0" />



        {/* Contenido del formulario de filtros */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-4">
          {filterConfig.map(filter => renderFilterField(filter))}
        </div>

        {/* Botones de acción */}
        <div className="mt-6">
          <ActionButtons 
            onClose={onClose} 
            handleSubmit={handleApplyFilters} 
            disabled={false} 
            loading={loading}
            loadingText="Aplicando..." 
            submitText="Aplicar Filtros"
          />
        </div>
      </div>
    </div>
  );
};

FilterModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onApplyFilters: PropTypes.func.isRequired,
  initialFilters: PropTypes.object,
  filterConfig: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.oneOf(['text', 'select', 'checkbox', 'date', 'search']).isRequired,
      name: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      options: PropTypes.arrayOf(
        PropTypes.shape({
          value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
          label: PropTypes.string.isRequired
        })
      ),
      placeholder: PropTypes.string,
      persistent: PropTypes.bool
    })
  ),
  title: PropTypes.string
};

export default FilterModal;
