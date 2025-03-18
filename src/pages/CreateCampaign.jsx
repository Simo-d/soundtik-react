import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { FormProvider } from '../contexts/FormContext';
import { useAuth } from '../hooks/useAuth';
import { logPageView } from '../firebase/analytics';
import Navbar from '../components/common/Navbar';
import SongDetailsForm from '../components/campaign/SongDetailsForm';
import ArtistDetailsForm from '../components/campaign/ArtistDetailsForm';
import BudgetSelector from '../components/campaign/BudgetSelector';
import PaymentForm from '../components/campaign/PaymentForm';

// Initialize Stripe with the public key
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

/**
 * Create Campaign page - multi-step form for campaign creation
 */
const CreateCampaign = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Form step state
  const [currentStep, setCurrentStep] = useState(0);
  const [isTargetingStep, setIsTargetingStep] = useState(false);
  
  // Track page view
  useEffect(() => {
    logPageView('Create Campaign');
  }, []);
  
  // Move to next step
  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };
  
  // Move to previous step
  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };
  
  // Set targeting step active
  const handleBudgetSet = () => {
    setIsTargetingStep(true);
  };
  
  // Finish targeting
  const handleTargetingDone = () => {
    setIsTargetingStep(false);
    handleNext();
  };
  
  // Render step indicators
  const renderStepIndicators = () => {
    const steps = ['Song Details', 'Artist Details', 'Campaign Settings', 'Payment'];
    
    return (
      <div className="mb-8">
        <div className="step-indicator">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className={`step ${
                index < currentStep ? 'completed' : (index === currentStep ? 'active' : '')
              }`}
            >
              {index < currentStep ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                index + 1
              )}
            </div>
          ))}
        </div>
        
        <div className="flex justify-between mt-2">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className={`text-xs font-medium ${
                index === currentStep ? 'text-primary' : 'text-gray-500'
              }`}
              style={{ width: `${100 / steps.length}%`, textAlign: 'center' }}
            >
              {step}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Render current step form
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <SongDetailsForm onNext={handleNext} />;
      case 1:
        return <ArtistDetailsForm onNext={handleNext} onBack={handleBack} />;
      case 2:
        if (isTargetingStep) {
          // This would be a targeting component if implemented
          return <div>Targeting Component (placeholder)</div>;
        }
        return <BudgetSelector onBudgetSet={handleBudgetSet} />;
      case 3:
        return (
          <Elements stripe={stripePromise}>
            <PaymentForm onBack={handleBack} />
          </Elements>
        );
      default:
        return <SongDetailsForm onNext={handleNext} />;
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center">Create Your Campaign</h1>
          
          {renderStepIndicators()}
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <FormProvider>
              {renderStepContent()}
            </FormProvider>
          </div>
        </div>
      </main>
      
      <footer className="bg-white py-6 border-t">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} SoundTik. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default CreateCampaign;