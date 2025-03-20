import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

/**
 * CAMPAIGN METHODS
 */

/**
 * Create a new campaign
 * @param {string} userId - User ID of the campaign creator
 * @param {Object} campaignData - Campaign data
 * @returns {Promise<string>} - Campaign ID
 */
export const createCampaign = async (userId, campaignData) => {
  try {
    // Ensure songDetails has valid URLs
    const validatedCampaignData = {
      ...campaignData,
      songDetails: {
        ...campaignData.songDetails,
        audioUrl: campaignData.songDetails.audioUrl || '',
        coverArtUrl: campaignData.songDetails.coverArtUrl || ''
      }
    };
    
    const campaignRef = await addDoc(collection(db, 'campaigns'), {
      userId,
      ...validatedCampaignData,
      status: 'draft',
      createdAt: serverTimestamp(),
      isValidated: false
    });
    
    return campaignRef.id;
  } catch (error) {
    console.error('Error creating campaign:', error);
    throw error;
  }
};

/**
 * Get a campaign by ID
 * @param {string} campaignId - Campaign ID
 * @returns {Promise<Object>} - Campaign data
 */
export const getCampaign = async (campaignId) => {
  try {
    const docRef = doc(db, 'campaigns', campaignId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Campaign not found');
    }
  } catch (error) {
    console.error('Error getting campaign:', error);
    throw error;
  }
};

/**
 * Get all campaigns for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of campaign objects
 */
export const getUserCampaigns = async (userId) => {
  try {
    const campaignsRef = collection(db, 'campaigns');
    const q = query(
      campaignsRef, 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user campaigns:', error);
    throw error;
  }
};

/**
 * Update a campaign
 * @param {string} campaignId - Campaign ID
 * @param {Object} campaignData - Updated campaign data
 * @returns {Promise<void>}
 */
export const updateCampaign = async (campaignId, campaignData) => {
  try {
    const campaignRef = doc(db, 'campaigns', campaignId);
    await updateDoc(campaignRef, {
      ...campaignData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating campaign:', error);
    throw error;
  }
};

/**
 * Delete a campaign
 * @param {string} campaignId - Campaign ID
 * @returns {Promise<void>}
 */
export const deleteCampaign = async (campaignId) => {
  try {
    await deleteDoc(doc(db, 'campaigns', campaignId));
  } catch (error) {
    console.error('Error deleting campaign:', error);
    throw error;
  }
};

/**
 * Submit a campaign for validation
 * @param {string} campaignId - Campaign ID
 * @returns {Promise<void>}
 */
export const submitCampaign = async (campaignId) => {
  try {
    const campaignRef = doc(db, 'campaigns', campaignId);
    await updateDoc(campaignRef, {
      status: 'pending',
      submittedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error submitting campaign:', error);
    throw error;
  }
};

/**
 * CAMPAIGN METRICS METHODS
 */

/**
 * Get campaign metrics
 * @param {string} campaignId - Campaign ID
 * @returns {Promise<Object|null>} - Campaign metrics or null if not found
 */
export const getCampaignMetrics = async (campaignId) => {
  try {
    const docRef = doc(db, 'campaignMetrics', campaignId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      // If no metrics exist yet, create mock metrics for testing
      return {
        summary: {
          views: Math.floor(Math.random() * 10000),
          likes: Math.floor(Math.random() * 1000),
          comments: Math.floor(Math.random() * 200),
          shares: Math.floor(Math.random() * 300),
          follows: Math.floor(Math.random() * 100),
          engagement: (Math.random() * 5 + 3).toFixed(2)
        },
        dailyMetrics: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 86400000),
          views: Math.floor(Math.random() * 1500),
          likes: Math.floor(Math.random() * 150),
          comments: Math.floor(Math.random() * 30),
          shares: Math.floor(Math.random() * 50),
          newFollowers: Math.floor(Math.random() * 15)
        }))
      };
    }
  } catch (error) {
    console.error('Error getting campaign metrics:', error);
    throw error;
  }
};

/**
 * Get daily metrics for a campaign
 * @param {string} campaignId - Campaign ID
 * @returns {Promise<Array>} - Array of daily metrics
 */
export const getDailyMetrics = async (campaignId) => {
  try {
    const metricsRef = collection(db, `campaignMetrics/${campaignId}/dailyMetrics`);
    const q = query(metricsRef, orderBy('date', 'asc'));
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      // If no metrics exist yet, create mock metrics for testing
      return Array.from({ length: 7 }, (_, i) => ({
        id: `day-${i}`,
        date: new Date(Date.now() - (6 - i) * 86400000),
        views: Math.floor(Math.random() * 1500),
        likes: Math.floor(Math.random() * 150),
        comments: Math.floor(Math.random() * 30),
        shares: Math.floor(Math.random() * 50),
        newFollowers: Math.floor(Math.random() * 15)
      }));
    }
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting daily metrics:', error);
    throw error;
  }
};

/**
 * CAMPAIGN VIDEOS METHODS
 */

/**
 * Get videos for a campaign
 * @param {string} campaignId - Campaign ID
 * @returns {Promise<Array>} - Array of video objects
 */
export const getCampaignVideos = async (campaignId) => {
  try {
    const videosRef = collection(db, 'videos');
    const q = query(
      videosRef,
      where('campaignId', '==', campaignId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      // If no videos exist yet, create mock videos for testing
      return Array.from({ length: 3 }, (_, i) => ({
        id: `video-${i}`,
        campaignId,
        tiktokId: `tt${Math.random().toString(36).substring(2, 10)}`,
        url: `https://tiktok.com/@creator/video/${Math.random().toString(36).substring(2, 15)}`,
        thumbnail: `https://via.placeholder.com/300x500?text=TikTok+Video+${i+1}`,
        caption: `Check out this amazing song! #trending #music #viral ${i === 0 ? '#newartist' : ''}`,
        createdAt: new Date(Date.now() - i * 86400000 * 2),
        metrics: {
          views: Math.floor(Math.random() * 5000),
          likes: Math.floor(Math.random() * 500),
          comments: Math.floor(Math.random() * 100),
          shares: Math.floor(Math.random() * 150)
        },
        status: 'published'
      }));
    }
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting campaign videos:', error);
    throw error;
  }
};

/**
 * ADMIN METHODS
 */

/**
 * Get pending campaigns for admin validation
 * @param {number} limit - Number of campaigns to retrieve
 * @returns {Promise<Array>} - Array of pending campaign objects
 */
export const getPendingCampaigns = async (limitCount = 20) => {
  try {
    const campaignsRef = collection(db, 'campaigns');
    const q = query(
      campaignsRef,
      where('status', '==', 'pending'),
      orderBy('submittedAt', 'asc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting pending campaigns:', error);
    throw error;
  }
};

/**
 * Validate a campaign (admin only)
 * @param {string} campaignId - Campaign ID
 * @param {boolean} isApproved - Whether the campaign is approved
 * @param {string} adminId - Admin user ID
 * @param {string} notes - Optional admin notes
 * @returns {Promise<void>}
 */
export const validateCampaign = async (campaignId, isApproved, adminId, notes = '') => {
  try {
    const campaignRef = doc(db, 'campaigns', campaignId);
    const campaignSnap = await getDoc(campaignRef);
    
    if (!campaignSnap.exists()) {
      throw new Error('Campaign not found');
    }
    
    const campaignData = campaignSnap.data();
    
    await updateDoc(campaignRef, {
      status: isApproved ? 'active' : 'rejected',
      isValidated: true,
      validatedBy: adminId,
      adminNotes: notes,
      validatedAt: serverTimestamp(),
      startDate: isApproved ? serverTimestamp() : null,
      endDate: isApproved 
        ? new Date(Date.now() + (campaignData.campaignDetails.duration * 86400000))
        : null
    });
  } catch (error) {
    console.error('Error validating campaign:', error);
    throw error;
  }
};

export default {
  createCampaign,
  getCampaign,
  getUserCampaigns,
  updateCampaign,
  deleteCampaign,
  submitCampaign,
  getCampaignMetrics,
  getDailyMetrics,
  getCampaignVideos,
  getPendingCampaigns,
  validateCampaign
};