import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const SearchBar = ({
  onSearch,
  placeholder = 'Buscar...',
  className = '',
  showClearButton = false,
  value = '',
  onChange = () => {},
  showSearchButton = true,
  searchIconColor = '#ffffff',
}) => {
  const [searchTerm, setSearchTerm] = useState(value);

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  const handleInputChange = (value) => {
    setSearchTerm(value);
    onChange(value);
  };

  const handleClear = () => {
    setSearchTerm('');
    onChange('');
    onSearch('');
  };

  const handleSearchClick = () => {
    onSearch(searchTerm);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearchClick()}
          placeholder={placeholder}
          className="w-full px-4 py-1.5 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {showClearButton && searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            type="button"
            aria-label="Limpiar búsqueda"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
        {showSearchButton && (
          <button
            onClick={handleSearchClick}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white hover:bg-blue-700 p-1.5 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            type="button"
            aria-label="Buscar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

SearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  showClearButton: PropTypes.bool,
  value: PropTypes.string,
  onChange: PropTypes.func,
  showSearchButton: PropTypes.bool,
};

export default SearchBar; 