#!/bin/bash

# Create SoundTik Project Structure inside existing Create React App
echo "Creating SoundTik project structure inside your Create React App..."

# Create additional public assets directories
mkdir -p public/assets/images public/assets/fonts

# Create src directory structure (preserving existing CRA files)
mkdir -p src/components/common src/components/auth src/components/campaign src/components/dashboard
mkdir -p src/contexts
mkdir -p src/firebase
mkdir -p src/hooks
mkdir -p src/pages
mkdir -p src/services
mkdir -p src/utils
mkdir -p src/styles

# Create base files (if they don't conflict with CRA)
touch src/routes.jsx

# Create style files
touch src/styles/global.css
touch src/styles/theme.js

# Create Firebase config files
touch src/firebase/config.js
touch src/firebase/auth.js
touch src/firebase/firestore.js
touch src/firebase/storage.js
touch src/firebase/functions.js
touch src/firebase/analytics.js

# Create Context files
touch src/contexts/AuthContext.jsx
touch src/contexts/FormContext.jsx
touch src/contexts/CampaignContext.jsx

# Create Hook files
touch src/hooks/useAuth.js
touch src/hooks/useCampaign.js
touch src/hooks/useMultiStepForm.js
touch src/hooks/useStorage.js
touch src/hooks/useStripe.js

# Create Component files
# Common components
touch src/components/common/Button.jsx
touch src/components/common/Input.jsx
touch src/components/common/FileUpload.jsx
touch src/components/common/AudioPlayer.jsx
touch src/components/common/ProgressBar.jsx
touch src/components/common/Navbar.jsx

# Auth components
touch src/components/auth/Login.jsx
touch src/components/auth/Register.jsx
touch src/components/auth/PasswordReset.jsx

# Campaign components
touch src/components/campaign/SongDetailsForm.jsx
touch src/components/campaign/ArtistDetailsForm.jsx
touch src/components/campaign/BudgetSelector.jsx
touch src/components/campaign/PaymentForm.jsx
touch src/components/campaign/CampaignSummary.jsx
touch src/components/campaign/CampaignStatus.jsx

# Dashboard components
touch src/components/dashboard/PerformanceMetrics.jsx
touch src/components/dashboard/VideosList.jsx
touch src/components/dashboard/MetricChart.jsx
touch src/components/dashboard/AudienceInsights.jsx
touch src/components/dashboard/EngagementStats.jsx

# Create Page files
touch src/pages/Home.jsx
touch src/pages/Login.jsx
touch src/pages/Register.jsx
touch src/pages/CreateCampaign.jsx
touch src/pages/CampaignDashboard.jsx
touch src/pages/AccountSettings.jsx
touch src/pages/AdminPanel.jsx

# Create Service files
touch src/services/stripe.js
touch src/services/mediaProcessing.js

# Create Utils files
touch src/utils/validation.js
touch src/utils/formatting.js
touch src/utils/metrics.js

# Create Firebase Cloud Functions structure
mkdir -p functions/src/auth functions/src/campaigns functions/src/payments functions/src/tiktok functions/src/storage functions/src/scheduled
touch functions/src/index.js
touch functions/src/auth/userCreate.js
touch functions/src/campaigns/createCampaign.js
touch functions/src/campaigns/validateCampaign.js
touch functions/src/campaigns/updateCampaignStatus.js
touch functions/src/campaigns/processCampaignMetrics.js
touch functions/src/payments/createPaymentIntent.js
touch functions/src/payments/handlePaymentSuccess.js
touch functions/src/payments/handlePaymentFailure.js
touch functions/src/tiktok/fetchMetrics.js
touch functions/src/tiktok/processVideos.js
touch functions/src/storage/processAudioFile.js
touch functions/src/scheduled/dailyMetricsUpdate.js
touch functions/src/scheduled/campaignStatusCheck.js

# Create Firebase configuration files
touch firestore.rules
touch storage.rules
touch firebase.json

# Create GitHub workflows directory
mkdir -p .github/workflows
touch .github/workflows/deploy.yml
touch .github/workflows/test.yml

# Install necessary dependencies
echo "Installing required dependencies..."
npm install firebase react-router-dom @stripe/react-stripe-js @stripe/stripe-js

echo "SoundTik project structure created successfully inside your Create React App!"
echo "You can now start implementing the components and integrating with Firebase."
echo "Run 'npm start' to launch the development server."