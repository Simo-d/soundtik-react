import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useCampaign } from '../../hooks/useCampaign';

/**
 * Metric chart component - renders a chart of campaign metrics over time
 * @param {Object} props - Component props
 */
const MetricChart = ({ dailyMetrics = [] }) => {
  const { activeCampaignLoading } = useCampaign();
  const [chartData, setChartData] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState('views');
  
  // Process metrics data when it changes
  useEffect(() => {
    if (!dailyMetrics || dailyMetrics.length === 0) {
      setChartData([]);
      return;
    }
    
    // Sort by date ascending
    const sortedMetrics = [...dailyMetrics].sort((a, b) => {
      const dateA = a.date ? new Date(a.date.toDate ? a.date.toDate() : a.date) : new Date(0);
      const dateB = b.date ? new Date(b.date.toDate ? b.date.toDate() : b.date) : new Date(0);
      return dateA - dateB;
    });
    
    // Format data for display
    const formattedData = sortedMetrics.map(metric => {
      const date = metric.date ? new Date(metric.date.toDate ? metric.date.toDate() : metric.date) : new Date();
      
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        views: metric.views || 0,
        likes: metric.likes || 0,
        comments: metric.comments || 0,
        shares: metric.shares || 0,
        newFollowers: metric.newFollowers || 0
      };
    });
    
    setChartData(formattedData);
  }, [dailyMetrics]);

  // Get max value for current metric to scale the chart
  const getMaxValue = () => {
    if (chartData.length === 0) return 100;
    
    const maxValue = Math.max(...chartData.map(item => item[selectedMetric]));
    return maxValue > 0 ? maxValue : 100;
  };
  
  // Get the name display for a metric
  const getMetricName = (metric) => {
    switch (metric) {
      case 'views': return 'Views';
      case 'likes': return 'Likes';
      case 'comments': return 'Comments';
      case 'shares': return 'Shares';
      case 'newFollowers': return 'New Followers';
      default: return 'Views';
    }
  };
  
  // Format number for display
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-5">
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Performance Over Time</h3>
        
        <div className="mt-2 sm:mt-0">
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="bg-white border border-gray-300 text-gray-700 py-1 px-2 pr-8 rounded leading-tight focus:outline-none focus:border-primary"
          >
            <option value="views">Views</option>
            <option value="likes">Likes</option>
            <option value="comments">Comments</option>
            <option value="shares">Shares</option>
            <option value="newFollowers">New Followers</option>
          </select>
        </div>
      </div>
      
      {activeCampaignLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : chartData.length > 0 ? (
        <div className="pt-6">
          {/* Y-axis labels */}
          <div className="flex">
            <div className="w-10 text-right text-xs text-gray-500">
              <div className="h-6">{formatNumber(getMaxValue())}</div>
              <div className="h-6">{formatNumber(getMaxValue() * 0.75)}</div>
              <div className="h-6">{formatNumber(getMaxValue() * 0.5)}</div>
              <div className="h-6">{formatNumber(getMaxValue() * 0.25)}</div>
              <div className="h-6">0</div>
            </div>
            
            {/* Chart */}
            <div className="flex-1 ml-2">
              <div className="relative h-30">
                {/* Horizontal grid lines */}
                <div className="absolute left-0 right-0 border-t border-gray-200" style={{ top: '0%' }}></div>
                <div className="absolute left-0 right-0 border-t border-gray-200" style={{ top: '25%' }}></div>
                <div className="absolute left-0 right-0 border-t border-gray-200" style={{ top: '50%' }}></div>
                <div className="absolute left-0 right-0 border-t border-gray-200" style={{ top: '75%' }}></div>
                <div className="absolute left-0 right-0 border-t border-gray-200" style={{ top: '100%' }}></div>
                
                {/* Bars */}
                <div className="flex h-30 items-end">
                  {chartData.map((data, index) => {
                    const value = data[selectedMetric];
                    const percentage = (value / getMaxValue()) * 100;
                    
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-4/5 bg-primary rounded-t"
                          style={{ height: `${percentage}%` }}
                          title={`${data.date}: ${value} ${getMetricName(selectedMetric)}`}
                        ></div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* X-axis labels */}
              <div className="flex mt-1">
                {chartData.map((data, index) => (
                  <div key={index} className="flex-1 text-center">
                    <div className="text-xs text-gray-500">{data.date}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 text-blue-700 p-4 rounded-md text-sm">
          <p>
            Performance data will appear here once your campaign is active and generating metrics.
          </p>
        </div>
      )}
    </div>
  );
};

MetricChart.propTypes = {
  dailyMetrics: PropTypes.arrayOf(PropTypes.shape({
    date: PropTypes.any,
    views: PropTypes.number,
    likes: PropTypes.number,
    comments: PropTypes.number,
    shares: PropTypes.number,
    newFollowers: PropTypes.number
  }))
};

export default MetricChart;