import React from 'react';
import PropTypes from 'prop-types';

/**
 * Reusable Button component
 * @param {Object} props - Component props
 */
const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  onClick,
  className = '',
  ...rest
}) => {
  // Determine button class based on variant
  const getVariantClass = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary text-white hover:bg-primary-light';
      case 'secondary':
        return 'bg-secondary text-black hover:bg-secondary-dark';
      case 'outline':
        return 'bg-transparent border border-primary text-primary hover:bg-primary hover:text-white';
      case 'text':
        return 'bg-transparent text-primary hover:underline';
      case 'success':
        return 'bg-success text-white hover:bg-success-dark';
      case 'danger':
        return 'bg-error text-white hover:bg-error-dark';
      default:
        return 'bg-primary text-white hover:bg-primary-light';
    }
  };

  // Determine button size class
  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return 'py-1 px-3 text-sm';
      case 'medium':
        return 'py-2 px-4 text-base';
      case 'large':
        return 'py-3 px-6 text-lg';
      default:
        return 'py-2 px-4 text-base';
    }
  };

  const buttonClasses = `
    btn
    ${getVariantClass()}
    ${getSizeClass()}
    ${fullWidth ? 'w-full' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    rounded
    font-medium
    transition-all
    duration-200
    ${className}
  `;

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'text', 'success', 'danger']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export default Button;