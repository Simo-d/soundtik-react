import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Reusable Input component
 * @param {Object} props - Component props
 * @param {React.Ref} ref - Forwarded ref
 */
const Input = forwardRef(({
  type = 'text',
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  helperText,
  disabled = false,
  required = false,
  className = '',
  labelClassName = '',
  inputClassName = '',
  min,
  max,
  step,
  ...rest
}, ref) => {
  // Base input classes
  const inputClasses = `
    form-input
    w-full
    px-3
    py-2
    border
    rounded
    focus:outline-none
    focus:ring-2
    focus:ring-primary
    focus:border-transparent
    transition
    duration-200
    ${error ? 'border-error' : 'border-gray-300'}
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
    ${inputClassName}
  `;

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label 
          htmlFor={id} 
          className={`block mb-1 font-medium ${labelClassName}`}
        >
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      
      <input
        ref={ref}
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={inputClasses}
        min={min}
        max={max}
        step={step}
        {...rest}
      />
      
      {(error || helperText) && (
        <div className={`mt-1 text-sm ${error ? 'text-error' : 'text-gray-500'}`}>
          {error || helperText}
        </div>
      )}
    </div>
  );
});

Input.propTypes = {
  type: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  className: PropTypes.string,
  labelClassName: PropTypes.string,
  inputClassName: PropTypes.string,
  min: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  max: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  step: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

Input.displayName = 'Input';

export default Input;