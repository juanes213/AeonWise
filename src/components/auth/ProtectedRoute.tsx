import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useUser();
  if (isLoading) return null; // Optionally, return a spinner here
  if (!user) return <Navigate to="/auth/signin" replace />;
  return <>{children}</>;
};

export default ProtectedRoute; 