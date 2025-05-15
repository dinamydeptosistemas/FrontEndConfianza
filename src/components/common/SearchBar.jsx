import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const SearchBar = ({
  onSearch,
  placeholder = 'Buscar...',
  className = '',
  showClearButton = true,
  value = '',
  onChange = () => {},
  showSearchButton = true,
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
    <div className={`relative ${className}`} style={{ width: 350 }}>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSearchClick()}
        placeholder={placeholder}
        className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {showClearButton && searchTerm && (
        <button
          onClick={handleClear}
          className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          type="button"
          aria-label="Limpiar búsqueda"
        >
          <svg
            className="w-5 h-5"
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
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-700 hover:bg-blue-800 text-white rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          type="button"
          aria-label="Buscar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
            />
          </svg>
        </button>
      )}
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