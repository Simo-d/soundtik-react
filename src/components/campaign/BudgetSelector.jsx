import React, { useState, useEffect } from 'react';
import { useFormContext } from '../../contexts/FormContext';
import Button from '../common/Button';

/**
 * Budget selector component - part of the campaign creation process
 * Shows the relationship between budget and number of videos created by our network
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
  
  // Budget options - using a slider
  const [sliderBudget, setSliderBudget] = useState(
    formData.campaignDetails.budget || minBudget
  );
  
  // Update form data when slider changes
  useEffect(() => {
    // Set a standard 30-day campaign duration
    updateFormData('campaignDetails', { 
      budget: sliderBudget,
      duration: 30 // Fixed 30-day campaign duration
    });
  }, [sliderBudget, updateFormData]);
  
  // Calculate estimated videos based on budget
  useEffect(() => {
    // Formula: $200 = 2 videos base, then 1 video per $100 with bonus videos for larger budgets
    const baseVideos = Math.floor(sliderBudget / 100);
    const bonusVideos = Math.floor((sliderBudget / 1000) * 3); // 3 bonus videos per $1000
    const total = Math.max(2, baseVideos + bonusVideos);
    
    setEstimatedVideos(total);
  }, [sliderBudget]);
  
  // Calculate estimated reach based on budget and videos
  useEffect(() => {
    // Formula: Each video reaches approximately 8,000-15,000 people
    // Higher budgets get premium creators with more reach
    const budgetFactor = sliderBudget > 1000 ? 1.3 : (sliderBudget > 500 ? 1.1 : 1.0);
    const avgViewsPerVideo = 12000 * budgetFactor;
    
    const totalEstimatedViews = estimatedVideos * avgViewsPerVideo;
    setEstimatedReach({
      min: Math.round(totalEstimatedViews * 0.7), // 30% lower bound for variability
      max: Math.round(totalEstimatedViews * 1.3), // 30% upper bound for variability
    });
  }, [sliderBudget, estimatedVideos]);
  
  // Handle slider change
  const handleSliderChange = (e) => {
    const value = parseInt(e.target.value);
    setSliderBudget(value);
    setLocalErrors(prev => ({ ...prev, budget: '' }));
  };
  
  // Calculate average cost per video
  const calculateCostPerVideo = () => {
    return estimatedVideos > 0 ? (sliderBudget / estimatedVideos).toFixed(2) : 0;
  };
  
  // Handle continue
  const handleContinue = () => {
    // Validate budget
    const newErrors = {};
    
    if (!sliderBudget || sliderBudget < minBudget) {
      newErrors.budget = `Minimum budget is $${minBudget}`;
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
      <h3 className="text-xl font-bold mb-4">Campaign Budget</h3>
      
      {/* Budget Selection */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <label className="font-medium">Select Your Budget</label>
          <span className="text-xl font-bold text-primary">${sliderBudget}</span>
        </div>
        
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
            className="w-full h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
            style={{
              background: `linear-gradient(to right, #6200EA 0%, #6200EA ${((sliderBudget - minBudget) / (maxBudget - minBudget)) * 100}%, #e5e7eb ${((sliderBudget - minBudget) / (maxBudget - minBudget)) * 100}%, #e5e7eb 100%)`
            }}
          />
        </div>
        
        {localErrors.budget && (
          <p className="text-error text-sm mb-4">{localErrors.budget}</p>
        )}
      </div>
      
      {/* Video Information */}
      <div className="bg-purple-50 border border-purple-200 rounded-md p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between mb-6">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-600 text-sm">Your budget will create</p>
            <p className="text-3xl font-bold text-primary">{estimatedVideos} TikTok videos</p>
            <p className="text-sm text-gray-600 mt-1">Average cost: ${calculateCostPerVideo()} per video</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Estimated total reach</p>
            <p className="text-3xl font-bold text-primary">{(estimatedReach.min/1000).toFixed(1)}K-{(estimatedReach.max/1000).toFixed(1)}K views</p>
            <p className="text-sm text-gray-600 mt-1">Across all videos</p>
          </div>
        </div>
        
        <hr className="border-purple-200 mb-4" />
        
        <h4 className="text-primary font-medium mb-2">How it works</h4>
        <p className="text-sm text-gray-700 mb-3">
          Your budget is directly converted into TikTok videos created by our vetted network of content creators. 
          Each creator will produce an original video featuring your music, optimized for maximum engagement.
        </p>
        <p className="text-sm text-gray-700">
          Higher budgets not only create more videos but also give you access to our premium creators with
          larger followings and higher engagement rates.
        </p>
      </div>
      
      {/* What's Included */}
      <div className="mb-8 bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h4 className="font-medium text-lg mb-3">What's Included</h4>
        <ul className="space-y-2">
          <li className="flex items-start">
            <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-gray-700">{estimatedVideos} custom TikTok videos featuring your music</span>
          </li>
          <li className="flex items-start">
            <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-gray-700">Detailed performance tracking for each video</span>
          </li>
          <li className="flex items-start">
            <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-gray-700">Content creator matching based on your targeting preferences</span>
          </li>
          <li className="flex items-start">
            <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-gray-700">30-day campaign duration with real-time analytics</span>
          </li>
        </ul>
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