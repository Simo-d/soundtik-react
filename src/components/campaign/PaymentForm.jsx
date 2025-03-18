import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useFormContext } from '../../contexts/FormContext';
import { useCampaign } from '../../hooks/useCampaign';
import { useAuth } from '../../hooks/useAuth';
import { useStripe as useStripeService } from '../../hooks/useStripe';
import { createCampaign } from '../../firebase/firestore';
import { logPayment, logFormStepComplete } from '../../firebase/analytics';
import Button from '../common/Button';

/**
 * Payment form component - final step of campaign creation
 */
const PaymentForm = ({ onBack }) => {
  const { formData, updateFormData, resetForm } = useFormContext();
  const { currentUser } = useAuth();
  const { refreshCampaigns } = useCampaign();
  const { initializePayment, processPayment } = useStripeService();
  
  // Stripe hooks
  const stripe = useStripe();
  const elements = useElements();
  
  // Component state
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [campaignId, setCampaignId] = useState(null);
  const [cardComplete, setCardComplete] = useState(false);
  
  const navigate = useNavigate();
  
  // Format budget for display
  const formattedBudget = formData.campaignDetails.budget.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  });
  
  // Handle card element change
  const handleCardChange = (event) => {
    setCardComplete(event.complete);
    if (event.error) {
      setPaymentError(event.error.message);
    } else {
      setPaymentError(null);
    }
  };
  
  // Create campaign in Firestore
  const createCampaignRecord = async () => {
    try {
      // Prepare campaign data
      const campaignData = {
        songDetails: formData.songDetails,
        artistDetails: formData.artistDetails,
        campaignDetails: formData.campaignDetails,
        paymentDetails: {
          amount: formData.campaignDetails.budget,
          status: 'pending'
        }
      };
      
      // Create campaign
      const newCampaignId = await createCampaign(currentUser.uid, campaignData);
      setCampaignId(newCampaignId);
      return newCampaignId;
    } catch (error) {
      console.error('Error creating campaign:', error);
      setPaymentError('Failed to create campaign. Please try again.');
      return null;
    }
  };
  
  // Handle payment submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements || isProcessing) {
      return;
    }
    
    try {
      setIsProcessing(true);
      setPaymentError(null);
      
      // Create campaign in Firestore first
      const newCampaignId = await createCampaignRecord();
      if (!newCampaignId) {
        setIsProcessing(false);
        return;
      }
      
      // Initialize payment with Stripe
      const paymentIntent = await initializePayment(newCampaignId, formData.campaignDetails.budget);
      if (!paymentIntent) {
        setPaymentError('Failed to initialize payment. Please try again.');
        setIsProcessing(false);
        return;
      }
      
      // Process payment
      const cardElement = elements.getElement(CardElement);
      const result = await processPayment(cardElement, newCampaignId, formData.campaignDetails.budget);
      
      if (result) {
        setPaymentSuccess(true);
        logFormStepComplete('campaign_creation', 3, 'payment');
        logPayment(newCampaignId, formData.campaignDetails.budget);
        await refreshCampaigns();
        
        // Reset form data after successful payment
        setTimeout(() => {
          resetForm();
        }, 3000);
      } else {
        setPaymentError('Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError(error.message || 'An error occurred during payment processing');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Navigate to campaign dashboard after successful payment
  useEffect(() => {
    if (paymentSuccess && campaignId) {
      const timer = setTimeout(() => {
        navigate(`/campaign/${campaignId}`);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [paymentSuccess, campaignId, navigate]);
  
  // If payment was successful, show success message
  if (paymentSuccess) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-green-50 text-success p-6 rounded-lg border border-green-200 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
          <p className="mb-4">Your campaign has been created and is now pending approval.</p>
          <p>You will be redirected to your campaign dashboard shortly...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Payment Details</h2>
      
      {/* Payment Summary */}
      <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-6">
        <h3 className="text-lg font-medium mb-2">Campaign Summary</h3>
        
        <div className="flex justify-between py-2 border-b border-gray-200">
          <span>Song</span>
          <span className="font-medium">{formData.songDetails.title}</span>
        </div>
        
        <div className="flex justify-between py-2 border-b border-gray-200">
          <span>Artist</span>
          <span className="font-medium">{formData.artistDetails.name}</span>
        </div>
        
        <div className="flex justify-between py-2 border-b border-gray-200">
          <span>Duration</span>
          <span className="font-medium">{formData.campaignDetails.duration} days</span>
        </div>
        
        <div className="flex justify-between py-2 font-bold text-lg mt-2">
          <span>Total</span>
          <span className="text-primary">{formattedBudget}</span>
        </div>
      </div>
      
      {/* Payment Form */}
      <form onSubmit={handleSubmit}>
        {paymentError && (
          <div className="mb-4 p-3 bg-red-50 text-error rounded border border-red-200">
            {paymentError}
          </div>
        )}
        
        <div className="mb-6">
          <label className="block mb-2 font-medium">
            Card Details
          </label>
          
          <div className="p-4 border border-gray-300 rounded-md">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
              onChange={handleCardChange}
            />
          </div>
          
          <p className="mt-2 text-sm text-gray-500">
            Your payment information is processed securely via Stripe. We do not store your card details.
          </p>
        </div>
        
        {/* Terms & Conditions */}
        <div className="mb-6">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="terms" className="text-gray-700">
                I agree to the{' '}
                <a href="/terms" className="text-primary hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </a>
              </label>
            </div>
          </div>
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isProcessing}
          >
            Back
          </Button>
          
          <Button
            type="submit"
            variant="primary"
            disabled={!stripe || !cardComplete || isProcessing}
          >
            {isProcessing ? 'Processing Payment...' : `Pay ${formattedBudget}`}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;