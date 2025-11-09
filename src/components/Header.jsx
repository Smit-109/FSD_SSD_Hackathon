import { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';
import { 
  Menu, 
  X, 
  BookOpen, 
  User, 
  LogOut, 
  Settings, 
  Shield,
  Plus
} from 'lucide-react';
import toast from 'react-hot-toast';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
    setIsProfileMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  return (
    <header className="glass-effect sticky top-0 z-50 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-2 rounded-xl group-hover:scale-105 transition-transform duration-200">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text hidden sm:block">
              ModernLibrary
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-dark-600 hover:text-primary-600 font-medium transition-colors duration-200"
            >
              Home
            </Link>
            <Link 
              to="/books/all" 
              className="text-dark-600 hover:text-primary-600 font-medium transition-colors duration-200"
            >
              Browse Books
            </Link>
            {isAuthenticated && (
              <>
                {isAdmin && (
                  <Link 
                    to="/add-book" 
                    className="text-dark-600 hover:text-primary-600 font-medium transition-colors duration-200 flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Book</span>
                  </Link>
                )}
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="text-dark-600 hover:text-primary-600 font-medium transition-colors duration-200 flex items-center space-x-1"
                  >
                    <Shield className="h-4 w-4" />
                    <span>Admin</span>
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* User Menu / Auth Buttons */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={toggleProfileMenu}
                  className="flex items-center space-x-2 bg-white rounded-xl px-3 py-2 shadow-soft hover:shadow-medium transition-all duration-200"
                >
                  <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-1.5 rounded-lg">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-dark-700 hidden sm:block">
                    {user?.fullName}
                  </span>
                </button>

                {/* Profile Dropdown */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-strong border border-gray-100 py-1 z-50">
                    <Link
                      to="/profile"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-dark-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      <span>Profile Settings</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm px-4 py-2"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-dark-600" />
              ) : (
                <Menu className="h-6 w-6 text-dark-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-3">
              <Link 
                to="/" 
                className="text-dark-600 hover:text-primary-600 font-medium transition-colors duration-200 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/books/all" 
                className="text-dark-600 hover:text-primary-600 font-medium transition-colors duration-200 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Browse Books
              </Link>
              {isAuthenticated && (
                <>
                  {isAdmin && (
                    <Link 
                      to="/add-book" 
                      className="text-dark-600 hover:text-primary-600 font-medium transition-colors duration-200 py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Add Book
                    </Link>
                  )}
                  {isAdmin && (
                    <Link 
                      to="/admin" 
                      className="text-dark-600 hover:text-primary-600 font-medium transition-colors duration-200 py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
