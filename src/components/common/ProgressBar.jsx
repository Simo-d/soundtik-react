import React from 'react';
import PropTypes from 'prop-types';

/**
 * Reusable progress bar component
 * @param {Object} props - Component props
 */
const ProgressBar = ({
  progress = 0,
  height = 8,
  color = 'primary',
  backgroundColor = 'gray-200',
  rounded = true,
  showPercentage = false,
  percentagePosition = 'right',
  className = '',
  animate = true,
  label = '',
  labelPosition = 'top',
}) => {
  // Get color class based on color prop
  const getColorClass = () => {
    switch (color) {
      case 'primary':
        return 'bg-primary';
      case 'secondary':
        return 'bg-secondary';
      case 'success':
        return 'bg-success';
      case 'error':
        return 'bg-error';
      default:
        return `bg-${color}`;
    }
  };

  // Ensure progress is between 0 and 100
  const normalizedProgress = Math.max(0, Math.min(100, progress));

  // Generate styles for progress indicator
  const progressStyle = {
    width: `${normalizedProgress}%`,
    height: `${height}px`,
    transition: animate ? 'width 0.3s ease-in-out' : 'none',
  };

  // Format percentage for display
  const formattedPercentage = `${Math.round(normalizedProgress)}%`;

  // Render percentage label
  const renderPercentage = () => {
    if (!showPercentage) return null;

    if (percentagePosition === 'inside') {
      return (
        <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium">
          {formattedPercentage}
        </span>
      );
    }

    return (
      <span className={`text-sm text-gray-700 ml-2 ${percentagePosition === 'left' ? 'order-first mr-2' : ''}`}>
        {formattedPercentage}
      </span>
    );
  };

  // Render label
  const renderLabel = () => {
    if (!label) return null;

    return (
      <div className={`text-sm font-medium text-gray-700 ${labelPosition === 'bottom' ? 'mt-1' : 'mb-1'}`}>
        {label}
      </div>
    );
  };

  return (
    <div className={`progress-bar ${className}`}>
      {labelPosition === 'top' && renderLabel()}

      <div className={`flex items-center ${percentagePosition === 'left' ? 'flex-row-reverse' : ''}`}>
        <div 
          className={`w-full bg-${backgroundColor} relative overflow-hidden ${rounded ? 'rounded-full' : ''}`}
          style={{ height: `${height}px` }}
        >
          <div 
            className={`${getColorClass()} ${rounded ? 'rounded-full' : ''} h-full`}
            style={progressStyle}
          ></div>
          {percentagePosition === 'inside' && renderPercentage()}
        </div>
        {(percentagePosition === 'right' || percentagePosition === 'left') && renderPercentage()}
      </div>

      {labelPosition === 'bottom' && renderLabel()}
    </div>
  );
};

ProgressBar.propTypes = {
  progress: PropTypes.number,
  height: PropTypes.number,
  color: PropTypes.string,
  backgroundColor: PropTypes.string,
  rounded: PropTypes.bool,
  showPercentage: PropTypes.bool,
  percentagePosition: PropTypes.oneOf(['left', 'right', 'inside']),
  className: PropTypes.string,
  animate: PropTypes.bool,
  label: PropTypes.string,
  labelPosition: PropTypes.oneOf(['top', 'bottom']),
};

export default ProgressBar;