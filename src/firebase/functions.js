import { httpsCallable } from 'firebase/functions';
import { functions } from './config';
import { updateVideoMetrics } from './firestore';

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
 * Fetch TikTok video details using the video ID
 * @param {string} tiktokId - TikTok video ID
 * @returns {Promise<Object>} - Video details
 */
export const fetchTikTokVideoDetails = async (tiktokId) => {
  try {
    // In a real application, this would call a cloud function that uses TikTok API
    // For now, we'll simulate a response with mock data
    console.log('Fetching TikTok details for video:', tiktokId);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate a response with some random data
    return {
      tiktokId,
      username: `creator_${Math.floor(Math.random() * 1000)}`,
      caption: `This is an awesome TikTok video with #trending #music #${tiktokId.substring(0, 5)}`,
      thumbnail: `https://via.placeholder.com/300x500?text=TikTok+${tiktokId.substring(0, 6)}`,
      views: 1000 + Math.floor(Math.random() * 50000),
      likes: 100 + Math.floor(Math.random() * 5000),
      comments: 10 + Math.floor(Math.random() * 500),
      shares: 5 + Math.floor(Math.random() * 200)
    };
  } catch (error) {
    console.error('Error fetching TikTok video details:', error);
    throw error;
  }
};

/**
 * Refresh metrics for a specific video
 * @param {string} videoId - Video document ID
 * @param {string} tiktokId - TikTok video ID
 * @returns {Promise<Object>} - Updated metrics
 */
export const refreshVideoMetrics = async (videoId, tiktokId) => {
  try {
    // In a real app, this would call a cloud function that pulls fresh data from TikTok API
    console.log('Refreshing metrics for video:', videoId, 'TikTok ID:', tiktokId);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate updated metrics with higher numbers (as if the video gained more engagement)
    const metrics = {
      views: 1000 + Math.floor(Math.random() * 100000),
      likes: 100 + Math.floor(Math.random() * 10000),
      comments: 10 + Math.floor(Math.random() * 1000),
      shares: 5 + Math.floor(Math.random() * 500)
    };
    
    // Update the video document in Firestore
    await updateVideoMetrics(videoId, metrics);
    
    return metrics;
  } catch (error) {
    console.error('Error refreshing video metrics:', error);
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
  fetchTikTokVideoDetails,
  refreshVideoMetrics,
  processAudio
};