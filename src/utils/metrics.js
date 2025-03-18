/**
 * Utility functions for campaign metrics calculations and analysis
 */

/**
 * Calculate engagement rate from metrics
 * @param {Object} metrics - Object containing views, likes, comments, shares
 * @returns {number} Engagement rate percentage
 */
export const calculateEngagementRate = (metrics) => {
    if (!metrics || !metrics.views || metrics.views === 0) {
      return 0;
    }
    
    const { views, likes = 0, comments = 0, shares = 0 } = metrics;
    
    // Engagement rate = (likes + comments + shares) / views * 100
    const engagements = likes + comments + shares;
    const rate = (engagements / views) * 100;
    
    // Round to 2 decimal places
    return Math.round(rate * 100) / 100;
  };
  
  /**
   * Compare engagement rate to industry average
   * @param {number} rate - Calculated engagement rate
   * @param {number} industryAverage - Industry average engagement rate
   * @returns {Object} Comparison with difference and percentage
   */
  export const compareEngagementRate = (rate, industryAverage = 5.0) => {
    const difference = rate - industryAverage;
    const percentDifference = industryAverage > 0 ? (difference / industryAverage) * 100 : 0;
    
    return {
      rate,
      industryAverage,
      difference,
      percentDifference: Math.round(percentDifference * 10) / 10, // Round to 1 decimal place
      isAboveAverage: difference > 0
    };
  };
  
  /**
   * Calculate like, comment, and share rates
   * @param {Object} metrics - Object containing views, likes, comments, shares
   * @returns {Object} Rates for likes, comments, and shares
   */
  export const calculateEngagementBreakdown = (metrics) => {
    if (!metrics || !metrics.views || metrics.views === 0) {
      return {
        likeRate: 0,
        commentRate: 0,
        shareRate: 0
      };
    }
    
    const { views, likes = 0, comments = 0, shares = 0 } = metrics;
    
    return {
      likeRate: Math.round((likes / views) * 1000) / 10,     // Round to 1 decimal place
      commentRate: Math.round((comments / views) * 1000) / 10,
      shareRate: Math.round((shares / views) * 1000) / 10
    };
  };
  
  /**
   * Calculate campaign progress percentage
   * @param {Object} campaign - Campaign object with startDate, endDate, and duration
   * @returns {number} Progress percentage (0-100)
   */
  export const calculateCampaignProgress = (campaign) => {
    if (!campaign || !campaign.startDate) {
      return 0;
    }
    
    // Extract dates
    const startDate = campaign.startDate.toDate 
      ? campaign.startDate.toDate() 
      : new Date(campaign.startDate);
    
    const endDate = campaign.endDate 
      ? campaign.endDate.toDate 
        ? campaign.endDate.toDate() 
        : new Date(campaign.endDate) 
      : new Date(startDate.getTime() + (campaign.campaignDetails.duration * 86400000));
    
    const now = new Date();
    
    // Calculate progress
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = now.getTime() - startDate.getTime();
    
    // Ensure progress is between 0-100
    return Math.max(0, Math.min(100, Math.round((elapsed / totalDuration) * 100)));
  };
  
  /**
   * Calculate estimated reach based on budget and duration
   * @param {number} budget - Campaign budget
   * @param {number} duration - Campaign duration in days
   * @returns {Object} Estimated minimum and maximum reach
   */
  export const calculateEstimatedReach = (budget, duration) => {
    if (!budget || !duration) {
      return { min: 0, max: 0 };
    }
    
    // Simple formula: $1 = ~100-200 views with diminishing returns on duration
    const baseReach = budget * 150;
    const durationMultiplier = Math.sqrt(duration / 30); // Square root for diminishing returns
    
    const estimatedBaseReach = Math.round(baseReach * durationMultiplier);
    
    return {
      min: Math.round(estimatedBaseReach * 0.8), // 20% lower bound
      max: Math.round(estimatedBaseReach * 1.2)  // 20% upper bound
    };
  };
  
  /**
   * Compare campaign performance to similar campaigns
   * @param {Object} metrics - Current campaign metrics
   * @param {Object} benchmarks - Industry benchmarks
   * @returns {Object} Performance comparison
   */
  export const compareToBenchmarks = (metrics, benchmarks = {}) => {
    if (!metrics) {
      return {
        engagement: 0,
        engagementComparison: 0,
        views: 0,
        viewsComparison: 0
      };
    }
    
    // Default benchmarks if not provided
    const defaultBenchmarks = {
      engagement: 5.0,
      views: 10000
    };
    
    const mergedBenchmarks = { ...defaultBenchmarks, ...benchmarks };
    
    // Calculate campaign engagement rate
    const engagement = calculateEngagementRate(metrics);
    const engagementComparison = (engagement / mergedBenchmarks.engagement) * 100 - 100;
    
    // Compare views
    const viewsComparison = (metrics.views / mergedBenchmarks.views) * 100 - 100;
    
    return {
      engagement,
      engagementComparison: Math.round(engagementComparison),
      views: metrics.views,
      viewsComparison: Math.round(viewsComparison)
    };
  };
  
  /**
   * Calculate campaign ROI (for when we have revenue data)
   * @param {number} budget - Campaign cost
   * @param {number} revenue - Revenue generated
   * @returns {number} ROI percentage
   */
  export const calculateROI = (budget, revenue) => {
    if (!budget || budget === 0) {
      return 0;
    }
    
    return Math.round(((revenue - budget) / budget) * 100);
  };
  
  export default {
    calculateEngagementRate,
    compareEngagementRate,
    calculateEngagementBreakdown,
    calculateCampaignProgress,
    calculateEstimatedReach,
    compareToBenchmarks,
    calculateROI
  };