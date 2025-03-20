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
  // Base button classes
  const baseClasses = "font-medium rounded focus:outline-none transition-all duration-200";
  
  // Variant specific classes
  const variantClasses = {
    primary: "bg-primary text-white hover:bg-primary-light",
    secondary: "bg-secondary text-black hover:bg-secondary-dark",
    outline: "bg-transparent border border-primary text-primary hover:bg-primary hover:text-white",
    text: "bg-transparent text-primary hover:underline",
    success: "bg-success text-white hover:bg-success-dark",
    danger: "bg-error text-white hover:bg-error-dark"
  };
  
  // Size specific classes
  const sizeClasses = {
    small: "py-1 px-3 text-sm",
    medium: "py-2 px-4 text-base",
    large: "py-3 px-6 text-lg"
  };
  
  // Combine all classes
  const buttonClasses = `
    ${baseClasses}
    ${variantClasses[variant] || variantClasses.primary}
    ${sizeClasses[size] || sizeClasses.medium}
    ${fullWidth ? 'w-full' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
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
  className: PropTypes.string
};

export default Button;