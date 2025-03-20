import React, { createContext, useState, useCallback, useContext } from 'react';
import { logFormStepComplete } from '../firebase/analytics';

// Create the context
export const FormContext = createContext();

/**
 * Custom hook to access form context
 * @returns {Object} Form context values and methods
 */
export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
};

/**
 * Form Provider component for managing multi-step form state
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const FormProvider = ({ children }) => {
  // Initialize form state with default values
  const [formData, setFormData] = useState({
    songDetails: {
      title: '',
      genre: '',
      mood: '',
      releaseDate: null,
      audioUrl: '', // This will now store the audio link provided by the artist
      coverArtUrl: '',
      lyrics: ''
    },
    artistDetails: {
      name: '',
      bio: '',
      socialLinks: {
        instagram: '',
        tiktok: '',
        spotify: '',
        youtube: ''
      },
      pressKit: ''
    },
    campaignDetails: {
      budget: 0,
      duration: 30,
      targetAudience: {
        ageRange: [],
        interests: [],
        locations: []
      },
      objectives: [],
      hashtags: []
    },
    paymentDetails: {
      stripePaymentId: '',
      amount: 0,
      status: 'pending',
      createdAt: null
    }
  });

  // Current step in the multi-step form
  const [currentStep, setCurrentStep] = useState(0);
  
  // Form validation state
  const [errors, setErrors] = useState({});
  
  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Update a section of the form data
   * @param {string} section - Section of the form (songDetails, artistDetails, etc.)
   * @param {Object} data - New data for the section
   */
  const updateFormData = useCallback((section, data) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...data
      }
    }));
  }, []);

  /**
   * Update a nested property in the form data
   * @param {string} section - Main section (songDetails, artistDetails, etc.)
   * @param {string} subsection - Subsection (socialLinks, targetAudience, etc.)
   * @param {Object} data - New data for the subsection
   */
  const updateNestedFormData = useCallback((section, subsection, data) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          ...data
        }
      }
    }));
  }, []);

  /**
   * Move to the next step in the form
   */
  const nextStep = useCallback(() => {
    const newStep = currentStep + 1;
    setCurrentStep(newStep);
    
    // Log analytics for step completion
    const stepNames = ['songDetails', 'artistDetails', 'campaignDetails', 'payment'];
    logFormStepComplete('campaign_creation', currentStep, stepNames[currentStep]);
  }, [currentStep]);

  /**
   * Move to the previous step in the form
   */
  const prevStep = useCallback(() => {
    setCurrentStep(currentStep > 0 ? currentStep - 1 : 0);
  }, [currentStep]);

  /**
   * Jump to a specific step in the form
   * @param {number} step - Step index to jump to
   */
  const goToStep = useCallback((step) => {
    setCurrentStep(step);
  }, []);

  /**
   * Validate the current form step
   * @returns {boolean} - Whether the current step is valid
   */
  const validateStep = useCallback(() => {
    const stepNames = ['songDetails', 'artistDetails', 'campaignDetails', 'paymentDetails'];
    const currentSection = stepNames[currentStep];
    let stepErrors = {};
    let isValid = true;

    // Validation logic for each step
    switch (currentSection) {
      case 'songDetails':
        if (!formData.songDetails.title) {
          stepErrors.title = 'Title is required';
          isValid = false;
        }
        if (!formData.songDetails.genre) {
          stepErrors.genre = 'Genre is required';
          isValid = false;
        }
        if (!formData.songDetails.audioUrl) {
          stepErrors.audioUrl = 'Audio link is required';
          isValid = false;
        }
        break;
        
      case 'artistDetails':
        if (!formData.artistDetails.name) {
          stepErrors.name = 'Artist name is required';
          isValid = false;
        }
        break;
        
      case 'campaignDetails':
        if (!formData.campaignDetails.budget || formData.campaignDetails.budget <= 0) {
          stepErrors.budget = 'Budget must be greater than 0';
          isValid = false;
        }
        if (!formData.campaignDetails.duration || formData.campaignDetails.duration < 7) {
          stepErrors.duration = 'Duration must be at least 7 days';
          isValid = false;
        }
        break;
        
      default:
        break;
    }

    setErrors(stepErrors);
    return isValid;
  }, [currentStep, formData]);

  /**
   * Reset the form to its initial state
   */
  const resetForm = useCallback(() => {
    setFormData({
      songDetails: {
        title: '',
        genre: '',
        mood: '',
        releaseDate: null,
        audioUrl: '',
        coverArtUrl: '',
        lyrics: ''
      },
      artistDetails: {
        name: '',
        bio: '',
        socialLinks: {
          instagram: '',
          tiktok: '',
          spotify: '',
          youtube: ''
        },
        pressKit: ''
      },
      campaignDetails: {
        budget: 0,
        duration: 30,
        targetAudience: {
          ageRange: [],
          interests: [],
          locations: []
        },
        objectives: [],
        hashtags: []
      },
      paymentDetails: {
        stripePaymentId: '',
        amount: 0,
        status: 'pending',
        createdAt: null
      }
    });
    setCurrentStep(0);
    setErrors({});
    setIsSubmitting(false);
  }, []);

  // Context value
  const value = {
    formData,
    currentStep,
    errors,
    isSubmitting,
    updateFormData,
    updateNestedFormData,
    nextStep,
    prevStep,
    goToStep,
    validateStep,
    resetForm,
    setIsSubmitting,
    setErrors
  };

  return (
    <FormContext.Provider value={value}>
      {children}
    </FormContext.Provider>
  );
};

export default FormContext;