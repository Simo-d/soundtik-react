import React, { useState, useEffect } from 'react';
import { useFormContext } from '../../contexts/FormContext';
import Input from '../common/Input';
import Button from '../common/Button';
import ProgressBar from '../common/ProgressBar';

/**
 * Budget and duration selector component - part of the third step of campaign creation
 */
const BudgetSelector = ({ onBudgetSet, onNext }) => {
  const { formData, updateFormData, errors } = useFormContext();
  
  // Local state for form handling
  const [localErrors, setLocalErrors] = useState({});
  const [estimatedVideos, setEstimatedVideos] = useState(0);
  const [estimatedReach, setEstimatedReach] = useState({
    min: 0,
    max: 0
  });
  
  // Budget range settings
  const minBudget = 200;
  const maxBudget = 2000;
  
  // Budget options - replaced with a slider
  const [sliderBudget, setSliderBudget] = useState(
    formData.campaignDetails.budget || minBudget
  );
  
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
  const [selectedDuration, setSelectedDuration] = useState(formData.campaignDetails.duration || durationOptions[0].value);
  const [customDuration, setCustomDuration] = useState(
    formData.campaignDetails.duration && !durationOptions.some(opt => opt.value === formData.campaignDetails.duration) 
      ? formData.campaignDetails.duration 
      : ""
  );
  
  // Update form data when slider changes
  useEffect(() => {
    updateFormData('campaignDetails', { budget: sliderBudget });
  }, [sliderBudget, updateFormData]);
  
  // Calculate estimated videos based on budget
  useEffect(() => {
    // Formula: 1 video per $100, with slight scaling for larger budgets
    const baseVideos = Math.floor(sliderBudget / 100);
    const bonusVideos = Math.floor((sliderBudget / 1000) * 2); // 2 bonus videos per $1000
    const total = baseVideos + bonusVideos;
    
    setEstimatedVideos(total);
  }, [sliderBudget]);
  
  // Calculate estimated reach based on budget and duration
  useEffect(() => {
    const budget = sliderBudget;
    const duration = selectedDuration === "custom" ? parseInt(customDuration) || 0 : selectedDuration;
    
    // Formula: $1 = ~120-240 views, with bonus for longer durations
    const baseReach = budget * 180;
    const durationMultiplier = Math.sqrt(duration / 30); // Square root for diminishing returns
    
    const estimatedBaseReach = Math.round(baseReach * durationMultiplier);
    setEstimatedReach({
      min: Math.round(estimatedBaseReach * 0.8), // 20% lower bound
      max: Math.round(estimatedBaseReach * 1.2), // 20% upper bound
    });
  }, [sliderBudget, selectedDuration, customDuration]);
  
  // Handle slider change
  const handleSliderChange = (e) => {
    const value = parseInt(e.target.value);
    setSliderBudget(value);
    setLocalErrors(prev => ({ ...prev, budget: '' }));
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
  
  // Calculate percentage for progress bar
  const calculatePercentage = () => {
    return ((sliderBudget - minBudget) / (maxBudget - minBudget)) * 100;
  };
  
  // Handle continue
  const handleContinue = () => {
    // Validate budget and duration
    const newErrors = {};
    
    if (!sliderBudget || sliderBudget < minBudget) {
      newErrors.budget = `Minimum budget is $${minBudget}`;
    }
    
    const duration = selectedDuration === "custom" ? parseInt(customDuration) : selectedDuration;
    if (!duration || duration <= 0) {
      newErrors.duration = 'Please select a valid duration';
    }
    
    setLocalErrors(newErrors);
    
    // If no errors, continue
    if (Object.keys(newErrors).length === 0) {
      onBudgetSet();
      onNext();
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <h3 className="text-xl font-bold mb-4">Campaign Budget & Duration</h3>
      
      {/* Budget Selection */}
      <div className="mb-8">
        <label className="block mb-2 font-medium">
          Select Your Budget - ${sliderBudget}
        </label>
        
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>${minBudget}</span>
            <span>${maxBudget}</span>
          </div>
          <input
            type="range"
            min={minBudget}
            max={maxBudget}
            step="50"
            value={sliderBudget}
            onChange={handleSliderChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>
        
        <div className="mb-4">
          <ProgressBar 
            progress={calculatePercentage()} 
            height={10} 
            color="primary" 
            rounded={true}
            animate={true}
          />
        </div>
        
        {localErrors.budget && (
          <p className="text-error text-sm mb-4">{localErrors.budget}</p>
        )}
        
        <div className="bg-purple-50 border border-purple-200 rounded-md p-4 mb-6">
          <p className="text-primary font-medium mb-2">With this budget, you'll receive approximately:</p>
          <p className="text-2xl font-bold text-primary mb-2">{estimatedVideos} TikTok videos</p>
          <p className="text-sm text-gray-600">
            Our network of content creators will create original videos featuring your music.
            Higher budgets yield more videos and greater reach.
          </p>
        </div>
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
          Continue to Targeting
        </Button>
      </div>
    </div>
  );
};

export default BudgetSelector;