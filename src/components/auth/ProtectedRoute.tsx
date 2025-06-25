import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  customMessage?: string;
  showRedirectButtons?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, customMessage, showRedirectButtons }) => {
  const { user, isLoading } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  if (isLoading) return null; // Optionally, return a spinner here

  if (!user) {
    if (customMessage && showRedirectButtons) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-cosmic-black text-white px-4">
          <div className="cosmos-card p-8 max-w-md w-full text-center">
            <h2 className="text-2xl font-display mb-4">{customMessage}</h2>
            <div className="flex flex-col gap-4 mt-6">
              <button
                className="btn-primary"
                onClick={() => navigate('/auth/signup', { state: { from: location } })}
              >
                Create Account
              </button>
              <button
                className="btn-secondary"
                onClick={() => navigate('/')}
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }
    return <Navigate to="/auth/signin" replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute; 