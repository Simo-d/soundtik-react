import { useState, useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { createPaymentIntent, handlePaymentSuccess, handlePaymentFailure } from '../firebase/functions';
import { logPayment } from '../firebase/analytics';

// Initialize Stripe with the public key
// Note: In production, use an environment variable
const stripePromise = process.env.REACT_APP_STRIPE_PUBLIC_KEY 
  ? loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY) 
  : null;
/**
 * Custom hook for Stripe payment integration
 * @returns {Object} Stripe methods and state
 */
export const useStripe = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  
  /**
   * Initialize a payment for a campaign
   * @param {string} campaignId - Campaign ID
   * @param {number} amount - Payment amount in dollars
   * @returns {Promise<Object|null>} - Payment intent data or null on error
   */
  const initializePayment = useCallback(async (campaignId, amount) => {
    if (!campaignId || !amount || amount <= 0) {
      setError('Invalid payment parameters');
      return null;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Create a payment intent
      const paymentData = await createPaymentIntent(campaignId, amount);
      setPaymentIntent(paymentData);
      setPaymentStatus('initialized');
      
      return paymentData;
    } catch (err) {
      console.error('Error initializing payment:', err);
      setError(err.message || 'Failed to initialize payment');
      setPaymentStatus('failed');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Process a payment with card details
   * @param {Object} cardElement - Stripe card element
   * @param {string} campaignId - Campaign ID
   * @param {number} amount - Payment amount
   * @returns {Promise<boolean>} - Whether payment was successful
   */
  const processPayment = useCallback(async (cardElement, campaignId, amount) => {
    if (!cardElement || !campaignId || !paymentIntent) {
      setError('Invalid payment parameters');
      return false;
    }
    
    try {
      setLoading(true);
      setError(null);
      setPaymentStatus('processing');
      
      // Get Stripe instance
      const stripe = await stripePromise;
      
      // Confirm the card payment
      const { error, paymentIntent: confirmedIntent } = await stripe.confirmCardPayment(
        paymentIntent.clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );
      
      if (error) {
        throw error;
      }
      
      // Handle payment status
      if (confirmedIntent.status === 'succeeded') {
        // Notify our server about the successful payment
        await handlePaymentSuccess(campaignId, confirmedIntent.id);
        setPaymentStatus('succeeded');
        
        // Log analytics
        logPayment(campaignId, amount);
        
        return true;
      } else {
        // Payment requires additional action or failed
        await handlePaymentFailure(campaignId, confirmedIntent.id, 'Payment not successful');
        setPaymentStatus(confirmedIntent.status);
        setError('Payment not completed successfully');
        return false;
      }
    } catch (err) {
      console.error('Error processing payment:', err);
      setError(err.message || 'Failed to process payment');
      setPaymentStatus('failed');
      
      // Notify our server about the failed payment
      await handlePaymentFailure(campaignId, paymentIntent?.id, err.message || 'Payment failed');
      
      return false;
    } finally {
      setLoading(false);
    }
  }, [paymentIntent]);
  
  /**
   * Reset payment state
   */
  const resetPayment = useCallback(() => {
    setLoading(false);
    setError(null);
    setPaymentIntent(null);
    setPaymentStatus(null);
  }, []);
  
  return {
    loading,
    error,
    paymentIntent,
    paymentStatus,
    initializePayment,
    processPayment,
    resetPayment,
  };
};

export default useStripe;