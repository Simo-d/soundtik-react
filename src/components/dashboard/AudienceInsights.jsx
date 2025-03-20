import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useCampaign } from '../../hooks/useCampaign';

/**
 * Audience insights component - displays demographic and geographic data about campaign viewers
 * @param {Object} props - Component props
 */
const AudienceInsights = ({ metrics }) => {
  const { activeCampaignLoading } = useCampaign();
  const [activeTab, setActiveTab] = useState('age'); // 'age', 'gender', 'location'
  
  // Default/placeholder values
  const defaultAgeData = [
    { age: '13-17', percentage: 15 },
    { age: '18-24', percentage: 38 },
    { age: '25-34', percentage: 28 },
    { age: '35-44', percentage: 12 },
    { age: '45+', percentage: 7 }
  ];
  
  const defaultGenderData = [
    { gender: 'Female', percentage: 58 },
    { gender: 'Male', percentage: 40 },
    { gender: 'Other', percentage: 2 }
  ];
  
  const defaultLocationData = [
    { country: 'United States', percentage: 40 },
    { country: 'United Kingdom', percentage: 15 },
    { country: 'Canada', percentage: 12 },
    { country: 'Australia', percentage: 8 },
    { country: 'Germany', percentage: 5 },
    { country: 'Other', percentage: 20 }
  ];
  
  // Use real data if available, otherwise use placeholders
  const ageData = metrics?.audience?.age || defaultAgeData;
  const genderData = metrics?.audience?.gender || defaultGenderData;
  const locationData = metrics?.audience?.location || defaultLocationData;
  
  // Check if we have real data
  const hasRealData = !!metrics?.audience;
  
  // Calculate total views for context
  const totalViews = metrics?.summary?.views || 0;
  
  // Color mapping for age groups
  const getAgeColor = (index) => {
    const colors = [
      'bg-indigo-500',
      'bg-blue-500',
      'bg-cyan-500',
      'bg-teal-500',
      'bg-green-500'
    ];
    return colors[index % colors.length];
  };
  
  // Color mapping for gender
  const getGenderColor = (gender) => {
    switch (gender.toLowerCase()) {
      case 'female': return 'bg-purple-500';
      case 'male': return 'bg-blue-500';
      default: return 'bg-green-500';
    }
  };
  
  // Color mapping for locations
  const getLocationColor = (index) => {
    const colors = [
      'bg-indigo-500',
      'bg-blue-500',
      'bg-cyan-500',
      'bg-teal-500',
      'bg-green-500',
      'bg-yellow-500'
    ];
    return colors[index % colors.length];
  };
  
  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-5">
      <h3 className="text-lg font-bold mb-4">Audience Insights</h3>
      
      {activeCampaignLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {!hasRealData && (
            <div className="bg-blue-50 text-blue-700 p-4 rounded-md text-sm mb-4">
              {metrics ? (
                <p>
                  We're still collecting detailed audience data for your campaign. The information below
                  represents estimated data based on similar campaigns.
                </p>
              ) : (
                <p>
                  Audience insights will appear here once your campaign is active and generating engagement.
                  For now, we're showing estimated data based on similar campaigns.
                </p>
              )}
            </div>
          )}
          
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200">
            <button
              className={`px-4 py-2 font-medium text-sm border-b-2 ${
                activeTab === 'age' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => handleTabChange('age')}
            >
              Age
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm border-b-2 ${
                activeTab === 'gender' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => handleTabChange('gender')}
            >
              Gender
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm border-b-2 ${
                activeTab === 'location' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => handleTabChange('location')}
            >
              Location
            </button>
          </div>
          
          {/* Age Distribution Tab */}
          {activeTab === 'age' && (
            <div className="py-2">
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Age Distribution</h4>
                <div className="flex items-center mb-2 h-8">
                  {ageData.map((item, index) => (
                    <div 
                      key={index} 
                      className={`h-full ${getAgeColor(index)}`} 
                      style={{ width: `${item.percentage}%` }}
                      title={`${item.age}: ${item.percentage}%`}
                    ></div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {ageData.map((item, index) => (
                    <div key={index} className="flex items-center">
                      <div 
                        className={`w-3 h-3 rounded-sm mr-1 ${getAgeColor(index)}`} 
                      ></div>
                      <span className="text-sm">{item.age}: {item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Age Analysis</h4>
                <div className="space-y-3">
                  {ageData.map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{item.age}</span>
                        <span className="text-gray-600">{item.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`${getAgeColor(index)} h-2.5 rounded-full`}
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        ~{Math.round((item.percentage / 100) * totalViews).toLocaleString()} viewers
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 text-sm text-gray-600">
                <p className="font-medium mb-1">Key Insight:</p>
                <p>
                  {hasRealData 
                    ? `Your content performs best with the ${ageData[0].age} age group, accounting for ${ageData[0].percentage}% of your audience.`
                    : 'TikTok users in the 18-24 age range typically engage most with music content like yours.'}
                </p>
              </div>
            </div>
          )}
          
          {/* Gender Distribution Tab */}
          {activeTab === 'gender' && (
            <div className="py-2">
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Gender Distribution</h4>
                <div className="relative pt-1">
                  <div className="flex h-16 mb-4">
                    <div className="flex flex-col justify-center items-center w-full">
                      <div className="flex w-full h-8">
                        {genderData.map((item, index) => (
                          <div 
                            key={index} 
                            className={`h-full ${getGenderColor(item.gender)}`} 
                            style={{ width: `${item.percentage}%` }}
                            title={`${item.gender}: ${item.percentage}%`}
                          ></div>
                        ))}
                      </div>
                      <div className="flex justify-between w-full mt-2">
                        {genderData.map((item, index) => (
                          <div 
                            key={index} 
                            className="text-center"
                            style={{ 
                              width: `${item.percentage}%`,
                              maxWidth: '100%',
                              minWidth: item.percentage > 10 ? 'auto' : '60px'
                            }}
                          >
                            <div className="flex flex-col items-center">
                              <span className="text-lg font-bold">{item.percentage}%</span>
                              <span className="text-xs text-gray-500">{item.gender}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {genderData.map((item, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center mb-2">
                        <div 
                          className={`w-3 h-3 rounded-full mr-2 ${getGenderColor(item.gender)}`} 
                        ></div>
                        <span className="font-medium">{item.gender}</span>
                      </div>
                      <div className="text-2xl font-bold">{item.percentage}%</div>
                      <p className="text-xs text-gray-500">
                        ~{Math.round((item.percentage / 100) * totalViews).toLocaleString()} viewers
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 text-sm text-gray-600">
                <p className="font-medium mb-1">Key Insight:</p>
                <p>
                  {hasRealData 
                    ? `Your content has a ${genderData[0].percentage - genderData[1].percentage}% higher viewership among ${genderData[0].gender} viewers.`
                    : 'Music content on TikTok typically sees higher engagement from female users.'}
                </p>
              </div>
            </div>
          )}
          
          {/* Geographic Distribution Tab */}
          {activeTab === 'location' && (
            <div className="py-2">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Top Locations</h4>
                <div className="space-y-3">
                  {locationData.map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{item.country}</span>
                        <span className="text-gray-600">{item.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`${getLocationColor(index)} h-2.5 rounded-full`}
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        ~{Math.round((item.percentage / 100) * totalViews).toLocaleString()} viewers
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 text-sm text-gray-600">
                <p className="font-medium mb-1">Key Insight:</p>
                <p>
                  {hasRealData 
                    ? `Your audience is primarily from ${locationData[0].country} (${locationData[0].percentage}%) and ${locationData[1].country} (${locationData[1].percentage}%).`
                    : 'English-speaking countries typically engage most with music content like yours on TikTok.'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

AudienceInsights.propTypes = {
  metrics: PropTypes.shape({
    summary: PropTypes.shape({
      views: PropTypes.number
    }),
    audience: PropTypes.shape({
      age: PropTypes.arrayOf(PropTypes.shape({
        age: PropTypes.string.isRequired,
        percentage: PropTypes.number.isRequired
      })),
      gender: PropTypes.arrayOf(PropTypes.shape({
        gender: PropTypes.string.isRequired,
        percentage: PropTypes.number.isRequired
      })),
      location: PropTypes.arrayOf(PropTypes.shape({
        country: PropTypes.string.isRequired,
        percentage: PropTypes.number.isRequired
      }))
    })
  })
};

export default AudienceInsights;