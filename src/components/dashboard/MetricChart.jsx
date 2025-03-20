import React, { useState, useEffect, useRef } from 'react';
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
  const [timeRange, setTimeRange] = useState('all'); // 'all', 'week', 'month'
  const chartRef = useRef(null);
  
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
    
    // Filter by time range
    const now = new Date();
    let filteredMetrics = sortedMetrics;
    
    if (timeRange === 'week') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredMetrics = sortedMetrics.filter(metric => {
        const metricDate = metric.date ? new Date(metric.date.toDate ? metric.date.toDate() : metric.date) : new Date(0);
        return metricDate >= oneWeekAgo;
      });
    } else if (timeRange === 'month') {
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filteredMetrics = sortedMetrics.filter(metric => {
        const metricDate = metric.date ? new Date(metric.date.toDate ? metric.date.toDate() : metric.date) : new Date(0);
        return metricDate >= oneMonthAgo;
      });
    }
    
    // Format data for display
    const formattedData = filteredMetrics.map(metric => {
      const date = metric.date ? new Date(metric.date.toDate ? metric.date.toDate() : metric.date) : new Date();
      
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        dateObj: date,
        views: metric.views || 0,
        likes: metric.likes || 0,
        comments: metric.comments || 0,
        shares: metric.shares || 0,
        newFollowers: metric.newFollowers || 0
      };
    });
    
    setChartData(formattedData);
  }, [dailyMetrics, timeRange]);

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
  
  // Calculate total for selected metric
  const calculateTotal = () => {
    if (chartData.length === 0) return 0;
    return chartData.reduce((total, day) => total + day[selectedMetric], 0);
  };
  
  // Calculate average for selected metric
  const calculateAverage = () => {
    if (chartData.length === 0) return 0;
    return Math.round(calculateTotal() / chartData.length);
  };
  
  // Calculate growth percentage
  const calculateGrowth = () => {
    if (chartData.length <= 1) return null;
    
    // Get first and last day values
    const firstDay = chartData[0][selectedMetric];
    const lastDay = chartData[chartData.length - 1][selectedMetric];
    
    // Avoid division by zero
    if (firstDay === 0) return 'N/A';
    
    const growthPercentage = ((lastDay - firstDay) / firstDay) * 100;
    return growthPercentage.toFixed(1) + '%';
  };
  
  // Determine if growth is positive or negative
  const isGrowthPositive = () => {
    if (chartData.length <= 1) return true;
    
    const firstDay = chartData[0][selectedMetric];
    const lastDay = chartData[chartData.length - 1][selectedMetric];
    
    return lastDay >= firstDay;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-5">
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Performance Over Time</h3>
        
        <div className="flex space-x-2 mt-2 sm:mt-0">
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="bg-white border border-gray-300 text-gray-700 py-1 px-2 pr-8 rounded leading-tight focus:outline-none focus:border-primary text-sm"
          >
            <option value="views">Views</option>
            <option value="likes">Likes</option>
            <option value="comments">Comments</option>
            <option value="shares">Shares</option>
            <option value="newFollowers">New Followers</option>
          </select>
          
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-white border border-gray-300 text-gray-700 py-1 px-2 pr-8 rounded leading-tight focus:outline-none focus:border-primary text-sm"
          >
            <option value="all">All Time</option>
            <option value="month">Last 30 Days</option>
            <option value="week">Last 7 Days</option>
          </select>
        </div>
      </div>
      
      {activeCampaignLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : chartData.length > 0 ? (
        <div>
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-xl font-bold">{formatNumber(calculateTotal())}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Daily Average</p>
              <p className="text-xl font-bold">{formatNumber(calculateAverage())}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Growth</p>
              {calculateGrowth() ? (
                <p className={`text-xl font-bold ${isGrowthPositive() ? 'text-green-600' : 'text-red-600'}`}>
                  {isGrowthPositive() ? '+' : ''}{calculateGrowth()}
                </p>
              ) : (
                <p className="text-xl font-bold text-gray-400">—</p>
              )}
            </div>
          </div>
          
          {/* Chart */}
          <div className="pt-6" ref={chartRef}>
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
                  <div className="flex h-30 items-end relative">
                    {chartData.map((data, index) => {
                      const value = data[selectedMetric];
                      const percentage = (value / getMaxValue()) * 100;
                      
                      return (
                        <div 
                          key={index} 
                          className="flex-1 flex flex-col items-center group"
                          title={`${data.date}: ${value} ${getMetricName(selectedMetric)}`}
                        >
                          <div className="relative w-full flex justify-center">
                            <div 
                              className="w-4/5 bg-primary rounded-t transition-all duration-300 group-hover:bg-primary-light"
                              style={{ height: `${percentage}%` }}
                            ></div>
                            
                            {/* Tooltip */}
                            <div className="absolute opacity-0 group-hover:opacity-100 bottom-full mb-2 bg-gray-800 text-white text-xs px-2 py-1 rounded pointer-events-none transition-opacity duration-200 whitespace-nowrap">
                              {data.date}: {value.toLocaleString()} {getMetricName(selectedMetric)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Trend line */}
                    {chartData.length > 1 && (
                      <svg className="absolute inset-0 h-full w-full overflow-visible pointer-events-none">
                        <polyline
                          points={chartData.map((data, index) => {
                            const value = data[selectedMetric];
                            const percentage = (value / getMaxValue()) * 100;
                            const x = (index / (chartData.length - 1)) * 100 + '%';
                            const y = (100 - percentage) + '%';
                            return `${x} ${y}`;
                          }).join(' ')}
                          fill="none"
                          stroke="#4F46E5"
                          strokeWidth="2"
                          strokeDasharray="3,3"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                
                {/* X-axis labels */}
                <div className="flex mt-1">
                  {chartData.map((data, index) => {
                    // Only show every nth label if there are more than 10 data points
                    const showLabel = chartData.length <= 10 || index % Math.ceil(chartData.length / 10) === 0;
                    
                    return (
                      <div key={index} className="flex-1 text-center">
                        {showLabel && (
                          <div className="text-xs text-gray-500 truncate" style={{ transform: 'rotate(-45deg)', transformOrigin: 'top left', marginLeft: '8px' }}>
                            {data.date}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
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