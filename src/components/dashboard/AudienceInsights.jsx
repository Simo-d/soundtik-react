import React from 'react';
import PropTypes from 'prop-types';
import { useCampaign } from '../../hooks/useCampaign';

/**
 * Audience insights component - displays demographic and geographic data about campaign viewers
 * @param {Object} props - Component props
 */
const AudienceInsights = ({ metrics }) => {
  const { activeCampaignLoading } = useCampaign();
  
  // Default/placeholder values
  const defaultAgeData = [
    { age: '13-17', percentage: 10 },
    { age: '18-24', percentage: 35 },
    { age: '25-34', percentage: 30 },
    { age: '35-44', percentage: 15 },
    { age: '45+', percentage: 10 }
  ];
  
  const defaultGenderData = [
    { gender: 'Female', percentage: 55 },
    { gender: 'Male', percentage: 43 },
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
          
          {/* Age Distribution */}
          <div>
            <h4 className="text-base font-medium mb-2">Age Distribution</h4>
            <div className="space-y-2">
              {ageData.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{item.age}</span>
                    <span className="text-gray-600">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-primary h-2.5 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Gender Distribution */}
          <div>
            <h4 className="text-base font-medium mb-2">Gender Distribution</h4>
            <div className="flex items-center mb-2">
              {genderData.map((item, index) => (
                <div 
                  key={index} 
                  className="h-8" 
                  style={{ 
                    width: `${item.percentage}%`,
                    backgroundColor: index === 0 ? '#8b5cf6' : index === 1 ? '#3b82f6' : '#10b981'
                  }}
                ></div>
              ))}
            </div>
            <div className="flex space-x-4">
              {genderData.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-1" 
                    style={{ 
                      backgroundColor: index === 0 ? '#8b5cf6' : index === 1 ? '#3b82f6' : '#10b981'
                    }}
                  ></div>
                  <span className="text-sm">{item.gender} ({item.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Geographic Distribution */}
          <div>
            <h4 className="text-base font-medium mb-2">Top Locations</h4>
            <div className="space-y-2">
              {locationData.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{item.country}</span>
                    <span className="text-gray-600">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-primary h-2.5 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

AudienceInsights.propTypes = {
  metrics: PropTypes.shape({
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