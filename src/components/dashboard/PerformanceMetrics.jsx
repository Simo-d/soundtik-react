import React from 'react';
import PropTypes from 'prop-types';
import { useCampaign } from '../../hooks/useCampaign';

/**
 * Performance metrics component - displays campaign metrics in dashboard
 * @param {Object} props - Component props
 */
const PerformanceMetrics = ({ metrics }) => {
  const { activeCampaignLoading, activeCampaign } = useCampaign();
  
  // Placeholder metrics for new campaigns or when metrics are loading
  const placeholderMetrics = {
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    follows: 0,
    engagement: 0
  };
  
  // Use provided metrics or placeholders
  const campaignMetrics = metrics?.summary || placeholderMetrics;
  
  // Calculate percentage for engagement - safely handle non-number values
  const formatEngagementPercentage = (engagement) => {
    if (engagement === undefined || engagement === null) return '0%';
    
    // If it's already a string, check if it ends with %
    if (typeof engagement === 'string') {
      return engagement.endsWith('%') ? engagement : `${engagement}%`;
    }
    
    // If it's a number, format it
    if (typeof engagement === 'number') {
      return `${engagement.toFixed(2)}%`;
    }
    
    // Default fallback
    return '0%';
  };
  
  const engagementPercentage = formatEngagementPercentage(campaignMetrics.engagement);
    
  // Format numbers with commas
  const formatNumber = (num) => {
    if (num === undefined || num === null) return '0';
    return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };
  
  // Calculate cost per metrics
  const calculateCostPerMetric = (metricValue) => {
    if (!metricValue || metricValue === 0 || !activeCampaign?.campaignDetails?.budget) {
      return '—'; // Em dash for N/A
    }
    
    const cost = (activeCampaign.campaignDetails.budget / metricValue).toFixed(2);
    return `$${cost}`;
  };
  
  // Calculate performance scores
  const getPerformanceScore = (metric, type) => {
    if (!metric || !type) return { score: 0, label: 'Poor', color: 'text-red-500' };
    
    // Different thresholds for different metric types
    let thresholds;
    switch (type) {
      case 'engagement':
        // Ensure metric is a number for engagement
        const engagementValue = parseFloat(metric.replace('%', ''));
        if (isNaN(engagementValue)) {
          return { score: 0, label: 'Unknown', color: 'text-gray-500' };
        }
        
        thresholds = [
          { min: 8, label: 'Excellent', color: 'text-green-600' },
          { min: 5, label: 'Good', color: 'text-green-500' },
          { min: 3, label: 'Average', color: 'text-yellow-500' },
          { min: 1, label: 'Below Average', color: 'text-orange-500' },
          { min: 0, label: 'Poor', color: 'text-red-500' }
        ];
        
        // Find the first threshold where the metric is greater than or equal to the min
        for (const threshold of thresholds) {
          if (engagementValue >= threshold.min) {
            return {
              score: engagementValue,
              label: threshold.label,
              color: threshold.color
            };
          }
        }
        
        return { score: engagementValue, label: 'Poor', color: 'text-red-500' };
        
      case 'costPerView':
        // Lower is better for cost metrics
        // Remove $ sign and parse as float
        const costPerView = parseFloat(metric.replace('$', ''));
        if (isNaN(costPerView) || costPerView === 0) {
          return { score: 0, label: 'Unknown', color: 'text-gray-500' };
        }
        
        thresholds = [
          { max: 0.005, label: 'Excellent', color: 'text-green-600' },
          { max: 0.01, label: 'Good', color: 'text-green-500' },
          { max: 0.02, label: 'Average', color: 'text-yellow-500' },
          { max: 0.05, label: 'Below Average', color: 'text-orange-500' },
          { max: Infinity, label: 'Poor', color: 'text-red-500' }
        ];
        
        // Find the first threshold where the cost is less than or equal to the max
        for (const threshold of thresholds) {
          if (costPerView <= threshold.max) {
            return {
              score: costPerView,
              label: threshold.label,
              color: threshold.color
            };
          }
        }
        
        return { score: costPerView, label: 'Poor', color: 'text-red-500' };
        
      default:
        thresholds = [
          { min: 5, label: 'Excellent', color: 'text-green-600' },
          { min: 3, label: 'Good', color: 'text-green-500' },
          { min: 2, label: 'Average', color: 'text-yellow-500' },
          { min: 1, label: 'Below Average', color: 'text-orange-500' },
          { min: 0, label: 'Poor', color: 'text-red-500' }
        ];
        
        // Ensure metric is a number
        const numericMetric = parseFloat(metric);
        if (isNaN(numericMetric)) {
          return { score: 0, label: 'Unknown', color: 'text-gray-500' };
        }
        
        // Find threshold
        for (const threshold of thresholds) {
          if (numericMetric >= threshold.min) {
            return {
              score: numericMetric,
              label: threshold.label,
              color: threshold.color
            };
          }
        }
    }
    
    return { score: metric, label: 'Poor', color: 'text-red-500' };
  };
  
  // Calculate days active
  const calculateDaysActive = () => {
    if (!activeCampaign?.startDate) return 0;
    
    const startDate = activeCampaign.startDate.toDate 
      ? activeCampaign.startDate.toDate() 
      : new Date(activeCampaign.startDate);
    
    const now = new Date();
    const diffTime = Math.abs(now - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
  
  // Calculate daily averages
  const calculateDailyAverage = (metric) => {
    const days = calculateDaysActive();
    if (!days || days === 0 || !metric) return 0;
    
    return Math.round(metric / days);
  };
  
  // Cost per view performance
  const costPerView = calculateCostPerMetric(campaignMetrics.views);
  const costPerViewPerformance = getPerformanceScore(costPerView, 'costPerView');
  
  // Engagement performance - safely handle the engagement value
  let engagementValue;
  if (typeof campaignMetrics.engagement === 'number') {
    engagementValue = campaignMetrics.engagement;
  } else if (typeof campaignMetrics.engagement === 'string') {
    engagementValue = parseFloat(campaignMetrics.engagement.replace('%', ''));
    if (isNaN(engagementValue)) engagementValue = 0;
  } else {
    engagementValue = 0;
  }
  
  const engagementPerformance = getPerformanceScore(engagementPercentage, 'engagement');
  
  // Define metrics cards
  const metricCards = [
    {
      title: 'Total Views',
      value: formatNumber(campaignMetrics.views),
      daily: formatNumber(calculateDailyAverage(campaignMetrics.views)),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )
    },
    {
      title: 'Total Likes',
      value: formatNumber(campaignMetrics.likes),
      daily: formatNumber(calculateDailyAverage(campaignMetrics.likes)),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    },
    {
      title: 'Comments',
      value: formatNumber(campaignMetrics.comments),
      daily: formatNumber(calculateDailyAverage(campaignMetrics.comments)),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    },
    {
      title: 'Shares',
      value: formatNumber(campaignMetrics.shares),
      daily: formatNumber(calculateDailyAverage(campaignMetrics.shares)),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      )
    },
    {
      title: 'New Followers',
      value: formatNumber(campaignMetrics.follows),
      daily: formatNumber(calculateDailyAverage(campaignMetrics.follows)),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      )
    },
    {
      title: 'Cost Per View',
      value: costPerView,
      performance: costPerViewPerformance,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: 'Engagement Rate',
      value: engagementPercentage,
      performance: engagementPerformance,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
  ];
  
  return (
    <div className="bg-white rounded-lg shadow-md p-5">
      <h3 className="text-lg font-bold mb-4">Performance Metrics</h3>
      
      {activeCampaignLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {metricCards.map((card, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0 mr-3 text-primary">
                  {card.icon}
                </div>
                <div>
                  <p className="text-sm text-gray-500">{card.title}</p>
                  <p className="text-xl font-bold">{card.value}</p>
                  {card.daily && (
                    <p className="text-xs text-gray-500">
                      {card.daily}/day avg
                    </p>
                  )}
                  {card.performance && (
                    <p className={`text-xs ${card.performance.color}`}>
                      {card.performance.label}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!activeCampaignLoading && !metrics?.summary && activeCampaign?.status === 'active' && (
        <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded text-sm">
          <p>Your campaign is active! TikTok metrics will appear here once content creators start publishing videos featuring your music.</p>
        </div>
      )}
      
      {!activeCampaignLoading && !metrics?.summary && activeCampaign?.status !== 'active' && (
        <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded text-sm">
          <p>Metrics will appear here once your campaign is approved and activated.</p>
        </div>
      )}
    </div>
  );
};

PerformanceMetrics.propTypes = {
  metrics: PropTypes.shape({
    summary: PropTypes.shape({
      views: PropTypes.number,
      likes: PropTypes.number,
      comments: PropTypes.number,
      shares: PropTypes.number,
      follows: PropTypes.number,
      engagement: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string
      ])
    })
  })
};

export default PerformanceMetrics;