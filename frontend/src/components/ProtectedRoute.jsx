import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { authAPI } from '../services/api';

function ProtectedRoute({ children, requiredRole = null }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.getMe();
      if (response.data.success) {
        setUser(response.data.data);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      setIsAuthenticated(false);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role if required
  if (requiredRole) {
    const roleHierarchy = { admin: 3, manager: 2, user: 1 };
    if (roleHierarchy[user?.role] < roleHierarchy[requiredRole]) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;
