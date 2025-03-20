import { httpsCallable } from 'firebase/functions';
import { functions } from './config';

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
 * For now, we'll use placeholders for these functions
 * In a real app, these would call actual cloud functions
 */

export const createPaymentIntent = async (campaignId, amount) => {
  console.log('Creating payment intent for', campaignId, 'with amount', amount);
  // Mock response
  return {
    clientSecret: 'mock_client_secret_' + Math.random().toString(36).substring(2, 15)
  };
};

export const handlePaymentSuccess = async (campaignId, paymentIntentId) => {
  console.log('Payment success for', campaignId, 'with intent', paymentIntentId);
  return { success: true };
};

export const handlePaymentFailure = async (campaignId, paymentIntentId, errorMessage) => {
  console.log('Payment failure for', campaignId, 'with intent', paymentIntentId, ':', errorMessage);
  return { success: false };
};

export const fetchTikTokMetrics = async (campaignId) => {
  console.log('Fetching metrics for', campaignId);
  // Mock response with sample metrics
  return {
    summary: {
      views: 25000 + Math.floor(Math.random() * 10000),
      likes: 2500 + Math.floor(Math.random() * 1000),
      comments: 500 + Math.floor(Math.random() * 200),
      shares: 800 + Math.floor(Math.random() * 300),
      follows: 300 + Math.floor(Math.random() * 100),
      engagement: 8.5 + (Math.random() * 3 - 1.5)
    },
    dailyMetrics: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - (6 - i) * 86400000),
      views: 2000 + Math.floor(Math.random() * 3000),
      likes: 200 + Math.floor(Math.random() * 300),
      comments: 50 + Math.floor(Math.random() * 50),
      shares: 80 + Math.floor(Math.random() * 70),
      newFollowers: 30 + Math.floor(Math.random() * 20)
    }))
  };
};

export const processAudio = async (campaignId, audioUrl) => {
  console.log('Processing audio for', campaignId, ':', audioUrl);
  return { success: true };
};

export default {
  submitCampaignForValidation,
  validateCampaign,
  createPaymentIntent,
  handlePaymentSuccess,
  handlePaymentFailure,
  fetchTikTokMetrics,
  processAudio
};