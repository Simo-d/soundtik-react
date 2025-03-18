import { useState, useCallback } from 'react';

/**
 * Custom hook for managing multi-step forms
 * @param {Array} steps - Array of step components or elements
 * @returns {Object} Form navigation controls and state
 */
export const useMultiStepForm = (steps) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formComplete, setFormComplete] = useState(false);

  /**
   * Move to the next step
   * @returns {boolean} - Whether the form has reached the end
   */
  const next = useCallback(() => {
    if (currentStepIndex >= steps.length - 1) {
      setFormComplete(true);
      return true;
    }
    
    setCurrentStepIndex(currentStepIndex + 1);
    return false;
  }, [currentStepIndex, steps.length]);

  /**
   * Move to the previous step
   */
  const back = useCallback(() => {
    setCurrentStepIndex(index => (index <= 0 ? 0 : index - 1));
  }, []);

  /**
   * Go to a specific step by index
   * @param {number} index - Index of the step to go to
   */
  const goTo = useCallback((index) => {
    if (index >= 0 && index < steps.length) {
      setCurrentStepIndex(index);
    }
  }, [steps.length]);

  /**
   * Reset the form to the first step
   */
  const reset = useCallback(() => {
    setCurrentStepIndex(0);
    setFormComplete(false);
  }, []);

  return {
    currentStepIndex,
    step: steps[currentStepIndex],
    steps,
    isFirstStep: currentStepIndex === 0,
    isLastStep: currentStepIndex === steps.length - 1,
    goTo,
    next,
    back,
    reset,
    formComplete
  };
};

export default useMultiStepForm;