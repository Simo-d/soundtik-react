import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { useFormContext } from '../../contexts/FormContext';
import { useCampaign } from '../../hooks/useCampaign';
import { useAuth } from '../../hooks/useAuth';
import { createCampaign, submitCampaign } from '../../firebase/firestore';
import { logPayment, logFormStepComplete } from '../../firebase/analytics';
import Button from '../common/Button';

/**
 * Payment form component - final step of campaign creation
 */
const PaymentForm = ({ onBack }) => {
  const { formData, updateFormData, resetForm } = useFormContext();
  const { currentUser } = useAuth();
  const { refreshCampaigns } = useCampaign();
  
  // Stripe hooks
  const stripe = useStripe();
  const elements = useElements();
  
  // Component state
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [campaignId, setCampaignId] = useState(null);
  const [cardComplete, setCardComplete] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('stripe'); // 'stripe' or 'paypal'
  
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
  const createCampaignRecord = async (paymentDetails = {}) => {
    try {
      // Prepare campaign data
      const campaignData = {
        songDetails: {
          ...formData.songDetails,
          // Make sure the URLs are valid
          audioUrl: formData.songDetails.audioUrl || '',
          coverArtUrl: formData.songDetails.coverArtUrl || ''
        },
        artistDetails: formData.artistDetails,
        campaignDetails: formData.campaignDetails,
        paymentDetails: {
          amount: formData.campaignDetails.budget,
          status: 'pending',
          method: paymentMethod,
          ...paymentDetails
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
  
  // Handle Stripe payment submission
  const handleStripeSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements || isProcessing) {
      return;
    }
    
    try {
      setIsProcessing(true);
      setPaymentError(null);
      
      // Create campaign in Firestore first
      const newCampaignId = await createCampaignRecord({ 
        processor: 'stripe',
        paymentMethodType: 'card'
      });
      
      if (!newCampaignId) {
        setIsProcessing(false);
        return;
      }
      
      // In a real application, we would create a payment intent with Stripe here
      // For now, we'll simulate a successful payment
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update campaign status to pending after successful payment
      await submitCampaign(newCampaignId);
      
      // Simulate success
      setPaymentSuccess(true);
      logFormStepComplete('campaign_creation', 3, 'payment');
      logPayment(newCampaignId, formData.campaignDetails.budget, 'stripe');
      await refreshCampaigns();
      
      // Reset form data after successful payment
      setTimeout(() => {
        resetForm();
      }, 3000);
      
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError(error.message || 'An error occurred during payment processing');
    } finally {
      setIsProcessing(false); // Fixed from setIsSubmitting(false)
    }
  };
  
  // Handle PayPal payment
  const handlePayPalApprove = async (data, actions) => {
    try {
      setIsProcessing(true);
      
      // Create the order
      const orderDetails = await actions.order.capture();
      
      // Create campaign in Firestore
      const newCampaignId = await createCampaignRecord({
        processor: 'paypal',
        transactionId: orderDetails.id,
        payerEmail: orderDetails.payer.email_address,
        paymentMethodType: 'paypal'
      });
      
      if (!newCampaignId) {
        throw new Error('Failed to create campaign');
      }
      
      // Update campaign status to pending after successful payment
      await submitCampaign(newCampaignId);
      
      // Handle successful payment
      setPaymentSuccess(true);
      logFormStepComplete('campaign_creation', 3, 'payment');
      logPayment(newCampaignId, formData.campaignDetails.budget, 'paypal');
      await refreshCampaigns();
      
      // Reset form data after successful payment
      setTimeout(() => {
        resetForm();
      }, 3000);
      
      return true;
    } catch (error) {
      console.error('PayPal payment error:', error);
      setPaymentError(error.message || 'An error occurred during PayPal payment processing');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle PayPal error
  const handlePayPalError = (err) => {
    console.error('PayPal error:', err);
    setPaymentError('An error occurred with PayPal. Please try again or use a different payment method.');
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
        <div className="bg-green-100 text-green-800 p-6 rounded-lg border border-green-200 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      <div className="bg-gray-100 p-4 rounded-md border border-gray-200 mb-6">
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
        
        <div className="flex justify-between py-2 border-b border-gray-200">
          <span>Number of Videos</span>
          <span className="font-medium">
            {Math.floor(formData.campaignDetails.budget / 100) + Math.floor((formData.campaignDetails.budget / 1000) * 2)}
          </span>
        </div>
        
        <div className="flex justify-between py-2 font-bold text-lg mt-2">
          <span>Total</span>
          <span className="text-primary">{formattedBudget}</span>
        </div>
      </div>
      
      {/* Payment Method Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">Select Payment Method</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            className={`
              p-4 border rounded-lg flex flex-col items-center justify-center
              ${paymentMethod === 'stripe' 
                ? 'border-primary bg-primary bg-opacity-5' 
                : 'border-gray-200 hover:border-primary'}
            `}
            onClick={() => setPaymentMethod('stripe')}
          >
            <svg className="h-8 w-auto mb-2" viewBox="0 0 60 25" xmlns="http://www.w3.org/2000/svg">
              <path d="M59.64 14.28h-8.06v-1.83h8.06v1.83zm0 3.67h-8.06v-1.83h8.06v1.83zm-8.06-9.17h8.06v1.83h-8.06V8.78zm-9.17 5.49c0-.46.37-.83.83-.83.46 0 .83.37.83.83a.83.83 0 0 1-.83.83c-.46 0-.83-.37-.83-.83zm-3.21 0c0-.46.37-.83.83-.83.46 0 .83.37.83.83a.83.83 0 0 1-.83.83c-.46 0-.83-.37-.83-.83zm6.41 0c0-.46.37-.83.83-.83.46 0 .83.37.83.83a.83.83 0 0 1-.83.83c-.46 0-.83-.37-.83-.83zm-9.62 0c0-.46.37-.83.83-.83.46 0 .83.37.83.83a.83.83 0 0 1-.83.83c-.46 0-.83-.37-.83-.83zm16.03 0c0-.46.37-.83.83-.83.46 0 .83.37.83.83a.83.83 0 0 1-.83.83c-.46 0-.83-.37-.83-.83zm16.03 0c0-.46.37-.83.83-.83.46 0 .83.37.83.83a.83.83 0 0 1-.83.83c-.46 0-.83-.37-.83-.83zm-16.03 3.67c0-.46.37-.83.83-.83.46 0 .83.37.83.83a.83.83 0 0 1-.83.83c-.46 0-.83-.37-.83-.83zm-6.41 0c0-.46.37-.83.83-.83.46 0 .83.37.83.83a.83.83 0 0 1-.83.83c-.46 0-.83-.37-.83-.83zm-3.21 0c0-.46.37-.83.83-.83.46 0 .83.37.83.83a.83.83 0 0 1-.83.83c-.46 0-.83-.37-.83-.83zm-3.21 0c0-.46.37-.83.83-.83.46 0 .83.37.83.83a.83.83 0 0 1-.83.83c-.46 0-.83-.37-.83-.83zm-3.21 0c0-.46.37-.83.83-.83.46 0 .83.37.83.83a.83.83 0 0 1-.83.83c-.46 0-.83-.37-.83-.83zm22.44-7.33c0-.46.37-.83.83-.83.46 0 .83.37.83.83a.83.83 0 0 1-.83.83c-.46 0-.83-.37-.83-.83zm-6.41 0c0-.46.37-.83.83-.83.46 0 .83.37.83.83a.83.83 0 0 1-.83.83c-.46 0-.83-.37-.83-.83zm-3.21 0c0-.46.37-.83.83-.83.46 0 .83.37.83.83a.83.83 0 0 1-.83.83c-.46 0-.83-.37-.83-.83zm-3.21 0c0-.46.37-.83.83-.83.46 0 .83.37.83.83a.83.83 0 0 1-.83.83c-.46 0-.83-.37-.83-.83zm-3.21 0c0-.46.37-.83.83-.83.46 0 .83.37.83.83a.83.83 0 0 1-.83.83c-.46 0-.83-.37-.83-.83zm-3.21 0c0-.46.37-.83.83-.83.46 0 .83.37.83.83a.83.83 0 0 1-.83.83c-.46 0-.83-.37-.83-.83zM8.72 4.27V0h42.79L39.97 25H0V4.27h8.72z" fill="#635BFF" />
            </svg>
            <span className={paymentMethod === 'stripe' ? 'font-medium' : ''}>Credit Card</span>
          </button>
          
          <button
            type="button"
            className={`
              p-4 border rounded-lg flex flex-col items-center justify-center
              ${paymentMethod === 'paypal' 
                ? 'border-primary bg-primary bg-opacity-5' 
                : 'border-gray-200 hover:border-primary'}
            `}
            onClick={() => setPaymentMethod('paypal')}
          >
            <svg className="h-8 w-auto mb-2" viewBox="0 0 101 32" xmlns="http://www.w3.org/2000/svg">
              <path d="M 12.237 2.8 L 4.437 2.8 C 3.937 2.8 3.437 3.2 3.337 3.7 L 0.237 23.7 C 0.137 24.1 0.437 24.4 0.837 24.4 L 4.537 24.4 C 5.037 24.4 5.537 24 5.637 23.5 L 6.437 18.1 C 6.537 17.6 6.937 17.2 7.537 17.2 L 9.937 17.2 C 15.137 17.2 18.137 14.7 18.937 9.8 C 19.237 7.7 18.937 6 17.937 4.8 C 16.837 3.5 14.837 2.8 12.237 2.8 Z M 13.137 10.1 C 12.737 12.9 10.537 12.9 8.537 12.9 L 7.337 12.9 L 8.137 7.7 C 8.137 7.4 8.437 7.2 8.737 7.2 L 9.237 7.2 C 10.637 7.2 11.937 7.2 12.637 8 C 13.137 8.4 13.337 9.1 13.137 10.1 Z" fill="#009cde"/>
              <path d="M 35.437 10 L 31.737 10 C 31.437 10 31.137 10.2 31.137 10.5 L 30.937 11.5 L 30.637 11.1 C 29.837 9.9 28.037 9.5 26.237 9.5 C 22.137 9.5 18.637 12.6 17.937 17 C 17.537 19.2 18.037 21.3 19.337 22.7 C 20.437 24 22.137 24.6 24.037 24.6 C 27.337 24.6 29.237 22.5 29.237 22.5 L 29.037 23.5 C 28.937 23.9 29.237 24.3 29.637 24.3 L 33.037 24.3 C 33.537 24.3 34.037 23.9 34.137 23.4 L 36.037 10.7 C 36.137 10.3 35.837 10 35.437 10 Z M 30.337 17.2 C 29.937 19.3 28.337 20.8 26.137 20.8 C 25.037 20.8 24.237 20.5 23.637 19.8 C 23.037 19.1 22.837 18.2 23.037 17.2 C 23.337 15.1 25.137 13.6 27.237 13.6 C 28.337 13.6 29.137 14 29.737 14.6 C 30.237 15.3 30.437 16.2 30.337 17.2 Z" fill="#009cde"/>
              <path d="M 55.337 10 L 51.637 10 C 51.237 10 50.937 10.2 50.737 10.5 L 45.537 18.1 L 43.337 10.8 C 43.237 10.3 42.737 10 42.337 10 L 38.637 10 C 38.237 10 37.837 10.4 38.037 10.9 L 42.137 23 L 38.237 28.4 C 37.937 28.8 38.237 29.4 38.737 29.4 L 42.437 29.4 C 42.837 29.4 43.137 29.2 43.337 28.9 L 55.837 10.9 C 56.137 10.6 55.837 10 55.337 10 Z" fill="#009cde"/>
              <path d="M 67.737 2.8 L 59.937 2.8 C 59.437 2.8 58.937 3.2 58.837 3.7 L 55.737 23.6 C 55.637 24 55.937 24.3 56.337 24.3 L 60.337 24.3 C 60.737 24.3 61.037 24 61.037 23.7 L 61.937 18.2 C 62.037 17.7 62.437 17.3 63.037 17.3 L 65.437 17.3 C 70.637 17.3 73.637 14.8 74.437 9.9 C 74.737 7.8 74.437 6.1 73.437 4.9 C 72.237 3.5 70.337 2.8 67.737 2.8 Z M 68.637 10.1 C 68.237 12.9 66.037 12.9 64.037 12.9 L 62.837 12.9 L 63.637 7.7 C 63.637 7.4 63.937 7.2 64.237 7.2 L 64.737 7.2 C 66.137 7.2 67.437 7.2 68.137 8 C 68.637 8.4 68.837 9.1 68.637 10.1 Z" fill="#003087"/>
              <path d="M 90.937 10 L 87.237 10 C 86.937 10 86.637 10.2 86.637 10.5 L 86.437 11.5 L 86.137 11.1 C 85.337 9.9 83.537 9.5 81.737 9.5 C 77.637 9.5 74.137 12.6 73.437 17 C 73.037 19.2 73.537 21.3 74.837 22.7 C 75.937 24 77.637 24.6 79.537 24.6 C 82.837 24.6 84.737 22.5 84.737 22.5 L 84.537 23.5 C 84.437 23.9 84.737 24.3 85.137 24.3 L 88.537 24.3 C 89.037 24.3 89.537 23.9 89.637 23.4 L 91.537 10.7 C 91.637 10.3 91.337 10 90.937 10 Z M 85.737 17.2 C 85.337 19.3 83.737 20.8 81.537 20.8 C 80.437 20.8 79.637 20.5 79.037 19.8 C 78.437 19.1 78.237 18.2 78.437 17.2 C 78.737 15.1 80.537 13.6 82.637 13.6 C 83.737 13.6 84.537 14 85.137 14.6 C 85.637 15.3 85.837 16.2 85.737 17.2 Z" fill="#003087"/>
              <path d="M 95.337 3.3 L 92.137 23.6 C 92.037 24 92.337 24.3 92.737 24.3 L 95.937 24.3 C 96.437 24.3 96.937 23.9 97.037 23.4 L 100.237 3.5 C 100.337 3.1 100.037 2.8 99.637 2.8 L 96.037 2.8 C 95.637 2.8 95.437 3 95.337 3.3 Z" fill="#003087"/>
            </svg>
            <span className={paymentMethod === 'paypal' ? 'font-medium' : ''}>PayPal</span>
          </button>
        </div>
      </div>
      
      {paymentError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-200">
          {paymentError}
        </div>
      )}
      
      {/* Stripe Payment Form */}
      {paymentMethod === 'stripe' && (
        <form onSubmit={handleStripeSubmit}>
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
      )}
      
      {/* PayPal Payment Form */}
      {paymentMethod === 'paypal' && (
        <div>
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-4">
              Click the PayPal button below to complete your payment securely with PayPal.
            </p>
            
            <div className="paypal-button-container">
              <PayPalButtons
                createOrder={(data, actions) => {
                  return actions.order.create({
                    purchase_units: [
                      {
                        amount: {
                          currency_code: 'USD',
                          value: formData.campaignDetails.budget.toString(),
                        },
                        description: `SoundTik Campaign: ${formData.songDetails.title}`,
                      },
                    ],
                  });
                }}
                onApprove={handlePayPalApprove}
                onError={handlePayPalError}
                style={{
                  layout: 'vertical',
                  color: 'blue',
                  shape: 'rect',
                  label: 'pay',
                }}
                disabled={isProcessing}
              />
            </div>
          </div>
          
          {/* Terms & Conditions */}
          <div className="mb-6">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms-paypal"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms-paypal" className="text-gray-700">
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
          
          {/* Back Button */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={isProcessing}
            >
              Back
            </Button>
            
            <div className="w-40"></div> {/* Spacer to match Stripe form layout */}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentForm;