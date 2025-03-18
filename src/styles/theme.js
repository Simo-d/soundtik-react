// Theme configuration for consistent styling across the application
const theme = {
    colors: {
      primary: '#6200EA',
      primaryLight: '#9d46ff',
      primaryDark: '#0a00b6',
      secondary: '#03DAC6',
      background: '#FFFFFF',
      surface: '#F5F5F5',
      error: '#B00020',
      success: '#00C853',
      text: '#000000',
      textSecondary: '#757575',
      border: '#E0E0E0',
    },
    fontSizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.25rem',
      xl: '1.5rem',
      xxl: '2rem',
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      xxl: '3rem',
    },
    borderRadius: {
      xs: '2px',
      sm: '4px',
      md: '8px',
      lg: '16px',
      xl: '24px',
      circle: '50%',
    },
    shadows: {
      sm: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
      md: '0 3px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.12)',
      lg: '0 10px 20px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.10)',
      xl: '0 15px 25px rgba(0,0,0,0.15), 0 5px 10px rgba(0,0,0,0.05)',
    },
    breakpoints: {
      xs: '480px',
      sm: '576px',
      md: '768px',
      lg: '992px',
      xl: '1200px',
    },
    transitions: {
      short: '0.15s ease',
      default: '0.3s ease',
      long: '0.5s ease',
    },
    zIndex: {
      navbar: 1000,
      dropdown: 1010,
      modal: 1050,
      toast: 1060,
    },
  };
  
  export default theme;