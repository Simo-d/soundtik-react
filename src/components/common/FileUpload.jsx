import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import Button from './Button';

/**
 * File upload component with preview capability
 * @param {Object} props - Component props
 */
const FileUpload = ({
  accept,
  id,
  name,
  label,
  onChange,
  error,
  helperText,
  required = false,
  className = '',
  disabled = false,
  multiple = false,
  previewType = 'none', // 'none', 'image', 'audio'
  previewUrl = '',
  uploading = false,
  progress = 0,
  showProgressBar = true,
  buttonText = 'Choose File',
  onRemove,
  maxSize
}) => {
  const [fileSelected, setFileSelected] = useState(!!previewUrl);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      setFileSelected(true);
      setFileName(multiple ? `${files.length} files selected` : files[0].name);
      
      // Validate file size
      if (maxSize && files[0].size > maxSize * 1024 * 1024) {
        onChange({ error: `File exceeds maximum size of ${maxSize}MB` });
        return;
      }
      
      onChange(files);
    } else {
      setFileSelected(false);
      setFileName('');
    }
  };

  // Trigger file input click
  const handleButtonClick = () => {
    if (!disabled && !uploading) {
      fileInputRef.current.click();
    }
  };

  // Handle file removal
  const handleRemove = () => {
    setFileSelected(false);
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onRemove) {
      onRemove();
    }
  };

  // Render image preview
  const renderImagePreview = () => {
    if (previewType === 'image' && previewUrl) {
      return (
        <div className="mt-2 relative">
          <img 
            src={previewUrl} 
            alt="Preview" 
            className="max-w-full h-auto max-h-48 rounded shadow-sm" 
          />
          {!disabled && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm"
              aria-label="Remove image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-error" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      );
    }
    return null;
  };

  // Render audio preview
  const renderAudioPreview = () => {
    if (previewType === 'audio' && previewUrl) {
      return (
        <div className="mt-2">
          <audio 
            controls 
            src={previewUrl} 
            className="w-full"
          >
            Your browser does not support the audio element.
          </audio>
          {!disabled && (
            <button
              type="button"
              onClick={handleRemove}
              className="mt-1 text-error text-sm flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Remove audio
            </button>
          )}
        </div>
      );
    }
    return null;
  };

  // Render progress bar
  const renderProgressBar = () => {
    if (uploading && showProgressBar) {
      return (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-primary h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">{progress}% uploaded</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label 
          htmlFor={id} 
          className="block mb-1 font-medium"
        >
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        id={id}
        name={name}
        accept={accept}
        onChange={handleFileChange}
        disabled={disabled || uploading}
        multiple={multiple}
        className="hidden"
        required={required}
      />
      
      <div className="flex items-center">
        <Button
          type="button"
          variant={fileSelected ? "secondary" : "primary"}
          onClick={handleButtonClick}
          disabled={disabled || uploading}
        >
          {buttonText}
        </Button>
        
        {fileSelected && fileName && (
          <span className="ml-3 text-sm truncate max-w-xs">{fileName}</span>
        )}
      </div>
      
      {renderImagePreview()}
      {renderAudioPreview()}
      {renderProgressBar()}
      
      {(error || helperText) && (
        <div className={`mt-1 text-sm ${error ? 'text-error' : 'text-gray-500'}`}>
          {error || helperText}
        </div>
      )}
    </div>
  );
};

FileUpload.propTypes = {
  accept: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  helperText: PropTypes.string,
  required: PropTypes.bool,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  multiple: PropTypes.bool,
  previewType: PropTypes.oneOf(['none', 'image', 'audio']),
  previewUrl: PropTypes.string,
  uploading: PropTypes.bool,
  progress: PropTypes.number,
  showProgressBar: PropTypes.bool,
  buttonText: PropTypes.string,
  onRemove: PropTypes.func,
  maxSize: PropTypes.number, // in MB
};

export default FileUpload;