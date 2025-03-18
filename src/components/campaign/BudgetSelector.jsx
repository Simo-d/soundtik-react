import React, { useState, useEffect } from 'react';
import { useFormContext } from '../../contexts/FormContext';
import Input from '../common/Input';
import Button from '../common/Button';

/**
 * Budget and duration selector component - part of the third step of campaign creation
 */
const BudgetSelector = ({ onBudgetSet }) => {
  const { formData, updateFormData, errors } = useFormContext();
  
  // Local state for form handling
  const [localErrors, setLocalErrors] = useState({});
  const [estimatedReach, setEstimatedReach] = useState({
    min: 0,
    max: 0
  });
  
  // Budget options
  const budgetOptions = [
    { value: 100, label: "$100" },
    { value: 250, label: "$250" },
    { value: 500, label: "$500" },
    { value: 1000, label: "$1,000" },
    { value: 2500, label: "$2,500" },
    { value: 5000, label: "$5,000" },
    { value: 10000, label: "$10,000" },
    { value: "custom", label: "Custom" }
  ];
  
  // Duration options
  const durationOptions = [
    { value: 7, label: "1 week" },
    { value: 14, label: "2 weeks" },
    { value: 30, label: "1 month" },
    { value: 60, label: "2 months" },
    { value: 90, label: "3 months" },
    { value: "custom", label: "Custom" }
  ];
  
  // Local state for form values
  const [selectedBudget, setSelectedBudget] = useState(formData.campaignDetails.budget || budgetOptions[0].value);
  const [customBudget, setCustomBudget] = useState(
    formData.campaignDetails.budget && !budgetOptions.some(opt => opt.value === formData.campaignDetails.budget) 
      ? formData.campaignDetails.budget 
      : ""
  );
  const [selectedDuration, setSelectedDuration] = useState(formData.campaignDetails.duration || durationOptions[0].value);
  const [customDuration, setCustomDuration] = useState(
    formData.campaignDetails.duration && !durationOptions.some(opt => opt.value === formData.campaignDetails.duration) 
      ? formData.campaignDetails.duration 
      : ""
  );
  
  // Calculate estimated reach based on budget and duration
  useEffect(() => {
    const budget = selectedBudget === "custom" ? parseFloat(customBudget) || 0 : selectedBudget;
    const duration = selectedDuration === "custom" ? parseInt(customDuration) || 0 : selectedDuration;
    
    // Simple formula: $1 = ~100-200 views
    // Adjust based on your actual metrics or estimation logic
    const baseReach = budget * 150;
    const durationMultiplier = Math.sqrt(duration / 30); // Square root for diminishing returns
    
    const estimatedBaseReach = Math.round(baseReach * durationMultiplier);
    setEstimatedReach({
      min: Math.round(estimatedBaseReach * 0.8), // 20% lower bound
      max: Math.round(estimatedBaseReach * 1.2), // 20% upper bound
    });
  }, [selectedBudget, customBudget, selectedDuration, customDuration]);
  
  // Handle budget option selection
  const handleBudgetSelect = (value) => {
    setSelectedBudget(value);
    if (value !== "custom") {
      updateFormData('campaignDetails', { budget: value });
    }
  };
  
  // Handle custom budget input
  const handleCustomBudgetChange = (e) => {
    const value = e.target.value;
    setCustomBudget(value);
    
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      updateFormData('campaignDetails', { budget: numValue });
      setLocalErrors(prev => ({ ...prev, budget: '' }));
    } else {
      setLocalErrors(prev => ({ ...prev, budget: 'Please enter a valid budget' }));
    }
  };
  
  // Handle duration option selection
  const handleDurationSelect = (value) => {
    setSelectedDuration(value);
    if (value !== "custom") {
      updateFormData('campaignDetails', { duration: value });
    }
  };
  
  // Handle custom duration input
  const handleCustomDurationChange = (e) => {
    const value = e.target.value;
    setCustomDuration(value);
    
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0) {
      updateFormData('campaignDetails', { duration: numValue });
      setLocalErrors(prev => ({ ...prev, duration: '' }));
    } else {
      setLocalErrors(prev => ({ ...prev, duration: 'Please enter a valid number of days' }));
    }
  };
  
  // Handle continue
  const handleContinue = () => {
    // Validate budget and duration
    const newErrors = {};
    
    const budget = selectedBudget === "custom" ? parseFloat(customBudget) : selectedBudget;
    if (!budget || budget <= 0) {
      newErrors.budget = 'Please select a valid budget';
    }
    
    const duration = selectedDuration === "custom" ? parseInt(customDuration) : selectedDuration;
    if (!duration || duration <= 0) {
      newErrors.duration = 'Please select a valid duration';
    }
    
    setLocalErrors(newErrors);
    
    // If no errors, continue
    if (Object.keys(newErrors).length === 0) {
      onBudgetSet();
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <h3 className="text-xl font-bold mb-4">Campaign Budget & Duration</h3>
      
      {/* Budget Selection */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">
          Select Your Budget
        </label>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          {budgetOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`
                py-2 px-4 border rounded-md text-center transition-all
                ${selectedBudget === option.value 
                  ? 'bg-primary text-white border-primary' 
                  : 'bg-white text-gray-700 border-gray-300 hover:border-primary'}
              `}
              onClick={() => handleBudgetSelect(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
        
        {selectedBudget === "custom" && (
          <Input
            type="number"
            id="customBudget"
            name="customBudget"
            label="Enter Custom Budget ($)"
            value={customBudget}
            onChange={handleCustomBudgetChange}
            min={50}
            step={50}
            error={localErrors.budget || errors.budget}
            required
          />
        )}
      </div>
      
      {/* Duration Selection */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">
          Select Campaign Duration
        </label>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
          {durationOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`
                py-2 px-4 border rounded-md text-center transition-all
                ${selectedDuration === option.value 
                  ? 'bg-primary text-white border-primary' 
                  : 'bg-white text-gray-700 border-gray-300 hover:border-primary'}
              `}
              onClick={() => handleDurationSelect(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
        
        {selectedDuration === "custom" && (
          <Input
            type="number"
            id="customDuration"
            name="customDuration"
            label="Enter Custom Duration (days)"
            value={customDuration}
            onChange={handleCustomDurationChange}
            min={1}
            step={1}
            error={localErrors.duration || errors.duration}
            required
          />
        )}
      </div>
      
      {/* Estimated Reach */}
      <div className="mb-8 p-4 bg-gray-50 rounded-md border border-gray-200">
        <h4 className="text-lg font-medium mb-2">Estimated Reach</h4>
        <p className="text-gray-600 mb-2">
          Based on your budget and duration, your campaign could reach:
        </p>
        <p className="text-2xl font-bold text-primary">
          {estimatedReach.min.toLocaleString()} - {estimatedReach.max.toLocaleString()} views
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Note: Actual results may vary based on content quality, audience targeting, and market conditions.
        </p>
      </div>
      
      <div className="flex justify-end">
        <Button
          type="button"
          variant="primary"
          onClick={handleContinue}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default BudgetSelector;