import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { logPageView } from '../firebase/analytics';
import Navbar from '../components/common/Navbar';
import Button from '../components/common/Button';

/**
 * Home page component - Landing page for the application
 */
const Home = () => {
  const { currentUser } = useAuth();
  
  // Track page view
  useEffect(() => {
    logPageView('Home');
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-purple-700 to-primary text-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Boost Your Music on TikTok
              </h1>
              <p className="text-xl mb-8">
                Promote your music to millions of TikTok users and grow your audience with data-driven campaigns.
              </p>
              {currentUser ? (
                <Link to="/create-campaign">
                  <Button variant="secondary" size="large">
                    Create Your Campaign
                  </Button>
                </Link>
              ) : (
                <Link to="/register">
                  <Button variant="secondary" size="large">
                    Get Started Now
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose SoundTik?</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-gray-50 rounded-lg shadow-sm">
                <div className="w-16 h-16 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Targeted Promotion</h3>
                <p className="text-gray-600">
                  Get your music in front of the right audience with our precise targeting algorithms.
                </p>
              </div>
              
              <div className="text-center p-6 bg-gray-50 rounded-lg shadow-sm">
                <div className="w-16 h-16 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Detailed Analytics</h3>
                <p className="text-gray-600">
                  Track your campaign performance with comprehensive metrics and insights.
                </p>
              </div>
              
              <div className="text-center p-6 bg-gray-50 rounded-lg shadow-sm">
                <div className="w-16 h-16 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Cost Effective</h3>
                <p className="text-gray-600">
                  Flexible budgeting options to fit your needs, with transparent pricing and no hidden fees.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* How It Works Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row items-center mb-12">
                <div className="md:w-1/2 mb-6 md:mb-0 md:pr-8">
                  <div className="rounded-full bg-primary text-white w-12 h-12 flex items-center justify-center text-xl font-bold mb-4">1</div>
                  <h3 className="text-xl font-semibold mb-2">Create Your Campaign</h3>
                  <p className="text-gray-600">
                    Fill out our simple form with your song details, artist information, and campaign goals.
                  </p>
                </div>
                <div className="md:w-1/2">
                  <img 
                    src="https://via.placeholder.com/500x300" 
                    alt="Create Campaign" 
                    className="rounded-lg shadow-md" 
                  />
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row-reverse items-center mb-12">
                <div className="md:w-1/2 mb-6 md:mb-0 md:pl-8">
                  <div className="rounded-full bg-primary text-white w-12 h-12 flex items-center justify-center text-xl font-bold mb-4">2</div>
                  <h3 className="text-xl font-semibold mb-2">Set Your Budget</h3>
                  <p className="text-gray-600">
                    Choose a budget that works for you. Our flexible options start from as low as $100.
                  </p>
                </div>
                <div className="md:w-1/2">
                  <img 
                    src="https://via.placeholder.com/500x300" 
                    alt="Set Budget" 
                    className="rounded-lg shadow-md" 
                  />
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 mb-6 md:mb-0 md:pr-8">
                  <div className="rounded-full bg-primary text-white w-12 h-12 flex items-center justify-center text-xl font-bold mb-4">3</div>
                  <h3 className="text-xl font-semibold mb-2">Track Your Results</h3>
                  <p className="text-gray-600">
                    Monitor your campaign's performance with our detailed analytics dashboard.
                  </p>
                </div>
                <div className="md:w-1/2">
                  <img 
                    src="https://via.placeholder.com/500x300" 
                    alt="Track Results" 
                    className="rounded-lg shadow-md" 
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-purple-700 to-primary text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Grow Your Audience?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join thousands of artists who are using SoundTik to promote their music and grow their fanbase on TikTok.
            </p>
            {currentUser ? (
              <Link to="/create-campaign">
                <Button variant="secondary" size="large">
                  Create Your Campaign
                </Button>
              </Link>
            ) : (
              <Link to="/register">
                <Button variant="secondary" size="large">
                  Get Started Now
                </Button>
              </Link>
            )}
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold mb-2">SoundTik</h2>
              <p className="text-gray-400">
                Promoting artists on TikTok since 2023
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-2">Company</h3>
                <ul className="space-y-1">
                  <li><a href="#" className="text-gray-400 hover:text-white">About Us</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Careers</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Resources</h3>
                <ul className="space-y-1">
                  <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">FAQ</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Support</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Legal</h3>
                <ul className="space-y-1">
                  <li><a href="#" className="text-gray-400 hover:text-white">Terms</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Privacy</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Cookies</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-700 text-center md:text-left">
            <p className="text-gray-400">
              &copy; {new Date().getFullYear()} SoundTik. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;