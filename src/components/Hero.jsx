import { Link } from 'react-router-dom';
import { BookOpen, Search, Star, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

function Hero() {
  const { isAuthenticated, user } = useAuth();

  return (
    <section className="relative overflow-hidden py-24 px-4 sm:px-6 lg:px-8">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-mesh opacity-75"></div>
      <div className="absolute top-10 left-10 w-24 h-24 bg-primary-200 rounded-full opacity-40 animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-36 h-36 bg-secondary-200 rounded-full opacity-30 animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-primary-300 rounded-full opacity-30 animate-pulse delay-500"></div>
      
      <div className="relative max-w-6xl mx-auto">
        <div className="text-center">
          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-dark-900 mb-8 leading-tight">
            Your{' '}
            <span className="gradient-text">Digital Library</span>
            <br />
            <span className="text-4xl md:text-6xl mt-4 block">Anytime, Anywhere</span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl text-dark-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Discover thousands of books, manage your reading journey, and connect with a community of book lovers. 
            Your next great read is just a click away.
          </p>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16">
            {isAuthenticated ? (
              <>
                <Link to="/books/all" className="btn-primary flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Browse Library</span>
                </Link>
                <Link to="/favorites" className="btn-secondary flex items-center space-x-2">
                  <Star className="h-5 w-5" />
                  <span>My Favorites</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn-primary flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Join Our Library</span>
                </Link>
                <Link to="/books/all" className="btn-secondary flex items-center space-x-2">
                  <Search className="h-5 w-5" />
                  <span>Explore Books</span>
                </Link>
              </>
            )}
          </div>

          {/* Welcome Message for Authenticated Users */}
          {isAuthenticated && (
            <div className="card p-6 max-w-md mx-auto mb-16">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-2 rounded-full">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-dark-500">Welcome back,</p>
                  <p className="font-semibold text-dark-900">{user?.fullName}</p>
                </div>
              </div>
              {!user?.isVerified && user?.role !== 'admin' && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    📋 Your account is pending verification. Contact admin for full access.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Feature Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl mb-4">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-dark-900 mb-2">10,000+</h3>
              <p className="text-dark-600">Books Available</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl mb-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-dark-900 mb-2">5,000+</h3>
              <p className="text-dark-600">Active Readers</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl mb-4">
                <Star className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-dark-900 mb-2">4.9</h3>
              <p className="text-dark-600">Average Rating</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
