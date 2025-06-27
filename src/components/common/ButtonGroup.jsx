import React from 'react';
import PropTypes from 'prop-types';

const ButtonGroup = ({ buttons, className = '' }) => {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {buttons.map((button, index) => (
        <button
          key={index}
          onClick={button.onClick}
          disabled={button.disabled}
          className={`
            px-4 py-2 rounded-md font-medium transition-colors
            ${button.variant === 'primary' 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : button.variant === 'secondary'
              ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              : button.variant === 'danger'
              ? 'bg-red-600 text-white hover:bg-red-700'
              : button.variant === 'normal'
              ? 'bg-white text-[#1e4e9c] hover:bg-gray-200 hover:text-blue-600'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }
            ${button.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            ${button.className || ''}
          `}
          type={button.type || 'button'}
        >
          {button.icon && <span className="mr-2">{button.icon}</span>}
          {button.label}
        </button>
      ))}
    </div>
  );
};

ButtonGroup.propTypes = {
  buttons: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
      variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'default', 'normal']),
      disabled: PropTypes.bool,
      icon: PropTypes.node,
      type: PropTypes.string,
      className: PropTypes.string,
    })
  ).isRequired,
  className: PropTypes.string,
};

export default ButtonGroup; 