import { httpsCallable } from 'firebase/functions';
import { functions } from './config';

/**
 * Create a payment intent with Stripe
 * @param {string} campaignId - Campaign ID
 * @param {number} amount - Payment amount in dollars
 * @returns {Promise<Object>} - Contains client_secret for the payment
 */
export const createPaymentIntent = async (campaignId, amount) => {
  try {
    const createPaymentIntentFunc = httpsCallable(functions, 'createPaymentIntent');
    const result = await createPaymentIntentFunc({ campaignId, amount });
    return result.data;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

/**
 * Handle successful payment
 * @param {string} campaignId - Campaign ID
 * @param {string} paymentIntentId - Stripe Payment Intent ID
 * @returns {Promise<Object>} - Result data
 */
export const handlePaymentSuccess = async (campaignId, paymentIntentId) => {
  try {
    const handlePaymentSuccessFunc = httpsCallable(functions, 'handlePaymentSuccess');
    const result = await handlePaymentSuccessFunc({ campaignId, paymentIntentId });
    return result.data;
  } catch (error) {
    console.error('Error handling payment success:', error);
    throw error;
  }
};

/**
 * Handle failed payment
 * @param {string} campaignId - Campaign ID
 * @param {string} paymentIntentId - Stripe Payment Intent ID
 * @param {string} errorMessage - Error message
 * @returns {Promise<Object>} - Result data
 */
export const handlePaymentFailure = async (campaignId, paymentIntentId, errorMessage) => {
  try {
    const handlePaymentFailureFunc = httpsCallable(functions, 'handlePaymentFailure');
    const result = await handlePaymentFailureFunc({ campaignId, paymentIntentId, errorMessage });
    return result.data;
  } catch (error) {
    console.error('Error handling payment failure:', error);
    throw error;
  }
};

/**
 * Submit campaign for admin validation
 * @param {string} campaignId - Campaign ID
 * @returns {Promise<Object>} - Result data
 */
export const submitCampaignForValidation = async (campaignId) => {
  try {
    const submitCampaignFunc = httpsCallable(functions, 'submitCampaignForValidation');
    const result = await submitCampaignFunc({ campaignId });
    return result.data;
  } catch (error) {
    console.error('Error submitting campaign for validation:', error);
    throw error;
  }
};

/**
 * Validate a campaign (admin only)
 * @param {string} campaignId - Campaign ID
 * @param {boolean} isApproved - Whether the campaign is approved
 * @param {string} notes - Optional admin notes
 * @returns {Promise<Object>} - Result data
 */
export const validateCampaign = async (campaignId, isApproved, notes = '') => {
  try {
    const validateCampaignFunc = httpsCallable(functions, 'validateCampaign');
    const result = await validateCampaignFunc({ campaignId, isApproved, notes });
    return result.data;
  } catch (error) {
    console.error('Error validating campaign:', error);
    throw error;
  }
};

/**
 * Fetch campaign metrics from TikTok
 * @param {string} campaignId - Campaign ID
 * @returns {Promise<Object>} - Result data with metrics
 */
export const fetchTikTokMetrics = async (campaignId) => {
  try {
    const fetchMetricsFunc = httpsCallable(functions, 'fetchTikTokMetrics');
    const result = await fetchMetricsFunc({ campaignId });
    return result.data;
  } catch (error) {
    console.error('Error fetching TikTok metrics:', error);
    throw error;
  }
};

/**
 * Process audio file for TikTok campaign
 * @param {string} campaignId - Campaign ID
 * @param {string} audioUrl - URL of the audio file
 * @returns {Promise<Object>} - Result data
 */
export const processAudio = async (campaignId, audioUrl) => {
  try {
    const processAudioFunc = httpsCallable(functions, 'processAudioFile');
    const result = await processAudioFunc({ campaignId, audioUrl });
    return result.data;
  } catch (error) {
    console.error('Error processing audio file:', error);
    throw error;
  }
};