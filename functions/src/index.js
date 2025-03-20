// functions/src/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Create a Firestore instance
const db = admin.firestore();

// Example function to submit a campaign for validation
exports.submitCampaignForValidation = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  }

  const { campaignId } = data;

  try {
    // Update campaign status to pending
    await db.collection('campaigns').doc(campaignId).update({
      status: 'pending',
      submittedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Error submitting campaign:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Example function to validate a campaign (admin only)
exports.validateCampaign = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  }

  // Check if user is an admin
  const userSnapshot = await db.collection('users').doc(context.auth.uid).get();
  if (!userSnapshot.exists || userSnapshot.data().role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Must be an admin to validate campaigns');
  }

  const { campaignId, isApproved, notes } = data;

  try {
    const campaignRef = db.collection('campaigns').doc(campaignId);
    const campaignSnap = await campaignRef.get();
    
    if (!campaignSnap.exists) {
      throw new Error('Campaign not found');
    }
    
    const campaignData = campaignSnap.data();
    
    await campaignRef.update({
      status: isApproved ? 'active' : 'rejected',
      isValidated: true,
      validatedBy: context.auth.uid,
      adminNotes: notes || '',
      validatedAt: admin.firestore.FieldValue.serverTimestamp(),
      startDate: isApproved ? admin.firestore.FieldValue.serverTimestamp() : null,
      endDate: isApproved 
        ? new Date(Date.now() + (campaignData.campaignDetails.duration * 86400000)) 
        : null
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error validating campaign:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});