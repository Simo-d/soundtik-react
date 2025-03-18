import { logEvent } from 'firebase/analytics';
import { analytics } from './config';

/**
 * Log a custom event to Firebase Analytics
 * @param {string} eventName - Name of the event
 * @param {Object} eventParams - Parameters for the event
 */
export const logCustomEvent = (eventName, eventParams = {}) => {
  try {
    logEvent(analytics, eventName, eventParams);
  } catch (error) {
    console.error('Error logging event:', error);
  }
};

/**
 * Log a page view event
 * @param {string} pageName - Name of the page
 * @param {Object} additionalParams - Additional parameters
 */
export const logPageView = (pageName, additionalParams = {}) => {
  try {
    logEvent(analytics, 'page_view', {
      page_title: pageName,
      page_location: window.location.href,
      page_path: window.location.pathname,
      ...additionalParams
    });
  } catch (error) {
    console.error('Error logging page view:', error);
  }
};

/**
 * Log a user login event
 * @param {string} method - Login method (email, social, etc.)
 */
export const logLogin = (method) => {
  try {
    logEvent(analytics, 'login', { method });
  } catch (error) {
    console.error('Error logging login:', error);
  }
};

/**
 * Log a user registration event
 * @param {string} method - Registration method (email, social, etc.)
 */
export const logSignUp = (method) => {
  try {
    logEvent(analytics, 'sign_up', { method });
  } catch (error) {
    console.error('Error logging sign up:', error);
  }
};

/**
 * Log a campaign creation event
 * @param {string} campaignId - ID of the created campaign
 * @param {Object} campaignData - Campaign data
 */
export const logCampaignCreation = (campaignId, campaignData) => {
  try {
    logEvent(analytics, 'campaign_created', {
      campaign_id: campaignId,
      genre: campaignData.songDetails?.genre || '',
      budget: campaignData.campaignDetails?.budget || 0,
      duration: campaignData.campaignDetails?.duration || 0
    });
  } catch (error) {
    console.error('Error logging campaign creation:', error);
  }
};

/**
 * Log a campaign submission event
 * @param {string} campaignId - ID of the submitted campaign
 */
export const logCampaignSubmission = (campaignId) => {
  try {
    logEvent(analytics, 'campaign_submitted', { campaign_id: campaignId });
  } catch (error) {
    console.error('Error logging campaign submission:', error);
  }
};

/**
 * Log a payment event
 * @param {string} campaignId - ID of the campaign
 * @param {number} amount - Payment amount
 * @param {string} currency - Payment currency
 */
export const logPayment = (campaignId, amount, currency = 'USD') => {
  try {
    logEvent(analytics, 'purchase', {
      transaction_id: campaignId,
      value: amount,
      currency,
      items: [{ item_id: campaignId, item_name: 'TikTok Promotion Campaign' }]
    });
  } catch (error) {
    console.error('Error logging payment:', error);
  }
};

/**
 * Log form step completion
 * @param {string} formName - Name of the form
 * @param {number} stepNumber - Step number completed
 * @param {string} stepName - Name of the step
 */
export const logFormStepComplete = (formName, stepNumber, stepName) => {
  try {
    logEvent(analytics, 'form_step_complete', {
      form_name: formName,
      step_number: stepNumber,
      step_name: stepName
    });
  } catch (error) {
    console.error('Error logging form step completion:', error);
  }
};

/**
 * Track feature usage
 * @param {string} featureName - Name of the feature
 * @param {Object} additionalParams - Additional parameters
 */
export const trackFeatureUsage = (featureName, additionalParams = {}) => {
  try {
    logEvent(analytics, 'feature_use', {
      feature_name: featureName,
      ...additionalParams
    });
  } catch (error) {
    console.error('Error tracking feature usage:', error);
  }
};