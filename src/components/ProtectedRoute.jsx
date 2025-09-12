import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const ProtectedRoute = ({ 
  children, 
  requireAdmin = false, 
  requireVerification = false 
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-dark-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    toast.error('Please sign in to access this page');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    toast.error('Admin access required');
    return <Navigate to="/" replace />;
  }

  if (requireVerification && !user?.isVerified && user?.role !== 'admin') {
    toast.error('Account verification required. Please contact admin.');
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
