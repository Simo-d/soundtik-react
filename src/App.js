import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CampaignProvider } from './contexts/CampaignContext';
import AppRoutes from './routes';
import './styles/global.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CampaignProvider>
          <div className="app-container">
            <AppRoutes />
          </div>
        </CampaignProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;