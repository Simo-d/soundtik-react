import React from 'react';
import PropTypes from 'prop-types';
import { useCampaign } from '../../hooks/useCampaign';

/**
 * Engagement statistics component - displays engagement rates and comparisons to benchmarks
 * @param {Object} props - Component props
 */
const EngagementStats = ({ metrics }) => {
  const { activeCampaignLoading } = useCampaign();
  
  // Calculate engagement metrics
  const calculateEngagementRate = () => {
    if (!metrics?.summary) return 0;
    
    const { views, likes, comments, shares } = metrics.summary;
    if (!views || views === 0) return 0;
    
    // Engagement rate = (likes + comments + shares) / views * 100
    const total = (likes || 0) + (comments || 0) + (shares || 0);
    return (total / views) * 100;
  };
  
  // Get engagement rate compared to industry average
  const getEngagementComparison = () => {
    const rate = calculateEngagementRate();
    // Industry average engagement rate (example)
    const industryAverage = 5.0;
    
    const difference = rate - industryAverage;
    const percentDifference = (difference / industryAverage) * 100;
    
    return {
      rate,
      industryAverage,
      difference,
      percentDifference,
      isAboveAverage: difference > 0
    };
  };
  
  // Format percentage
  const formatPercentage = (value, precision = 2) => {
    return value.toFixed(precision) + '%';
  };
  
  // Get color class based on comparison
  const getComparisonColorClass = (isAboveAverage) => {
    return isAboveAverage ? 'text-success' : 'text-error';
  };
  
  // Engagement comparison data
  const comparison = getEngagementComparison();
  
  // Engagement breakdown
  const getEngagementBreakdown = () => {
    if (!metrics?.summary) {
      return {
        likeRate: 0,
        commentRate: 0,
        shareRate: 0
      };
    }
    
    const { views, likes, comments, shares } = metrics.summary;
    if (!views || views === 0) {
      return {
        likeRate: 0,
        commentRate: 0,
        shareRate: 0
      };
    }
    
    return {
      likeRate: ((likes || 0) / views) * 100,
      commentRate: ((comments || 0) / views) * 100,
      shareRate: ((shares || 0) / views) * 100
    };
  };
  
  const breakdown = getEngagementBreakdown();
  
  return (
    <div className="bg-white rounded-lg shadow-md p-5">
      <h3 className="text-lg font-bold mb-4">Engagement Analysis</h3>
      
      {activeCampaignLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : metrics?.summary ? (
        <div className="space-y-6">
          {/* Overall Engagement Rate */}
          <div className="text-center py-4">
            <h4 className="text-base font-medium mb-1">Overall Engagement Rate</h4>
            <p className="text-3xl font-bold text-primary">{formatPercentage(comparison.rate)}</p>
            
            <div className={`flex items-center justify-center mt-2 ${getComparisonColorClass(comparison.isAboveAverage)}`}>
              {comparison.isAboveAverage ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              <span className="text-sm font-medium">
                {formatPercentage(Math.abs(comparison.percentDifference), 1)} {comparison.isAboveAverage ? 'above' : 'below'} industry average
              </span>
            </div>
          </div>
          
          {/* Industry Benchmark Comparison */}
          <div className="mb-4">
            <h4 className="text-base font-medium mb-2">Industry Benchmark Comparison</h4>
            <div className="bg-gray-100 p-3 rounded-md">
              <div className="flex justify-between mb-1">
                <span className="text-sm">Your campaign</span>
                <span className="text-sm font-medium">{formatPercentage(comparison.rate)}</span>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-2 mb-3">
                <div 
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${Math.min(100, comparison.rate * 5)}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between mb-1">
                <span className="text-sm">Industry average</span>
                <span className="text-sm font-medium">{formatPercentage(comparison.industryAverage)}</span>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-2">
                <div 
                  className="bg-gray-500 h-2 rounded-full"
                  style={{ width: `${Math.min(100, comparison.industryAverage * 5)}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {/* Engagement Breakdown */}
          <div>
            <h4 className="text-base font-medium mb-2">Engagement Breakdown</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <p className="text-sm font-medium">Like Rate</p>
                <p className="text-lg font-bold">{formatPercentage(breakdown.likeRate, 1)}</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-600 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-sm font-medium">Comment Rate</p>
                <p className="text-lg font-bold">{formatPercentage(breakdown.commentRate, 1)}</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </div>
                <p className="text-sm font-medium">Share Rate</p>
                <p className="text-lg font-bold">{formatPercentage(breakdown.shareRate, 1)}</p>
              </div>
            </div>
          </div>
          
          {/* Tips */}
          <div className="mt-4 p-3 bg-blue-50 rounded-md text-sm text-blue-700">
            <p className="font-medium mb-1">Engagement Tips:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Higher engagement rates indicate stronger audience interest and better content resonance.</li>
              <li>The industry average for TikTok is around 5-6% engagement rate.</li>
              <li>Aim for engagement that encourages sharing to maximize reach.</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-gray-600 mb-2">
            No engagement data is available yet.
          </p>
          <p className="text-sm text-gray-500">
            Engagement statistics will appear here once your campaign begins generating interactions.
          </p>
        </div>
      )}
    </div>
  );
};

EngagementStats.propTypes = {
  metrics: PropTypes.shape({
    summary: PropTypes.shape({
      views: PropTypes.number,
      likes: PropTypes.number,
      comments: PropTypes.number,
      shares: PropTypes.number,
      engagement: PropTypes.number
    })
  })
};

export default EngagementStats;